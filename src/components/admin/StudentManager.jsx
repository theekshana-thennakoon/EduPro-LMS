import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Check, X, Shield, PlusCircle } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const StudentManager = () => {
  const { classes, showToast, refreshAll, settings } = useLms();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  const fetchStudents = async () => {
    const stds = await lmsService.getAllStudents();
    setStudents(stds);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleClass = async (classId) => {
    if (!selectedStudent) return;
    try {
      const isEnrolled = selectedStudent.enrolledClassIds?.includes(classId);
      let updatedEnrolled = [];
      if (isEnrolled) {
        updatedEnrolled = (selectedStudent.enrolledClassIds || []).filter((id) => id !== classId);
      } else {
        updatedEnrolled = [...(selectedStudent.enrolledClassIds || []), classId];
      }

      await lmsService.enrollStudentInClass(selectedStudent.id, classId, { method: 'Admin Override / Scholarship' });
      showToast(isEnrolled ? 'Enrollment updated' : 'Student admitted to class!', 'success');
      await fetchStudents();
      await refreshAll();

      setSelectedStudent((prev) => ({
        ...prev,
        enrolledClassIds: updatedEnrolled
      }));
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Directory & Permissions</h1>
        <p>Review registered students, inspect class enrollments, and manage admissions.</p>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>EMAIL</th>
              <th>GRADE</th>
              <th>ENROLLED CLASSES</th>
              <th>JOINED</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
            <tbody>
              {students.map((std) => {
                const enrolledNames = (std.enrolledClassIds || [])
                  .map((id) => classes.find((c) => c.id === id)?.title)
                  .filter(Boolean);

                return (
                  <tr
                    key={std.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={std.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                          alt={std.name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{std.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {std.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{std.email}</td>

                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <span className="badge badge-outline">{std.grade || 'General'}</span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {enrolledNames.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not enrolled</span>
                        ) : (
                          enrolledNames.map((name, i) => (
                            <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                              {name.length > 25 ? name.substring(0, 25) + '...' : name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {std.joinedDate}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedStudent(std);
                          setManageModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Manage Classes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      {/* Manage Enrollment Modal */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={`Manage Enrollments: ${selectedStudent?.name}`}
      >
        <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Grant or revoke student access permissions for specific classes:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {classes.map((cls) => {
            const isEnrolled = selectedStudent?.enrolledClassIds?.includes(cls.id);
            return (
              <div
                key={cls.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: isEnrolled ? '1px solid var(--success)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{cls.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Grade: {cls.grade} • Fee: {settings?.currencySymbol || 'Rs.'}{cls.fee}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleClass(cls.id)}
                  className={`btn btn-sm ${isEnrolled ? 'btn-danger' : 'btn-primary'}`}
                >
                  {isEnrolled ? 'Revoke Access' : 'Enroll Student'}
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
