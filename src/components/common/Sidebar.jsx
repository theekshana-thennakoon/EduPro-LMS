import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Film,
  Users,
  Settings,
  Bookmark,
  CreditCard,
  User,
  LogOut,
  X,
  Compass,
  GraduationCap,
  Award,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentView, onViewChange, isOpen, onClose, onNeedAuth }) => {
  const { currentUser, isTeacher, isStudent, isAuthenticated, logout } = useAuth();

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    if (window.innerWidth <= 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 48
          }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <GraduationCap size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              EduPro LMS
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm sidebar-close-btn"
            onClick={onClose}
            style={{ padding: '0.35rem' }}
            title="Close Menu"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-menu">
          {/* TEACHER / ADMIN PANEL NAVIGATION */}
          {isTeacher && (
            <>
              <div className="menu-category">Teacher Admin Panel</div>

              <div
                className={`sidebar-link ${currentView === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-subjects' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-subjects')}
              >
                <Layers size={18} />
                <span>Subject Manager</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-grades' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-grades')}
              >
                <Award size={18} />
                <span>Grade Manager</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-classes' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-classes')}
              >
                <BookOpen size={18} />
                <span>Class Manager</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-lessons' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-lessons')}
              >
                <Film size={18} />
                <span>Lessons & Media</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-students' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-students')}
              >
                <Users size={18} />
                <span>Student Directory</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-teachers' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-teachers')}
              >
                <GraduationCap size={18} />
                <span>Faculty & Teachers</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-payments' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-payments')}
              >
                <CreditCard size={18} />
                <span>Payment Records</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-settings')}
              >
                <Settings size={18} />
                <span>Site Settings</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'admin-profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-profile')}
              >
                <User size={18} />
                <span>Admin Profile</span>
              </div>
            </>
          )}

          {/* STUDENT PANEL NAVIGATION (STUDENT ONLY) */}
          {isAuthenticated && isStudent && (
            <>
              <div className="menu-category">Student Learning Area</div>

              <div
                className={`sidebar-link ${currentView === 'student-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard Overview</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'student-enrolled' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-enrolled')}
              >
                <BookOpen size={18} />
                <span>Enrolled Classes</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'student-catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-catalog')}
              >
                <Compass size={18} />
                <span>Explore All Classes</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'student-watch-later' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-watch-later')}
              >
                <Bookmark size={18} />
                <span>Watch Later Videos</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'student-payments' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-payments')}
              >
                <CreditCard size={18} />
                <span>Payment History</span>
              </div>

              <div
                className={`sidebar-link ${currentView === 'student-profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-profile')}
              >
                <User size={18} />
                <span>Student Profile</span>
              </div>
            </>
          )}

          {/* GUEST / VISITOR NAVIGATION (PUBLIC) */}
          {!isAuthenticated && (
            <>
              <div className="menu-category">Academic Courses</div>

              <div
                className={`sidebar-link ${currentView === 'student-catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('student-catalog')}
              >
                <Compass size={18} />
                <span>Explore All Classes</span>
              </div>

              <div
                className="sidebar-link"
                onClick={() => {
                  if (window.innerWidth <= 1024 && onClose) onClose();
                  if (onNeedAuth) onNeedAuth();
                }}
                style={{ color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}
              >
                <LogIn size={18} />
                <span>Sign In / Register</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && (
          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                  alt={currentUser?.name}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {currentUser?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem', borderRadius: '8px' }}
                title="Log Out"
              >
                <LogOut size={16} color="var(--danger)" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
