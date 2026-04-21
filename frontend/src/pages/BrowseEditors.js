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
      fontSize: 11, fontWeight: 500,
      display: 'inline-block', whiteSpace: 'nowrap'
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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    if (search && !e.user?.name?.toLowerCase()
      .includes(search.toLowerCase())) return false;
    if (e.price > priceMax) return false;
    return true;
  });

  return (
    <>
      <style>{`
        .browse-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 28px 20px;
        }
        .editors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .editor-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: pointer;
        }
        .editor-card:hover {
          box-shadow: 0 8px 30px rgba(99,102,241,0.12);
          transform: translateY(-3px);
        }
        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .filter-select {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          font-size: 14px;
          background: #fff;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
          outline: none;
        }
        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 10px 12px 10px 36px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
        }
        .search-input:focus {
          border-color: #6366F1;
        }
        @media (max-width: 768px) {
          .browse-container {
            padding: 16px 12px;
          }
          .editors-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-select {
            width: 100%;
          }
          .search-input {
            min-width: unset;
          }
          .browse-title {
            font-size: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .editor-card-body {
            padding: 14px !important;
          }
        }
      `}</style>

      <div className="browse-container">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="browse-title" style={{
            fontSize: 30, fontWeight: 800, color: '#0F172A',
            margin: '0 0 8px', letterSpacing: '-1px'
          }}>
            Find Your Perfect Editor
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>
            Browse {editors.length} talented editors
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '16px 20px', marginBottom: 24
        }}>
          <div className="filters-row">
            {/* Search */}
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <svg style={{
                position: 'absolute', left: 12,
                top: '50%', transform: 'translateY(-50%)'
              }}
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#94A3B8" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search editors..."
                className="search-input"
              />
            </div>

            {/* Skill Filter */}
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="filter-select">
              <option value="">All Skills</option>
              {Object.entries(SKILL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="filter-select">
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Price Range */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 8, flex: '1 1 160px'
            }}>
              <span style={{
                fontSize: 13, color: '#64748B', whiteSpace: 'nowrap'
              }}>
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
        </div>

        {/* Results Count */}
        <p style={{
          color: '#64748B', fontSize: 14, marginBottom: 16
        }}>
          {filtered.length} editor{filtered.length !== 1 ? 's' : ''} found
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
            <p style={{ color: '#94A3B8', marginTop: 16 }}>
              Loading editors...
            </p>
          </div>
        ) : (
          <>
            <div className="editors-grid">
              {filtered.map(editor => (
                <div
                  key={editor._id}
                  className="editor-card">

                  {/* Portfolio Preview */}
                  <div style={{
                    height: 140, background: '#F1F5F9',
                    position: 'relative', overflow: 'hidden'
                  }}
                    onClick={() => navigate(`/editors/${editor.user?._id}`)}>
                    {editor.portfolio?.[0] && (
                      <img
                        src={editor.portfolio[0].thumbnail}
                        alt=""
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover'
                        }}
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

                  {/* Card Body */}
                  <div
                    className="editor-card-body"
                    style={{ padding: '16px 18px' }}>

                    {/* Editor Info */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 10, marginBottom: 10
                    }}
                      onClick={() => navigate(`/editors/${editor.user?._id}`)}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, flexShrink: 0
                      }}>
                        {editor.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 15, color: '#0F172A',
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {editor.user?.name}
                        </div>
                        <div style={{
                          fontSize: 12, color: '#94A3B8', marginTop: 1
                        }}>
                          {editor.location}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontWeight: 800, fontSize: 16, color: '#6366F1'
                        }}>
                          ${editor.price}
                          <span style={{
                            fontSize: 11, fontWeight: 400, color: '#94A3B8'
                          }}>
                            /{editor.pricingType === 'hourly' ? 'hr' : 'proj'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{
                      fontSize: 13, color: '#64748B',
                      margin: '0 0 10px', lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{editor.bio}</p>

                    {/* Skills */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap',
                      gap: 4, marginBottom: 12
                    }}>
                      {editor.skills?.slice(0, 3).map(s => (
                        <SkillBadge key={s} skill={s} />
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12, borderTop: '1px solid #F1F5F9'
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <StarRating rating={editor.averageRating} />
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: '#0F172A'
                        }}>
                          {editor.averageRating}
                        </span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>
                          ({editor.totalReviews})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => navigate(`/editors/${editor.user?._id}`)}
                          style={{
                            padding: '7px 12px', borderRadius: 8,
                            border: '1.5px solid #E2E8F0', background: '#fff',
                            color: '#374151', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600,
                            fontFamily: 'inherit'
                          }}>View</button>
                        {(!user || user.role === 'client') && (
                          <button
                            onClick={() => navigate(`/editors/${editor.user?._id}`)}
                            style={{
                              padding: '7px 12px', borderRadius: 8,
                              border: 'none', background: '#6366F1',
                              color: '#fff', cursor: 'pointer',
                              fontSize: 12, fontWeight: 600,
                              fontFamily: 'inherit'
                            }}>Hire</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && !loading && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                color: '#94A3B8'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>
                  No editors found
                </div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  Try adjusting your filters
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BrowseEditors;