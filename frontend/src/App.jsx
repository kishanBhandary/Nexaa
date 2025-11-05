import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import SignUpPage from './components/SignUpPage';
import SignInPage from './components/SignInPage';
import ChatPage from './components/ChatPage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const { user, loading, signIn, signUp, signOut, isAuthenticated } = useAuth();

  // Remove the useEffect that redirects to dashboard
  // Users will stay on the landing page after authentication

  const handleSignIn = async (userData) => {
    const result = await signIn(userData);
    if (result.success) {
      alert('Sign in successful! Welcome back.');
      setCurrentPage('chat');
    } else {
      alert('Sign in failed: ' + result.error);
    }
  };

  const handleSignUp = async (userData) => {
    const result = await signUp(userData);
    if (result.success) {
      alert('Registration successful! Please sign in to continue.');
      setCurrentPage('signin');
    } else {
      alert('Sign up failed: ' + result.error);
    }
  };

  const handleSignOut = () => {
    signOut();
    setCurrentPage('landing');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onNavigateToSignUp={() => setCurrentPage('signup')}
            onNavigateToSignIn={() => setCurrentPage('signin')}
          />
        );
      case 'signup':
        return (
          <SignUpPage 
            onClose={() => setCurrentPage('landing')}
            onNavigateToSignIn={() => setCurrentPage('signin')}
            onSignUp={handleSignUp}
          />
        );
      case 'signin':
        return (
          <SignInPage
            onClose={() => setCurrentPage('landing')}
            onNavigateToSignUp={() => setCurrentPage('signup')}
            onSignIn={handleSignIn}
          />
        );
      case 'chat':
        return <ChatPage />;
      default:
        return (
          <LandingPage 
            onNavigateToSignUp={() => setCurrentPage('signup')}
            onNavigateToSignIn={() => setCurrentPage('signin')}
          />
        );
    }
  };

  return <>{renderPage()}</>;
}

export default App;