import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Icon from'./Icon';

export default function ProjectFiles({ requestId, requestStatus }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const canShare = requestStatus === 'accepted' || requestStatus === 'completed';

  useEffect(() => {
    if (!requestId || !canShare) { setLoading(false); return; }
    api.get(`/project-files/${requestId}`)
      .then(r => setFiles(r.data))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/project-files/${requestId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(pct);
        }
      });

      // Refresh files
      const updated = await api.get(`/project-files/${requestId}`);
      setFiles(updated.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/project-files/${requestId}/${fileId}`);
      const updated = await api.get(`/project-files/${requestId}`);
      setFiles(updated.data);
    } catch { alert('Error deleting file'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!canShare) {
    return (
      <div style={{
        padding: '16px 20px', background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10,
        fontSize: 13, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 8
      }}>
         File sharing available only after request is accepted
      </div>
    );
  }

  // Separate files by role
  const clientFiles = files.filter(f => f.role === 'client');
  const editorFiles = files.filter(f => f.role === 'editor');

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600 }}>Project Files</h4>
        {canShare && requestStatus !== 'completed' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <button
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: 12 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? `Uploading ${progress}%` : '+ Upload File'}
            </button>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
              borderRadius: 3, transition: 'width 0.3s'
            }} />
          </div>
          <p style={{ fontSize: 12, color: '#9B9AB8', marginTop: 4 }}>Uploading... {progress}%</p>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: '#9B9AB8' }}>Loading files...</p>
      ) : (
        <div>
          {/* Client Files */}
          <FileSection
            title="Client Files (Raw footage)"
            files={clientFiles}
            currentUserId={user._id}
            onDelete={handleDelete}
            formatSize={formatSize}
            emptyMsg="No files uploaded by client yet"
          />

          {/* Editor Files */}
          <FileSection
            title="Editor Files (Edited output)"
            files={editorFiles}
            currentUserId={user._id}
            onDelete={handleDelete}
            formatSize={formatSize}
            emptyMsg="No files uploaded by editor yet"
          />
        </div>
      )}
    </div>
  );
}

function FileSection({ title, files, currentUserId, onDelete, formatSize, emptyMsg }) {
  const allFiles = files.flatMap(f =>
    f.files.map(file => ({ ...file, uploadedBy: f.uploadedBy, docId: f._id }))
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#9B9AB8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </div>

      {allFiles.length === 0 ? (
        <div style={{ fontSize: 13, color: '#5C5B7A', padding: '10px 0' }}>{emptyMsg}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allFiles.map((file, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10
            }}>
              {/* Icon */}
              <div style={{ fontSize: 24, flexShrink: 0 }}>
                <Icon name={file.type === 'video' ? 'film' : 'image'} size={22} />
              </div>

              {/* Preview */}
              {file.type === 'image' && (
                <img src={file.url} alt={file.name}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              )}
              {file.type === 'video' && (
                <video src={file.url} style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: '#9B9AB8', marginTop: 2 }}>
                  {formatSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}
                  · by {file.uploadedBy?.name}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                  <button style={{
                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                    color: '#06B6D4', padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontFamily: 'DM Sans, sans-serif'
                  }}>Download</button>
                </a>
                {file.uploadedBy?._id === currentUserId && (
                  <button onClick={() => onDelete(file._id)} style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#EF4444', padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontFamily: 'DM Sans, sans-serif'
                  }}><Icon name="trash"size={15} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
