import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, Mail, Lock, ArrowRight, Github, Sparkles, Shield, Zap } from 'lucide-react';
import { initializeGoogleAuth, decodeJWT } from '../services/googleAuth';
import { signInWithGitHub } from '../services/githubAuth';

const SignInPage = ({ onClose, onNavigateToSignUp, onSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    initializeGoogleAuth().then(() => {
      window.googleLoginCallback = handleGoogleSuccess;
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    });
    return () => {
      if (window.googleLoginCallback) {
        delete window.googleLoginCallback;
      }
    };
  }, []);

  const handleGoogleSuccess = async (response) => {
    setGoogleLoading(true);
    try {
      const userInfo = decodeJWT(response.credential);
      if (userInfo) {
        await onSignIn({
          type: 'google',
          credential: response.credential,
          userInfo: userInfo
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub login error:', error);
      alert('GitHub login failed. Please try again.');
      setGithubLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields!');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await onSignIn(formData);
      if (!result.success) {
        alert(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="mobile-full-height bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 sm:w-72 h-48 sm:h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="touch-button absolute top-4 sm:top-8 right-4 sm:right-8 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg hover:shadow-white/20 mobile-modal-z safe-area-top"
      >
        <X size={18} className="sm:w-5 sm:h-5" />
      </button>

      <div className="relative mobile-modal-z w-full max-w-md mx-auto space-y-6 sm:space-y-4 safe-area-bottom" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <div className="text-center space-y-4 sm:space-y-3">
          <div className="inline-flex items-center justify-center w-14 sm:w-12 h-14 sm:h-12 rounded-2xl sm:rounded-xl bg-gradient-to-r from-gray-800 to-black mb-3 sm:mb-2">
            <Shield className="w-7 sm:w-6 h-7 sm:h-6 text-white" />
          </div>
          <h2 className="text-5xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-300">
            Welcome Back
          </h2>
          <p className="text-gray-300 text-lg sm:text-base">
            Sign in to continue your journey
          </p>
          <p className="text-gray-400 text-base sm:text-sm">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="touch-button text-white hover:text-gray-300 font-medium transition underline decoration-2 underline-offset-4"
            >
              Create one here!
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-4">
          <div className="group">
            <label className="block text-white text-base sm:text-sm mb-3 sm:mb-2 font-medium flex items-center gap-2">
              <Mail size={18} className="sm:w-4 sm:h-4 text-white" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white placeholder-gray-400 py-4 sm:py-3 px-5 sm:px-4 rounded-2xl sm:rounded-xl focus:border-white focus:outline-none transition-all duration-300 text-base touch-button"
              required
            />
          </div>

          <div className="group">
            <label className="block text-white text-base sm:text-sm mb-3 sm:mb-2 font-medium flex items-center gap-2">
              <Lock size={18} className="sm:w-4 sm:h-4 text-white" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white placeholder-gray-400 py-4 sm:py-3 px-5 sm:px-4 pr-14 sm:pr-12 rounded-2xl sm:rounded-xl focus:border-white focus:outline-none transition-all duration-300 text-base touch-button"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="touch-button absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2"
              >
                {showPassword ? <EyeOff size={20} className="sm:w-4 sm:h-4" /> : <Eye size={20} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              className="touch-button text-white hover:text-gray-300 font-medium transition text-base sm:text-sm px-2 py-1"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="touch-button w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-gray-700 border-2 border-white text-white py-4 sm:py-3 px-5 sm:px-4 rounded-2xl sm:rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 sm:gap-2 shadow-lg hover:shadow-white/25 text-base sm:text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-6 sm:w-5 h-6 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                <Zap size={22} className="sm:w-5 sm:h-5" />
                Sign In
                <ArrowRight size={22} className="sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </form>

        <div className="space-y-5 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-base sm:text-sm">
              <span className="px-5 sm:px-4 bg-transparent text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Custom Google Button styled like GitHub - Mobile Optimized */}
          <button 
            onClick={() => {
              if (window.google && googleButtonRef.current) {
                // If Google is loaded, trigger the Google button
                const googleButton = googleButtonRef.current.querySelector('[role="button"]');
                if (googleButton) {
                  googleButton.click();
                } else {
                  alert('Google Sign-In is loading...');
                }
              } else {
                alert('Google Sign-In is being loaded...');
              }
            }}
            disabled={googleLoading}
            className="touch-button w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-gray-500 text-white py-4 sm:py-3 px-6 sm:px-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base sm:text-sm"
          >
            <div className="w-6 sm:w-5 h-6 sm:h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-bold text-sm sm:text-xs">G</span>
            </div>
            {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          </button>

          {/* GitHub Button - Mobile Optimized */}
          <button 
            onClick={handleGitHubSignIn}
            disabled={githubLoading}
            className="touch-button w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-gray-500 text-white py-4 sm:py-3 px-6 sm:px-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base sm:text-sm"
          >
            <Github size={22} className="sm:w-5 sm:h-5 text-white" />
            {githubLoading ? 'Redirecting to GitHub...' : 'Continue with GitHub'}
          </button>

          {/* Hidden Google button for actual functionality */}
          <div 
            ref={googleButtonRef}
            className="hidden"
          />
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-2 text-gray-400 text-base sm:text-sm">
            <Sparkles size={18} className="sm:w-4 sm:h-4 text-white" />
            <span>Secure • Fast • Reliable</span>
            <Sparkles size={18} className="sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default SignInPage;
