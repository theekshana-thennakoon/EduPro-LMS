import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useLms } from './context/LmsContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { LoadingSplash } from './components/common/LoadingSplash';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SubjectManager } from './components/admin/SubjectManager';
import { GradeManager } from './components/admin/GradeManager';
import { ClassManager } from './components/admin/ClassManager';
import { LessonManager } from './components/admin/LessonManager';
import { SiteSettings } from './components/admin/SiteSettings';
import { StudentManager } from './components/admin/StudentManager';
import { TeacherManager } from './components/admin/TeacherManager';
import { PaymentManager } from './components/admin/PaymentManager';
import { AdminProfileView } from './components/admin/AdminProfileView';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { EnrolledClasses } from './components/student/EnrolledClasses';
import { ClassCatalog } from './components/student/ClassCatalog';
import { ClassroomView } from './components/student/ClassroomView';
import { WatchLaterView } from './components/student/WatchLaterView';
import { PaymentHistoryView } from './components/student/PaymentHistoryView';
import { StudentProfileView } from './components/student/StudentProfileView';

export const App = () => {
  const { currentUser, isTeacher, isStudent, isAuthenticated } = useAuth();
  const { loading } = useLms();

  // Navigation state - default to classes catalog upon entering LMS
  const [currentView, setCurrentView] = useState('student-catalog');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [targetLessonId, setTargetLessonId] = useState(null);
  const [selectedSubjectIdForClasses, setSelectedSubjectIdForClasses] = useState(null);
  const [selectedGradeForClasses, setSelectedGradeForClasses] = useState(null);

  // Layout UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Global Security & Screen Recording / Screen Capture Protection
  const [securityAlert, setSecurityAlert] = useState(null);

  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Web Screen Recording API (navigator.mediaDevices.getDisplayMedia)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getDisplayMedia = async () => {
          setSecurityAlert('Screen recording / screen sharing is prohibited on this educational portal.');
          throw new DOMException('Screen recording and screen capture are strictly prohibited by EduPro LMS security policy.', 'NotAllowedError');
        };
      } catch (err) {
        console.warn('Screen capture API protection initialized:', err);
      }
    }

    // 3. Prevent Keyboard Inspection & Screen Capture Shortcuts
    const handleKeyDown = (e) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode || e.which;

      // PrintScreen Key / Snipping Tool (Key 44 or 'PrintScreen')
      if (key === 'printscreen' || keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        setSecurityAlert('⚠️ Screen capture is disabled for copyright protection.');
        return false;
      }

      // Windows + Shift + S / Cmd + Shift + 3, 4, 5 (Snipping Tool & Screen Capture)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 's' || key === '3' || key === '4' || key === '5' || keyCode === 83 || keyCode === 51 || keyCode === 52 || keyCode === 53)) {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        setSecurityAlert('⚠️ Screen capture and recording are disabled on this LMS.');
        return false;
      }

      // Ctrl + P / Cmd + P (Print to PDF / Paper)
      if (ctrlOrCmd && (key === 'p' || keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        setSecurityAlert('⚠️ Printing course content is restricted.');
        return false;
      }

      // F12 (DevTools)
      if (key === 'f12' || keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U / Cmd + U (View Source)
      if (ctrlOrCmd && (key === 'u' || keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I / Cmd + Opt + I (Inspect)
      if (ctrlOrCmd && (e.shiftKey || (isMac && e.altKey)) && (key === 'i' || keyCode === 73)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + J / Cmd + Opt + J (Console)
      if (ctrlOrCmd && (e.shiftKey || (isMac && e.altKey)) && (key === 'j' || keyCode === 74)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + C / Cmd + Opt + C (Element Inspector)
      if (ctrlOrCmd && (e.shiftKey || (isMac && e.altKey)) && (key === 'c' || keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S / Cmd + S (Save Page)
      if (ctrlOrCmd && (key === 's' || keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode || e.which;
      if (key === 'printscreen' || keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        setSecurityAlert('⚠️ Screen capture is disabled for copyright protection.');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, []);

  // Auto-dismiss security alert after 3.5s
  useEffect(() => {
    if (securityAlert) {
      const t = setTimeout(() => setSecurityAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [securityAlert]);

  // Sync default view when user role changes
  useEffect(() => {
    if (isTeacher) {
      setCurrentView((prev) => (prev.startsWith('admin-') ? prev : 'admin-dashboard'));
    } else if (isAuthenticated && isStudent) {
      setCurrentView((prev) => (prev.startsWith('admin-') ? 'student-dashboard' : prev));
    } else {
      const studentOnlyViews = [
        'student-dashboard',
        'student-enrolled',
        'student-watch-later',
        'student-payments',
        'student-profile'
      ];
      setCurrentView((prev) =>
        prev.startsWith('admin-') || studentOnlyViews.includes(prev) ? 'student-catalog' : prev
      );
    }
  }, [isTeacher, isStudent, isAuthenticated]);

  const handleOpenClassroom = (classId, lessonId = null) => {
    setSelectedClassId(classId);
    setTargetLessonId(lessonId);
    setCurrentView('student-classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubjectForClasses = (subjectId) => {
    setSelectedSubjectIdForClasses(subjectId);
    setCurrentView('admin-classes');
  };

  const handleSelectGradeForClasses = (gradeName) => {
    setSelectedGradeForClasses(gradeName);
    setCurrentView('admin-classes');
  };

  const handleSelectClassForLessons = (classId) => {
    setSelectedClassId(classId);
    setCurrentView('admin-lessons');
  };

  if (loading) {
    return <LoadingSplash />;
  }

  return (
    <div className="app-container">
      {/* Dynamic Toast Notifications */}
      <Toast />

      {/* Global Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNeedAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Top Navigation */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onViewChange={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogoClick={() => {
            setCurrentView(isTeacher ? 'admin-dashboard' : 'student-catalog');
          }}
        />

        {/* Dynamic Page Views */}
        <main className="page-body">
          {/* ================= TEACHER ADMIN VIEWS ================= */}
          {isTeacher && currentView === 'admin-dashboard' && (
            <AdminDashboard
              onNavigate={setCurrentView}
              onSelectClassForLessons={handleSelectClassForLessons}
            />
          )}

          {isTeacher && currentView === 'admin-subjects' && (
            <SubjectManager onSelectSubjectForClasses={handleSelectSubjectForClasses} />
          )}

          {isTeacher && currentView === 'admin-grades' && (
            <GradeManager onSelectGradeForClasses={handleSelectGradeForClasses} />
          )}

          {isTeacher && currentView === 'admin-classes' && (
            <ClassManager
              selectedSubjectId={selectedSubjectIdForClasses}
              selectedGradeName={selectedGradeForClasses}
              onSelectClassForLessons={handleSelectClassForLessons}
            />
          )}

          {isTeacher && currentView === 'admin-lessons' && (
            <LessonManager initialClassId={selectedClassId} />
          )}

          {isTeacher && currentView === 'admin-students' && (
            <StudentManager />
          )}

          {isTeacher && currentView === 'admin-teachers' && (
            <TeacherManager
              onSelectTeacherForClasses={(teacherName) => {
                setCurrentView('admin-classes');
              }}
            />
          )}

          {isTeacher && currentView === 'admin-payments' && (
            <PaymentManager />
          )}

          {isTeacher && currentView === 'admin-settings' && (
            <SiteSettings />
          )}

          {isTeacher && currentView === 'admin-profile' && (
            <AdminProfileView />
          )}

          {/* ================= STUDENT ONLY VIEWS ================= */}
          {isAuthenticated && isStudent && currentView === 'student-dashboard' && (
            <StudentDashboard
              onNavigate={setCurrentView}
              onOpenClassroom={handleOpenClassroom}
            />
          )}

          {isAuthenticated && isStudent && currentView === 'student-enrolled' && (
            <EnrolledClasses
              onOpenClassroom={handleOpenClassroom}
              onNavigate={setCurrentView}
            />
          )}

          {isAuthenticated && isStudent && currentView === 'student-watch-later' && (
            <WatchLaterView
              onOpenClassroom={handleOpenClassroom}
              onNavigate={setCurrentView}
            />
          )}

          {isAuthenticated && isStudent && currentView === 'student-payments' && (
            <PaymentHistoryView />
          )}

          {isAuthenticated && isStudent && currentView === 'student-profile' && (
            <StudentProfileView />
          )}

          {/* ================= PUBLIC & GENERAL VIEWS ================= */}
          {currentView === 'student-catalog' && (
            <ClassCatalog
              onOpenClassroom={handleOpenClassroom}
              onNeedAuth={() => setAuthModalOpen(true)}
            />
          )}

          {currentView === 'student-classroom' && (
            <ClassroomView
              classId={selectedClassId}
              initialLessonId={targetLessonId}
              onBack={() => setCurrentView(isAuthenticated && isStudent ? 'student-enrolled' : 'student-catalog')}
              onNeedAuth={() => setAuthModalOpen(true)}
            />
          )}
        </main>

        {/* Mobile & Tablet Thumb Navigation Bar */}
        <MobileBottomNav
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNeedAuth={() => setAuthModalOpen(true)}
        />

        {/* Anti-Screen Recording & Protection Toast */}
        {securityAlert && (
          <div className="security-toast">
            <ShieldAlert size={18} />
            <span>{securityAlert}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
