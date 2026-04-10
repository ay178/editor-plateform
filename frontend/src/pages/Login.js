import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'editor' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 50, padding: '10px 20px'
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>✂️ EditHire</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '12px 0 0', fontSize: 15 }}>
            Welcome back!
          </p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 32,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
            Sign In
          </h2>

          {error && (
            <div style={{
              background: '#FEF2F2', color: '#B91C1C', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, marginBottom: 16
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
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none'
              }}
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
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: 13, borderRadius: 12, border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo accounts */}
          <div style={{
            marginTop: 20, borderTop: '1px solid #F1F5F9', paddingTop: 16
          }}>
            <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
              Quick demo login:
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Client', email: 'alex@client.com', password: 'password123' },
                { label: 'Editor', email: 'sofia@editor.com', password: 'password123' },
              ].map(acc => (
                <button
                  key={acc.email}
                  onClick={() => setForm({ email: acc.email, password: acc.password })}
                  style={{
                    flex: 1, padding: 8, borderRadius: 8,
                    border: '1px solid #E2E8F0', background: '#F8FAFC',
                    cursor: 'pointer', fontSize: 12, color: '#475569', fontWeight: 500
                  }}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748B' }}>
            Account nahi hai?{' '}
            <Link to="/signup" style={{ color: '#6366F1', fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;