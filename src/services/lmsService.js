import { storage, STORAGE_KEYS } from './storageService';

export const lmsService = {
  // ================= SITE SETTINGS =================
  getSettings: async () => {
    return storage.get(STORAGE_KEYS.SETTINGS);
  },

  updateSettings: async (newSettings) => {
    const current = storage.get(STORAGE_KEYS.SETTINGS);
    const updated = { ...current, ...newSettings };
    storage.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // ================= SUBJECTS =================
  getSubjects: async () => {
    return storage.get(STORAGE_KEYS.SUBJECTS, []);
  },

  getSubjectById: async (id) => {
    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    return subjects.find((s) => s.id === id) || null;
  },

  createSubject: async ({ name, code, description, icon, color }) => {
    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    const newSubject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      code: (code || name.substring(0, 4)).toUpperCase(),
      description: description || '',
      icon: icon || '📚',
      color: color || '#4f46e5',
      createdAt: new Date().toISOString().split('T')[0]
    };
    subjects.push(newSubject);
    storage.set(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  },

  updateSubject: async (id, data) => {
    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found');

    subjects[index] = { ...subjects[index], ...data };
    storage.set(STORAGE_KEYS.SUBJECTS, subjects);
    return subjects[index];
  },

  deleteSubject: async (id) => {
    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    const filtered = subjects.filter((s) => s.id !== id);
    storage.set(STORAGE_KEYS.SUBJECTS, filtered);
    return true;
  },

  // ================= GRADES =================
  getGrades: async () => {
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    return grades.sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0));
  },

  getGradeById: async (id) => {
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    return grades.find((g) => g.id === id) || null;
  },

  createGrade: async ({ name, code, description, level, color }) => {
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    const newGrade = {
      id: `grade-${Date.now()}`,
      name: name.trim(),
      code: (code || name.replace(/\s+/g, '-').toUpperCase()),
      description: description || '',
      level: Number(level) || grades.length + 1,
      color: color || '#6366f1',
      createdAt: new Date().toISOString().split('T')[0]
    };
    grades.push(newGrade);
    storage.set(STORAGE_KEYS.GRADES, grades);
    return newGrade;
  },

  updateGrade: async (id, data) => {
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    const index = grades.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Grade not found');

    grades[index] = { ...grades[index], ...data };
    storage.set(STORAGE_KEYS.GRADES, grades);
    return grades[index];
  },

  deleteGrade: async (id) => {
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    const filtered = grades.filter((g) => g.id !== id);
    storage.set(STORAGE_KEYS.GRADES, filtered);
    return true;
  },

  // ================= CLASSES =================
  getClasses: async (subjectId = null) => {
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    if (subjectId) {
      return classes.filter((c) => c.subjectId === subjectId);
    }
    return classes;
  },

  getClassById: async (id) => {
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    return classes.find((c) => c.id === id) || null;
  },

  createClass: async (classData) => {
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const newClass = {
      id: `class-${Date.now()}`,
      title: classData.title.trim(),
      subjectId: classData.subjectId,
      grade: classData.grade || 'General',
      instructor: classData.instructor || 'Prof. Alexander Wright',
      fee: Number(classData.fee) || 0,
      description: classData.description || '',
      thumbnail: classData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      schedule: classData.schedule || 'Flexible Online Sessions',
      capacity: Number(classData.capacity) || 100,
      status: classData.status || 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    classes.push(newClass);
    storage.set(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  },

  updateClass: async (id, data) => {
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');

    classes[index] = { ...classes[index], ...data };
    storage.set(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
  },

  deleteClass: async (id) => {
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const filtered = classes.filter((c) => c.id !== id);
    storage.set(STORAGE_KEYS.CLASSES, filtered);

    // Also delete associated lessons
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    storage.set(STORAGE_KEYS.LESSONS, lessons.filter((l) => l.classId !== id));
    return true;
  },

  // ================= LESSONS =================
  getLessonsByClass: async (classId) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    return lessons.filter((l) => l.classId === classId).sort((a, b) => a.order - b.order);
  },

  getLessonById: async (id) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    return lessons.find((l) => l.id === id) || null;
  },

  createLesson: async (classId, data) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const classLessons = lessons.filter((l) => l.classId === classId);
    
    const newLesson = {
      id: `les-${Date.now()}`,
      classId,
      title: data.title.trim(),
      description: data.description || '',
      order: data.order || classLessons.length + 1,
      duration: data.duration || '30 mins',
      videos: data.videos || [],
      quizzes: data.quizzes || [],
      notes: data.notes || [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    lessons.push(newLesson);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newLesson;
  },

  updateLesson: async (id, data) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lesson not found');

    lessons[index] = { ...lessons[index], ...data };
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return lessons[index];
  },

  deleteLesson: async (id) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const filtered = lessons.filter((l) => l.id !== id);
    storage.set(STORAGE_KEYS.LESSONS, filtered);
    return true;
  },

  // Add/Remove Video in a Lesson
  addVideoToLesson: async (lessonId, video) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newVideo = {
      id: `vid-${Date.now()}`,
      title: video.title,
      url: video.url,
      duration: video.duration || '15:00',
      description: video.description || ''
    };

    if (!lesson.videos) lesson.videos = [];
    lesson.videos.push(newVideo);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newVideo;
  },

  updateVideoInLesson: async (lessonId, videoId, updatedVideo) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    if (!lesson.videos) lesson.videos = [];
    const vIndex = lesson.videos.findIndex((v) => v.id === videoId);
    if (vIndex === -1) throw new Error('Video not found');

    lesson.videos[vIndex] = {
      ...lesson.videos[vIndex],
      title: updatedVideo.title || lesson.videos[vIndex].title,
      url: updatedVideo.url || lesson.videos[vIndex].url,
      duration: updatedVideo.duration || lesson.videos[vIndex].duration || '15:00',
      description: updatedVideo.description !== undefined ? updatedVideo.description : lesson.videos[vIndex].description
    };

    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return lesson.videos[vIndex];
  },

  deleteVideoFromLesson: async (lessonId, videoId) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    lesson.videos = (lesson.videos || []).filter((v) => v.id !== videoId);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return true;
  },

  // Add/Remove Quiz in a Lesson
  addQuizToLesson: async (lessonId, quiz) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title: quiz.title,
      timeLimitMinutes: Number(quiz.timeLimitMinutes) || 10,
      passingScore: Number(quiz.passingScore) || 70,
      questions: quiz.questions || []
    };

    if (!lesson.quizzes) lesson.quizzes = [];
    lesson.quizzes.push(newQuiz);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newQuiz;
  },

  updateQuizInLesson: async (lessonId, quizId, updatedQuiz) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    if (!lesson.quizzes) lesson.quizzes = [];
    const qIndex = lesson.quizzes.findIndex((q) => q.id === quizId);
    if (qIndex === -1) throw new Error('Quiz not found');

    lesson.quizzes[qIndex] = {
      ...lesson.quizzes[qIndex],
      title: updatedQuiz.title || lesson.quizzes[qIndex].title,
      timeLimitMinutes: Number(updatedQuiz.timeLimitMinutes) || lesson.quizzes[qIndex].timeLimitMinutes || 10,
      passingScore: Number(updatedQuiz.passingScore) || lesson.quizzes[qIndex].passingScore || 70,
      questions: updatedQuiz.questions || lesson.quizzes[qIndex].questions || []
    };

    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return lesson.quizzes[qIndex];
  },

  deleteQuizFromLesson: async (lessonId, quizId) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    lesson.quizzes = (lesson.quizzes || []).filter((q) => q.id !== quizId);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return true;
  },

  // Add/Remove Note in a Lesson
  addNoteToLesson: async (lessonId, note) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newNote = {
      id: `note-${Date.now()}`,
      title: note.title,
      content: note.content,
      fileName: note.fileName || 'Lecture_Notes.pdf',
      fileSize: note.fileSize || '1.2 MB'
    };

    if (!lesson.notes) lesson.notes = [];
    lesson.notes.push(newNote);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newNote;
  },

  updateNoteInLesson: async (lessonId, noteId, updatedNote) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    if (!lesson.notes) lesson.notes = [];
    const nIndex = lesson.notes.findIndex((n) => n.id === noteId);
    if (nIndex === -1) throw new Error('Note not found');

    lesson.notes[nIndex] = {
      ...lesson.notes[nIndex],
      title: updatedNote.title || lesson.notes[nIndex].title,
      content: updatedNote.content !== undefined ? updatedNote.content : lesson.notes[nIndex].content,
      fileName: updatedNote.fileName || lesson.notes[nIndex].fileName || 'Lecture_Notes.pdf',
      fileSize: updatedNote.fileSize || lesson.notes[nIndex].fileSize || '1.2 MB'
    };

    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return lesson.notes[nIndex];
  },

  deleteNoteFromLesson: async (lessonId, noteId) => {
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    lesson.notes = (lesson.notes || []).filter((n) => n.id !== noteId);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return true;
  },

  // ================= STUDENT ACCESS & ENROLLMENT CONTROL =================
  // Strictly checks if a student is enrolled in a class
  isStudentEnrolled: (studentId, classId) => {
    if (!studentId || !classId) return false;
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const student = users.find((u) => u.id === studentId);
    if (!student) return false;
    
    // Teachers have access to all classes
    if (student.role === 'teacher') return true;

    return Array.isArray(student.enrolledClassIds) && student.enrolledClassIds.includes(classId);
  },

  // Enroll student into a class & record payment
  enrollStudentInClass: async (studentId, classId, paymentDetails = {}) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const studentIndex = users.findIndex((u) => u.id === studentId);
    if (studentIndex === -1) throw new Error('Student not found');

    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const classObj = classes.find((c) => c.id === classId);
    if (!classObj) throw new Error('Class not found');

    const student = users[studentIndex];
    if (!student.enrolledClassIds) student.enrolledClassIds = [];

    if (student.enrolledClassIds.includes(classId)) {
      return { success: true, message: 'Already enrolled' };
    }

    student.enrolledClassIds.push(classId);
    users[studentIndex] = student;
    storage.set(STORAGE_KEYS.USERS, users);

    // Update active session if this is current user
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === studentId) {
      storage.set(STORAGE_KEYS.CURRENT_USER, student);
    }

    // Create payment / invoice record
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      classId: classObj.id,
      className: classObj.title,
      amount: classObj.fee || 0,
      currencySymbol: '$',
      date: new Date().toLocaleString(),
      method: paymentDetails.method || (classObj.fee > 0 ? 'Card Online' : 'Scholarship / Free'),
      status: 'Completed',
      transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    };

    payments.unshift(newPayment);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);

    return { success: true, payment: newPayment };
  },

  // Get only classes enrolled by this student
  getStudentEnrolledClasses: async (studentId) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const student = users.find((u) => u.id === studentId);
    if (!student) return [];

    const enrolledIds = student.enrolledClassIds || [];
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    return classes.filter((c) => enrolledIds.includes(c.id));
  },

  // Toggle Watch Later for student
  toggleWatchLater: async (studentId, videoId) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const studentIndex = users.findIndex((u) => u.id === studentId);
    if (studentIndex === -1) throw new Error('Student not found');

    const student = users[studentIndex];
    if (!student.watchLaterVideoIds) student.watchLaterVideoIds = [];

    const exists = student.watchLaterVideoIds.includes(videoId);
    if (exists) {
      student.watchLaterVideoIds = student.watchLaterVideoIds.filter((id) => id !== videoId);
    } else {
      student.watchLaterVideoIds.push(videoId);
    }

    users[studentIndex] = student;
    storage.set(STORAGE_KEYS.USERS, users);

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === studentId) {
      storage.set(STORAGE_KEYS.CURRENT_USER, student);
    }

    return !exists; // true if added, false if removed
  },

  // Get all Watch Later videos for student
  getWatchLaterVideos: async (studentId) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const student = users.find((u) => u.id === studentId);
    if (!student || !student.watchLaterVideoIds) return [];

    const videoIds = student.watchLaterVideoIds;
    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);

    const result = [];
    lessons.forEach((lesson) => {
      const cls = classes.find((c) => c.id === lesson.classId);
      (lesson.videos || []).forEach((v) => {
        if (videoIds.includes(v.id)) {
          result.push({
            ...v,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            classId: lesson.classId,
            className: cls ? cls.title : 'Class',
            thumbnail: cls ? cls.thumbnail : null
          });
        }
      });
    });

    return result;
  },

  // ================= PAYMENTS & TRANSACTIONS =================
  getStudentPayments: async (studentId) => {
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    return payments.filter((p) => p.studentId === studentId);
  },

  getAllPayments: async () => {
    return storage.get(STORAGE_KEYS.PAYMENTS, []);
  },

  updatePaymentStatus: async (paymentId, newStatus, notes = '') => {
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const pIndex = payments.findIndex((p) => p.id === paymentId);
    if (pIndex === -1) throw new Error('Payment record not found');

    const payment = payments[pIndex];
    payment.status = newStatus;
    if (notes) payment.adminNotes = notes;
    payment.updatedAt = new Date().toLocaleString();

    // If marked as Completed, ensure the student is enrolled in the class
    if (newStatus === 'Completed' && payment.studentId && payment.classId) {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const uIndex = users.findIndex((u) => u.id === payment.studentId);
      if (uIndex !== -1) {
        if (!users[uIndex].enrolledClassIds) users[uIndex].enrolledClassIds = [];
        if (!users[uIndex].enrolledClassIds.includes(payment.classId)) {
          users[uIndex].enrolledClassIds.push(payment.classId);
          storage.set(STORAGE_KEYS.USERS, users);
        }
      }
    }

    // If marked as Refunded or Cancelled, optionally keep track
    payments[pIndex] = payment;
    storage.set(STORAGE_KEYS.PAYMENTS, payments);
    return payment;
  },

  recordManualPayment: async (data) => {
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      classId: data.classId,
      className: data.className,
      amount: Number(data.amount) || 0,
      currencySymbol: data.currencySymbol || '$',
      date: data.date || new Date().toLocaleString(),
      method: data.method || 'Manual / Cash',
      status: data.status || 'Completed',
      adminNotes: data.adminNotes || '',
      transactionId: data.transactionId || `TXN-MANUAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`
    };

    // If status is Completed, auto enroll the student
    if (newPayment.status === 'Completed' && newPayment.studentId && newPayment.classId) {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const uIndex = users.findIndex((u) => u.id === newPayment.studentId);
      if (uIndex !== -1) {
        if (!users[uIndex].enrolledClassIds) users[uIndex].enrolledClassIds = [];
        if (!users[uIndex].enrolledClassIds.includes(newPayment.classId)) {
          users[uIndex].enrolledClassIds.push(newPayment.classId);
          storage.set(STORAGE_KEYS.USERS, users);
        }
      }
    }

    payments.unshift(newPayment);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);
    return newPayment;
  },

  deletePayment: async (paymentId) => {
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const filtered = payments.filter((p) => p.id !== paymentId);
    storage.set(STORAGE_KEYS.PAYMENTS, filtered);
    return true;
  },

  // Record quiz completion
  submitQuizAttempt: async (studentId, quizId, classId, score, passed) => {
    const attempts = storage.get(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    const newAttempt = {
      id: `att-${Date.now()}`,
      studentId,
      quizId,
      classId,
      score,
      passed,
      date: new Date().toLocaleString()
    };
    attempts.push(newAttempt);
    storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
    return newAttempt;
  },

  // Mark lesson completed
  markLessonCompleted: async (studentId, lessonId) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const studentIndex = users.findIndex((u) => u.id === studentId);
    if (studentIndex === -1) return;

    const student = users[studentIndex];
    if (!student.completedLessonIds) student.completedLessonIds = [];
    if (!student.completedLessonIds.includes(lessonId)) {
      student.completedLessonIds.push(lessonId);
      users[studentIndex] = student;
      storage.set(STORAGE_KEYS.USERS, users);

      const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (currentUser && currentUser.id === studentId) {
        storage.set(STORAGE_KEYS.CURRENT_USER, student);
      }
    }
  },

  // ================= USERS MANAGEMENT (FOR ADMIN) =================
  getAllStudents: async () => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    return users.filter((u) => u.role === 'student');
  },

  // ================= DATA EXPORT & IMPORT (ONLINE SERVER READINESS) =================
  exportDatabaseJSON: () => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: storage.get(STORAGE_KEYS.SETTINGS),
      subjects: storage.get(STORAGE_KEYS.SUBJECTS),
      grades: storage.get(STORAGE_KEYS.GRADES),
      classes: storage.get(STORAGE_KEYS.CLASSES),
      lessons: storage.get(STORAGE_KEYS.LESSONS),
      users: storage.get(STORAGE_KEYS.USERS),
      payments: storage.get(STORAGE_KEYS.PAYMENTS),
      quizAttempts: storage.get(STORAGE_KEYS.QUIZ_ATTEMPTS)
    };
    return JSON.stringify(dump, null, 2);
  },

  importDatabaseJSON: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) storage.set(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.subjects) storage.set(STORAGE_KEYS.SUBJECTS, data.subjects);
      if (data.grades) storage.set(STORAGE_KEYS.GRADES, data.grades);
      if (data.classes) storage.set(STORAGE_KEYS.CLASSES, data.classes);
      if (data.lessons) storage.set(STORAGE_KEYS.LESSONS, data.lessons);
      if (data.users) storage.set(STORAGE_KEYS.USERS, data.users);
      if (data.payments) storage.set(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.quizAttempts) storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, data.quizAttempts);
      return { success: true };
    } catch (e) {
      throw new Error('Invalid JSON format: ' + e.message);
    }
  }
};
