import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, BookOpen } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const SubjectManager = ({ onSelectSubjectForClasses }) => {
  const { subjects, classes, refreshAll, showToast } = useLms();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📚');
  const [color, setColor] = useState('#4f46e5');

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDescription('');
    setIcon('📚');
    setColor('#4f46e5');
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setDescription(subject.description);
    setIcon(subject.icon || '📚');
    setColor(subject.color || '#4f46e5');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }

    try {
      if (editingSubject) {
        await lmsService.updateSubject(editingSubject.id, {
          name,
          code,
          description,
          icon,
          color
        });
        showToast('Subject updated successfully', 'success');
      } else {
        await lmsService.createSubject({
          name,
          code,
          description,
          icon,
          color
        });
        showToast('New academic subject added!', 'success');
      }
      await refreshAll();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const classCount = classes.filter((c) => c.subjectId === id).length;
    if (classCount > 0) {
      if (!window.confirm(`Warning: "${name}" has ${classCount} active classes linked. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete subject "${name}"?`)) {
        return;
      }
    }

    try {
      await lmsService.deleteSubject(id);
      showToast('Subject deleted', 'info');
      await refreshAll();
    } catch (err) {
      showToast('Failed to delete subject', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Subject Management</h1>
          <p>Define academic subjects and curriculum domains for your academy.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add New Subject
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="cards-grid">
        {subjects.map((subj) => {
          const linkedClasses = classes.filter((c) => c.subjectId === subj.id);
          return (
            <div
              key={subj.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${subj.color || 'var(--primary)'}`
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{subj.icon || '📚'}</span>
                    <div>
                      <span className="badge badge-primary" style={{ background: `${subj.color}22`, color: subj.color }}>
                        {subj.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => openEditModal(subj)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem' }}
                      title="Edit Subject"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(subj.id, subj.name)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.4rem' }}
                      title="Delete Subject"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{subj.name}</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', minHeight: '40px' }}>
                  {subj.description || 'No description provided.'}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <BookOpen size={16} />
                  <span>{linkedClasses.length} {linkedClasses.length === 1 ? 'Class' : 'Classes'}</span>
                </div>

                <button
                  onClick={() => onSelectSubjectForClasses && onSelectSubjectForClasses(subj.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  Manage Classes &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? 'Edit Academic Subject' : 'Add New Academic Subject'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Advanced Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MATH101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon Emoji</label>
              <select
                className="form-control"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="📐">📐 Math / Geometry</option>
                <option value="💻">💻 Computer / Tech</option>
                <option value="⚡">⚡ Physics / Energy</option>
                <option value="🧪">🧪 Chemistry</option>
                <option value="🔬">🔬 Biology</option>
                <option value="📚">📚 Literature / History</option>
                <option value="🎨">🎨 Fine Arts</option>
                <option value="🌐">🌐 Languages</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '45px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{color}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Curriculum Description</label>
            <textarea
              className="form-control"
              placeholder="Brief summary of what this academic discipline covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
