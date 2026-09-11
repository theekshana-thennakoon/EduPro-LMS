import { storage, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mapUserFromDb, mapUserToDb } from './authService';

// ================= DATA MAPPERS (Database snake_case <-> Frontend camelCase) =================

export const mapSettingsFromDb = (db) => {
  if (!db) return null;
  return {
    id: db.id || 'default',
    siteName: db.site_name || 'EduPro Academy',
    instituteTitle: db.institute_title || 'Global Online Institute of Excellence',
    tagline: db.tagline || '',
    logoUrl: db.logo_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    supportEmail: db.support_email || 'director@eduproacademy.org',
    supportPhone: db.support_phone || '+1 (800) 420-5678',
    address: db.address || '450 Innovation Parkway, Suite 300, Silicon Valley, CA',
    currency: db.currency || 'LKR / INR (Rs.)',
    currencySymbol: db.currency_symbol || 'Rs.',
    accentColor: db.accent_color || '#6366f1',
    allowSelfRegistration: db.allow_self_registration !== false,
    themeMode: db.theme_mode || 'light',
    paymentGateway: db.payment_gateway || {
      provider: 'Stripe Secure Pay',
      testMode: true,
      publishableKey: 'pk_test_demo',
      bankTransferInstructions: 'Bank: Silicon Horizon Bank | Account: 8840-2910-4491'
    }
  };
};

export const mapSettingsToDb = (s) => ({
  id: 'default',
  site_name: s.siteName,
  institute_title: s.instituteTitle,
  tagline: s.tagline,
  logo_url: s.logoUrl,
  support_email: s.supportEmail,
  support_phone: s.supportPhone,
  address: s.address,
  currency: s.currency,
  currency_symbol: s.currencySymbol,
  accent_color: s.accentColor,
  allow_self_registration: s.allowSelfRegistration !== false,
  theme_mode: s.themeMode || 'light',
  payment_gateway: s.paymentGateway || {},
  updated_at: new Date().toISOString()
});

export const mapSubjectFromDb = (db) => ({
  id: db.id,
  name: db.name,
  code: db.code,
  description: db.description || '',
  icon: db.icon || '📚',
  color: db.color || '#4f46e5',
  createdAt: db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

export const mapSubjectToDb = (s) => ({
  id: s.id,
  name: s.name ? s.name.trim() : '',
  code: s.code ? s.code.trim().toUpperCase() : '',
  description: s.description || '',
  icon: s.icon || '📚',
  color: s.color || '#4f46e5'
});

export const mapGradeFromDb = (db) => ({
  id: db.id,
  name: db.name,
  code: db.code || '',
  level: Number(db.level) || 1,
  description: db.description || '',
  color: db.color || '#3b82f6',
  createdAt: db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

export const mapGradeToDb = (g) => ({
  id: g.id,
  name: g.name ? g.name.trim() : '',
  code: g.code ? g.code.trim().toUpperCase() : '',
  level: Number(g.level) || 1,
  description: g.description || '',
  color: g.color || '#3b82f6'
});

export const mapClassFromDb = (db) => ({
  id: db.id,
  title: db.title,
  subjectId: db.subject_id,
  grade: db.grade || 'General',
  description: db.description || '',
  instructor: db.instructor || 'Prof. Alexander Wright',
  schedule: db.schedule || 'Flexible Online Sessions',
  fee: Number(db.fee) || 0,
  capacity: Number(db.capacity) || 100,
  thumbnail: db.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  isPublished: db.is_published !== false,
  status: db.is_published === false ? 'inactive' : 'active',
  createdAt: db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

export const mapClassToDb = (c) => ({
  id: c.id,
  title: c.title ? c.title.trim() : '',
  subject_id: c.subjectId || null,
  grade: c.grade || 'General',
  description: c.description || '',
  instructor: c.instructor || 'Prof. Alexander Wright',
  schedule: c.schedule || 'Flexible Online Sessions',
  fee: Number(c.fee) || 0,
  capacity: Number(c.capacity) || 100,
  thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  is_published: c.status ? c.status === 'active' : c.isPublished !== false
});

export const mapLessonFromDb = (db) => ({
  id: db.id,
  classId: db.class_id,
  title: db.title,
  order: Number(db.order_index) || 1,
  orderIndex: Number(db.order_index) || 1,
  description: db.description || '',
  duration: db.duration || '30 mins',
  videos: Array.isArray(db.videos) ? db.videos : [],
  notes: Array.isArray(db.notes) ? db.notes : [],
  quizzes: Array.isArray(db.quizzes) ? db.quizzes : [],
  createdAt: db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

export const mapLessonToDb = (l) => ({
  id: l.id,
  class_id: l.classId,
  title: l.title ? l.title.trim() : '',
  order_index: Number(l.order || l.orderIndex) || 1,
  description: l.description || '',
  videos: Array.isArray(l.videos) ? l.videos : [],
  notes: Array.isArray(l.notes) ? l.notes : [],
  quizzes: Array.isArray(l.quizzes) ? l.quizzes : []
});

export const mapPaymentFromDb = (db) => ({
  id: db.id,
  invoiceNumber: db.invoice_number || `INV-${db.id}`,
  studentId: db.student_id,
  studentName: db.student_name,
  studentEmail: db.student_email,
  classId: db.class_id,
  className: db.class_name,
  amount: Number(db.amount) || 0,
  currencySymbol: db.currency || 'Rs.',
  currency: db.currency || 'Rs.',
  date: db.date || (db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
  method: db.method || 'Direct Bank Transfer',
  status: db.status || 'Completed',
  transactionId: db.txn_reference || `TXN-${db.id}`,
  adminNotes: db.notes || '',
  createdAt: db.created_at
});

export const mapPaymentToDb = (p) => ({
  id: p.id,
  invoice_number: p.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
  student_id: p.studentId || null,
  student_name: p.studentName || '',
  student_email: p.studentEmail || '',
  class_id: p.classId || null,
  class_name: p.className || '',
  amount: Number(p.amount) || 0,
  currency: p.currencySymbol || p.currency || 'Rs.',
  date: p.date ? (typeof p.date === 'string' ? p.date.split('T')[0].split(',')[0] : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
  method: p.method || 'Direct Bank Transfer',
  status: p.status || 'Completed',
  txn_reference: p.transactionId || p.txnReference || `TXN-${Date.now().toString().slice(-6)}`,
  notes: p.adminNotes || p.notes || ''
});


// ================= LMS CORE SERVICE =================

export const lmsService = {
  // ================= SITE SETTINGS =================
  getSettings: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (error) {
          console.error('Supabase getSettings error:', error);
        } else if (data) {
          const mapped = mapSettingsFromDb(data);
          storage.set(STORAGE_KEYS.SETTINGS, mapped);
          return mapped;
        } else {
          // Insert initial default settings
          const initial = storage.get(STORAGE_KEYS.SETTINGS);
          if (initial) {
            await supabase.from('site_settings').insert(mapSettingsToDb(initial));
          }
        }
      } catch (err) {
        console.warn('Supabase getSettings failed, using storage cache:', err);
      }
    }
    return storage.get(STORAGE_KEYS.SETTINGS);
  },

  updateSettings: async (newSettings) => {
    const current = storage.get(STORAGE_KEYS.SETTINGS) || {};
    const updated = { ...current, ...newSettings };

    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = mapSettingsToDb(updated);
        const { error } = await supabase
          .from('site_settings')
          .upsert(dbPayload, { onConflict: 'id' });

        if (error) {
          console.error('Supabase updateSettings error:', error);
          throw new Error(error.message || 'Failed to save settings to database');
        }
      } catch (err) {
        console.error('Error saving settings to Supabase:', err);
        throw err;
      }
    }

    storage.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // ================= SUBJECTS =================
  getSubjects: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Supabase getSubjects error:', error);
        } else if (data) {
          const mapped = data.map(mapSubjectFromDb);
          storage.set(STORAGE_KEYS.SUBJECTS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getSubjects failed, using storage cache:', err);
      }
    }
    return storage.get(STORAGE_KEYS.SUBJECTS, []);
  },

  getSubjectById: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) return mapSubjectFromDb(data);
      } catch (err) {
        console.warn('Supabase getSubjectById error:', err);
      }
    }
    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    return subjects.find((s) => s.id === id) || null;
  },

  createSubject: async ({ name, code, description, icon, color }) => {
    const newSubject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      code: (code || name.substring(0, 4)).toUpperCase(),
      description: description || '',
      icon: icon || '📚',
      color: color || '#4f46e5',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('subjects')
          .insert(mapSubjectToDb(newSubject));

        if (error) {
          console.error('Supabase createSubject error:', error);
          throw new Error(error.message || 'Failed to save subject in database');
        }
      } catch (err) {
        console.error('Error inserting subject in Supabase:', err);
        throw err;
      }
    }

    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    subjects.push(newSubject);
    storage.set(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  },

  updateSubject: async (id, data) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {};
        if (data.name !== undefined) dbPayload.name = data.name.trim();
        if (data.code !== undefined) dbPayload.code = data.code.trim().toUpperCase();
        if (data.description !== undefined) dbPayload.description = data.description;
        if (data.icon !== undefined) dbPayload.icon = data.icon;
        if (data.color !== undefined) dbPayload.color = data.color;

        const { error } = await supabase
          .from('subjects')
          .update(dbPayload)
          .eq('id', id);

        if (error) {
          console.error('Supabase updateSubject error:', error);
          throw new Error(error.message || 'Failed to update subject in database');
        }
      } catch (err) {
        console.error('Error updating subject in Supabase:', err);
        throw err;
      }
    }

    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    const index = subjects.findIndex((s) => s.id === id);
    if (index !== -1) {
      subjects[index] = { ...subjects[index], ...data };
      storage.set(STORAGE_KEYS.SUBJECTS, subjects);
      return subjects[index];
    }
    return { id, ...data };
  },

  deleteSubject: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase deleteSubject error:', error);
          throw new Error(error.message || 'Failed to delete subject from database');
        }
      } catch (err) {
        console.error('Error deleting subject in Supabase:', err);
        throw err;
      }
    }

    const subjects = storage.get(STORAGE_KEYS.SUBJECTS, []);
    const filtered = subjects.filter((s) => s.id !== id);
    storage.set(STORAGE_KEYS.SUBJECTS, filtered);
    return true;
  },

  // ================= GRADES =================
  getGrades: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .order('level', { ascending: true });

        if (error) {
          console.error('Supabase getGrades error:', error);
        } else if (data) {
          const mapped = data.map(mapGradeFromDb);
          storage.set(STORAGE_KEYS.GRADES, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getGrades failed, using storage cache:', err);
      }
    }
    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    return grades.sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0));
  },

  getGradeById: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('grades')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) return mapGradeFromDb(data);
      } catch (err) {
        console.warn('Supabase getGradeById error:', err);
      }
    }
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

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('grades')
          .insert(mapGradeToDb(newGrade));

        if (error) {
          console.error('Supabase createGrade error:', error);
          throw new Error(error.message || 'Failed to save grade in database');
        }
      } catch (err) {
        console.error('Error inserting grade in Supabase:', err);
        throw err;
      }
    }

    grades.push(newGrade);
    storage.set(STORAGE_KEYS.GRADES, grades);
    return newGrade;
  },

  updateGrade: async (id, data) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {};
        if (data.name !== undefined) dbPayload.name = data.name.trim();
        if (data.code !== undefined) dbPayload.code = data.code.trim().toUpperCase();
        if (data.description !== undefined) dbPayload.description = data.description;
        if (data.level !== undefined) dbPayload.level = Number(data.level) || 1;
        if (data.color !== undefined) dbPayload.color = data.color;

        const { error } = await supabase
          .from('grades')
          .update(dbPayload)
          .eq('id', id);

        if (error) {
          console.error('Supabase updateGrade error:', error);
          throw new Error(error.message || 'Failed to update grade in database');
        }
      } catch (err) {
        console.error('Error updating grade in Supabase:', err);
        throw err;
      }
    }

    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    const index = grades.findIndex((g) => g.id === id);
    if (index !== -1) {
      grades[index] = { ...grades[index], ...data };
      storage.set(STORAGE_KEYS.GRADES, grades);
      return grades[index];
    }
    return { id, ...data };
  },

  deleteGrade: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('grades')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase deleteGrade error:', error);
          throw new Error(error.message || 'Failed to delete grade from database');
        }
      } catch (err) {
        console.error('Error deleting grade in Supabase:', err);
        throw err;
      }
    }

    const grades = storage.get(STORAGE_KEYS.GRADES, []);
    const filtered = grades.filter((g) => g.id !== id);
    storage.set(STORAGE_KEYS.GRADES, filtered);
    return true;
  },

  // ================= CLASSES =================
  getClasses: async (subjectId = null) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('classes')
          .select('*')
          .order('created_at', { ascending: false });

        if (subjectId) {
          query = query.eq('subject_id', subjectId);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Supabase getClasses error:', error);
        } else if (data) {
          const mapped = data.map(mapClassFromDb);
          if (!subjectId) {
            storage.set(STORAGE_KEYS.CLASSES, mapped);
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getClasses failed, using storage cache:', err);
      }
    }

    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    if (subjectId) {
      return classes.filter((c) => c.subjectId === subjectId);
    }
    return classes;
  },

  getClassById: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) return mapClassFromDb(data);
      } catch (err) {
        console.warn('Supabase getClassById error:', err);
      }
    }
    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    return classes.find((c) => c.id === id) || null;
  },

  createClass: async (classData) => {
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
      isPublished: classData.status ? classData.status === 'active' : true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('classes')
          .insert(mapClassToDb(newClass));

        if (error) {
          console.error('Supabase createClass error:', error);
          throw new Error(error.message || 'Failed to save class in database');
        }
      } catch (err) {
        console.error('Error inserting class in Supabase:', err);
        throw err;
      }
    }

    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    classes.push(newClass);
    storage.set(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  },

  updateClass: async (id, data) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {};
        if (data.title !== undefined) dbPayload.title = data.title.trim();
        if (data.subjectId !== undefined) dbPayload.subject_id = data.subjectId;
        if (data.grade !== undefined) dbPayload.grade = data.grade;
        if (data.instructor !== undefined) dbPayload.instructor = data.instructor;
        if (data.fee !== undefined) dbPayload.fee = Number(data.fee) || 0;
        if (data.description !== undefined) dbPayload.description = data.description;
        if (data.thumbnail !== undefined) dbPayload.thumbnail = data.thumbnail;
        if (data.schedule !== undefined) dbPayload.schedule = data.schedule;
        if (data.capacity !== undefined) dbPayload.capacity = Number(data.capacity) || 100;
        if (data.status !== undefined) dbPayload.is_published = data.status === 'active';
        if (data.isPublished !== undefined) dbPayload.is_published = data.isPublished;

        const { error } = await supabase
          .from('classes')
          .update(dbPayload)
          .eq('id', id);

        if (error) {
          console.error('Supabase updateClass error:', error);
          throw new Error(error.message || 'Failed to update class in database');
        }
      } catch (err) {
        console.error('Error updating class in Supabase:', err);
        throw err;
      }
    }

    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const index = classes.findIndex((c) => c.id === id);
    if (index !== -1) {
      classes[index] = { ...classes[index], ...data };
      storage.set(STORAGE_KEYS.CLASSES, classes);
      return classes[index];
    }
    return { id, ...data };
  },

  deleteClass: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        // Delete associated lessons first, then class
        await supabase.from('lessons').delete().eq('class_id', id);
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) {
          console.error('Supabase deleteClass error:', error);
          throw new Error(error.message || 'Failed to delete class from database');
        }
      } catch (err) {
        console.error('Error deleting class in Supabase:', err);
        throw err;
      }
    }

    const classes = storage.get(STORAGE_KEYS.CLASSES, []);
    const filtered = classes.filter((c) => c.id !== id);
    storage.set(STORAGE_KEYS.CLASSES, filtered);

    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    storage.set(STORAGE_KEYS.LESSONS, lessons.filter((l) => l.classId !== id));
    return true;
  },

  // ================= LESSONS =================
  getLessonsByClass: async (classId) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('class_id', classId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Supabase getLessonsByClass error:', error);
        } else if (data) {
          const mapped = data.map(mapLessonFromDb);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getLessonsByClass failed, using storage cache:', err);
      }
    }

    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    return lessons.filter((l) => l.classId === classId).sort((a, b) => a.order - b.order);
  },

  getLessonById: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data) return mapLessonFromDb(data);
      } catch (err) {
        console.warn('Supabase getLessonById error:', err);
      }
    }
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
      order: Number(data.order) || classLessons.length + 1,
      orderIndex: Number(data.order) || classLessons.length + 1,
      duration: data.duration || '30 mins',
      videos: Array.isArray(data.videos) ? data.videos : [],
      quizzes: Array.isArray(data.quizzes) ? data.quizzes : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('lessons')
          .insert(mapLessonToDb(newLesson));

        if (error) {
          console.error('Supabase createLesson error:', error);
          throw new Error(error.message || 'Failed to save lesson in database');
        }
      } catch (err) {
        console.error('Error inserting lesson in Supabase:', err);
        throw err;
      }
    }

    lessons.push(newLesson);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newLesson;
  },

  updateLesson: async (id, data) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {};
        if (data.title !== undefined) dbPayload.title = data.title.trim();
        if (data.description !== undefined) dbPayload.description = data.description;
        if (data.order !== undefined || data.orderIndex !== undefined) {
          dbPayload.order_index = Number(data.order || data.orderIndex) || 1;
        }
        if (data.videos !== undefined) dbPayload.videos = data.videos;
        if (data.notes !== undefined) dbPayload.notes = data.notes;
        if (data.quizzes !== undefined) dbPayload.quizzes = data.quizzes;

        const { error } = await supabase
          .from('lessons')
          .update(dbPayload)
          .eq('id', id);

        if (error) {
          console.error('Supabase updateLesson error:', error);
          throw new Error(error.message || 'Failed to update lesson in database');
        }
      } catch (err) {
        console.error('Error updating lesson in Supabase:', err);
        throw err;
      }
    }

    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const index = lessons.findIndex((l) => l.id === id);
    if (index !== -1) {
      lessons[index] = { ...lessons[index], ...data };
      storage.set(STORAGE_KEYS.LESSONS, lessons);
      return lessons[index];
    }
    return { id, ...data };
  },

  deleteLesson: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase deleteLesson error:', error);
          throw new Error(error.message || 'Failed to delete lesson from database');
        }
      } catch (err) {
        console.error('Error deleting lesson in Supabase:', err);
        throw err;
      }
    }

    const lessons = storage.get(STORAGE_KEYS.LESSONS, []);
    const filtered = lessons.filter((l) => l.id !== id);
    storage.set(STORAGE_KEYS.LESSONS, filtered);
    return true;
  },

  // Sub-items: Video, Quiz, Note handlers
  addVideoToLesson: async (lessonId, video) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newVideo = {
      id: `vid-${Date.now()}`,
      title: video.title,
      url: video.url,
      duration: video.duration || '15:00',
      description: video.description || '',
      fileName: video.fileName || '',
      fileSize: video.fileSize || ''
    };

    const updatedVideos = [...(lesson.videos || []), newVideo];
    await lmsService.updateLesson(lessonId, { videos: updatedVideos });
    return newVideo;
  },

  updateVideoInLesson: async (lessonId, videoId, updatedVideo) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const videos = [...(lesson.videos || [])];
    const vIndex = videos.findIndex((v) => v.id === videoId);
    if (vIndex === -1) throw new Error('Video not found');

    videos[vIndex] = {
      ...videos[vIndex],
      title: updatedVideo.title || videos[vIndex].title,
      url: updatedVideo.url || videos[vIndex].url,
      duration: updatedVideo.duration || videos[vIndex].duration || '15:00',
      description: updatedVideo.description !== undefined ? updatedVideo.description : videos[vIndex].description,
      fileName: updatedVideo.fileName !== undefined ? updatedVideo.fileName : (videos[vIndex].fileName || ''),
      fileSize: updatedVideo.fileSize !== undefined ? updatedVideo.fileSize : (videos[vIndex].fileSize || '')
    };

    await lmsService.updateLesson(lessonId, { videos });
    return videos[vIndex];
  },

  deleteVideoFromLesson: async (lessonId, videoId) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const filtered = (lesson.videos || []).filter((v) => v.id !== videoId);
    await lmsService.updateLesson(lessonId, { videos: filtered });
    return true;
  },

  addQuizToLesson: async (lessonId, quiz) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title: quiz.title,
      timeLimitMinutes: Number(quiz.timeLimitMinutes) || 10,
      passingScore: Number(quiz.passingScore) || 70,
      questions: quiz.questions || []
    };

    const updatedQuizzes = [...(lesson.quizzes || []), newQuiz];
    await lmsService.updateLesson(lessonId, { quizzes: updatedQuizzes });
    return newQuiz;
  },

  updateQuizInLesson: async (lessonId, quizId, updatedQuiz) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const quizzes = [...(lesson.quizzes || [])];
    const qIndex = quizzes.findIndex((q) => q.id === quizId);
    if (qIndex === -1) throw new Error('Quiz not found');

    quizzes[qIndex] = {
      ...quizzes[qIndex],
      title: updatedQuiz.title || quizzes[qIndex].title,
      timeLimitMinutes: Number(updatedQuiz.timeLimitMinutes) || quizzes[qIndex].timeLimitMinutes || 10,
      passingScore: Number(updatedQuiz.passingScore) || quizzes[qIndex].passingScore || 70,
      questions: updatedQuiz.questions || quizzes[qIndex].questions || []
    };

    await lmsService.updateLesson(lessonId, { quizzes });
    return quizzes[qIndex];
  },

  deleteQuizFromLesson: async (lessonId, quizId) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const filtered = (lesson.quizzes || []).filter((q) => q.id !== quizId);
    await lmsService.updateLesson(lessonId, { quizzes: filtered });
    return true;
  },

  addNoteToLesson: async (lessonId, note) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const newNote = {
      id: `note-${Date.now()}`,
      title: note.title,
      content: note.content || '',
      fileName: note.fileName || 'Lecture_Notes.pdf',
      fileSize: note.fileSize || '1.2 MB',
      pdfUrl: note.pdfUrl || ''
    };

    const updatedNotes = [...(lesson.notes || []), newNote];
    await lmsService.updateLesson(lessonId, { notes: updatedNotes });
    return newNote;
  },

  updateNoteInLesson: async (lessonId, noteId, updatedNote) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const notes = [...(lesson.notes || [])];
    const nIndex = notes.findIndex((n) => n.id === noteId);
    if (nIndex === -1) throw new Error('Note not found');

    notes[nIndex] = {
      ...notes[nIndex],
      title: updatedNote.title || notes[nIndex].title,
      content: updatedNote.content !== undefined ? updatedNote.content : notes[nIndex].content,
      fileName: updatedNote.fileName || notes[nIndex].fileName || 'Lecture_Notes.pdf',
      fileSize: updatedNote.fileSize || notes[nIndex].fileSize || '1.2 MB',
      pdfUrl: updatedNote.pdfUrl !== undefined ? updatedNote.pdfUrl : (notes[nIndex].pdfUrl || '')
    };

    await lmsService.updateLesson(lessonId, { notes });
    return notes[nIndex];
  },

  deleteNoteFromLesson: async (lessonId, noteId) => {
    const lesson = await lmsService.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const filtered = (lesson.notes || []).filter((n) => n.id !== noteId);
    await lmsService.updateLesson(lessonId, { notes: filtered });
    return true;
  },

  // ================= STUDENT ACCESS & ENROLLMENT CONTROL =================
  isStudentEnrolled: (studentId, classId) => {
    if (!studentId || !classId) return false;
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const student = users.find((u) => u.id === studentId);
    if (!student) return false;
    if (student.role === 'teacher') return true;
    return Array.isArray(student.enrolledClassIds) && student.enrolledClassIds.includes(classId);
  },

  enrollStudentInClass: async (studentId, classId, paymentDetails = {}) => {
    let student = null;
    let classObj = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const [studentRes, classRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', studentId).maybeSingle(),
          supabase.from('classes').select('*').eq('id', classId).maybeSingle()
        ]);

        if (studentRes.data) student = mapUserFromDb(studentRes.data);
        if (classRes.data) classObj = mapClassFromDb(classRes.data);
      } catch (err) {
        console.warn('Supabase fetch for enrollment warning:', err);
      }
    }

    if (!student) {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      student = users.find((u) => u.id === studentId);
    }
    if (!student) throw new Error('Student not found');

    if (!classObj) {
      const classes = storage.get(STORAGE_KEYS.CLASSES, []);
      classObj = classes.find((c) => c.id === classId);
    }
    if (!classObj) throw new Error('Class not found');

    const enrolledList = student.enrolledClassIds || [];
    if (!enrolledList.includes(classId)) {
      enrolledList.push(classId);
    }
    student.enrolledClassIds = enrolledList;

    // Create payment / invoice record
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      classId: classObj.id,
      className: classObj.title,
      amount: classObj.fee || 0,
      currencySymbol: 'Rs.',
      currency: 'Rs.',
      date: new Date().toISOString().split('T')[0],
      method: paymentDetails.method || (classObj.fee > 0 ? 'Card Online' : 'Scholarship / Free'),
      status: 'Completed',
      transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await Promise.all([
          supabase
            .from('users')
            .update({ enrolled_class_ids: enrolledList })
            .eq('id', studentId),
          supabase
            .from('payments')
            .insert(mapPaymentToDb(newPayment))
        ]);
      } catch (err) {
        console.error('Supabase enrollment error:', err);
      }
    }

    // Sync LocalStorage
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const studentIndex = users.findIndex((u) => u.id === studentId);
    if (studentIndex !== -1) {
      users[studentIndex] = student;
      storage.set(STORAGE_KEYS.USERS, users);
    }

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === studentId) {
      storage.set(STORAGE_KEYS.CURRENT_USER, student);
    }

    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    payments.unshift(newPayment);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);

    return { success: true, payment: newPayment };
  },

  getStudentEnrolledClasses: async (studentId) => {
    const classes = await lmsService.getClasses();
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const student = users.find((u) => u.id === studentId);
    if (!student) return [];
    const enrolledIds = student.enrolledClassIds || [];
    return classes.filter((c) => enrolledIds.includes(c.id));
  },

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

    return !exists;
  },

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
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase getStudentPayments error:', error);
        } else if (data) {
          return data.map(mapPaymentFromDb);
        }
      } catch (err) {
        console.warn('Supabase getStudentPayments failed, using storage cache:', err);
      }
    }
    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    return payments.filter((p) => p.studentId === studentId);
  },

  getAllPayments: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase getAllPayments error:', error);
        } else if (data) {
          const mapped = data.map(mapPaymentFromDb);
          storage.set(STORAGE_KEYS.PAYMENTS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getAllPayments failed, using storage cache:', err);
      }
    }
    return storage.get(STORAGE_KEYS.PAYMENTS, []);
  },

  updatePaymentStatus: async (paymentId, newStatus, notes = '') => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('payments')
          .update({
            status: newStatus,
            notes: notes || null
          })
          .eq('id', paymentId);

        if (error) {
          console.error('Supabase updatePaymentStatus error:', error);
          throw new Error(error.message || 'Failed to update payment in database');
        }
      } catch (err) {
        console.error('Error updating payment in Supabase:', err);
        throw err;
      }
    }

    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const pIndex = payments.findIndex((p) => p.id === paymentId);
    if (pIndex !== -1) {
      const payment = payments[pIndex];
      payment.status = newStatus;
      if (notes) payment.adminNotes = notes;
      payment.updatedAt = new Date().toLocaleString();

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

      payments[pIndex] = payment;
      storage.set(STORAGE_KEYS.PAYMENTS, payments);
      return payment;
    }
    return null;
  },

  recordManualPayment: async (data) => {
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      classId: data.classId,
      className: data.className,
      amount: Number(data.amount) || 0,
      currencySymbol: data.currencySymbol || 'Rs.',
      currency: data.currencySymbol || 'Rs.',
      date: data.date || new Date().toISOString().split('T')[0],
      method: data.method || 'Manual / Cash',
      status: data.status || 'Completed',
      adminNotes: data.adminNotes || '',
      transactionId: data.transactionId || `TXN-MANUAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('payments')
          .insert(mapPaymentToDb(newPayment));

        if (error) {
          console.error('Supabase recordManualPayment error:', error);
          throw new Error(error.message || 'Failed to save transaction in database');
        }

        // If Completed, enroll student in Supabase
        if (newPayment.status === 'Completed' && newPayment.studentId && newPayment.classId) {
          const { data: stdData } = await supabase
            .from('users')
            .select('enrolled_class_ids')
            .eq('id', newPayment.studentId)
            .maybeSingle();

          if (stdData) {
            const currentEnrolled = Array.isArray(stdData.enrolled_class_ids) ? stdData.enrolled_class_ids : [];
            if (!currentEnrolled.includes(newPayment.classId)) {
              currentEnrolled.push(newPayment.classId);
              await supabase
                .from('users')
                .update({ enrolled_class_ids: currentEnrolled })
                .eq('id', newPayment.studentId);
            }
          }
        }
      } catch (err) {
        console.error('Error inserting manual payment in Supabase:', err);
        throw err;
      }
    }

    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    payments.unshift(newPayment);
    storage.set(STORAGE_KEYS.PAYMENTS, payments);

    // Also sync student locally
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

    return newPayment;
  },

  deletePayment: async (paymentId) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', paymentId);

        if (error) {
          console.error('Supabase deletePayment error:', error);
          throw new Error(error.message || 'Failed to delete payment from database');
        }
      } catch (err) {
        console.error('Error deleting payment in Supabase:', err);
        throw err;
      }
    }

    const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
    const filtered = payments.filter((p) => p.id !== paymentId);
    storage.set(STORAGE_KEYS.PAYMENTS, filtered);
    return true;
  },

  // Record quiz completion
  submitQuizAttempt: async (studentId, quizId, classId, score, passed) => {
    const newAttempt = {
      id: `att-${Date.now()}`,
      studentId,
      quizId,
      classId,
      score,
      passed,
      date: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('quiz_attempts').insert({
          id: newAttempt.id,
          student_id: studentId,
          quiz_id: quizId,
          class_id: classId,
          score,
          passed,
          attempt_date: newAttempt.date
        });
      } catch (err) {
        console.warn('Supabase submitQuizAttempt error:', err);
      }
    }

    const attempts = storage.get(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
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

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase
            .from('users')
            .update({ completed_lesson_ids: student.completedLessonIds })
            .eq('id', studentId);
        } catch (err) {
          console.warn('Supabase markLessonCompleted error:', err);
        }
      }

      const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (currentUser && currentUser.id === studentId) {
        storage.set(STORAGE_KEYS.CURRENT_USER, student);
      }
    }
  },

  // ================= USERS MANAGEMENT (FOR ADMIN) =================
  getAllStudents: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase getAllStudents error:', error);
        } else if (data) {
          return data.map(mapUserFromDb);
        }
      } catch (err) {
        console.warn('Supabase getAllStudents failed, using storage cache:', err);
      }
    }
    const users = storage.get(STORAGE_KEYS.USERS, []);
    return users.filter((u) => u.role === 'student');
  },

  // ================= TEACHERS / FACULTY MANAGEMENT =================
  getAllTeachers: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'teacher')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase getAllTeachers error:', error);
        } else if (data) {
          const mapped = data.map(mapUserFromDb);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getAllTeachers failed, using storage cache:', err);
      }
    }
    const users = storage.get(STORAGE_KEYS.USERS, []);
    return users.filter((u) => u.role === 'teacher');
  },

  createTeacher: async (teacherData) => {
    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name: teacherData.name.trim(),
      email: teacherData.email.trim().toLowerCase(),
      password: teacherData.password || 'teacher123',
      role: 'teacher',
      title: teacherData.title ? teacherData.title.trim() : 'Faculty Instructor',
      phone: teacherData.phone ? teacherData.phone.trim() : '',
      bio: teacherData.bio ? teacherData.bio.trim() : '',
      avatar: teacherData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      grade: 'Faculty',
      joinedDate: new Date().toISOString().split('T')[0],
      enrolledClassIds: [],
      completedLessonIds: []
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = mapUserToDb(newTeacher);
        let { error } = await supabase.from('users').insert(dbPayload);

        // If bio column does not exist on remote db, retry without bio
        if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('bio')))) {
          const { bio, ...safePayload } = dbPayload;
          const retry = await supabase.from('users').insert(safePayload);
          error = retry.error;
        }

        if (error) {
          console.error('Supabase createTeacher error:', error);
          throw new Error(error.message || 'Failed to create teacher account in database');
        }
      } catch (err) {
        console.error('Error inserting teacher in Supabase:', err);
        throw err;
      }
    }

    const users = storage.get(STORAGE_KEYS.USERS, []);
    users.push(newTeacher);
    storage.set(STORAGE_KEYS.USERS, users);
    return newTeacher;
  },

  updateTeacher: async (id, data) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {};
        if (data.name !== undefined) dbPayload.name = data.name.trim();
        if (data.email !== undefined) dbPayload.email = data.email.trim().toLowerCase();
        if (data.password !== undefined && data.password) dbPayload.password = data.password;
        if (data.title !== undefined) dbPayload.title = data.title.trim();
        if (data.phone !== undefined) dbPayload.phone = data.phone.trim();
        if (data.avatar !== undefined) dbPayload.avatar = data.avatar.trim();
        if (data.bio !== undefined) dbPayload.bio = data.bio.trim();

        let { error } = await supabase
          .from('users')
          .update(dbPayload)
          .eq('id', id);

        if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('bio')))) {
          const { bio, ...safePayload } = dbPayload;
          const retry = await supabase
            .from('users')
            .update(safePayload)
            .eq('id', id);
          error = retry.error;
        }

        if (error) {
          console.error('Supabase updateTeacher error:', error);
          throw new Error(error.message || 'Failed to update teacher in database');
        }
      } catch (err) {
        console.error('Error updating teacher in Supabase:', err);
        throw err;
      }
    }

    const users = storage.get(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      storage.set(STORAGE_KEYS.USERS, users);

      const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (currentUser && currentUser.id === id) {
        storage.set(STORAGE_KEYS.CURRENT_USER, users[index]);
      }
      return users[index];
    }
    return { id, ...data };
  },

  deleteTeacher: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase deleteTeacher error:', error);
          throw new Error(error.message || 'Failed to delete teacher from database');
        }
      } catch (err) {
        console.error('Error deleting teacher in Supabase:', err);
        throw err;
      }
    }

    const users = storage.get(STORAGE_KEYS.USERS, []);
    const filtered = users.filter((u) => u.id !== id);
    storage.set(STORAGE_KEYS.USERS, filtered);
    return true;
  },

  // ================= DATA EXPORT & IMPORT =================
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

  importDatabaseJSON: async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) await lmsService.updateSettings(data.settings);

      if (Array.isArray(data.subjects)) {
        for (const s of data.subjects) {
          await lmsService.createSubject(s);
        }
      }
      if (Array.isArray(data.grades)) {
        for (const g of data.grades) {
          await lmsService.createGrade(g);
        }
      }
      if (Array.isArray(data.classes)) {
        for (const c of data.classes) {
          await lmsService.createClass(c);
        }
      }
      if (Array.isArray(data.lessons)) {
        for (const l of data.lessons) {
          await lmsService.createLesson(l.classId, l);
        }
      }
      return { success: true };
    } catch (e) {
      throw new Error('Invalid JSON format: ' + e.message);
    }
  }
};
