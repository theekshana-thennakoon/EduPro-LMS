import React, { useState, useEffect } from 'react';
import {
  Lock,
  Play,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  FileText,
  HelpCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  Award,
  CreditCard,
  RefreshCw,
  Video,
  Loader2,
  Shield,
  ShieldAlert,
  EyeOff,
  ExternalLink,
  ChevronLeft,
  List,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const ClassroomView = ({ classId, initialLessonId = null, onBack, onNeedAuth }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { classes, subjects, checkEnrollment, enrollInClass, toggleWatchLater, watchLaterList, showToast, settings } = useLms();

  const [currentClass, setCurrentClass] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'quiz', 'notes'

  // Anti-Screen Recording & Window Blur Protection
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Enrollment checkout modal state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card (Stripe)');
  const [enrolling, setEnrolling] = useState(false);

  // Action loaders
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [downloadingNoteId, setDownloadingNoteId] = useState(null);
  const [mobileSyllabusOpen, setMobileSyllabusOpen] = useState(false);

  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Check enrollment guard: strictly enforce student enrollment!
  const isEnrolled = checkEnrollment(classId);

  // Window blur / Tab switch anti-capture listener
  useEffect(() => {
    const handleBlur = () => {
      // Obfuscate player when window unfocuses
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const cls = classes.find((c) => c.id === classId);
    setCurrentClass(cls || null);

    const loadLessons = async () => {
      if (classId) {
        const list = await lmsService.getLessonsByClass(classId);
        setLessons(list);
        if (list.length > 0) {
          const target = initialLessonId
            ? list.find((l) => l.id === initialLessonId) || list[0]
            : list[0];
          setActiveLesson(target);
          if (target.videos && target.videos.length > 0) {
            setActiveVideo(target.videos[0]);
          }
          if (target.quizzes && target.quizzes.length > 0) {
            setSelectedQuiz(target.quizzes[0]);
          }
        }
      }
    };
    loadLessons();
  }, [classId, classes, initialLessonId]);

  // When active lesson changes, sync video and quiz
  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    if (lesson.videos && lesson.videos.length > 0) {
      setActiveVideo(lesson.videos[0]);
    } else {
      setActiveVideo(null);
    }
    if (lesson.quizzes && lesson.quizzes.length > 0) {
      setSelectedQuiz(lesson.quizzes[0]);
      setUserAnswers({});
      setQuizSubmitted(false);
    } else {
      setSelectedQuiz(null);
    }
  };

  const handleEnrollNow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onNeedAuth) onNeedAuth();
      return;
    }
    setEnrolling(true);
    try {
      const res = await enrollInClass(classId, paymentMethod);
      if (res) {
        setEnrollModalOpen(false);
      }
    } catch (err) {
      showToast('Enrollment failed: ' + err.message, 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!currentUser || !activeLesson) return;
    setMarkingCompleted(true);
    try {
      await lmsService.markLessonCompleted(currentUser.id, activeLesson.id);
      showToast('Lesson marked as completed! Excellent work.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark lesson completed', 'error');
    } finally {
      setMarkingCompleted(false);
    }
  };

  // Quiz submission & scoring
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleQuizSubmit = async () => {
    if (!selectedQuiz) return;
    const questions = selectedQuiz.questions || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const passed = calculatedScore >= (selectedQuiz.passingScore || 70);

    setSubmittingQuiz(true);
    try {
      setQuizScore(calculatedScore);
      setQuizPassed(passed);
      setQuizSubmitted(true);

      if (currentUser) {
        await lmsService.submitQuizAttempt(currentUser.id, selectedQuiz.id, classId, calculatedScore, passed);
      }

      if (passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`Congratulations! You passed with ${calculatedScore}%!`, 'success');
      } else {
        showToast(`Score: ${calculatedScore}%. Pass mark is ${selectedQuiz.passingScore}%. Try again!`, 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit quiz attempt', 'error');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Real PDF & Lecture notes download handler
  const handleDownloadNotes = (note) => {
    setDownloadingNoteId(note.id);
    try {
      if (note.pdfUrl && note.pdfUrl.startsWith('data:')) {
        // Base64 Data URL -> download binary PDF directly
        const link = document.createElement('a');
        link.href = note.pdfUrl;
        link.download = note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloaded "${link.download}"`, 'success');
      } else if (note.pdfUrl && note.pdfUrl.startsWith('http')) {
        // Direct Web URL -> open / download in new tab
        const link = document.createElement('a');
        link.href = note.pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = note.fileName || 'Lecture_Notes.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Opening / Downloading "${note.fileName || 'notes'}"...`, 'success');
      } else {
        // Plain text fallback
        const file = new Blob([`# ${note.title}\n\n${note.content || ''}`], { type: 'text/plain' });
        const element = document.createElement('a');
        element.href = URL.createObjectURL(file);
        element.download = note.fileName || `${note.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast(`Downloaded "${element.download}"`, 'success');
      }
    } catch (err) {
      showToast('Failed to download note attachment', 'error');
    } finally {
      setTimeout(() => setDownloadingNoteId(null), 800);
    }
  };

  // ================= STRICT ENROLLMENT GUARD =================
  // If student is not enrolled in this class, show Access Denied / Enrollment Screen
  if (!isEnrolled) {
    const subj = subjects.find((s) => s.id === currentClass?.subjectId);
    return (
      <div>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="glass-card access-denied-box">
          <div className="access-shield-icon">
            <Lock size={36} />
          </div>

          <div className="badge badge-danger" style={{ marginBottom: '0.75rem' }}>
            Restricted Classroom Access
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Classroom Locked: Enrollment Required
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            You are currently not enrolled in <strong>"{currentClass?.title || 'this class'}"</strong>.
            Access to all video lectures, interactive quizzes, homework materials, and teacher notes is restricted exclusively to registered students.
          </p>

          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
              <span style={{ fontWeight: 600 }}>{subj?.name || 'General'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Lead Instructor:</span>
              <span style={{ fontWeight: 600 }}>{currentClass?.instructor}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Weekly Schedule:</span>
              <span>{currentClass?.schedule}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 700 }}>Enrollment Fee:</span>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                {currentClass?.fee > 0 ? `${settings?.currencySymbol || '$'}${currentClass.fee}` : 'Free Course'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                if (onNeedAuth) onNeedAuth();
              } else {
                setEnrollModalOpen(true);
              }
            }}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '380px' }}
          >
            <CreditCard size={18} />
            {currentClass?.fee > 0 ? `Enroll Now for $${currentClass.fee}` : 'Enroll Now (Free)'}
          </button>
        </div>

        {/* Enrollment Checkout Modal */}
        <Modal
          isOpen={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          title={`Enroll in ${currentClass?.title}`}
        >
          <form onSubmit={handleEnrollNow}>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Class Title:</span>
                <strong>{currentClass?.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Instructor:</span>
                <span>{currentClass?.instructor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <strong>Total Amount:</strong>
                <strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>
                  {currentClass?.fee > 0 ? `${settings?.currencySymbol || '$'}${currentClass.fee}` : 'Free'}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Gateway</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Credit / Debit Card (Stripe)">Credit / Debit Card (Stripe Online)</option>
                <option value="Google Pay">Google Pay</option>
                <option value="PayPal Express">PayPal Express</option>
                <option value="Scholarship / Voucher">Scholarship / Voucher</option>
              </select>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
              <button type="button" onClick={() => setEnrollModalOpen(false)} className="btn btn-secondary" disabled={enrolling}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={enrolling}>
                {enrolling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Confirming Admission...</span>
                  </>
                ) : (
                  'Confirm & Unlock Classroom'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // ================= ENROLLED CLASSROOM VIEW =================
  const isVideoInWatchLater = activeVideo ? watchLaterList.some((v) => v.id === activeVideo.id) : false;
  const isLessonCompleted = currentUser?.completedLessonIds?.includes(activeLesson?.id);
  const currentLessonIndex = lessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  return (
    <div className="classroom-container">
      {/* Responsive Top Header & Breadcrumbs */}
      <div className="classroom-top-header">
        <div className="classroom-title-group">
          <button onClick={onBack} className="btn btn-secondary btn-sm classroom-back-btn" style={{ flexShrink: 0 }}>
            <ArrowLeft size={16} /> Courses
          </button>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Enrolled Classroom
            </div>
            <h1 className="classroom-course-title">{currentClass?.title}</h1>
          </div>
        </div>

        {activeLesson && (
          <button
            onClick={handleMarkCompleted}
            className={`btn btn-sm classroom-complete-btn ${isLessonCompleted ? 'btn-secondary' : 'btn-primary'}`}
            disabled={markingCompleted}
            style={{ flexShrink: 0 }}
          >
            {markingCompleted ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Marking...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} color={isLessonCompleted ? 'var(--success)' : 'inherit'} />
                <span>{isLessonCompleted ? 'Lesson Completed' : 'Mark Completed'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Module Switcher Navigator Bar (Seamless Mobile Ergonomics) */}
      {activeLesson && lessons.length > 0 && (
        <div className="classroom-nav-bar">
          <div className="classroom-nav-controls">
            <button
              onClick={() => prevLesson && handleSelectLesson(prevLesson)}
              disabled={!prevLesson}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
              title="Previous Module"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="classroom-nav-counter">
              Module {currentLessonIndex + 1} of {lessons.length}
            </span>
            <button
              onClick={() => nextLesson && handleSelectLesson(nextLesson)}
              disabled={!nextLesson}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
              title="Next Module"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={() => setMobileSyllabusOpen(!mobileSyllabusOpen)}
            className="classroom-nav-syllabus-btn btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
          >
            <List size={14} color="var(--primary)" /> {mobileSyllabusOpen ? 'Hide Syllabus' : `Syllabus (${lessons.length})`}
          </button>
        </div>
      )}

      {/* Mobile Collapsible Syllabus Accordion (Shown when toggled or on mobile) */}
      {mobileSyllabusOpen && (
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} color="var(--primary)" /> Quick Syllabus Jump
            </span>
            <button onClick={() => setMobileSyllabusOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              Close
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '50vh', overflowY: 'auto' }}>
            {lessons.map((les, index) => {
              const isCurrent = activeLesson?.id === les.id;
              const isCompleted = currentUser?.completedLessonIds?.includes(les.id);
              return (
                <div
                  key={les.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                    border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    handleSelectLesson(les);
                    setMobileSyllabusOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-secondary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{les.title}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{les.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Classroom Layout: Grid of Video Player + Lessons Syllabus */}
      <div className="classroom-layout-grid">
        {/* Main Content Area */}
        <div>
          {activeLesson ? (
            <div>
              {/* Multi-Video Player Container with Screen Recording Protection */}
              <div className="glass-card protected-player-container classroom-player-card">
                {activeVideo ? (
                  <div>
                    <div className="video-player-wrapper" style={{ position: 'relative' }}>
                      {/* Dynamic Anti-Piracy Forensic Watermark */}
                      <div className="video-watermark-overlay">
                        <span>🛡️ {currentUser?.name || 'Verified Scholar'}</span>
                        <span>{currentUser?.email || 'student@edupro.org'}</span>
                        <span style={{ fontSize: '0.65rem' }}>STUDENT ID: {currentUser?.id || 'std-sec'}</span>
                      </div>

                      {/* Anti-Screen Recording / Window Blur Overlay */}
                      {isWindowBlurred && (
                        <div className="screen-blur-overlay" onClick={() => setIsWindowBlurred(false)}>
                          <EyeOff size={42} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Content Hidden • Anti-Screen Recording Protection
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.25rem' }}>
                            Lecture video playback is shielded while the classroom tab or window is out of focus to protect educational material.
                          </p>
                          <button className="btn btn-primary btn-sm" onClick={() => setIsWindowBlurred(false)}>
                            <Play size={14} /> Resume Lesson Playback
                          </button>
                        </div>
                      )}

                      {activeVideo.url.includes('youtube.com') || activeVideo.url.includes('youtu.be') ? (
                        <iframe
                          src={activeVideo.url.replace('watch?v=', 'embed/')}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      ) : (
                        <video
                          controls
                          controlsList="nodownload nofullscreen noremoteplayback"
                          disablePictureInPicture
                          disableRemotePlayback
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          src={activeVideo.url}
                          key={activeVideo.url}
                          poster={currentClass?.thumbnail}
                        >
                          Your browser does not support HTML5 video.
                        </video>
                      )}
                    </div>

                    {/* Video Meta Bar & Watch Later Toggle */}
                    <div
                      style={{
                        padding: '1rem 0.5rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{activeVideo.title}</h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Duration: {activeVideo.duration} • Lesson: {activeLesson.title}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Watch Later Button */}
                        <button
                          onClick={() => toggleWatchLater(activeVideo.id)}
                          className={`btn btn-sm ${isVideoInWatchLater ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          {isVideoInWatchLater ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          {isVideoInWatchLater ? 'In Watch Later' : 'Watch Later'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <Video size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3>No video lecture attached to this lesson</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Please check the interactive quiz or study notes tab below.</p>
                  </div>
                )}
              </div>

              {/* Lesson Interactive Studio Tabs: Videos Playlist, Quizzes, Notes */}
              <div className="glass-card classroom-tabs-card">
                <div className="classroom-tabs-header">
                  <button
                    className={`classroom-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveTab('video')}
                  >
                    <Play size={16} /> Videos ({activeLesson.videos?.length || 0})
                  </button>
                  <button
                    className={`classroom-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quiz')}
                  >
                    <HelpCircle size={16} /> Interactive Quiz ({activeLesson.quizzes?.length || 0})
                  </button>
                  <button
                    className={`classroom-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    <FileText size={16} /> Lecture Notes ({activeLesson.notes?.length || 0})
                  </button>
                </div>

                {/* TAB 1: VIDEOS PLAYLIST IN THIS LESSON */}
                {activeTab === 'video' && (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Lesson Videos ({activeLesson.videos?.length || 0})
                    </h3>
                    {(!activeLesson.videos || activeLesson.videos.length === 0) ? (
                      <p style={{ color: 'var(--text-muted)' }}>No videos attached to this lesson.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activeLesson.videos.map((vid, idx) => {
                          const isCurrent = activeVideo?.id === vid.id;
                          return (
                            <div
                              key={vid.id}
                              style={{
                                padding: '0.85rem 1rem',
                                background: isCurrent ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                                border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => setActiveVideo(vid)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: isCurrent ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Play size={14} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{vid.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Duration: {vid.duration} {vid.description && `• ${vid.description}`}
                                  </div>
                                </div>
                              </div>

                              {isCurrent && (
                                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                  Playing
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: INTERACTIVE QUIZZES */}
                {activeTab === 'quiz' && (
                  <div>
                    {!selectedQuiz ? (
                      <p style={{ color: 'var(--text-muted)' }}>No quizzes available for this lesson module.</p>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedQuiz.title}</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Pass threshold: {selectedQuiz.passingScore}% • Time Limit: {selectedQuiz.timeLimitMinutes} mins
                            </div>
                          </div>

                          {quizSubmitted && (
                            <button onClick={handleRetakeQuiz} className="btn btn-secondary btn-sm">
                              <RefreshCw size={14} /> Retake Quiz
                            </button>
                          )}
                        </div>

                        {/* Quiz Results Card */}
                        {quizSubmitted && (
                          <div
                            style={{
                              padding: '1.25rem',
                              borderRadius: 'var(--radius-md)',
                              background: quizPassed ? 'var(--success-light)' : 'var(--danger-light)',
                              color: quizPassed ? 'var(--success)' : 'var(--danger)',
                              marginBottom: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Award size={28} />
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                  Your Score: {quizScore}% ({quizPassed ? 'Passed! 🎉' : 'Needs Practice'})
                                </div>
                                <div style={{ fontSize: '0.85rem' }}>
                                  {quizPassed
                                    ? 'Great mastery of this lesson material!'
                                    : `Required to pass: ${selectedQuiz.passingScore}%. Review the answers below.`}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Questions List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {(selectedQuiz.questions || []).map((q, qIndex) => {
                            const selectedOption = userAnswers[qIndex];
                            return (
                              <div
                                key={q.id || qIndex}
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  padding: '1.25rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                                  Question {qIndex + 1}: {q.question}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {(q.options || []).map((opt, optIndex) => {
                                    const isChosen = selectedOption === optIndex;
                                    const isCorrect = optIndex === q.correctIndex;

                                    let optionStyle = {
                                      padding: '0.75rem 1rem',
                                      borderRadius: 'var(--radius-sm)',
                                      background: 'var(--bg-secondary)',
                                      border: '1px solid var(--border-color)',
                                      cursor: quizSubmitted ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      fontSize: '0.9rem',
                                      transition: 'all 0.15s ease'
                                    };

                                    if (quizSubmitted) {
                                      if (isCorrect) {
                                        optionStyle.border = '2px solid var(--success)';
                                        optionStyle.background = 'rgba(16, 185, 129, 0.1)';
                                      } else if (isChosen && !isCorrect) {
                                        optionStyle.border = '2px solid var(--danger)';
                                        optionStyle.background = 'rgba(239, 68, 68, 0.1)';
                                      }
                                    } else if (isChosen) {
                                      optionStyle.border = '2px solid var(--primary)';
                                      optionStyle.background = 'var(--primary-light)';
                                    }

                                    return (
                                      <div
                                        key={optIndex}
                                        style={optionStyle}
                                        onClick={() => handleAnswerSelect(qIndex, optIndex)}
                                      >
                                        <div
                                          style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            border: '2px solid var(--border-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: isChosen ? 'var(--primary)' : 'transparent',
                                            color: isChosen ? '#ffffff' : 'inherit'
                                          }}
                                        >
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span>{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {quizSubmitted && q.explanation && (
                                  <div
                                    style={{
                                      marginTop: '0.75rem',
                                      padding: '0.75rem',
                                      background: 'var(--bg-secondary)',
                                      borderRadius: 'var(--radius-sm)',
                                      fontSize: '0.825rem',
                                      color: 'var(--text-secondary)'
                                    }}
                                  >
                                    💡 <strong>Explanation:</strong> {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!quizSubmitted && (
                          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button
                              onClick={handleQuizSubmit}
                              className="btn btn-primary"
                              disabled={submittingQuiz || Object.keys(userAnswers).length === 0}
                            >
                              {submittingQuiz ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  <span>Evaluating Answers...</span>
                                </>
                              ) : (
                                'Submit Quiz for Evaluation'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: STUDY NOTES & DOWNLOADS */}
                {activeTab === 'notes' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                          Lecture Notes & PDF Study Handouts
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          Read study materials online or download documents for offline review.
                        </p>
                      </div>
                    </div>

                    {(!activeLesson.notes || activeLesson.notes.length === 0) ? (
                      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No Study Materials Posted Yet</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>The instructor has not uploaded lecture notes or PDFs for this module.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {activeLesson.notes.map((note) => (
                          <div
                            key={note.id}
                            style={{
                              background: 'var(--bg-tertiary)',
                              padding: '1.5rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '8px',
                                    background: note.pdfUrl ? 'rgba(239, 68, 68, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                                    color: note.pdfUrl ? '#ef4444' : 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    flexShrink: 0
                                  }}
                                >
                                  {note.pdfUrl ? 'PDF' : <FileText size={20} />}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{note.title}</h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{note.fileName}</span>
                                    <span>&bull;</span>
                                    <span>{note.fileSize || '1.2 MB'}</span>
                                    {note.pdfUrl && (
                                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        Verified PDF Document
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {note.pdfUrl && (
                                  <a
                                    href={note.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                    title="Open PDF in new tab"
                                  >
                                    <ExternalLink size={14} /> Fullscreen
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDownloadNotes(note)}
                                  className="btn btn-primary btn-sm"
                                  disabled={downloadingNoteId === note.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  {downloadingNoteId === note.id ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" /> Downloading...
                                    </>
                                  ) : (
                                    <>
                                      <Download size={14} /> Download {note.pdfUrl ? 'PDF' : 'Notes'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Synopsis / Textual Notes */}
                            {note.content && (
                              <div
                                style={{
                                  background: 'var(--bg-secondary)',
                                  padding: '1.25rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.92rem',
                                  lineHeight: '1.7',
                                  whiteSpace: 'pre-wrap',
                                  marginBottom: note.pdfUrl ? '1.25rem' : 0,
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                {note.content}
                              </div>
                            )}

                            {/* Embedded Interactive PDF Viewer */}
                            {note.pdfUrl && (
                              <div
                                style={{
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-md)',
                                  overflow: 'hidden',
                                  background: '#0f172a'
                                }}
                              >
                                <div
                                  style={{
                                    padding: '0.65rem 1rem',
                                    background: 'var(--bg-secondary)',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.82rem',
                                    color: 'var(--text-secondary)',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FileText size={15} color="#ef4444" /> Interactive PDF Viewer: {note.fileName}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Scroll, zoom, and print directly within the viewer
                                  </span>
                                </div>
                                <iframe
                                  src={note.pdfUrl}
                                  title={note.title}
                                  className="classroom-pdf-frame"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p>Select a lesson from the syllabus on the right to start learning.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Class Syllabus / Lessons List */}
        <div className="glass-card" style={{ padding: '1.25rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <FileText size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Course Syllabus ({lessons.length} Modules)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {lessons.map((les, index) => {
              const isCurrent = activeLesson?.id === les.id;
              const isCompleted = currentUser?.completedLessonIds?.includes(les.id);

              return (
                <div
                  key={les.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                    border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleSelectLesson(les)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {les.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {les.duration} • {les.videos?.length || 0} vids • {les.quizzes?.length || 0} quiz
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
