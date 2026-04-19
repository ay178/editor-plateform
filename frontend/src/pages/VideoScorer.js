import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const VideoScorer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    title: '',
    duration: '',
    fileSize: '',
    resolution: '1080p',
    hasColorGrading: false,
    hasSoundDesign: false,
    hasMotionGraphics: false,
  });

  const handleAnalyze = async () => {
    if (!form.title) { alert('Please enter video title'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/ai/score-video', {
        ...form,
        duration: Number(form.duration),
        fileSize: Number(form.fileSize)
      });
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return {
      bg: 'linear-gradient(135deg, #10B981, #059669)',
      text: '#fff', glow: 'rgba(16,185,129,0.4)'
    };
    if (grade.startsWith('B')) return {
      bg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      text: '#fff', glow: 'rgba(59,130,246,0.4)'
    };
    if (grade.startsWith('C')) return {
      bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
      text: '#fff', glow: 'rgba(245,158,11,0.4)'
    };
    return {
      bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
      text: '#fff', glow: 'rgba(239,68,68,0.4)'
    };
  };

  const ScoreBar = ({ label, score, color }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 6, alignItems: 'center'
      }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#374151'
        }}>{label}</span>
        <span style={{
          fontSize: 14, fontWeight: 800, color
        }}>{score}/25</span>
      </div>
      <div style={{
        height: 10, background: '#F1F5F9',
        borderRadius: 5, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: 5,
          background: color,
          width: `${(score / 25) * 100}%`,
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: 40,
        animation: 'fadeUp 0.5s ease forwards'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
          border: '1px solid #BFDBFE', borderRadius: 50,
          padding: '6px 16px', marginBottom: 16
        }}>
          <span style={{ fontSize: 16 }}>🎬</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#1D4ED8'
          }}>AI Video Quality Scorer</span>
        </div>
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: '#0F172A',
          margin: '0 0 12px', letterSpacing: '-1px'
        }}>
          Score Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Video Quality</span>
        </h1>
        <p style={{ color: '#64748B', fontSize: 16, margin: 0 }}>
          Get an AI-powered quality score and professional feedback
          on your video work
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
          }}>Video Details</h2>

          {/* Title */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6
            }}>Video Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Brand Commercial Edit"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Duration + File Size */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 14, marginBottom: 18
          }}>
            <div>
              <label style={{
                fontSize: 13, fontWeight: 700, color: '#374151',
                display: 'block', marginBottom: 6
              }}>Duration (seconds)</label>
              <input
                type="number"
                value={form.duration}
                onChange={e => setForm(f => ({
                  ...f, duration: e.target.value
                }))}
                placeholder="e.g. 120"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', fontSize: 14,
                  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: 13, fontWeight: 700, color: '#374151',
                display: 'block', marginBottom: 6
              }}>File Size (bytes)</label>
              <input
                type="number"
                value={form.fileSize}
                onChange={e => setForm(f => ({
                  ...f, fileSize: e.target.value
                }))}
                placeholder="e.g. 52428800"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', fontSize: 14,
                  boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Resolution */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 10
            }}>Resolution</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8
            }}>
              {['480p', '720p', '1080p', '4K'].map(res => (
                <button key={res}
                  onClick={() => setForm(f => ({ ...f, resolution: res }))}
                  style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${form.resolution === res
                      ? '#3B82F6' : '#E2E8F0'}`,
                    background: form.resolution === res ? '#EFF6FF' : '#F8FAFC',
                    color: form.resolution === res ? '#1D4ED8' : '#374151',
                    fontWeight: form.resolution === res ? 700 : 500,
                    fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s'
                  }}>
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 12
            }}>Production Elements</label>

            {[
              {
                key: 'hasColorGrading',
                label: 'Color Grading',
                icon: '🎨',
                desc: 'Professional color correction applied'
              },
              {
                key: 'hasSoundDesign',
                label: 'Sound Design',
                icon: '🎵',
                desc: 'Custom audio, music, sound effects'
              },
              {
                key: 'hasMotionGraphics',
                label: 'Motion Graphics',
                icon: '✨',
                desc: 'Animated text, transitions, effects'
              },
            ].map(item => (
              <div key={item.key}
                onClick={() => setForm(f => ({
                  ...f, [item.key]: !f[item.key]
                }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${form[item.key] ? '#3B82F6' : '#E2E8F0'}`,
                  background: form[item.key] ? '#EFF6FF' : '#F8FAFC',
                  marginBottom: 10, transition: 'all 0.2s'
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, fontSize: 20,
                  background: form[item.key] ? '#DBEAFE' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: form[item.key] ? '#1D4ED8' : '#0F172A'
                  }}>{item.label}</div>
                  <div style={{
                    fontSize: 12, color: '#94A3B8', marginTop: 1
                  }}>{item.desc}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: form[item.key] ? '#3B82F6' : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {form[item.key] && (
                    <svg width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? '#E2E8F0'
                : 'linear-gradient(135deg, #3B82F6, #6366F1)',
              color: loading ? '#94A3B8' : '#fff',
              fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
              boxShadow: loading
                ? 'none' : '0 4px 14px rgba(59,130,246,0.4)',
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
                Analyzing video quality...
              </span>
            ) : '🎬 Analyze My Video'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            animation: 'fadeUp 0.4s ease forwards'
          }}>

            {/* Grade Card */}
            {(() => {
              const gc = getGradeColor(result.grade);
              return (
                <div style={{
                  background: gc.bg, borderRadius: 20,
                  padding: '28px 24px', textAlign: 'center',
                  boxShadow: `0 8px 24px ${gc.glow}`
                }}>
                  <div style={{
                    fontSize: 64, fontWeight: 900,
                    color: gc.text, lineHeight: 1,
                    marginBottom: 8,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>{result.grade}</div>
                  <div style={{
                    fontSize: 36, fontWeight: 800,
                    color: gc.text, marginBottom: 6
                  }}>{result.totalScore}/100</div>
                  <div style={{
                    fontSize: 14, color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500
                  }}>{result.recommendation}</div>
                </div>
              );
            })()}

            {/* Score Breakdown */}
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: '20px 22px'
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#0F172A', margin: '0 0 18px'
              }}>Score Breakdown</h3>
              <ScoreBar
                label="Technical Quality"
                score={result.scores.technical}
                color="#3B82F6"
              />
              <ScoreBar
                label="Creativity"
                score={result.scores.creativity}
                color="#8B5CF6"
              />
              <ScoreBar
                label="Storytelling"
                score={result.scores.storytelling}
                color="#10B981"
              />
              <ScoreBar
                label="Production Value"
                score={result.scores.production}
                color="#F59E0B"
              />
            </div>

            {/* Feedback */}
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: '20px 22px'
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#0F172A', margin: '0 0 14px'
              }}>AI Feedback</h3>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                {result.feedback.map((fb, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: fb.startsWith('✅') ? '#F0FDF4'
                      : fb.startsWith('❌') ? '#FEF2F2' : '#FFF7ED',
                    fontSize: 13, fontWeight: 500,
                    color: fb.startsWith('✅') ? '#15803D'
                      : fb.startsWith('❌') ? '#B91C1C' : '#92400E',
                    lineHeight: 1.5
                  }}>{fb}</div>
                ))}
              </div>
            </div>

            {/* Retry Button */}
            <button
              onClick={() => setResult(null)}
              style={{
                width: '100%', padding: 12, borderRadius: 12,
                border: '1.5px solid #E2E8F0', background: '#fff',
                color: '#374151', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, fontFamily: 'inherit'
              }}>
              Score Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoScorer;