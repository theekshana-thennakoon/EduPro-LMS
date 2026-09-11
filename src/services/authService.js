import { storage, STORAGE_KEYS, initializeStorage } from './storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { emailService } from './emailService';

// Ensure storage is initialized
initializeStorage();

// Helper to map DB snake_case user to frontend camelCase
export const mapUserFromDb = (db) => {
  if (!db) return null;
  return {
    id: db.id,
    name: db.name || '',
    email: db.email || '',
    password: db.password || '',
    role: db.role || 'student',
    avatar: db.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    title: db.title || '',
    phone: db.phone || '',
    bio: db.bio || '',
    grade: db.grade || 'General',
    joinedDate: db.joined_date || (db.created_at ? db.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    enrolledClassIds: Array.isArray(db.enrolled_class_ids) ? db.enrolled_class_ids : [],
    completedLessonIds: Array.isArray(db.completed_lesson_ids) ? db.completed_lesson_ids : [],
    watchLaterVideoIds: Array.isArray(db.watch_later_video_ids) ? db.watch_later_video_ids : []
  };
};

// Helper to map frontend camelCase user to DB snake_case
export const mapUserToDb = (u) => {
  const dbObj = {
    id: u.id,
    name: u.name,
    email: u.email ? u.email.trim().toLowerCase() : '',
    password: u.password,
    role: u.role || 'student',
    avatar: u.avatar || null,
    title: u.title || null,
    phone: u.phone || null,
    grade: u.grade || null,
    joined_date: u.joinedDate || new Date().toISOString().split('T')[0],
    enrolled_class_ids: u.enrolledClassIds || [],
    completed_lesson_ids: u.completedLessonIds || []
  };
  if (u.bio !== undefined) dbObj.bio = u.bio;
  if (u.watchLaterVideoIds !== undefined) dbObj.watch_later_video_ids = u.watchLaterVideoIds;
  return dbObj;
};

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
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.warn('Supabase login query error, falling back to local verification:', error);
        } else if (data) {
          if (data.password !== password) {
            throw new Error('Invalid email or password. Please try again.');
          }
          if (roleHint && data.role !== roleHint) {
            throw new Error(`This account is registered as a ${data.role}, not a ${roleHint}.`);
          }

          const user = mapUserFromDb(data);
          authService.setCurrentUser(user);

          // Sync to local users cache
          const localUsers = storage.get(STORAGE_KEYS.USERS, []);
          const idx = localUsers.findIndex((u) => u.id === user.id);
          if (idx >= 0) localUsers[idx] = user;
          else localUsers.push(user);
          storage.set(STORAGE_KEYS.USERS, localUsers);

          return user;
        }
      } catch (err) {
        if (err.message && (err.message.includes('Invalid') || err.message.includes('registered as'))) {
          throw err;
        }
        console.warn('Supabase login check exception:', err);
      }
    }

    // Local storage fallback / verification
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const localUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!localUser) {
      // Check if admin is logging in with standard demo credentials
      if ((normalizedEmail === 'admin@lms.com' || normalizedEmail === 'teacher@edupro.org') && (password === 'admin' || password === 'admin123')) {
        const adminUser = {
          id: 'teacher-1',
          name: 'Prof. Alexander Wright',
          email: normalizedEmail,
          password: password,
          role: 'teacher',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          title: 'Lead Academic Director & Master Instructor',
          phone: '+1 (555) 012-3456',
          bio: 'Ph.D. in Applied Sciences with 14+ years of university lecturing and online instructional experience.',
          joinedDate: new Date().toISOString().split('T')[0],
          enrolledClassIds: [],
          completedLessonIds: []
        };
        authService.setCurrentUser(adminUser);
        return adminUser;
      }
      throw new Error('Invalid email or password. Please try again.');
    }

    if (roleHint && localUser.role !== roleHint) {
      throw new Error(`This account is registered as a ${localUser.role}, not a ${roleHint}.`);
    }

    authService.setCurrentUser(localUser);
    return localUser;
  },

  // Check if email address is already registered
  checkEmailAvailability: async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (existing) {
          return { available: false, error: 'An account with this email address already exists.' };
        }
      } catch (err) {
        console.warn('Supabase email check exception:', err);
      }
    }

    const users = storage.get(STORAGE_KEYS.USERS, []);
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { available: false, error: 'An account with this email address already exists.' };
    }

    return { available: true };
  },

  // Send Registration OTP Email
  requestRegistrationOtp: async ({ name, email, instituteName = 'EduPro Learning Academy' }) => {
    const check = await authService.checkEmailAvailability(email);
    if (!check.available) {
      throw new Error(check.error);
    }

    return await emailService.sendRegistrationOtp({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      instituteName
    });
  },

  // Verify Registration OTP
  verifyRegistrationOtp: (email, otpCode) => {
    return emailService.verifyOtp(email, otpCode);
  },

  // Register a new student (with verified OTP)
  registerStudent: async ({ name, email, password, grade, targetClassId = null, otp = null }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP if provided
    if (otp) {
      const otpRes = emailService.verifyOtp(normalizedEmail, otp);
      if (!otpRes.valid) {
        throw new Error(otpRes.error || 'Invalid OTP verification code');
      }
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

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (existing) {
          throw new Error('An account with this email address already exists.');
        }

        const dbUser = mapUserToDb(newStudent);
        delete dbUser.bio; // Ensure safe insertion if bio column isn't present
        delete dbUser.watch_later_video_ids;

        const { error } = await supabase.from('users').insert(dbUser);
        if (error) {
          console.error('Supabase user registration error:', error);
          throw new Error(error.message || 'Failed to create student account on database');
        }

        // If direct class enrollment, record payment in Supabase
        if (targetClassId) {
          const { data: classData } = await supabase
            .from('classes')
            .select('*')
            .eq('id', targetClassId)
            .maybeSingle();

          if (classData) {
            await supabase.from('payments').insert({
              id: `PAY-${Date.now().toString().slice(-6)}`,
              student_id: newStudent.id,
              student_name: newStudent.name,
              student_email: newStudent.email,
              class_id: classData.id,
              class_name: classData.title,
              amount: classData.fee || 0,
              currency: 'Rs.',
              date: new Date().toISOString().split('T')[0],
              method: (classData.fee > 0 ? 'Card Online' : 'Free Registration'),
              status: 'Completed',
              txn_reference: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              invoice_number: `INV-${Date.now().toString().slice(-6)}`
            });
          }
        }
      } catch (err) {
        if (err.message && err.message.includes('already exists')) {
          throw err;
        }
        console.warn('Supabase register error, saving locally:', err);
      }
    }

    // Sync to local storage
    const users = storage.get(STORAGE_KEYS.USERS, []);
    users.push(newStudent);
    storage.set(STORAGE_KEYS.USERS, users);
    authService.setCurrentUser(newStudent);

    return newStudent;
  },

  // Google OAuth Mock Authentication
  loginWithGoogle: async (role = 'student', targetClassId = null) => {
    const googleProfile = {
      name: 'Alex Johnson',
      email: 'alex.johnson.edu@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };

    let user = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .ilike('email', googleProfile.email)
          .maybeSingle();

        if (data) {
          user = mapUserFromDb(data);
        } else {
          user = {
            id: `google-${Date.now()}`,
            name: googleProfile.name,
            email: googleProfile.email,
            password: 'google_oauth_token',
            role: role,
            grade: 'College / Adult',
            avatar: googleProfile.avatar,
            enrolledClassIds: targetClassId ? [targetClassId] : [],
            watchLaterVideoIds: [],
            completedLessonIds: [],
            joinedDate: new Date().toISOString().split('T')[0]
          };
          const dbUser = mapUserToDb(user);
          delete dbUser.bio;
          delete dbUser.watch_later_video_ids;
          await supabase.from('users').insert(dbUser);
        }
      } catch (err) {
        console.warn('Google login Supabase exception:', err);
      }
    }

    if (!user) {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      user = users.find((u) => u.email.toLowerCase() === googleProfile.email.toLowerCase());
      if (!user) {
        user = {
          id: `google-${Date.now()}`,
          name: googleProfile.name,
          email: googleProfile.email,
          password: 'google_oauth_token',
          role: role,
          grade: 'College / Adult',
          avatar: googleProfile.avatar,
          enrolledClassIds: targetClassId ? [targetClassId] : [],
          watchLaterVideoIds: [],
          completedLessonIds: [],
          isGoogleAuth: true,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        users.push(user);
        storage.set(STORAGE_KEYS.USERS, users);
      }
    }

    authService.setCurrentUser(user);
    return user;
  },

  // Update profile (Name, Title, Email, Phone, Bio, Avatar, Password, etc.)
  updateProfile: async (userId, updatedFields) => {
    let updatedUser = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const payload = {};
        if (updatedFields.name !== undefined) payload.name = updatedFields.name.trim();
        if (updatedFields.email !== undefined) payload.email = updatedFields.email.trim().toLowerCase();
        if (updatedFields.password !== undefined) payload.password = updatedFields.password;
        if (updatedFields.title !== undefined) payload.title = updatedFields.title.trim();
        if (updatedFields.phone !== undefined) payload.phone = updatedFields.phone.trim();
        if (updatedFields.avatar !== undefined) payload.avatar = updatedFields.avatar.trim();
        if (updatedFields.grade !== undefined) payload.grade = updatedFields.grade;
        if (updatedFields.role !== undefined) payload.role = updatedFields.role;
        if (updatedFields.enrolledClassIds !== undefined) payload.enrolled_class_ids = updatedFields.enrolledClassIds;
        if (updatedFields.completedLessonIds !== undefined) payload.completed_lesson_ids = updatedFields.completedLessonIds;
        if (updatedFields.bio !== undefined) payload.bio = updatedFields.bio.trim();

        let { data, error } = await supabase
          .from('users')
          .update(payload)
          .eq('id', userId)
          .select()
          .maybeSingle();

        // If bio column is missing in older remote schema, gracefully retry without bio
        if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('bio')))) {
          const { bio, ...safePayload } = payload;
          const retry = await supabase
            .from('users')
            .update(safePayload)
            .eq('id', userId)
            .select()
            .maybeSingle();

          data = retry.data;
          error = retry.error;
        }

        if (error) {
          console.error('Supabase updateProfile error:', error);
          throw new Error(error.message || 'Failed to update profile in database');
        }

        if (data) {
          updatedUser = mapUserFromDb(data);
          // Preserve bio locally if not supported in column
          if (updatedFields.bio !== undefined) {
            updatedUser.bio = updatedFields.bio;
          }
        }
      } catch (err) {
        console.error('Error updating user in Supabase:', err);
        throw err;
      }
    }

    // Update LocalStorage cache & current session
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === userId);

    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields, ...(updatedUser || {}) };
      storage.set(STORAGE_KEYS.USERS, users);
      updatedUser = users[index];
    } else if (updatedUser) {
      users.push(updatedUser);
      storage.set(STORAGE_KEYS.USERS, users);
    } else {
      updatedUser = { id: userId, ...updatedFields };
    }

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === userId) {
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    return updatedUser;
  },

  // Sign out
  logout: () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  }
};
