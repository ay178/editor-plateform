import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

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

  const handleCancel = async (id) => {
    try {
      await API.patch(`/hire/${id}/status`, { status: 'cancelled' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error aaya');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.comment.trim()) {
      alert('Comment likho'); return;
    }
    try {
      await API.post('/review', {
        editorId: reviewModal.editor._id,
        hiringRequestId: reviewModal._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
      fetchRequests();
      alert('Review submit ho gaya!');
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
    { label: 'Total Projects', value: requests.length },
    {
      label: 'Active Projects',
      value: requests.filter(r => r.status === 'accepted').length
    },
    {
      label: 'Completed',
      value: requests.filter(r => r.status === 'completed').length
    },
    {
      label: 'Total Spent',
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
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Apne projects manage karo
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

      {/* Header Row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
          Mere Projects
        </h2>
        <button
          onClick={() => navigate('/editors')}
          style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: '#6366F1', color: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
          + Editor Hire Karo
        </button>
      </div>

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
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Koi project nahi abhi tak</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Koi editor hire karo!</div>
          <button
            onClick={() => navigate('/editors')}
            style={{
              marginTop: 16, padding: '10px 24px', borderRadius: 10,
              border: 'none', background: '#6366F1', color: '#fff',
              cursor: 'pointer', fontWeight: 600, fontSize: 14
            }}>
            Browse Editors
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {requests.map(req => {
            const sc = statusColors[req.status] || statusColors.pending;
            return (
              <div key={req._id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: 16, padding: '18px 22px',
                display: 'flex', alignItems: 'center',
                gap: 16, flexWrap: 'wrap'
              }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: '#6366F1', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0
                }}>
                  {req.editor?.name?.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                    {req.projectTitle}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
                    with {req.editor?.name} ·{' '}
                    {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {/* Budget */}
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                  ${req.budget || 0}
                </div>

                {/* Status Badge */}
                <span style={{
                  background: sc.bg, color: sc.color,
                  borderRadius: 20, padding: '4px 12px',
                  fontSize: 12, fontWeight: 700, textTransform: 'capitalize'
                }}>{req.status}</span>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate(`/messages/${req.editor?._id}`)}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1.5px solid #E2E8F0', background: '#fff',
                      color: '#374151', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600
                    }}>Message</button>

                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      style={{
                        padding: '7px 14px', borderRadius: 8,
                        border: 'none', background: '#FEE2E2',
                        color: '#B91C1C', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600
                      }}>Cancel</button>
                  )}

                  {req.status === 'completed' && (
                    <button
                      onClick={() => setReviewModal(req)}
                      style={{
                        padding: '7px 14px', borderRadius: 8,
                        border: 'none', background: '#F59E0B',
                        color: '#fff', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600
                      }}>Review Do</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 1000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16
        }} onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%',
            maxWidth: 460, padding: 28,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                Review Do
              </h2>
              <button onClick={() => setReviewModal(null)} style={{
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 22, color: '#94A3B8'
              }}>×</button>
            </div>

            <p style={{ color: '#64748B', fontSize: 14, marginTop: 0 }}>
              <strong>{reviewModal.editor?.name}</strong> ke saath{' '}
              "{reviewModal.projectTitle}" ka experience kaisa tha?
            </p>

            {/* Star Rating */}
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 10
              }}>Rating</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: 4
                    }}>
                    <svg width="32" height="32" viewBox="0 0 24 24"
                      fill={i <= reviewForm.rating ? '#F59E0B' : 'none'}
                      stroke="#F59E0B" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Apna experience share karo..."
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                resize: 'vertical', boxSizing: 'border-box',
                marginBottom: 16, outline: 'none', fontFamily: 'inherit'
              }}
            />

            <button
              onClick={handleReviewSubmit}
              style={{
                width: '100%', padding: 12, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: '#6366F1', color: '#fff',
                fontWeight: 700, fontSize: 15
              }}>
              Review Submit Karo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;