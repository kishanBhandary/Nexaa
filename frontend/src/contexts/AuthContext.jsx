import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userWithId = {
        ...userData,
        id: Date.now(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email)}&background=06b6d4&color=fff`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userWithId = {
        ...userData,
        id: Date.now(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=8b5cf6&color=fff`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;