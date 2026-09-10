import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Calendar, User, Search, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';

export const EnrolledClasses = ({ onOpenClassroom, onNavigate }) => {
  const { currentUser } = useAuth();
  const { subjects } = useLms();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (currentUser) {
        const list = await lmsService.getStudentEnrolledClasses(currentUser.id);
        setEnrolledClasses(list);
      }
    };
    fetchEnrolled();
  }, [currentUser]);

  const filtered = enrolledClasses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Enrolled Classes</h1>
          <p>Access your officially registered courses and continue your studies.</p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search enrolled classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Enrolled Classes Found</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
            You haven't enrolled in any classes yet. Browse our full course catalog to discover subjects and start learning.
          </p>
          <button onClick={() => onNavigate('student-catalog')} className="btn btn-primary">
            Explore All Classes
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((cls) => {
            const subj = subjects.find((s) => s.id === cls.subjectId);
            return (
              <div
                key={cls.id}
                className="glass-card card-interactive"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                onClick={() => onOpenClassroom(cls.id)}
              >
                <div style={{ position: 'relative', height: '180px' }}>
                  <img
                    src={cls.thumbnail}
                    alt={cls.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span className="badge badge-success">Enrolled</span>
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span
                      className="badge"
                      style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', backdropFilter: 'blur(8px)' }}
                    >
                      {subj?.icon} {subj?.name}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{cls.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineClamp: 2 }}>
                      {cls.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} />
                        <span>Instructor: {cls.instructor}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        <span>Schedule: {cls.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button className="btn btn-primary btn-block">
                      <Play size={16} /> Enter Classroom & Video Lectures
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
