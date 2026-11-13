import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Icon from'../components/Icon';

const SKILLS = ['video-editing', 'color-grading', 'motion-graphics', 'sound-design', 'thumbnail-design', 'animation', 'photo-editing'];

function Stars({ n }) {
  return <span className="stars">{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>;
}

function HireModal({ editor, onClose }) {
  const [form, setForm] = useState({ projectTitle: '', description: '', budget: '', deadline: '', skills: [] });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleSkill = s => setForm(f => ({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }));

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/hire', { editorId: editor.user?._id, ...form });
      setDone(true);
    } catch (err) { alert(err.response?.data?.message || 'Failed to send request'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div className="glass" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: '#10B981', marginBottom: 16 }}><Icon name="check-circle"size={40} /></div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Request Sent!</h3>
            <p style={{ color: '#9B9AB8', marginBottom: 24 }}>Your hire request has been sent to {editor.user?.name}.</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Hire {editor.user?.name}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9B9AB8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={submit}>
              <Field label="Project Title">
                <input className="input" name="projectTitle" placeholder="e.g. YouTube Vlog Edit" value={form.projectTitle} onChange={handle} required />
              </Field>
              <Field label="Description">
                <textarea className="input" name="description" placeholder="Describe your project..." value={form.description} onChange={handle} required rows={3} style={{ resize: 'vertical' }} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <Field label="Budget ($)">
                  <input className="input" name="budget" type="number" placeholder="500" value={form.budget} onChange={handle} />
                </Field>
                <Field label="Deadline">
                  <input className="input" name="deadline" type="date" value={form.deadline} onChange={handle} />
                </Field>
              </div>
              <Field label="Skills Needed">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {SKILLS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        background: form.skills.includes(s) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                        border: form.skills.includes(s) ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                        color: form.skills.includes(s) ? '#9F67FF' : '#9B9AB8',
                      }}>{s}</button>
                  ))}
                </div>
              </Field>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}>
                {loading ? 'Sending...' : 'Send Hire Request →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function BrowseEditors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editors, setEditors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [skill, setSkill]         = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort]           = useState('rating');
  const [hireTarget, setHireTarget] = useState(null);

  const fetchEditors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (minRating) params.minRating = minRating;
      if (sort) params.sort = sort;
      const res = await api.get('/editors', { params });
      setEditors(res.data);
    } catch { setEditors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEditors(); }, [search, skill, minRating, sort]);

  const handleHire = (editor) => {
    if (!user) return navigate('/login');
    if (user.role !== 'client') return alert('Only clients can hire editors.');
    setHireTarget(editor);
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 6 }}>Browse Editors</h1>
          <p style={{ color: '#9B9AB8' }}>Find the perfect editor for your creative project</p>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <input className="input"placeholder="Search by name, bio, or skill..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 500, fontSize: 15 }} />
        </div>

        <div className="sidebar-layout">
          {/* Filters sidebar */}
          <div className="sidebar">
            <div className="glass" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#9B9AB8', textTransform: 'uppercase', letterSpacing: 1 }}>Filters</h4>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 8 }}>Skill</label>
                <select className="input" value={skill} onChange={e => setSkill(e.target.value)}
                  style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                  <option value="">All Skills</option>
                  {SKILLS.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 8 }}>Min Rating</label>
                <select className="input" value={minRating} onChange={e => setMinRating(e.target.value)}
                  style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                  <option value="">Any Rating</option>
                  <option value="4">4★ & above</option>
                  <option value="4.5">4.5★ & above</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 8 }}>Sort By</label>
                <select className="input" value={sort} onChange={e => setSort(e.target.value)}
                  style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </div>

              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setSkill(''); setMinRating(''); setSort('rating'); setSearch(''); }}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Editor grid */}
          <div className="main-content">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="glass" style={{ padding: 24, height: 220 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: '100%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ))}
              </div>
            ) : editors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ color: '#9F67FF', marginBottom: 12 }}><Icon name="search"size={40} /></div>
                <p style={{ color: '#9B9AB8' }}>No editors found. Try different filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {editors.map(editor => (
                  <EditorCard key={editor._id} editor={editor} onHire={handleHire} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hireTarget && <HireModal editor={hireTarget} onClose={() => setHireTarget(null)} />}
    </div>
  );
}

function EditorCard({ editor, onHire }) {
  return (
    <div className="glass" style={{ padding: 20, transition: 'all 0.25s', cursor: 'pointer' }}>
      {/* Avatar + online */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={editor.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editor.user?.name}`}
            alt={editor.user?.name} className="avatar" style={{ width: 52, height: 52 }}
          />
          {editor.availability && (
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 10, height: 10, background: '#10B981',
              borderRadius: '50%', border: '2px solid #0F0F1A'
            }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{editor.user?.name}</div>
          <div style={{ fontSize: 12, color: '#9B9AB8', marginTop: 2 }}>{editor.location || 'Remote'}</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
  {editor.totalReviews === 0 ? (
    <span style={{
      background: 'rgba(6,182,212,0.15)', color: '#06B6D4',
      border: '1px solid rgba(6,182,212,0.3)', borderRadius: 20,
      padding: '2px 8px', fontSize: 11, fontWeight: 600
    }}>New to EditHire</span>
  ) : (
    <>
      <Stars n={editor.averageRating} />
      <span style={{ fontSize: 12, color: '#9B9AB8' }}>{editor.averageRating?.toFixed(1)} ({editor.totalReviews})</span>
    </>
  )}
</div>
        </div>
        <div style={{
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#9F67FF', flexShrink: 0
        }}>
          ${editor.price}<span style={{ fontSize: 10, fontWeight: 400, color: '#9B9AB8' }}>/{editor.pricingType === 'hourly' ? 'hr' : 'proj'}</span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#9B9AB8', lineHeight: 1.5, marginBottom: 12,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {editor.bio}
      </p>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {editor.skills?.slice(0, 3).map(s => <span key={s} className="chip" style={{ fontSize: 11 }}>{s.replace(/-/g,' ')}</span>)}
        {editor.skills?.length > 3 && <span style={{ fontSize: 11, color: '#9B9AB8' }}>+{editor.skills.length - 3}</span>}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Stat label="Projects" value={editor.completedProjects} />
        <Stat label="Response" value={editor.responseTime?.replace('Within ', '')} />
        <Stat label="Exp" value={`${editor.experience}yr`} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/editor/${editor.user?._id}`} style={{ flex: 1, textDecoration: 'none' }}>
          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>View Profile</button>
        </Link>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
          onClick={() => onHire(editor)}>
          Hire Now
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9B9AB8' }}>{label}</div>
    </div>
  );
}
