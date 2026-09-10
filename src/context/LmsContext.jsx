import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lmsService } from '../services/lmsService';
import { useAuth } from './AuthContext';

const LmsContext = createContext(null);

export const LmsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [settings, setSettings] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [watchLaterList, setWatchLaterList] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('lms_theme') || 'light');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply theme to HTML root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lms_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.id ? null : curr));
    }, 4000);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [st, subjs, grds, clss, pymts] = await Promise.all([
        lmsService.getSettings(),
        lmsService.getSubjects(),
        lmsService.getGrades(),
        lmsService.getClasses(),
        lmsService.getAllPayments()
      ]);
      setSettings(st);
      setSubjects(subjs);
      setGrades(grds);
      setClasses(clss);
      setPayments(pymts);

      if (currentUser && currentUser.role === 'student') {
        const wl = await lmsService.getWatchLaterVideos(currentUser.id);
        setWatchLaterList(wl);
      }
    } catch (err) {
      console.error('Error fetching LMS state:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Check enrollment guard for logged in student
  const checkEnrollment = useCallback(
    (classId) => {
      if (!currentUser) return false;
      if (currentUser.role === 'teacher') return true;
      return lmsService.isStudentEnrolled(currentUser.id, classId);
    },
    [currentUser]
  );

  // Enroll student in class
  const enrollInClass = async (classId, paymentMethod = 'Online Card') => {
    if (!currentUser) {
      showToast('Please sign in or create an account to enroll.', 'error');
      return false;
    }
    try {
      const res = await lmsService.enrollStudentInClass(currentUser.id, classId, { method: paymentMethod });
      showToast('Successfully enrolled! Welcome to the class.', 'success');
      await refreshAll();
      return res;
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
      return false;
    }
  };

  // Toggle watch later video
  const toggleWatchLater = async (videoId) => {
    if (!currentUser || currentUser.role !== 'student') {
      showToast('Log in as a student to save videos to Watch Later', 'info');
      return;
    }
    try {
      const isAdded = await lmsService.toggleWatchLater(currentUser.id, videoId);
      const wl = await lmsService.getWatchLaterVideos(currentUser.id);
      setWatchLaterList(wl);
      showToast(isAdded ? 'Added to Watch Later' : 'Removed from Watch Later', 'success');
    } catch (err) {
      showToast('Failed to update Watch Later', 'error');
    }
  };

  return (
    <LmsContext.Provider
      value={{
        settings,
        subjects,
        grades,
        classes,
        lessons,
        payments,
        watchLaterList,
        theme,
        toggleTheme,
        toast,
        showToast,
        refreshAll,
        checkEnrollment,
        enrollInClass,
        toggleWatchLater,
        loading
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
