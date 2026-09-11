import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { Modal } from '../common/Modal';

export const AuthModal = ({ isOpen, onClose, initialTab = 'student-login' }) => {
  const { login, registerStudent } = useAuth();
  const { classes, grades, showToast } = useLms();

  const [tab, setTab] = useState(initialTab); // 'student-login', 'student-register', 'teacher-login'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(() => (grades && grades.length > 0 ? grades[0].name : 'Grade 11'));
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'student');
      showToast('Signed in successfully as Student!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'teacher');
      showToast('Welcome back, Professor! Admin access granted.', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerStudent({
        name,
        email,
        password,
        grade,
        targetClassId: targetClassId || null
      });
      showToast('Account created successfully! Welcome to the academy.', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill buttons for hassle-free testing
  const fillDemoStudent = () => {
    setEmail('student@lms.com');
    setPassword('password');
    setError('');
  };

  const fillDemoTeacher = () => {
    setEmail('admin@lms.com');
    setPassword('admin');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access Learning Portal" size="md">
      {/* Tabs */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button
          className={`tab-btn ${tab === 'student-login' ? 'active' : ''}`}
          onClick={() => { setTab('student-login'); resetForm(); }}
        >
          <LogIn size={16} /> Student Login
        </button>
        <button
          className={`tab-btn ${tab === 'student-register' ? 'active' : ''}`}
          onClick={() => { setTab('student-register'); resetForm(); }}
        >
          <UserPlus size={16} /> Student Register
        </button>
        <button
          className={`tab-btn ${tab === 'teacher-login' ? 'active' : ''}`}
          onClick={() => { setTab('teacher-login'); resetForm(); }}
        >
          <ShieldAlert size={16} /> Teacher Admin
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      {/* STUDENT LOGIN FORM */}
      {tab === 'student-login' && (
        <form onSubmit={handleStudentLogin}>
          <div className="form-group">
            <label className="form-label">Student Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="student@lms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={fillDemoStudent}
              style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Fill Demo Student Credentials
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
          </button>
        </form>
      )}

      {/* STUDENT REGISTER FORM */}
      {tab === 'student-register' && (
        <form onSubmit={handleStudentRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. David Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Grade / Educational Level</label>
              <button
                type="button"
                onClick={() => setIsCustomGrade(!isCustomGrade)}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                {isCustomGrade ? 'Pick from grades' : '+ Other / Custom'}
              </button>
            </div>

            {isCustomGrade ? (
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grade 11 / AP Physics"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            ) : (
              <select
                className="form-control"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {grades && grades.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name} ({g.code || `Level ${g.level}`})
                  </option>
                ))}
                {!grades?.some((g) => g.name === grade) && grade && (
                  <option value={grade}>{grade}</option>
                )}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Initial Class (Optional)</label>
            <select
              className="form-control"
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
            >
              <option value="">-- Choose Class to Enroll --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.fee > 0 ? `$${c.fee}` : 'Free'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="david@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Create Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Student Registration'}
          </button>
        </form>
      )}

      {/* TEACHER ADMIN LOGIN FORM */}
      {tab === 'teacher-login' && (
        <form onSubmit={handleTeacherLogin}>
          <div
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <Sparkles size={18} />
            <span>Single Teacher / Master Administrator credentials area.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Teacher / Admin Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@lms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Security Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={fillDemoTeacher}
              style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Fill Teacher Admin Credentials
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying Admin...' : 'Sign In as Teacher Admin'}
          </button>
        </form>
      )}
    </Modal>
  );
};
