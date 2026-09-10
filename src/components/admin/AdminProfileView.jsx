import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Award, BookOpen, Layers, Save, Key, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { ImageUpload } from '../common/ImageUpload';

export const AdminProfileView = () => {
  const { currentUser, updateProfile } = useAuth();
  const { subjects, classes, payments, showToast } = useLms();

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState(currentUser?.title || 'Lead Academic Director & Master Instructor');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 012-3456');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [saving, setSaving] = useState(false);

  // Security / Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        title: title.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar: avatar.trim()
      });
      showToast('Teacher Administrator profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (currentPassword !== currentUser?.password) {
      showToast('Current password does not match records', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      showToast('New password must be at least 4 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      await updateProfile({
        password: newPassword
      });
      showToast('Admin security password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Failed to change password: ' + err.message, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Teacher Administrator Profile</h1>
        <p>Manage your instructor identity, academic credentials, contact info, and admin security settings.</p>
      </div>

      <div className="split-layout-grid" style={{ marginBottom: '2rem' }}>
        {/* Profile Identity Card */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--primary)',
                boxShadow: '0 8px 24px var(--primary-glow)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'var(--primary)',
                color: '#ffffff',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                boxShadow: 'var(--shadow-md)'
              }}
              title="Master Instructor"
            >
              <Shield size={16} />
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.25rem' }}>{name || 'Professor'}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
            {title || 'Master Instructor'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="badge badge-primary">Lead Administrator</span>
            <span className="badge badge-success">Verified Faculty</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              textAlign: 'left',
              background: 'var(--bg-tertiary)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span>{email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{phone || 'No phone set'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Shield size={16} color="var(--text-muted)" />
              <span>Admin ID: <strong>{currentUser?.id}</strong></span>
            </div>
          </div>
        </div>

        {/* Academic Overview Statistics */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Faculty & Academy Leadership
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
                {subjects.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created Subjects</div>
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
                {classes.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Classes</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Faculty Biography
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {bio || 'Ph.D. in Applied Sciences with 14+ years of university lecturing, curriculum architecture, and online instructional experience.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Sparkles size={16} color="var(--warning)" />
            <span>Full administrative privileges across curriculum, student admissions, and fee gateways.</span>
          </div>
        </div>
      </div>

      {/* Profile Details & Password Update Grid */}
      <div className="split-layout-grid">
        {/* Edit Instructor Details Form */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Edit Administrator Details
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Instructor Full Name *</label>
              <input
                type="text"
                className="form-control"
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Academic Director & Master Instructor"
              />
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                />
              </div>
            </div>

            <ImageUpload
              value={avatar}
              onChange={setAvatar}
              label="Profile Avatar Picture"
              aspectRatio="1/1"
              presets={[
                { name: 'Director', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
                { name: 'Professor', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
                { name: 'Lecturer', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' }
              ]}
            />

            <div className="form-group">
              <label className="form-label">Instructor Biography & Summary</label>
              <textarea
                className="form-control"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of academic background and specialties..."
              />
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Password Form */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Lock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Admin Security & Password</h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Security Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 4 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem'
              }}
            >
              Demo teacher admin default is <code>admin</code>. You can change it anytime here.
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-secondary" disabled={passwordSaving}>
                <Key size={16} /> {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileView;
