import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLms } from './context/LmsContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SubjectManager } from './components/admin/SubjectManager';
import { GradeManager } from './components/admin/GradeManager';
import { ClassManager } from './components/admin/ClassManager';
import { LessonManager } from './components/admin/LessonManager';
import { SiteSettings } from './components/admin/SiteSettings';
import { StudentManager } from './components/admin/StudentManager';
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
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '1.25rem'
        }}
      >
        Initializing EduPro LMS...
      </div>
    );
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
      </div>
    </div>
  );
};
export default App;
