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
    const [profileRes, reviewsRes] = await Promise.all([
      API.get(`/editors/${id}`),
      API.get(`/review/editor/${id}`)
    ]);
    setProfile(profileRes.data);
    setReviews(reviewsRes.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleHireSubmit = async () => {
    if (!hireForm.projectTitle || !hireForm.description) {
      alert('Title and description required'); return;
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
        setHireForm({
          projectTitle: '', description: '', budget: '', deadline: ''
        });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
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
      <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>
        Editor not found
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 28px 20px;
        }
        .profile-hero {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-start;
        }
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        .profile-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 20px 22px;
          margin-bottom: 18px;
        }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .hire-btn {
          padding: 11px 22px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          transition: all 0.2s;
        }
        .hire-btn:hover {
          transform: translateY(-1px);
        }
        .msg-btn {
          padding: 11px 18px;
          border-radius: 12px;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .msg-btn:hover {
          border-color: #6366F1;
          color: #6366F1;
        }
        @media (max-width: 768px) {
          .profile-container {
            padding: 16px 12px;
          }
          .profile-hero {
            padding: 20px;
            flex-direction: column;
          }
          .profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .portfolio-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .profile-card {
            padding: 16px;
          }
          .profile-actions {
            flex-direction: row !important;
            width: 100%;
          }
          .hire-btn, .msg-btn {
            flex: 1;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .portfolio-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="profile-container">

        {/* Back Button */}
        <button onClick={() => navigate('/editors')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6366F1', fontWeight: 600, fontSize: 14,
          marginBottom: 20, padding: 0, fontFamily: 'inherit'
        }}>
          ← Back to Browse
        </button>

        {/* Hero Card */}
        <div className="profile-hero">
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800,
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
          }}>
            {profile.user?.name?.slice(0, 2).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 10, flexWrap: 'wrap', marginBottom: 6
            }}>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                color: '#0F172A', letterSpacing: '-0.5px'
              }}>{profile.user?.name}</h1>
              <span style={{
                background: profile.availability ? '#DCFCE7' : '#FEE2E2',
                color: profile.availability ? '#16A34A' : '#DC2626',
                borderRadius: 20, padding: '3px 12px',
                fontSize: 12, fontWeight: 700
              }}>
                {profile.availability ? 'Available' : 'Busy'}
              </span>
            </div>

            <p style={{ color: '#64748B', margin: '0 0 10px', fontSize: 14 }}>
              {profile.location} · {profile.experience} yrs exp
            </p>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {profile.skills?.map(s => (
                <span key={s} style={{
                  background: '#EEF2FF', color: '#4338CA',
                  padding: '4px 10px', borderRadius: 20,
                  fontSize: 12, fontWeight: 600
                }}>{SKILL_LABELS[s] || s}</span>
              ))}
            </div>

            <p style={{
              color: '#475569', fontSize: 14,
              lineHeight: 1.7, margin: 0
            }}>{profile.bio}</p>
          </div>

          {/* Price + Actions */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 10, minWidth: 160
          }}>
            <div>
              <div style={{
                fontSize: 26, fontWeight: 800, color: '#6366F1'
              }}>
                ${profile.price}
                <span style={{
                  fontSize: 13, fontWeight: 400, color: '#94A3B8'
                }}>
                  /{profile.pricingType === 'hourly' ? 'hr' : 'proj'}
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 5, marginTop: 4
              }}>
                <StarRating rating={profile.averageRating} size={14} />
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                  {profile.averageRating}
                </span>
                <span style={{ color: '#94A3B8', fontSize: 12 }}>
                  ({profile.totalReviews})
                </span>
              </div>
            </div>

            {(!user || user.role === 'client') && (
              <div className="profile-actions" style={{
                display: 'flex', gap: 8
              }}>
                <button
                  className="msg-btn"
                  onClick={() => navigate(`/messages/${id}`)}>
                  💬 Message
                </button>
                <button
                  className="hire-btn"
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    setHireModal(true);
                  }}>
                  Hire Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          {[
            { label: 'Projects Done', value: profile.completedProjects },
            { label: 'Response Time', value: profile.responseTime },
            { label: 'Reviews', value: profile.totalReviews },
            { label: 'Experience', value: `${profile.experience} yrs` },
          ].map(s => (
            <div key={s.label} style={{
              background: '#F8FAFC', borderRadius: 14,
              padding: '14px 16px', textAlign: 'center'
            }}>
              <div style={{
                fontSize: 18, fontWeight: 800, color: '#0F172A'
              }}>{s.value}</div>
              <div style={{
                fontSize: 11, color: '#94A3B8', marginTop: 3
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Software */}
        <div className="profile-card">
          <h3 style={{
            fontSize: 16, fontWeight: 700,
            color: '#0F172A', margin: '0 0 14px'
          }}>Software & Tools</h3>
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
          <div className="profile-card">
            <h3 style={{
              fontSize: 16, fontWeight: 700,
              color: '#0F172A', margin: '0 0 16px'
            }}>Portfolio</h3>
            <div className="portfolio-grid">
              {profile.portfolio.map((item, i) => (
                <div key={i} style={{
                  borderRadius: 12, overflow: 'hidden',
                  position: 'relative'
                }}>
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      style={{
                        width: '100%', height: 130,
                        objectFit: 'cover', display: 'block'
                      }}
                    />
                  ) : (
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      style={{
                        width: '100%', height: 130,
                        objectFit: 'cover', display: 'block'
                      }}
                    />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 8, left: 10, right: 10
                  }}>
                    <div style={{
                      color: '#fff', fontSize: 11, fontWeight: 600
                    }}>{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="profile-card">
          <h3 style={{
            fontSize: 16, fontWeight: 700,
            color: '#0F172A', margin: '0 0 16px'
          }}>Client Reviews</h3>
          {reviews.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: 14 }}>
              No reviews yet
            </p>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              {reviews.map((r, i) => (
                <div key={i} style={{
                  paddingBottom: i < reviews.length - 1 ? 16 : 0,
                  borderBottom: i < reviews.length - 1
                    ? '1px solid #F1F5F9' : 'none'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, marginBottom: 8
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: '#6366F1', color: '#fff',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600
                    }}>
                      {r.client?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: 14, color: '#0F172A'
                      }}>
                        {r.client?.name}
                      </div>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 14,
                    color: '#475569', lineHeight: 1.6
                  }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hire Modal */}
        {hireModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'center', padding: 0
          }}
            onClick={e => e.target === e.currentTarget &&
              setHireModal(false)}>
            <div style={{
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              width: '100%', maxWidth: 560,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s ease'
            }}>
              <style>{`
                @keyframes slideUp {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
                }
                @media (min-width: 600px) {
                  .hire-modal-inner {
                    border-radius: 20px !important;
                    max-width: 540px;
                    margin: auto;
                  }
                }
              `}</style>

              {/* Handle */}
              <div style={{
                width: 40, height: 4, background: '#E2E8F0',
                borderRadius: 2, margin: '12px auto 0'
              }} />

              <div style={{ padding: '16px 24px 28px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 20
                }}>
                  <h2 style={{
                    margin: 0, fontSize: 18,
                    fontWeight: 700, color: '#0F172A'
                  }}>
                    Hire {profile.user?.name}
                  </h2>
                  <button onClick={() => setHireModal(false)} style={{
                    background: '#F1F5F9', border: 'none',
                    cursor: 'pointer', fontSize: 18,
                    color: '#94A3B8', width: 32, height: 32,
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>×</button>
                </div>

                {hireSent ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                    <div style={{
                      fontSize: 18, fontWeight: 700, color: '#0F172A'
                    }}>
                      Request Sent!
                    </div>
                    <div style={{
                      color: '#64748B', marginTop: 6, fontSize: 14
                    }}>
                      {profile.user?.name} will respond {profile.responseTime?.toLowerCase()}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Price Summary */}
                    <div style={{
                      background: '#F8FAFC', borderRadius: 12,
                      padding: '12px 16px', marginBottom: 20,
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13
                      }}>
                        {profile.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 700, color: '#0F172A', fontSize: 14
                        }}>
                          {profile.user?.name}
                        </div>
                        <div style={{
                          fontSize: 13, color: '#6366F1', fontWeight: 600
                        }}>
                          ${profile.price}/{profile.pricingType === 'hourly' ? 'hr' : 'project'}
                        </div>
                      </div>
                    </div>

                    {[
                      {
                        label: 'Project Title *',
                        key: 'projectTitle',
                        placeholder: 'e.g. YouTube Travel Vlog Edit'
                      },
                      {
                        label: 'Description *',
                        key: 'description',
                        placeholder: 'Describe your project...',
                        multiline: true
                      },
                      {
                        label: 'Budget ($)',
                        key: 'budget',
                        placeholder: 'Your budget',
                        type: 'number'
                      },
                      {
                        label: 'Deadline',
                        key: 'deadline',
                        type: 'date'
                      },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: 14 }}>
                        <label style={{
                          fontSize: 13, fontWeight: 600, color: '#374151',
                          display: 'block', marginBottom: 6
                        }}>{f.label}</label>
                        {f.multiline ? (
                          <textarea
                            value={hireForm[f.key]}
                            onChange={e => setHireForm(v => ({
                              ...v, [f.key]: e.target.value
                            }))}
                            placeholder={f.placeholder}
                            rows={3}
                            style={{
                              width: '100%', padding: '10px 14px',
                              borderRadius: 10, border: '1.5px solid #E2E8F0',
                              fontSize: 14, resize: 'vertical',
                              boxSizing: 'border-box', outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          />
                        ) : (
                          <input
                            type={f.type || 'text'}
                            value={hireForm[f.key]}
                            onChange={e => setHireForm(v => ({
                              ...v, [f.key]: e.target.value
                            }))}
                            placeholder={f.placeholder}
                            style={{
                              width: '100%', padding: '10px 14px',
                              borderRadius: 10, border: '1.5px solid #E2E8F0',
                              fontSize: 14, boxSizing: 'border-box',
                              outline: 'none', fontFamily: 'inherit'
                            }}
                          />
                        )}
                      </div>
                    ))}

                    <button onClick={handleHireSubmit} style={{
                      width: '100%', padding: 14, borderRadius: 12,
                      border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
                    }}>
                      Send Hire Request 🚀
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditorProfile;