import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { RequestCard } from './ClientDashboard';

const SKILLS = ['video-editing', 'color-grading', 'motion-graphics', 'sound-design', 'thumbnail-design', 'animation', 'photo-editing'];

export default function EditorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'editor') return navigate('/dashboard/client');
    Promise.all([api.get('/hire'), api.get('/editors/profile/me')])
      .then(([hRes, pRes]) => {
        setRequests(hRes.data);
        setProfile(pRes.data);
        setProfileForm({
          bio: pRes.data.bio || '',
          price: pRes.data.price || '',
          pricingType: pRes.data.pricingType || 'per-project',
          experience: pRes.data.experience || '',
          availability: pRes.data.availability ?? true,
          location: pRes.data.location || '',
          skills: pRes.data.skills || [],
          software: (pRes.data.software || []).join(', '),
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (id, status) => {
    await api.patch(`/hire/${id}/status`, { status });
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const body = {
        ...profileForm,
        software: profileForm.software.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await api.put('/editors/profile', body);
      setProfile(res.data);
      setEditMode(false);
    } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    active: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
    earned: requests.filter(r => r.status === 'completed').reduce((a, r) => a + (r.budget || 0), 0),
  };

  if (loading) return <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9B9AB8' }}>Loading...</p></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#9B9AB8', fontSize: 14 }}>Editor Dashboard</p>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>{user?.name} ✂️</h1>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 36 }}>
          {[
            { label: 'New Requests', value: stats.pending, color: '#F59E0B' },
            { label: 'Active', value: stats.active, color: '#06B6D4' },
            { label: 'Completed', value: stats.completed, color: '#10B981' },
            { label: 'Total Earned', value: `$${stats.earned}`, color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#9B9AB8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sidebar-layout">
          {/* Requests */}
          <div className="main-content">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Hire Requests</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'pending', 'accepted', 'completed', 'rejected'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                  background: tab === t ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: tab === t ? '#9F67FF' : '#9B9AB8', textTransform: 'capitalize'
                }}>{t}</button>
              ))}
            </div>

            {filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ color: '#9B9AB8' }}>No {tab !== 'all' ? tab : ''} requests.</p>
                </div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filtered.map(req => (
                    <RequestCard key={req._id} req={req} role="editor"
                      onAccept={() => updateStatus(req._id, 'accepted')}
                      onReject={() => updateStatus(req._id, 'rejected')}
                      onMessage={() => navigate(`/messages?with=${req.client?._id}`)}
                    />
                  ))}
                </div>
              )}
          </div>

          {/* Profile sidebar */}
          <div className="sidebar">
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Profile</h3>
                <button className={editMode ? 'btn-primary' : 'btn-ghost'} style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={editMode ? saveProfile : () => setEditMode(true)}>
                  {saving ? 'Saving...' : editMode ? 'Save' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div>
                  <PField label="Bio">
                    <textarea className="input" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} />
                  </PField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <PField label="Price ($)">
                      <input className="input" type="number" value={profileForm.price} onChange={e => setProfileForm({ ...profileForm, price: e.target.value })} />
                    </PField>
                    <PField label="Type">
                      <select className="input" value={profileForm.pricingType} onChange={e => setProfileForm({ ...profileForm, pricingType: e.target.value })} style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                        <option value="per-project">Per Project</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </PField>
                  </div>
                  <PField label="Experience (yrs)">
                    <input className="input" type="number" value={profileForm.experience} onChange={e => setProfileForm({ ...profileForm, experience: e.target.value })} />
                  </PField>
                  <PField label="Location">
                    <input className="input" value={profileForm.location} onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} />
                  </PField>
                  <PField label="Software (comma separated)">
                    <input className="input" value={profileForm.software} onChange={e => setProfileForm({ ...profileForm, software: e.target.value })} placeholder="Premiere Pro, After Effects" />
                  </PField>
                  <PField label="Skills">
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                      {SKILLS.map(s => (
                        <button key={s} type="button"
                          onClick={() => setProfileForm(f => ({
                            ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
                          }))}
                          style={{
                            padding: '3px 8px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            background: profileForm.skills.includes(s) ? 'rgba(124,58,237,0.2)' : 'transparent',
                            border: profileForm.skills.includes(s) ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                            color: profileForm.skills.includes(s) ? '#9F67FF' : '#9B9AB8',
                          }}>{s}</button>
                      ))}
                    </div>
                  </PField>
                  <PField label="Availability">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={profileForm.availability}
                        onChange={e => setProfileForm({ ...profileForm, availability: e.target.checked })} />
                      <span style={{ fontSize: 13, color: '#9B9AB8' }}>Available for new projects</span>
                    </label>
                  </PField>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: '#9B9AB8', lineHeight: 1.6, marginBottom: 14 }}>{profile?.bio || 'No bio added yet.'}</p>
                  <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 6 }}>💰 ${profile?.price}/{profile?.pricingType === 'hourly' ? 'hr' : 'project'}</div>
                  <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 6 }}>📍 {profile?.location || 'Remote'}</div>
                  <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 12 }}>⏱ {profile?.experience} years exp</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {profile?.skills?.map(s => <span key={s} className="chip" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {profile?.software?.map(s => <span key={s} className="chip-cyan" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PField({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#9B9AB8', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}