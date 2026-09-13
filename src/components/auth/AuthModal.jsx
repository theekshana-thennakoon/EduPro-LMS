import React, { useState, useEffect, useRef } from 'react';
import {
  LogIn,
  UserPlus,
  ShieldAlert,
  Sparkles,
  Mail,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { Modal } from '../common/Modal';
import { EmailPreviewModal } from '../common/EmailPreviewModal';

export const AuthModal = ({ isOpen, onClose, initialTab = 'student-login' }) => {
  const { login, registerStudent, requestRegistrationOtp, checkEmailAvailability } = useAuth();
  const { classes, grades, showToast, settings } = useLms();

  const [tab, setTab] = useState(initialTab); // 'student-login', 'student-register', 'teacher-login'
  const [regStep, setRegStep] = useState('form'); // 'form' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(() => (grades && grades.length > 0 ? grades[0].name : 'Grade 11'));
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');

  // OTP Verification states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [sentEmailRecord, setSentEmailRecord] = useState(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpResendTimer]);

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setRegStep('form');
    setOtpDigits(['', '', '', '', '', '']);
    setSentEmailRecord(null);
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

  // Step 1: Initiate Student Registration -> Request OTP Email
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Check email availability
      const check = await checkEmailAvailability(email);
      if (!check.available) {
        throw new Error(check.error || 'An account with this email address already exists.');
      }

      // Request and send modern OTP verification email
      const res = await requestRegistrationOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        instituteName: settings?.siteName || 'EduPro Learning Academy'
      });

      setSentEmailRecord(res.emailRecord);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpResendTimer(60);
      setRegStep('otp');

      showToast(`Verification code sent to ${email.trim().toLowerCase()}!`, 'success');

      // Auto-focus first digit box after render
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to send OTP verification email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Digit Input & Paste
  const handleOtpDigitChange = (index, value) => {
    // Handle full pasted code (e.g. "482910")
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocus = Math.min(cleaned.length, 5);
        if (otpInputRefs.current[nextFocus]) {
          otpInputRefs.current[nextFocus].focus();
        }
        return;
      }
    }

    // Single digit input
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendTimer > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await requestRegistrationOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        instituteName: settings?.siteName || 'EduPro Learning Academy'
      });
      setSentEmailRecord(res.emailRecord);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpResendTimer(60);
      showToast(`Fresh verification code sent to ${email}!`, 'success');
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration with OTP verification
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerStudent({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        grade,
        targetClassId: targetClassId || null,
        otp: fullOtp
      });
      showToast('🎉 Account verified and created successfully! Welcome to the academy.', 'success');
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP code.');
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
    <>
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

        {/* ================= STUDENT LOGIN FORM ================= */}
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

        {/* ================= STUDENT REGISTER: STEP 1 (FORM) ================= */}
        {tab === 'student-register' && regStep === 'form' && (
          <form onSubmit={handleInitiateRegister}>
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
              <label className="form-label">Email Address (OTP will be sent here)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="david@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                  required
                />
                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
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
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue & Send OTP Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= STUDENT REGISTER: STEP 2 (OTP VERIFICATION) ================= */}
        {tab === 'student-register' && regStep === 'otp' && (
          <form onSubmit={handleVerifyAndRegister}>
            <div className="otp-verification-card">
              {/* Glowing Icon */}
              <div className="otp-icon-wrapper">
                <div className="otp-icon-pulse" />
                <Mail size={32} />
              </div>

              <h3 className="otp-title">Verify Your Email</h3>
              <p className="otp-subtitle">
                We've sent a 6-digit verification code to complete your registration.
              </p>

              {/* Destination Email Badge */}
              <div className="otp-email-pill">
                <Mail size={14} color="var(--primary)" />
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRegStep('form');
                    setError('');
                  }}
                  style={{
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    padding: '0 0.2rem',
                    fontWeight: 700
                  }}
                >
                  Edit Email
                </button>
              </div>

              {/* Email Delivery Tip & Action Buttons */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.95rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '380px',
                  marginBottom: '1.25rem',
                  lineHeight: 1.45,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  <ShieldCheck size={14} color="var(--success)" />
                  <span>Real Email Delivery Dispatched</span>
                </div>
                Please check your inbox (and spam/junk folder). If you are testing locally or developing, you can view the email template or auto-fill below.
              </div>

              {sentEmailRecord && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setEmailPreviewOpen(true)}
                    className="otp-email-preview-btn"
                    style={{ margin: 0 }}
                  >
                    <Eye size={14} />
                    <span>View Email Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (sentEmailRecord?.otp) {
                        const digits = sentEmailRecord.otp.split('');
                        setOtpDigits(digits);
                        showToast(`Auto-filled OTP: ${sentEmailRecord.otp}`, 'info');
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-full)' }}
                  >
                    <Sparkles size={13} color="var(--primary)" />
                    <span>Auto-Fill Demo Code</span>
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Inputs */}
              <div className="otp-inputs-grid">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`otp-digit-input ${digit ? 'filled' : ''}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Resend OTP Row */}
              <div className="otp-resend-box">
                {otpResendTimer > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} /> Resend OTP in <strong>{otpResendTimer}s</strong>
                  </span>
                ) : (
                  <span>
                    Didn't receive code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="otp-resend-btn"
                    >
                      <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Resend Code
                    </button>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading || otpDigits.join('').length !== 6}
                style={{ marginBottom: '0.75rem' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Code & Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify OTP & Complete Registration</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegStep('form');
                  setError('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={14} /> Back to Registration Form
              </button>
            </div>
          </form>
        )}

        {/* ================= TEACHER ADMIN LOGIN FORM ================= */}
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

      {/* Modern HTML Email Template Preview Modal */}
      <EmailPreviewModal
        isOpen={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        emailRecord={sentEmailRecord}
      />
    </>
  );
};

