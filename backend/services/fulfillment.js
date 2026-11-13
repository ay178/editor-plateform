const CashfreeOrder = require('../models/CashfreeOrder');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const HiringRequest = require('../models/HiringRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const redis = require('../utils/redis');
const cashfree = require('../utils/cashfree');

// ── Business rules (unchanged from the Razorpay version) ──
const ADVANCE_RATE = 0.5;       // client pays 50% up front
const PLATFORM_FEE_RATE = 0.25; // platform keeps 25% of each payment
const SUBSCRIPTION_DAYS = 30;

const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) wallet = await Wallet.create({ user: userId });
  return wallet;
};

// Amounts are always derived from the hiring request on the server.
const computeBreakdown = (budget) => {
  const totalAmount = budget;
  const advanceAmount = Math.round(totalAmount * ADVANCE_RATE);
  const platformFee = Math.round(advanceAmount * PLATFORM_FEE_RATE);
  const editorAdvance = advanceAmount - platformFee;
  const remainingAmount = totalAmount - advanceAmount;
  return { totalAmount, advanceAmount, platformFee, editorAdvance, remainingAmount };
};

// ───────────────────────── effects, one per order kind ─────────────────────────

const fulfilHireAdvance = async (order) => {
  const request = await HiringRequest.findById(order.hiringRequest)
    .populate('client editor', 'name email');
  if (!request) throw new Error('Hiring request not found');
  if (request.paymentStatus !== 'unpaid') throw new Error('Advance already paid for this request');

  const b = computeBreakdown(request.budget);
  if (b.advanceAmount !== order.amount) {
    throw new Error(`Advance amount changed since order creation (${b.advanceAmount} vs ${order.amount})`);
  }

  // Payment.cashfreeOrderId is unique, so a duplicate fulfilment throws here
  // before any money is moved.
  const payment = await Payment.create({
    client: order.user,
    editor: request.editor._id,
    hiringRequest: request._id,
    totalAmount: b.totalAmount,
    advanceAmount: b.advanceAmount,
    platformFee: b.platformFee,
    editorAdvance: b.editorAdvance,
    remainingAmount: b.remainingAmount,
    status: 'advance_paid',
    advancePaidAt: new Date(),
    cashfreeOrderId: order.orderId
  });

  const editorWallet = await getWallet(request.editor._id);
  editorWallet.escrowBalance += b.editorAdvance;
  editorWallet.transactions.push({
    type: 'escrow_hold',
    amount: b.editorAdvance,
    description: `Advance received for "${request.projectTitle}" (in escrow)`,
    hiringRequest: request._id,
    status: 'completed'
  });
  await editorWallet.save();

  request.payment = payment._id;
  request.paymentStatus = 'advance_paid';
  request.status = 'accepted';
  await request.save();

  await Notification.create({
    recipient: request.editor._id,
    sender: order.user,
    hiringRequest: request._id,
    type: 'hire_request',
    message: `${request.client.name} paid ₹${b.advanceAmount} advance for "${request.projectTitle}". ₹${b.editorAdvance} is held in escrow for you.`
  });

  return {
    success: true,
    message: 'Advance payment successful!',
    breakdown: {
      totalBudget: b.totalAmount,
      advancePaid: b.advanceAmount,
      platformFee: b.platformFee,
      editorEscrow: b.editorAdvance,
      remainingDue: b.remainingAmount
    }
  };
};

const fulfilHireFinal = async (order) => {
  const request = await HiringRequest.findById(order.hiringRequest)
    .populate('client editor', 'name email');
  if (!request) throw new Error('Hiring request not found');
  if (request.paymentStatus !== 'advance_paid') throw new Error('Final payment is not due for this request');

  const payment = await Payment.findById(request.payment);
  if (!payment) throw new Error('Payment record not found');

  const remainingAmount = payment.totalAmount - payment.advanceAmount;
  if (remainingAmount !== order.amount) {
    throw new Error(`Final amount changed since order creation (${remainingAmount} vs ${order.amount})`);
  }

  // Atomic guard: only the first caller flips the payment to completed.
  const claimed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $ne: 'completed' } },
    { status: 'completed', completedAt: new Date() }
  );
  if (!claimed) throw new Error('Payment already marked completed');

  const remainingPlatformFee = Math.round(remainingAmount * PLATFORM_FEE_RATE);
  const remainingEditorAmount = remainingAmount - remainingPlatformFee;
  const totalEditorAmount = payment.editorAdvance + remainingEditorAmount;

  const editorWallet = await getWallet(request.editor._id);
  editorWallet.escrowBalance -= payment.editorAdvance;
  editorWallet.balance += totalEditorAmount;
  editorWallet.totalEarned += totalEditorAmount;
  editorWallet.transactions.push({
    type: 'escrow_release',
    amount: totalEditorAmount,
    description: `Full payment released for "${request.projectTitle}"`,
    hiringRequest: request._id,
    status: 'completed'
  });
  await editorWallet.save();

  request.paymentStatus = 'completed';
  request.status = 'completed';
  await request.save();

  await Notification.create({
    recipient: request.editor._id,
    sender: order.user,
    hiringRequest: request._id,
    type: 'request_completed',
    message: `Project "${request.projectTitle}" completed! ₹${totalEditorAmount} has been released to your wallet.`
  });

  return {
    success: true,
    message: 'Final payment successful! Project completed.',
    editorReceived: totalEditorAmount
  };
};

const fulfilSubscription = async (order) => {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + SUBSCRIPTION_DAYS);

  await User.findByIdAndUpdate(order.user, {
    'subscription.plan': order.plan,
    'subscription.validUntil': validUntil,
    'subscription.cashfreeOrderId': order.orderId
  });

  // auth middleware caches the user for 5 minutes — drop it so the plan shows immediately
  try { await redis.del(`user:${order.user}`); } catch (e) { console.error('Redis del error:', e.message); }

  return { success: true, message: 'Subscription activated!', plan: order.plan, validUntil };
};

const EFFECTS = {
  hire_advance: fulfilHireAdvance,
  hire_final: fulfilHireFinal,
  subscription: fulfilSubscription
};

// ───────────────────────── settlement ─────────────────────────
// Called from both POST /payment/verify and the Cashfree webhook, so it must be
// idempotent: whichever arrives first fulfils the order, the other is a no-op.
//
// Returns { state, kind?, ... } where state is one of:
//   paid | pending | failed | error | unknown
const settleOrder = async (orderId) => {
  const order = await CashfreeOrder.findOne({ orderId });
  if (!order) return { state: 'unknown' };

  if (order.status === 'fulfilled') {
    return { state: 'paid', kind: order.kind, alreadyProcessed: true, ...(order.result || {}) };
  }
  if (order.status === 'failed') return { state: 'failed', kind: order.kind };
  if (order.status === 'error') {
    return { state: 'error', kind: order.kind, message: 'Payment received but processing failed. Please contact support with your order ID.' };
  }

  // Ask Cashfree directly — never trust the browser's claim that it paid.
  const cf = await cashfree.getOrder(orderId);
  const status = cf.order_status;

  if (status !== 'PAID') {
    if (['EXPIRED', 'TERMINATED', 'TERMINATION_REQUESTED'].includes(status)) {
      await CashfreeOrder.updateOne({ orderId, status: 'created' }, { status: 'failed' });
      return { state: 'failed', kind: order.kind };
    }
    // ACTIVE: customer hasn't completed (or is still retrying) the payment
    return { state: 'pending', kind: order.kind };
  }

  if (Number(cf.order_amount) !== order.amount || (cf.order_currency || 'INR') !== order.currency) {
    console.error(`Cashfree amount mismatch for ${orderId}: got ${cf.order_amount} ${cf.order_currency}, expected ${order.amount} ${order.currency}`);
    await CashfreeOrder.updateOne({ orderId }, { status: 'error', error: 'Amount mismatch' });
    return { state: 'error', kind: order.kind, message: 'Payment amount mismatch. Please contact support.' };
  }

  // Claim the order atomically so webhook + verify can't both apply the effects.
  const claimed = await CashfreeOrder.findOneAndUpdate(
    { orderId, status: 'created' },
    { status: 'processing', cfOrderId: cf.cf_order_id != null ? String(cf.cf_order_id) : undefined, updatedAt: Date.now() },
    { new: true }
  );
  if (!claimed) {
    const latest = await CashfreeOrder.findOne({ orderId });
    if (latest && latest.status === 'fulfilled') {
      return { state: 'paid', kind: latest.kind, alreadyProcessed: true, ...(latest.result || {}) };
    }
    return { state: 'pending', kind: order.kind }; // another request is mid-way through fulfilling
  }

  try {
    const result = await EFFECTS[claimed.kind](claimed);
    await CashfreeOrder.updateOne({ _id: claimed._id }, { status: 'fulfilled', result, updatedAt: Date.now() });
    return { state: 'paid', kind: claimed.kind, ...result };
  } catch (err) {
    console.error(`Fulfilment failed for paid order ${orderId}:`, err);
    await CashfreeOrder.updateOne({ _id: claimed._id }, { status: 'error', error: err.message, updatedAt: Date.now() });
    return { state: 'error', kind: claimed.kind, message: 'Payment received but processing failed. Please contact support with your order ID.' };
  }
};

module.exports = { settleOrder, computeBreakdown };
