import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const msgEnd = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      openConversation(userId);
      setShowSidebar(false);
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
        const other = data[0].participants.find(p => p._id !== user.id);
        if (other) {
          openConversation(other._id);
          setShowSidebar(window.innerWidth > 768);
        }
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
    <>
      <style>{`
        .messages-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 20px;
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
        }
        .messages-layout {
          flex: 1;
          display: flex;
          gap: 20px;
          min-height: 0;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          overflow: hidden;
          background: #fff;
        }
        .sidebar {
          width: 280px;
          border-right: 1px solid #F1F5F9;
          overflow-y: auto;
          flex-shrink: 0;
        }
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .messages-container {
            padding: 12px;
            height: calc(100vh - 70px);
          }
          .messages-layout {
            border-radius: 14px;
          }
          .sidebar {
            width: 100%;
            border-right: none;
          }
          .chat-area {
            width: 100%;
          }
          .messages-title {
            font-size: 20px !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>

      <div className="messages-container">
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16
        }}>
          <h1 className="messages-title" style={{
            fontSize: 22, fontWeight: 800,
            color: '#0F172A', margin: 0
          }}>
            💬 Messages
          </h1>
          {/* Mobile back button */}
          {!showSidebar && activeConv && (
            <button
              onClick={() => {
                setShowSidebar(true);
                setActiveConv(null);
              }}
              style={{
                display: 'none',
                padding: '8px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', background: '#fff',
                color: '#374151', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
              }}
              className="mobile-back-btn">
              ← Back
            </button>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-back-btn { display: block !important; }
            .sidebar-mobile-hide { display: none !important; }
            .chat-mobile-hide { display: none !important; }
          }
        `}</style>

        <div className="messages-layout">

          {/* Sidebar */}
          <div
            className={`sidebar ${!showSidebar ? 'sidebar-mobile-hide' : ''}`}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 30, height: 30, border: '3px solid #E2E8F0',
                  borderTopColor: '#6366F1', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto'
                }} />
              </div>
            ) : conversations.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 16px', color: '#94A3B8'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  No conversations yet
                </div>
                <button
                  onClick={() => navigate('/editors')}
                  style={{
                    marginTop: 12, padding: '8px 16px', borderRadius: 8,
                    border: 'none', background: '#6366F1', color: '#fff',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    fontFamily: 'inherit'
                  }}>
                  Browse Editors
                </button>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherUser(conv);
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                const isActive = activeConv?._id === conv._id;
                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      if (other) {
                        openConversation(other._id);
                        setShowSidebar(false);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: '14px 16px', cursor: 'pointer',
                      background: isActive ? '#F5F3FF' : 'transparent',
                      borderLeft: isActive
                        ? '3px solid #6366F1'
                        : '3px solid transparent',
                      transition: 'all 0.15s'
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 13, flexShrink: 0
                    }}>
                      {other?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14, color: '#0F172A',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{other?.name}</div>
                      <div style={{
                        fontSize: 12, color: '#94A3B8', marginTop: 1,
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lastMsg?.content || 'No messages yet'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, background: '#EEF2FF',
                      color: '#6366F1', padding: '2px 6px',
                      borderRadius: 20, fontWeight: 600, flexShrink: 0,
                      textTransform: 'capitalize'
                    }}>{other?.role}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Area */}
          <div
            className={`chat-area ${showSidebar && window.innerWidth <= 768 ? 'chat-mobile-hide' : ''}`}>
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, padding: '14px 16px',
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  {(() => {
                    const other = getOtherUser(activeConv);
                    return (
                      <>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600
                        }}>
                          {other?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 700, fontSize: 15, color: '#0F172A'
                          }}>{other?.name}</div>
                          <div style={{
                            fontSize: 12, color: '#94A3B8',
                            textTransform: 'capitalize'
                          }}>{other?.role}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto',
                  padding: '16px 16px 8px'
                }}>
                  {messages.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      color: '#94A3B8'
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>
                        Start the conversation!
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
                          marginBottom: 10
                        }}>
                          <div style={{ maxWidth: '75%' }}>
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
                              fontSize: 11, color: '#94A3B8',
                              marginTop: 3,
                              textAlign: isMe ? 'right' : 'left'
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString(
                                'en-US', {
                                  hour: '2-digit', minute: '2-digit'
                                }
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
                  padding: '10px 12px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex', gap: 8
                }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 50,
                      border: '1.5px solid #E2E8F0', fontSize: 14,
                      outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
                    }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#94A3B8'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    Select a conversation
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Or start a new one from an editor's profile
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;