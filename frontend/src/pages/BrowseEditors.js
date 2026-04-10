import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const SKILL_LABELS = {
  'video-editing': 'Video Editing',
  'photo-editing': 'Photo Editing',
  'thumbnail-design': 'Thumbnail Design',
  'color-grading': 'Color Grading',
  'motion-graphics': 'Motion Graphics',
  'sound-design': 'Sound Design',
  'animation': 'Animation',
};

const SKILL_COLORS = {
  'video-editing': { bg: '#EEF2FF', color: '#4338CA' },
  'photo-editing': { bg: '#F0FDF4', color: '#15803D' },
  'thumbnail-design': { bg: '#FFF7ED', color: '#C2410C' },
  'color-grading': { bg: '#FDF4FF', color: '#9333EA' },
  'motion-graphics': { bg: '#EFF6FF', color: '#1D4ED8' },
  'sound-design': { bg: '#FFF1F2', color: '#BE123C' },
  'animation': { bg: '#F0FDFA', color: '#0F766E' },
};

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
        stroke="#F59E0B" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </span>
);

const SkillBadge = ({ skill }) => {
  const c = SKILL_COLORS[skill] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, display: 'inline-block'
    }}>{SKILL_LABELS[skill] || skill}</span>
  );
};

const BrowseEditors = () => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [priceMax, setPriceMax] = useState(1000);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEditors();
  }, [skillFilter, sortBy]);

  const fetchEditors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (skillFilter) params.skill = skillFilter;
      if (sortBy) params.sort = sortBy;
      const { data } = await API.get('/editors', { params });
      setEditors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = editors.filter(e => {
    if (search && !e.user?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (e.price > priceMax) return false;
    return true;
  });

  const handleHire = (editorUserId) => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'client') { alert('Sirf clients hire kar sakte hain'); return; }
    navigate(`/editors/${editorUserId}`);
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: '#0F172A',
          margin: '0 0 8px', letterSpacing: '-1px'
        }}>Find Your Perfect Editor</h1>
        <p style={{ color: '#64748B', fontSize: 16, margin: 0 }}>
          Talented editors dhundho aur apna vision live karo
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
        padding: '20px 24px', marginBottom: 28,
        display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Editor dhundho..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
              border: '1.5px solid #E2E8F0', fontSize: 14,
              boxSizing: 'border-box', outline: 'none'
            }}
          />
        </div>

        {/* Skill Filter */}
        <select
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', fontSize: 14,
            background: '#fff', color: '#374151', cursor: 'pointer'
          }}>
          <option value="">All Skills</option>
          {Object.entries(SKILL_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', fontSize: 14,
            background: '#fff', color: '#374151', cursor: 'pointer'
          }}>
          <option value="rating">Top Rated</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>

        {/* Price Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 160px' }}>
          <span style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
            Max ${priceMax}
          </span>
          <input
            type="range" min={50} max={1000} step={50}
            value={priceMax}
            onChange={e => setPriceMax(+e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Results Count */}
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>
        {filtered.length} editor{filtered.length !== 1 ? 's' : ''} mile
      </p>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #E2E8F0',
            borderTopColor: '#6366F1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Editor Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 22
          }}>
            {filtered.map(editor => (
              <div key={editor._id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.10)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}>

                {/* Portfolio Preview */}
                <div style={{
                  height: 150, background: '#F1F5F9',
                  position: 'relative', overflow: 'hidden'
                }}
                  onClick={() => navigate(`/editors/${editor.user?._id}`)}>
                  {editor.portfolio?.[0] && (
                    <img
                      src={editor.portfolio[0].thumbnail}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: editor.availability ? '#DCFCE7' : '#FEE2E2',
                    color: editor.availability ? '#16A34A' : '#DC2626',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700
                  }}>
                    {editor.availability ? 'Available' : 'Busy'}
                  </div>
                </div>

                <div style={{ padding: '18px 20px' }}>
                  {/* Editor Info */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 12, marginBottom: 12
                  }}
                    onClick={() => navigate(`/editors/${editor.user?._id}`)}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: '#6366F1', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16, flexShrink: 0
                    }}>
                      {editor.user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                        {editor.user?.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
                        {editor.location}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: '#6366F1' }}>
                        ${editor.price}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#94A3B8' }}>
                          /{editor.pricingType === 'hourly' ? 'hr' : 'proj'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{
                    fontSize: 13, color: '#64748B', margin: '0 0 12px',
                    lineHeight: 1.6, display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{editor.bio}</p>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {editor.skills?.slice(0, 3).map(s => (
                      <SkillBadge key={s} skill={s} />
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 12, borderTop: '1px solid #F1F5F9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <StarRating rating={editor.averageRating} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                        {editor.averageRating}
                      </span>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>
                        ({editor.totalReviews})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/editors/${editor.user?._id}`)}
                        style={{
                          padding: '7px 14px', borderRadius: 8,
                          border: '1.5px solid #E2E8F0', background: '#fff',
                          color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600
                        }}>View</button>
                      {(!user || user.role === 'client') && (
                        <button
                          onClick={() => handleHire(editor.user?._id)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, border: 'none',
                            background: '#6366F1', color: '#fff',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600
                          }}>Hire</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Koi editor nahi mila</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Filters change karo</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseEditors;