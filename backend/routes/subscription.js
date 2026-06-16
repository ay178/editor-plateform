const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  pro_client: { amount: 2900, currency: 'INR', name: 'Pro Client Plan' },
  pro_editor: { amount: 1900, currency: 'INR', name: 'Pro Editor Plan' },
};

// POST /api/subscription/create-order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan])
      return res.status(400).json({ message: 'Invalid plan' });

    // Check role
    if (plan === 'pro_client' && req.user.role !== 'client')
      return res.status(403).json({ message: 'This plan is for clients only' });

    if (plan === 'pro_editor' && req.user.role !== 'editor')
      return res.status(403).json({ message: 'This plan is for editors only' });

    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount * 100, // paise mein
      currency: PLANS[plan].currency,
      receipt: `sub_${req.user._id}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      planName: PLANS[plan].name,
      user: { name: req.user.name, email: req.user.email }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscription/verify
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    // Update user subscription — 30 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    await User.findByIdAndUpdate(req.user._id, {
      'subscription.plan': plan,
      'subscription.validUntil': validUntil,
      'subscription.razorpaySubscriptionId': razorpay_payment_id
    });

    res.json({ message: 'Subscription activated!', plan, validUntil });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/subscription/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    const sub = user.subscription;

    const isActive = sub.plan !== 'free' &&
      sub.validUntil && new Date(sub.validUntil) > new Date();

    res.json({
      plan: isActive ? sub.plan : 'free',
      validUntil: sub.validUntil,
      isActive
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
