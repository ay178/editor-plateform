const CashfreeOrder = require('../models/CashfreeOrder');
const User = require('../models/User');
const redis = require('../utils/redis');
const cashfree = require('../utils/cashfree');

const CLIENT_URL = () => (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');

const normalisePhone = (raw) => {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.length === 12 && p.startsWith('91')) p = p.slice(2);
  return /^[6-9]\d{9}$/.test(p) ? p : null;
};

const roundRupees = (n) => Math.round(Number(n) * 100) / 100;

const httpError = (status, message, extra = {}) =>
  Object.assign(new Error(message), { status, ...extra });

// Cashfree requires a customer phone number on every order. We ask for it once
// (the frontend prompts when it gets needsPhone) and keep it on the user.
const resolvePhone = async (user, phoneFromBody) => {
  const fromBody = phoneFromBody ? normalisePhone(phoneFromBody) : null;
  if (phoneFromBody && !fromBody) {
    throw httpError(400, 'Please enter a valid 10-digit mobile number', { needsPhone: true });
  }
  const phone = fromBody || normalisePhone(user.phone);
  if (!phone) {
    throw httpError(400, 'A mobile number is required to complete payment', { needsPhone: true });
  }
  if (phone !== user.phone) {
    await User.updateOne({ _id: user._id }, { phone });
    try { await redis.del(`user:${user._id}`); } catch (e) { console.error('Redis del error:', e.message); }
  }
  return phone;
};

// Creates (or reuses) a Cashfree order for something the SERVER has already
// priced. `amount` is in rupees.
//
// opts: { userId, phone, kind, amount, hiringRequestId?, plan?, orderPrefix, orderKey, note }
const startCheckout = async (opts) => {
  const { userId, kind, hiringRequestId, plan, orderPrefix, orderKey, note } = opts;
  const amount = roundRupees(opts.amount);
  if (!(amount >= 1)) throw httpError(400, 'Amount must be at least ₹1');

  const user = await User.findById(userId);
  if (!user) throw httpError(401, 'User not found');
  const phone = await resolvePhone(user, opts.phone);

  // Re-use a still-open order for the same thing so a double click (or a
  // retry after closing the popup) can't create two payable orders.
  const existing = await CashfreeOrder.findOne({
    user: userId, kind, status: 'created', amount,
    ...(hiringRequestId ? { hiringRequest: hiringRequestId } : {}),
    ...(plan ? { plan } : {})
  }).sort({ createdAt: -1 });

  if (existing && existing.paymentSessionId) {
    try {
      const cf = await cashfree.getOrder(existing.orderId);
      if (cf.order_status === 'ACTIVE') {
        return { orderId: existing.orderId, paymentSessionId: existing.paymentSessionId, mode: cashfree.mode(), amount };
      }
      if (cf.order_status === 'PAID') {
        return { orderId: existing.orderId, alreadyPaid: true, mode: cashfree.mode(), amount };
      }
    } catch (err) {
      console.error('Cashfree reuse check failed, creating a new order:', err.message);
    }
  }

  const orderId = `${orderPrefix}_${orderKey}_${Date.now().toString(36)}`; // ≤ 45 chars, [A-Za-z0-9_-]

  const payload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: String(user._id),
      customer_phone: phone,
      customer_email: user.email,
      ...(user.name && user.name.trim().length >= 3 ? { customer_name: user.name.trim().slice(0, 100) } : {})
    },
    order_meta: {
      // Used when Cashfree has to redirect (e.g. in-app browsers) instead of showing the popup
      return_url: `${CLIENT_URL()}/payment-status?order_id={order_id}`,
      ...(process.env.CASHFREE_NOTIFY_URL ? { notify_url: process.env.CASHFREE_NOTIFY_URL } : {})
    },
    ...(note ? { order_note: String(note).slice(0, 200) } : {})
  };

  const cf = await cashfree.createOrder(payload);

  await CashfreeOrder.create({
    orderId,
    cfOrderId: cf.cf_order_id != null ? String(cf.cf_order_id) : undefined,
    paymentSessionId: cf.payment_session_id,
    user: userId,
    kind,
    hiringRequest: hiringRequestId || undefined,
    plan: plan || undefined,
    amount,
    currency: 'INR'
  });

  return { orderId, paymentSessionId: cf.payment_session_id, mode: cashfree.mode(), amount };
};

module.exports = { startCheckout, httpError };
