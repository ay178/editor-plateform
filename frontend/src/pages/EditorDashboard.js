import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const EditorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert(err.response?.data?.message || 'Error aaya');
    }
  };

  const statusColors = {
    pending: { bg: '#FFF7ED', color: '#C2410C' },
    accepted: { bg: '#EFF6FF', color: '#1D4ED8' },
    completed: { bg: '#F0FDF4', color: '#15803D' },
    rejected: { bg: '#FEF2F2', color: '#B91C1C' },
    cancelled: { bg: '#F1F5F9', color: '#64748B' }
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
          Apni requests manage karo, {user?.name?.split(' ')[0]}
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

      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            Koi request nahi abhi tak
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>
            Jab koi client hire karega, yahan dikhega
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                        fontSize: 11, fontWeight: 700, textTransform: 'capitalize'
                      }}>{req.status}</span>
                    </div>

                    <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
                      from {req.client?.name} ·{' '}
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </div>

                    <p style={{
                      margin: '10px 0 0', fontSize: 14,
                      color: '#475569', lineHeight: 1.6
                    }}>
                      {req.description}
                    </p>

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
                      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                        Deadline: {new Date(req.deadline).toLocaleDateString('en-IN')}
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
                      <button
                        onClick={() => updateStatus(req._id, 'rejected')}
                        style={{
                          padding: '8px 20px', borderRadius: 8,
                          border: '1.5px solid #FEE2E2',
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
    </div>
  );
};

export default EditorDashboard;