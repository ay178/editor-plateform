import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await signup(form.name, form.email, form.password, form.role);
      navigate(user.role === 'client' ? '/dashboard/client' : '/dashboard/editor');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff'
          }}>E</div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Create your account</h1>
          <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 4 }}>Join the EditHire community</p>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#EF4444'
            }}>{error}</div>
          )}

          {/* Role toggle */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 8 }}>I am a...</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['client', 'editor'].map(r => (
                <button key={r} type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    border: form.role === r ? '2px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                    background: form.role === r ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                    color: form.role === r ? '#9F67FF' : '#9B9AB8',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
                    textTransform: 'capitalize', transition: 'all 0.2s'
                  }}>
                  {r === 'client' ? '🎬 Client' : '✂️ Editor'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input className="input" name="name" placeholder="John Doe"
                value={form.name} onChange={handle} required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="input" name="password" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={handle} required minLength={6} />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}>
              {loading ? 'Creating account...' : `Join as ${form.role === 'client' ? 'Client' : 'Editor'} →`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#9B9AB8', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}