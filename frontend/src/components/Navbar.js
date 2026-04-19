import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/editors');
  };

  const isActive = (path) => location.pathname === path;

  const clientLinks = [
    { to: '/editors', label: '🔍 Browse Editors' },
    { to: '/ai-match', label: '🤖 AI Match' },
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/messages', label: '💬 Messages' },
    { to: '/collaboration', label: '🎬 Collaborate' },
  ];

  const editorLinks = [
    { to: '/editors', label: '🔍 Browse' },
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/portfolio', label: '🎞️ Portfolio' },
    { to: '/smart-pricing', label: '💰 Pricing' },
    { to: '/video-scorer', label: '⭐ Score Video' },
    { to: '/messages', label: '💬 Messages' },
    { to: '/collaboration', label: '🎬 Collaborate' },
  ];

  const guestLinks = [
    { to: '/editors', label: '🔍 Browse Editors' },
  ];

  const links = user
    ? user.role === 'editor' ? editorLinks : clientLinks
    : guestLinks;

  return (
    <nav style={{
      background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 64
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center',
          gap: 10, textDecoration: 'none',
          marginRight: 28, flexShrink: 0
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 800, fontSize: 20,
            color: '#0F172A', letterSpacing: '-0.5px'
          }}>
            Edit<span style={{ color: '#6366F1' }}>Hire</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{
          display: 'flex', gap: 2, flex: 1,
          overflowX: 'auto', scrollbarWidth: 'none'
        }}>
          {links.map(item => (
            <Link key={item.to} to={item.to} style={{
              padding: '7px 12px', borderRadius: 10,
              fontSize: 13, whiteSpace: 'nowrap',
              fontWeight: isActive(item.to) ? 700 : 500,
              color: isActive(item.to) ? '#6366F1' : '#64748B',
              background: isActive(item.to) ? '#EEF2FF' : 'transparent',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                if (!isActive(item.to)) {
                  e.currentTarget.style.color = '#6366F1';
                  e.currentTarget.style.background = '#F5F3FF';
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.to)) {
                  e.currentTarget.style.color = '#64748B';
                  e.currentTarget.style.background = 'transparent';
                }
              }}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 10, flexShrink: 0
        }}>
          {user && <NotificationBell />}

          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px 5px 5px',
                background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)',
                borderRadius: 50, border: '1px solid #DDD6FE'
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
                }}>
                  {user.name?.slice(0, 2).toUpperCase()}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: '#374151'
                }}>
                  {user.name?.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: 10, background: '#6366F1',
                  color: '#fff', padding: '2px 8px',
                  borderRadius: 20, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{user.role}</span>
              </div>

              <button onClick={handleLogout} style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', background: '#fff',
                color: '#64748B', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s', fontFamily: 'inherit'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.color = '#EF4444';
                  e.currentTarget.style.background = '#FEF2F2';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#64748B';
                  e.currentTarget.style.background = '#fff';
                }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', background: '#fff',
                color: '#374151', textDecoration: 'none',
                fontSize: 13, fontWeight: 600
              }}>Sign In</Link>
              <Link to="/signup" style={{
                padding: '8px 18px', borderRadius: 10,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff', textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
              }}>Sign Up ✦</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;