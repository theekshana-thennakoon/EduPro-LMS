import { storage, STORAGE_KEYS, initializeStorage } from './storageService';

// Ensure storage is initialized
initializeStorage();

export const authService = {
  // Get currently authenticated user from session
  getCurrentUser: () => {
    return storage.get(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Save current active session
  setCurrentUser: (user) => {
    if (user) {
      storage.set(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      storage.remove(STORAGE_KEYS.CURRENT_USER);
    }
    return user;
  },

  // Authenticate user with email and password
  login: async (email, password, roleHint = null) => {
    // Simulated network delay for realistic async server feel
    await new Promise((res) => setTimeout(res, 300));
    
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password. Please try again.');
    }

    if (roleHint && user.role !== roleHint) {
      throw new Error(`This account is registered as a ${user.role}, not a ${roleHint}.`);
    }

    storage.set(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  // Register a new student
  registerStudent: async ({ name, email, password, grade, targetClassId = null }) => {
    await new Promise((res) => setTimeout(res, 350));
    
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: 'student',
      grade: grade || 'General',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      enrolledClassIds: targetClassId ? [targetClassId] : [],
      watchLaterVideoIds: [],
      completedLessonIds: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    users.push(newStudent);
    storage.set(STORAGE_KEYS.USERS, users);
    storage.set(STORAGE_KEYS.CURRENT_USER, newStudent);

    // If student registered directly for a specific class, register initial payment if free or record enrollment
    if (targetClassId) {
      const classes = storage.get(STORAGE_KEYS.CLASSES, []);
      const enrolledClass = classes.find((c) => c.id === targetClassId);
      if (enrolledClass) {
        const payments = storage.get(STORAGE_KEYS.PAYMENTS, []);
        payments.push({
          id: `PAY-${Date.now()}`,
          studentId: newStudent.id,
          studentName: newStudent.name,
          studentEmail: newStudent.email,
          classId: enrolledClass.id,
          className: enrolledClass.title,
          amount: enrolledClass.fee || 0,
          currencySymbol: '$',
          date: new Date().toLocaleString(),
          method: enrolledClass.fee > 0 ? 'Online Card' : 'Free Registration',
          status: 'Completed',
          transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
        });
        storage.set(STORAGE_KEYS.PAYMENTS, payments);
      }
    }

    return newStudent;
  },

  // Google OAuth Mock Authentication
  loginWithGoogle: async (role = 'student', targetClassId = null) => {
    await new Promise((res) => setTimeout(res, 500));
    
    // Simulate user choosing Google account
    const googleProfile = {
      name: 'Alex Johnson',
      email: 'alex.johnson.edu@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };

    const users = storage.get(STORAGE_KEYS.USERS, []);
    let user = users.find((u) => u.email.toLowerCase() === googleProfile.email.toLowerCase());

    if (!user) {
      user = {
        id: `google-${Date.now()}`,
        name: googleProfile.name,
        email: googleProfile.email,
        password: 'google_oauth_token',
        role: role,
        grade: 'College / Adult',
        avatar: googleProfile.avatar,
        enrolledClassIds: targetClassId ? [targetClassId] : ['class-1'], // Seed with class 1 for quick testing
        watchLaterVideoIds: [],
        completedLessonIds: [],
        isGoogleAuth: true,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      users.push(user);
      storage.set(STORAGE_KEYS.USERS, users);
    }

    storage.set(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  // Update profile
  updateProfile: async (userId, updatedFields) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updatedFields };
    storage.set(STORAGE_KEYS.USERS, users);

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === userId) {
      storage.set(STORAGE_KEYS.CURRENT_USER, users[index]);
    }
    return users[index];
  },

  // Sign out
  logout: () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  }
};
