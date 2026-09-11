import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Film, Layers, DollarSign, Calendar, Users, ArrowUpRight, BookOpen, Award, GraduationCap } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';
import { ImageUpload } from '../common/ImageUpload';

export const ClassManager = ({ selectedSubjectId, selectedGradeName, onSelectClassForLessons }) => {
  const { subjects, grades, classes, refreshAll, showToast, settings } = useLms();

  const [activeSubjectFilter, setActiveSubjectFilter] = useState(selectedSubjectId || 'all');
  const [activeGradeFilter, setActiveGradeFilter] = useState(selectedGradeName || 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [teachers, setTeachers] = useState([]);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Grade 11');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [instructor, setInstructor] = useState('Prof. Alexander Wright');
  const [fee, setFee] = useState('45');
  const [schedule, setSchedule] = useState('Mon & Wed • 5:00 PM - 6:30 PM');
  const [capacity, setCapacity] = useState('100');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const list = await lmsService.getAllTeachers();
        setTeachers(list);
      } catch (err) {
        console.warn('Error fetching teachers for class manager:', err);
      }
    };
    loadTeachers();
  }, [modalOpen]);

  const filteredClasses = classes.filter((c) => {
    const matchesSubject = activeSubjectFilter === 'all' || c.subjectId === activeSubjectFilter;
    const matchesGrade =
      activeGradeFilter === 'all' ||
      c.grade?.toLowerCase() === activeGradeFilter.toLowerCase();
    return matchesSubject && matchesGrade;
  });

  const openCreateModal = () => {
    if (subjects.length === 0) {
      showToast('Please create at least one subject first!', 'error');
      return;
    }
    setEditingClass(null);
    setSubjectId(activeSubjectFilter !== 'all' ? activeSubjectFilter : subjects[0]?.id || '');
    setTitle('');
    setGrade(grades.length > 0 ? grades[0].name : 'Grade 11');
    setIsCustomGrade(false);
    setInstructor('Prof. Alexander Wright');
    setFee('45');
    setSchedule('Mon & Wed • 5:00 PM - 6:30 PM');
    setCapacity('100');
    setThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setSubjectId(cls.subjectId);
    setTitle(cls.title);
    const existingGradeMatches = grades.some((g) => g.name.toLowerCase() === cls.grade?.toLowerCase());
    setGrade(cls.grade || 'Grade 11');
    setIsCustomGrade(!existingGradeMatches && Boolean(cls.grade));
    setInstructor(cls.instructor || 'Prof. Alexander Wright');
    setFee(String(cls.fee || 0));
    setSchedule(cls.schedule || '');
    setCapacity(String(cls.capacity || 100));
    setThumbnail(cls.thumbnail || '');
    setDescription(cls.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Class title is required', 'error');
      return;
    }
    if (!subjectId) {
      showToast('Please select a subject for this class', 'error');
      return;
    }

    try {
      if (editingClass) {
        await lmsService.updateClass(editingClass.id, {
          subjectId,
          title,
          grade,
          instructor,
          fee: Number(fee) || 0,
          schedule,
          capacity: Number(capacity) || 100,
          thumbnail,
          description
        });
        showToast('Class updated successfully', 'success');
      } else {
        await lmsService.createClass({
          subjectId,
          title,
          grade,
          instructor,
          fee: Number(fee) || 0,
          schedule,
          capacity: Number(capacity) || 100,
          thumbnail,
          description
        });
        showToast('New class created under selected subject!', 'success');
      }
      await refreshAll();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete class "${title}" and all its lessons?`)) {
      return;
    }
    try {
      await lmsService.deleteClass(id);
      showToast('Class deleted', 'info');
      await refreshAll();
    } catch (err) {
      showToast('Failed to delete class', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Class Management</h1>
          <p>Create and organize multiple classes grouped by academic subjects.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Create New Class
        </button>
      </div>

      {/* Filters Bar: Subject & Grade */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {/* Subject Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '70px' }}>
            Subject:
          </span>
          <button
            className={`btn btn-sm ${activeSubjectFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubjectFilter('all')}
          >
            All Subjects ({classes.length})
          </button>
          {subjects.map((subj) => {
            const count = classes.filter((c) => c.subjectId === subj.id).length;
            return (
              <button
                key={subj.id}
                className={`btn btn-sm ${activeSubjectFilter === subj.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSubjectFilter(subj.id)}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
                <span className="badge badge-outline" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grade Filter Bar */}
        <div className="filter-scroll-container">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '70px', flexShrink: 0 }}>
            Grade Level:
          </span>
          <button
            className={`btn btn-sm filter-pill-btn ${activeGradeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveGradeFilter('all')}
          >
            All Grades ({classes.length})
          </button>
          {grades.map((grd) => {
            const count = classes.filter(
              (c) => c.grade?.toLowerCase() === grd.name.toLowerCase() || c.grade === grd.code
            ).length;
            return (
              <button
                key={grd.id}
                className={`btn btn-sm filter-pill-btn ${activeGradeFilter.toLowerCase() === grd.name.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveGradeFilter(grd.name)}
              >
                <Award size={14} color={grd.color} />
                <span>{grd.name}</span>
                <span className="badge badge-outline" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Classes Found</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {activeSubjectFilter === 'all'
              ? 'Get started by creating your first academic class.'
              : 'No classes have been assigned to this subject yet.'}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create Class Now
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredClasses.map((cls) => {
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
                {/* Thumbnail Image */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={cls.thumbnail}
                    alt={cls.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '0.5rem'
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(8px)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {subj?.icon} {subj?.name || 'Subject'}
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  >
                    {cls.fee > 0 ? `${settings?.currencySymbol || '$'}${cls.fee}` : 'Free Course'}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{cls.title}</h3>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => openEditModal(cls)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem' }}
                          title="Edit Class"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id, cls.title)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem' }}
                          title="Delete Class"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                      {cls.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        <span>{cls.schedule}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={14} />
                        <span>Grade: {cls.grade} • Capacity: {cls.capacity} students</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => {
                        if (onSelectClassForLessons) onSelectClassForLessons(cls.id);
                      }}
                      className="btn btn-primary btn-block btn-sm"
                    >
                      <Film size={16} /> Manage Lessons & Content <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClass ? 'Edit Academic Class' : 'Create New Class'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Academic Subject *</label>
              <select
                className="form-control"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Grade / Level *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomGrade(!isCustomGrade)}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  {isCustomGrade ? 'Choose from created grades' : '+ Custom Grade'}
                </button>
              </div>

              {isCustomGrade ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Grade 11, AP, Undergrad"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                />
              ) : (
                <select
                  className="form-control"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.code || `Level ${g.level}`})
                    </option>
                  ))}
                  {/* Fallback option if grade is not in list */}
                  {!grades.some((g) => g.name === grade) && grade && (
                    <option value={grade}>{grade}</option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Class Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grade 11 - Pure Mathematics & Calculus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Enrollment Fee ({settings?.currencySymbol || '$'})</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-control"
                placeholder="0 for free"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Instructor</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Prof. Alexander Wright"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
                {teachers.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick Select:</span>
                    {teachers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setInstructor(t.name)}
                        className="badge badge-outline"
                        style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Weekly Schedule</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mon & Wed • 5:00 PM - 6:30 PM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Student Capacity</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <ImageUpload
            value={thumbnail}
            onChange={setThumbnail}
            label="Class Cover / Thumbnail Image"
            presets={[
              { name: 'Math', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80' },
              { name: 'Coding', url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80' },
              { name: 'Physics', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80' },
              { name: 'Chemistry', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80' }
            ]}
          />

          <div className="form-group">
            <label className="form-label">Class Syllabus Description</label>
            <textarea
              className="form-control"
              placeholder="What will students master in this class..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingClass ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
