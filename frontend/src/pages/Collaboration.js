import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const Collaboration = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newMarker, setNewMarker] = useState({ time: '', label: '', type: 'cut' });
  const [activeTab, setActiveTab] = useState('notes');
  const [cursors, setCursors] = useState({});
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [roomInput, setRoomInput] = useState(roomId || '');
  const [toast, setToast] = useState('');

  const contentRef = useRef(null);
  const socketRef = useRef(null);
  const userColor = COLORS[user?.id?.charCodeAt(0) % COLORS.length] || '#6366F1';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const joinRoom = () => {
    if (!roomInput.trim()) { alert('Enter a room ID'); return; }
    if (!user) { navigate('/login'); return; }

    const newSocket = io(
      process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
    );
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('collab:join', {
        roomId: roomInput,
        userId: user.id,
        userName: user.name
      });
      setJoinedRoom(true);
      showToast('Joined collaboration room!');
    });

    newSocket.on('collab:state', (state) => {
      setContent(state.content || '');
      setComments(state.comments || []);
      setTimeline(state.timeline || []);
    });

    newSocket.on('collab:users', (users) => {
      setRoomUsers(users);
    });

    newSocket.on('collab:user-joined', ({ userName }) => {
      showToast(`${userName} joined the room`);
    });

    newSocket.on('collab:user-left', ({ userId }) => {
      setCursors(c => {
        const updated = { ...c };
        delete updated[userId];
        return updated;
      });
    });

    newSocket.on('collab:content-updated', ({ content, userId }) => {
      if (userId !== user.id) setContent(content);
    });

    newSocket.on('collab:comment-added', (comment) => {
      setComments(c => [...c, comment]);
    });

    newSocket.on('collab:marker-added', (marker) => {
      setTimeline(t => [...t, marker]);
    });

    newSocket.on('collab:cursor-update', ({ userId, userName, position }) => {
      setCursors(c => ({ ...c, [userId]: { userName, position } }));
    });

    newSocket.on('disconnect', () => setConnected(false));
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('collab:leave', {
        roomId: roomInput, userId: user.id
      });
      socketRef.current.disconnect();
    }
    setJoinedRoom(false);
    setConnected(false);
    setRoomUsers([]);
    setContent('');
    setComments([]);
    setTimeline([]);
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (socketRef.current) {
      socketRef.current.emit('collab:content-update', {
        roomId: roomInput, content: val, userId: user.id
      });
    }
  };

  const handleMouseMove = (e) => {
    if (socketRef.current && joinedRoom) {
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) {
        socketRef.current.emit('collab:cursor', {
          roomId: roomInput,
          userId: user.id,
          userName: user.name,
          position: {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
          }
        });
      }
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit('collab:add-comment', {
        roomId: roomInput,
        comment: {
          text: newComment,
          author: user.name,
          userId: user.id,
          color: userColor
        }
      });
    }
    setNewComment('');
  };

  const addTimelineMarker = () => {
    if (!newMarker.time || !newMarker.label) {
      alert('Enter time and label'); return;
    }
    if (socketRef.current) {
      socketRef.current.emit('collab:timeline-marker', {
        roomId: roomInput,
        marker: {
          ...newMarker,
          author: user.name,
          userId: user.id,
          color: userColor
        }
      });
    }
    setNewMarker({ time: '', label: '', type: 'cut' });
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const markerColors = {
    cut: '#EF4444',
    transition: '#3B82F6',
    effect: '#8B5CF6',
    audio: '#10B981',
    note: '#F59E0B'
  };

  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto', padding: '24px 20px'
    }}>

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
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            border: '1px solid #BFDBFE', borderRadius: 50,
            padding: '5px 14px', marginBottom: 8
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#10B981' : '#94A3B8',
              animation: connected ? 'notifPulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: connected ? '#1D4ED8' : '#64748B'
            }}>
              {connected ? 'Live Collaboration' : 'Offline'}
            </span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: '#0F172A',
            margin: 0, letterSpacing: '-0.5px'
          }}>
            🎬 Real-time Collaboration
          </h1>
        </div>

        {joinedRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Online Users */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {roomUsers.map((u, i) => (
                <div key={u.userId} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: COLORS[i % COLORS.length],
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  marginLeft: i > 0 ? -8 : 0,
                  border: '2px solid #fff',
                  title: u.userName,
                  zIndex: roomUsers.length - i
                }}>
                  {u.userName?.slice(0, 2).toUpperCase()}
                </div>
              ))}
              <span style={{
                fontSize: 13, color: '#64748B', fontWeight: 600, marginLeft: 6
              }}>
                {roomUsers.length} online
              </span>
            </div>

            <button onClick={leaveRoom} style={{
              padding: '8px 16px', borderRadius: 10,
              border: '1.5px solid #FEE2E2', background: '#FEF2F2',
              color: '#B91C1C', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit'
            }}>Leave Room</button>
          </div>
        )}
      </div>

      {/* Join Room */}
      {!joinedRoom ? (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 24, padding: '60px 40px',
          textAlign: 'center', maxWidth: 540, margin: '0 auto',
          animation: 'scaleIn 0.3s ease forwards'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            animation: 'float 3s ease-in-out infinite'
          }}>🎬</div>

          <h2 style={{
            fontSize: 22, fontWeight: 800, color: '#0F172A',
            margin: '0 0 8px'
          }}>Join a Collaboration Room</h2>
          <p style={{
            color: '#64748B', fontSize: 15, margin: '0 0 28px'
          }}>
            Share the Room ID with your client or editor
            to collaborate in real-time
          </p>

          <div style={{ marginBottom: 16 }}>
            <input
              value={roomInput}
              onChange={e => setRoomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
              placeholder="Enter Room ID (e.g. project-123)"
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 12,
                border: '2px solid #E2E8F0', fontSize: 15,
                boxSizing: 'border-box', outline: 'none',
                fontFamily: 'inherit', textAlign: 'center',
                letterSpacing: '1px', fontWeight: 600
              }}
            />
          </div>

          <button onClick={joinRoom} style={{
            width: '100%', padding: 14, borderRadius: 12,
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
          }}>
            🚀 Join Room
          </button>

          <div style={{
            marginTop: 20, padding: '14px',
            background: '#F8FAFC', borderRadius: 12
          }}>
            <div style={{
              fontSize: 12, color: '#94A3B8', fontWeight: 600,
              marginBottom: 6
            }}>QUICK JOIN WITH ROOM ID</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['project-alpha', 'room-001', 'collab-xyz'].map(r => (
                <button key={r} onClick={() => setRoomInput(r)} style={{
                  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid #E2E8F0', background: '#fff',
                  color: '#6366F1', fontSize: 12, fontWeight: 600,
                  fontFamily: 'inherit'
                }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Room ID Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              borderRadius: 14, padding: '12px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10B981',
                  animation: 'notifPulse 2s infinite'
                }} />
                <span style={{
                  color: 'rgba(255,255,255,0.6)', fontSize: 13
                }}>Room ID:</span>
                <span style={{
                  color: '#fff', fontWeight: 700,
                  fontSize: 14, letterSpacing: '1px'
                }}>{roomInput}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomInput);
                  showToast('Room ID copied!');
                }}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit'
                }}>
                📋 Copy ID
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', background: '#F1F5F9',
              borderRadius: 12, padding: 4
            }}>
              {[
                { key: 'notes', label: '📝 Notes', },
                { key: 'timeline', label: '⏱️ Timeline' },
                { key: 'comments', label: `💬 Comments (${comments.length})` }
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 9,
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

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div style={{ position: 'relative' }} ref={contentRef}
                onMouseMove={handleMouseMove}>

                {/* Live Cursors */}
                {Object.entries(cursors).map(([uid, cursor]) => (
                  <div key={uid} style={{
                    position: 'absolute', pointerEvents: 'none', zIndex: 10,
                    left: `${cursor.position.x}%`,
                    top: `${cursor.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <div style={{
                      background: COLORS[uid.charCodeAt(0) % COLORS.length],
                      color: '#fff', borderRadius: 20,
                      padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>{cursor.userName}</div>
                  </div>
                ))}

                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing your project notes, script, or instructions here...

This is a shared space — everyone in the room can see your changes in real-time!

💡 Tips:
- Use this for project briefs and scripts
- Add feedback and revision notes  
- List shot requirements
- Share creative direction"
                  style={{
                    width: '100%', minHeight: 400, padding: '20px',
                    borderRadius: 16, border: '2px solid #E2E8F0',
                    fontSize: 15, lineHeight: 1.8, resize: 'vertical',
                    boxSizing: 'border-box', outline: 'none',
                    fontFamily: 'inherit', color: '#0F172A',
                    background: '#fff', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 4px', fontSize: 12, color: '#94A3B8'
                }}>
                  <span>{content.length} characters</span>
                  <span>✅ Auto-synced with all users</span>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                {/* Add Marker */}
                <div style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 16, padding: 20, marginBottom: 16
                }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700,
                    color: '#0F172A', margin: '0 0 14px'
                  }}>Add Timeline Marker</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr auto auto',
                    gap: 10, alignItems: 'center'
                  }}>
                    <input
                      value={newMarker.time}
                      onChange={e => setNewMarker(m => ({
                        ...m, time: e.target.value
                      }))}
                      placeholder="00:00"
                      style={{
                        padding: '10px', borderRadius: 10,
                        border: '1.5px solid #E2E8F0', fontSize: 14,
                        boxSizing: 'border-box', outline: 'none',
                        fontFamily: 'inherit', textAlign: 'center',
                        fontWeight: 700
                      }}
                    />
                    <input
                      value={newMarker.label}
                      onChange={e => setNewMarker(m => ({
                        ...m, label: e.target.value
                      }))}
                      placeholder="Marker label..."
                      style={{
                        padding: '10px', borderRadius: 10,
                        border: '1.5px solid #E2E8F0', fontSize: 14,
                        boxSizing: 'border-box', outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <select
                      value={newMarker.type}
                      onChange={e => setNewMarker(m => ({
                        ...m, type: e.target.value
                      }))}
                      style={{
                        padding: '10px', borderRadius: 10,
                        border: '1.5px solid #E2E8F0', fontSize: 13,
                        fontFamily: 'inherit', background: '#fff'
                      }}>
                      {Object.keys(markerColors).map(t => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button onClick={addTimelineMarker} style={{
                      padding: '10px 16px', borderRadius: 10,
                      border: 'none', background: '#6366F1',
                      color: '#fff', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}>+ Add</button>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 16, padding: 20
                }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700,
                    color: '#0F172A', margin: '0 0 16px'
                  }}>
                    Timeline ({timeline.length} markers)
                  </h3>

                  {timeline.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '30px 0', color: '#94A3B8'
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>⏱️</div>
                      <div style={{ fontSize: 14 }}>No markers yet</div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      {/* Timeline Line */}
                      <div style={{
                        position: 'absolute', left: 60, top: 0, bottom: 0,
                        width: 2, background: '#F1F5F9'
                      }} />

                      {[...timeline]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((marker, i) => (
                          <div key={marker.id} style={{
                            display: 'flex', alignItems: 'center',
                            gap: 16, marginBottom: 14, position: 'relative'
                          }}>
                            {/* Time */}
                            <div style={{
                              fontWeight: 800, fontSize: 13,
                              color: '#0F172A', width: 46, textAlign: 'right',
                              flexShrink: 0
                            }}>{marker.time}</div>

                            {/* Dot */}
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              background: markerColors[marker.type] || '#6366F1',
                              border: '3px solid #fff',
                              boxShadow: `0 0 0 2px ${markerColors[marker.type]}`,
                              flexShrink: 0, zIndex: 1
                            }} />

                            {/* Content */}
                            <div style={{
                              flex: 1, background: '#F8FAFC',
                              borderRadius: 10, padding: '10px 14px',
                              border: `1px solid ${markerColors[marker.type]}30`
                            }}>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 8
                              }}>
                                <span style={{
                                  fontWeight: 700, fontSize: 14, color: '#0F172A'
                                }}>{marker.label}</span>
                                <span style={{
                                  background: markerColors[marker.type] + '20',
                                  color: markerColors[marker.type],
                                  padding: '2px 8px', borderRadius: 20,
                                  fontSize: 11, fontWeight: 700
                                }}>{marker.type}</span>
                              </div>
                              <div style={{
                                fontSize: 11, color: '#94A3B8', marginTop: 2
                              }}>by {marker.author}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div>
                {/* Add Comment */}
                <div style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 16, padding: 20, marginBottom: 16
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: userColor, color: '#fff',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12,
                      fontWeight: 700, flexShrink: 0
                    }}>
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addComment();
                          }
                        }}
                        placeholder="Add a comment or feedback... (Enter to send)"
                        rows={2}
                        style={{
                          width: '100%', padding: '10px 14px',
                          borderRadius: 10, border: '1.5px solid #E2E8F0',
                          fontSize: 14, resize: 'none',
                          boxSizing: 'border-box', outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <button onClick={addComment} style={{
                        marginTop: 8, padding: '8px 18px', borderRadius: 8,
                        border: 'none', background: '#6366F1',
                        color: '#fff', cursor: 'pointer',
                        fontWeight: 700, fontSize: 13, fontFamily: 'inherit'
                      }}>Send Comment</button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: 16, padding: 20
                }}>
                  {comments.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '30px 0', color: '#94A3B8'
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                      <div style={{ fontSize: 14 }}>
                        No comments yet — start the discussion!
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 14
                    }}>
                      {comments.map((c, i) => (
                        <div key={c.id || i} style={{
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                          animation: 'fadeUp 0.3s ease forwards'
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: c.color || '#6366F1', color: '#fff',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 12,
                            fontWeight: 700, flexShrink: 0
                          }}>
                            {c.author?.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{
                            flex: 1, background: '#F8FAFC',
                            borderRadius: 12, padding: '10px 14px'
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              gap: 8, marginBottom: 4
                            }}>
                              <span style={{
                                fontWeight: 700, fontSize: 13, color: '#0F172A'
                              }}>{c.author}</span>
                              <span style={{
                                fontSize: 11, color: '#94A3B8'
                              }}>
                                {new Date(c.timestamp).toLocaleTimeString(
                                  'en-US', {
                                    hour: '2-digit', minute: '2-digit'
                                  }
                                )}
                              </span>
                            </div>
                            <p style={{
                              margin: 0, fontSize: 14,
                              color: '#374151', lineHeight: 1.6
                            }}>{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16
          }}>

            {/* Online Users */}
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: 20
            }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#0F172A', margin: '0 0 14px',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10B981',
                  animation: 'notifPulse 2s infinite'
                }} />
                Online ({roomUsers.length})
              </h3>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                {roomUsers.map((u, i) => (
                  <div key={u.userId} style={{
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: COLORS[i % COLORS.length], color: '#fff',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12,
                      fontWeight: 700, flexShrink: 0
                    }}>
                      {u.userName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: 14, color: '#0F172A'
                      }}>
                        {u.userName}
                        {u.userId === user.id && (
                          <span style={{
                            fontSize: 11, color: '#6366F1',
                            marginLeft: 6
                          }}>(You)</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 11, color: '#10B981', fontWeight: 500
                      }}>● Active now</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: 16, padding: 20, color: '#fff'
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 700,
                margin: '0 0 14px', opacity: 0.9
              }}>Session Stats</h3>
              {[
                { label: 'Notes Length', value: `${content.length} chars` },
                { label: 'Comments', value: comments.length },
                { label: 'Timeline Markers', value: timeline.length },
                { label: 'Collaborators', value: roomUsers.length },
              ].map(stat => (
                <div key={stat.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <span style={{
                    fontSize: 13, opacity: 0.75
                  }}>{stat.label}</span>
                  <span style={{
                    fontWeight: 800, fontSize: 15
                  }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* How to Use */}
            <div style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: 16, padding: 18
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 700,
                color: '#0F172A', margin: '0 0 12px'
              }}>How to Use</h3>
              {[
                { icon: '📝', text: 'Type notes — synced instantly' },
                { icon: '⏱️', text: 'Add timeline markers for edits' },
                { icon: '💬', text: 'Comment for feedback' },
                { icon: '📋', text: 'Share Room ID to invite others' },
              ].map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  marginBottom: 8, fontSize: 13, color: '#64748B'
                }}>
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collaboration;