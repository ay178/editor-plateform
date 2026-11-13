import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Icon from'../components/Icon';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
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

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo192.png" alt="EditHire" style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Forgot your password?</h1>
          <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 4 }}>
            No worries — enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#EF4444'
            }}>{error}</div>
          )}

          {done ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ color: '#9F67FF', marginBottom: 14 }}><Icon name="inbox"size={37} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ color: '#9B9AB8', fontSize: 14, lineHeight: 1.6 }}>
                If an account exists for <strong style={{ color: '#F1F0FF' }}>{email}</strong>, a password reset link has been sent. It expires in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#9B9AB8', fontSize: 14 }}>
          Remembered it? <Link to="/login" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}