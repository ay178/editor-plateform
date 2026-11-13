const crypto = require('crypto');

// Cashfree Payment Gateway — thin REST client (uses Node 18+ global fetch).
//
// Env vars:
//   CASHFREE_APP_ID       Client ID from the Cashfree dashboard
//   CASHFREE_SECRET_KEY   Client secret from the Cashfree dashboard
//   CASHFREE_ENV          "sandbox" (default) or "production"
//   CASHFREE_API_VERSION  optional, defaults to 2025-01-01

const isProduction = () =>
  String(process.env.CASHFREE_ENV || 'sandbox').toLowerCase() === 'production';

const baseUrl = () =>
  isProduction() ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

const mode = () => (isProduction() ? 'production' : 'sandbox');

const apiVersion = () => process.env.CASHFREE_API_VERSION || '2025-01-01';

const request = async (method, path, body) => {
  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    throw new Error('Cashfree is not configured (CASHFREE_APP_ID / CASHFREE_SECRET_KEY missing)');
  }

  const headers = {
    'x-api-version': apiVersion(),
    'x-client-id': process.env.CASHFREE_APP_ID,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (method === 'POST') headers['x-idempotency-key'] = crypto.randomUUID();

  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch (_) { /* empty / non-JSON body */ }

  if (!res.ok) {
    const err = new Error(data?.message || `Cashfree request failed (${res.status})`);
    err.status = res.status;
    err.code = data?.code;
    err.details = data;
    throw err;
  }
  return data;
};

// POST /pg/orders — amounts are in RUPEES (not paise).
const createOrder = (payload) => request('POST', '/orders', payload);

// GET /pg/orders/{order_id} — order_status is PAID once payment succeeded.
const getOrder = (orderId) => request('GET', `/orders/${encodeURIComponent(orderId)}`);

// Webhook signature = base64(HMAC-SHA256(secret, timestamp + rawBody)).
// rawBody MUST be the exact bytes Cashfree sent, not re-serialised JSON.
const verifyWebhookSignature = (signature, timestamp, rawBody) => {
  if (!signature || !timestamp || typeof rawBody !== 'string') return false;
  const expected = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY || '')
    .update(String(timestamp) + rawBody)
    .digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { createOrder, getOrder, verifyWebhookSignature, mode };
