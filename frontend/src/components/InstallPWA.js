import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!showBanner || installed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%',
      transform: 'translateX(-50%)', zIndex: 9999,
      background: '#fff', borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid #E2E8F0',
      padding: '16px 20px', display: 'flex',
      alignItems: 'center', gap: 14,
      maxWidth: 380, width: 'calc(100vw - 32px)',
      animation: 'fadeUp 0.4s ease'
    }}>
      {/* App Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 700, fontSize: 14, color: '#0F172A'
        }}>
          Install EditHire App
        </div>
        <div style={{
          fontSize: 12, color: '#64748B', marginTop: 2
        }}>
          Add to home screen for the best experience
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            padding: '8px 12px', borderRadius: 8,
            border: '1px solid #E2E8F0', background: '#F8FAFC',
            color: '#64748B', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit'
          }}>
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
          }}>
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
