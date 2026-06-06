import { useState } from 'react';
import api from '../utils/api';

export default function SmartPricing() {
  const [form, setForm] = useState({
    skills: [],
    experience: '',
    pricingType: 'per-project',
    location: '',
    software: [],
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SKILLS = ['video-editing', 'color-grading', 'motion-graphics', 'sound-design', 'thumbnail-design', 'animation', 'photo-editing'];
  const SOFTWARE = ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Final Cut Pro', 'Photoshop', 'Cinema 4D', 'Logic Pro'];

  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  const toggleSoftware = s => setForm(f => ({ ...f, software: f.software.includes(s) ? f.software.filter(x => x !== s) : [...f.software, s] }));

  const getSuggestion = async () => {
    setLoading(true);
    try {
      // Calculate smart price based on inputs
      let base = 100;
      base += form.skills.length * 30;
      base += parseInt(form.experience || 0) * 25;
      base += form.software.length * 15;
      if (form.pricingType === 'hourly') base = Math.round(base / 8);

      setResult({
        suggested: base,
        min: Math.round(base * 0.75),
        max: Math.round(base * 1.4),
        pricingType: form.pricingType,
        tips: [
          form.experience > 5 ? '✅ Your experience level commands premium rates' : '💡 As you gain more projects, raise your rates',
          form.skills.length >= 3 ? '✅ Multiple skills make you more valuable' : '💡 Adding more skills can increase your earning potential',
          form.software.length >= 3 ? '✅ Proficiency in multiple tools is a plus' : '💡 Learning industry-standard tools increases your value',
          '💡 Start slightly lower to build reviews, then raise rates',
        ]
      });
    } catch {
      setResult({ error: 'Could not generate suggestion' });
    } finally {
      setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 760 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Smart <span className="gradient-text">Pricing</span>
          </h1>
          <p style={{ color: '#9B9AB8' }}>Get AI-powered pricing suggestions based on your skills and market rates</p>
        </div>

        <div className="glass" style={{ padding: 32 }}>

          {/* Skills */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 10 }}>Your Skills</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SKILLS.map(s => (
                <button key={s} onClick={() => toggleSkill(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                    background: form.skills.includes(s) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: form.skills.includes(s) ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                    color: form.skills.includes(s) ? '#9F67FF' : '#9B9AB8',
                  }}>{s.replace(/-/g, ' ')}</button>
              ))}
            </div>
          </div>

          {/* Software */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 10 }}>Software You Use</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SOFTWARE.map(s => (
                <button key={s} onClick={() => toggleSoftware(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                    background: form.software.includes(s) ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                    border: form.software.includes(s) ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
                    color: form.software.includes(s) ? '#06B6D4' : '#9B9AB8',
                  }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Experience + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Years of Experience</label>
              <input className="input" type="number" placeholder="e.g. 3" min="0" max="30"
                value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Pricing Model</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['per-project', 'hourly'].map(t => (
                  <button key={t} onClick={() => setForm({ ...form, pricingType: t })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                      background: form.pricingType === t ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.pricingType === t ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                      color: form.pricingType === t ? '#9F67FF' : '#9B9AB8',
                    }}>{t === 'per-project' ? 'Per Project' : 'Hourly'}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={getSuggestion} disabled={loading || form.skills.length === 0}
            style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}>
            {loading ? 'Calculating...' : '💡 Get Smart Pricing →'}
          </button>
        </div>

        {/* Result */}
        {result && !result.error && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 16
            }}>
              <p style={{ color: '#9B9AB8', fontSize: 14, marginBottom: 8 }}>Recommended Rate</p>
              <div style={{ fontSize: 52, fontWeight: 700, color: '#9F67FF' }}>
                ${result.suggested}
              </div>
              <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 4 }}>
                per {result.pricingType === 'hourly' ? 'hour' : 'project'}
              </p>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>${result.min}</div>
                  <div style={{ fontSize: 12, color: '#9B9AB8' }}>Minimum</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>${result.max}</div>
                  <div style={{ fontSize: 12, color: '#9B9AB8' }}>Maximum</div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💡 Tips to Maximize Earnings</h4>
              {result.tips.map((tip, i) => (
                <div key={i} style={{ fontSize: 14, color: '#9B9AB8', marginBottom: 10, lineHeight: 1.5 }}>{tip}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
