import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', valid: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.valid).length;
  const color = score <= 1 ? '#EF4444' : score === 2 ? '#F59E0B' : score === 3 ? '#06B6D4' : '#10B981';
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= score ? color : 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: c.valid ? '#10B981' : '#5C5B7A' }}>{c.valid ? '✓' : '○'}</span>
            <span style={{ fontSize: 11, color: c.valid ? '#10B981' : '#5C5B7A' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const isPasswordStrong = () =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password);

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (!token) return setError('Missing or invalid reset link. Please request a new one.');
    if (!isPasswordStrong()) return setError('Please make your password stronger.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login', {
        state: { message: '✅ Password reset! Please sign in with your new password.' }
      }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ padding: 40, maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Invalid Link</h2>
          <p style={{ color: '#9B9AB8', marginBottom: 24 }}>This password reset link is missing or malformed.</p>
          <Link to="/forgot-password">
            <button className="btn-primary" style={{ padding: '12px 28px' }}>Request New Link →</button>
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Set a new password</h1>
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
              <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Password reset!</h3>
              <p style={{ color: '#9B9AB8', fontSize: 14 }}>Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, uppercase, number, special"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9B9AB8'
                    }}>{showPassword ? '🙈' : '👁'}</button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input className="input" type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>

              <button className="btn-primary" type="submit" disabled={loading || !isPasswordStrong()}
                style={{
                  width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15,
                  opacity: !isPasswordStrong() ? 0.6 : 1
                }}>
                {loading ? 'Resetting...' : 'Reset Password →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}