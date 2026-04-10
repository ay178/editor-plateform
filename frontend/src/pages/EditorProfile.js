import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
        stroke="#F59E0B" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </span>
);

const SKILL_LABELS = {
  'video-editing': 'Video Editing',
  'photo-editing': 'Photo Editing',
  'thumbnail-design': 'Thumbnail Design',
  'color-grading': 'Color Grading',
  'motion-graphics': 'Motion Graphics',
  'sound-design': 'Sound Design',
  'animation': 'Animation',
};

const EditorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hireModal, setHireModal] = useState(false);
  const [hireForm, setHireForm] = useState({
    projectTitle: '', description: '', budget: '', deadline: ''
  });
  const [hireSent, setHireSent] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/editors/${id}`);
      setProfile(data.profile);
      setReviews(data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHireSubmit = async () => {
    if (!hireForm.projectTitle || !hireForm.description) {
      alert('Title aur description bharo'); return;
    }
    try {
      await API.post('/hire', {
        editorId: id,
        ...hireForm,
        budget: Number(hireForm.budget)
      });
      setHireSent(true);
      setTimeout(() => {
        setHireModal(false);
        setHireSent(false);
        setHireForm({ projectTitle: '', description: '', budget: '', deadline: '' });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error aaya');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid #E2E8F0',
        borderTopColor: '#6366F1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>Editor nahi mila</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

      {/* Back Button */}
      <button onClick={() => navigate('/editors')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6366F1', fontWeight: 600, fontSize: 14,
        marginBottom: 24, padding: 0
      }}>
        ← Browse pe wapas jao
      </button>

      {/* Hero Card */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 20, padding: 28, marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start'
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#6366F1', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 28, flexShrink: 0
        }}>
          {profile.user?.name?.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 800,
              color: '#0F172A', letterSpacing: '-0.5px'
            }}>{profile.user?.name}</h1>
            <span style={{
              background: profile.availability ? '#DCFCE7' : '#FEE2E2',
              color: profile.availability ? '#16A34A' : '#DC2626',
              borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700
            }}>
              {profile.availability ? 'Available' : 'Busy'}
            </span>
          </div>
          <p style={{ color: '#64748B', margin: '4px 0 12px', fontSize: 14 }}>
            {profile.location} · {profile.experience} saal ka experience
          </p>

          {/* Skills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {profile.skills?.map(s => (
              <span key={s} style={{
                background: '#EEF2FF', color: '#4338CA',
                padding: '4px 10px', borderRadius: 20,
                fontSize: 12, fontWeight: 500
              }}>{SKILL_LABELS[s] || s}</span>
            ))}
          </div>

          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            {profile.bio}
          </p>
        </div>

        {/* Price + Buttons */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: 10, minWidth: 180, alignItems: 'flex-end'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#6366F1' }}>
              ${profile.price}
              <span style={{ fontSize: 14, fontWeight: 400, color: '#94A3B8' }}>
                /{profile.pricingType === 'hourly' ? 'hour' : 'project'}
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              justifyContent: 'flex-end', marginTop: 4
            }}>
              <StarRating rating={profile.averageRating} size={16} />
              <span style={{ fontWeight: 700, color: '#0F172A' }}>
                {profile.averageRating}
              </span>
              <span style={{ color: '#94A3B8', fontSize: 13 }}>
                ({profile.totalReviews})
              </span>
            </div>
          </div>

          {(!user || user.role === 'client') && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate(`/messages/${id}`)}
                style={{
                  padding: '10px 18px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', background: '#fff',
                  color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 600
                }}>Message</button>
              <button
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setHireModal(true);
                }}
                style={{
                  padding: '10px 22px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
                }}>Hire Now</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 14, marginBottom: 20
      }}>
        {[
          { label: 'Projects Done', value: profile.completedProjects },
          { label: 'Response Time', value: profile.responseTime },
          { label: 'Reviews', value: profile.totalReviews },
          { label: 'Experience', value: `${profile.experience} yrs` },
        ].map(s => (
          <div key={s.label} style={{
            background: '#F8FAFC', borderRadius: 14,
            padding: '16px 18px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Software */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 16, padding: '20px 24px', marginBottom: 20
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
          Software & Tools
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profile.software?.map(sw => (
            <span key={sw} style={{
              background: '#F1F5F9', color: '#475569',
              padding: '6px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 500
            }}>{sw}</span>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      {profile.portfolio?.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '20px 24px', marginBottom: 20
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
            Portfolio
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14
          }}>
            {profile.portfolio.map((item, i) => (
              <div key={i} style={{
                borderRadius: 12, overflow: 'hidden', position: 'relative'
              }}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 16, padding: '20px 24px'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
          Client Reviews
        </h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Abhi tak koi review nahi</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{
                paddingBottom: i < reviews.length - 1 ? 16 : 0,
                borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#6366F1', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600
                  }}>
                    {r.client?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>
                      {r.client?.name}
                    </div>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hire Modal */}
      {hireModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 1000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16
        }} onClick={e => e.target === e.currentTarget && setHireModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%',
            maxWidth: 540, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 0'
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                Hire {profile.user?.name}
              </h2>
              <button onClick={() => setHireModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 22, color: '#94A3B8'
              }}>×</button>
            </div>

            <div style={{ padding: '16px 24px 24px' }}>
              {hireSent ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                    Request Send Ho Gayi!
                  </div>
                  <div style={{ color: '#64748B', marginTop: 6 }}>
                    {profile.user?.name} jald reply karenge
                  </div>
                </div>
              ) : (
                <>
                  {[
                    { label: 'Project Title *', key: 'projectTitle', placeholder: 'e.g. YouTube Vlog Edit' },
                    { label: 'Description *', key: 'description', placeholder: 'Project ke baare mein batao...', multiline: true },
                    { label: 'Budget ($)', key: 'budget', placeholder: 'Tumhara budget', type: 'number' },
                    { label: 'Deadline', key: 'deadline', placeholder: '', type: 'date' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 16 }}>
                      <label style={{
                        fontSize: 13, fontWeight: 600, color: '#374151',
                        display: 'block', marginBottom: 6
                      }}>{f.label}</label>
                      {f.multiline ? (
                        <textarea
                          value={hireForm[f.key]}
                          onChange={e => setHireForm(v => ({ ...v, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} rows={4}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 10,
                            border: '1.5px solid #E2E8F0', fontSize: 14,
                            resize: 'vertical', boxSizing: 'border-box',
                            outline: 'none', fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={hireForm[f.key]}
                          onChange={e => setHireForm(v => ({ ...v, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 10,
                            border: '1.5px solid #E2E8F0', fontSize: 14,
                            boxSizing: 'border-box', outline: 'none'
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <button onClick={handleHireSubmit} style={{
                    width: '100%', padding: 13, borderRadius: 12,
                    border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
                  }}>
                    Request Bhejo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorProfile;