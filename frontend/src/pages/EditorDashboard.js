import ProjectFiles from '../components/ProjectFiles';
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
  const [wallet, setWallet]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('requests');
  const [reqFilter, setReqFilter] = useState('all');
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'editor') return navigate('/dashboard/client');
    Promise.all([
      api.get('/hire'),
      api.get('/editors/profile/me'),
      api.get('/payment/wallet').catch(() => null),
    ]).then(([hRes, pRes, wRes]) => {
      setRequests(hRes.data);
      setProfile(pRes.data);
      if (wRes) setWallet(wRes.data);
      setProfileForm({
        bio: pRes.data.bio || '',
        price: pRes.data.price || '',
        pricingType: pRes.data.pricingType || 'per-project',
        experience: pRes.data.experience || '',
        availability: pRes.data.availability ?? true,
        location: pRes.data.location || '',
        skills: pRes.data.skills || [],
        software: (pRes.data.software || []).join(', '),
        responseTime: pRes.data.responseTime || 'Within 24 hours',
      });
    }).finally(() => setLoading(false));
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

  const filtered = reqFilter === 'all' ? requests : requests.filter(r => r.status === reqFilter);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    active: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
    earned: requests.filter(r => r.status === 'completed').reduce((a, r) => a + (r.budget || 0), 0),
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9B9AB8' }}>Loading...</p>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #7C3AED' }}
          />
          <div>
            <p style={{ color: '#9B9AB8', fontSize: 13 }}>Editor Dashboard</p>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{user?.name}</h1>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className={profile?.availability ? 'chip-cyan' : 'chip'}>
              {profile?.availability ? '🟢 Available' : '🔴 Unavailable'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
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

        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
          {[
            { id: 'requests', label: '📋 Hire Requests' },
            { id: 'profile', label: '👤 My Profile' },
            { id: 'wallet', label: '💰 Wallet' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
              background: tab === t.id ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: tab === t.id ? '#9F67FF' : '#9B9AB8',
              transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>

        {/* REQUESTS TAB */}
        {tab === 'requests' && (
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'pending', 'accepted', 'completed', 'rejected'].map(t => (
                <button key={t} onClick={() => setReqFilter(t)} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                  background: reqFilter === t ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                  color: reqFilter === t ? '#9F67FF' : '#9B9AB8', textTransform: 'capitalize'
                }}>{t}</button>
              ))}
            </div>
            {filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ color: '#9B9AB8' }}>No {reqFilter !== 'all' ? reqFilter : ''} requests yet.</p>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filtered.map(req => (
                    <RequestCard key={req._id} req={req} role="editor"
                      onAccept={() => updateStatus(req._id, 'accepted')}
                      onReject={() => updateStatus(req._id, 'rejected')}
                      onMessage={() => navigate(`/messages?with=${req.client?._id}`)}
                    />
                  ))}
                </div>
            }
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 700 }}>
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Profile</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editMode && (
                    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}
                      onClick={() => setEditMode(false)}>Cancel</button>
                  )}
                  <button className={editMode ? 'btn-primary' : 'btn-ghost'}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                    onClick={editMode ? saveProfile : () => setEditMode(true)}>
                    {saving ? 'Saving...' : editMode ? '💾 Save Changes' : '✏️ Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #7C3AED' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
                  <div style={{ color: '#9B9AB8', fontSize: 13 }}>{user?.email}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span className="chip" style={{ fontSize: 11 }}>Editor</span>
                    {profile?.availability
                      ? <span className="chip-cyan" style={{ fontSize: 11 }}>Available</span>
                      : <span className="chip" style={{ fontSize: 11, color: '#9CA3AF' }}>Unavailable</span>}
                  </div>
                </div>
              </div>

              {editMode ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
                    <PField label="Price ($)">
                      <input className="input" type="number" value={profileForm.price}
                        onChange={e => setProfileForm({ ...profileForm, price: e.target.value })} />
                    </PField>
                    <PField label="Pricing Type">
                      <select className="input" value={profileForm.pricingType}
                        onChange={e => setProfileForm({ ...profileForm, pricingType: e.target.value })}
                        style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                        <option value="per-project">Per Project</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </PField>
                    <PField label="Experience (years)">
                      <input className="input" type="number" value={profileForm.experience}
                        onChange={e => setProfileForm({ ...profileForm, experience: e.target.value })} />
                    </PField>
                    <PField label="Location">
                      <input className="input" value={profileForm.location}
                        onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="e.g. Mumbai, India" />
                    </PField>
                  </div>
                  <PField label="Bio">
                    <textarea className="input" value={profileForm.bio}
                      onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4} placeholder="Tell clients about yourself..." />
                  </PField>
                  <PField label="Response Time">
                    <select className="input" value={profileForm.responseTime}
                      onChange={e => setProfileForm({ ...profileForm, responseTime: e.target.value })}
                      style={{ background: '#1A1A2E', color: '#F1F0FF' }}>
                      <option>Within 1 hour</option>
                      <option>Within 2 hours</option>
                      <option>Within 4 hours</option>
                      <option>Within 6 hours</option>
                      <option>Within 12 hours</option>
                      <option>Within 24 hours</option>
                    </select>
                  </PField>
                  <PField label="Software (comma separated)">
                    <input className="input" value={profileForm.software}
                      onChange={e => setProfileForm({ ...profileForm, software: e.target.value })}
                      placeholder="Premiere Pro, After Effects, DaVinci Resolve" />
                  </PField>
                  <PField label="Skills">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {SKILLS.map(s => (
                        <button key={s} type="button"
                          onClick={() => setProfileForm(f => ({
                            ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
                          }))}
                          style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            background: profileForm.skills.includes(s) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                            border: profileForm.skills.includes(s) ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                            color: profileForm.skills.includes(s) ? '#9F67FF' : '#9B9AB8',
                          }}>{s.replace(/-/g, ' ')}</button>
                      ))}
                    </div>
                  </PField>
                  <PField label="Availability">
                    <div onClick={() => setProfileForm({ ...profileForm, availability: !profileForm.availability })}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <div style={{
                        width: 44, height: 24, borderRadius: 12, position: 'relative',
                        background: profileForm.availability ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s', flexShrink: 0
                      }}>
                        <div style={{
                          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', left: profileForm.availability ? 22 : 2
                        }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#9B9AB8' }}>
                        {profileForm.availability ? 'Available for new projects' : 'Not available'}
                      </span>
                    </div>
                  </PField>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <InfoRow icon="💰" label="Rate" value={`$${profile?.price}/${profile?.pricingType === 'hourly' ? 'hr' : 'project'}`} />
                    <InfoRow icon="📍" label="Location" value={profile?.location || 'Not set'} />
                    <InfoRow icon="⏱" label="Experience" value={`${profile?.experience} years`} />
                    <InfoRow icon="⚡" label="Response Time" value={profile?.responseTime} />
                    <InfoRow icon="⭐" label="Rating" value={`${profile?.averageRating?.toFixed(1)} (${profile?.totalReviews} reviews)`} />
                    <InfoRow icon="✅" label="Completed" value={`${profile?.completedProjects} projects`} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 6 }}>Bio</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7 }}>{profile?.bio || 'No bio added yet.'}</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>Skills</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {profile?.skills?.map(s => <span key={s} className="chip">{s.replace(/-/g, ' ')}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>Software</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {profile?.software?.map(s => <span key={s} className="chip-cyan">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WALLET TAB */}
        {tab === 'wallet' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Available Balance', value: `$${wallet?.balance?.toFixed(2) || '0.00'}`, color: '#10B981' },
                { label: 'In Escrow', value: `$${wallet?.escrowBalance?.toFixed(2) || '0.00'}`, color: '#F59E0B' },
                { label: 'Total Earned', value: `$${wallet?.totalEarned?.toFixed(2) || stats.earned.toFixed(2)}`, color: '#7C3AED' },
              ].map(c => (
                <div key={c.label} className="glass" style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Transaction History</h3>
              {!wallet || wallet?.transactions?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                  <p style={{ color: '#9B9AB8' }}>No transactions yet.</p>
                  <p style={{ color: '#5C5B7A', fontSize: 13, marginTop: 4 }}>Complete projects to earn!</p>
                </div>
              ) : wallet.transactions.map((tx, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: ['deposit','escrow_release'].includes(tx.type) ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
                    }}>
                      {['deposit','escrow_release'].includes(tx.type) ? '⬇️' : '⬆️'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
                        {tx.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: 12, color: '#9B9AB8' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 700,
                    color: ['deposit','escrow_release'].includes(tx.type) ? '#10B981' : '#EF4444'
                  }}>
                    {['deposit','escrow_release'].includes(tx.type) ? '+' : '-'}${tx.amount}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Earnings from Projects</h3>
              {requests.filter(r => r.status === 'completed').length === 0
                ? <p style={{ color: '#9B9AB8', fontSize: 14 }}>No completed projects yet.</p>
                : requests.filter(r => r.status === 'completed').map(req => (
                  <div key={req._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{req.projectTitle}</div>
                      <div style={{ fontSize: 12, color: '#9B9AB8' }}>{req.client?.name}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>+${req.budget || 0}</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, color: '#9B9AB8' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{value || 'Not set'}</div>
      </div>
    </div>
  );
}
