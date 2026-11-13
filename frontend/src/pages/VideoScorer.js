import { useState } from 'react';
import Icon from'../components/Icon';

const CRITERIA = [
  { key: 'editing', label: 'Editing Quality', icon: 'scissors', desc: 'Cuts, transitions, pacing' },
  { key: 'color', label: 'Color Grading', icon: 'palette', desc: 'Color consistency and mood' },
  { key: 'audio', label: 'Audio Quality', icon: 'music', desc: 'Sound mixing and clarity' },
  { key: 'motion', label: 'Motion Graphics', icon: 'sparkles', desc: 'Animations and effects' },
  { key: 'story', label: 'Storytelling', icon: 'book', desc: 'Narrative flow and engagement' },
];

export default function VideoScorer() {
  const [url, setUrl] = useState('');
  const [scores, setScores] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const analyzeVideo = async () => {
    if (!url && !manualMode) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800)); // simulate analysis

    // Generate scores
    const generated = {};
    CRITERIA.forEach(c => { generated[c.key] = Math.floor(Math.random() * 30) + 65; });
    setScores(generated);
    const avg = Math.round(Object.values(generated).reduce((a, b) => a + b, 0) / CRITERIA.length);
    setResult({
      overall: avg,
      grade: avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : 'D',
      label: avg >= 90 ? 'Exceptional' : avg >= 80 ? 'Great' : avg >= 70 ? 'Good' : avg >= 60 ? 'Average' : 'Needs Work',
      color: avg >= 80 ? '#10B981' : avg >= 70 ? '#06B6D4' : avg >= 60 ? '#F59E0B' : '#EF4444',
    });
    setLoading(false);
  };

  const manualScore = () => {
    const avg = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);
    setResult({
      overall: avg,
      grade: avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : 'D',
      label: avg >= 90 ? 'Exceptional' : avg >= 80 ? 'Great' : avg >= 70 ? 'Good' : avg >= 60 ? 'Average' : 'Needs Work',
      color: avg >= 80 ? '#10B981' : avg >= 70 ? '#06B6D4' : avg >= 60 ? '#F59E0B' : '#EF4444',
    });
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 760 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#9F67FF', marginBottom: 12 }}><Icon name="film"size={40} /></div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Video <span className="gradient-text">Scorer</span>
          </h1>
          <p style={{ color: '#9B9AB8' }}>Analyze and score video editing quality across key criteria</p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          <button onClick={() => setManualMode(false)} style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
            background: !manualMode ? 'rgba(124,58,237,0.15)' : 'transparent',
            border: !manualMode ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
            color: !manualMode ? '#9F67FF' : '#9B9AB8',
          }}>Auto Analyze</button>
          <button onClick={() => setManualMode(true)} style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
            background: manualMode ? 'rgba(124,58,237,0.15)' : 'transparent',
            border: manualMode ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
            color: manualMode ? '#9F67FF' : '#9B9AB8',
          }}>Manual Score</button>
        </div>

        <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
          {!manualMode ? (
            <>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 10 }}>Video URL</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input className="input" placeholder="https://youtube.com/watch?v=... or video link"
                  value={url} onChange={e => setUrl(e.target.value)} style={{ flex: 1 }} />
                <button className="btn-primary" onClick={analyzeVideo} disabled={loading || !url}
                  style={{ flexShrink: 0, padding: '10px 20px' }}>
                  {loading ? 'Analyzing...' : 'Analyze →'}
                </button>
              </div>
              <p style={{ color: '#5C5B7A', fontSize: 12, marginTop: 8 }}>
                * Currently supports YouTube, Vimeo links. Demo mode shows sample analysis.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Rate Each Criteria (0-100)</h3>
              {CRITERIA.map(c => (
                <div key={c.key} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={c.icon} size={18} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: '#9B9AB8' }}>{c.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#9F67FF', minWidth: 40, textAlign: 'right' }}>
                      {scores[c.key] || 0}
                    </div>
                  </div>
                  <input type="range" min="0" max="100"
                    value={scores[c.key] || 0}
                    onChange={e => setScores({ ...scores, [c.key]: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7C3AED' }} />
                </div>
              ))}
              <button className="btn-primary" onClick={manualScore}
                disabled={Object.keys(scores).length < CRITERIA.length}
                style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                Calculate Score →
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ marginBottom: 12, color: '#9F67FF', animation: 'spin 2s linear infinite', display: 'inline-block' }}><Icon name="film"size={36} /></div>
            <p style={{ color: '#9B9AB8' }}>Analyzing video quality...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Overall score */}
            <div style={{
              background: `linear-gradient(135deg, ${result.color}20, rgba(124,58,237,0.1))`,
              border: `1px solid ${result.color}40`,
              borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 20
            }}>
              <p style={{ color: '#9B9AB8', marginBottom: 4 }}>Overall Score</p>
              <div style={{ fontSize: 72, fontWeight: 700, color: result.color, lineHeight: 1 }}>{result.overall}</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{result.grade}</div>
              <div className="chip" style={{ display: 'inline-block', marginTop: 8, fontSize: 14, padding: '6px 16px' }}>{result.label}</div>
            </div>

            {/* Breakdown */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Score Breakdown</h3>
              {CRITERIA.map(c => {
                const score = scores[c.key] || 0;
                const color = score >= 80 ? '#10B981' : score >= 70 ? '#06B6D4' : score >= 60 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={c.key} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name={c.icon} size={14} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}/100</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${score}%`, background: color,
                        borderRadius: 4, transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn-ghost" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              onClick={() => { setResult(null); setScores({}); setUrl(''); }}>
              ← Analyze Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
