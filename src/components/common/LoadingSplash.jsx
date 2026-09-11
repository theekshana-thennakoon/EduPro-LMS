import React from 'react';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { useLms } from '../../context/LmsContext';

export const LoadingSplash = () => {
  const { settings } = useLms();

  return (
    <div className="loading-splash-container">
      {/* Ambient background glow circles */}
      <div className="splash-ambient-glow splash-glow-1" />
      <div className="splash-ambient-glow splash-glow-2" />

      <div className="splash-card glass-card">
        {/* Animated Logo Container with Glow Ring */}
        <div className="splash-logo-wrapper">
          <div className="splash-pulse-ring" />
          <div className="splash-logo-box">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || 'LMS Logo'}
                className="splash-logo-img"
              />
            ) : (
              <GraduationCap size={44} className="splash-logo-icon" />
            )}
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="splash-text-group">
          <h1 className="splash-brand-title">
            {settings?.siteName || 'EduPro LMS'}
          </h1>
          <p className="splash-brand-subtitle">
            {settings?.instituteTitle || 'Next-Gen Academic Learning Platform'}
          </p>
        </div>

        {/* Animated Spinner & Status Message */}
        <div className="splash-status-wrapper">
          <div className="splash-spinner-box">
            <Loader2 size={24} className="animate-spin splash-spinner" />
          </div>

          <span className="splash-status-text">
            Initializing secure learning portal...
          </span>

          {/* Shimmering Progress Bar */}
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
        </div>

        <div className="splash-footer-badge">
          <Sparkles size={12} />
          <span>Cloud Verified LMS</span>
        </div>
      </div>
    </div>
  );
};
