import React, { useState } from 'react';
import { User, Mail, Calendar, BookOpen, Award, CheckCircle, Save, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { ImageUpload } from '../common/ImageUpload';

export const StudentProfileView = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast, classes } = useLms();

  const [name, setName] = useState(currentUser?.name || '');
  const [grade, setGrade] = useState(currentUser?.grade || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=student');
  const [saving, setSaving] = useState(false);

  const enrolledCount = currentUser?.enrolledClassIds?.length || 0;
  const completedCount = currentUser?.completedLessonIds?.length || 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        grade: grade.trim(),
        avatar: avatar || currentUser?.avatar
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile & Account</h1>
        <p>Manage your academic credentials, personal details, and learning record.</p>
      </div>

      <div className="split-layout-grid">
        {/* Profile Card Summary */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
            <img
              src={avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=student'}
              alt={currentUser?.name}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--primary)',
                boxShadow: '0 8px 24px var(--primary-glow)'
              }}
            />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>
            {currentUser?.grade ? `${currentUser.grade} Scholar` : 'Student Scholar'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span>{currentUser?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Shield size={16} color="var(--text-muted)" />
              <span>Student ID: <strong>{currentUser?.id}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <span>Member Since: {currentUser?.joinedDate || '2026-08-01'}</span>
            </div>
          </div>
        </div>

        {/* Academic Achievement & Stats */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Academic Milestones
          </h3>

          <div className="grid-2-col" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                {enrolledCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrolled Classes</div>
            </div>

            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                {completedCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Lessons</div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Enrolled Subjects</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentUser?.enrolledClassIds?.map((classId) => {
              const cls = classes.find((c) => c.id === classId);
              return cls ? (
                <div
                  key={cls.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{cls.title}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Admitted</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="glass-card" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Update Profile Information
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Educational Level / Grade</label>
                <input
                  type="text"
                  className="form-control"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Grade 11, AP, Pre-Med"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <ImageUpload
                  value={avatar}
                  onChange={setAvatar}
                  label="Student Profile Avatar / Photo"
                  aspectRatio="1/1"
                  presets={[
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=student',
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                  ]}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Profile Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
