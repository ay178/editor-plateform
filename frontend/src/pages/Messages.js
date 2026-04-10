import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const msgEnd = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      openConversation(userId);
    }
  }, [userId]);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/messages');
      setConversations(data);
      if (data.length > 0 && !userId) {
        const other = data[0].participants.find(
          p => p._id !== user.id
        );
        if (other) openConversation(other._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (otherUserId) => {
    try {
      const { data } = await API.get(`/messages/${otherUserId}`);
      setActiveConv(data);
      setMessages(data.messages || []);
      if (!conversations.find(c =>
        c.participants.some(p => p._id === otherUserId)
      )) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    const other = activeConv.participants.find(p => p._id !== user.id);
    if (!other) return;
    try {
      const { data } = await API.post(`/messages/${other._id}`, {
        content: input
      });
      setMessages(m => [...m, data]);
      setInput('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUser = (conv) => {
    return conv.participants?.find(p => p._id !== user.id);
  };

  return (
    <div style={{
      maxWidth: 1000, margin: '0 auto',
      padding: '24px 20px',
      height: 'calc(100vh - 80px)',
      display: 'flex', flexDirection: 'column'
    }}>
      <h1 style={{
        fontSize: 24, fontWeight: 800, color: '#0F172A',
        margin: '0 0 20px', letterSpacing: '-0.5px'
      }}>Messages</h1>

      <div style={{
        flex: 1, display: 'flex', gap: 20, minHeight: 0,
        border: '1px solid #E2E8F0', borderRadius: 18,
        overflow: 'hidden', background: '#fff'
      }}>

        {/* Sidebar */}
        <div style={{
          width: 280, borderRight: '1px solid #F1F5F9',
          overflowY: 'auto', flexShrink: 0
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 30, height: 30, border: '3px solid #E2E8F0',
                borderTopColor: '#6366F1', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 16px', color: '#94A3B8'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Koi conversation nahi
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Kisi editor ko message karo
              </div>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherUser(conv);
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              const isActive = activeConv?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => other && openConversation(other._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', cursor: 'pointer',
                    background: isActive ? '#F5F3FF' : 'transparent',
                    borderLeft: isActive
                      ? '3px solid #6366F1'
                      : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#6366F1', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 13, flexShrink: 0
                  }}>
                    {other?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 14, color: '#0F172A',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{other?.name}</div>
                    <div style={{
                      fontSize: 12, color: '#94A3B8', marginTop: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {lastMsg?.content || 'Abhi tak koi message nahi'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, background: '#EEF2FF', color: '#6366F1',
                    padding: '2px 6px', borderRadius: 20,
                    fontWeight: 600, flexShrink: 0
                  }}>{other?.role}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', borderBottom: '1px solid #F1F5F9'
              }}>
                {(() => {
                  const other = getOtherUser(activeConv);
                  return (
                    <>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: '#6366F1', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600
                      }}>
                        {other?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 700, fontSize: 15, color: '#0F172A'
                        }}>{other?.name}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'capitalize' }}>
                          {other?.role}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '20px 20px 12px'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '40px 20px', color: '#94A3B8'
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      Conversation shuru karo!
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender === user.id ||
                      msg.sender?._id === user.id;
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        marginBottom: 12
                      }}>
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{
                            background: isMe ? '#6366F1' : '#F1F5F9',
                            color: isMe ? '#fff' : '#0F172A',
                            padding: '10px 14px',
                            borderRadius: isMe
                              ? '16px 16px 4px 16px'
                              : '16px 16px 16px 4px',
                            fontSize: 14, lineHeight: 1.5
                          }}>
                            {msg.content}
                          </div>
                          <div style={{
                            fontSize: 11, color: '#94A3B8', marginTop: 3,
                            textAlign: isMe ? 'right' : 'left'
                          }}>
                            {new Date(msg.createdAt).toLocaleTimeString(
                              'en-IN', { hour: '2-digit', minute: '2-digit' }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEnd} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 16px', borderTop: '1px solid #F1F5F9',
                display: 'flex', gap: 10
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Message likho..."
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 50,
                    border: '1.5px solid #E2E8F0', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={sendMessage}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    border: 'none', background: '#6366F1', color: '#fff',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#94A3B8'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  Koi conversation select karo
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;