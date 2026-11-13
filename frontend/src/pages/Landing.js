import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from'../components/Icon';
const WORDS = ['YouTube Videos', 'Short Films', 'Brand Ads', 'Reels & TikToks', 'Documentaries'];

export default function Landing() {
    const { user } = useAuth(); 
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div className="chip-cyan">Professional Editing Marketplace</div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
            Find Editors For Your
          </h1>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 28 }}>
            <span className="gradient-text" key={wordIdx} style={{ animation: 'fadeUp 0.4s ease' }}>
              {WORDS[wordIdx]}
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#9B9AB8', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Connect with professional video editors, colorists, and motion designers.
            Post your project, get matched, collaborate in real-time.
          </p>

          {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
  <Link to="/browse">
    <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
      Browse Editors →
    </button>
  </Link>
  {!user && (
    <Link to="/signup">
      <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: 16 }}>
        Join as Editor
      </button>
    </Link>
  )}
</div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {[['500+', 'Expert Editors'], ['2,000+', 'Projects Done'], ['4.9/5', 'Avg Rating'], ['98%', 'Client Satisfaction']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#F1F0FF' }}>{num}</div>
                <div style={{ fontSize: 13, color: '#9B9AB8', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section" style={{ background: '#1A1A2E' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: '#9B9AB8', marginBottom: 48 }}>From idea to final cut in 3 simple steps</p>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { n: '01', title: 'Browse & Filter', desc: 'Search editors by skill, price, rating, and availability. View portfolios before you decide.', icon: 'search' },
              { n: '02', title: 'Send Hire Request', desc: 'Describe your project, set your budget and deadline. Editor reviews and accepts.', icon: 'clipboard' },
              { n: '03', title: 'Collaborate & Pay', desc: 'Chat in real-time, review progress. Release secure payment when done.', icon: 'check-circle' },
            ].map(step => (
              <div key={step.n} className="glass" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ marginBottom: 16, color: '#9F67FF' }}><Icon name={step.icon} size={32} /></div>
                <div style={{ fontSize: 12, color: '#7C3AED', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{step.n}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: '#9B9AB8', lineHeight: 1.6, fontSize: 14 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, marginBottom: 48 }}>Every Skill You Need</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Video Editing', 'Color Grading', 'Motion Graphics', 'Sound Design', 'Thumbnail Design', 'Animation', 'VFX', 'Photo Editing'].map(s => (
              <div key={s} className="chip" style={{ fontSize: 14, padding: '8px 18px' }}>{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 24, padding: '60px 40px', textAlign: 'center'
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Ready to Hire Your Editor?</h2>
            <p style={{ color: '#9B9AB8', marginBottom: 32, fontSize: 16 }}>Join thousands of creators who ship faster with EditHire</p>
           <Link to={user ? (user.role === 'client' ? '/browse' : '/dashboard/editor') : '/signup'}>
  <button className="btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
    {user ? (user.role === 'client' ? 'Browse Editors →' : 'Go to Dashboard →') : 'Start For Free →'}
  </button>
</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 0', textAlign: 'center' }}>
        <p style={{ color: '#5C5B7A', fontSize: 13 }}>© 2025 EditHire. All rights reserved.</p>
      </footer>
    </div>
  );
}