import React from 'react';
import { LayoutDashboard, BookOpen, Bookmark, CreditCard, User, Shield, Compass, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = ({ currentView, onViewChange, onNeedAuth }) => {
  const { isTeacher, isStudent, isAuthenticated } = useAuth();

  if (isTeacher) {
    return (
      <nav className="mobile-bottom-nav">
        <div
          className={`bottom-nav-item ${currentView === 'admin-dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('admin-dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'admin-classes' ? 'active' : ''}`}
          onClick={() => onViewChange('admin-classes')}
        >
          <BookOpen size={20} />
          <span>Classes</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'admin-lessons' ? 'active' : ''}`}
          onClick={() => onViewChange('admin-lessons')}
        >
          <Shield size={20} />
          <span>Lessons</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'admin-settings' ? 'active' : ''}`}
          onClick={() => onViewChange('admin-settings')}
        >
          <User size={20} />
          <span>Settings</span>
        </div>
      </nav>
    );
  }

  if (isAuthenticated && isStudent) {
    return (
      <nav className="mobile-bottom-nav">
        <div
          className={`bottom-nav-item ${currentView === 'student-dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('student-dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'student-enrolled' ? 'active' : ''}`}
          onClick={() => onViewChange('student-enrolled')}
        >
          <BookOpen size={20} />
          <span>Enrolled</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'student-catalog' ? 'active' : ''}`}
          onClick={() => onViewChange('student-catalog')}
        >
          <Compass size={20} />
          <span>Explore</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'student-watch-later' ? 'active' : ''}`}
          onClick={() => onViewChange('student-watch-later')}
        >
          <Bookmark size={20} />
          <span>Saved</span>
        </div>
        <div
          className={`bottom-nav-item ${currentView === 'student-profile' ? 'active' : ''}`}
          onClick={() => onViewChange('student-profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="mobile-bottom-nav">
      <div
        className={`bottom-nav-item ${currentView === 'student-catalog' ? 'active' : ''}`}
        onClick={() => onViewChange('student-catalog')}
      >
        <Compass size={20} />
        <span>All Classes</span>
      </div>
      <div
        className="bottom-nav-item"
        onClick={() => {
          if (onNeedAuth) onNeedAuth();
        }}
      >
        <LogIn size={20} />
        <span>Sign In</span>
      </div>
    </nav>
  );
};
