import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/editors');
  };

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #E2E8F0',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 64
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', marginRight: 32
        }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>EditHire</span>
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          <Link to="/editors" style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 14,
            fontWeight: 500, color: '#64748B', textDecoration: 'none'
          }}>Browse Editors</Link>

          {user && (
            <>
              <Link to="/dashboard" style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 14,
                fontWeight: 500, color: '#64748B', textDecoration: 'none'
              }}>Dashboard</Link>
              <Link to="/messages" style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 14,
                fontWeight: 500, color: '#64748B', textDecoration: 'none'
              }}>Messages</Link>
              {user?.role === 'editor' && (
                <Link to="/portfolio" style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 14,
                  fontWeight: 500, color: '#64748B', textDecoration: 'none'
                }}>My Portfolio</Link>
              )}
            </>
          )}
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', background: '#F8FAFC', borderRadius: 10
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#6366F1', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600
              }}>
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                {user.name?.split(' ')[0]}
              </span>
              <span style={{
                fontSize: 11, background: '#EEF2FF', color: '#6366F1',
                padding: '2px 7px', borderRadius: 20, fontWeight: 700
              }}>{user.role}</span>
            </div>
            <button onClick={handleLogout} style={{
              padding: '7px 14px', borderRadius: 9, border: '1.5px solid #E2E8F0',
              background: '#fff', color: '#64748B', cursor: 'pointer',
              fontSize: 13, fontWeight: 600
            }}>Logout</button>
          </div>
        ) : (
          <Link to="/login" style={{
            padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700
          }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;