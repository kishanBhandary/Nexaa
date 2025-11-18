import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, Mail, User, Lock, CheckCircle, Sparkles, UserPlus, Zap, Github } from 'lucide-react';
import { initializeGoogleAuth, decodeJWT } from '../services/googleAuth';
import { signInWithGitHub } from '../services/githubAuth';

const SignUpPage = ({ onClose, onNavigateToSignIn, onSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const googleButtonRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

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
            text: 'signup_with',
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

  useEffect(() => {
    const checkStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };
    setPasswordStrength(checkStrength(formData.password));
  }, [formData.password]);

  const handleGoogleSuccess = async (response) => {
    setGoogleLoading(true);
    try {
      const userInfo = decodeJWT(response.credential);
      if (userInfo) {
        await onSignUp({
          type: 'google',
          credential: response.credential,
          userInfo: userInfo
        });
      }
    } catch (error) {
      console.error('Google signup error:', error);
      alert('Google signup failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setGithubLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub signup error:', error);
      alert('GitHub signup failed. Please try again.');
      setGithubLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordStrength < 3) {
      alert('Please choose a stronger password!');
      return;
    }
    setIsLoading(true);
    await onSignUp({
      type: 'email',
      ...formData
    });
    setIsLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-2 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg hover:shadow-white/20 z-10"
      >
        <X size={16} />
      </button>

      <div className="relative z-10 w-full max-w-sm space-y-2" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-gray-800 to-black mb-1">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-300">
            Join Us
          </h2>
          <p className="text-gray-300 text-xs">
            Create your account and start your journey
          </p>
          <p className="text-gray-400 text-xs">
            Already have an account?{' '}
            <button 
              onClick={onNavigateToSignIn}
              className="text-white hover:text-gray-300 font-medium transition underline decoration-1 underline-offset-2"
            >
              Sign in here!
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="group">
            <label className="block text-white text-xs mb-1 font-medium flex items-center gap-1">
              <Mail size={12} className="text-white" />
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 py-2 px-3 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-sm"
              required
            />
          </div>

          <div className="group">
            <label className="block text-white text-xs mb-1 font-medium flex items-center gap-1">
              <User size={12} className="text-white" />
              Username
            </label>
            <input
              type="text"
              placeholder="Choose username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 py-2 px-3 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-sm"
              required
            />
          </div>

          <div className="group">
            <label className="block text-white text-xs mb-1 font-medium flex items-center gap-1">
              <Lock size={12} className="text-white" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 py-2 px-3 pr-8 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-1">
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-400' : passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {getStrengthText()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="group">
            <label className="block text-white text-xs mb-1 font-medium flex items-center gap-1">
              <CheckCircle size={12} className="text-white" />
              Confirm
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full bg-white/5 backdrop-blur-sm border ${
                  formData.confirmPassword && formData.password === formData.confirmPassword 
                    ? 'border-green-500' 
                    : formData.confirmPassword 
                    ? 'border-red-500' 
                    : 'border-white/20'
                } text-white placeholder-gray-400 py-2 px-3 pr-8 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-sm`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-400 text-xs mt-0.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword || passwordStrength < 3}
            className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-gray-700 border border-white text-white py-2.5 px-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-white/25 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Zap size={14} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Custom Google Button styled like GitHub */}
          <button 
            onClick={() => {
              if (window.google && googleButtonRef.current) {
                // If Google is loaded, trigger the Google button
                const googleButton = googleButtonRef.current.querySelector('[role="button"]');
                if (googleButton) {
                  googleButton.click();
                } else {
                  alert('Google Sign-Up is loading...');
                }
              } else {
                alert('Google Sign-Up is being loaded...');
              }
            }}
            disabled={googleLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white py-2 px-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-bold text-xs">G</span>
            </div>
            <span className="text-xs">{googleLoading ? 'Creating...' : 'Google'}</span>
          </button>

          {/* GitHub Button */}
          <button 
            onClick={handleGitHubSignUp}
            disabled={githubLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white py-2 px-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Github size={14} className="text-white" />
            <span className="text-xs">{githubLoading ? 'Redirecting...' : 'GitHub'}</span>
          </button>

          {/* Hidden Google button for actual functionality */}
          <div 
            ref={googleButtonRef}
            className="hidden"
          />
        </div>

        <div className="text-center mt-2">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
            <Sparkles size={10} className="text-white" />
            <span>Free • Secure • No Spam</span>
            <Sparkles size={10} className="text-white" />
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

export default SignUpPage;
