import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
   const location = useLocation(); 
  const successMessage = location.state?.message;  
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'client' ? '/dashboard/client' : '/dashboard/editor');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* BG blob */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/logo192.png" alt="EditHire" style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Welcome back</h1>
          <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 4 }}>Sign in to your EditHire account</p>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          {successMessage && (
  <div style={{
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 20,
    fontSize: 14, color: '#10B981'
  }}>{successMessage}</div>
)}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#EF4444'
            }}>{error}</div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="input" name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handle} required />
                <div style={{ textAlign: 'right', marginTop: 6 }}>
  <Link to="/forgot-password" style={{ color: '#9B9AB8', fontSize: 12.5, textDecoration: 'none' }}>
    Forgot password?
  </Link>
</div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick fill demo */}
          <div style={{ marginTop: 20, padding: '12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.15)' }}>
            <p style={{ fontSize: 12, color: '#06B6D4', marginBottom: 8, fontWeight: 600 }}>Demo Accounts</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                ['Client', 'alex@client.com'],
                ['Editor', 'sofia@editor.com'],
              ].map(([role, email]) => (
                <button key={email} onClick={() => setForm({ email, password: 'password123' })}
                  style={{
                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                    color: '#06B6D4', padding: '4px 10px', borderRadius: 6, fontSize: 12,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                  }}>{role}</button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#9B9AB8', fontSize: 14 }}>
          New here? <Link to="/signup" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}