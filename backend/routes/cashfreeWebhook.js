const express = require('express');
const router = express.Router();
const cashfree = require('../utils/cashfree');
const { settleOrder } = require('../services/fulfillment');

// POST /api/payment/webhook  (mounted in server.js BEFORE the rate limiter and
// the global JSON parser, because the signature is computed over the raw body.)
//
// Set this URL in the Cashfree dashboard → Developers → Webhooks, e.g.
//   https://<your-backend>/api/payment/webhook
//
// This is the safety net for customers who pay and then close the tab before
// the browser can call /payment/verify.
router.post(
  '/',
  express.json({
    verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); }
  }),
  async (req, res) => {
    const signature = req.get('x-webhook-signature');
    const timestamp = req.get('x-webhook-timestamp');

    if (!cashfree.verifyWebhookSignature(signature, timestamp, req.rawBody)) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const orderId = req.body?.data?.order?.order_id;
    if (!orderId) return res.sendStatus(200); // e.g. the dashboard's test ping

    try {
      // Don't trust the payload's payment status — settleOrder re-fetches the
      // order from Cashfree and checks the amount before fulfilling.
      await settleOrder(orderId);
      res.sendStatus(200);
    } catch (err) {
      console.error('Cashfree webhook error:', err.message);
      res.sendStatus(500); // non-2xx makes Cashfree retry
    }
  }
);

module.exports = router;
