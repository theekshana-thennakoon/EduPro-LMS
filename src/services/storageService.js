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
  }
};

const INITIAL_GRADES = [
  {
    id: 'grade-10',
    name: 'Grade 10',
    code: 'G10',
    level: 10,
    description: 'Foundational secondary school curriculum, high school preparation and core science/math foundations.',
    color: '#06b6d4',
    createdAt: '2026-08-01'
  },
  {
    id: 'grade-11',
    name: 'Grade 11',
    code: 'G11',
    level: 11,
    description: 'Intermediate pre-university studies with focus on advanced calculus, mechanics, and chemistry.',
    color: '#3b82f6',
    createdAt: '2026-08-01'
  },
  {
    id: 'grade-12',
    name: 'Grade 12 / AP',
    code: 'G12-AP',
    level: 12,
    description: 'Advanced Placement (AP), A/L, and senior secondary university entrance preparation.',
    color: '#8b5cf6',
    createdAt: '2026-08-01'
  },
  {
    id: 'grade-ug',
    name: 'Undergrad & Pro',
    code: 'UG-PRO',
    level: 13,
    description: 'Undergraduate degrees, higher diploma, professional engineering, and software development masterclasses.',
    color: '#10b981',
    createdAt: '2026-08-01'
  }
];

const INITIAL_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Advanced Mathematics',
    code: 'MATH101',
    description: 'Master differential calculus, advanced geometry, trigonometry, and statistical theory.',
    icon: '📐',
    color: '#3b82f6',
    createdAt: '2026-08-01'
  },
  {
    id: 'subj-2',
    name: 'Computer Science & Software',
    code: 'CS102',
    description: 'Modern full-stack web development, data structures, algorithms, and system design.',
    icon: '💻',
    color: '#10b981',
    createdAt: '2026-08-01'
  },
  {
    id: 'subj-3',
    name: 'Applied Physics & Mechanics',
    code: 'PHYS103',
    description: 'Newtonian mechanics, electrodynamics, optics, thermodynamics, and quantum fundamentals.',
    icon: '⚡',
    color: '#f59e0b',
    createdAt: '2026-08-01'
  },
  {
    id: 'subj-4',
    name: 'Chemistry & Molecular Science',
    code: 'CHEM104',
    description: 'Organic chemistry, reaction kinetics, molecular orbital theory, and bio-chemistry.',
    icon: '🧪',
    color: '#ec4899',
    createdAt: '2026-08-01'
  }
];

const INITIAL_CLASSES = [
  {
    id: 'class-1',
    subjectId: 'subj-1',
    title: 'Grade 11 - Pure Mathematics & Calculus',
    grade: 'Grade 11',
    instructor: 'Prof. Alexander Wright',
    fee: 45,
    description: 'Rigorous course covering limits, derivative theorems, integral calculus, and real-world mathematical modeling.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    schedule: 'Mon & Wed • 5:00 PM - 6:30 PM (EST)',
    capacity: 150,
    status: 'active',
    createdAt: '2026-08-10'
  },
  {
    id: 'class-2',
    subjectId: 'subj-2',
    title: 'Full-Stack React & Node.js Masterclass',
    grade: 'Undergrad & Pro',
    instructor: 'Prof. Alexander Wright',
    fee: 65,
    description: 'From zero to production: React 18, state management, REST APIs, database integration, and cloud deployment.',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80',
    schedule: 'Tue & Thu • 6:00 PM - 8:00 PM (EST)',
    capacity: 200,
    status: 'active',
    createdAt: '2026-08-12'
  },
  {
    id: 'class-3',
    subjectId: 'subj-3',
    title: 'AP Physics C: Mechanics & Motion',
    grade: 'Grade 12 / AP',
    instructor: 'Prof. Alexander Wright',
    fee: 50,
    description: 'In-depth exploration of rotational dynamics, gravitation, linear momentum, and harmonic oscillators.',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
    schedule: 'Saturdays • 10:00 AM - 1:00 PM (EST)',
    capacity: 120,
    status: 'active',
    createdAt: '2026-08-14'
  }
];

const INITIAL_LESSONS = [
  // Class 1 Lessons
  {
    id: 'les-101',
    classId: 'class-1',
    title: 'Lesson 1: Limits & Continuity Foundations',
    description: 'Understanding the formal epsilon-delta definition of limits and algebraic limit theorems.',
    order: 1,
    duration: '45 mins',
    videos: [
      {
        id: 'vid-101-1',
        title: 'Core Lecture: The Intuition of Limits & Tangent Lines',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '18:24',
        description: 'Visual breakdown of infinitesimal intervals and limit behavior approaching infinity.'
      },
      {
        id: 'vid-101-2',
        title: 'Problem Solving Workshop: Indeterminate Forms (0/0)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: '14:50',
        description: 'Step-by-step factorization and conjugate multiplication techniques.'
      }
    ],
    quizzes: [
      {
        id: 'quiz-101',
        title: 'Calculus Checkpoint: Limits & Continuity',
        timeLimitMinutes: 10,
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            question: 'What is the limit of (x^2 - 4) / (x - 2) as x approaches 2?',
            options: ['0', '2', '4', 'Does not exist'],
            correctIndex: 2,
            explanation: 'Factoring (x-2)(x+2)/(x-2) yields (x+2). As x -> 2, 2 + 2 = 4.'
          },
          {
            id: 'q2',
            question: 'Which of the following guarantees that a function is continuous at x = c?',
            options: [
              'f(c) is defined only',
              'The limit exists only',
              'f(c) is defined, the limit exists, and lim x->c f(x) = f(c)',
              'The derivative f\'(c) is negative'
            ],
            correctIndex: 2,
            explanation: 'The three formal conditions for continuity are: f(c) exists, limit exists, and they are equal.'
          },
          {
            id: 'q3',
            question: 'What is lim x->0 of (sin x) / x in radians?',
            options: ['0', '1', 'Infinity', 'Undefined'],
            correctIndex: 1,
            explanation: 'By the squeeze theorem and fundamental trigonometric limits, lim(sin x / x) = 1.'
          }
        ]
      }
    ],
    notes: [
      {
        id: 'note-101',
        title: 'Comprehensive Lecture Notes: Limits & Continuity',
        content: `### Differential Calculus: Chapter 1 Foundations\n\n**Key Concepts:**\n- Definition of a Limit: Let f(x) be defined on an open interval containing c (except possibly at c).\n- **Algebraic Limit Rules:**\n  1. Sum/Difference: lim [f(x) ± g(x)] = lim f(x) ± lim g(x)\n  2. Product: lim [f(x) * g(x)] = lim f(x) * lim g(x)\n  3. Quotient: lim [f(x) / g(x)] = lim f(x) / lim g(x) (provided denom ≠ 0)\n\n**Squeeze Theorem:** If g(x) ≤ f(x) ≤ h(x) near c and lim g(x) = lim h(x) = L, then lim f(x) = L.`,
        fileName: 'Calculus_Ch1_Limits_Summary.pdf',
        fileSize: '1.4 MB'
      }
    ]
  },
  {
    id: 'les-102',
    classId: 'class-1',
    title: 'Lesson 2: Derivatives & Power Rule Applications',
    description: 'The rate of change, geometric meaning of slope, and calculating derivatives algebraically.',
    order: 2,
    duration: '55 mins',
    videos: [
      {
        id: 'vid-102-1',
        title: 'Deriving the Derivative from First Principles',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '22:15',
        description: 'Using the difference quotient [f(x+h) - f(x)] / h as h tends to zero.'
      }
    ],
    quizzes: [
      {
        id: 'quiz-102',
        title: 'Derivative Rules Master Quiz',
        timeLimitMinutes: 8,
        passingScore: 60,
        questions: [
          {
            id: 'q2-1',
            question: 'What is the derivative of f(x) = 3x^4 - 5x^2 + 7?',
            options: ['12x^3 - 10x', '7x^3 - 10x', '12x^4 - 10x', '12x^3 - 5x + 7'],
            correctIndex: 0,
            explanation: 'Apply power rule: d/dx(3x^4) = 12x^3, d/dx(-5x^2) = -10x, and d/dx(7) = 0.'
          }
        ]
      }
    ],
    notes: [
      {
        id: 'note-102',
        title: 'Power, Product & Quotient Rules Handout',
        content: `### Differentiation Rules Quick Reference\n\n- **Power Rule:** d/dx (x^n) = n * x^(n-1)\n- **Product Rule:** (fg)' = f'g + fg'\n- **Quotient Rule:** (f/g)' = (f'g - fg') / g^2\n- **Chain Rule:** (f(g(x)))' = f'(g(x)) * g'(x)`,
        fileName: 'Derivatives_Formula_CheatSheet.pdf',
        fileSize: '840 KB'
      }
    ]
  },

  // Class 2 Lessons
  {
    id: 'les-201',
    classId: 'class-2',
    title: 'Lesson 1: React 18 Architecture & Virtual DOM',
    description: 'Deep dive into concurrent React, fiber reconciliation, and JSX compilation.',
    order: 1,
    duration: '60 mins',
    videos: [
      {
        id: 'vid-201-1',
        title: 'Virtual DOM & React Fiber Internals',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '24:40',
        description: 'How React reconciles UI trees efficiently without manual DOM manipulation.'
      },
      {
        id: 'vid-201-2',
        title: 'Building Modern UI Components with Hooks',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        duration: '20:10',
        description: 'Clean state management with useState, useEffect, and custom hook composition.'
      }
    ],
    quizzes: [
      {
        id: 'quiz-201',
        title: 'React Fundamentals Assessment',
        timeLimitMinutes: 10,
        passingScore: 70,
        questions: [
          {
            id: 'rq1',
            question: 'Why does React require keys when rendering lists of items?',
            options: [
              'To make the code look clean',
              'To help React identify which items have changed, added, or removed',
              'Keys are only used for CSS styling',
              'React throws a compile error without keys'
            ],
            correctIndex: 1,
            explanation: 'Keys give identity to list elements so reconciliation can preserve or reuse DOM nodes.'
          },
          {
            id: 'rq2',
            question: 'What is the purpose of the dependency array in useEffect?',
            options: [
              'It lists all variables used in JSX',
              'It controls when the effect re-runs based on changed values',
              'It triggers garbage collection in the browser',
              'It binds class methods to the component instance'
            ],
            correctIndex: 1,
            explanation: 'If dependencies in the array do not change between renders, React skips re-running the effect.'
          }
        ]
      }
    ],
    notes: [
      {
        id: 'note-201',
        title: 'React Hooks Complete Architecture Guide',
        content: `### React 18 & Modern Component Guidelines\n\n1. **Unidirectional Data Flow:** State flows downward through props.\n2. **Pure Functions:** Components must not mutate props or global state directly.\n3. **Hooks Rules:** Always call hooks at the top level of your component function.`,
        fileName: 'React18_State_Architecture.pdf',
        fileSize: '2.1 MB'
      }
    ]
  },

  // Class 3 Lessons
  {
    id: 'les-301',
    classId: 'class-3',
    title: 'Lesson 1: Newton\'s Laws & Vector Kinematics',
    description: 'Motion in two dimensions, projectile equations, and free-body diagram analysis.',
    order: 1,
    duration: '50 mins',
    videos: [
      {
        id: 'vid-301-1',
        title: 'Vector Calculus in Kinematics',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        duration: '28:10',
        description: 'Integrating acceleration vectors to solve trajectory and velocity.'
      }
    ],
    quizzes: [
      {
        id: 'quiz-301',
        title: 'Mechanics & Friction Assessment',
        timeLimitMinutes: 10,
        passingScore: 70,
        questions: [
          {
            id: 'pq1',
            question: 'At what launch angle (ignoring air resistance) is projectile horizontal range maximized?',
            options: ['30 degrees', '45 degrees', '60 degrees', '90 degrees'],
            correctIndex: 1,
            explanation: 'Range equation R = (v^2 * sin(2*theta)) / g reaches maximum when sin(2*theta) = 1, i.e., theta = 45°.'
          }
        ]
      }
    ],
    notes: [
      {
        id: 'note-301',
        title: 'AP Physics C Formula Booklet',
        content: `### Kinematics and Dynamics Equations\n\n- v = v0 + at\n- x = x0 + v0*t + 0.5*a*t^2\n- v^2 = v0^2 + 2a(x - x0)\n- Net Force: ΣF = m*a = dp/dt`,
        fileName: 'AP_Physics_C_Equations.pdf',
        fileSize: '950 KB'
      }
    ]
  }
];

const INITIAL_USERS = [
  // Teacher / Admin
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
  },
  // Student 1 (Enrolled in Class 1)
  {
    id: 'student-1',
    name: 'Sarah Jenkins',
    email: 'student@lms.com',
    password: 'password',
    role: 'student',
    grade: 'Grade 11',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    enrolledClassIds: ['class-1'],
    watchLaterVideoIds: ['vid-101-1'],
    completedLessonIds: ['les-101'],
    joinedDate: '2026-08-15'
  },
  // Student 2 (Enrolled in Class 2)
  {
    id: 'student-2',
    name: 'Liam Chen',
    email: 'liam@student.com',
    password: 'password',
    role: 'student',
    grade: 'Undergrad',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    enrolledClassIds: ['class-2'],
    watchLaterVideoIds: ['vid-201-1'],
    completedLessonIds: [],
    joinedDate: '2026-08-20'
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-90412',
    studentId: 'student-1',
    studentName: 'Sarah Jenkins',
    studentEmail: 'student@lms.com',
    classId: 'class-1',
    className: 'Grade 11 - Pure Mathematics & Calculus',
    amount: 45,
    currencySymbol: 'Rs.',
    date: '2026-08-15 14:32',
    method: 'Credit / Debit Card (Stripe)',
    status: 'Completed',
    transactionId: 'TXN-98214-STRP',
    invoiceNumber: 'INV-2026-0081'
  },
  {
    id: 'PAY-90413',
    studentId: 'student-2',
    studentName: 'Liam Chen',
    studentEmail: 'liam@student.com',
    classId: 'class-2',
    className: 'Full-Stack React & Node.js Masterclass',
    amount: 65,
    currencySymbol: 'Rs.',
    date: '2026-08-20 09:15',
    method: 'Google Pay',
    status: 'Completed',
    transactionId: 'TXN-65123-GPAY',
    invoiceNumber: 'INV-2026-0082'
  }
];

const INITIAL_QUIZ_ATTEMPTS = [
  {
    id: 'att-1',
    studentId: 'student-1',
    quizId: 'quiz-101',
    classId: 'class-1',
    score: 100,
    passed: true,
    date: '2026-08-16 16:40'
  }
];

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

// Database Initialization & Seed Check
export const initializeStorage = () => {
  const currentSettings = storage.get(STORAGE_KEYS.SETTINGS, null);
  if (!currentSettings) {
    storage.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  } else if (!currentSettings.currencySymbol || currentSettings.currencySymbol === '$') {
    currentSettings.currencySymbol = 'Rs.';
    storage.set(STORAGE_KEYS.SETTINGS, currentSettings);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    storage.set(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
    storage.set(STORAGE_KEYS.GRADES, INITIAL_GRADES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    storage.set(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
    storage.set(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    storage.set(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    storage.set(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS)) {
    storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, INITIAL_QUIZ_ATTEMPTS);
  }
};

export { STORAGE_KEYS };
