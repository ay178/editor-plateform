const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const HiringRequest = require('../models/HiringRequest');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

// Helper — Get or create wallet
const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
};

// GET /api/payment/wallet - Get my wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const wallet = await getWallet(req.user._id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/add-funds - Add funds to wallet
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
    res.json({ wallet, message: `$${amount} added successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/pay-advance - Client pays 50% advance
router.post('/pay-advance', auth, requireRole('client'), async (req, res) => {
  try {
    const { hiringRequestId } = req.body;

    const request = await HiringRequest.findById(hiringRequestId)
      .populate('client editor', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.paymentStatus !== 'unpaid') {
      return res.status(400).json({ message: 'Payment already made' });
    }

    if (!request.budget) {
      return res.status(400).json({ message: 'No budget set for this project' });
    }

    // Calculate amounts
    const totalAmount = request.budget;
    const advanceAmount = Math.round(totalAmount * 0.5);
    const platformFee = Math.round(advanceAmount * 0.5);
    const editorAdvance = advanceAmount - platformFee;
    const remainingAmount = totalAmount - advanceAmount;

    // Check client wallet balance
    const clientWallet = await getWallet(req.user._id);
    if (clientWallet.balance < advanceAmount) {
      return res.status(400).json({
        message: `Insufficient balance. You need $${advanceAmount} but have $${clientWallet.balance}`,
        required: advanceAmount,
        available: clientWallet.balance
      });
    }

    // Deduct from client wallet
    clientWallet.balance -= advanceAmount;
    clientWallet.totalSpent += advanceAmount;
    clientWallet.transactions.push({
      type: 'escrow_hold',
      amount: advanceAmount,
      description: `Advance payment for "${request.projectTitle}"`,
      hiringRequest: hiringRequestId,
      status: 'completed'
    });
    await clientWallet.save();

    // Add platform fee to platform wallet (escrow)
    const platformFeeRecord = Math.round(advanceAmount * 0.25);

    // Add advance to editor wallet (locked in escrow)
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
      advancePaidAt: new Date()
    });

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
      message: `${request.client.name} paid $${advanceAmount} advance for "${request.projectTitle}". $${editorAdvance} is held in escrow for you.`
    });

    res.json({
      payment,
      message: 'Advance payment successful!',
      breakdown: {
        totalBudget: totalAmount,
        advancePaid: advanceAmount,
        platformFee,
        editorEscrow: editorAdvance,
        remainingDue: remainingAmount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/complete - Client pays remaining + release escrow
router.post('/complete', auth, requireRole('client'), async (req, res) => {
  try {
    const { hiringRequestId } = req.body;

    const request = await HiringRequest.findById(hiringRequestId)
      .populate('client editor', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.paymentStatus !== 'advance_paid') {
      return res.status(400).json({ message: 'Advance not paid yet' });
    }

    const payment = await Payment.findById(request.payment);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const remainingAmount = payment.remainingAmount;
    const remainingPlatformFee = Math.round(remainingAmount * 0.25);
    const remainingEditorAmount = remainingAmount - remainingPlatformFee;

    // Check client wallet
    const clientWallet = await getWallet(req.user._id);
    if (clientWallet.balance < remainingAmount) {
      return res.status(400).json({
        message: `Insufficient balance. You need $${remainingAmount} but have $${clientWallet.balance}`,
        required: remainingAmount,
        available: clientWallet.balance
      });
    }

    // Deduct remaining from client
    clientWallet.balance -= remainingAmount;
    clientWallet.totalSpent += remainingAmount;
    clientWallet.transactions.push({
      type: 'escrow_release',
      amount: remainingAmount,
      description: `Final payment for "${request.projectTitle}"`,
      hiringRequest: hiringRequestId,
      status: 'completed'
    });
    await clientWallet.save();

    // Release escrow + add remaining to editor
    const editorWallet = await getWallet(request.editor._id);
    const totalEditorAmount = payment.editorAdvance + remainingEditorAmount;
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
      message: `Project "${request.projectTitle}" completed! $${totalEditorAmount} has been released to your wallet.`
    });

    res.json({
      message: 'Payment completed! Funds released to editor.',
      editorReceived: totalEditorAmount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payment/history - Get payment history
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

// POST /api/payment/withdraw - Editor withdraws from wallet
router.post('/withdraw', auth, requireRole('editor'), async (req, res) => {
  try {
    const { amount } = req.body;
    const wallet = await getWallet(req.user._id);

    if (wallet.balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: $${wallet.balance}`
      });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: `Withdrawal of $${amount}`,
      status: 'completed'
    });
    await wallet.save();

    res.json({
      wallet,
      message: `$${amount} withdrawal successful`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;