// Google OAuth service for handling authentication

// You'll need to replace this with your actual Google Client ID
// Get this from https://console.cloud.google.com/
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

// Initialize Google Identity Services
export const initializeGoogleAuth = () => {
  return new Promise((resolve) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      resolve();
    };
    document.head.appendChild(script);
  });
};

// Handle the credential response from Google
const handleCredentialResponse = (response) => {
  console.log("Encoded JWT ID token: " + response.credential);
  // You can decode this JWT to get user information
  // For now, we'll just pass it to the callback
  if (window.googleLoginCallback) {
    window.googleLoginCallback(response);
  }
};

// Decode JWT token to get user info
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Render Google Sign-In button
export const renderGoogleButton = (elementId, options = {}) => {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: options.theme || 'outline',
      size: options.size || 'large',
      width: options.width || 300,
      type: options.type || 'standard',
      shape: options.shape || 'rectangular',
      text: options.text || 'signin_with',
      logo_alignment: options.logo_alignment || 'left',
    }
  );
};

// Prompt for One Tap sign-in
export const promptOneTap = () => {
  if (window.google) {
    window.google.accounts.id.prompt();
  }
};

// Sign out from Google
export const signOutGoogle = () => {
  if (window.google) {
    window.google.accounts.id.disableAutoSelect();
  }
};