import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');

  const [conversations, setConversations] = useState([]);
  const [active, setActive]               = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMsg, setNewMsg]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [typing, setTyping]               = useState(false);

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);

  useEffect(() => {
    if (!user) return navigate('/login');

    // Init socket
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;
    socket.emit('user:join', user._id);

    socket.on('message:receive', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Load conversations
    api.get('/messages').then(r => {
      setConversations(r.data);
      setLoading(false);
    });

    return () => socket.disconnect();
  }, [user]);

  // If URL has ?with=userId, open that conversation
  useEffect(() => {
    if (withUserId && !loading) {
      openConversation(withUserId);
    }
  }, [withUserId, loading]);

  const openConversation = async (otherUserId) => {
    const res = await api.get(`/messages/${otherUserId}`);
    setActive(res.data);
    setMessages(res.data.messages || []);
    // Refresh conversations list
    api.get('/messages').then(r => setConversations(r.data));
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !active) return;
    const otherId = active.participants.find(p => p._id !== user._id)?._id;

    const msgData = {
      sender: user._id,
      receiver: otherId,
      content: newMsg.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages(prev => [...prev, msgData]);
    setNewMsg('');

    // Emit via socket
    socketRef.current?.emit('message:send', { ...msgData, receiverId: otherId });

    // Persist to DB
    await api.post(`/messages/${otherId}`, { content: newMsg.trim() });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const other = (conv) => conv.participants?.find(p => p._id !== user?._id);

  return (
    <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', gap: 0 }}>

        {/* Conversations list */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#1A1A2E',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Messages</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16, color: '#9B9AB8', fontSize: 14 }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <p style={{ color: '#9B9AB8', fontSize: 13 }}>No conversations yet.</p>
                <p style={{ color: '#5C5B7A', fontSize: 12, marginTop: 4 }}>Hire an editor or get hired to start chatting.</p>
              </div>
            ) : conversations.map(conv => {
              const o = other(conv);
              const isActive = active?._id === conv._id;
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              return (
                <div key={conv._id} onClick={() => { setActive(conv); setMessages(conv.messages || []); }}
                  style={{
                    padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                    background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                    transition: 'all 0.15s'
                  }}>
                  <img src={o?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${o?.name}`}
                    alt={o?.name} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{o?.name}</div>
                    <div style={{ fontSize: 12, color: '#9B9AB8',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg?.content || 'No messages yet'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0F0F1A' }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>💬</div>
              <p style={{ color: '#9B9AB8' }}>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              {(() => {
                const o = other(active);
                return (
                  <div style={{
                    padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(26,26,46,0.8)'
                  }}>
                    <img src={o?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${o?.name}`}
                      alt={o?.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{o?.name}</div>
                      <div style={{ fontSize: 12, color: '#10B981' }}>● Online</div>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ color: '#9B9AB8', fontSize: 14 }}>No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMine = (msg.sender?._id || msg.sender) === user._id;
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: 10
                    }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                        background: isMine ? '#7C3AED' : 'rgba(255,255,255,0.07)',
                        border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        borderBottomRightRadius: isMine ? 4 : 14,
                        borderBottomLeftRadius: isMine ? 14 : 4,
                      }}>
                        <p style={{ fontSize: 14, lineHeight: 1.5, color: '#F1F0FF', wordBreak: 'break-word' }}>{msg.content}</p>
                        <p style={{ fontSize: 11, color: isMine ? 'rgba(255,255,255,0.6)' : '#5C5B7A', marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#9B9AB8',
                        animation: `bounce 1s ${i * 0.15}s infinite`
                      }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 10, alignItems: 'center',
                background: 'rgba(26,26,46,0.5)'
              }}>
                <input className="input" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message... (Enter to send)"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={sendMessage} style={{ padding: '10px 20px', flexShrink: 0 }}>
                  Send →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}