import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Icon from'../components/Icon';

const EMPTY_FORM = { accountHolderName: '', bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '' };

const labelStyle = { display: 'block', fontSize: 12, color: '#9B9AB8', marginBottom: 6 };

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor payout details
  const [bank, setBank] = useState(null);           // { hasAccount, ... } | null while loading
  const [editingBank, setEditingBank] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingBank, setSavingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState(null);     // { type: 'ok' | 'err', text }

  // Withdraw
  const [amount, setAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState(null);

  const isEditor = user?.role === 'editor';

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/payment/wallet')
      .then(r => setWallet(r.data))
      .catch(() => setWallet({ balance: 0, escrowBalance: 0, totalSpent: 0, totalEarned: 0, transactions: [] }))
      .finally(() => setLoading(false));

    if (user.role === 'editor') {
      api.get('/bank')
        .then(r => setBank(r.data))
        .catch(() => setBank({ hasAccount: false }));
    }
  }, [user]);

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const saveBank = async (e) => {
    e.preventDefault();
    setSavingBank(true);
    setBankMsg(null);
    try {
      const { data } = await api.put('/bank', form);
      setBank(data);
      setForm(EMPTY_FORM);
      setEditingBank(false);
      setBankMsg({ type: 'ok', text: 'Bank account saved.' });
    } catch (err) {
      setBankMsg({ type: 'err', text: err.response?.data?.message || 'Could not save bank account' });
    } finally {
      setSavingBank(false);
    }
  };

  const removeBank = async () => {
    if (!window.confirm('Remove your saved bank account?')) return;
    try {
      const { data } = await api.delete('/bank');
      setBank(data);
      setBankMsg({ type: 'ok', text: 'Bank account removed.' });
    } catch (err) {
      setBankMsg({ type: 'err', text: err.response?.data?.message || 'Could not remove bank account' });
    }
  };

  const withdraw = async (e) => {
    e.preventDefault();
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const { data } = await api.post('/payment/withdraw', { amount: Number(amount) });
      setWallet(data.wallet);
      setAmount('');
      setWithdrawMsg({ type: 'ok', text: data.message });
    } catch (err) {
      setWithdrawMsg({ type: 'err', text: err.response?.data?.message || 'Withdrawal failed' });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9B9AB8' }}>Loading wallet...</p>
    </div>
  );

  const showForm = editingBank || (bank && !bank.hasAccount);

  const Msg = ({ m }) => !m ? null : (
    <div style={{
      marginTop: 12, fontSize: 13, padding: '10px 14px', borderRadius: 10,
      color: m.type === 'ok' ? '#10B981' : '#EF4444',
      background: m.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
    }}>{m.text}</div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>My Wallet</h1>
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
              ₹{wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>In Escrow</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>
              ₹{wallet?.escrowBalance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 8 }}>
              {isEditor ? 'Total Earned' : 'Total Spent'}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#7C3AED' }}>
              ₹{isEditor
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
          <span style={{ color: '#06B6D4', display: 'inline-flex' }}><Icon name="info"size={20} /></span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#06B6D4', marginBottom: 4 }}>How Escrow Works</div>
            <p style={{ fontSize: 13, color: '#9B9AB8', lineHeight: 1.6 }}>
              When a client pays, funds go into escrow. Once the project is marked complete,
              funds are released to the editor minus a small platform fee. This protects both parties.
            </p>
          </div>
        </div>

        {/* ── Editor only: bank account + withdraw ── */}
        {isEditor && bank && (
          <>
            <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Bank Account</h3>
                {bank.hasAccount && !editingBank && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={() => { setEditingBank(true); setBankMsg(null); }}>Change</button>
                    <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={removeBank}>Remove</button>
                  </div>
                )}
              </div>

              {bank.hasAccount && !editingBank && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
                  <div><div style={labelStyle}>Account holder</div>{bank.accountHolderName}</div>
                  <div><div style={labelStyle}>Bank</div>{bank.bankName}</div>
                  <div><div style={labelStyle}>Account number</div>{bank.accountNumberMasked}</div>
                  <div><div style={labelStyle}>IFSC</div>{bank.ifsc}</div>
                </div>
              )}

              {showForm && (
                <form onSubmit={saveBank}>
                  {!bank.hasAccount && (
                    <p style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 16, lineHeight: 1.6 }}>
                      Add the bank account where you want to receive your earnings.
                      The account must be in your own name.
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Account holder name</label>
                      <input className="input" value={form.accountHolderName} onChange={setField('accountHolderName')}
                        placeholder="As on your bank account" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Bank name</label>
                      <input className="input" value={form.bankName} onChange={setField('bankName')}
                        placeholder="e.g. State Bank of India" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Account number</label>
                      <input className="input" value={form.accountNumber} onChange={setField('accountNumber')}
                        inputMode="numeric" autoComplete="off" placeholder="9 to 18 digits" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirm account number</label>
                      <input className="input" value={form.confirmAccountNumber} onChange={setField('confirmAccountNumber')}
                        inputMode="numeric" autoComplete="off" placeholder="Re-enter account number" required />
                    </div>
                    <div>
                      <label style={labelStyle}>IFSC code</label>
                      <input className="input" value={form.ifsc}
                        onChange={(e) => setForm(f => ({ ...f, ifsc: e.target.value.toUpperCase() }))}
                        maxLength={11} placeholder="e.g. SBIN0001234" required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button className="btn-primary" type="submit" disabled={savingBank}>
                      {savingBank ? 'Saving...' : 'Save bank account'}
                    </button>
                    {bank.hasAccount && (
                      <button type="button" className="btn-ghost"
                        onClick={() => { setEditingBank(false); setForm(EMPTY_FORM); setBankMsg(null); }}>Cancel</button>
                    )}
                  </div>
                </form>
              )}
              <Msg m={bankMsg} />
            </div>

            <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Withdraw Earnings</h3>
              <p style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 16 }}>
                Available: ₹{wallet?.balance?.toFixed(2) || '0.00'}
                {bank.hasAccount
                  ? ` · Payout goes to ${bank.bankName} ${bank.accountNumberMasked}`
                  : ' · Add a bank account above to withdraw'}
              </p>
              <form onSubmit={withdraw} style={{ display: 'flex', gap: 10 }}>
                <input className="input" type="number" min="1" step="0.01" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder="Amount in ₹"
                  disabled={!bank.hasAccount} required style={{ maxWidth: 220 }} />
                <button className="btn-primary" type="submit" disabled={!bank.hasAccount || withdrawing}>
                  {withdrawing ? 'Requesting...' : 'Withdraw'}
                </button>
              </form>
              <Msg m={withdrawMsg} />
              <p style={{ fontSize: 12, color: '#5C5B7A', marginTop: 12 }}>
                Withdrawals show as “pending” until the transfer to your bank is completed.
              </p>
            </div>
          </>
        )}

        {/* Transaction History */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Transaction History</h3>

          {!wallet?.transactions?.length ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ color: '#9F67FF', marginBottom: 12 }}><Icon name="card"size={40} /></div>
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
                  <div key={tx._id || i} style={{
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
                        <Icon size={18} name={({ deposit: 'wallet', escrow_hold: 'lock', escrow_release: 'check-circle',
                          platform_fee: 'bank', refund: 'undo', withdrawal: 'upload' })[tx.type] || 'card'} />
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
                        {isCredit ? '+' : '-'}₹{tx.amount?.toFixed(2)}
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
