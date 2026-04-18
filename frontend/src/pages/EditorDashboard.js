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
            })} for your project "${scheduleModal.projectTitle}". Would you like to proceed?`
      });
      setScheduleModal(null);
      setScheduleForm({ date: '', message: '' });
      fetchRequests();
      alert('Schedule proposal sent to client successfully!');
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
      label: 'Active Projects',
      value: requests.filter(r => r.status === 'accepted').length
    },
    {
      label: 'Completed',
      value: requests.filter(r => r.status === 'completed').length
    },
    {
      label: 'Total Earned',
      value: `$${requests
        .filter(r => r.status === 'completed')
        .reduce((s, r) => s + (r.budget || 0), 0)}`
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#0F172A',
          margin: '0 0 6px', letterSpacing: '-0.5px'
        }}>
          Editor Dashboard ✂️
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Manage your requests, {user?.name?.split(' ')[0]}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 14, marginBottom: 28
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 14, padding: '18px 20px'
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#6366F1' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{
        margin: '0 0 16px', fontSize: 18,
        fontWeight: 700, color: '#0F172A'
      }}>
        Hire Requests
      </h2>

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(req => {
            const sc = statusColors[req.status] || statusColors.pending;
            return (
              <div key={req._id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: 16, padding: '20px 22px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: 14, flexWrap: 'wrap'
                }}>

                  {/* Client Avatar */}
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: '#0EA5E9', color: '#fff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, flexShrink: 0
                  }}>
                    {req.client?.name?.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 10, flexWrap: 'wrap'
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
                      fontSize: 13, color: '#94A3B8', marginTop: 2
                    }}>
                      from {req.client?.name} ·{' '}
                      {new Date(req.createdAt).toLocaleDateString('en-US')}
                    </div>

                    <p style={{
                      margin: '10px 0 0', fontSize: 14,
                      color: '#475569', lineHeight: 1.6
                    }}>
                      {req.description}
                    </p>

                    {/* Scheduled Date */}
                    {req.scheduledDate && (
                      <div style={{
                        marginTop: 10, display: 'inline-flex',
                        alignItems: 'center', gap: 6,
                        background: '#F5F3FF', color: '#7C3AED',
                        borderRadius: 8, padding: '5px 12px',
                        fontSize: 13, fontWeight: 600
                      }}>
                        📅 Scheduled for:{' '}
                        {new Date(req.scheduledDate).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    )}

                    {/* Skills */}
                    {req.skills?.length > 0 && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 6, marginTop: 10
                      }}>
                        {req.skills.map(s => (
                          <span key={s} style={{
                            background: '#EEF2FF', color: '#4338CA',
                            padding: '2px 8px', borderRadius: 20,
                            fontSize: 11, fontWeight: 500
                          }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Budget */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800, fontSize: 20, color: '#6366F1'
                    }}>
                      ${req.budget || 0}
                    </div>
                    {req.deadline && (
                      <div style={{
                        fontSize: 12, color: '#94A3B8', marginTop: 4
                      }}>
                        Deadline:{' '}
                        {new Date(req.deadline).toLocaleDateString('en-US')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  marginTop: 16, paddingTop: 14,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex', gap: 10, flexWrap: 'wrap'
                }}>

                  {/* Message Button */}
                  <button
                    onClick={() => navigate(`/messages/${req.client?._id}`)}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '1.5px solid #E2E8F0', background: '#fff',
                      color: '#374151', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600
                    }}>
                    💬 Message
                  </button>

                  {/* Pending Actions */}
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(req._id, 'accepted')}
                        style={{
                          padding: '8px 20px', borderRadius: 8,
                          border: 'none', background: '#6366F1',
                          color: '#fff', cursor: 'pointer',
                          fontWeight: 700, fontSize: 13
                        }}>
                        ✓ Accept
                      </button>

                      {/* Schedule Button */}
                      <button
                        onClick={() => setScheduleModal(req)}
                        style={{
                          padding: '8px 20px', borderRadius: 8,
                          border: 'none', background: '#7C3AED',
                          color: '#fff', cursor: 'pointer',
                          fontWeight: 700, fontSize: 13
                        }}>
                        📅 Propose Schedule
                      </button>

                      <button
                        onClick={() => updateStatus(req._id, 'rejected')}
                        style={{
                          padding: '8px 20px', borderRadius: 8,
                          border: '1px solid #FEE2E2',
                          background: '#FEF2F2',
                          color: '#B91C1C', cursor: 'pointer',
                          fontWeight: 700, fontSize: 13
                        }}>
                        ✕ Decline
                      </button>
                    </>
                  )}

                  {/* Accepted Actions */}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => updateStatus(req._id, 'completed')}
                      style={{
                        padding: '8px 20px', borderRadius: 8,
                        border: 'none', background: '#10B981',
                        color: '#fff', cursor: 'pointer',
                        fontWeight: 700, fontSize: 13
                      }}>
                      ✓ Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16
        }}
          onClick={e => e.target === e.currentTarget && setScheduleModal(null)}>
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
                }}>
                  📅 Propose a Schedule
                </h2>
                <p style={{
                  margin: '4px 0 0', fontSize: 13,
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Tell the client when you will be available
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
                  fontSize: 12, color: '#94A3B8',
                  fontWeight: 600, marginBottom: 4
                }}>PROJECT</div>
                <div style={{
                  fontWeight: 700, fontSize: 15, color: '#0F172A'
                }}>
                  {scheduleModal.projectTitle}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  from {scheduleModal.client?.name}
                </div>
              </div>

              {/* Date Picker */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: 6
                }}>
                  Available Date *
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setScheduleForm(f => ({
                    ...f, date: e.target.value
                  }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: 10, border: '1.5px solid #E2E8F0',
                    fontSize: 14, boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>

              {/* Custom Message */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: 6
                }}>
                  Message to Client (Optional)
                </label>
                <textarea
                  value={scheduleForm.message}
                  onChange={e => setScheduleForm(f => ({
                    ...f, message: e.target.value
                  }))}
                  placeholder="e.g. I am currently working on another project but will be fully available from this date..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: 10, border: '1.5px solid #E2E8F0',
                    fontSize: 14, resize: 'vertical',
                    boxSizing: 'border-box', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  fontSize: 12, color: '#94A3B8', marginTop: 4
                }}>
                  Leave empty to send a default message
                </div>
              </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button
                                onClick={() => setScheduleModal(null)}
                                style={{
                                  flex: 1, padding: '12px', borderRadius: 12,
                                  border: '1.5px solid #E2E8F0', background: '#fff',
                                  color: '#374151', cursor: 'pointer',
                                  fontWeight: 600, fontSize: 14
                                }}>Cancel</button>
                              <button
                                onClick={handleScheduleSubmit}
                                style={{
                                  flex: 1, padding: '12px', borderRadius: 12,
                                  border: 'none', background: '#6366F1',
                                  color: '#fff', cursor: 'pointer',
                                  fontWeight: 600, fontSize: 14
                                }}>Send Proposal</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              };
              
              export default EditorDashboard;