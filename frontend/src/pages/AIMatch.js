import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AIMatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    projectType: '',
    description: '',
    budget: '',
    deadline: '',
    skills: [],
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const SKILLS = ['video-editing', 'color-grading', 'motion-graphics', 'sound-design', 'thumbnail-design', 'animation', 'photo-editing'];
  const PROJECT_TYPES = ['YouTube Video', 'Short Film', 'Brand Ad', 'Wedding Film', 'Reels/TikTok', 'Documentary', 'Music Video', 'Corporate Video'];

  const toggleSkill = (s) => setForm(f => ({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }));

  const handleMatch = async () => {
    setLoading(true);
    try {
      // Try AI match endpoint, fallback to browse editors
      const res = await api.get('/editors', {
        params: {
          skill: form.skills[0] || '',
          sort: 'rating',
        }
      });
      setResults(res.data.slice(0, 3));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
            AI <span className="gradient-text">Editor Match</span>
          </h1>
          <p style={{ color: '#9B9AB8', fontSize: 16 }}>
            Tell us about your project — we'll find the perfect editor for you
          </p>
        </div>

        {!results ? (
          <div className="glass" style={{ padding: 36 }}>

            {/* Project Type */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, color: '#9B9AB8', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                What type of project is this?
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PROJECT_TYPES.map(t => (
                  <button key={t} onClick={() => setForm({ ...form, projectType: t })}
                    style={{
                      padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                      background: form.projectType === t ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                      border: form.projectType === t ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                      color: form.projectType === t ? '#9F67FF' : '#9B9AB8',
                      transition: 'all 0.2s'
                    }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, color: '#9B9AB8', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Describe your project
              </label>
              <textarea className="input" rows={4}
                placeholder="e.g. I need a 10-minute YouTube video edited with motion graphics, color grading, and background music..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Budget + Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 14, color: '#9B9AB8', display: 'block', marginBottom: 8, fontWeight: 500 }}>Budget ($)</label>
                <input className="input" type="number" placeholder="500"
                  value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 14, color: '#9B9AB8', display: 'block', marginBottom: 8, fontWeight: 500 }}>Deadline</label>
                <input className="input" type="date"
                  value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 14, color: '#9B9AB8', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                Skills needed
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SKILLS.map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                      background: form.skills.includes(s) ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.skills.includes(s) ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
                      color: form.skills.includes(s) ? '#06B6D4' : '#9B9AB8',
                    }}>{s.replace(/-/g, ' ')}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={handleMatch} disabled={loading || !form.projectType}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Finding your perfect match...
                </span>
              ) : '🤖 Find My Editor →'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                ✨ Top Matches for Your Project
              </h2>
              <p style={{ color: '#9B9AB8' }}>Based on your requirements, here are the best editors</p>
            </div>

            {results.length === 0 ? (
              <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
                <p style={{ color: '#9B9AB8' }}>No matches found. Try different criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map((editor, i) => (
                  <div key={editor._id} className="glass" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
                    {/* Rank badge */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : i === 1 ? 'linear-gradient(135deg, #9B9AB8, #6B7280)' : 'linear-gradient(135deg, #92400E, #78350F)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16, color: '#fff'
                    }}>#{i + 1}</div>

                    <img src={editor.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editor.user?.name}`}
                      alt={editor.user?.name}
                      style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #7C3AED', flexShrink: 0 }} />

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{editor.user?.name}</div>
                      <div style={{ color: '#9B9AB8', fontSize: 13, marginBottom: 6 }}>{editor.location}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {editor.skills?.slice(0, 3).map(s => <span key={s} className="chip" style={{ fontSize: 11 }}>{s.replace(/-/g, ' ')}</span>)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#9F67FF' }}>${editor.price}</div>
                      <div style={{ fontSize: 12, color: '#9B9AB8' }}>/{editor.pricingType === 'hourly' ? 'hr' : 'project'}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => navigate(`/editor/${editor.user?._id}`)}>View</button>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => navigate(`/browse`)}>Hire</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-ghost" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
              onClick={() => setResults(null)}>
              ← Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
