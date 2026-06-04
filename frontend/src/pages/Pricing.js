import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-scale')
      .forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: '🌱',
      desc: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: '#10B981',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      features: [
        '3 hire requests per month',
        'Browse all editors',
        'Basic search & filters',
        'In-app messaging',
        'Standard support',
        'Basic portfolio view',
      ],
      notIncluded: [
        'AI editor matching',
        'Priority listings',
        'Advanced analytics',
        'Escrow payments',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: '⚡',
      desc: 'For serious content creators',
      monthlyPrice: 29,
      yearlyPrice: 19,
      color: '#6366F1',
      bg: '#EEF2FF',
      border: '#6366F1',
      features: [
        'Unlimited hire requests',
        'AI editor matching',
        'Priority search listing',
        'Escrow payment system',
        'Real-time collaboration',
        'Advanced filters',
        'Video quality scoring',
        'Priority support',
        'Analytics dashboard',
        'Schedule proposals',
      ],
      notIncluded: [
        'Dedicated account manager',
        'Custom contracts',
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      icon: '🏢',
      desc: 'For agencies and teams',
      monthlyPrice: 99,
      yearlyPrice: 69,
      color: '#F59E0B',
      bg: '#FFF7ED',
      border: '#FDE68A',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Dedicated account manager',
        'Custom contracts',
        'White-label options',
        'API access',
        'Advanced analytics',
        'SLA guarantee',
        'Custom integrations',
        'Bulk project management',
      ],
      notIncluded: [],
      cta: 'Start Business',
      popular: false,
    },
  ];

  const editorPlans = [
    {
      id: 'editor-free',
      name: 'Basic',
      icon: '🎬',
      desc: 'Start earning today',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: '#10B981',
      features: [
        '5 active bids per month',
        'Basic profile listing',
        'Standard search ranking',
        'In-app messaging',
        'Receive payments',
        '15% platform commission',
      ],
      cta: 'Join Free',
      popular: false,
    },
    {
      id: 'editor-pro',
      name: 'Pro Editor',
      icon: '🌟',
      desc: 'Grow your freelance business',
      monthlyPrice: 19,
      yearlyPrice: 12,
      color: '#6366F1',
      features: [
        'Unlimited active bids',
        'Featured profile badge',
        'Priority search ranking',
        'AI smart pricing tool',
        'Video quality scorer',
        'Portfolio showcase',
        'Reduced 10% commission',
        'Analytics & insights',
        'Early access to projects',
      ],
      cta: 'Go Pro',
      popular: true,
    },
  ];

  const faqs = [
    {
      q: 'Is there a free trial?',
      a: 'Yes! The Pro plan comes with a 14-day free trial. No credit card required to start.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Absolutely. Cancel your subscription anytime from your dashboard. No cancellation fees.'
    },
    {
      q: 'What is the platform commission?',
      a: 'Free editors pay 15% commission per project. Pro editors pay only 10%. Business clients get custom rates.'
    },
    {
      q: 'How does escrow payment work?',
      a: 'Client pays 50% upfront into escrow. Editor gets 25% immediately. Remaining 75% is released when project is completed.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes, we offer a 30-day money-back guarantee on all paid plans if you are not satisfied.'
    },
    {
      q: 'Can I upgrade or downgrade my plan?',
      a: 'Yes, you can change your plan at any time. Changes take effect immediately and we prorate the billing.'
    },
  ];

  const getPrice = (plan) => {
    const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return price;
  };

  const savings = (plan) => {
    if (plan.monthlyPrice === 0) return null;
    const saved = (plan.monthlyPrice - plan.yearlyPrice) * 12;
    return saved;
  };

  return (
    <>
      <style>{`
        .pricing-page { overflow-x: hidden; }

        .pricing-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%);
          padding: 80px 20px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .billing-toggle {
          display: inline-flex;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50px;
          padding: 4px;
          margin-bottom: 60px;
          gap: 4px;
        }

        .billing-btn {
          padding: 10px 24px;
          border-radius: 50px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .plan-card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #E2E8F0;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .plan-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.12);
        }

        .plan-card.popular {
          border-color: #6366F1;
          box-shadow: 0 8px 32px rgba(99,102,241,0.2);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid #F8FAFC;
        }

        .feature-item:last-child { border-bottom: none; }

        .faq-item {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .faq-item:hover {
          border-color: #6366F1;
          box-shadow: 0 4px 16px rgba(99,102,241,0.1);
        }

        .editor-plans-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (max-width: 1024px) {
          .plans-grid { grid-template-columns: 1fr; max-width: 480px; }
          .editor-plans-grid { grid-template-columns: 1fr; max-width: 480px; }
        }
        @media (max-width: 768px) {
          .pricing-hero { padding: 60px 16px 40px; }
          .plans-grid { padding: 0 16px; }
          .editor-plans-grid { padding: 0 16px; }
          .plan-card { padding: 24px 20px; }
        }
      `}</style>

      <div className="pricing-page">

        {/* Hero */}
        <div className="pricing-hero">
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 60%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 50, padding: '7px 18px',
              color: '#A5B4FC', fontSize: 13,
              fontWeight: 600, marginBottom: 20
            }}>
              💰 Simple, Transparent Pricing
            </div>

            <h1 style={{
              fontSize: 52, fontWeight: 900, color: '#fff',
              letterSpacing: '-2px', margin: '0 0 16px', lineHeight: 1.1
            }}>
              Choose Your{' '}
              <span className="gradient-text-animated">Perfect Plan</span>
            </h1>

            <p style={{
              fontSize: 18, color: 'rgba(255,255,255,0.65)',
              margin: '0 0 40px', maxWidth: 500,
              marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6
            }}>
              Start free. Upgrade when you need more power.
              No hidden fees. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="billing-toggle">
              <button
                className="billing-btn"
                onClick={() => setBilling('monthly')}
                style={{
                  background: billing === 'monthly'
                    ? '#fff' : 'transparent',
                  color: billing === 'monthly' ? '#0F172A' : 'rgba(255,255,255,0.6)',
                }}>
                Monthly
              </button>
              <button
                className="billing-btn"
                onClick={() => setBilling('yearly')}
                style={{
                  background: billing === 'yearly'
                    ? '#fff' : 'transparent',
                  color: billing === 'yearly' ? '#0F172A' : 'rgba(255,255,255,0.6)',
                }}>
                Yearly
                <span style={{
                  marginLeft: 8, background: '#10B981',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 20
                }}>Save 35%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Client Plans */}
        <div style={{
          background: '#F8FAFC',
          padding: '60px 0 80px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 20px' }}>
            <div className="section-tag reveal" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#EEF2FF', color: '#6366F1',
              borderRadius: 50, padding: '6px 16px',
              fontSize: 13, fontWeight: 700, marginBottom: 12
            }}>
              🎬 For Clients
            </div>
            <h2 style={{
              fontSize: 36, fontWeight: 800, color: '#0F172A',
              margin: 0, letterSpacing: '-1px'
            }}>Hire Amazing Editors</h2>
          </div>

          <div className="plans-grid">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`plan-card reveal ${plan.popular ? 'popular' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}>

                {/* Popular Badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff', borderRadius: 50,
                    padding: '6px 20px', fontSize: 12,
                    fontWeight: 700, whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                  }}>
                    ⭐ Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: plan.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, marginBottom: 14
                  }}>{plan.icon}</div>

                  <div style={{
                    fontWeight: 800, fontSize: 20, color: '#0F172A'
                  }}>{plan.name}</div>
                  <div style={{
                    fontSize: 13, color: '#94A3B8', marginTop: 4
                  }}>{plan.desc}</div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 4
                  }}>
                    <span style={{
                      fontSize: 48, fontWeight: 900,
                      color: plan.color, letterSpacing: '-2px'
                    }}>
                      ${getPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span style={{ color: '#94A3B8', fontSize: 14 }}>
                        /month
                      </span>
                    )}
                  </div>
                  {billing === 'yearly' && savings(plan) && (
                    <div style={{
                      fontSize: 13, color: '#10B981',
                      fontWeight: 600, marginTop: 4
                    }}>
                      💰 Save ${savings(plan)}/year
                    </div>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <div style={{
                      fontSize: 13, color: '#94A3B8', marginTop: 4
                    }}>
                      Forever free
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontWeight: 700,
                    fontSize: 15, fontFamily: 'inherit',
                    marginBottom: 24, transition: 'all 0.2s',
                    background: plan.popular
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : '#F8FAFC',
                    color: plan.popular ? '#fff' : '#374151',
                    border: plan.popular
                      ? 'none' : '1.5px solid #E2E8F0',
                    boxShadow: plan.popular
                      ? '0 4px 14px rgba(99,102,241,0.4)' : 'none'
                  }}>
                  {plan.cta} →
                </button>

                {/* Features */}
                <div>
                  {plan.features.map(f => (
                    <div key={f} className="feature-item">
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: plan.bg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24"
                          fill="none" stroke={plan.color} strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                      {f}
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} className="feature-item" style={{
                      color: '#CBD5E1'
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#F1F5F9', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24"
                          fill="none" stroke="#CBD5E1" strokeWidth="3">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Plans */}
        <div style={{ padding: '80px 0', background: '#fff' }}>
          <div style={{
            textAlign: 'center', marginBottom: 40, padding: '0 20px'
          }}>
            <div className="section-tag reveal" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#F0FDF4', color: '#15803D',
              borderRadius: 50, padding: '6px 16px',
              fontSize: 13, fontWeight: 700, marginBottom: 12
            }}>
              ✂️ For Editors
            </div>
            <h2 className="reveal" style={{
              fontSize: 36, fontWeight: 800, color: '#0F172A',
              margin: '0 0 12px', letterSpacing: '-1px'
            }}>Grow Your Editing Business</h2>
            <p className="reveal" style={{
              color: '#64748B', fontSize: 16, margin: 0
            }}>
              Start earning for free. Go Pro to maximize your income.
            </p>
          </div>

          <div className="editor-plans-grid">
            {editorPlans.map((plan, i) => (
              <div
                key={plan.id}
                className={`plan-card reveal`}
                style={{
                  transitionDelay: `${i * 0.15}s`,
                  borderColor: plan.popular ? plan.color : '#E2E8F0',
                  boxShadow: plan.popular
                    ? '0 8px 32px rgba(99,102,241,0.15)' : 'none'
                }}>

                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff', borderRadius: 50,
                    padding: '6px 20px', fontSize: 12, fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                  }}>
                    ⭐ Recommended
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 28, marginBottom: 12
                  }}>{plan.icon}</div>
                  <div style={{
                    fontWeight: 800, fontSize: 20, color: '#0F172A'
                  }}>{plan.name}</div>
                  <div style={{
                    fontSize: 13, color: '#94A3B8', marginTop: 4
                  }}>{plan.desc}</div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 4
                  }}>
                    <span style={{
                      fontSize: 44, fontWeight: 900,
                      color: plan.color, letterSpacing: '-2px'
                    }}>
                      ${billing === 'yearly'
                        ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span style={{ color: '#94A3B8', fontSize: 14 }}>
                        /month
                      </span>
                    )}
                  </div>
                  {plan.monthlyPrice === 0 && (
                    <div style={{ fontSize: 13, color: '#94A3B8' }}>
                      Forever free
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontWeight: 700,
                    fontSize: 15, fontFamily: 'inherit',
                    marginBottom: 22, transition: 'all 0.2s',
                    background: plan.popular
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : '#F8FAFC',
                    color: plan.popular ? '#fff' : '#374151',
                    border: plan.popular ? 'none' : '1.5px solid #E2E8F0',
                    boxShadow: plan.popular
                      ? '0 4px 14px rgba(99,102,241,0.4)' : 'none'
                  }}>
                  {plan.cta} →
                </button>

                {plan.features.map(f => (
                  <div key={f} className="feature-item">
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#EEF2FF', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24"
                        fill="none" stroke={plan.color} strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ background: '#F8FAFC', padding: '80px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 className="reveal" style={{
              fontSize: 32, fontWeight: 800, color: '#0F172A',
              textAlign: 'center', margin: '0 0 40px',
              letterSpacing: '-1px'
            }}>Compare All Features</h2>

            <div style={{
              background: '#fff', borderRadius: 20,
              border: '1px solid #E2E8F0', overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{
                      padding: '16px 20px', textAlign: 'left',
                      fontSize: 14, fontWeight: 700, color: '#64748B',
                      borderBottom: '1px solid #E2E8F0'
                    }}>Feature</th>
                    {['Free', 'Pro', 'Business'].map(p => (
                      <th key={p} style={{
                        padding: '16px 20px', textAlign: 'center',
                        fontSize: 14, fontWeight: 700,
                        color: p === 'Pro' ? '#6366F1' : '#0F172A',
                        borderBottom: '1px solid #E2E8F0'
                      }}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Hire Requests', '3/month', 'Unlimited', 'Unlimited'],
                    ['AI Editor Matching', '✕', '✓', '✓'],
                    ['Escrow Payments', '✕', '✓', '✓'],
                    ['Real-time Collaboration', '✕', '✓', '✓'],
                    ['Priority Listings', '✕', '✓', '✓'],
                    ['Analytics Dashboard', '✕', '✓', '✓'],
                    ['Team Members', '1', '1', 'Up to 10'],
                    ['Dedicated Manager', '✕', '✕', '✓'],
                    ['API Access', '✕', '✕', '✓'],
                    ['Support', 'Standard', 'Priority', '24/7 SLA'],
                  ].map((row, i) => (
                    <tr key={row[0]} style={{
                      background: i % 2 === 0 ? '#fff' : '#FAFAFA'
                    }}>
                      <td style={{
                        padding: '14px 20px', fontSize: 14,
                        color: '#374151', fontWeight: 500,
                        borderBottom: '1px solid #F1F5F9'
                      }}>{row[0]}</td>
                      {row.slice(1).map((val, j) => (
                        <td key={j} style={{
                          padding: '14px 20px', textAlign: 'center',
                          fontSize: 14, fontWeight: val === '✓' ? 700 : 400,
                          color: val === '✓' ? '#10B981'
                            : val === '✕' ? '#CBD5E1' : '#374151',
                          borderBottom: '1px solid #F1F5F9'
                        }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: '80px 20px', background: '#fff' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 className="reveal" style={{
              fontSize: 32, fontWeight: 800, color: '#0F172A',
              textAlign: 'center', margin: '0 0 40px',
              letterSpacing: '-1px'
            }}>
              Frequently Asked Questions
            </h2>

            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}>
                <div style={{
                  fontWeight: 700, fontSize: 15,
                  color: '#0F172A', marginBottom: 10
                }}>
                  {faq.q}
                </div>
                <div style={{
                  fontSize: 14, color: '#64748B', lineHeight: 1.7
                }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          padding: '80px 20px', textAlign: 'center'
        }}>
          <h2 className="reveal" style={{
            fontSize: 40, fontWeight: 900, color: '#fff',
            margin: '0 0 16px', letterSpacing: '-1.5px'
          }}>
            Start Free Today
          </h2>
          <p className="reveal" style={{
            color: 'rgba(255,255,255,0.8)', fontSize: 17,
            margin: '0 0 36px'
          }}>
            No credit card required. Upgrade anytime.
          </p>
          <div className="reveal" style={{
            display: 'flex', gap: 14,
            justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <Link to="/signup" style={{
              padding: '15px 36px', borderRadius: 50,
              background: '#fff', color: '#6366F1',
              fontWeight: 800, fontSize: 16,
              textDecoration: 'none', display: 'inline-block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}>
              Get Started Free 🚀
            </Link>
            <Link to="/editors" style={{
              padding: '15px 36px', borderRadius: 50,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', fontWeight: 600, fontSize: 16,
              textDecoration: 'none', display: 'inline-block',
              transition: 'all 0.2s'
            }}>
              Browse Editors →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
