const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const CashfreeOrder = require('../models/CashfreeOrder');
const { startCheckout } = require('../services/checkout');
const { settleOrder } = require('../services/fulfillment');

// Prices are in RUPEES (Cashfree takes rupees, not paise).
// NOTE: these match what the Razorpay version actually charged (2900 * 100 paise = ₹2,900),
// but the pricing page displays $29 / $19 — confirm which is intended.
const PLANS = {
  pro_client: { amount: 2900, name: 'Pro Client Plan' },
  pro_editor: { amount: 1900, name: 'Pro Editor Plan' },
};

// POST /api/subscription/create-order   Body: { plan, phone? }
router.post('/create-order', auth, async (req, res) => {
  try {
    const { plan, phone } = req.body;

    if (!PLANS[plan])
      return res.status(400).json({ message: 'Invalid plan' });

    // Check role
    if (plan === 'pro_client' && req.user.role !== 'client')
      return res.status(403).json({ message: 'This plan is for clients only' });

    if (plan === 'pro_editor' && req.user.role !== 'editor')
      return res.status(403).json({ message: 'This plan is for editors only' });

    const checkout = await startCheckout({
      userId: req.user._id,
      phone,
      kind: 'subscription',
      amount: PLANS[plan].amount,
      plan,
      orderPrefix: 'sub',
      orderKey: req.user._id.toString(),
      note: PLANS[plan].name
    });

    res.json({ ...checkout, plan, planName: PLANS[plan].name });

  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ message: err.message, needsPhone: !!err.needsPhone });
    }
    console.error('subscription create-order error:', err.details || err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscription/verify   Body: { orderId }
// Same settlement as /api/payment/verify — kept so existing clients keep working.
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await CashfreeOrder.findOne({ orderId });
    if (!order || order.kind !== 'subscription' || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await settleOrder(orderId);
    res.json(result);

  } catch (err) {
    console.error('subscription verify error:', err.details || err.message);
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
