import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
            transition: 'background 0.3s'
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

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const isPasswordStrong = () =>
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[!@#$%^&*]/.test(form.password);

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 2)
      return setError('Name must be at least 2 characters');

    if (!isPasswordStrong())
      return setError('Please make your password stronger');

    setLoading(true);
    try {
      await api.post('/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      navigate('/login', {
        state: { message: '✅ Account created! Please check your email to verify your account.' }
      });
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
           <img src="/logo192.png" alt="EditHire" style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
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
              <div style={{ position: 'relative' }}>
                <input className="input" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, uppercase, number, special"
                  value={form.password} onChange={handle} required
                  style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9B9AB8'
                  }}>{showPassword ? '🙈' : '👁'}</button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <button className="btn-primary" type="submit" disabled={loading || !isPasswordStrong()}
              style={{
                width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15,
                opacity: !isPasswordStrong() ? 0.6 : 1
              }}>
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