import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

// Left sidebar on desktop; on phones it becomes a slim top bar with a hamburger
// that slides the same menu in from the left. Layout rules live in index.css
// (.sidebar, .topbar, .sidebar-overlay and body.with-sidebar).
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { setOpen(false); logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  // Reserve room for the sidebar on desktop.
  useEffect(() => {
    document.body.classList.add('with-sidebar');
    return () => document.body.classList.remove('with-sidebar');
  }, []);

  // Close the drawer after navigating.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Escape closes the drawer; stop the page scrolling behind it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  const links = [{ to: '/browse', label: 'Browse Editors', icon: 'search' }];
  if (user?.role === 'client') links.push(
    { to: '/dashboard/client', label: 'Dashboard', icon: 'clipboard' },
    { to: '/ai-match', label: 'AI Match', icon: 'bot' },
    { to: '/wallet', label: 'Wallet', icon: 'wallet' }
  );
  if (user?.role === 'editor') links.push(
    { to: '/dashboard/editor', label: 'Dashboard', icon: 'clipboard' },
    { to: '/portfolio', label: 'Portfolio', icon: 'film' },
    { to: '/smart-pricing', label: 'Smart Pricing', icon: 'bulb' },
    { to: '/wallet', label: 'Wallet', icon: 'wallet' }
  );
  if (user) links.push(
    { to: '/messages', label: 'Messages', icon: 'message' },
    { to: '/video-scorer', label: 'Video Scorer', icon: 'sparkles' },
    { to: '/collab', label: 'Collaboration', icon: 'users' },
    { to: '/subscription', label: 'Go Pro', icon: 'star' }
  );

  const Logo = ({ onClick }) => (
    <Link to="/" onClick={onClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src="/logo192.png" alt="EditHire" style={{ width: 30, height: 30, objectFit: 'contain' }} />
      <span style={{ fontWeight: 700, fontSize: 18, color: '#F1F0FF' }}>Edit<span style={{ color: '#7C3AED' }}>Hire</span></span>
    </Link>
  );

  return (
    <>
      {/* Phone top bar */}
      <header className="topbar">
        <button className="topbar-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Icon name="menu" size={22} />
        </button>
        <Logo />
      </header>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 18px' }}>
          <Logo />
          <button className="topbar-btn sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {links.map(l => (
            <Link key={l.to + l.label} to={l.to} className={`side-link${isActive(l.to) ? ' active' : ''}`}>
              <Icon name={l.icon} size={18} />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 12 }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 12px' }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #7C3AED', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F0FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: '#9B9AB8', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>
              <button className="side-link" onClick={handleLogout}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontFamily: 'inherit' }}>
                <Icon name="logout" size={18} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
              <Link to="/login"><button className="btn-ghost" style={{ width: '100%', padding: '9px 16px' }}>Sign In</button></Link>
              <Link to="/signup"><button className="btn-primary" style={{ width: '100%', padding: '9px 16px' }}>Get Started</button></Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
