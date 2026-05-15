import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    // Scroll reveal
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

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '10K+', label: 'Active Editors' },
    { value: '50K+', label: 'Projects Done' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '$2M+', label: 'Paid to Editors' },
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      desc: 'Our AI analyzes your project requirements and matches you with the perfect editor in seconds.',
      color: '#6366F1',
      bg: '#EEF2FF'
    },
    {
      icon: '🔒',
      title: 'Secure Escrow Payment',
      desc: 'Your money is safe. We hold payments in escrow until you are 100% satisfied with the work.',
      color: '#10B981',
      bg: '#F0FDF4'
    },
    {
      icon: '🎬',
      title: 'Real-time Collaboration',
      desc: 'Work together with your editor in real-time. Share notes, timeline markers, and feedback live.',
      color: '#F59E0B',
      bg: '#FFF7ED'
    },
    {
      icon: '⭐',
      title: 'Verified Portfolios',
      desc: 'Every editor is verified with real portfolio samples and client reviews you can trust.',
      color: '#EC4899',
      bg: '#FDF2F8'
    },
    {
      icon: '💰',
      title: 'Smart Pricing AI',
      desc: 'AI suggests the perfect rate based on market data, skills, and experience level.',
      color: '#8B5CF6',
      bg: '#F5F3FF'
    },
    {
      icon: '📱',
      title: 'Mobile First Design',
      desc: 'Manage your projects, chat with editors, and make payments from anywhere.',
      color: '#0EA5E9',
      bg: '#F0F9FF'
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Post Your Project',
      desc: 'Describe what you need — YouTube video, brand commercial, wedding film, or social media content.',
      icon: '📝'
    },
    {
      step: '02',
      title: 'AI Finds Your Match',
      desc: 'Our algorithm analyzes 50+ data points to find editors whose style and skills match your vision.',
      icon: '🤖'
    },
    {
      step: '03',
      title: 'Review & Hire',
      desc: 'Browse matched editors, view portfolios, read reviews, and hire with one click.',
      icon: '✅'
    },
    {
      step: '04',
      title: 'Collaborate & Pay',
      desc: 'Work together in real-time, approve the final cut, and release payment securely.',
      icon: '🎬'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'YouTube Creator — 2M subscribers',
      avatar: 'SJ',
      text: 'EditHire transformed my content workflow. Found an amazing editor in minutes who perfectly understood my style. My views doubled in 3 months!',
      rating: 5,
      color: '#6366F1'
    },
    {
      name: 'Marcus Chen',
      role: 'Brand Manager at TechCorp',
      avatar: 'MC',
      text: 'The escrow system gave us complete confidence. Our commercial was delivered on time and exceeded expectations. Will definitely use again.',
      rating: 5,
      color: '#10B981'
    },
    {
      name: 'Priya Sharma',
      role: 'Wedding Photographer',
      avatar: 'PS',
      text: 'As an editor on EditHire, I have tripled my income. The platform handles everything — clients, payments, contracts. I just focus on editing.',
      rating: 5,
      color: '#F59E0B'
    },
  ];

  const editorCategories = [
    { icon: '🎥', label: 'Video Editing', count: '2.4K editors' },
    { icon: '🎨', label: 'Color Grading', count: '1.2K editors' },
    { icon: '✨', label: 'Motion Graphics', count: '980 editors' },
    { icon: '🖼️', label: 'Thumbnail Design', count: '1.8K editors' },
    { icon: '🎵', label: 'Sound Design', count: '760 editors' },
    { icon: '🎭', label: 'Animation', count: '540 editors' },
  ];

  return (
    <>
      <style>{`
        .landing-page { overflow-x: hidden; }

        /* Hero */
        .hero-section {
          min-height: 100vh;
          background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 80px 20px;
        }
        .hero-bg-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(99,102,241,0.08);
          animation: float1 6s ease-in-out infinite;
        }
        .hero-content {
          text-align: center;
          max-width: 800px;
          position: relative;
          z-index: 2;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          borderRadius: 50px;
          padding: 8px 20px;
          margin-bottom: 28px;
          color: #A5B4FC;
          font-size: 14px;
          font-weight: 600;
        }
        .hero-title {
          font-size: 72px;
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -3px;
          margin: 0 0 24px;
        }
        .hero-subtitle {
          font-size: 20px;
          color: rgba(255,255,255,0.65);
          margin: 0 0 40px;
          line-height: 1.6;
        }
        .hero-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-btn-primary {
          padding: 16px 36px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 32px rgba(99,102,241,0.5);
          transition: all 0.3s;
          font-family: inherit;
        }
        .hero-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(99,102,241,0.6);
        }
        .hero-btn-secondary {
          padding: 16px 36px;
          border-radius: 50px;
          border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          font-family: inherit;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
        }

        /* Sections */
        .section {
          padding: 100px 20px;
          max-width: 1140px;
          margin: 0 auto;
        }
        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          color: #6366F1;
          borderRadius: 50px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 48px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -2px;
          margin: 0 0 16px;
          line-height: 1.1;
        }
        .section-subtitle {
          font-size: 18px;
          color: #64748B;
          margin: 0 0 60px;
          max-width: 600px;
          line-height: 1.7;
        }

        /* Stats */
        .stats-section {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          padding: 60px 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          border-color: transparent;
        }

        /* How it works */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          position: relative;
        }
        .step-card {
          text-align: center;
          padding: 28px 20px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          transition: all 0.3s;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(99,102,241,0.12);
        }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .category-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 22px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .category-card:hover {
          border-color: #6366F1;
          background: #EEF2FF;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.15);
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .testimonial-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }

        /* CTA */
        .cta-section {
          background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%);
          padding: 100px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Footer */
        .footer {
          background: #0F172A;
          color: rgba(255,255,255,0.6);
          padding: 60px 20px 30px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          max-width: 1140px;
          margin: 0 auto 40px;
        }

        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 42px; letter-spacing: -1.5px; }
          .hero-subtitle { font-size: 16px; }
          .section-title { font-size: 32px; letter-spacing: -1px; }
          .section { padding: 60px 16px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btn-primary, .hero-btn-secondary { width: 100%; max-width: 300px; justify-content: center; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 32px; }
          .categories-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="landing-page">

        {/* ── HERO ── */}
        <section className="hero-section" ref={heroRef}>
          {/* Background circles */}
          {[
            { w: 600, h: 600, top: '-200px', left: '-200px', delay: '0s' },
            { w: 400, h: 400, top: '50%', right: '-100px', delay: '1s' },
            { w: 300, h: 300, bottom: '-100px', left: '30%', delay: '2s' },
          ].map((c, i) => (
            <div key={i} className="hero-bg-circle" style={{
              width: c.w, height: c.h,
              top: c.top, left: c.left,
              right: c.right, bottom: c.bottom,
              animationDelay: c.delay
            }} />
          ))}

          <div className="hero-content animate-fadeUp">
            <div className="hero-badge">
              <span style={{ fontSize: 16 }}>✨</span>
              AI-Powered Editor Marketplace
            </div>

            <h1 className="hero-title">
              Hire World-Class{' '}
              <span className="gradient-text-animated">
                Video Editors
              </span>{' '}
              in Minutes
            </h1>

            <p className="hero-subtitle">
              Connect with 10,000+ professional editors. AI matches you with the
              perfect talent. Secure escrow payments. Real-time collaboration.
            </p>

            <div className="hero-btns">
              <Link to="/editors" className="hero-btn-primary shimmer-btn">
                🔍 Browse Editors
              </Link>
              <Link to="/signup" className="hero-btn-secondary">
                Get Started Free →
              </Link>
            </div>

            {/* Social proof */}
            <div style={{
              marginTop: 48, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 20, flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex' }}>
                {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                  <div key={l} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: ['#6366F1','#10B981','#F59E0B','#EC4899','#0EA5E9'][i],
                    border: '2px solid #0F172A',
                    marginLeft: i > 0 ? -10 : 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff',
                    fontSize: 12, fontWeight: 700
                  }}>{l}</div>
                ))}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  ⭐⭐⭐⭐⭐ 4.9/5
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  from 12,000+ reviews
                </div>
              </div>
              <div style={{
                width: 1, height: 36,
                background: 'rgba(255,255,255,0.15)'
              }} />
              <div style={{
                color: 'rgba(255,255,255,0.6)', fontSize: 13
              }}>
                🔒 Secure Escrow · 💳 Easy Payments · 🤖 AI Matching
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={s.label} className="reveal" style={{
                transitionDelay: `${i * 0.1}s`
              }}>
                <div style={{
                  fontSize: 42, fontWeight: 900, color: '#fff',
                  letterSpacing: '-2px'
                }}>{s.value}</div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: 14,
                  marginTop: 4, fontWeight: 500
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="section">
          <div style={{ textAlign: 'center' }}>
            <div className="section-tag reveal">🚀 Why EditHire</div>
            <h2 className="section-title reveal">
              Everything You Need to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Create Faster</span>
            </h2>
            <p className="section-subtitle reveal" style={{ margin: '0 auto 60px' }}>
              From AI matching to secure payments — we have built every tool
              you need to hire great editors and deliver amazing content.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`feature-card reveal ${i % 2 === 0 ? '' : 'delay-200'}`}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: f.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 18
                }}>{f.icon}</div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700,
                  color: '#0F172A', margin: '0 0 10px'
                }}>{f.title}</h3>
                <p style={{
                  fontSize: 14, color: '#64748B',
                  lineHeight: 1.7, margin: 0
                }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ background: '#F8FAFC', padding: '100px 20px' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="section-tag reveal">⚡ Simple Process</div>
              <h2 className="section-title reveal">How EditHire Works</h2>
              <p className="section-subtitle reveal" style={{
                margin: '0 auto 60px'
              }}>
                From idea to final cut in 4 simple steps
              </p>
            </div>

            <div className="steps-grid">
              {howItWorks.map((step, i) => (
                <div
                  key={step.step}
                  className={`step-card reveal`}
                  style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div style={{
                    fontSize: 11, fontWeight: 800, color: '#6366F1',
                    letterSpacing: '2px', marginBottom: 16
                  }}>STEP {step.step}</div>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>
                    {step.icon}
                  </div>
                  <h3 style={{
                    fontSize: 18, fontWeight: 700,
                    color: '#0F172A', margin: '0 0 10px'
                  }}>{step.title}</h3>
                  <p style={{
                    fontSize: 14, color: '#64748B',
                    lineHeight: 1.7, margin: 0
                  }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="section">
          <div style={{ textAlign: 'center' }}>
            <div className="section-tag reveal">🎯 Browse by Skill</div>
            <h2 className="section-title reveal">
              Find the Right Expert
            </h2>
            <p className="section-subtitle reveal" style={{
              margin: '0 auto 50px'
            }}>
              Browse editors by their specialty
            </p>
          </div>

          <div className="categories-grid">
            {editorCategories.map((cat, i) => (
              <Link
                key={cat.label}
                to="/editors"
                className={`category-card reveal`}
                style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#EEF2FF', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0
                }}>{cat.icon}</div>
                <div>
                  <div style={{
                    fontWeight: 700, fontSize: 15, color: '#0F172A'
                  }}>{cat.label}</div>
                  <div style={{
                    fontSize: 13, color: '#94A3B8', marginTop: 2
                  }}>{cat.count}</div>
                </div>
                <div style={{
                  marginLeft: 'auto', color: '#6366F1', fontSize: 18
                }}>→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div style={{ background: '#F8FAFC', padding: '100px 20px' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="section-tag reveal">💬 Testimonials</div>
              <h2 className="section-title reveal">
                Loved by Creators & Editors
              </h2>
              <p className="section-subtitle reveal" style={{
                margin: '0 auto 60px'
              }}>
                Join thousands of happy users worldwide
              </p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className={`testimonial-card reveal`}
                  style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div style={{
                    display: 'flex', gap: 3, marginBottom: 16
                  }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="16" height="16"
                        viewBox="0 0 24 24" fill="#F59E0B">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                  </div>
                  <p style={{
                    fontSize: 15, color: '#374151',
                    lineHeight: 1.7, margin: '0 0 20px',
                    fontStyle: 'italic'
                  }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: t.color, color: '#fff',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: 14
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{
                        fontWeight: 700, fontSize: 14, color: '#0F172A'
                      }}>{t.name}</div>
                      <div style={{
                        fontSize: 12, color: '#94A3B8', marginTop: 1
                      }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cta-section">
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 50, padding: '8px 20px',
              color: '#A5B4FC', fontSize: 13,
              fontWeight: 600, marginBottom: 24
            }}>
              🚀 Join 10,000+ creators today
            </div>
            <h2 className="reveal" style={{
              fontSize: 52, fontWeight: 900, color: '#fff',
              letterSpacing: '-2px', margin: '0 0 20px',
              lineHeight: 1.1
            }}>
              Ready to Create{' '}
              <span className="gradient-text-animated">
                Amazing Content?
              </span>
            </h2>
            <p className="reveal" style={{
              fontSize: 18, color: 'rgba(255,255,255,0.65)',
              margin: '0 0 40px', maxWidth: 500,
              margin: '0 auto 40px', lineHeight: 1.6
            }}>
              Start for free. Find your perfect editor today.
              No credit card required.
            </p>
            <div className="reveal" style={{
              display: 'flex', gap: 14, justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link to="/signup" className="hero-btn-primary shimmer-btn"
                style={{ fontSize: 17, padding: '18px 42px' }}>
                Get Started Free 🚀
              </Link>
              <Link to="/editors" className="hero-btn-secondary"
                style={{ fontSize: 17, padding: '18px 42px' }}>
                Browse Editors →
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 10, marginBottom: 16
              }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                </div>
                <span style={{
                  color: '#fff', fontWeight: 800, fontSize: 20
                }}>EditHire</span>
              </div>
              <p style={{
                fontSize: 14, lineHeight: 1.7, margin: '0 0 20px',
                maxWidth: 260
              }}>
                The world's leading marketplace for professional
                video editors. AI-powered matching, secure payments.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                  <div key={s} style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                    fontSize: 12, color: 'rgba(255,255,255,0.6)',
                    fontWeight: 600
                  }}>{s[0]}</div>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platform',
                links: ['Browse Editors', 'AI Matching', 'How it Works', 'Pricing']
              },
              {
                title: 'For Editors',
                links: ['Join as Editor', 'Smart Pricing', 'Portfolio Tips', 'Success Stories']
              },
              {
                title: 'Company',
                links: ['About Us', 'Blog', 'Careers', 'Contact']
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  marginBottom: 16
                }}>{col.title}</div>
                {col.links.map(link => (
                  <div key={link} style={{
                    fontSize: 13, marginBottom: 10, cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                    {link}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{
            maxWidth: 1140, margin: '0 auto',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 24, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ fontSize: 13 }}>
              © 2025 EditHire. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;