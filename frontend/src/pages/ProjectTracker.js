import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STAGE_LABELS = {
  accepted: 'Accepted',
  footage_received: 'Footage received',
  rough_cut: 'Rough cut',
  fine_cut: 'Fine cut',
  color_audio: 'Colour & audio',
  review: 'In review',
  delivered: 'Delivered'
};

const label = (k) => STAGE_LABELS[k] || k;
const when = (d) => new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function ProjectTracker() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  // Editor's update form
  const [stage, setStage] = useState('rough_cut');
  const [progress, setProgress] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const socketRef = useRef(null);

  const isEditor = user?.role === 'editor';

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/tracking/${id}`);
      setProject(data);
      setError('');
      setStage(prev => (data.tracking?.stage && data.tracking.stage !== 'accepted') ? data.tracking.stage : prev);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this project');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Add one update to the page (from a live event or from our own POST); never twice.
  const merge = useCallback((u) => {
    setProject(prev => {
      if (!prev) return prev;
      const t = prev.tracking || { updates: [] };
      if ((t.updates || []).some(e => e._id === u.entry._id)) return prev;
      return {
        ...prev,
        status: u.entry.kind === 'system' && u.progress === 100 ? 'completed' : prev.status,
        tracking: {
          ...t,
          stage: u.stage ?? t.stage,
          progress: u.progress ?? t.progress,
          updates: [...(t.updates || []), u.entry]
        }
      };
    });
  }, []);


  // Live updates: join the project's room (server checks we belong to it).
  useEffect(() => {
    if (!project) return undefined;
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    const join = () => socket.emit('tracking:join',
      { requestId: id, token: localStorage.getItem('token') },
      (res) => setLive(!!res?.ok));

    socket.on('connect', join);
    socket.on('disconnect', () => setLive(false));
    socket.on('tracking:update', (u) => { if (u.requestId === id) merge(u); });

    return () => {
      socket.emit('tracking:leave', { requestId: id });
      socket.disconnect();
    };
  }, [project?._id, id, merge]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormMsg(null);
    try {
      const body = { stage, note };
      if (progress !== '') body.progress = Number(progress);
      const { data } = await api.post(`/tracking/${id}/update`, body);
      merge(data);   // show it at once; the live event for the same entry is ignored
      setNote(''); setProgress('');
      setFormMsg({ type: 'ok', text: 'Update posted' });
    } catch (err) {
      setFormMsg({ type: 'err', text: err.response?.data?.message || 'Could not post update' });
    } finally {
      setSaving(false);
    }
  };

  const back = () => navigate(isEditor ? '/dashboard/editor' : '/dashboard/client');

  if (error) {
    return (
      <div className="page"><div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
        <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>
        <button className="btn-ghost" onClick={back}>Back to dashboard</button>
      </div></div>
    );
  }
  if (!project) {
    return <div className="page"><div className="container" style={{ paddingTop: 48, color: '#9B9AB8' }}>Loading…</div></div>;
  }

  const t = project.tracking || { stage: 'accepted', progress: 0, updates: [] };
  const stageKeys = project.stages.map(s => s.key);
  const currentIdx = Math.max(0, stageKeys.indexOf(t.stage));
  const updates = [...(t.updates || [])].reverse();
  const canPost = isEditor && ['accepted', 'scheduled'].includes(project.status);
  const other = isEditor ? project.client : project.editor;
  const overdue = project.deadline && project.status !== 'completed' && new Date(project.deadline) < new Date();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 820, paddingTop: 32, paddingBottom: 64 }}>
        <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13, marginBottom: 20 }} onClick={back}>← Back</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{project.projectTitle}</h1>
            <div style={{ fontSize: 13, color: '#9B9AB8' }}>
              {isEditor ? 'Client' : 'Editor'}: {other?.name}
              {project.deadline && <> · Due {new Date(project.deadline).toLocaleDateString()}{overdue && <span style={{ color: '#EF4444' }}> (overdue)</span>}</>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`status status-${project.status}`}>{project.status}</span>
            <span title={live ? 'Receiving live updates' : 'Not connected — refresh to retry'}
              style={{ fontSize: 12, color: live ? '#10B981' : '#9B9AB8' }}>
              {live ? '● Live' : '○ Offline'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="glass" style={{ padding: 24, margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{label(t.stage)}</span>
            <span style={{ color: '#9F67FF', fontWeight: 700 }}>{t.progress}%</span>
          </div>
          <div role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100}
            style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${t.progress}%`, height: '100%', borderRadius: 99, transition: 'width .6s ease',
              background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, gap: 4 }}>
            {stageKeys.map((k, i) => (
              <div key={k} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', margin: '0 auto 6px',
                  background: i <= currentIdx ? '#7C3AED' : 'rgba(255,255,255,0.12)',
                  boxShadow: i === currentIdx ? '0 0 0 4px rgba(124,58,237,0.3)' : 'none' }} />
                <div style={{ fontSize: 11, color: i <= currentIdx ? '#F1F0FF' : '#5C5B7A', lineHeight: 1.3 }}>{label(k)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor form */}
        {canPost && (
          <form className="glass" onSubmit={submit} style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Post an update</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <select className="input" style={{ flex: '2 1 180px' }} value={stage} onChange={e => setStage(e.target.value)}>
                {project.stages.map(s => <option key={s.key} value={s.key}>{label(s.key)}</option>)}
              </select>
              <input className="input" style={{ flex: '1 1 120px' }} type="number" min="0" max="100" step="1"
                placeholder="Progress % (optional)" value={progress} onChange={e => setProgress(e.target.value)} />
            </div>
            <textarea className="input" rows={2} maxLength={500} placeholder="What did you finish? (optional)"
              value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', marginBottom: 10, resize: 'vertical' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-primary" disabled={saving} style={{ padding: '8px 18px' }}>{saving ? 'Posting…' : 'Post update'}</button>
              {formMsg && <span style={{ fontSize: 13, color: formMsg.type === 'ok' ? '#10B981' : '#EF4444' }}>{formMsg.text}</span>}
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Activity</div>
          {updates.length === 0 ? (
            <p style={{ color: '#9B9AB8', fontSize: 14 }}>
              {isEditor ? 'No updates yet — post your first one above.' : 'No updates yet. You will see them here the moment the editor posts one.'}
            </p>
          ) : updates.map(u => (
            <div key={u._id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 7, flexShrink: 0,
                background: u.kind === 'system' ? '#06B6D4' : '#7C3AED' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14 }}>
                  {u.kind === 'system'
                    ? u.note
                    : <><strong>{label(u.stage)}</strong> · {u.progress}%{u.by?.name && <span style={{ color: '#9B9AB8' }}> — {u.by.name}</span>}</>}
                </div>
                {u.kind !== 'system' && u.note && <div style={{ fontSize: 13, color: '#9B9AB8', marginTop: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{u.note}</div>}
                <div style={{ fontSize: 11, color: '#5C5B7A', marginTop: 3 }}>{when(u.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
