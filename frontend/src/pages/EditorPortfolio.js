import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Stars({ n }) {
  return <span className="stars">{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>;
}

export default function EditorProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHire, setShowHire] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, r] = await Promise.all([
          api.get(`/editors/${userId}`),
          api.get(`/review/editor/${userId}`),
        ]);
        setProfile(p.data);
        setReviews(r.data);
      } catch { navigate('/browse'); }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ color: '#9B9AB8' }}>Loading profile...</div>
    </div>
  );

  if (!profile) return null;
  const ed = profile;

  return (
    <div className="page">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 0 32px'
      }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={ed.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ed.user?.name}`}
                alt={ed.user?.name}
                style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #7C3AED' }}
              />
              {ed.availability && (
                <div style={{
                  position: 'absolute', bottom: 4, right: 4,
                  width: 14, height: 14, background: '#10B981',
                  borderRadius: '50%', border: '2px solid #0F0F1A'
                }} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 30, fontWeight: 700 }}>{ed.user?.name}</h1>
                {ed.availability
                  ? <span className="chip-cyan">Available Now</span>
                  : <span style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF', border: '1px solid rgba(156,163,175,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>Unavailable</span>}
              </div>
              <p style={{ color: '#9B9AB8', marginTop: 4 }}>{ed.location || 'Remote'} · {ed.experience} years exp · Responds {ed.responseTime?.toLowerCase()}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Stars n={ed.averageRating} />
                <span style={{ fontWeight: 600 }}>{ed.averageRating?.toFixed(1)}</span>
                <span style={{ color: '#9B9AB8', fontSize: 14 }}>({ed.totalReviews} reviews)</span>
              </div>
            </div>

            {/* Price + hire */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#9F67FF' }}>
                ${ed.price}
                <span style={{ fontSize: 14, color: '#9B9AB8', fontWeight: 400 }}>/{ed.pricingType === 'hourly' ? 'hr' : 'project'}</span>
              </div>
              {user?.role === 'client' && (
                <button className="btn-primary" style={{ marginTop: 12, padding: '12px 28px' }} onClick={() => setShowHire(true)}>
                  Hire Now →
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              ['Completed Projects', ed.completedProjects],
              ['Total Reviews', ed.totalReviews],
              ['Experience', `${ed.experience} years`],
              ['Avg Rating', `${ed.averageRating?.toFixed(1)} ★`],
            ].map(([k, v]) => (
              <div key={k} className="glass" style={{ padding: '14px 20px', textAlign: 'center', flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#9F67FF' }}>{v}</div>
                <div style={{ fontSize: 12, color: '#9B9AB8', marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'flex-start' }}>

          {/* Left */}
          <div>
            {/* Bio */}
            <Section title="About">
              <p style={{ color: '#9B9AB8', lineHeight: 1.7 }}>{ed.bio || 'No bio provided.'}</p>
            </Section>

            {/* Portfolio */}
            {ed.portfolio?.length > 0 && (
              <Section title="Portfolio">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {ed.portfolio.map((item, i) => (
                    <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={item.thumbnail || item.url} alt={item.title}
                        style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '8px 10px', fontSize: 13, color: '#9B9AB8' }}>{item.title}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Reviews */}
            <Section title={`Reviews (${reviews.length})`}>
              {reviews.length === 0
                ? <p style={{ color: '#9B9AB8' }}>No reviews yet.</p>
                : reviews.map(r => (
                  <div key={r._id} style={{ padding: 16, marginBottom: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.client?.name}</span>
                      <Stars n={r.rating} />
                    </div>
                    <p style={{ color: '#9B9AB8', fontSize: 14, lineHeight: 1.5 }}>{r.comment}</p>
                  </div>
                ))}
            </Section>
          </div>

          {/* Sidebar */}
          <div>
            <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#9B9AB8' }}>SKILLS</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ed.skills?.map(s => <span key={s} className="chip">{s.replace(/-/g, ' ')}</span>)}
              </div>
            </div>

            <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#9B9AB8' }}>SOFTWARE</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ed.software?.map(s => <span key={s} className="chip-cyan" style={{ fontSize: 12 }}>{s}</span>)}
              </div>
            </div>

            {user && user._id !== userId && (
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/messages?with=${userId}`)}>
                💬 Send Message
              </button>
            )}
          </div>
        </div>
      </div>

      {showHire && <HireModalInline editorId={ed.user?._id} editorName={ed.user?.name} onClose={() => setShowHire(false)} />}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{title}</h3>
      {children}
    </div>
  );
}

function HireModalInline({ editorId, editorName, onClose }) {
  const [form, setForm] = useState({ projectTitle: '', description: '', budget: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/hire', { editorId, ...form }); setDone(true); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="glass" style={{ width: '100%', maxWidth: 500, padding: 32 }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Request Sent!</h3>
            <p style={{ color: '#9B9AB8', marginBottom: 20 }}>Request sent to {editorName}.</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Hire {editorName}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9B9AB8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={submit}>
              {[['projectTitle','Project Title','e.g. YouTube Vlog'],['description','Description','What do you need?'],['budget','Budget ($)','500'],['deadline','Deadline','']].map(([name, label, ph]) => (
                <div key={name} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>{label}</label>
                  {name === 'description'
                    ? <textarea className="input" name={name} placeholder={ph} value={form[name]} onChange={handle} rows={3} />
                    : <input className="input" name={name} type={name === 'deadline' ? 'date' : name === 'budget' ? 'number' : 'text'} placeholder={ph} value={form[name]} onChange={handle} required={name !== 'budget' && name !== 'deadline'} />
                  }
                </div>
              ))}
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                {loading ? 'Sending...' : 'Send Request →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}