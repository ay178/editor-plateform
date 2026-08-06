import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import GoogleButton from '../components/GoogleButton';
import { useAuth } from '../context/AuthContext';

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
            <span style={{ fontSize: 11, color: c.valid ? '#10B981' : '#5C5B7A' }}>
              {c.valid ? '✓' : '○'}
            </span>
            <span style={{ fontSize: 11, color: c.valid ? '#10B981' : '#5C5B7A' }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6-box OTP input
function OTPInput({ value, onChange }) {
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const chars = value.split('');
    chars[i] = val;
    const next = chars.join('').slice(0, 6);
    onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handlePaste}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          className="input"
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          style={{
            width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
            padding: 0
          }}
        />
      ))}
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { setUserDirectly } = useAuth();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const isPasswordStrong = () =>
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[!@#$%^&*]/.test(form.password);

  const submitForm = async e => {
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
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const submitOTP = async e => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) return setError('Enter the 6-digit code');

    setLoading(true);
    try {
      const res = await api.post('/verify-otp', { email: form.email, otp });
      setUserDirectly(res.data.token, res.data.user);
      navigate(res.data.user.role === 'client' ? '/dashboard/client' : '/dashboard/editor');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const resendOTP = async () => {
    setError('');
    setResending(true);
    try {
      await api.post('/resend-otp', { email: form.email });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code');
    } finally { setResending(false); }
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
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 4 }}>
            {step === 'form' ? 'Join the EditHire community' : `We sent a 6-digit code to ${form.email}`}
          </p>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#EF4444'
            }}>{error}</div>
          )}

          {step === 'form' ? (
            <>
              <div style={{ marginBottom: 20 }}>
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

              <GoogleButton role={form.role} onError={setError} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: '#5C5B7A' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <form onSubmit={submitForm}>
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
                  {loading ? 'Sending code...' : `Continue →`}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={submitOTP}>
              <div style={{ marginBottom: 24 }}>
                <OTPInput value={otp} onChange={setOtp} />
              </div>

              <button className="btn-primary" type="submit" disabled={loading || otp.length !== 6}
                style={{
                  width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15,
                  opacity: otp.length !== 6 ? 0.6 : 1, marginBottom: 14
                }}>
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={resendOTP} disabled={resending}
                  style={{
                    background: 'none', border: 'none', color: '#9B9AB8', fontSize: 13,
                    cursor: 'pointer', textDecoration: 'underline'
                  }}>
                  {resending ? 'Sending...' : "Didn't get a code? Resend"}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#5C5B7A', fontSize: 12.5,
                    cursor: 'pointer'
                  }}>
                  ← Back to edit details
                </button>
              </div>
            </form>
          )}
        </div>

        {step === 'form' && (
          <p style={{ textAlign: 'center', marginTop: 20, color: '#9B9AB8', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}