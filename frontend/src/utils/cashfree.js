import API from './api';

// Cashfree checkout helpers (replaces the old Razorpay helper).
//
// Flow:
//   1. backend creates an order and returns { orderId, paymentSessionId, mode }
//   2. Cashfree's JS SDK opens the checkout popup for that session
//   3. we ask the backend to verify — it checks the real order status with
//      Cashfree, so the popup's own result is never trusted.
//
// The SDK script (https://sdk.cashfree.com/js/v3/cashfree.js) is loaded in public/index.html.

// Cashfree needs a mobile number on every order. If the backend says it doesn't
// have one yet, ask once and retry — it's remembered on the user afterwards.
export const createOrderWithPhone = async (url, body) => {
  try {
    const { data } = await API.post(url, body);
    return data;
  } catch (err) {
    if (!err.response?.data?.needsPhone) throw err;
    const phone = window.prompt('Enter your 10-digit mobile number to continue with payment:');
    if (!phone) throw new Error('A mobile number is required to pay');
    const { data } = await API.post(url, { ...body, phone });
    return data;
  }
};

// Opens the popup. Resolves when the popup closes (paid, failed or dismissed);
// callers must verify with the backend afterwards.
export const openCashfreeCheckout = async ({ paymentSessionId, mode }) => {
  if (!window.Cashfree) {
    throw new Error('Payment SDK failed to load. Check your connection and try again.');
  }
  const cashfree = window.Cashfree({ mode: mode || 'sandbox' });
  return cashfree.checkout({ paymentSessionId, redirectTarget: '_modal' });
};

export const verifyOrder = async (orderId) => {
  const { data } = await API.post('/payment/verify', { orderId });
  return data; // { state: 'paid' | 'pending' | 'failed' | 'error', ... }
};

// Runs a full checkout for an order the backend already created.
// Resolves with the verify result; throws if the checkout can't be started.
export const runCheckout = async (order) => {
  // Same order was already paid earlier (e.g. popup closed after paying)
  if (order.alreadyPaid) return verifyOrder(order.orderId);

  const result = await openCashfreeCheckout(order);

  // In some in-app browsers Cashfree redirects to our /payment-status page instead.
  if (result?.redirect) return { state: 'redirecting' };

  return verifyOrder(order.orderId);
};

// Pay the advance or final instalment for a hire request.
export const initiateCashfreePayment = async ({
  hiringRequestId,
  paymentType, // 'advance' | 'final'
  onSuccess,
  onFailure
}) => {
  try {
    const order = await createOrderWithPhone('/payment/create-order', { hiringRequestId, paymentType });
    const result = await runCheckout(order);

    if (result.state === 'paid') onSuccess?.(result);
    else if (result.state === 'redirecting') return;
    else if (result.state === 'pending') onFailure?.('Payment was not completed');
    else onFailure?.(result.message || 'Payment failed');
  } catch (err) {
    onFailure?.(err.response?.data?.message || err.message || 'Payment initiation failed');
  }
};
