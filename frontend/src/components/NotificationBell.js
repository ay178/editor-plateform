import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Icon from'./Icon';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(n => n.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(n =>
        n.map(notif => notif._id === id ? { ...notif, read: true } : notif)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleResponse = async (notif, response) => {
    try {
      await API.post('/notifications/schedule/respond', {
        hiringRequestId: notif.hiringRequest?._id,
        notificationId: notif._id,
        response
      });
      markRead(notif._id);
      fetchNotifications();
      alert(response === 'accepted'
        ? 'Schedule accepted! Project is now active.'
        : 'Schedule declined.'
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case'hire_request': return'clipboard';
      case'request_accepted': return'check-circle';
      case'request_rejected': return'x-circle';
      case'schedule_proposal': return'calendar';
      case'schedule_accepted': return'check-circle';
      case'schedule_rejected': return'x-circle';
      case'request_completed': return'award';
      case'project_update': return'film';
      default: return'bell';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: '#F8FAFC',
          border: '1.5px solid #E2E8F0', borderRadius: 10,
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#374151" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, background: '#EF4444',
            borderRadius: '50%', fontSize: 10, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, border: '2px solid #fff'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 48, right: 0, width: 360,
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 500, overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px', borderBottom: '1px solid #F1F5F9'
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8, background: '#EEF2FF', color: '#6366F1',
                  borderRadius: 20, padding: '2px 8px',
                  fontSize: 12, fontWeight: 700
                }}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6366F1', fontSize: 13, fontWeight: 600
              }}>Mark all read</button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#94A3B8'
              }}>
                <div style={{ marginBottom: 8 }}><Icon name="bell"size={30} /></div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  No notifications yet
                </div>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && markRead(notif._id)}
                  style={{
                    padding: '14px 18px',
                    background: notif.read ? '#fff' : '#F5F3FF',
                    borderBottom: '1px solid #F8FAFC',
                    cursor: notif.read ? 'default' : 'pointer',
                    transition: 'background 0.2s'
                  }}>

                  <div style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start'
                  }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>
                      <Icon name={getIcon(notif.type)} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, color: '#374151',
                        lineHeight: 1.5, fontWeight: notif.read ? 400 : 600
                      }}>
                        {notif.message}
                      </div>
                      {notif.scheduledDate && (
                        <div style={{
                          marginTop: 4, display: 'inline-block',
                          background: '#EEF2FF', color: '#6366F1',
                          borderRadius: 8, padding: '3px 10px',
                          fontSize: 12, fontWeight: 600
                        }}>
                          <Icon name="calendar" size={12} style={{ marginRight: 6, verticalAlign: '-2px' }} />{new Date(notif.scheduledDate)
                            .toLocaleDateString('en-US', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </div>
                      )}
                      <div style={{
                        fontSize: 11, color: '#94A3B8', marginTop: 4
                      }}>
                        {timeAgo(notif.createdAt)}
                      </div>

                      {/* Schedule Accept/Reject Buttons */}
                      {notif.type === 'schedule_proposal' && !notif.read && (
                        <div style={{
                          display: 'flex', gap: 8, marginTop: 10
                        }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleScheduleResponse(notif, 'accepted');
                            }}
                            style={{
                              flex: 1, padding: '7px', borderRadius: 8,
                              border: 'none', background: '#6366F1',
                              color: '#fff', cursor: 'pointer',
                              fontSize: 12, fontWeight: 700
                            }}>
                            ✓ Accept Schedule
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleScheduleResponse(notif, 'rejected');
                            }}
                            style={{
                              flex: 1, padding: '7px', borderRadius: 8,
                              border: '1px solid #FEE2E2',
                              background: '#FEF2F2',
                              color: '#B91C1C', cursor: 'pointer',
                              fontSize: 12, fontWeight: 700
                            }}>
                            ✕ Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#6366F1', flexShrink: 0, marginTop: 4
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;