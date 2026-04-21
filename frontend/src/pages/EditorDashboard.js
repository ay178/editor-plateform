import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const EditorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '', message: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/hire');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/hire/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleForm.date) {
      alert('Please select a date'); return;
    }
    try {
      await API.post('/notifications/schedule', {
        hiringRequestId: scheduleModal._id,
        scheduledDate: scheduleForm.date,
        message: scheduleForm.message ||
          `I am currently busy but will be available on ${new Date(scheduleForm.date)
            .toLocaleDateString('en-US', {
              day: 'numeric', month: 'long', year: 'numeric'
            })} for your project "${scheduleModal.projectTitle}".`
      });
      setScheduleModal(null);
      setScheduleForm({ date: '', message: '' });
      fetchRequests();
      alert('Schedule proposal sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const statusColors = {
    pending: { bg: '#FFF7ED', color: '#C2410C' },
    accepted: { bg: '#EFF6FF', color: '#1D4ED8' },
    completed: { bg: '#F0FDF4', color: '#15803D' },
    rejected: { bg: '#FEF2F2', color: '#B91C1C' },
    cancelled: { bg: '#F1F5F9', color: '#64748B' },
    scheduled: { bg: '#F5F3FF', color: '#7C3AED' }
  };

  const stats = [
    { label: 'Total Requests', value: requests.length },
    {
      label: 'Active',
      value: requests.filter(r => r.status === 'accepted').length
    },
    {
      label: 'Completed',
      value: requests.filter(r => r.status === 'completed').length
    },
    {
      label: 'Earned',
      value: `$${requests
        .filter(r => r.status === 'completed')
        .reduce((s, r) => s + (r.budget || 0), 0)}`
    },
  ];

  return (
    <>
      <style>{`
        .editor-dash {
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .request-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 20px 22px;
          margin-bottom: 16px;
        }
        .action-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }
        .action-btn {
          padding: 9px 16px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          border: none;
          transition: all 0.2s;
        }
        @media (max-width: 768px) {
          .editor-dash {
            padding: 16px 12px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .request-card {
            padding: 16px;
          }
          .action-btns {
            gap: 8px;
          }
          .action-btn {
            flex: 1;
            text-align: center;
            font-size: 12px;
            padding: 9px 10px;
          }
          .request-info {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .request-budget {
            text-align: left !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="editor-dash">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: '#0F172A',
            margin: '0 0 6px', letterSpacing: '-0.5px'
          }}>
            Editor Dashboard ✂️
          </h1>
          <p style={{ color: '#64748B', margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 14, padding: '16px'
            }}>
              <div style={{
                fontSize: 24, fontWeight: 800, color: '#6366F1'
              }}>{s.value}</div>
              <div style={{
                fontSize: 12, color: '#94A3B8', marginTop: 4
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{
          margin: '0 0 16px', fontSize: 18,
          fontWeight: 700, color: '#0F172A'
        }}>Hire Requests</h2>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #E2E8F0',
              borderTopColor: '#6366F1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0', color: '#94A3B8'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>
              No requests yet
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              When a client hires you, it will appear here
            </div>
          </div>
        ) : (
          requests.map(req => {
            const sc = statusColors[req.status] || statusColors.pending;
            return (
              <div key={req._id} className="request-card">

                {/* Request Info */}
                <div className="request-info" style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                    color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15, flexShrink: 0
                  }}>
                    {req.client?.name?.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 8, flexWrap: 'wrap'
                    }}>
                      <div style={{
                        fontWeight: 700, fontSize: 15, color: '#0F172A'
                      }}>
                        {req.projectTitle}
                      </div>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>{req.status}</span>
                    </div>

                    <div style={{
                      fontSize: 13, color: '#94A3B8', marginTop: 3
                    }}>
                      from {req.client?.name} ·{' '}
                      {new Date(req.createdAt).toLocaleDateString('en-US')}
                    </div>

                    <p style={{
                      margin: '8px 0 0', fontSize: 13,
                      color: '#475569', lineHeight: 1.6
                    }}>
                      {req.description}
                    </p>

                    {/* Scheduled Date */}
                    {req.scheduledDate && (
                      <div style={{
                        marginTop: 8, display: 'inline-flex',
                        alignItems: 'center', gap: 6,
                        background: '#F5F3FF', color: '#7C3AED',
                        borderRadius: 8, padding: '4px 12px',
                        fontSize: 12, fontWeight: 600
                      }}>
                        📅 Scheduled:{' '}
                        {new Date(req.scheduledDate)
                          .toLocaleDateString('en-US', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                      </div>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="request-budget" style={{
                    textAlign: 'right', flexShrink: 0
                  }}>
                    <div style={{
                      fontWeight: 800, fontSize: 18, color: '#6366F1'
                    }}>
                      ${req.budget || 0}
                    </div>
                    {req.deadline && (
                      <div style={{
                        fontSize: 11, color: '#94A3B8', marginTop: 2
                      }}>
                        Due: {new Date(req.deadline)
                          .toLocaleDateString('en-US')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-btns">
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/messages/${req.client?._id}`)}
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      color: '#374151'
                    }}>
                    💬 Message
                  </button>

                  {req.status === 'pending' && (
                    <>
                      <button
                        className="action-btn"
                        onClick={() => updateStatus(req._id, 'accepted')}
                        style={{
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                        }}>
                        ✓ Accept
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => setScheduleModal(req)}
                        style={{
                          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
                        }}>
                        📅 Schedule
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => updateStatus(req._id, 'rejected')}
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#B91C1C'
                        }}>
                        ✕ Decline
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      className="action-btn"
                      onClick={() => updateStatus(req._id, 'completed')}
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                      }}>
                      ✓ Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Schedule Modal */}
        {scheduleModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 16
          }}
            onClick={e => e.target === e.currentTarget &&
              setScheduleModal(null)}>
            <div style={{
              background: '#fff', borderRadius: 20,
              width: '100%', maxWidth: 500,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                padding: '20px 24px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{
                    margin: 0, fontSize: 18,
                    fontWeight: 700, color: '#fff'
                  }}>📅 Propose Schedule</h2>
                  <p style={{
                    margin: '4px 0 0', fontSize: 13,
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    Tell client when you are available
                  </p>
                </div>
                <button
                  onClick={() => setScheduleModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 20, color: '#fff',
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center'
                  }}>×</button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Project Info */}
                <div style={{
                  background: '#F8FAFC', borderRadius: 12,
                  padding: '12px 16px', marginBottom: 20
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 15, color: '#0F172A'
                  }}>
                    {scheduleModal.projectTitle}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#64748B', marginTop: 2
                  }}>
                    from {scheduleModal.client?.name}
                  </div>
                </div>

                {/* Date */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    fontSize: 13, fontWeight: 600, color: '#374151',
                    display: 'block', marginBottom: 6
                  }}>Available Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setScheduleForm(f => ({
                      ...f, date: e.target.value
                    }))}
                    style={{
                      width: '100%', padding: '11px 14px',
                      borderRadius: 10, border: '1.5px solid #E2E8F0',
                      fontSize: 14, boxSizing: 'border-box',
                      outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    fontSize: 13, fontWeight: 600, color: '#374151',
                    display: 'block', marginBottom: 6
                  }}>Message (Optional)</label>
                  <textarea
                    value={scheduleForm.message}
                    onChange={e => setScheduleForm(f => ({
                      ...f, message: e.target.value
                    }))}
                    placeholder="I am currently busy but will be available from this date..."
                    rows={3}
                    style={{
                      width: '100%', padding: '11px 14px',
                      borderRadius: 10, border: '1.5px solid #E2E8F0',
                      fontSize: 14, resize: 'vertical',
                      boxSizing: 'border-box', outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setScheduleModal(null)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      border: '1.5px solid #E2E8F0', background: '#fff',
                      color: '#374151', cursor: 'pointer',
                      fontWeight: 600, fontSize: 14, fontFamily: 'inherit'
                    }}>Cancel</button>
                  <button
                    onClick={handleScheduleSubmit}
                    style={{
                      flex: 2, padding: '12px', borderRadius: 12,
                      border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 14px rgba(124,58,237,0.4)'
                    }}>
                    📅 Send Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditorDashboard;