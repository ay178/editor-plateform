const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const HiringRequest = require('../models/HiringRequest');
const CashfreeOrder = require('../models/CashfreeOrder');
const { auth, requireRole } = require('../middleware/auth');
const { startCheckout } = require('../services/checkout');
const { settleOrder, computeBreakdown } = require('../services/fulfillment');

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

// POST /api/payment/create-order — start a Cashfree checkout for a hire request.
//
// Body: { hiringRequestId, paymentType: 'advance' | 'final', phone? }
// The amount is worked out here from the hiring request; the browser can't set it.
// Response: { orderId, paymentSessionId, mode }  (or { orderId, alreadyPaid: true })
router.post('/create-order', auth, async (req, res) => {
  try {
    const { hiringRequestId, paymentType, phone } = req.body;

    if (!['advance', 'final'].includes(paymentType)) {
      return res.status(400).json({ message: 'paymentType must be "advance" or "final"' });
    }

    const request = await HiringRequest.findById(hiringRequestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the client on this request can pay for it' });
    }
    if (!request.budget || request.budget <= 0) {
      return res.status(400).json({ message: 'This request has no budget set' });
    }

    const b = computeBreakdown(request.budget);
    let amount, kind, orderPrefix, note;

    if (paymentType === 'advance') {
      if (request.paymentStatus !== 'unpaid') {
        return res.status(400).json({ message: 'Advance has already been paid for this request' });
      }
      if (!['pending', 'accepted'].includes(request.status)) {
        return res.status(400).json({ message: `Cannot pay for a ${request.status} request` });
      }
      amount = b.advanceAmount;
      kind = 'hire_advance';
      orderPrefix = 'adv';
      note = `50% advance - ${request.projectTitle}`;
    } else {
      if (request.paymentStatus !== 'advance_paid' || request.status !== 'accepted') {
        return res.status(400).json({ message: 'Final payment is only due after the advance is paid and the request is accepted' });
      }
      amount = b.remainingAmount;
      kind = 'hire_final';
      orderPrefix = 'fin';
      note = `Final payment - ${request.projectTitle}`;
    }

    const checkout = await startCheckout({
      userId: req.user._id,
      phone,
      kind,
      amount,
      hiringRequestId: request._id,
      orderPrefix,
      orderKey: request._id.toString(),
      note
    });

    res.json(checkout);
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ message: err.message, needsPhone: !!err.needsPhone });
    }
    console.error('create-order error:', err.details || err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify — confirm a payment after checkout (works for hire
// payments and subscriptions). Body: { orderId }
//
// Cashfree is asked for the real order status; nothing the browser sends is trusted.
// Response: { state: 'paid' | 'pending' | 'failed' | 'error', ... }
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await CashfreeOrder.findOne({ orderId });
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await settleOrder(orderId);
    res.json(result);
  } catch (err) {
    console.error('verify error:', err.details || err.message);
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
// Body: { amount }. Requires a saved bank account (PUT /api/bank).
// The amount is taken off the wallet immediately and a "pending" withdrawal is recorded
// with the bank details snapshot; it turns "completed" once the payout is made.
router.post('/withdraw', auth, requireRole('editor'), async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }

    const bank = await BankAccount.findOne({ user: req.user._id });
    if (!bank) {
      return res.status(400).json({
        message: 'Add your bank account before withdrawing',
        needsBankAccount: true
      });
    }

    const tx = {
      _id: new mongoose.Types.ObjectId(),
      type: 'withdrawal',
      amount,
      description: `Withdrawal to ${bank.bankName} a/c XXXX${bank.accountLast4}`,
      status: 'pending'
    };

    // Record where the money must go first, then debit. If the debit is refused
    // (not enough balance) the record is removed again.
    const request = await WithdrawalRequest.create({
      user: req.user._id,
      amount,
      transactionId: tx._id,
      bank: {
        accountHolderName: bank.accountHolderName,
        bankName: bank.bankName,
        accountNumberEncrypted: bank.accountNumberEncrypted,
        accountLast4: bank.accountLast4,
        ifsc: bank.ifsc
      }
    });

    // Atomic: debits only if the balance still covers it (no double-withdraw race)
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount }, $push: { transactions: tx } },
      { new: true }
    );

    if (!wallet) {
      await WithdrawalRequest.deleteOne({ _id: request._id });
      const current = await getWallet(req.user._id);
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${current.balance}`
      });
    }

    res.json({
      wallet,
      message: `₹${amount} withdrawal requested to ${bank.bankName} a/c XXXX${bank.accountLast4}`
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
