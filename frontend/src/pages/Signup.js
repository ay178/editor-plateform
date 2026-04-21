import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'client'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be 6+ characters'); return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .signup-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .signup-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 440px;
        }
        @media (max-width: 480px) {
          .signup-card {
            padding: 24px 20px;
            border-radius: 16px;
          }
        }
        .signup-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          font-size: 15px;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .signup-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .role-btn {
          flex: 1;
          padding: 14px 10px;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          font-family: inherit;
        }
        .signup-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          transition: all 0.2s;
        }
        .signup-btn:hover {
          transform: translateY(-1px);
        }
        .signup-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="signup-container">
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 50, padding: '10px 22px', marginBottom: 10
            }}>
              <span style={{
                color: '#fff', fontWeight: 800, fontSize: 20
              }}>✂️ EditHire</span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              margin: 0, fontSize: 15
            }}>
              Join thousands of creators today!
            </p>
          </div>

          <div className="signup-card">
            <h2 style={{
              margin: '0 0 20px', fontSize: 22,
              fontWeight: 800, color: '#0F172A'
            }}>Create Account</h2>

            {error && (
              <div style={{
                background: '#FEF2F2', color: '#B91C1C',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 14, marginBottom: 16,
                border: '1px solid #FECACA'
              }}>{error}</div>
            )}

            {/* Role Picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#374151',
                display: 'block', marginBottom: 10
              }}>I am a...</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  ['client', '🎬', 'Client', 'Hire editors'],
                  ['editor', '✂️', 'Editor', 'Get hired'],
                ].map(([r, icon, label, sub]) => (
                  <button
                    key={r}
                    className="role-btn"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    style={{
                      border: `2px solid ${form.role === r ? '#6366F1' : '#E2E8F0'}`,
                      background: form.role === r ? '#EEF2FF' : '#F8FAFC',
                    }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <div style={{
                      fontWeight: 700, fontSize: 14,
                      color: form.role === r ? '#6366F1' : '#0F172A'
                    }}>{label}</div>
                    <div style={{
                      fontSize: 11, color: '#94A3B8', marginTop: 2
                    }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#374151',
                display: 'block', marginBottom: 6
              }}>Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className="signup-input"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#374151',
                display: 'block', marginBottom: 6
              }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="signup-input"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#374151',
                display: 'block', marginBottom: 6
              }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Min 6 characters"
                className="signup-input"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="signup-btn">
              {loading ? (
                <span style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8
                }}>
                  <div style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Creating Account...
                </span>
              ) : 'Create Account →'}
            </button>

            <p style={{
              textAlign: 'center', marginTop: 20,
              fontSize: 14, color: '#64748B'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#6366F1', fontWeight: 700,
                textDecoration: 'none'
              }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;