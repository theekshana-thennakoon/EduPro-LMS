import React, { useState, useEffect } from 'react';
import {
  Plus,
  Video,
  HelpCircle,
  FileText,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  CheckCircle,
  ExternalLink,
  Upload,
  Loader2,
  Eye,
  X,
  FileCheck
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const LessonManager = ({ initialClassId }) => {
  const { classes, showToast, settings } = useLms();

  const [selectedClassId, setSelectedClassId] = useState(initialClassId || classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const [lessons, setLessons] = useState([]);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('videos'); // 'videos', 'quizzes', 'notes'

  // Loading states
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Modal states
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('45 mins');
  const [lessonDescription, setLessonDescription] = useState('');

  // Video modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('15:00');
  const [videoDescription, setVideoDescription] = useState('');
  const [targetLessonForVideo, setTargetLessonForVideo] = useState(null);

  // Quiz modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(10);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [targetLessonForQuiz, setTargetLessonForQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 'q1',
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 10,
      explanation: ''
    }
  ]);

  // Note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteFileName, setNoteFileName] = useState('');
  const [noteFileSize, setNoteFileSize] = useState('1.2 MB');
  const [notePdfUrl, setNotePdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUploadType, setPdfUploadType] = useState('file'); // 'file' or 'url'
  const [targetLessonForNote, setTargetLessonForNote] = useState(null);

  // Note PDF preview modal
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');

  // Fetch lessons when class changes
  const fetchLessons = async (classId) => {
    if (!classId) return;
    const list = await lmsService.getLessonsByClass(classId);
    setLessons(list);
    if (list.length > 0 && !expandedLessonId) {
      setExpandedLessonId(list[0].id);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchLessons(selectedClassId);
    } else if (classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [selectedClassId, classes]);

  // Handle Lesson Submit
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      showToast('Lesson title is required', 'error');
      return;
    }

    setSavingLesson(true);
    try {
      if (editingLesson) {
        await lmsService.updateLesson(editingLesson.id, {
          title: lessonTitle,
          duration: lessonDuration,
          description: lessonDescription
        });
        showToast('Lesson updated', 'success');
      } else {
        const newLes = await lmsService.createLesson(selectedClassId, {
          title: lessonTitle,
          duration: lessonDuration,
          description: lessonDescription,
          videos: [],
          quizzes: [],
          notes: []
        });
        showToast('New lesson module created!', 'success');
        setExpandedLessonId(newLes.id);
      }
      await fetchLessons(selectedClassId);
      setLessonModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (id, title) => {
    if (!window.confirm(`Delete lesson "${title}" and all attached videos, quizzes, and notes?`)) {
      return;
    }
    setDeletingLessonId(id);
    try {
      await lmsService.deleteLesson(id);
      showToast('Lesson deleted', 'info');
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast('Failed to delete lesson', 'error');
    } finally {
      setDeletingLessonId(null);
    }
  };

  // Video Handlers
  const handleOpenAddVideo = (lessonId) => {
    setEditingVideo(null);
    setTargetLessonForVideo(lessonId);
    setVideoTitle('');
    setVideoUrl('');
    setVideoDuration('15:00');
    setVideoDescription('');
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (lessonId, video) => {
    setEditingVideo(video);
    setTargetLessonForVideo(lessonId);
    setVideoTitle(video.title || '');
    setVideoUrl(video.url || '');
    setVideoDuration(video.duration || '15:00');
    setVideoDescription(video.description || '');
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      showToast('Video title and URL are required', 'error');
      return;
    }
    setSavingVideo(true);
    try {
      if (editingVideo) {
        await lmsService.updateVideoInLesson(targetLessonForVideo, editingVideo.id, {
          title: videoTitle.trim(),
          url: videoUrl.trim(),
          duration: videoDuration.trim(),
          description: videoDescription.trim()
        });
        showToast('Video updated successfully!', 'success');
      } else {
        await lmsService.addVideoToLesson(targetLessonForVideo, {
          title: videoTitle.trim(),
          url: videoUrl.trim(),
          duration: videoDuration.trim(),
          description: videoDescription.trim()
        });
        showToast('Video attached to lesson!', 'success');
      }
      setVideoModalOpen(false);
      setEditingVideo(null);
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast(err.message || 'Failed to save video', 'error');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (lessonId, videoId) => {
    if (!window.confirm('Remove this video?')) return;
    setDeletingVideoId(videoId);
    try {
      await lmsService.deleteVideoFromLesson(lessonId, videoId);
      showToast('Video removed', 'info');
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast('Failed to remove video', 'error');
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Quiz Handlers
  const handleOpenCreateQuiz = (lessonId) => {
    setEditingQuiz(null);
    setTargetLessonForQuiz(lessonId);
    setQuizTitle('');
    setQuizTimeLimit(10);
    setQuizPassingScore(70);
    setQuizQuestions([
      {
        id: `q-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        points: 10,
        explanation: ''
      }
    ]);
    setQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (lessonId, quiz) => {
    setEditingQuiz(quiz);
    setTargetLessonForQuiz(lessonId);
    setQuizTitle(quiz.title || '');
    setQuizTimeLimit(quiz.timeLimitMinutes || 10);
    setQuizPassingScore(quiz.passingScore || 70);
    setQuizQuestions(
      quiz.questions && quiz.questions.length > 0
        ? quiz.questions.map((q) => ({
            id: q.id || `q-${Math.random()}`,
            question: q.question || '',
            options: q.options && q.options.length >= 2 ? [...q.options] : ['', '', '', ''],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            points: q.points || 10,
            explanation: q.explanation || ''
          }))
        : [
            {
              id: `q-${Date.now()}`,
              question: '',
              options: ['', '', '', ''],
              correctIndex: 0,
              points: 10,
              explanation: ''
            }
          ]
    );
    setQuizModalOpen(true);
  };

  const handleAddQuestionToDraft = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        points: 10,
        explanation: ''
      }
    ]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const handleAddOptionToQuestion = (qIndex) => {
    const updated = [...quizQuestions];
    if (updated[qIndex].options.length < 6) {
      updated[qIndex].options.push('');
      setQuizQuestions(updated);
    }
  };

  const handleRemoveOptionFromQuestion = (qIndex, optIndex) => {
    const updated = [...quizQuestions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(optIndex, 1);
      if (updated[qIndex].correctIndex >= updated[qIndex].options.length) {
        updated[qIndex].correctIndex = updated[qIndex].options.length - 1;
      }
      setQuizQuestions(updated);
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      showToast('Quiz title is required', 'error');
      return;
    }
    // Validation
    for (let i = 0; i < quizQuestions.length; i++) {
      if (!quizQuestions[i].question.trim()) {
        showToast(`Question ${i + 1} is empty`, 'error');
        return;
      }
      for (let j = 0; j < quizQuestions[i].options.length; j++) {
        if (!quizQuestions[i].options[j].trim()) {
          showToast(`Option ${String.fromCharCode(65 + j)} for Question ${i + 1} cannot be empty`, 'error');
          return;
        }
      }
    }

    setSavingQuiz(true);
    try {
      if (editingQuiz) {
        await lmsService.updateQuizInLesson(targetLessonForQuiz, editingQuiz.id, {
          title: quizTitle,
          timeLimitMinutes: quizTimeLimit,
          passingScore: quizPassingScore,
          questions: quizQuestions
        });
        showToast('Quiz updated successfully!', 'success');
      } else {
        await lmsService.addQuizToLesson(targetLessonForQuiz, {
          title: quizTitle,
          timeLimitMinutes: quizTimeLimit,
          passingScore: quizPassingScore,
          questions: quizQuestions
        });
        showToast('Interactive quiz published to lesson!', 'success');
      }
      setQuizModalOpen(false);
      setEditingQuiz(null);
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast(err.message || 'Failed to save quiz', 'error');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (lessonId, quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    setDeletingQuizId(quizId);
    try {
      await lmsService.deleteQuizFromLesson(lessonId, quizId);
      showToast('Quiz removed', 'info');
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast('Failed to remove quiz', 'error');
    } finally {
      setDeletingQuizId(null);
    }
  };

  // Note Handlers
  const handleOpenAddNote = (lessonId) => {
    setEditingNote(null);
    setTargetLessonForNote(lessonId);
    setNoteTitle('');
    setNoteContent('');
    setNoteFileName('');
    setNoteFileSize('1.2 MB');
    setNotePdfUrl('');
    setPdfUploadType('file');
    setNoteModalOpen(true);
  };

  const handleOpenEditNote = (lessonId, note) => {
    setEditingNote(note);
    setTargetLessonForNote(lessonId);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    setNoteFileName(note.fileName || '');
    setNoteFileSize(note.fileSize || '1.2 MB');
    setNotePdfUrl(note.pdfUrl || '');
    setPdfUploadType(note.pdfUrl?.startsWith('data:') ? 'file' : (note.pdfUrl ? 'url' : 'file'));
    setNoteModalOpen(true);
  };

  const handlePdfFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please select a valid PDF document (.pdf)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('PDF file exceeds 25MB limit', 'error');
      return;
    }

    setUploadingPdf(true);
    const sizeInMb = file.size / (1024 * 1024);
    const sizeStr = sizeInMb < 0.1 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMb.toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setNotePdfUrl(base64Data);
      setNoteFileName(file.name);
      setNoteFileSize(sizeStr);
      if (!noteTitle) {
        setNoteTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
      setUploadingPdf(false);
      showToast(`PDF "${file.name}" uploaded & ready to attach!`, 'success');
    };
    reader.onerror = () => {
      setUploadingPdf(false);
      showToast('Failed to read PDF file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachedPdf = () => {
    setNotePdfUrl('');
    setNoteFileName('');
    setNoteFileSize('1.2 MB');
    showToast('Attached PDF removed', 'info');
  };

  const handleOpenPdfPreview = (pdfUrl, title) => {
    setPreviewPdfUrl(pdfUrl);
    setPreviewPdfTitle(title || 'PDF Document Preview');
    setPdfPreviewModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Note title is required', 'error');
      return;
    }
    setSavingNote(true);
    try {
      const finalFileName = noteFileName.trim() || `${noteTitle.trim().replace(/\s+/g, '_')}.pdf`;
      const notePayload = {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        fileName: finalFileName,
        fileSize: noteFileSize || '1.2 MB',
        pdfUrl: notePdfUrl.trim()
      };

      if (editingNote) {
        await lmsService.updateNoteInLesson(targetLessonForNote, editingNote.id, notePayload);
        showToast('Study note and PDF updated successfully!', 'success');
      } else {
        await lmsService.addNoteToLesson(targetLessonForNote, notePayload);
        showToast('Lecture note and PDF published successfully!', 'success');
      }
      setNoteModalOpen(false);
      setEditingNote(null);
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (lessonId, noteId) => {
    if (!window.confirm('Delete this note?')) return;
    setDeletingNoteId(noteId);
    try {
      await lmsService.deleteNoteFromLesson(lessonId, noteId);
      showToast('Note removed', 'info');
      await fetchLessons(selectedClassId);
    } catch (err) {
      showToast('Failed to remove note', 'error');
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Lesson & Content Studio</h1>
          <p>Create lessons, upload multiple videos, build interactive quizzes, and provide study notes.</p>
        </div>

        <button
          onClick={() => {
            setEditingLesson(null);
            setLessonTitle('');
            setLessonDuration('45 mins');
            setLessonDescription('');
            setLessonModalOpen(true);
          }}
          disabled={!selectedClassId}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add New Lesson Module
        </button>
      </div>

      {/* Class Selector Dropdown */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '130px' }}>
            Selected Class:
          </label>
          <select
            className="form-control"
            style={{ maxWidth: '450px' }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.grade})
              </option>
            ))}
          </select>

          {selectedClass && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Instructor: <strong>{selectedClass.instructor}</strong> • Fee: <strong>{settings?.currencySymbol || 'Rs.'}{selectedClass.fee}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Video size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Lessons in this Class</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Start building your curriculum by adding the first lesson with videos, quizzes, and notes.
          </p>
          <button
            onClick={() => {
              setEditingLesson(null);
              setLessonTitle('');
              setLessonDuration('45 mins');
              setLessonDescription('');
              setLessonModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Create First Lesson
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {lessons.map((lesson, idx) => {
            const isExpanded = expandedLessonId === lesson.id;
            const videoCount = lesson.videos?.length || 0;
            const quizCount = lesson.quizzes?.length || 0;
            const noteCount = lesson.notes?.length || 0;

            return (
              <div
                key={lesson.id}
                className="glass-card"
                style={{
                  borderLeft: isExpanded ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}
              >
                {/* Lesson Header Bar */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--bg-tertiary)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                  }}
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isExpanded ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isExpanded ? '#ffffff' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lesson.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{lesson.duration}</span>
                        <span>•</span>
                        <span>{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
                        <span>•</span>
                        <span>{quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}</span>
                        <span>•</span>
                        <span>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonTitle(lesson.title);
                        setLessonDuration(lesson.duration || '45 mins');
                        setLessonDescription(lesson.description || '');
                        setLessonModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem' }}
                      title="Edit Lesson Details"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.4rem' }}
                      title="Delete Lesson"
                      disabled={deletingLessonId === lesson.id}
                    >
                      {deletingLessonId === lesson.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>

                    <button
                      onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Lesson Content Area */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem' }}>
                    {lesson.description && (
                      <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                        {lesson.description}
                      </p>
                    )}

                    {/* Content Sub-Tabs */}
                    <div className="tabs-header" style={{ marginBottom: '1.25rem' }}>
                      <button
                        className={`tab-btn ${activeSubTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('videos')}
                      >
                        <Video size={16} /> Videos ({videoCount})
                      </button>
                      <button
                        className={`tab-btn ${activeSubTab === 'quizzes' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('quizzes')}
                      >
                        <HelpCircle size={16} /> Interactive Quizzes ({quizCount})
                      </button>
                      <button
                        className={`tab-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('notes')}
                      >
                        <FileText size={16} /> Study Notes ({noteCount})
                      </button>
                    </div>

                    {/* ================= VIDEOS SUB-TAB ================= */}
                    {activeSubTab === 'videos' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Attach multiple lecture recordings, demonstrations, or embedded links.
                          </span>
                          <button
                            onClick={() => handleOpenAddVideo(lesson.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Plus size={15} /> Upload / Attach Video
                          </button>
                        </div>

                        {videoCount === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: '0.875rem' }}>No videos attached to this lesson yet.</p>
                          </div>
                        ) : (
                          <div className="cards-grid-sm">
                            {lesson.videos.map((vid) => (
                              <div
                                key={vid.id}
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          background: 'rgba(79, 70, 229, 0.15)',
                                          color: 'var(--primary)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <Play size={16} />
                                      </div>
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{vid.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                      <button
                                        onClick={() => handleOpenEditVideo(lesson.id, vid)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                        title="Edit Video Details"
                                      >
                                        <Edit2 size={12} /> Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteVideo(lesson.id, vid.id)}
                                        className="btn btn-danger btn-sm"
                                        style={{ padding: '0.3rem' }}
                                        title="Remove Video"
                                        disabled={deletingVideoId === vid.id}
                                      >
                                        {deletingVideoId === vid.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                      </button>
                                    </div>
                                  </div>

                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Duration: {vid.duration}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--primary)',
                                      wordBreak: 'break-all',
                                      background: 'var(--bg-secondary)',
                                      padding: '0.4rem',
                                      borderRadius: '4px',
                                      marginBottom: '0.5rem'
                                    }}
                                  >
                                    {vid.url}
                                  </div>
                                </div>

                                <a
                                  href={vid.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.75rem', width: '100%' }}
                                >
                                  Test Video Playback <ExternalLink size={12} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ================= QUIZZES SUB-TAB ================= */}
                    {activeSubTab === 'quizzes' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Interactive quizzes with instant auto-grading and passing threshold.
                          </span>
                          <button
                            onClick={() => handleOpenCreateQuiz(lesson.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Plus size={15} /> Create Interactive Quiz
                          </button>
                        </div>

                        {quizCount === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: '0.875rem' }}>No quizzes created for this lesson yet.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lesson.quizzes.map((quiz) => (
                              <div
                                key={quiz.id}
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  padding: '1.25rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                      {quiz.title}
                                    </h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                      <span>Questions: <strong>{quiz.questions?.length || 0}</strong></span>
                                      <span>Pass Mark: <strong>{quiz.passingScore}%</strong></span>
                                      <span>Time Limit: <strong>{quiz.timeLimitMinutes} mins</strong></span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => handleOpenEditQuiz(lesson.id, quiz)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                      title="Edit Quiz & Answers"
                                    >
                                      <Edit2 size={13} /> Edit Quiz
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuiz(lesson.id, quiz.id)}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '0.35rem 0.5rem' }}
                                      title="Delete Quiz"
                                      disabled={deletingQuizId === quiz.id}
                                    >
                                      {deletingQuizId === quiz.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                    </button>
                                  </div>
                                </div>

                                {/* Questions & Correct Answer Preview */}
                                {quiz.questions && quiz.questions.length > 0 && (
                                  <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {quiz.questions.map((q, qIdx) => (
                                      <div
                                        key={q.id || qIdx}
                                        style={{
                                          padding: '0.65rem 0.85rem',
                                          background: 'var(--bg-secondary)',
                                          borderRadius: 'var(--radius-sm)',
                                          fontSize: '0.85rem',
                                          border: '1px solid var(--border-color)'
                                        }}
                                      >
                                        <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                                          Q{qIdx + 1}: {q.question}
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                          {q.options?.map((opt, oIdx) => (
                                            <span
                                              key={oIdx}
                                              style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: oIdx === q.correctIndex ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                                                color: oIdx === q.correctIndex ? 'var(--success)' : 'var(--text-muted)',
                                                border: oIdx === q.correctIndex ? '1px solid var(--success)' : '1px solid var(--border-color)',
                                                fontWeight: oIdx === q.correctIndex ? 700 : 500
                                              }}
                                            >
                                              {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex && '✓ (Correct)'}
                                            </span>
                                          ))}
                                        </div>
                                        {q.explanation && (
                                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                            Explanation: {q.explanation}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ================= NOTES SUB-TAB ================= */}
                    {activeSubTab === 'notes' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Detailed lecture notes, cheat sheets, and downloadable references.
                          </span>
                          <button
                            onClick={() => handleOpenAddNote(lesson.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Plus size={15} /> Add Study Notes
                          </button>
                        </div>

                        {noteCount === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: '0.875rem' }}>No study notes published for this lesson yet.</p>
                          </div>
                        ) : (
                          <div className="cards-grid-sm">
                            {lesson.notes.map((note) => (
                              <div
                                key={note.id}
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  padding: '1.25rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{note.title}</div>
                                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    <button
                                      onClick={() => handleOpenEditNote(lesson.id, note)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                      title="Edit Note Details"
                                    >
                                      <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(lesson.id, note.id)}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '0.3rem' }}
                                      title="Delete Note"
                                      disabled={deletingNoteId === note.id}
                                    >
                                      {deletingNoteId === note.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                    </button>
                                  </div>
                                </div>

                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    maxHeight: '80px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '0.75rem',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {note.content || '(No additional text synopsis provided)'}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FileText size={14} color={note.pdfUrl ? '#ef4444' : 'var(--primary)'} />
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{note.fileName}</span>
                                    <span>({note.fileSize || '1.2 MB'})</span>
                                  </div>
                                  {note.pdfUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPdfPreview(note.pdfUrl, note.title)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      <Eye size={12} /> Preview PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT LESSON ================= */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? 'Edit Lesson Module' : 'Create New Lesson Module'}
      >
        <form onSubmit={handleLessonSubmit}>
          <div className="form-group">
            <label className="form-label">Lesson Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Lesson 3: Integration by Substitution"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Duration</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 45 mins"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lesson Synopsis</label>
            <textarea
              className="form-control"
              placeholder="Brief summary of key concepts covered in this lesson..."
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setLessonModalOpen(false)} className="btn btn-secondary" disabled={savingLesson}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingLesson}>
              {savingLesson ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingLesson ? 'Saving Changes...' : 'Creating Lesson...'}</span>
                </>
              ) : (
                editingLesson ? 'Save Changes' : 'Create Lesson'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: ATTACH / EDIT VIDEO ================= */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setEditingVideo(null);
        }}
        title={editingVideo ? 'Edit Video Lecture' : 'Attach Video to Lesson'}
      >
        <form onSubmit={handleSaveVideo}>
          <div className="form-group">
            <label className="form-label">Video Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Part 1: First Principles Proof"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Video Stream URL (MP4 / Direct / Video Link) *</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://commondatastorage.googleapis.com/... or https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
              >
                Preset Video 1
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4')}
              >
                Preset Video 2
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duration (MM:SS)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 18:30"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Video Description / Timestamps</label>
            <textarea
              className="form-control"
              placeholder="Key concepts discussed or timestamp highlights..."
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => {
                setVideoModalOpen(false);
                setEditingVideo(null);
              }}
              className="btn btn-secondary"
              disabled={savingVideo}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingVideo}>
              {savingVideo ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingVideo ? 'Saving Video Changes...' : 'Attaching Video...'}</span>
                </>
              ) : (
                editingVideo ? 'Save Video Changes' : 'Attach Video'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: CREATE / EDIT QUIZ ================= */}
      <Modal
        isOpen={quizModalOpen}
        onClose={() => {
          setQuizModalOpen(false);
          setEditingQuiz(null);
        }}
        title={editingQuiz ? 'Edit Interactive Quiz & Answer Key' : 'Interactive Quiz Builder & Answer Key'}
        size="lg"
      >
        <form onSubmit={handleSaveQuiz}>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Quiz Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mid-Lesson Checkpoint Quiz"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Limit (Mins)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={quizTimeLimit}
                onChange={(e) => setQuizTimeLimit(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pass Mark (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                value={quizPassingScore}
                onChange={(e) => setQuizPassingScore(e.target.value)}
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Questions ({quizQuestions.length})</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Set the question, options, and highlight the correct answer for automatic evaluation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestionToDraft}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> Add Another Question
              </button>
            </div>

            {quizQuestions.map((q, qIndex) => (
              <div
                key={q.id || qIndex}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px'
                      }}
                    >
                      Question #{qIndex + 1}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Options: {q.options.length}
                    </span>
                  </div>

                  {quizQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={12} /> Remove Question
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    Question Statement *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter question statement here..."
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                    required
                  />
                </div>

                {/* Question Options & Correct Answer Setting */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0 }}>
                      Answer Options (Click button or radio to set Correct Answer) *
                    </label>
                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOptionToQuestion(qIndex)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <Plus size={12} /> Add Option ({String.fromCharCode(65 + q.options.length)})
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctIndex === optIndex;
                      return (
                        <div
                          key={optIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isCorrect ? '2px solid var(--success)' : '1px solid var(--border-color)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              cursor: 'pointer',
                              margin: 0,
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: isCorrect ? 'var(--success)' : 'var(--text-secondary)',
                              minWidth: '32px'
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-answer-radio-${qIndex}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', optIndex)}
                              style={{ cursor: 'pointer' }}
                            />
                            {String.fromCharCode(65 + optIndex)}
                          </label>

                          <input
                            type="text"
                            placeholder={`Enter text for Option ${String.fromCharCode(65 + optIndex)}...`}
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: 'var(--text-primary)',
                              fontSize: '0.875rem'
                            }}
                            required
                          />

                          {/* Correct Answer Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIndex, 'correctIndex', optIndex)}
                            style={{
                              padding: '0.3rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isCorrect ? '1px solid var(--success)' : '1px solid var(--border-color)',
                              background: isCorrect ? 'var(--success)' : 'var(--bg-tertiary)',
                              color: isCorrect ? '#ffffff' : 'var(--text-muted)'
                            }}
                          >
                            {isCorrect ? '✓ Correct Answer' : 'Set as Correct'}
                          </button>

                          {/* Remove option button if >2 options */}
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromQuestion(qIndex, optIndex)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                padding: '0.2rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Delete option"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dropdown Alternative for Correct Answer */}
                <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Selected Correct Answer
                    </label>
                    <select
                      className="form-control"
                      value={q.correctIndex}
                      onChange={(e) => handleUpdateQuestion(qIndex, 'correctIndex', Number(e.target.value))}
                      style={{
                        borderColor: 'var(--success)',
                        fontWeight: 600,
                        color: 'var(--success)',
                        fontSize: '0.85rem'
                      }}
                    >
                      {q.options.map((opt, optIndex) => (
                        <option key={optIndex} value={optIndex}>
                          Option {String.fromCharCode(65 + optIndex)}: {opt ? opt.slice(0, 30) : `(Option ${String.fromCharCode(65 + optIndex)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Question Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={q.points || 10}
                      onChange={(e) => handleUpdateQuestion(qIndex, 'points', Number(e.target.value))}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Explanation / Solution Hint (Shown to students after answering)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Because integration by parts requires choosing u according to LIATE..."
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                    style={{ fontSize: '0.825rem' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => {
                setQuizModalOpen(false);
                setEditingQuiz(null);
              }}
              className="btn btn-secondary"
              disabled={savingQuiz}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingQuiz}>
              {savingQuiz ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingQuiz ? 'Saving Quiz Changes...' : 'Publishing Quiz...'}</span>
                </>
              ) : (
                editingQuiz ? 'Save Quiz Changes' : 'Publish Quiz'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: ADD / EDIT NOTES ================= */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setEditingNote(null);
        }}
        title={editingNote ? 'Edit Lecture Notes & Study Material' : 'Add Lecture Notes & Study Material'}
      >
        <form onSubmit={handleSaveNote}>
          <div className="form-group">
            <label className="form-label">Note Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Fundamental Theorems & Formula Sheet"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>

          {/* PDF Attachment Section */}
          <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="#ef4444" /> Attach PDF Document
              </label>
              <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => setPdfUploadType('file')}
                  className={`btn btn-sm ${pdfUploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <Upload size={12} /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPdfUploadType('url')}
                  className={`btn btn-sm ${pdfUploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <ExternalLink size={12} /> Direct PDF URL
                </button>
              </div>
            </div>

            {notePdfUrl ? (
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                    PDF
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {noteFileName || 'Attached_Document.pdf'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Size: {noteFileSize} &bull; Attached Ready
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenPdfPreview(notePdfUrl, noteTitle || noteFileName)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAttachedPdf}
                    className="btn btn-danger btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {pdfUploadType === 'file' ? (
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.5rem',
                        cursor: uploadingPdf ? 'wait' : 'pointer',
                        background: 'var(--bg-tertiary)',
                        transition: 'border-color 0.2s, background 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePdfFileUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingPdf}
                      />
                      {uploadingPdf ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Loader2 size={24} className="animate-spin" color="var(--primary)" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Encoding PDF Document...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} color="var(--primary)" style={{ marginBottom: '0.4rem' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Click or drag a PDF document here</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Max file size: 25MB (.pdf format)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/handouts/calculus_notes.pdf"
                      value={notePdfUrl}
                      onChange={(e) => setNotePdfUrl(e.target.value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Document name (e.g. Calculus_Notes.pdf)"
                        value={noteFileName}
                        onChange={(e) => setNoteFileName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Size (e.g. 2.4 MB)"
                        value={noteFileSize}
                        onChange={(e) => setNoteFileSize(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Lecture Notes / Summary Content {notePdfUrl ? '(Optional synopsis)' : '*'}
            </label>
            <textarea
              className="form-control"
              style={{ minHeight: '120px' }}
              placeholder="Type lecture summary, key formulas, reference notes, or markdown guide..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required={!notePdfUrl}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => {
                setNoteModalOpen(false);
                setEditingNote(null);
              }}
              className="btn btn-secondary"
              disabled={savingNote}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingNote || uploadingPdf}>
              {savingNote ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingNote ? 'Saving Changes...' : 'Publishing Note...'}</span>
                </>
              ) : (
                editingNote ? 'Save Note Changes' : 'Publish Study Note'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: PDF VIEWER PREVIEW ================= */}
      <Modal
        isOpen={pdfPreviewModalOpen}
        onClose={() => setPdfPreviewModalOpen(false)}
        title={previewPdfTitle || 'PDF Document Viewer'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="#ef4444" /> {previewPdfTitle}
            </span>
            <a
              href={previewPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <ExternalLink size={12} /> Open Fullscreen / New Tab
            </a>
          </div>

          <div style={{ width: '100%', height: '550px', background: '#0f172a', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <iframe
              src={previewPdfUrl}
              title={previewPdfTitle}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setPdfPreviewModalOpen(false)}
              className="btn btn-secondary"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
