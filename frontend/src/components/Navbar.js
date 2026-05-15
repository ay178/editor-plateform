import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/editors');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const clientLinks = [
  { to: '/editors', label: '🔍 Browse' },
  { to: '/pricing', label: '💰 Pricing' },
  { to: '/ai-match', label: '🤖 AI Match' },
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/messages', label: '💬 Messages' },
  { to: '/collaboration', label: '🎬 Collaborate' },
  { to: '/wallet', label: '💳 Wallet' },
];
  const editorLinks = [
    { to: '/editors', label: '🔍 Browse' },
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/portfolio', label: '🎞️ Portfolio' },
    { to: '/smart-pricing', label: '💰 Pricing' },
    { to: '/video-scorer', label: '⭐ Score' },
    { to: '/messages', label: '💬 Messages' },
    { to: '/collaboration', label: '🎬 Collaborate' },
    { to: '/wallet', label: '💳 Wallet' },
  ];
const guestLinks = [
  { to: '/', label: '🏠 Home' },
  { to: '/editors', label: '🔍 Browse' },
  { to: '/pricing', label: '💰 Pricing' },
];
  const links = user
    ? user.role === 'editor' ? editorLinks : clientLinks
    : guestLinks;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .user-pill span.name { display: none !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', height: 60
        }}>

          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center',
            gap: 8, textDecoration: 'none', marginRight: 16, flexShrink: 0
          }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: 9, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
            </div>
            <span style={{
              fontWeight: 800, fontSize: 18,
              color: '#0F172A', letterSpacing: '-0.5px'
            }}>
              Edit<span style={{ color: '#6366F1' }}>Hire</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav" style={{
            display: 'flex', gap: 2, flex: 1,
            overflowX: 'auto', scrollbarWidth: 'none'
          }}>
            {links.map(item => (
              <Link key={item.to} to={item.to} style={{
                padding: '7px 10px', borderRadius: 10,
                fontSize: 13, whiteSpace: 'nowrap',
                fontWeight: isActive(item.to) ? 700 : 500,
                color: isActive(item.to) ? '#6366F1' : '#d9373f',
                background: isActive(item.to) ? '#e66119' : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 8, flexShrink: 0, marginLeft: 'auto'
          }}>
            {user && <NotificationBell />}

            {user ? (
              <>
                {/* User Pill */}
                <div className="user-pill" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px 5px 5px',
                  background: 'linear-gradient(135deg, #20b7ee, #4268e6)',
                  borderRadius: 50, border: '1px solid #DDD6FE'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  }}>
                    {user.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="name" style={{
                    fontSize: 13, fontWeight: 600, color: '#374151'
                  }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <span style={{
                    fontSize: 10, background: '#6366F1',
                    color: '#fff', padding: '2px 6px',
                    borderRadius: 20, fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>{user.role}</span>
                </div>

                {/* Desktop Logout */}
                <button
                  className="desktop-nav"
                  onClick={handleLogout}
                  style={{
                    padding: '7px 14px', borderRadius: 10,
                    border: '1.5px solid #E2E8F0', background: '#fff',
                    color: '#64748B', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
                  }}>
                  Logout
                </button>
              </>
            ) : (
              <div className="desktop-nav" style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', background: '#fff',
                  color: '#374151', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600
                }}>Sign In</Link>
                <Link to="/signup" style={{
                  padding: '8px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 700,
                }}>Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none',
                width: 38, height: 38, borderRadius: 10,
                border: '1.5px solid #E2E8F0', background: '#fff',
                cursor: 'pointer', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: 4
              }}>
              <div style={{
                width: 18, height: 2, background: '#374151',
                borderRadius: 2, transition: 'all 0.2s',
                transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none'
              }} />
              <div style={{
                width: 18, height: 2, background: '#374151',
                borderRadius: 2, transition: 'all 0.2s',
                opacity: menuOpen ? 0 : 1
              }} />
              <div style={{
                width: 18, height: 2, background: '#374151',
                borderRadius: 2, transition: 'all 0.2s',
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none'
              }} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{
            borderTop: '1px solid #F1F5F9',
            padding: '12px 16px 16px',
            background: '#fff',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Nav Links */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 8, marginBottom: 12
            }}>
              {links.map(item => (
                <Link key={item.to} to={item.to} style={{
                  padding: '10px 12px', borderRadius: 10,
                  fontSize: 13, fontWeight: isActive(item.to) ? 700 : 500,
                  color: isActive(item.to) ? '#6366F1' : '#374151',
                  background: isActive(item.to) ? '#EEF2FF' : '#F8FAFC',
                  textDecoration: 'none', textAlign: 'center',
                  border: `1px solid ${isActive(item.to) ? '#DDD6FE' : '#E2E8F0'}`
                }}>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <button onClick={handleLogout} style={{
                width: '100%', padding: '11px', borderRadius: 10,
                border: '1.5px solid #FEE2E2', background: '#FEF2F2',
                color: '#B91C1C', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit'
              }}>
                Logout
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', background: '#fff',
                  color: '#374151', textDecoration: 'none',
                  fontSize: 14, fontWeight: 600, textAlign: 'center'
                }}>Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', textDecoration: 'none',
                  fontSize: 14, fontWeight: 700, textAlign: 'center'
                }}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;