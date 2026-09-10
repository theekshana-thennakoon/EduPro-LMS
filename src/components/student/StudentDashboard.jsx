import React, { useState, useEffect } from 'react';
import { BookOpen, Bookmark, CreditCard, Award, ArrowRight, Play, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';

export const StudentDashboard = ({ onNavigate, onOpenClassroom }) => {
  const { currentUser } = useAuth();
  const { classes, watchLaterList, settings } = useLms();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadStudentData = async () => {
      if (currentUser) {
        const enrolled = await lmsService.getStudentEnrolledClasses(currentUser.id);
        setEnrolledClasses(enrolled);
        const pmts = await lmsService.getStudentPayments(currentUser.id);
        setPayments(pmts);
      }
    };
    loadStudentData();
  }, [currentUser, classes]);

  const completedCount = currentUser?.completedLessonIds?.length || 0;

  return (
    <div>
      {/* Student Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
            Student Learning Portal
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            Welcome back, {currentUser?.name || 'Student'}! 👋
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Continue your educational journey. You are enrolled in {enrolledClasses.length} active classes. Access lessons, watch saved video lectures, or attempt quizzes below.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('student-enrolled')}
              className="btn btn-primary btn-sm"
            >
              <BookOpen size={16} /> My Enrolled Classes
            </button>
            <button
              onClick={() => onNavigate('student-watch-later')}
              className="btn btn-secondary btn-sm"
            >
              <Bookmark size={16} /> Watch Later ({watchLaterList.length})
            </button>
            <button
              onClick={() => onNavigate('student-catalog')}
              className="btn btn-secondary btn-sm"
            >
              Browse Catalog
            </button>
          </div>
        </div>

        {/* Quick Profile Summary Badge */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <img
            src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
            alt="Student Avatar"
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.grade || 'Enrolled Student'}</div>
            <span className="badge badge-success" style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>
              Account Verified
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{enrolledClasses.length}</div>
            <div className="stat-label">Enrolled Classes</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Lessons Completed</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent)' }}>
            <Bookmark size={24} />
          </div>
          <div>
            <div className="stat-value">{watchLaterList.length}</div>
            <div className="stat-label">Watch Later Videos</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Billing Invoices</div>
          </div>
        </div>
      </div>

      {/* Enrolled Classes Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Enrolled Classes</h2>
            <p style={{ fontSize: '0.875rem' }}>Only classes you are officially admitted to can be accessed.</p>
          </div>

          <button onClick={() => onNavigate('student-enrolled')} className="btn btn-secondary btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>

        {enrolledClasses.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>You are not enrolled in any classes yet</h3>
            <p style={{ marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Explore the academy course catalog and enroll in subjects to access video lectures, interactive quizzes, and lesson notes.
            </p>
            <button onClick={() => onNavigate('student-catalog')} className="btn btn-primary">
              Explore Available Classes
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {enrolledClasses.map((cls) => (
              <div
                key={cls.id}
                className="glass-card card-interactive"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                onClick={() => onOpenClassroom(cls.id)}
              >
                <div style={{ position: 'relative', height: '170px' }}>
                  <img
                    src={cls.thumbnail}
                    alt={cls.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className="badge badge-success">Enrolled</span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{cls.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Instructor: {cls.instructor} • {cls.schedule}
                    </div>
                  </div>

                  <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '0.75rem' }}>
                    <Play size={15} /> Enter Classroom
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watch Later Quick Preview */}
      {watchLaterList.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Watch Later Queue</h2>
              <p style={{ fontSize: '0.875rem' }}>Saved lecture videos for quick review.</p>
            </div>
            <button onClick={() => onNavigate('student-watch-later')} className="btn btn-secondary btn-sm">
              View All ({watchLaterList.length})
            </button>
          </div>

          <div className="cards-grid-sm">
            {watchLaterList.slice(0, 3).map((vid) => (
              <div
                key={vid.id}
                className="glass-card"
                style={{ padding: '1rem', cursor: 'pointer' }}
                onClick={() => onOpenClassroom(vid.classId, vid.lessonId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Play size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{vid.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vid.className}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{vid.lessonTitle}</span>
                  <span>{vid.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
