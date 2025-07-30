import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock authentication system that works without Firebase
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('musicVisualizerUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('musicVisualizerUser');
      }
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userData = {
        uid: `user_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        emailVerified: true
      };

      setUser(userData);
      localStorage.setItem('musicVisualizerUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userData = {
        uid: `user_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        emailVerified: true
      };

      setUser(userData);
      localStorage.setItem('musicVisualizerUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        uid: `google_user_${Date.now()}`,
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/40',
        emailVerified: true,
        providerId: 'google.com'
      };

      setUser(userData);
      localStorage.setItem('musicVisualizerUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('musicVisualizerUser');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};