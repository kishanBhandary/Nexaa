import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOutGoogle } from '../services/googleAuth';
import { isGitHubCallback, getGitHubCallbackParams, handleGitHubCallback } from '../services/githubAuth';

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
    // Check for GitHub OAuth callback
    if (isGitHubCallback()) {
      const params = getGitHubCallbackParams();
      
      if (params.error) {
        console.error('GitHub OAuth error:', params.error, params.error_description);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.code && params.state) {
        // Handle successful GitHub callback
        handleGitHubCallback(params.code, params.state)
          .then(result => {
            // Process the GitHub user data
            const userWithId = {
              id: result.userInfo.id,
              email: result.userInfo.email,
              username: result.userInfo.login,
              name: result.userInfo.name,
              avatar: result.userInfo.avatar_url,
              githubId: result.userInfo.id,
              joinedDate: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              authType: 'github'
            };
            
            setUser(userWithId);
            localStorage.setItem('user', JSON.stringify(userWithId));
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(error => {
            console.error('GitHub callback error:', error);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }
    
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
      
      let userWithId;
      
      if (userData.type === 'google') {
        // Handle Google OAuth login
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.sub,
          email: userInfo.email,
          username: userInfo.name,
          avatar: userInfo.picture,
          googleId: userInfo.sub,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'google'
        };
      } else if (userData.type === 'github') {
        // Handle GitHub OAuth login
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.id,
          email: userInfo.email,
          username: userInfo.login,
          name: userInfo.name,
          avatar: userInfo.avatar_url,
          githubId: userInfo.id,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'github'
        };
      } else {
        // Handle regular email login
        userWithId = {
          ...userData,
          id: Date.now(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email)}&background=06b6d4&color=fff`,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'email'
        };
      }
      
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
      
      let userWithId;
      
      if (userData.type === 'google') {
        // Handle Google OAuth signup
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.sub,
          email: userInfo.email,
          username: userInfo.name,
          avatar: userInfo.picture,
          googleId: userInfo.sub,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'google'
        };
      } else if (userData.type === 'github') {
        // Handle GitHub OAuth signup
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.id,
          email: userInfo.email,
          username: userInfo.login,
          name: userInfo.name,
          avatar: userInfo.avatar_url,
          githubId: userInfo.id,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'github'
        };
      } else {
        // Handle regular email signup
        userWithId = {
          ...userData,
          id: Date.now(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=8b5cf6&color=fff`,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'email'
        };
      }
      
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    // Sign out from Google if user was signed in with Google
    if (user && user.authType === 'google') {
      signOutGoogle();
    }
    
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