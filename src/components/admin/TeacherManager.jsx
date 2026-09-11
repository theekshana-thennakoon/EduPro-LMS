import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Shield,
  Search,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Key,
  Loader2
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';
import { ImageUpload } from '../common/ImageUpload';

export const TeacherManager = ({ onSelectTeacherForClasses }) => {
  const { classes, showToast } = useLms();
  const { currentUser } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const list = await lmsService.getAllTeachers();
      setTeachers(list);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      showToast('Failed to load teachers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setName('');
    setTitle('Senior Faculty Lecturer & Course Instructor');
    setEmail('');
    setPassword('teacher123');
    setPhone('');
    setBio('');
    setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name || '');
    setTitle(teacher.title || 'Senior Faculty Lecturer');
    setEmail(teacher.email || '');
    setPassword(teacher.password || '');
    setPhone(teacher.phone || '');
    setBio(teacher.bio || '');
    setAvatar(teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Teacher name is required', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Teacher email is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingTeacher) {
        await lmsService.updateTeacher(editingTeacher.id, {
          name: name.trim(),
          title: title.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim() || undefined,
          phone: phone.trim(),
          bio: bio.trim(),
          avatar: avatar.trim()
        });
        showToast('Teacher profile updated successfully!', 'success');
      } else {
        await lmsService.createTeacher({
          name: name.trim(),
          title: title.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim() || 'teacher123',
          phone: phone.trim(),
          bio: bio.trim(),
          avatar: avatar.trim()
        });
        showToast('New faculty instructor registered successfully!', 'success');
      }
      await fetchTeachers();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (teachers.length <= 1) {
      showToast('Cannot delete the only remaining teacher account.', 'error');
      return;
    }

    if (currentUser?.id === teacher.id) {
      if (!window.confirm('Warning: You are currently signed in as this teacher! Deleting it will log you out. Are you sure?')) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to remove teacher "${teacher.name}" from the academy faculty?`)) {
        return;
      }
    }

    setDeletingId(teacher.id);
    try {
      await lmsService.deleteTeacher(teacher.id);
      showToast('Teacher removed from faculty directory', 'info');
      await fetchTeachers();
    } catch (err) {
      showToast(err.message || 'Failed to delete teacher', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term)) ||
      (t.title && t.title.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faculty & Teachers Management</h1>
          <p>Create instructor accounts, manage teaching assignments, edit credentials, and control faculty access.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add New Teacher
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-control"
            placeholder="Search faculty by name, email, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0.4rem 0' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <GraduationCap size={16} color="var(--primary)" />
          <span>Total Faculty Members: <strong>{teachers.length}</strong></span>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading faculty records from database...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Faculty Teachers Found</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {searchTerm ? 'No teachers match your search query.' : 'Register new instructors and lecturers to assign classes.'}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Register First Teacher
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredTeachers.map((teacher) => {
            const assignedClasses = classes.filter(
              (c) => c.instructor && c.instructor.toLowerCase().includes(teacher.name.toLowerCase())
            );

            const isCurrent = currentUser?.id === teacher.id;

            return (
              <div
                key={teacher.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isCurrent ? '4px solid var(--primary)' : '4px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Row: Avatar & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt={teacher.name}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--primary)'
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            padding: '3px',
                            display: 'flex'
                          }}
                          title="Verified Instructor"
                        >
                          <Shield size={12} />
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{teacher.name}</h3>
                          {isCurrent && (
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              You
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {teacher.title || 'Faculty Instructor'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem' }}
                        title="Edit Teacher Profile"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem' }}
                        title="Delete Teacher"
                        disabled={deletingId === teacher.id}
                      >
                        {deletingId === teacher.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Bio summary */}
                  <p
                    style={{
                      fontSize: '0.835rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      marginBottom: '1rem',
                      minHeight: '38px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {teacher.bio || 'Experienced academic instructor committed to excellence in online learning and student mentorship.'}
                  </p>

                  {/* Contact Info Pills */}
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.78rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher.email}</span>
                    </div>
                    {teacher.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Assigned Classes */}
                <div
                  style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <BookOpen size={15} color="var(--primary)" />
                    <span>{assignedClasses.length} {assignedClasses.length === 1 ? 'Class' : 'Classes'} Taught</span>
                  </div>

                  <button
                    onClick={() => onSelectTeacherForClasses && onSelectTeacherForClasses(teacher.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  >
                    View Classes &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Register New Teacher / Faculty'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Teacher Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. Eleanor Vance, Ph.D."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Title / Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Head of Pure Sciences & Senior Lecturer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. instructor@edupro.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {editingTeacher ? 'Change Password (optional)' : 'Account Login Password *'}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder={editingTeacher ? 'Leave blank to keep unchanged' : 'Password for teacher admin'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editingTeacher}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+1 (555) 012-3456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <ImageUpload
            value={avatar}
            onChange={setAvatar}
            label="Teacher Avatar Picture"
            aspectRatio="1/1"
            presets={[
              { name: 'Professor A', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
              { name: 'Professor B', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
              { name: 'Lecturer C', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
              { name: 'Instructor D', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
            ]}
          />

          <div className="form-group">
            <label className="form-label">Biography & Academic Background</label>
            <textarea
              className="form-control"
              placeholder="Brief summary of academic qualifications, publications, teaching experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingTeacher ? 'Saving Changes...' : 'Registering Faculty...'}</span>
                </>
              ) : (
                editingTeacher ? 'Save Teacher Changes' : 'Register Faculty Teacher'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherManager;
