import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProjectFiles from '../components/ProjectFiles';
import Icon from'../components/Icon';

function Stars({ n }) {
  return <span className="stars">{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>;
}

function StatusPill({ status }) {
  return <span className={`status status-${status}`}>{status}</span>;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [reviewModal, setReviewModal] = useState(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'client') return navigate('/dashboard/editor');
    api.get('/hire').then(r => setRequests(r.data)).finally(() => setLoading(false));
  }, [user]);

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  const updateStatus = async (id, status) => {
    await api.patch(`/hire/${id}/status`, { status });
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
  };

  const stats = {
    total: requests.length,
    active: requests.filter(r => ['pending','accepted'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    spent: requests.filter(r => r.status === 'completed').reduce((a, r) => a + (r.budget || 0), 0),
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#9B9AB8', fontSize: 14 }}>Welcome back,</p>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>{user?.name}</h1>
        </div>

        <div className="grid-4" style={{ marginBottom: 36 }}>
          {[
            { label: 'Total Requests', value: stats.total, color: '#7C3AED' },
            { label: 'Active Projects', value: stats.active, color: '#06B6D4' },
            { label: 'Completed', value: stats.completed, color: '#10B981' },
            { label: 'Total Spent', value: `$${stats.spent}`, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#9B9AB8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              background: tab === t ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: tab === t ? '#9F67FF' : '#9B9AB8',
              textTransform: 'capitalize', transition: 'all 0.2s'
            }}>{t}</button>
          ))}
        </div>

        {loading ? <p style={{ color: '#9B9AB8' }}>Loading...</p>
          : filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ color: '#9F67FF', marginBottom: 12 }}><Icon name="inbox"size={34} /></div>
              <p style={{ color: '#9B9AB8' }}>No {tab !== 'all' ? tab : ''} requests yet.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/browse')}>Browse Editors</button>
            </div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(req => (
                <RequestCard key={req._id} req={req} role="client"
                  onCancel={() => updateStatus(req._id, 'cancelled')}
                  onComplete={() => updateStatus(req._id, 'completed')}
                  onReview={() => setReviewModal(req)}
                  onMessage={() => navigate(`/messages?with=${req.editor?._id}`)}
                />
              ))}
            </div>
          )}
      </div>

      {reviewModal && (
        <ReviewModal req={reviewModal} onClose={() => setReviewModal(null)}
          onDone={() => { setReviewModal(null); api.get('/hire').then(r => setRequests(r.data)); }} />
      )}
    </div>
  );
}

export function RequestCard({ req, role, onCancel, onComplete, onReview, onMessage, onAccept, onReject }) {
  const navigate = useNavigate();
  const trackable = ['accepted', 'scheduled', 'completed'].includes(req.status);
  const other = role === 'client' ? req.editor : req.client;
  return (
    <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Top row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <img src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
          alt={other?.name} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{req.projectTitle}</span>
            <span className={`status status-${req.status}`}>{req.status}</span>
          </div>
          <div style={{ fontSize: 13, color: '#9B9AB8', marginBottom: 6 }}>
            {role === 'client' ? `Editor: ${other?.name}` : `Client: ${other?.name}`}
            {req.budget && ` · $${req.budget}`}
            {req.deadline && ` · Due ${new Date(req.deadline).toLocaleDateString()}`}
          </div>
          <p style={{ fontSize: 13, color: '#9B9AB8', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {req.description}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {onMessage && (
            <button className="btn-ghost"style={{ padding: '7px 14px', fontSize: 13 }} onClick={onMessage}>Chat</button>
          )}
          {trackable && (
            <button className="btn-ghost"style={{ padding: '7px 14px', fontSize: 13 }} onClick={() =>navigate(`/project/${req._id}`)}>Track{req.tracking?.progress ? ` · ${req.tracking.progress}%` : ''}</button>
          )}
          {role === 'editor' && req.status === 'pending' && (
            <>
              <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={onAccept}>Accept</button>
              <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={onReject}>Reject</button>
            </>
          )}
          {role === 'client' && req.status === 'accepted' && (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={onComplete}>Mark Complete</button>
          )}
          {role === 'client' && req.status === 'pending' && (
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, color: '#EF4444' }} onClick={onCancel}>Cancel</button>
          )}
          {role === 'client' && req.status === 'completed' && onReview && (
            <button className="btn-ghost"style={{ padding: '7px 14px', fontSize: 13, color: '#F59E0B' }} onClick={onReview}>Review</button>
          )}
        </div>
      </div>

      {/* File sharing — only for accepted/completed */}
      <ProjectFiles requestId={req._id} requestStatus={req.status} />
    </div>
  );
}

function ReviewModal({ req, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/review', { editorId: req.editor?._id, hiringRequestId: req._id, rating, comment });
      onDone();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>Leave a Review</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9B9AB8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 8 }}>Rating</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? '#F59E0B' : '#5C5B7A', transition: 'color 0.15s' }}>★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: '#9B9AB8', display: 'block', marginBottom: 6 }}>Comment</label>
            <textarea className="input" value={comment} onChange={e => setComment(e.target.value)} required rows={4} placeholder="Share your experience..." />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            {loading ? 'Submitting...' : 'Submit Review →'}
          </button>
        </form>
      </div>
    </div>
  );
}
