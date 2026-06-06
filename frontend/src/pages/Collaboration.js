import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export default function Collaboration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || `room_${Date.now()}`;

  const [content, setContent]   = useState('');
  const [comments, setComments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [users, setUsers]       = useState([]);
  const [newComment, setNewComment] = useState('');
  const [markerTime, setMarkerTime] = useState('');
  const [markerNote, setMarkerNote] = useState('');
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState('editor');

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return navigate('/login');

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.emit('collab:join', { roomId, userId: user._id, userName: user.name });

    socket.on('collab:state', (state) => {
      setContent(state.content || '');
      setComments(state.comments || []);
      setTimeline(state.timeline || []);
    });

    socket.on('collab:users', (u) => setUsers(u));
    socket.on('collab:content-updated', ({ content: c, userId }) => {
      if (userId !== user._id) setContent(c);
    });
    socket.on('collab:comment-added', (c) => setComments(prev => [...prev, c]));
    socket.on('collab:marker-added', (m) => setTimeline(prev => [...prev, m]));

    return () => {
      socket.emit('collab:leave', { roomId, userId: user._id });
      socket.disconnect();
    };
  }, [user, roomId]);

  const updateContent = (val) => {
    setContent(val);
    socketRef.current?.emit('collab:content-update', { roomId, content: val, userId: user._id });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    socketRef.current?.emit('collab:add-comment', {
      roomId,
      comment: { text: newComment, author: user.name, userId: user._id }
    });
    setNewComment('');
  };

  const addMarker = () => {
    if (!markerTime || !markerNote) return;
    socketRef.current?.emit('collab:timeline-marker', {
      roomId,
      marker: { time: markerTime, note: markerNote, author: user.name }
    });
    setMarkerTime(''); setMarkerNote('');
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/collab?room=${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied! Share with your client/editor.');
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>🎬 Collaboration Room</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#10B981' : '#EF4444' }} />
              <span style={{ fontSize: 12, color: '#9B9AB8' }}>{connected ? 'Connected' : 'Disconnected'}</span>
              <span style={{ fontSize: 12, color: '#5C5B7A' }}>· Room: {roomId.slice(0, 12)}...</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Online users */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {users.map((u, i) => (
                <div key={u.userId} style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  marginLeft: i > 0 ? -8 : 0, border: '2px solid #0F0F1A',
                  title: u.userName
                }}>{u.userName?.[0]?.toUpperCase()}</div>
              ))}
              <span style={{ fontSize: 12, color: '#9B9AB8', marginLeft: 8 }}>{users.length} online</span>
            </div>
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} onClick={copyRoomLink}>
              🔗 Share Room
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
          {[
            { id: 'editor', label: '📝 Notes & Brief' },
            { id: 'comments', label: `💬 Comments (${comments.length})` },
            { id: 'timeline', label: `⏱ Timeline (${timeline.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              background: tab === t.id ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: tab === t.id ? '#9F67FF' : '#9B9AB8',
            }}>{t.label}</button>
          ))}
        </div>

        {/* EDITOR TAB */}
        {tab === 'editor' && (
          <div>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#9B9AB8' }}>Shared notes — edits sync in real-time</span>
              <span style={{ fontSize: 12, color: '#5C5B7A' }}>{content.length} chars</span>
            </div>
            <textarea
              value={content}
              onChange={e => updateContent(e.target.value)}
              placeholder={`📋 Project Brief & Notes\n\nClient: ...\nDeadline: ...\nStyle Reference: ...\n\nRevision Notes:\n- ...\n- ...`}
              style={{
                width: '100%', minHeight: 500, padding: 20, borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F0FF', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                lineHeight: 1.7, resize: 'vertical', outline: 'none',
              }}
            />
          </div>
        )}

        {/* COMMENTS TAB */}
        {tab === 'comments' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input className="input" placeholder="Add a comment or feedback..."
                value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()} style={{ flex: 1 }} />
              <button className="btn-primary" onClick={addComment} style={{ flexShrink: 0 }}>Post</button>
            </div>

            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <p style={{ color: '#9B9AB8' }}>No comments yet. Start the conversation!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comments.map((c, i) => (
                  <div key={i} className="glass" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.author}</span>
                      <span style={{ fontSize: 12, color: '#9B9AB8' }}>
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#9B9AB8', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === 'timeline' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input className="input" placeholder="Timestamp (e.g. 1:24)"
                value={markerTime} onChange={e => setMarkerTime(e.target.value)} style={{ width: 140 }} />
              <input className="input" placeholder="Note (e.g. Cut here, add transition)"
                value={markerNote} onChange={e => setMarkerNote(e.target.value)} style={{ flex: 1 }} />
              <button className="btn-primary" onClick={addMarker} style={{ flexShrink: 0 }}>+ Add Marker</button>
            </div>

            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
                <p style={{ color: '#9B9AB8' }}>No timeline markers yet. Add timestamps for feedback!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timeline.sort((a, b) => a.time.localeCompare(b.time)).map((m, i) => (
                  <div key={i} className="glass" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                      borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 14,
                      color: '#9F67FF', flexShrink: 0
                    }}>{m.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}>{m.note}</div>
                      <div style={{ fontSize: 12, color: '#9B9AB8', marginTop: 2 }}>by {m.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
