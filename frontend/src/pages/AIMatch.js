import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const AIMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [form, setForm] = useState({
    projectType: '',
    style: '',
    budget: '',
    deadline: '',
    skills: [],
    description: ''
  });

  const styles = [
    'Cinematic', 'Minimal', 'Dynamic', 'Corporate',
    'Creative', 'Documentary', 'Social Media', 'Commercial'
  ];

  const projectTypes = [
    'YouTube Video', 'Brand Commercial', 'Wedding Film',
    'Social Media Content', 'Documentary', 'Music Video',
    'Corporate Video', 'Short Film'
  ];

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  };

  const handleMatch = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/ai/match-editors', form);
      setResults(data);
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return { bg: '#F0FDF4', color: '#15803D', bar: '#10B981' };
    if (percentage >= 60) return { bg: '#EFF6FF', color: '#1D4ED8', bar: '#3B82F6' };
    if (percentage >= 40) return { bg: '#FFF7ED', color: '#C2410C', bar: '#F59E0B' };
    return { bg: '#FEF2F2', color: '#B91C1C', bar: '#EF4444' };
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: 40,
        animation: 'fadeUp 0.5s ease forwards'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
          border: '1px solid #DDD6FE', borderRadius: 50,
          padding: '6px 16px', marginBottom: 16
        }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#7C3AED'
          }}>AI Powered Matching</span>
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 800, color: '#0F172A',
          margin: '0 0 12px', letterSpacing: '-1px',
          lineHeight: 1.2
        }}>
          Find Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Perfect Match</span>
        </h1>
        <p style={{ color: '#64748B', fontSize: 16, margin: 0 }}>
          Tell us about your project — AI will find the best editor for you
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 0, marginBottom: 40
      }}>
        {[
          { num: 1, label: 'Project Details' },
          { num: 2, label: 'Requirements' },
          { num: 3, label: 'AI Results' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: step >= s.num
                  ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  : '#F1F5F9',
                color: step >= s.num ? '#fff' : '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15,
                boxShadow: step >= s.num
                  ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.3s'
              }}>{step > s.num ? '✓' : s.num}</div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: step >= s.num ? '#6366F1' : '#94A3B8'
              }}>{s.label}</span>
            </div>
            {i < 2 && (
              <div style={{
                height: 2, width: 80, marginBottom: 20,
                background: step > s.num
                  ? 'linear-gradient(90deg, #6366F1, #8B5CF6)'
                  : '#E2E8F0',
                transition: 'all 0.3s'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 — Project Details */}
      {step === 1 && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 32,
          animation: 'scaleIn 0.3s ease forwards'
        }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700,
            color: '#0F172A', margin: '0 0 24px'
          }}>
            Tell us about your project
          </h2>

          {/* Project Type */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 10
            }}>Project Type</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 10
            }}>
              {projectTypes.map(pt => (
                <button key={pt} onClick={() => setForm(f => ({ ...f, projectType: pt }))}
                  style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${form.projectType === pt ? '#6366F1' : '#E2E8F0'}`,
                    background: form.projectType === pt ? '#EEF2FF' : '#F8FAFC',
                    color: form.projectType === pt ? '#6366F1' : '#374151',
                    fontWeight: form.projectType === pt ? 700 : 500,
                    fontSize: 13, transition: 'all 0.2s', fontFamily: 'inherit'
                  }}>
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 10
            }}>Preferred Style</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {styles.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, style: s }))}
                  style={{
                    padding: '8px 16px', borderRadius: 50, cursor: 'pointer',
                    border: `2px solid ${form.style === s ? '#8B5CF6' : '#E2E8F0'}`,
                    background: form.style === s ? '#F5F3FF' : '#F8FAFC',
                    color: form.style === s ? '#7C3AED' : '#374151',
                    fontWeight: form.style === s ? 700 : 500,
                    fontSize: 13, transition: 'all 0.2s', fontFamily: 'inherit'
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Project Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe your project in detail — what you need, your vision, target audience..."
              rows={4}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                resize: 'vertical', boxSizing: 'border-box',
                fontFamily: 'inherit', outline: 'none', lineHeight: 1.6
              }}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!form.projectType}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              cursor: form.projectType ? 'pointer' : 'not-allowed',
              background: form.projectType
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : '#E2E8F0',
              color: form.projectType ? '#fff' : '#94A3B8',
              fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
              boxShadow: form.projectType
                ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
              transition: 'all 0.2s'
            }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Requirements */}
      {step === 2 && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 32,
          animation: 'scaleIn 0.3s ease forwards'
        }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700,
            color: '#0F172A', margin: '0 0 24px'
          }}>
            Set your requirements
          </h2>

          {/* Skills */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 10
            }}>Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <button key={key}
                  onClick={() => toggleSkill(key)}
                  style={{
                    padding: '8px 16px', borderRadius: 50, cursor: 'pointer',
                    border: `2px solid ${form.skills.includes(key) ? '#6366F1' : '#E2E8F0'}`,
                    background: form.skills.includes(key) ? '#EEF2FF' : '#F8FAFC',
                    color: form.skills.includes(key) ? '#6366F1' : '#374151',
                    fontWeight: form.skills.includes(key) ? 700 : 500,
                    fontSize: 13, transition: 'all 0.2s', fontFamily: 'inherit'
                  }}>
                  {form.skills.includes(key) ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Budget ($)</label>
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="Your maximum budget"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Project Deadline</label>
            <input
              type="date"
              value={form.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '1.5px solid #E2E8F0', background: '#fff',
              color: '#374151', cursor: 'pointer',
              fontWeight: 600, fontSize: 15, fontFamily: 'inherit'
            }}>← Back</button>

            <button onClick={handleMatch} disabled={loading} style={{
              flex: 2, padding: 14, borderRadius: 12, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              opacity: loading ? 0.8 : 1
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  AI is analyzing...
                </span>
              ) : '🤖 Find My Perfect Editor'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Results */}
      {step === 3 && results && (
        <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 20, padding: '24px 28px', marginBottom: 24,
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                🎯 AI Match Complete!
              </div>
              <div style={{ opacity: 0.85, fontSize: 15 }}>
                Analyzed {results.totalAnalyzed} editors —
                found {results.matches.length} best matches for you
              </div>
            </div>
            <button onClick={() => { setStep(1); setResults(null); }} style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'inherit'
            }}>Search Again</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.matches.map((match, i) => {
              const mc = getMatchColor(match.matchPercentage);
              return (
                <div key={match.editor._id} style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 20, padding: 24, overflow: 'hidden',
                  position: 'relative',
                  animation: `fadeUp 0.4s ease ${i * 0.1}s forwards`,
                  opacity: 0
                }}>
                  {/* Rank Badge */}
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                      color: '#fff', borderRadius: 20,
                      padding: '4px 12px', fontSize: 12, fontWeight: 700
                    }}>🏆 Best Match</div>
                  )}

                  <div style={{
                    display: 'flex', gap: 16,
                    alignItems: 'flex-start', flexWrap: 'wrap'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800,
                      fontSize: 20, flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                    }}>
                      {match.editor.user?.name?.slice(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{
                        fontWeight: 800, fontSize: 18, color: '#0F172A'
                      }}>
                        {match.editor.user?.name}
                      </div>
                      <div style={{
                        fontSize: 13, color: '#64748B', marginTop: 2
                      }}>
                        {match.editor.location} ·
                        ${match.editor.price}/{match.editor.pricingType === 'hourly' ? 'hr' : 'proj'} ·
                        ⭐ {match.editor.averageRating}
                      </div>

                      {/* Match % Bar */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: 6
                        }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, color: mc.color
                          }}>
                            AI Match Score
                          </span>
                          <span style={{
                            fontSize: 14, fontWeight: 800, color: mc.color
                          }}>
                            {match.matchPercentage}%
                          </span>
                        </div>
                        <div style={{
                          height: 8, background: '#F1F5F9',
                          borderRadius: 4, overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            background: mc.bar,
                            width: `${match.matchPercentage}%`,
                            transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>

                      {/* Reasons */}
                      <div style={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 6, marginTop: 12
                      }}>
                        {match.reasons.map((reason, ri) => (
                          <span key={ri} style={{
                            background: mc.bg, color: mc.color,
                            padding: '3px 10px', borderRadius: 20,
                            fontSize: 11, fontWeight: 600
                          }}>✓ {reason}</span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <button
                        onClick={() => navigate(`/editors/${match.editor.user?._id}`)}
                        style={{
                          padding: '10px 20px', borderRadius: 10,
                          border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          color: '#fff', fontWeight: 700, fontSize: 13,
                          fontFamily: 'inherit',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                        }}>
                        View Profile
                      </button>
                      <button
                        onClick={() => navigate(`/editors/${match.editor.user?._id}`)}
                        style={{
                          padding: '10px 20px', borderRadius: 10,
                          border: '1.5px solid #E2E8F0',
                          background: '#fff', color: '#374151',
                          cursor: 'pointer', fontWeight: 600,
                          fontSize: 13, fontFamily: 'inherit'
                        }}>
                        Hire Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatch;