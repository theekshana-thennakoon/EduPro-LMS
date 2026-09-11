import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, roleHint = null) => {
    const user = await authService.login(email, password, roleHint);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async (role = 'student', targetClassId = null) => {
    const user = await authService.loginWithGoogle(role, targetClassId);
    setCurrentUser(user);
    return user;
  };

  const requestRegistrationOtp = async ({ name, email, instituteName }) => {
    return await authService.requestRegistrationOtp({ name, email, instituteName });
  };

  const verifyRegistrationOtp = (email, otpCode) => {
    return authService.verifyRegistrationOtp(email, otpCode);
  };

  const checkEmailAvailability = async (email) => {
    return await authService.checkEmailAvailability(email);
  };

  const registerStudent = async (data) => {
    const user = await authService.registerStudent(data);
    setCurrentUser(user);
    return user;
  };

  const updateProfile = async (fields) => {
    if (!currentUser) return;
    const updated = await authService.updateProfile(currentUser.id, fields);
    setCurrentUser(updated);
    return updated;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        loginWithGoogle,
        registerStudent,
        requestRegistrationOtp,
        verifyRegistrationOtp,
        checkEmailAvailability,
        updateProfile,
        logout,
        isAuthenticated: !!currentUser,
        isTeacher: currentUser?.role === 'teacher',
        isStudent: currentUser?.role === 'student'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
