import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/payment/wallet')
      .then(r => setWallet(r.data))
      .catch(() => setWallet({ balance: 0, escrowBalance: 0, totalSpent: 0, totalEarned: 0, transactions: [] }))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9B9AB8' }}>Loading wallet...</p>
    </div>
  );

  const isEditor = user?.role === 'editor';

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>💰 My Wallet</h1>
          <p style={{ color: '#9B9AB8', marginTop: 4 }}>Manage your earnings and payments</p>
        </div>

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: 16, padding: 24, textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>Available Balance</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>In Escrow</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>
              ${wallet?.escrowBalance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>
              {isEditor ? 'Total Earned' : 'Total Spent'}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#7C3AED' }}>
              ${isEditor
                ? wallet?.totalEarned?.toFixed(2) || '0.00'
                : wallet?.totalSpent?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* How escrow works */}
        <div style={{
          background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 28,
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#06B6D4', marginBottom: 4 }}>How Escrow Works</div>
            <p style={{ fontSize: 13, color: '#9B9AB8', lineHeight: 1.6 }}>
              When a client pays, funds go into escrow. Once the project is marked complete,
              funds are released to the editor minus a small platform fee. This protects both parties.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Transaction History</h3>

          {!wallet?.transactions?.length ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
              <p style={{ color: '#9B9AB8' }}>No transactions yet</p>
              <p style={{ color: '#5C5B7A', fontSize: 13, marginTop: 4 }}>
                {isEditor ? 'Complete projects to start earning!' : 'Hire an editor to get started!'}
              </p>
              <button className="btn-primary" style={{ marginTop: 20 }}
                onClick={() => navigate(isEditor ? '/dashboard/editor' : '/browse')}>
                {isEditor ? 'View Requests →' : 'Browse Editors →'}
              </button>
            </div>
          ) : (
            <div>
              {wallet.transactions.map((tx, i) => {
                const isCredit = ['deposit', 'escrow_release', 'refund'].includes(tx.type);
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: i < wallet.transactions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
                      }}>
                        {tx.type === 'deposit' ? '💰'
                          : tx.type === 'escrow_hold' ? '🔒'
                          : tx.type === 'escrow_release' ? '✅'
                          : tx.type === 'platform_fee' ? '🏛️'
                          : tx.type === 'refund' ? '↩️'
                          : tx.type === 'withdrawal' ? '📤' : '💳'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>
                          {tx.type.replace(/_/g, ' ')}
                        </div>
                        {tx.description && (
                          <div style={{ fontSize: 12, color: '#9B9AB8', marginTop: 2 }}>{tx.description}</div>
                        )}
                        <div style={{ fontSize: 12, color: '#5C5B7A', marginTop: 2 }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isCredit ? '#10B981' : '#EF4444' }}>
                        {isCredit ? '+' : '-'}${tx.amount?.toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: 11, marginTop: 2,
                        color: tx.status === 'completed' ? '#10B981' : tx.status === 'pending' ? '#F59E0B' : '#EF4444'
                      }}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
