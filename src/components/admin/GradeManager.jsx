import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, BookOpen, Users, ArrowUpRight, CheckCircle, GraduationCap } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const GradeManager = ({ onSelectGradeForClasses }) => {
  const { grades, classes, refreshAll, showToast } = useLms();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState('11');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingGrade(null);
    setName('');
    setCode('');
    setLevel(String(grades.length + 10));
    setColor('#3b82f6');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setName(grade.name);
    setCode(grade.code || '');
    setLevel(String(grade.level || 1));
    setColor(grade.color || '#3b82f6');
    setDescription(grade.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Grade name is required', 'error');
      return;
    }

    try {
      if (editingGrade) {
        await lmsService.updateGrade(editingGrade.id, {
          name: name.trim(),
          code: (code || name.replace(/\s+/g, '-').toUpperCase()),
          level: Number(level) || 1,
          color,
          description: description.trim()
        });
        showToast('Grade updated successfully', 'success');
      } else {
        await lmsService.createGrade({
          name: name.trim(),
          code: (code || name.replace(/\s+/g, '-').toUpperCase()),
          level: Number(level) || 1,
          color,
          description: description.trim()
        });
        showToast('New educational grade / level created!', 'success');
      }
      await refreshAll();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id, gradeName) => {
    const matchingClasses = classes.filter(
      (c) => c.grade?.toLowerCase() === gradeName.toLowerCase() || c.grade === id
    );

    if (matchingClasses.length > 0) {
      if (
        !window.confirm(
          `Warning: Grade "${gradeName}" is currently assigned to ${matchingClasses.length} class(es). Are you sure you want to delete it?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete grade "${gradeName}"?`)) {
        return;
      }
    }

    try {
      await lmsService.deleteGrade(id);
      showToast('Grade level removed', 'info');
      await refreshAll();
    } catch (err) {
      showToast('Failed to delete grade', 'error');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Grade & Level Management</h1>
          <p>Create and structure academic grades, year levels, and educational tiers for classes and student enrollment.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Create New Grade
        </button>
      </div>

      {/* Grade Cards Grid */}
      {grades.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Academic Grades Defined</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Set up your academy's grade levels (e.g. Grade 10, Grade 11, Advanced Level, Undergraduate) to organize classes.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create First Grade
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {grades.map((grd) => {
            const linkedClasses = classes.filter(
              (c) => c.grade?.toLowerCase() === grd.name.toLowerCase() || c.grade === grd.code
            );

            return (
              <div
                key={grd.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${grd.color || 'var(--primary)'}`
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: `${grd.color || '#3b82f6'}20`,
                          color: grd.color || '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <Award size={20} />
                      </div>
                      <div>
                        <span
                          className="badge"
                          style={{
                            background: `${grd.color || '#3b82f6'}22`,
                            color: grd.color || '#3b82f6',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        >
                          Code: {grd.code || grd.name}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => openEditModal(grd)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem' }}
                        title="Edit Grade"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(grd.id, grd.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem' }}
                        title="Delete Grade"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{grd.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Level {grd.level || 1}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1.25rem',
                      minHeight: '44px'
                    }}
                  >
                    {grd.description || 'No curriculum description provided for this grade level.'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <BookOpen size={16} color="var(--primary)" />
                    <span>
                      {linkedClasses.length} {linkedClasses.length === 1 ? 'Class' : 'Classes'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectGradeForClasses && onSelectGradeForClasses(grd.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Classes &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Grade Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGrade ? 'Edit Educational Grade' : 'Create New Grade Level'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Grade / Level Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grade 11, Advanced Level (A/L), AP Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Grade Short Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. G11, AL, UG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Level / Sort Order</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                placeholder="e.g. 11"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Badge & Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '45px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#6366f1'].map((preset) => (
                  <div
                    key={preset}
                    onClick={() => setColor(preset)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: preset,
                      cursor: 'pointer',
                      border: color === preset ? '2px solid var(--text-primary)' : '1px solid transparent'
                    }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Curriculum / Level Description</label>
            <textarea
              className="form-control"
              placeholder="Overview of curriculum requirements and objectives for this grade..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingGrade ? 'Save Changes' : 'Create Grade Level'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradeManager;
