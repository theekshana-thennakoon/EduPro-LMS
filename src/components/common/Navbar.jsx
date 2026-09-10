import React, { useState } from 'react';
import { Menu, Sun, Moon, LogIn, LogOut, User, Shield, GraduationCap, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { AuthModal } from '../auth/AuthModal';

export const Navbar = ({ onToggleSidebar, onLogoClick, onViewChange }) => {
  const { currentUser, isAuthenticated, isTeacher, logout } = useAuth();
  const { settings, theme, toggleTheme } = useLms();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleBrandClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    if (onViewChange) {
      onViewChange(isTeacher ? 'admin-profile' : 'student-profile');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile hamburger button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onToggleSidebar}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo & Institute Name */}
          <div className="brand-logo" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>
                {settings?.siteName || 'EduPro LMS'}
              </div>
              <div className="brand-subtitle-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {settings?.instituteTitle || 'Learning Institute'}
              </div>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <div
                className="user-pill"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                  alt={currentUser?.name}
                  className="user-avatar"
                />
                <div className="user-name-text" style={{ display: 'flex', flexDirection: 'column', paddingRight: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentUser?.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: isTeacher ? 'var(--primary)' : 'var(--success)',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {isTeacher ? 'Teacher / Admin' : 'Student'}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {/* User Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 48 }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '240px',
                      padding: '0.75rem',
                      zIndex: 49,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                    </div>

                    <button
                      className="sidebar-link"
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={handleProfileClick}
                    >
                      <User size={16} color="var(--primary)" />
                      <span>{isTeacher ? 'Admin Profile' : 'Student Profile'}</span>
                    </button>

                    <button
                      className="sidebar-link"
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} color="var(--danger)" />
                      <span style={{ color: 'var(--danger)' }}>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.55rem 1.15rem' }}
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
