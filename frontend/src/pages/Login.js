import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .login-box {
          width: 100%;
          max-width: 440px;
        }
        .login-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 24px 20px;
            border-radius: 16px;
          }
        }
        .login-input {
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
        .login-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .login-btn {
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
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.5);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .demo-btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          cursor: pointer;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s;
        }
        .demo-btn:hover {
          border-color: #6366F1;
          color: #6366F1;
          background: #EEF2FF;
        }
      `}</style>

      <div className="login-container">
        <div className="login-box">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 50, padding: '10px 22px', marginBottom: 12
            }}>
              <div style={{
                width: 32, height: 32,
                background: 'rgba(255,255,255,0.3)',
                borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
              </div>
              <span style={{
                color: '#fff', fontWeight: 800, fontSize: 20
              }}>EditHire</span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              margin: 0, fontSize: 15
            }}>
              Welcome back! Sign in to continue
            </p>
          </div>

          <div className="login-card">
            <h2 style={{
              margin: '0 0 24px', fontSize: 22,
              fontWeight: 800, color: '#0F172A'
            }}>Sign In</h2>

            {error && (
              <div style={{
                background: '#FEF2F2', color: '#B91C1C',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 14, marginBottom: 16,
                border: '1px solid #FECACA'
              }}>{error}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 13, fontWeight: 600, color: '#374151',
                display: 'block', marginBottom: 6
              }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                className="login-input"
              />
            </div>

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
                placeholder="••••••••"
                className="login-input"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="login-btn">
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
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>

            {/* Demo Accounts */}
            <div style={{
              marginTop: 20,
              borderTop: '1px solid #F1F5F9',
              paddingTop: 16
            }}>
              <p style={{
                fontSize: 12, color: '#94A3B8',
                textAlign: 'center', marginBottom: 10, fontWeight: 600
              }}>QUICK DEMO LOGIN</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="demo-btn"
                  onClick={() => setForm({
                    email: 'alex@client.com',
                    password: 'password123'
                  })}>
                  🎬 Client Demo
                </button>
                <button
                  className="demo-btn"
                  onClick={() => setForm({
                    email: 'sofia@editor.com',
                    password: 'password123'
                  })}>
                  ✂️ Editor Demo
                </button>
              </div>
            </div>

            <p style={{
              textAlign: 'center', marginTop: 20,
              fontSize: 14, color: '#64748B'
            }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{
                color: '#6366F1', fontWeight: 700,
                textDecoration: 'none'
              }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;