import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const EditorPortfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ title: '', type: 'video' });
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user?.role !== 'editor') {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/editors/profile/me');
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert('File 100MB se chhoti honi chahiye');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) { alert('Pehle video select karo'); return; }
    if (!form.title.trim()) { alert('Title daalo'); return; }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload video file
      const formData = new FormData();
      formData.append('video', selectedFile);

      const { data: uploadData } = await API.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        }
      });

      // Add to portfolio
      await API.post('/editors/portfolio/add', {
        title: form.title,
        url: uploadData.url,
        type: 'video',
        thumbnail: uploadData.url
      });

      showToast('Video upload ho gayi! 🎉');
      setSelectedFile(null);
      setForm({ title: '', type: 'video' });
      setUploadProgress(0);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Ye video delete karni hai?')) return;
    try {
      await API.delete(`/editors/portfolio/${index}`);
      showToast('Video delete ho gayi');
      fetchProfile();
    } catch (err) {
      alert('Error aaya');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          color: '#15803D', padding: '12px 20px', borderRadius: 12,
          fontWeight: 500, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6366F1', fontWeight: 600, fontSize: 14,
          marginBottom: 16, padding: 0
        }}>← Dashboard pe wapas jao</button>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#0F172A',
          margin: '0 0 6px', letterSpacing: '-0.5px'
        }}>Portfolio Manager 🎬</h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Sample videos upload karo — clients dekh kar hire karenge
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 20, padding: 28, marginBottom: 28
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 20px'
        }}>Nayi Video Upload Karo</h2>

        {/* Title Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 13, fontWeight: 600, color: '#374151',
            display: 'block', marginBottom: 6
          }}>Video Title *</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Brand Commercial Edit, Wedding Highlight"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #E2E8F0', fontSize: 14,
              boxSizing: 'border-box', outline: 'none'
            }}
          />
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#6366F1' : '#E2E8F0'}`,
            borderRadius: 16,
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? '#EEF2FF' : '#F8FAFC',
            transition: 'all 0.2s',
            marginBottom: 16
          }}>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={e => handleFileSelect(e.target.files[0])}
          />

          {selectedFile ? (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                Size: {formatSize(selectedFile.size)}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                style={{
                  marginTop: 12, padding: '6px 16px', borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#fff',
                  color: '#EF4444', cursor: 'pointer', fontSize: 13
                }}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                Video yahan drop karo
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
                ya click karke select karo
              </div>
              <div style={{
                fontSize: 12, color: '#CBD5E1', marginTop: 8
              }}>
                MP4, WebM, MOV support · Max 100MB
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, color: '#64748B', marginBottom: 6
            }}>
              <span>Upload ho raha hai...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{
              height: 8, background: '#E2E8F0',
              borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          style={{
            width: '100%', padding: 13, borderRadius: 12,
            border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
            background: uploading || !selectedFile
              ? '#E2E8F0'
              : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: uploading || !selectedFile ? '#94A3B8' : '#fff',
            fontWeight: 700, fontSize: 15,
            boxShadow: uploading || !selectedFile
              ? 'none'
              : '0 4px 14px rgba(99,102,241,0.4)'
          }}>
          {uploading ? `Upload ho raha hai... ${uploadProgress}%` : '📤 Video Upload Karo'}
        </button>
      </div>

      {/* Portfolio List */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 20, padding: 28
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 20px'
        }}>
          Mera Portfolio ({profile?.portfolio?.length || 0} videos)
        </h2>

        {!profile?.portfolio?.length ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎞️</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Abhi koi video nahi
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Upar se video upload karo
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 18
          }}>
            {profile.portfolio.map((item, i) => (
              <div key={i} style={{
                border: '1px solid #E2E8F0', borderRadius: 14,
                overflow: 'hidden', background: '#F8FAFC'
              }}>
                {/* Video Player */}
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    controls
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  />
                )}

                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: '#94A3B8',
                    marginTop: 2, textTransform: 'capitalize'
                  }}>
                    {item.type}
                  </div>
                  <button
                    onClick={() => handleDelete(i)}
                    style={{
                      marginTop: 10, width: '100%',
                      padding: '7px', borderRadius: 8,
                      border: '1px solid #FEE2E2',
                      background: '#FEF2F2', color: '#B91C1C',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600
                    }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPortfolio;