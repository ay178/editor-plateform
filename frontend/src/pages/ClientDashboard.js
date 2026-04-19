import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchWallet();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

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

  const fetchWallet = async () => {
    try {
      const { data } = await API.get('/payment/wallet');
      setWallet(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.patch(`/hire/${id}/status`, { status: 'cancelled' });
      fetchRequests();
      showToast('Project cancelled');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handlePayAdvance = async (req) => {
    if (!req.budget) {
      alert('No budget set for this project'); return;
    }
    const advanceAmount = Math.round(req.budget * 0.5);
    if (wallet?.balance < advanceAmount) {
      const needed = advanceAmount - (wallet?.balance || 0);
      if (window.confirm(
        `Insufficient balance!\n\nRequired: $${advanceAmount}\nAvailable: $${wallet?.balance || 0}\nNeeded: $${needed}\n\nGo to wallet to add funds?`
      )) {
        navigate('/wallet');
      }
      return;
    }
    setPayModal(req);
  };

  const confirmPayAdvance = async () => {
    try {
      const { data } = await API.post('/payment/pay-advance', {
        hiringRequestId: payModal._id
      });
      setPayModal(null);
      fetchRequests();
      fetchWallet();
      showToast(`Advance payment of $${data.breakdown.advancePaid} sent successfully! 🎉`);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleFinalPayment = async (req) => {
    const remaining = req.budget * 0.5;
    if (wallet?.balance < remaining) {
      if (window.confirm(
        `Insufficient balance!\n\nRequired: $${remaining}\nAvailable: $${wallet?.balance || 0}\n\nGo to wallet to add funds?`
      )) {
        navigate('/wallet');
      }
      return;
    }
    if (window.confirm(`Pay remaining $${remaining} to complete project?`)) {
      try {
        await API.post('/payment/complete', {
          hiringRequestId: req._id
        });
        fetchRequests();
        fetchWallet();
        showToast('Final payment done! Project completed! 🎉');
      } catch (err) {
        alert(err.response?.data?.message || 'Payment failed');
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.comment.trim()) {
      alert('Please write a comment'); return;
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
      showToast('Review submitted! ⭐');
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

  const paymentStatusColors = {
    unpaid: { bg: '#FEF2F2', color: '#B91C1C' },
    advance_paid: { bg: '#FFF7ED', color: '#C2410C' },
    completed: { bg: '#F0FDF4', color: '#15803D' },
    refunded: { bg: '#EFF6FF', color: '#1D4ED8' }
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
      label: 'Wallet Balance',
      value: `$${wallet?.balance?.toFixed(2) || '0.00'}`
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? '#FEF2F2' : '#0F172A',
          color: toast.type === 'error' ? '#B91C1C' : '#fff',
          padding: '12px 20px', borderRadius: 12,
          fontWeight: 500, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: '#0F172A',
            margin: '0 0 6px', letterSpacing: '-0.5px'
          }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748B', margin: 0 }}>
            Manage your projects and payments
          </p>
        </div>
        <button
          onClick={() => navigate('/wallet')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
          💳 Wallet: ${wallet?.balance?.toFixed(2) || '0.00'}
        </button>
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
            borderRadius: 14, padding: '18px 20px',
            transition: 'all 0.2s', cursor: 'default'
          }}>
            <div style={{
              fontSize: 26, fontWeight: 800, color: '#6366F1'
            }}>{s.value}</div>
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
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A'
        }}>My Projects</h2>
        <button onClick={() => navigate('/editors')} style={{
          padding: '9px 18px', borderRadius: 10, border: 'none',
          background: '#6366F1', color: '#fff', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
        }}>+ Hire an Editor</button>
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
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#94A3B8'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            No projects yet
          </div>
          <button onClick={() => navigate('/editors')} style={{
            marginTop: 16, padding: '10px 24px', borderRadius: 10,
            border: 'none', background: '#6366F1', color: '#fff',
            cursor: 'pointer', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit'
          }}>Browse Editors</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(req => {
            const sc = statusColors[req.status] || statusColors.pending;
            const pc = paymentStatusColors[req.paymentStatus] || paymentStatusColors.unpaid;
            const advanceAmount = req.budget ? Math.round(req.budget * 0.5) : 0;
            const remainingAmount = req.budget ? Math.round(req.budget * 0.5) : 0;

            return (
              <div key={req._id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: 18, padding: '20px 22px',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: 14, flexWrap: 'wrap'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, flexShrink: 0
                  }}>
                    {req.editor?.name?.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15, color: '#0F172A'
                    }}>
                      {req.projectTitle}
                    </div>
                    <div style={{
                      fontSize: 13, color: '#94A3B8', marginTop: 2
                    }}>
                      with {req.editor?.name} ·{' '}
                      {new Date(req.createdAt).toLocaleDateString('en-US')}
                    </div>

                    {/* Status Badges */}
                    <div style={{
                      display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>{req.status}</span>

                      <span style={{
                        background: pc.bg, color: pc.color,
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700
                      }}>
                        💳 {req.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800, fontSize: 18, color: '#0F172A'
                    }}>
                      ${req.budget || 0}
                    </div>
                    <div style={{
                      fontSize: 11, color: '#94A3B8', marginTop: 2
                    }}>Total Budget</div>
                  </div>
                </div>

                {/* Payment Progress */}
                {req.budget && (
                  <div style={{
                    marginTop: 14, padding: '14px 16px',
                    background: '#F8FAFC', borderRadius: 12
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginBottom: 8, fontSize: 12, fontWeight: 600,
                      color: '#64748B'
                    }}>
                      <span>Payment Progress</span>
                      <span>
                        {req.paymentStatus === 'completed' ? '100%' :
                          req.paymentStatus === 'advance_paid' ? '50%' : '0%'}
                      </span>
                    </div>
                    <div style={{
                      height: 8, background: '#E2E8F0',
                      borderRadius: 4, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: 'linear-gradient(90deg, #6366F1, #10B981)',
                        width: req.paymentStatus === 'completed' ? '100%' :
                          req.paymentStatus === 'advance_paid' ? '50%' : '0%',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginTop: 8, fontSize: 11, color: '#94A3B8'
                    }}>
                      <span>Advance: ${advanceAmount}</span>
                      <span>Remaining: ${remainingAmount}</span>
                      <span>Total: ${req.budget}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex', gap: 8, marginTop: 14,
                  paddingTop: 14, borderTop: '1px solid #F1F5F9',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => navigate(`/messages/${req.editor?._id}`)}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: '1.5px solid #E2E8F0', background: '#fff',
                      color: '#374151', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
                    }}>
                    💬 Message
                  </button>

                  {/* Pay Advance Button */}
                  {req.status === 'accepted' &&
                    req.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => handlePayAdvance(req)}
                        style={{
                          padding: '8px 16px', borderRadius: 8,
                          border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                          color: '#fff', fontWeight: 700, fontSize: 13,
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px rgba(245,158,11,0.4)'
                        }}>
                        💳 Pay 50% Advance (${advanceAmount})
                      </button>
                    )}

                  {/* Final Payment Button */}
                  {req.status === 'accepted' &&
                    req.paymentStatus === 'advance_paid' && (
                      <button
                        onClick={() => handleFinalPayment(req)}
                        style={{
                          padding: '8px 16px', borderRadius: 8,
                          border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#fff', fontWeight: 700, fontSize: 13,
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px rgba(16,185,129,0.4)'
                        }}>
                        ✅ Pay Remaining (${remainingAmount})
                      </button>
                    )}

                  {/* Cancel Button */}
                  {req.status === 'pending' && (
                    <button onClick={() => handleCancel(req._id)} style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: 'none', background: '#FEE2E2',
                      color: '#B91C1C', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
                    }}>Cancel</button>
                  )}

                  {/* Review Button */}
                  {req.status === 'completed' &&
                    req.paymentStatus === 'completed' && (
                      <button onClick={() => setReviewModal(req)} style={{
                        padding: '8px 14px', borderRadius: 8,
                        border: 'none', background: '#F59E0B',
                        color: '#fff', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
                      }}>⭐ Review</button>
                    )}

                  {/* Add Funds Shortcut */}
                  {(req.paymentStatus === 'unpaid' ||
                    req.paymentStatus === 'advance_paid') && (
                      <button
                        onClick={() => navigate('/wallet')}
                        style={{
                          padding: '8px 14px', borderRadius: 8,
                          border: '1.5px solid #6366F1',
                          background: '#EEF2FF', color: '#6366F1',
                          cursor: 'pointer', fontSize: 13,
                          fontWeight: 600, fontFamily: 'inherit'
                        }}>
                        + Add Funds
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Advance Modal */}
      {payModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16
        }} onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 20,
            width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              padding: '20px 24px'
            }}>
              <h2 style={{
                margin: 0, fontSize: 20, fontWeight: 800, color: '#fff'
              }}>
                💳 Confirm Advance Payment
              </h2>
              <p style={{
                margin: '4px 0 0', fontSize: 13,
                color: 'rgba(255,255,255,0.85)'
              }}>
                Secure escrow payment for your project
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Project Info */}
              <div style={{
                background: '#F8FAFC', borderRadius: 12,
                padding: '14px 16px', marginBottom: 20
              }}>
                <div style={{
                  fontWeight: 700, fontSize: 15, color: '#0F172A'
                }}>
                  {payModal.projectTitle}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  Editor: {payModal.editor?.name}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ marginBottom: 20 }}>
                {[
                  {
                    label: 'Total Budget',
                    value: `$${payModal.budget}`,
                    color: '#0F172A', big: false
                  },
                  {
                    label: 'Advance (50%)',
                    value: `$${Math.round(payModal.budget * 0.5)}`,
                    color: '#F59E0B', big: true
                  },
                  {
                    label: '→ Platform Escrow (25%)',
                    value: `$${Math.round(payModal.budget * 0.25)}`,
                    color: '#64748B', big: false
                  },
                  {
                    label: '→ Editor Escrow (25%)',
                    value: `$${Math.round(payModal.budget * 0.25)}`,
                    color: '#6366F1', big: false
                  },
                  {
                    label: 'Remaining (after completion)',
                    value: `$${Math.round(payModal.budget * 0.5)}`,
                    color: '#10B981', big: false
                  },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '8px 0',
                    borderBottom: '1px solid #F1F5F9'
                  }}>
                    <span style={{
                      fontSize: item.big ? 14 : 13,
                      color: '#64748B', fontWeight: item.big ? 600 : 400
                    }}>{item.label}</span>
                    <span style={{
                      fontWeight: item.big ? 800 : 600,
                      fontSize: item.big ? 16 : 14,
                      color: item.color
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Wallet Balance */}
              <div style={{
                background: wallet?.balance >= Math.round(payModal.budget * 0.5)
                  ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${wallet?.balance >= Math.round(payModal.budget * 0.5)
                  ? '#BBF7D0' : '#FECACA'}`,
                borderRadius: 10, padding: '10px 14px',
                marginBottom: 16, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Wallet Balance
                </span>
                <span style={{
                  fontWeight: 800, fontSize: 15,
                  color: wallet?.balance >= Math.round(payModal.budget * 0.5)
                    ? '#15803D' : '#B91C1C'
                }}>
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPayModal(null)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 12,
                    border: '1.5px solid #E2E8F0', background: '#fff',
                    color: '#374151', cursor: 'pointer',
                    fontWeight: 600, fontSize: 14, fontFamily: 'inherit'
                  }}>Cancel</button>
                <button
                  onClick={confirmPayAdvance}
                  style={{
                    flex: 2, padding: 12, borderRadius: 12,
                    border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.4)'
                  }}>
                  💳 Pay ${Math.round(payModal.budget * 0.5)} Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 16
        }} onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 16,
            width: '100%', maxWidth: 460, padding: 28,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16
            }}>
              <h2 style={{
                margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A'
              }}>Leave a Review</h2>
              <button onClick={() => setReviewModal(null)} style={{
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 22, color: '#94A3B8'
              }}>×</button>
            </div>

            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 10
              }}>Rating</div>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 8
              }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i}
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

            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({
                ...f, comment: e.target.value
              }))}
              placeholder="Share your experience..."
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14,
                resize: 'vertical', boxSizing: 'border-box',
                marginBottom: 16, outline: 'none', fontFamily: 'inherit'
              }}
            />

            <button onClick={handleReviewSubmit} style={{
              width: '100%', padding: 12, borderRadius: 12,
              border: 'none', cursor: 'pointer',
              background: '#6366F1', color: '#fff',
              fontWeight: 700, fontSize: 15, fontFamily: 'inherit'
            }}>
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;