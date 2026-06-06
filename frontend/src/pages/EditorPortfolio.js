import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EditorPortfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', type: 'image', thumbnail: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'editor') return navigate('/dashboard/client');
    api.get('/editors/profile/me')
      .then(r => { setProfile(r.data); setPortfolio(r.data.portfolio || []); })
      .finally(() => setLoading(false));
  }, [user]);

  const addItem = async () => {
    if (!form.title || !form.url) return alert('Title and URL required');
    setSaving(true);
    try {
      const updated = [...portfolio, { ...form, thumbnail: form.thumbnail || form.url }];
      const res = await api.put('/editors/profile', { portfolio: updated });
      setPortfolio(res.data.portfolio);
      setForm({ title: '', url: '', type: 'image', thumbnail: '' });
      setShowAdd(false);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const removeItem = async (idx) => {
    if (!window.confirm('Remove this portfolio item?')) return;
    const updated = portfolio.filter((_, i) => i !== idx);
    try {
      const res = await api.put('/editors/profile', { portfolio: updated });
      setPortfolio(res.data.portfolio);
    } catch { alert('Error removing item'); }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9B9AB8' }}>Loading...</p>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>My Portfolio</h1>
            <p style={{ color: '#9B9AB8', marginTop: 4 }}>Showcase your best work to attract clients</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Work</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Portfolio Items', value: portfolio.length },
            { label: 'Completed Projects', value: profile?.completedProjects || 0 },
            { label: 'Avg Rating', value: `${profile?.averageRating?.toFixed(1) || 0}★` },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '14px 24px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#9F67FF' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9B9AB8', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Portfolio grid */}
        {portfolio.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No portfolio items yet</h3>
            <p style={{ color: '#9B9AB8', marginBottom: 24 }}>Add your best work to attract more clients</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Your First Work</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {portfolio.map((item, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', position: 'relative', group: true }}>
                <div style={{ position: 'relative' }}>
                  <img src={item.thumbnail || item.url} alt={item.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <button onClick={() => removeItem(i)} style={{
                      background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff',
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600
                    }}>🗑 Remove</button>
                  </div>
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: 6, fontSize: 11, color: '#fff'
                  }}>{item.type}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#06B6D4', textDecoration: 'none', marginTop: 4, display: 'block',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAdd(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: 480, padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Add Portfolio Item</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#9B9AB8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {[
              { name: 'title', label: 'Title', placeholder: 'e.g. Brand Commercial' },
              { name: 'url', label: 'URL / Link', placeholder: 'https://...' },
              { name: 'thumbnail', label: 'Thumbnail URL (optional)', placeholder: 'https://... (image preview)' },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input className="input" placeholder={f.placeholder}
                  value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />
              </div>
            ))}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['image', 'video', 'link'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                      background: form.type === t ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.type === t ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                      color: form.type === t ? '#9F67FF' : '#9B9AB8', textTransform: 'capitalize'
                    }}>{t === 'image' ? '🖼 Image' : t === 'video' ? '🎬 Video' : '🔗 Link'}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={addItem} disabled={saving}
              style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              {saving ? 'Adding...' : 'Add to Portfolio →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
