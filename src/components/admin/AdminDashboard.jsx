import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, Film, Users, DollarSign, PlusCircle, ArrowUpRight, TrendingUp, Award, GraduationCap } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';

export const AdminDashboard = ({ onNavigate, onSelectClassForLessons }) => {
  const { subjects, grades, classes, payments, settings } = useLms();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [lessonsCount, setLessonsCount] = useState(0);

  useEffect(() => {
    const fetchAdminStats = async () => {
      const [stds, tchs] = await Promise.all([
        lmsService.getAllStudents(),
        lmsService.getAllTeachers()
      ]);
      setStudents(stds);
      setTeachers(tchs);

      let totalLes = 0;
      for (const c of classes) {
        const les = await lmsService.getLessonsByClass(c.id);
        totalLes += les.length;
      }
      setLessonsCount(totalLes);
    };
    fetchAdminStats();
  }, [classes]);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div>
      {/* Welcome Hero */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
            Academic Command Center
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            Teacher Administration & Curriculum Portal
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Welcome to the faculty management and course administration center. Manage curriculum subjects, create educational tiers, launch classes, assign faculty instructors, attach lessons & quizzes, and manage permissions.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('admin-subjects')}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} /> New Subject
            </button>
            <button
              onClick={() => onNavigate('admin-grades')}
              className="btn btn-secondary btn-sm"
            >
              <PlusCircle size={16} /> New Grade
            </button>
            <button
              onClick={() => onNavigate('admin-classes')}
              className="btn btn-secondary btn-sm"
            >
              <PlusCircle size={16} /> New Class
            </button>
            <button
              onClick={() => onNavigate('admin-teachers')}
              className="btn btn-secondary btn-sm"
            >
              <GraduationCap size={16} /> Faculty Teachers
            </button>
            <button
              onClick={() => onNavigate('admin-lessons')}
              className="btn btn-secondary btn-sm"
            >
              <Film size={16} /> Add Lessons & Quizzes
            </button>
            <button
              onClick={() => onNavigate('admin-settings')}
              className="btn btn-secondary btn-sm"
            >
              Site Settings
            </button>
            <button
              onClick={() => onNavigate('admin-profile')}
              className="btn btn-secondary btn-sm"
            >
              Admin Profile
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card" onClick={() => onNavigate('admin-subjects')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
            <Layers size={26} />
          </div>
          <div>
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Academic Subjects</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-grades')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-value">{grades?.length || 0}</div>
            <div className="stat-label">Grades & Levels</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-classes')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div className="stat-value">{classes.length}</div>
            <div className="stat-label">Active Classes</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-teachers')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div className="stat-value">{teachers.length}</div>
            <div className="stat-label">Faculty Teachers</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-lessons')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent)' }}>
            <Film size={26} />
          </div>
          <div>
            <div className="stat-value">{lessonsCount}</div>
            <div className="stat-label">Total Lessons & Modules</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-students')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Enrolled Students</div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => onNavigate('admin-payments')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div className="stat-value">
              {settings?.currencySymbol || '$'}
              {totalRevenue.toLocaleString()}
            </div>
            <div className="stat-label">Course Enrollments Revenue (Manage)</div>
          </div>
        </div>
      </div>

      {/* Curriculum Overview & Classes List */}
      <div className="split-layout-grid" style={{ marginTop: '2rem' }}>
        {/* Class Catalog Management */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Active Course Catalog</h3>
            <button
              onClick={() => onNavigate('admin-classes')}
              className="btn btn-secondary btn-sm"
            >
              Manage Classes
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {classes.slice(0, 4).map((cls) => {
              const subj = subjects.find((s) => s.id === cls.subjectId);
              return (
                <div
                  key={cls.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={cls.thumbnail}
                      alt={cls.title}
                      style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cls.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cls.grade || 'All Grades'} • {subj ? subj.name : 'Curriculum'} • {settings?.currencySymbol || '$'}{cls.fee}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClassForLessons(cls.id)}
                    className="btn btn-primary btn-sm"
                    title="Manage Lessons, Videos, Quizzes"
                  >
                    Lessons <ArrowUpRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Student Enrollments */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Admissions & Transactions</h3>
            <button
              onClick={() => onNavigate('admin-payments')}
              className="btn btn-secondary btn-sm"
            >
              All Payments
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {payments.slice(0, 5).map((pmt) => (
              <div
                key={pmt.id}
                style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pmt.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {pmt.className} • {pmt.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.95rem' }}>
                    +{settings?.currencySymbol || 'Rs.'}{pmt.amount}
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                    {pmt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
