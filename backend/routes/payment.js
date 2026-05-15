const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const HiringRequest = require('../models/HiringRequest');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper — Get or create wallet
const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
};

// GET /api/payment/wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const wallet = await getWallet(req.user._id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/create-order - Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', hiringRequestId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        hiringRequestId: hiringRequestId || '',
        userId: req.user._id.toString()
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify - Verify Razorpay payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      hiringRequestId,
      amount,
      paymentType
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Payment verified — now process
    const request = await HiringRequest.findById(hiringRequestId)
      .populate('client editor', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const totalAmount = request.budget;
    const advanceAmount = Math.round(totalAmount * 0.5);
    const platformFee = Math.round(advanceAmount * 0.25);
    const editorAdvance = advanceAmount - platformFee;
    const remainingAmount = totalAmount - advanceAmount;

    if (paymentType === 'advance') {
      // Create payment record
      const payment = await Payment.create({
        client: req.user._id,
        editor: request.editor._id,
        hiringRequest: hiringRequestId,
        totalAmount,
        advanceAmount,
        platformFee,
        editorAdvance,
        remainingAmount,
        status: 'advance_paid',
        advancePaidAt: new Date(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      // Add to editor escrow wallet
      const editorWallet = await getWallet(request.editor._id);
      editorWallet.escrowBalance += editorAdvance;
      editorWallet.transactions.push({
        type: 'escrow_hold',
        amount: editorAdvance,
        description: `Advance received for "${request.projectTitle}" (in escrow)`,
        hiringRequest: hiringRequestId,
        status: 'completed'
      });
      await editorWallet.save();

      // Update hiring request
      request.payment = payment._id;
      request.paymentStatus = 'advance_paid';
      request.status = 'accepted';
      await request.save();

      // Notify editor
      await Notification.create({
        recipient: request.editor._id,
        sender: req.user._id,
        hiringRequest: hiringRequestId,
        type: 'hire_request',
        message: `${request.client.name} paid ₹${advanceAmount} advance for "${request.projectTitle}". ₹${editorAdvance} is held in escrow for you.`
      });

      res.json({
        success: true,
        message: 'Advance payment successful!',
        payment,
        breakdown: {
          totalBudget: totalAmount,
          advancePaid: advanceAmount,
          platformFee,
          editorEscrow: editorAdvance,
          remainingDue: remainingAmount
        }
      });

    } else if (paymentType === 'final') {
      // Final payment
      const payment = await Payment.findById(request.payment);
      if (!payment) {
        return res.status(404).json({ message: 'Payment record not found' });
      }

      const remainingPlatformFee = Math.round(remainingAmount * 0.25);
      const remainingEditorAmount = remainingAmount - remainingPlatformFee;
      const totalEditorAmount = payment.editorAdvance + remainingEditorAmount;

      // Release escrow + add to editor wallet
      const editorWallet = await getWallet(request.editor._id);
      editorWallet.escrowBalance -= payment.editorAdvance;
      editorWallet.balance += totalEditorAmount;
      editorWallet.totalEarned += totalEditorAmount;
      editorWallet.transactions.push({
        type: 'escrow_release',
        amount: totalEditorAmount,
        description: `Full payment released for "${request.projectTitle}"`,
        hiringRequest: hiringRequestId,
        status: 'completed'
      });
      await editorWallet.save();

      // Update payment
      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save();

      // Update request
      request.paymentStatus = 'completed';
      request.status = 'completed';
      await request.save();

      // Notify editor
      await Notification.create({
        recipient: request.editor._id,
        sender: req.user._id,
        hiringRequest: hiringRequestId,
        type: 'request_completed',
        message: `Project "${request.projectTitle}" completed! ₹${totalEditorAmount} has been released to your wallet.`
      });

      res.json({
        success: true,
        message: 'Final payment successful! Project completed.',
        editorReceived: totalEditorAmount
      });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payment/history
router.get('/history', auth, async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user._id }
      : { editor: req.user._id };

    const payments = await Payment.find(query)
      .populate('client editor', 'name email avatar')
      .populate('hiringRequest', 'projectTitle')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/withdraw - Editor withdraws
router.post('/withdraw', auth, requireRole('editor'), async (req, res) => {
  try {
    const { amount } = req.body;
    const wallet = await getWallet(req.user._id);

    if (wallet.balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${wallet.balance}`
      });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: `Withdrawal of ₹${amount}`,
      status: 'completed'
    });
    await wallet.save();

    res.json({
      wallet,
      message: `₹${amount} withdrawal successful`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/payment/add-funds
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const wallet = await getWallet(req.user._id);
    wallet.balance += Number(amount);
    wallet.transactions.push({
      type: 'deposit',
      amount: Number(amount),
      description: `Added $${amount} to wallet`,
      status: 'completed'
    });
    await wallet.save();

    res.json({
      wallet,
      message: `$${amount} added successfully`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;