// GitHub OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin;

export const initializeGitHubAuth = () => {
  // GitHub OAuth doesn't require initialization like Google
  return Promise.resolve();
};

export const signInWithGitHub = () => {
  if (!GITHUB_CLIENT_ID) {
    console.warn('GitHub Client ID not configured. Please set VITE_GITHUB_CLIENT_ID in your environment variables.');
    return;
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.append('redirect_uri', GITHUB_REDIRECT_URI);
  githubAuthUrl.searchParams.append('scope', 'user:email read:user');
  githubAuthUrl.searchParams.append('state', generateState());

  // Store state for verification
  localStorage.setItem('github_oauth_state', githubAuthUrl.searchParams.get('state'));

  // Redirect to GitHub
  window.location.href = githubAuthUrl.toString();
};

export const handleGitHubCallback = async (code, state) => {
  // Verify state parameter
  const storedState = localStorage.getItem('github_oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }

  // Clean up stored state
  localStorage.removeItem('github_oauth_state');

  try {
    // In a real application, you would send this code to your backend
    // to exchange it for an access token securely
    console.log('GitHub authorization code received:', code);
    
    // For demo purposes, we'll simulate getting user info
    // In production, your backend should handle the token exchange
    return {
      type: 'github',
      code: code,
      // This would be populated by your backend after token exchange
      userInfo: {
        id: 'demo_github_user',
        login: 'demo_user',
        name: 'Demo GitHub User',
        email: 'demo@github.com',
        avatar_url: 'https://github.com/identicons/demo.png'
      }
    };
  } catch (error) {
    console.error('GitHub authentication error:', error);
    throw error;
  }
};

// Helper function to generate random state
const generateState = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(16);
};

// Check if current URL has GitHub callback parameters
export const isGitHubCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') && urlParams.has('state');
};

// Get GitHub callback parameters
export const getGitHubCallbackParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    code: urlParams.get('code'),
    state: urlParams.get('state'),
    error: urlParams.get('error'),
    error_description: urlParams.get('error_description')
  };
};