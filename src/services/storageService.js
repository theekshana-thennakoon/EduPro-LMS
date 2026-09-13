// Local Storage Database Service with realistic initial seed
const STORAGE_KEYS = {
  SETTINGS: 'lms_site_settings',
  SUBJECTS: 'lms_subjects',
  GRADES: 'lms_grades',
  CLASSES: 'lms_classes',
  LESSONS: 'lms_lessons',
  USERS: 'lms_users',
  PAYMENTS: 'lms_payments',
  QUIZ_ATTEMPTS: 'lms_quiz_attempts',
  CURRENT_USER: 'lms_current_user_session',
  THEME: 'lms_ui_theme'
};

const INITIAL_SETTINGS = {
  siteName: 'EduPro Academy',
  instituteTitle: 'Global Online Institute of Excellence',
  tagline: 'Empowering future leaders through world-class online education',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
  supportEmail: 'director@eduproacademy.org',
  supportPhone: '+1 (800) 420-5678',
  address: '450 Innovation Parkway, Suite 300, Silicon Valley, CA',
  currency: 'LKR / INR (Rs.)',
  currencySymbol: 'Rs.',
  accentColor: '#6366f1',
  allowSelfRegistration: true,
  themeMode: 'light',
  paymentGateway: {
    provider: 'Stripe Secure Pay',
    testMode: true,
    publishableKey: 'pk_test_51LmsEduDemoSampleKey998877',
    bankTransferInstructions: 'Bank: Silicon Horizon Bank | Account: 8840-2910-4491 | Swift: SHBKUS33'
  },
  emailConfig: {
    provider: 'web3forms',
    web3formsKey: '9d782c6a-1917-4c4e-970c-aa473f2ee202',
    resendApiKey: '',
    fromEmail: '',
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: ''
  }
};

const INITIAL_GRADES = [];

const INITIAL_SUBJECTS = [];

const INITIAL_CLASSES = [];

const INITIAL_LESSONS = [];

const INITIAL_USERS = [
  // Teacher / Admin Account
  {
    id: 'teacher-1',
    name: 'Prof. Alexander Wright',
    email: 'admin@lms.com',
    password: 'admin',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    title: 'Lead Academic Director & Master Instructor',
    phone: '+1 (555) 012-3456',
    bio: 'Ph.D. in Applied Sciences with 14+ years of university lecturing and online instructional experience.',
    joinedDate: '2025-01-10'
  }
];

const INITIAL_PAYMENTS = [];

const INITIAL_QUIZ_ATTEMPTS = [];

// Helper functions for LocalStorage
export const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
    }
  }
};

// Clear all demo data while strictly keeping Admin Teacher profile and settings
export const clearAllDemoData = () => {
  const users = storage.get(STORAGE_KEYS.USERS, []);
  const teachersOnly = users.filter((u) => u.role === 'teacher');
  const safeTeachers = teachersOnly.length > 0 ? teachersOnly : INITIAL_USERS;

  storage.set(STORAGE_KEYS.USERS, safeTeachers);
  storage.set(STORAGE_KEYS.CLASSES, []);
  storage.set(STORAGE_KEYS.LESSONS, []);
  storage.set(STORAGE_KEYS.PAYMENTS, []);
  storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  storage.set(STORAGE_KEYS.SUBJECTS, []);
  storage.set(STORAGE_KEYS.GRADES, []);
};

// Database Initialization & Clean Data Verification
export const initializeStorage = () => {
  const currentSettings = storage.get(STORAGE_KEYS.SETTINGS, null);
  if (!currentSettings) {
    storage.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  } else if (!currentSettings.currencySymbol || currentSettings.currencySymbol === '$') {
    currentSettings.currencySymbol = 'Rs.';
    storage.set(STORAGE_KEYS.SETTINGS, currentSettings);
  }

  // Ensure Admin Teacher always exists
  const existingUsers = storage.get(STORAGE_KEYS.USERS, null);
  if (!existingUsers || existingUsers.length === 0) {
    storage.set(STORAGE_KEYS.USERS, INITIAL_USERS);
  } else {
    const hasAdmin = existingUsers.some((u) => u.role === 'teacher');
    if (!hasAdmin) {
      storage.set(STORAGE_KEYS.USERS, [...INITIAL_USERS, ...existingUsers]);
    }
  }

  // Initialize empty data stores if not present
  if (localStorage.getItem(STORAGE_KEYS.SUBJECTS) === null) {
    storage.set(STORAGE_KEYS.SUBJECTS, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.GRADES) === null) {
    storage.set(STORAGE_KEYS.GRADES, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.CLASSES) === null) {
    storage.set(STORAGE_KEYS.CLASSES, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.LESSONS) === null) {
    storage.set(STORAGE_KEYS.LESSONS, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.PAYMENTS) === null) {
    storage.set(STORAGE_KEYS.PAYMENTS, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS) === null) {
    storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  }
};

export { STORAGE_KEYS };
