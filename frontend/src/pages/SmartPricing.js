import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const SKILL_LABELS = {
  'video-editing': 'Video Editing',
  'photo-editing': 'Photo Editing',
  'thumbnail-design': 'Thumbnail Design',
  'color-grading': 'Color Grading',
  'motion-graphics': 'Motion Graphics',
  'sound-design': 'Sound Design',
  'animation': 'Animation',
};

const SmartPricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    skills: [],
    experience: 1,
    completedProjects: 0,
    averageRating: 4.0,
    location: '',
    pricingType: 'per-project'
  });

  useEffect(() => {
    if (user?.role !== 'editor') {
      navigate('/dashboard');
    }
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      const { data } = await API.get('/editors/profile/me');
      setForm(f => ({
        ...f,
        skills: data.skills || [],
        experience: data.experience || 1,
        completedProjects: data.completedProjects || 0,
        averageRating: data.averageRating || 4.0,
        location: data.location || '',
        pricingType: data.pricingType || 'per-project'
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/ai/smart-pricing', form);
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPrice = async (price) => {
    try {
      await API.put('/editors/profile', { price });
      alert(`Price updated to $${price} successfully!`);
    } catch (err) {
      alert('Error updating price');
    }
  };

  const getCompetitivenessColor = (text) => {
    if (text.includes('Below')) return { bg: '#FEF2F2', color: '#B91C1C' };
    if (text.includes('Premium')) return { bg: '#FFF7ED', color: '#C2410C' };
    return { bg: '#F0FDF4', color: '#15803D' };
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: 40,
        animation: 'fadeUp 0.5s ease forwards'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          border: '1px solid #FDE68A', borderRadius: 50,
          padding: '6px 16px', marginBottom: 16
        }}>
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#92400E'
          }}>AI Smart Pricing</span>
        </div>
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: '#0F172A',
          margin: '0 0 12px', letterSpacing: '-1px'
        }}>
          Know Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>True Worth</span>
        </h1>
        <p style={{ color: '#64748B', fontSize: 16, margin: 0 }}>
          AI analyzes your skills, experience and market data
          to suggest the perfect rate
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: result ? '1fr 1fr' : '1fr',
        gap: 24, alignItems: 'start'
      }}>

        {/* Form */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 28
        }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700,
            color: '#0F172A', margin: '0 0 24px'
          }}>Your Profile Details</h2>

          {/* Skills */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 10
            }}>Your Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => toggleSkill(key)} style={{
                  padding: '7px 14px', borderRadius: 50, cursor: 'pointer',
                  border: `2px solid ${form.skills.includes(key)
                    ? '#F59E0B' : '#E2E8F0'}`,
                  background: form.skills.includes(key)
                    ? '#FFF7ED' : '#F8FAFC',
                  color: form.skills.includes(key) ? '#92400E' : '#374151',
                  fontWeight: form.skills.includes(key) ? 700 : 500,
                  fontSize: 12, transition: 'all 0.2s', fontFamily: 'inherit'
                }}>
                  {form.skills.includes(key) ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 8
            }}>
              Years of Experience:{' '}
              <span style={{ color: '#F59E0B' }}>{form.experience} years</span>
            </label>
            <input
              type="range" min={0} max={20} step={1}
              value={form.experience}
              onChange={e => setForm(f => ({
                ...f, experience: +e.target.value
              }))}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#94A3B8', marginTop: 4
            }}>
              <span>0 years</span>
              <span>20 years</span>
            </div>
          </div>

          {/* Completed Projects */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 8
            }}>
              Completed Projects:{' '}
              <span style={{ color: '#F59E0B' }}>{form.completedProjects}</span>
            </label>
            <input
              type="range" min={0} max={200} step={5}
              value={form.completedProjects}
              onChange={e => setForm(f => ({
                ...f, completedProjects: +e.target.value
              }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 8
            }}>
              Average Rating:{' '}
              <span style={{ color: '#F59E0B' }}>
                ⭐ {form.averageRating.toFixed(1)}
              </span>
            </label>
            <input
              type="range" min={1} max={5} step={0.1}
              value={form.averageRating}
              onChange={e => setForm(f => ({
                ...f, averageRating: +e.target.value
              }))}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#94A3B8', marginTop: 4
            }}>
              <span>1.0 ⭐</span>
              <span>5.0 ⭐</span>
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Location</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({
                ...f, location: e.target.value
              }))}
              placeholder="e.g. New York, US / Remote / London, UK"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Pricing Type */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 8
            }}>Pricing Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                ['per-project', '📦 Per Project'],
                ['hourly', '⏱️ Hourly']
              ].map(([val, label]) => (
                <button key={val}
                  onClick={() => setForm(f => ({ ...f, pricingType: val }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    cursor: 'pointer',
                    border: `2px solid ${form.pricingType === val
                      ? '#F59E0B' : '#E2E8F0'}`,
                    background: form.pricingType === val
                      ? '#FFF7ED' : '#F8FAFC',
                    color: form.pricingType === val ? '#92400E' : '#374151',
                    fontWeight: form.pricingType === val ? 700 : 500,
                    fontSize: 13, fontFamily: 'inherit'
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? '#E2E8F0'
                : 'linear-gradient(135deg, #F59E0B, #EF4444)',
              color: loading ? '#94A3B8' : '#fff',
              fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
              boxShadow: loading
                ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
              transition: 'all 0.2s'
            }}>
            {loading ? (
              <span style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8
              }}>
                <div style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Analyzing market data...
              </span>
            ) : '💰 Calculate My Perfect Rate'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            animation: 'fadeUp 0.4s ease forwards'
          }}>

            {/* Price Cards */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              borderRadius: 20, padding: 24, color: '#fff'
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: 16,
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                AI Recommended Rates
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', gap: 12
              }}>
                {[
                  {
                    label: 'Minimum',
                    value: result.suggested.minimum,
                    color: '#94A3B8', desc: 'Entry level'
                  },
                  {
                    label: 'Recommended',
                    value: result.suggested.recommended,
                    color: '#F59E0B', desc: 'Best choice'
                  },
                  {
                    label: 'Premium',
                    value: result.suggested.premium,
                    color: '#10B981', desc: 'Top tier'
                  },
                ].map(p => (
                  <div key={p.label} style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '16px 12px',
                    textAlign: 'center', border: p.label === 'Recommended'
                      ? '2px solid #F59E0B'
                      : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {p.label === 'Recommended' && (
                      <div style={{
                        fontSize: 10, fontWeight: 700,
                        color: '#F59E0B', marginBottom: 6,
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>⭐ Best</div>
                    )}
                    <div style={{
                      fontSize: 22, fontWeight: 800, color: p.color
                    }}>${p.value}</div>
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.5)',
                      marginTop: 4
                    }}>{p.label}</div>
                    <div style={{
                      fontSize: 10, color: 'rgba(255,255,255,0.3)',
                      marginTop: 2
                    }}>{p.desc}</div>
                    <button
                      onClick={() => handleApplyPrice(p.value)}
                      style={{
                        marginTop: 10, width: '100%',
                        padding: '6px', borderRadius: 8, border: 'none',
                        background: p.label === 'Recommended'
                          ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                        color: '#fff', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700, fontFamily: 'inherit'
                      }}>Apply</button>
                  </div>
                ))}
              </div>

              {/* Market Average */}
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.6)'
                }}>Market Average</span>
                <span style={{
                  fontSize: 16, fontWeight: 700, color: '#fff'
                }}>${result.marketAverage}</span>
              </div>
            </div>

            {/* Competitiveness */}
            {(() => {
              const cc = getCompetitivenessColor(result.competitiveness);
              return (
                <div style={{
                  background: cc.bg, border: `1px solid ${cc.color}30`,
                  borderRadius: 14, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{ fontSize: 28 }}>
                    {result.competitiveness.includes('Below') ? '⚠️' :
                      result.competitiveness.includes('Premium') ? '💎' : '✅'}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700, fontSize: 14, color: cc.color
                    }}>Market Position</div>
                    <div style={{
                      fontSize: 13, color: cc.color, opacity: 0.8, marginTop: 2
                    }}>{result.competitiveness}</div>
                  </div>
                </div>
              );
            })()}

            {/* Breakdown */}
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: 20
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#0F172A', margin: '0 0 14px'
              }}>Price Breakdown</h3>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                {result.breakdown.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#F8FAFC', borderRadius: 10
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: 13, color: '#0F172A'
                      }}>{item.factor}</div>
                      <div style={{
                        fontSize: 11, color: '#94A3B8', marginTop: 1
                      }}>{item.note}</div>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: item.impact.startsWith('+')
                        ? '#10B981' : '#EF4444'
                    }}>{item.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPricing;