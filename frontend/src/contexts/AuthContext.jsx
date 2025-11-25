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
  const [token, setToken] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        
        // Validate token with backend
        validateToken(savedToken).catch(() => {
          // Token is invalid, clear stored data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        });
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Validate token with backend
  const validateToken = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/validate?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    return response.json();
  };

  const signIn = async (userData) => {
    try {
      setLoading(true);
      
      let userWithId;
      let authToken;
      
      if (userData.type === 'google') {
        // Handle Google OAuth login - for now, keep demo behavior
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.sub,
          email: userInfo.email,
          username: userInfo.name,
          name: userInfo.name,
          avatar: userInfo.picture,
          googleId: userInfo.sub,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'google'
        };
        authToken = 'demo-token-' + Date.now(); // For demo purposes
      } else if (userData.type === 'github') {
        // Handle GitHub OAuth login - for now, keep demo behavior
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
        authToken = 'demo-token-' + Date.now(); // For demo purposes
      } else {
        // Handle regular email/password login - CALL BACKEND
        console.log('Sending signin request to backend with email:', userData.email);
        
        // Add AbortController for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Backend signin response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend signin error:', errorData);
          throw new Error(errorData.message || 'Invalid credentials');
        }

        const authData = await response.json();
        console.log('Successful signin response:', authData);
        authToken = authData.token;
        
        userWithId = {
          id: authData.id,
          email: authData.email,
          username: authData.username,
          name: authData.username, // Use username as display name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authData.username)}&background=06b6d4&color=fff`,
          roles: authData.roles,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'email'
        };
      }
      
      setUser(userWithId);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userWithId));
      localStorage.setItem('token', authToken);
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      
      let userWithId;
      let authToken;
      
      if (userData.type === 'google') {
        // Handle Google OAuth signup - for now, keep demo behavior
        const { userInfo } = userData;
        userWithId = {
          id: userInfo.sub,
          email: userInfo.email,
          username: userInfo.name,
          name: userInfo.name,
          avatar: userInfo.picture,
          googleId: userInfo.sub,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'google'
        };
        authToken = 'demo-token-' + Date.now(); // For demo purposes
      } else if (userData.type === 'github') {
        // Handle GitHub OAuth signup - for now, keep demo behavior
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
        authToken = 'demo-token-' + Date.now(); // For demo purposes
      } else {
        // Handle regular email/password signup - CALL BACKEND
        console.log('Sending signup request to backend with data:', {
          email: userData.email,
          username: userData.username,
          // Don't log password for security
        });
        
        // Add AbortController for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for signup
        
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            username: userData.username
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        console.log('Backend response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error response:', errorData);
          throw new Error(errorData.message || 'Failed to create account');
        }

        const authData = await response.json();
        console.log('Successful signup response:', authData);
        authToken = authData.token;
        
        userWithId = {
          id: authData.id,
          email: authData.email,
          username: authData.username,
          name: authData.username, // Use username as display name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authData.username)}&background=8b5cf6&color=fff`,
          roles: authData.roles,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          authType: 'email'
        };
      }
      
      setUser(userWithId);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userWithId));
      localStorage.setItem('token', authToken);
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    // Sign out from Google if user was signed in with Google
    if (user && user.authType === 'google') {
      signOutGoogle();
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
    token,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    getToken: () => token || localStorage.getItem('token'),
    validateToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;