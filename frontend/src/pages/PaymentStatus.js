import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyOrder } from '../utils/cashfree';

// Cashfree sends the customer here (return_url) when it can't use the popup,
// e.g. inside an in-app browser. We ask the backend for the real order status.
export default function PaymentStatus() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const orderId = params.get('order_id');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) { setError('Missing order reference.'); return; }

    let cancelled = false;
    let tries = 0;

    // The webhook may still be settling the order, so poll briefly while it's pending.
    const check = async () => {
      try {
        const r = await verifyOrder(orderId);
        if (cancelled) return;
        if (r.state === 'pending' && ++tries < 5) {
          setTimeout(check, 2500);
          return;
        }
        setResult(r);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not verify this payment.');
      }
    };
    check();
    return () => { cancelled = true; };
  }, [orderId]);

  const dashboard = user?.role === 'editor' ? '/dashboard/editor' : '/dashboard/client';

  let icon = '⏳', title = 'Checking your payment…', body = 'This only takes a moment.';
  if (error) {
    icon = '⚠️'; title = 'Something went wrong'; body = error;
  } else if (result) {
    if (result.state === 'paid') {
      icon = '✅'; title = 'Payment successful'; body = result.message || 'Thank you!';
    } else if (result.state === 'pending') {
      icon = '⏳'; title = 'Payment not completed'; body = 'We have not received a confirmation yet. If money was deducted it will be reflected shortly.';
    } else {
      icon = '❌'; title = 'Payment failed'; body = result.message || 'The payment did not go through. You have not been charged for this order.';
    }
  }

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{icon}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: '#9B9AB8', marginBottom: 24 }}>{body}</p>
        {orderId && <p style={{ color: '#6B6A85', fontSize: 12, marginBottom: 24 }}>Order: {orderId}</p>}
        <Link to={dashboard} style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Go to dashboard →</button>
        </Link>
      </div>
    </div>
  );
}
