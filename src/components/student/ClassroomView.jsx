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
  Video
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

  // Enrollment checkout modal state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card (Stripe)');
  const [enrolling, setEnrolling] = useState(false);

  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Check enrollment guard: strictly enforce student enrollment!
  const isEnrolled = checkEnrollment(classId);

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
    await lmsService.markLessonCompleted(currentUser.id, activeLesson.id);
    showToast('Lesson marked as completed! Excellent work.', 'success');
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
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Simulated download for notes
  const handleDownloadNotes = (note) => {
    const element = document.createElement('a');
    const file = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = note.fileName || 'Lecture_Notes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloading "${note.fileName || 'notes'}"...`, 'success');
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
              <button type="button" onClick={() => setEnrollModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={enrolling}>
                {enrolling ? 'Confirming Admission...' : 'Confirm & Unlock Classroom'}
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

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Courses
          </button>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Enrolled Classroom
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentClass?.title}</h1>
          </div>
        </div>

        {activeLesson && (
          <button
            onClick={handleMarkCompleted}
            className={`btn btn-sm ${isLessonCompleted ? 'btn-secondary' : 'btn-primary'}`}
          >
            <CheckCircle size={16} color={isLessonCompleted ? 'var(--success)' : 'inherit'} />
            {isLessonCompleted ? 'Completed' : 'Mark Lesson Completed'}
          </button>
        )}
      </div>

      {/* Classroom Layout: Grid of Video Player + Lessons Syllabus */}
      <div className="classroom-layout-grid">
        {/* Main Content Area */}
        <div>
          {activeLesson ? (
            <div>
              {/* Multi-Video Player Container */}
              <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                {activeVideo ? (
                  <div>
                    <div className="video-player-wrapper">
                      {activeVideo.url.includes('youtube.com') || activeVideo.url.includes('youtu.be') ? (
                        <iframe
                          src={activeVideo.url.replace('watch?v=', 'embed/')}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video controls src={activeVideo.url} key={activeVideo.url} poster={currentClass?.thumbnail}>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeVideo.title}</h2>
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
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div className="tabs-header">
                  <button
                    className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveTab('video')}
                  >
                    <Play size={16} /> Videos ({activeLesson.videos?.length || 0})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quiz')}
                  >
                    <HelpCircle size={16} /> Interactive Quiz ({activeLesson.quizzes?.length || 0})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
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
                              disabled={Object.keys(userAnswers).length === 0}
                            >
                              Submit Quiz for Evaluation
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
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Lecture Notes & Downloadable Handouts
                    </h3>

                    {(!activeLesson.notes || activeLesson.notes.length === 0) ? (
                      <p style={{ color: 'var(--text-muted)' }}>No study notes posted for this lesson.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeLesson.notes.map((note) => (
                          <div
                            key={note.id}
                            style={{
                              background: 'var(--bg-tertiary)',
                              padding: '1.25rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{note.title}</h4>
                              <button
                                onClick={() => handleDownloadNotes(note)}
                                className="btn btn-secondary btn-sm"
                              >
                                <Download size={14} /> Download {note.fileName}
                              </button>
                            </div>

                            <div
                              style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.25rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem',
                                lineHeight: '1.7',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {note.content}
                            </div>
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
