import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Saare fields bharo'); return;
    }
    if (form.password.length < 6) {
      setError('Password 6+ characters ka hona chahiye'); return;
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
            Aaj hi join karo!
          </p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 32,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
            Account Banao
          </h2>

          {error && (
            <div style={{
              background: '#FEF2F2', color: '#B91C1C', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, marginBottom: 16
            }}>{error}</div>
          )}

          {/* Role Picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: '#374151',
              display: 'block', marginBottom: 8
            }}>Main hoon...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['client', '🎬', 'Client', 'Editor hire karna chahta hun'],
                ['editor', '✂️', 'Editor', 'Kaam dhundhna chahta hun'],
              ].map(([r, icon, label, sub]) => (
                <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))} style={{
                  padding: '14px 10px', borderRadius: 12,
                  border: `2px solid ${form.role === r ? '#6366F1' : '#E2E8F0'}`,
                  background: form.role === r ? '#EEF2FF' : '#fff',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: form.role === r ? '#6366F1' : '#0F172A'
                  }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Tumhara naam"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          {/* Email */}
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
            {loading ? 'Account ban raha hai...' : 'Account Banao'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748B' }}>
            Pehle se account hai?{' '}
            <Link to="/login" style={{ color: '#6366F1', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;