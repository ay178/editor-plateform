import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { createOrderWithPhone, runCheckout } from '../utils/cashfree';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    color: '#9B9AB8',
    features: [
      'Browse all editors',
      '2 hire requests/month',
      'Basic messaging',
      'Standard support',
    ],
  },
  {
    id: 'pro_client',
    name: 'Pro Client',
    price: 29,
    period: 'month',
    color: '#7C3AED',
    popular: true,
    role: 'client',
    features: [
      'Unlimited hire requests',
      'Priority matching',
      'Real-time collaboration',
      'Escrow payment protection',
      'AI Editor Match',
      'Priority support',
    ],
  },
  {
    id: 'pro_editor',
    name: 'Pro Editor',
    price: 19,
    period: 'month',
    color: '#06B6D4',
    role: 'editor',
    features: [
      'Featured profile listing',
      'Smart pricing suggestions',
      'Video score analytics',
      'Unlimited portfolio',
      'Collaboration workspace',
      'Early access to new features',
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [validUntil, setValidUntil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/subscription/status').then(r => {
      setCurrentPlan(r.data.plan);
      setValidUntil(r.data.validUntil);
    });
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/login');
    if (planId === 'free') return;

    setLoadingPlan(planId);
    try {
      const order = await createOrderWithPhone('/subscription/create-order', { plan: planId });
      const result = await runCheckout(order);

      if (result.state === 'paid') {
        setCurrentPlan(planId);
        if (result.validUntil) setValidUntil(result.validUntil);
        alert('Subscription activated successfully!');
      } else if (result.state === 'pending') {
        alert('Payment was not completed.');
      } else if (result.state !== 'redirecting') {
        alert(result.message || 'Payment failed. If money was deducted, contact support.');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error creating order');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Filter plans based on role
  const visiblePlans = PLANS.filter(p => !p.role || p.role === user?.role);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="chip-cyan" style={{ display: 'inline-block', marginBottom: 16 }}>
            Subscription Plans
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
            Upgrade Your <span className="gradient-text">Experience</span>
          </h1>
          <p style={{ color: '#9B9AB8', fontSize: 16 }}>
            {user?.role === 'client'
              ? 'Get unlimited access to top editors'
              : 'Stand out and earn more as a Pro Editor'}
          </p>

          {/* Current plan badge */}
          {currentPlan !== 'free' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 20, padding: '6px 16px'
            }}>
              <span style={{ color: '#10B981', fontSize: 14 }}>
                 Active: {currentPlan === 'pro_client' ? 'Pro Client' : 'Pro Editor'}
                {validUntil && ` (until ${new Date(validUntil).toLocaleDateString()})`}
              </span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visiblePlans.length}, 1fr)`,
          gap: 24, maxWidth: 900, margin: '0 auto'
        }}>
          {visiblePlans.map(plan => {
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <div key={plan.id} style={{
                background: plan.popular ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)',
                border: isCurrentPlan ? '2px solid #10B981' : plan.popular ? '2px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: 32, position: 'relative',
              }}>
                {plan.popular && !isCurrentPlan && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#7C3AED', color: '#fff', padding: '4px 16px',
                    borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                  }}>Most Popular</div>
                )}
                {isCurrentPlan && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#10B981', color: '#fff', padding: '4px 16px',
                    borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                  }}>Current Plan ✓</div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12 }}>
                    <span style={{ fontSize: 42, fontWeight: 700, color: plan.color }}>
                      ${plan.price}
                    </span>
                    <span style={{ color: '#9B9AB8', fontSize: 14 }}>/{plan.period}</span>
                  </div>
                </div>

                <hr className="divider" />

                <ul style={{ listStyle: 'none', marginBottom: 32 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ color: plan.color, fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 14, color: '#9B9AB8' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10, cursor: 'default',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#9B9AB8'
                  }}>Current Plan</button>
                ) : isCurrentPlan ? (
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600,
                    background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
                    color: '#10B981', cursor: 'default'
                  }}>Active</button>
                ) : (
                  <button onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan === plan.id}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600,
                      background: plan.color === '#7C3AED' ? '#7C3AED' : 'transparent',
                      border: `1px solid ${plan.color}`,
                      color: plan.color === '#7C3AED' ? '#fff' : plan.color,
                      transition: 'all 0.2s',
                      opacity: loadingPlan === plan.id ? 0.7 : 1
                    }}>
                    {loadingPlan === plan.id ? 'Processing...' : `Upgrade to ${plan.name} →`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Platform fee note */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: '#9B9AB8', fontSize: 14 }}>
            Platform takes a <strong style={{ color: '#F1F0FF' }}>10% fee</strong> on completed projects.
            Editors receive <strong style={{ color: '#F1F0FF' }}>90%</strong> of the project budget.
          </p>
          <p style={{ color: '#5C5B7A', fontSize: 13, marginTop: 8 }}>
            Subscriptions auto-renew monthly. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}