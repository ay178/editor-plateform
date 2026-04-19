import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchPayments();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/payment/wallet');
      setWallet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await API.get('/payment/history');
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async () => {
    if (!addFundsAmount || addFundsAmount <= 0) {
      alert('Enter valid amount'); return;
    }
    try {
      const { data } = await API.post('/payment/add-funds', {
        amount: Number(addFundsAmount)
      });
      setWallet(data.wallet);
      setAddFundsAmount('');
      showToast(`$${addFundsAmount} added successfully! 🎉`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Enter valid amount'); return;
    }
    try {
      const { data } = await API.post('/payment/withdraw', {
        amount: Number(withdrawAmount)
      });
      setWallet(data.wallet);
      setWithdrawAmount('');
      showToast(`$${withdrawAmount} withdrawn successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return { icon: '➕', color: '#10B981', bg: '#F0FDF4' };
      case 'withdrawal': return { icon: '💸', color: '#EF4444', bg: '#FEF2F2' };
      case 'escrow_hold': return { icon: '🔒', color: '#F59E0B', bg: '#FFF7ED' };
      case 'escrow_release': return { icon: '🔓', color: '#6366F1', bg: '#EEF2FF' };
      case 'platform_fee': return { icon: '🏛️', color: '#64748B', bg: '#F1F5F9' };
      case 'refund': return { icon: '↩️', color: '#10B981', bg: '#F0FDF4' };
      default: return { icon: '💰', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'advance_paid': return { bg: '#FFF7ED', color: '#C2410C' };
      case 'completed': return { bg: '#F0FDF4', color: '#15803D' };
      case 'refunded': return { bg: '#EFF6FF', color: '#1D4ED8' };
      case 'disputed': return { bg: '#FEF2F2', color: '#B91C1C' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

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

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: '#0F172A', color: '#fff',
          padding: '12px 20px', borderRadius: 12,
          fontWeight: 500, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'fadeUp 0.3s ease'
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#0F172A',
          margin: '0 0 6px', letterSpacing: '-0.5px'
        }}>
          💳 My Wallet
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Manage your funds and payment history
        </p>
      </div>

      {/* Balance Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28
      }}>

        {/* Main Balance */}
        <div style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          borderRadius: 20, padding: '24px',
          color: '#fff', gridColumn: 'span 2',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)'
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 40,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)'
          }} />
          <div style={{
            fontSize: 13, fontWeight: 600,
            opacity: 0.8, marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            Available Balance
          </div>
          <div style={{
            fontSize: 42, fontWeight: 900,
            marginBottom: 4, letterSpacing: '-1px'
          }}>
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Ready to use
          </div>
        </div>

        {/* Escrow Balance */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '20px'
        }}>
          <div style={{
            fontSize: 12, color: '#94A3B8', fontWeight: 600,
            marginBottom: 8, textTransform: 'uppercase'
          }}>
            🔒 In Escrow
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: '#F59E0B'
          }}>
            ${wallet?.escrowBalance?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Held until project completion
          </div>
        </div>

        {/* Total Earned/Spent */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '20px'
        }}>
          <div style={{
            fontSize: 12, color: '#94A3B8', fontWeight: 600,
            marginBottom: 8, textTransform: 'uppercase'
          }}>
            {user?.role === 'editor' ? '💰 Total Earned' : '💸 Total Spent'}
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800,
            color: user?.role === 'editor' ? '#10B981' : '#6366F1'
          }}>
            ${user?.role === 'editor'
              ? wallet?.totalEarned?.toFixed(2)
              : wallet?.totalSpent?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            All time
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: '#F1F5F9',
        borderRadius: 12, padding: 4, marginBottom: 24
      }}>
        {[
          { key: 'overview', label: '💳 Overview' },
          { key: 'transactions', label: '📋 Transactions' },
          { key: 'payments', label: '💼 Payments' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: 9,
              border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: 13, fontFamily: 'inherit',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#6366F1' : '#64748B',
              boxShadow: activeTab === tab.key
                ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>{tab.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: user?.role === 'client' ? '1fr' : '1fr 1fr',
          gap: 20
        }}>

          {/* Add Funds — Both roles */}
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 20, padding: 24
          }}>
            <h3 style={{
              fontSize: 17, fontWeight: 700,
              color: '#0F172A', margin: '0 0 20px',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ➕ Add Funds
            </h3>

            {/* Quick amounts */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8, marginBottom: 16
            }}>
              {quickAmounts.map(amt => (
                <button key={amt}
                  onClick={() => setAddFundsAmount(String(amt))}
                  style={{
                    padding: '10px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${addFundsAmount === String(amt)
                      ? '#6366F1' : '#E2E8F0'}`,
                    background: addFundsAmount === String(amt)
                      ? '#EEF2FF' : '#F8FAFC',
                    color: addFundsAmount === String(amt)
                      ? '#6366F1' : '#374151',
                    fontWeight: 700, fontSize: 14,
                    fontFamily: 'inherit', transition: 'all 0.2s'
                  }}>
                  ${amt}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <input
                type="number"
                value={addFundsAmount}
                onChange={e => setAddFundsAmount(e.target.value)}
                placeholder="Or enter custom amount"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid #E2E8F0', fontSize: 15,
                  boxSizing: 'border-box', outline: 'none',
                  fontFamily: 'inherit', fontWeight: 600
                }}
              />
            </div>

            <button onClick={handleAddFunds} style={{
              width: '100%', padding: 13, borderRadius: 12,
              border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
            }}>
              Add Funds to Wallet
            </button>

            <div style={{
              marginTop: 14, padding: '12px 14px',
              background: '#F8FAFC', borderRadius: 10,
              fontSize: 12, color: '#64748B', lineHeight: 1.6
            }}>
              ℹ️ In production, this would connect to a real payment gateway
              like Stripe or Razorpay
            </div>
          </div>

          {/* Withdraw — Editor only */}
          {user?.role === 'editor' && (
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 20, padding: 24
            }}>
              <h3 style={{
                fontSize: 17, fontWeight: 700,
                color: '#0F172A', margin: '0 0 20px',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                💸 Withdraw Funds
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                border: '1px solid #BBF7D0', borderRadius: 14,
                padding: '16px', marginBottom: 20, textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 12, color: '#15803D', fontWeight: 600,
                  marginBottom: 4
                }}>Available to Withdraw</div>
                <div style={{
                  fontSize: 32, fontWeight: 900, color: '#15803D'
                }}>
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </div>
              </div>

              {wallet?.escrowBalance > 0 && (
                <div style={{
                  background: '#FFF7ED', border: '1px solid #FDE68A',
                  borderRadius: 10, padding: '10px 14px',
                  marginBottom: 16, fontSize: 13, color: '#92400E'
                }}>
                  🔒 ${wallet.escrowBalance.toFixed(2)} is locked in escrow
                  until projects complete
                </div>
              )}

              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="Amount to withdraw"
                max={wallet?.balance}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid #E2E8F0', fontSize: 15,
                  boxSizing: 'border-box', outline: 'none',
                  fontFamily: 'inherit', marginBottom: 14, fontWeight: 600
                }}
              />

              <button onClick={handleWithdraw} style={{
                width: '100%', padding: 13, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
              }}>
                Withdraw to Bank Account
              </button>
            </div>
          )}

          {/* How Escrow Works */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            borderRadius: 20, padding: 24, color: '#fff',
            gridColumn: user?.role === 'client' ? 'span 1' : 'span 2'
          }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700,
              margin: '0 0 16px', opacity: 0.9
            }}>
              🔒 How Escrow Payment Works
            </h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14
            }}>
              {[
                {
                  step: '1',
                  icon: '🤝',
                  title: 'Project Hired',
                  desc: 'Client hires editor and sets budget'
                },
                {
                  step: '2',
                  icon: '💳',
                  title: '50% Advance',
                  desc: 'Client pays 50% — 25% to platform escrow, 25% to editor'
                },
                {
                  step: '3',
                  icon: '🎬',
                  title: 'Work in Progress',
                  desc: 'Editor works on the project'
                },
                {
                  step: '4',
                  icon: '✅',
                  title: 'Project Complete',
                  desc: 'Client pays remaining 50%, all funds released'
                },
              ].map(s => (
                <div key={s.step} style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{
                    fontWeight: 700, fontSize: 13, marginBottom: 4
                  }}>{s.title}</div>
                  <div style={{
                    fontSize: 12, opacity: 0.65, lineHeight: 1.5
                  }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 24
        }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700,
            color: '#0F172A', margin: '0 0 20px'
          }}>
            Transaction History
          </h3>

          {!wallet?.transactions?.length ? (
            <div style={{
              textAlign: 'center', padding: '40px 0', color: '#94A3B8'
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                No transactions yet
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10
            }}>
              {[...wallet.transactions].reverse().map((tx, i) => {
                const ti = getTransactionIcon(tx.type);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    gap: 14, padding: '14px 16px',
                    background: '#F8FAFC', borderRadius: 14,
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: ti.bg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0
                    }}>{ti.icon}</div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14, color: '#0F172A'
                      }}>
                        {tx.description}
                      </div>
                      <div style={{
                        fontSize: 12, color: '#94A3B8', marginTop: 2
                      }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short',
                          year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div style={{
                      fontWeight: 800, fontSize: 16,
                      color: ['deposit', 'escrow_release', 'refund']
                        .includes(tx.type) ? '#10B981' : '#EF4444'
                    }}>
                      {['deposit', 'escrow_release', 'refund']
                        .includes(tx.type) ? '+' : '-'}
                      ${tx.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 24
        }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700,
            color: '#0F172A', margin: '0 0 20px'
          }}>
            Project Payments
          </h3>

          {!payments.length ? (
            <div style={{
              textAlign: 'center', padding: '40px 0', color: '#94A3B8'
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💼</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                No payments yet
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14
            }}>
              {payments.map(payment => {
                const sc = getPaymentStatusColor(payment.status);
                return (
                  <div key={payment._id} style={{
                    border: '1px solid #E2E8F0', borderRadius: 16,
                    padding: '18px 20px'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 12
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 700, fontSize: 15, color: '#0F172A'
                        }}>
                          {payment.hiringRequest?.projectTitle}
                        </div>
                        <div style={{
                          fontSize: 13, color: '#94A3B8', marginTop: 2
                        }}>
                          {user?.role === 'client'
                            ? `Editor: ${payment.editor?.name}`
                            : `Client: ${payment.client?.name}`}
                        </div>
                      </div>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        borderRadius: 20, padding: '4px 12px',
                        fontSize: 12, fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>
                        {payment.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Payment Breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 10, marginTop: 14,
                      padding: '14px', background: '#F8FAFC', borderRadius: 12
                    }}>
                      {[
                        {
                          label: 'Total Budget',
                          value: `$${payment.totalAmount}`,
                          color: '#0F172A'
                        },
                        {
                          label: 'Advance Paid',
                          value: `$${payment.advanceAmount}`,
                          color: '#F59E0B'
                        },
                        {
                          label: 'Platform Fee',
                          value: `$${payment.platformFee}`,
                          color: '#64748B'
                        },
                        {
                          label: 'Editor Escrow',
                          value: `$${payment.editorAdvance}`,
                          color: '#6366F1'
                        },
                        {
                          label: 'Remaining Due',
                          value: `$${payment.remainingAmount}`,
                          color: payment.status === 'completed'
                            ? '#10B981' : '#EF4444'
                        },
                      ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: 16, fontWeight: 800, color: item.color
                          }}>{item.value}</div>
                          <div style={{
                            fontSize: 11, color: '#94A3B8', marginTop: 2
                          }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;