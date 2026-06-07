import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    api.get(`/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 20px' }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '4px solid rgba(124,58,237,0.2)',
              borderTop: '4px solid #7C3AED',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Verifying your email...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <div className="glass" style={{ padding: 40, maxWidth: 420 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: '#9B9AB8', marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
            <Link to="/login">
              <button className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
                Login Now →
              </button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="glass" style={{ padding: 40, maxWidth: 420 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: '#9B9AB8', marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
            <Link to="/signup">
              <button className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
                Sign Up Again →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}