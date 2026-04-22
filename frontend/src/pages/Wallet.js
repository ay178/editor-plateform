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
    <>
      <style>{`
        .wallet-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px 20px;
        }
        .balance-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .wallet-tabs {
          display: flex;
          background: #F1F5F9;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .wallet-tab {
          flex: 1;
          padding: 10px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s;
          text-align: center;
        }
        .funds-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .quick-amounts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .quick-amt-btn {
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          border: 2px solid #E2E8F0;
          background: #F8FAFC;
          font-weight: 700;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }
        .quick-amt-btn:hover {
          border-color: #6366F1;
          color: #6366F1;
          background: #EEF2FF;
        }
        .wallet-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #E2E8F0;
          font-size: 15px;
          font-weight: 600;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
          margin-bottom: 12px;
        }
        .wallet-input:focus {
          border-color: #6366F1;
        }
        .wallet-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
        }
        @media (max-width: 768px) {
          .wallet-container {
            padding: 16px 12px;
          }
          .balance-grid {
            grid-template-columns: 1fr 1fr;
          }
          .balance-grid > div:first-child {
            grid-column: span 2;
          }
          .funds-grid {
            grid-template-columns: 1fr;
          }
          .quick-amounts {
            grid-template-columns: repeat(3, 1fr);
          }
          .wallet-title {
            font-size: 22px !important;
          }
        }
        @media (max-width: 480px) {
          .wallet-tab {
            font-size: 12px;
            padding: 8px 4px;
          }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 16, zIndex: 2000,
          background: '#0F172A', color: '#fff',
          padding: '12px 20px', borderRadius: 12,
          fontWeight: 500, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: 'calc(100vw - 32px)'
        }}>{toast}</div>
      )}

      <div className="wallet-container">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="wallet-title" style={{
            fontSize: 26, fontWeight: 800, color: '#0F172A',
            margin: '0 0 6px', letterSpacing: '-0.5px'
          }}>
            💳 My Wallet
          </h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>
            Manage your funds and payment history
          </p>
        </div>

        {/* Balance Cards */}
        <div className="balance-grid">
          {/* Main Balance */}
          <div style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 18, padding: '22px',
            color: '#fff', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)'
            }} />
            <div style={{
              fontSize: 12, fontWeight: 600, opacity: 0.8,
              marginBottom: 8, textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Available Balance</div>
            <div style={{
              fontSize: 36, fontWeight: 900,
              marginBottom: 4, letterSpacing: '-1px'
            }}>
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Ready to use
            </div>
          </div>

          {/* Escrow */}
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 16, padding: '18px'
          }}>
            <div style={{
              fontSize: 11, color: '#94A3B8', fontWeight: 600,
              marginBottom: 6, textTransform: 'uppercase'
            }}>🔒 Escrow</div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: '#F59E0B'
            }}>
              ${wallet?.escrowBalance?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              Held until completion
            </div>
          </div>

          {/* Total */}
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 16, padding: '18px'
          }}>
            <div style={{
              fontSize: 11, color: '#94A3B8', fontWeight: 600,
              marginBottom: 6, textTransform: 'uppercase'
            }}>
              {user?.role === 'editor' ? '💰 Earned' : '💸 Spent'}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: user?.role === 'editor' ? '#10B981' : '#6366F1'
            }}>
              ${user?.role === 'editor'
                ? wallet?.totalEarned?.toFixed(2)
                : wallet?.totalSpent?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              All time
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          {[
            { key: 'overview', label: '💳 Overview' },
            { key: 'transactions', label: '📋 History' },
            { key: 'payments', label: '💼 Payments' },
          ].map(tab => (
            <button
              key={tab.key}
              className="wallet-tab"
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontWeight: activeTab === tab.key ? 700 : 500,
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#6366F1' : '#64748B',
                boxShadow: activeTab === tab.key
                  ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="funds-grid">

            {/* Add Funds */}
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 20, padding: 22
            }}>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: '#0F172A', margin: '0 0 18px'
              }}>➕ Add Funds</h3>

              <div className="quick-amounts">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    className="quick-amt-btn"
                    onClick={() => setAddFundsAmount(String(amt))}
                    style={{
                      borderColor: addFundsAmount === String(amt)
                        ? '#6366F1' : '#E2E8F0',
                      background: addFundsAmount === String(amt)
                        ? '#EEF2FF' : '#F8FAFC',
                      color: addFundsAmount === String(amt)
                        ? '#6366F1' : '#374151'
                    }}>
                    ${amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={addFundsAmount}
                onChange={e => setAddFundsAmount(e.target.value)}
                placeholder="Custom amount"
                className="wallet-input"
              />

              <button
                onClick={handleAddFunds}
                className="wallet-btn"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
                }}>
                Add Funds to Wallet
              </button>

              <div style={{
                marginTop: 12, padding: '10px 12px',
                background: '#F8FAFC', borderRadius: 10,
                fontSize: 12, color: '#64748B', lineHeight: 1.5
              }}>
                ℹ️ In production, this connects to Razorpay / Stripe
              </div>
            </div>

            {/* Withdraw — Editor only */}
            {user?.role === 'editor' ? (
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: 20, padding: 22
              }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 700,
                  color: '#0F172A', margin: '0 0 18px'
                }}>💸 Withdraw Funds</h3>

                <div style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  border: '1px solid #BBF7D0', borderRadius: 14,
                  padding: '16px', marginBottom: 18, textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 11, color: '#15803D',
                    fontWeight: 600, marginBottom: 4
                  }}>Available</div>
                  <div style={{
                    fontSize: 28, fontWeight: 900, color: '#15803D'
                  }}>
                    ${wallet?.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>

                {wallet?.escrowBalance > 0 && (
                  <div style={{
                    background: '#FFF7ED', border: '1px solid #FDE68A',
                    borderRadius: 10, padding: '10px 14px',
                    marginBottom: 14, fontSize: 12, color: '#92400E'
                  }}>
                    🔒 ${wallet.escrowBalance.toFixed(2)} locked in escrow
                  </div>
                )}

                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Amount to withdraw"
                  max={wallet?.balance}
                  className="wallet-input"
                />

                <button
                  onClick={handleWithdraw}
                  className="wallet-btn"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
                  }}>
                  Withdraw to Bank
                </button>
              </div>
            ) : (
              /* How Escrow Works — Client */
              <div style={{
                background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                borderRadius: 20, padding: 22, color: '#fff'
              }}>
                <h3 style={{
                  fontSize: 15, fontWeight: 700,
                  margin: '0 0 16px', opacity: 0.9
                }}>🔒 How Escrow Works</h3>
                {[
                  { icon: '🤝', title: 'Hire Editor', desc: 'Set your budget' },
                  { icon: '💳', title: 'Pay 50%', desc: '25% platform, 25% editor escrow' },
                  { icon: '🎬', title: 'Work Done', desc: 'Editor completes project' },
                  { icon: '✅', title: 'Pay Rest', desc: 'All funds released' },
                ].map(s => (
                  <div key={s.title} style={{
                    display: 'flex', gap: 12, marginBottom: 14,
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      fontSize: 22, flexShrink: 0, marginTop: 2
                    }}>{s.icon}</div>
                    <div>
                      <div style={{
                        fontWeight: 700, fontSize: 13, marginBottom: 2
                      }}>{s.title}</div>
                      <div style={{
                        fontSize: 12, opacity: 0.65
                      }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={{
            background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 20, padding: 22
          }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700,
              color: '#0F172A', margin: '0 0 18px'
            }}>Transaction History</h3>

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
                  const isPositive = ['deposit', 'escrow_release', 'refund']
                    .includes(tx.type);
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: '12px 14px',
                      background: '#F8FAFC', borderRadius: 12
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: ti.bg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0
                      }}>{ti.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: 13, color: '#0F172A',
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {tx.description}
                        </div>
                        <div style={{
                          fontSize: 11, color: '#94A3B8', marginTop: 2
                        }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div style={{
                        fontWeight: 800, fontSize: 15,
                        color: isPositive ? '#10B981' : '#EF4444',
                        flexShrink: 0
                      }}>
                        {isPositive ? '+' : '-'}${tx.amount.toFixed(2)}
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
            borderRadius: 20, padding: 22
          }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700,
              color: '#0F172A', margin: '0 0 18px'
            }}>Project Payments</h3>

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
                {payments.map(payment => (
                  <div key={payment._id} style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 14, padding: '16px 18px'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', flexWrap: 'wrap', gap: 8,
                      marginBottom: 12
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 700, fontSize: 14, color: '#0F172A'
                        }}>
                          {payment.hiringRequest?.projectTitle}
                        </div>
                        <div style={{
                          fontSize: 12, color: '#94A3B8', marginTop: 2
                        }}>
                          {user?.role === 'client'
                            ? `Editor: ${payment.editor?.name}`
                            : `Client: ${payment.client?.name}`}
                        </div>
                      </div>
                      <span style={{
                        background: payment.status === 'completed'
                          ? '#F0FDF4' : '#FFF7ED',
                        color: payment.status === 'completed'
                          ? '#15803D' : '#C2410C',
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>
                        {payment.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Payment breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                      gap: 8, background: '#F8FAFC',
                      borderRadius: 10, padding: '12px'
                    }}>
                      {[
                        {
                          label: 'Total',
                          value: `$${payment.totalAmount}`,
                          color: '#0F172A'
                        },
                        {
                          label: 'Advance',
                          value: `$${payment.advanceAmount}`,
                          color: '#F59E0B'
                        },
                        {
                          label: 'Platform',
                          value: `$${payment.platformFee}`,
                          color: '#64748B'
                        },
                        {
                          label: 'Remaining',
                          value: `$${payment.remainingAmount}`,
                          color: payment.status === 'completed'
                            ? '#10B981' : '#EF4444'
                        },
                      ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: 14, fontWeight: 800, color: item.color
                          }}>{item.value}</div>
                          <div style={{
                            fontSize: 10, color: '#94A3B8', marginTop: 2
                          }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Wallet;