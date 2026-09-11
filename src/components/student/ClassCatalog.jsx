import React, { useState } from 'react';
import { BookOpen, Search, Check, Shield, CreditCard, Play, Lock, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { Modal } from '../common/Modal';

export const ClassCatalog = ({ onOpenClassroom, onNeedAuth }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { classes, subjects, grades, checkEnrollment, enrollInClass, settings, showToast } = useLms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');
  const [processing, setProcessing] = useState(false);

  const filtered = classes.filter((c) => {
    const matchesSubj = selectedSubjectFilter === 'all' || c.subjectId === selectedSubjectFilter;
    const matchesGrade =
      selectedGradeFilter === 'all' ||
      c.grade?.toLowerCase() === selectedGradeFilter.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubj && matchesGrade && matchesSearch;
  });

  const handleEnrollClick = (cls) => {
    if (!isAuthenticated) {
      if (onNeedAuth) onNeedAuth();
      return;
    }
    setTargetClass(cls);
    setCheckoutModalOpen(true);
  };

  const handleConfirmEnrollment = async (e) => {
    e.preventDefault();
    if (!targetClass) return;
    setProcessing(true);
    try {
      const res = await enrollInClass(targetClass.id, paymentMethod);
      if (res) {
        setCheckoutModalOpen(false);
        // Prompt to open classroom
        onOpenClassroom(targetClass.id);
      }
    } catch (err) {
      showToast('Enrollment failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Explore Academic Course Catalog</h1>
          <p>Discover courses led by premier instructors. Enroll to unlock lecture videos, quizzes, and materials.</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search all classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Filter Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {/* Subject Filter Pills */}
        <div className="filter-scroll-container">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}>
            Subject:
          </span>
          <button
            className={`btn btn-sm filter-pill-btn ${selectedSubjectFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSubjectFilter('all')}
          >
            All Subjects ({classes.length})
          </button>
          {subjects.map((subj) => (
            <button
              key={subj.id}
              className={`btn btn-sm filter-pill-btn ${selectedSubjectFilter === subj.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSubjectFilter(subj.id)}
            >
              <span>{subj.icon}</span>
              <span>{subj.name}</span>
            </button>
          ))}
        </div>

        {/* Grade Filter Pills */}
        {grades && grades.length > 0 && (
          <div className="filter-scroll-container">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}>
              Grade:
            </span>
            <button
              className={`btn btn-sm filter-pill-btn ${selectedGradeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedGradeFilter('all')}
            >
              All Grades
            </button>
            {grades.map((grd) => (
              <button
                key={grd.id}
                className={`btn btn-sm filter-pill-btn ${selectedGradeFilter.toLowerCase() === grd.name.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedGradeFilter(grd.name)}
              >
                <Award size={14} color={grd.color} />
                <span>{grd.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="cards-grid">
        {filtered.map((cls) => {
          const isEnrolled = checkEnrollment(cls.id);
          const subj = subjects.find((s) => s.id === cls.subjectId);

          return (
            <div
              key={cls.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', height: '180px' }}>
                <img
                  src={cls.thumbnail}
                  alt={cls.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  {isEnrolled ? (
                    <span className="badge badge-success">Enrolled & Unlocked</span>
                  ) : (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Requires Enrollment
                    </span>
                  )}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {cls.fee > 0 ? `${settings?.currencySymbol || '$'}${cls.fee}` : 'Free Course'}
                </div>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {subj?.name} • {cls.grade}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{cls.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {cls.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Instructor: {cls.instructor} • {cls.schedule}
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  {isEnrolled ? (
                    <button
                      onClick={() => onOpenClassroom(cls.id)}
                      className="btn btn-primary btn-block btn-sm"
                    >
                      <Play size={16} /> Enter Classroom
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnrollClick(cls)}
                      className="btn btn-accent btn-block btn-sm"
                    >
                      <CreditCard size={16} />
                      {cls.fee > 0 ? `Enroll for $${cls.fee}` : 'Enroll for Free'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout / Enrollment Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={`Class Admission & Enrollment: ${targetClass?.title}`}
      >
        <form onSubmit={handleConfirmEnrollment}>
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Course Admission:</span>
              <span style={{ fontWeight: 700 }}>{targetClass?.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Instructor:</span>
              <span>{targetClass?.instructor}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total Fee Due:</span>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                {targetClass?.fee > 0 ? `${settings?.currencySymbol || '$'}${targetClass.fee}` : 'Free'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Payment Method</label>
            <select
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Credit / Debit Card (Stripe)">Credit / Debit Card (Stripe Gateway)</option>
              <option value="Google Pay">Google Pay</option>
              <option value="PayPal Express">PayPal Express</option>
              <option value="Scholarship / Voucher">Scholarship / Educational Voucher</option>
            </select>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Shield size={16} color="var(--success)" />
            <span>Secure 256-bit encrypted simulated gateway transaction. Instant admission.</span>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setCheckoutModalOpen(false)} className="btn btn-secondary" disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Admission...</span>
                </>
              ) : (
                'Confirm Enrollment & Access'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
