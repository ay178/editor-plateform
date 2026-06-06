import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    color: '#9B9AB8',
    features: [
      'Browse all editors',
      'Send 2 hire requests/month',
      'Basic messaging',
      'Standard support',
    ],
    cta: 'Get Started',
    link: '/signup',
  },
  {
    name: 'Pro Client',
    price: 29,
    period: 'month',
    color: '#7C3AED',
    popular: true,
    features: [
      'Unlimited hire requests',
      'Priority matching',
      'Real-time collaboration',
      'Escrow payment protection',
      'AI Editor Match',
      'Priority support',
    ],
    cta: 'Start Pro →',
    link: '/signup',
  },
  {
    name: 'Pro Editor',
    price: 19,
    period: 'month',
    color: '#06B6D4',
    features: [
      'Featured profile listing',
      'Smart pricing suggestions',
      'Video score analytics',
      'Portfolio showcase (unlimited)',
      'Collaboration workspace',
      'Early access to new features',
    ],
    cta: 'Join as Editor →',
    link: '/signup',
  },
];

export default function Pricing() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="chip-cyan" style={{ display: 'inline-block', marginBottom: 16, fontSize: 13 }}>
            Simple, Transparent Pricing
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 700, marginBottom: 12 }}>
            Plans for <span className="gradient-text">Every Creator</span>
          </h1>
          <p style={{ color: '#9B9AB8', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              background: plan.popular ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)',
              border: plan.popular ? '2px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 32, position: 'relative',
              transition: 'transform 0.2s',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#7C3AED', color: '#fff', padding: '4px 16px',
                  borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                }}>Most Popular</div>
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

              <Link to={plan.link}>
                <button style={{
                  width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600,
                  background: plan.popular ? '#7C3AED' : 'transparent',
                  border: plan.popular ? 'none' : `1px solid ${plan.color}`,
                  color: plan.popular ? '#fff' : plan.color,
                  transition: 'all 0.2s',
                }}>{plan.cta}</button>
              </Link>
            </div>
          ))}
        </div>

        {/* Platform fee note */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: '#9B9AB8', fontSize: 14 }}>
            Platform takes a <strong style={{ color: '#F1F0FF' }}>10% fee</strong> on completed projects.
            Editors receive <strong style={{ color: '#F1F0FF' }}>90%</strong> of the project budget.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '60px auto 0' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>FAQs</h2>
          {[
            { q: 'Is there a free trial?', a: 'Yes! The Free plan lets you browse editors and send 2 hire requests per month at no cost.' },
            { q: 'How does escrow payment work?', a: 'Client pays upfront into escrow. Funds are held securely until the project is marked complete, then released to the editor.' },
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your plan stays active until the end of the billing period.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards and UPI payments via Razorpay.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: 16 }}>
              <div className="glass" style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{q}</div>
                <p style={{ color: '#9B9AB8', fontSize: 14, lineHeight: 1.6 }}>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
