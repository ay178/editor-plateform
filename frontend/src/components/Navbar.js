import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(15,15,26,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    height: '64px',
    display: 'flex', alignItems: 'center',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff'
          }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#F1F0FF' }}>Edit<span style={{ color: '#7C3AED' }}>Hire</span></span>
        </Link>

        {/* Center links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <NavLink to="/browse" active={isActive('/browse')} label="Browse Editors" />
          {user && (
            <NavLink
              to={user.role === 'client' ? '/dashboard/client' : '/dashboard/editor'}
              active={location.pathname.startsWith('/dashboard')}
              label="Dashboard"
            />
          )}
          {user && <NavLink to="/messages" active={isActive('/messages')} label="Messages" />}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setMenuOpen(!menuOpen)}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #7C3AED' }}
                />
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 44,
                    background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: 8, width: 180,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#9B9AB8', textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                    <button onClick={handleLogout} style={{
                      width: '100%', background: 'none', border: 'none',
                      color: '#EF4444', padding: '8px 12px', textAlign: 'left',
                      cursor: 'pointer', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif'
                    }}>Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login"><button className="btn-ghost" style={{ padding: '8px 16px' }}>Sign In</button></Link>
              <Link to="/signup"><button className="btn-primary" style={{ padding: '8px 16px' }}>Get Started</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <span style={{
        padding: '6px 14px', borderRadius: 8,
        fontSize: 14, fontWeight: 500,
        color: active ? '#7C3AED' : '#9B9AB8',
        background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
        transition: 'all 0.2s',
        display: 'block'
      }}>{label}</span>
    </Link>
  );
}