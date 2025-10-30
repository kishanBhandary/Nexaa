import React, { useState } from 'react';
import { ChevronDown, Eye, EyeOff, X, Mail, User, Lock } from 'lucide-react';

const SignUpPage = ({ onClose, onNavigateToSignIn, onSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    setIsLoading(true);
    await onSignUp(formData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-gray-500/30 to-gray-800/30"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-800/80"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-96 h-96 rounded-full bg-gradient-to-br from-white to-gray-300 opacity-20 blur-3xl" 
                 style={{ animation: 'float 6s ease-in-out infinite' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border-4 border-white/30 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-gray-300/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white to-gray-400 shadow-2xl shadow-white/50 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-60px)`,
                          animation: `twinkle ${2 + i * 0.2}s ease-in-out infinite`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 border-4 border-white/30 rounded-l-3xl"></div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-gradient-to-br from-black to-gray-900">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg hover:shadow-white/20"
        >
          <X size={20} />
        </button>

        <div className="w-full max-w-md space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Sign up
            </h2>
            <p className="text-gray-400">
              If you already have an account register <br />
              You can{' '}
              <button 
                onClick={onNavigateToSignIn}
                className="text-white hover:text-gray-300 font-medium transition underline"
              >
                Login here !
              </button>
            </p>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white text-sm mb-3 font-medium">Email</label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-gray-600 py-3 pl-8 pr-2 focus:border-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-white text-sm mb-3 font-medium">Username</label>
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition" size={20} />
                <input
                  type="text"
                  placeholder="Enter your User name"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-gray-600 py-3 pl-8 pr-2 focus:border-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm mb-3 font-medium">Password</label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-gray-600 py-3 pl-8 pr-10 focus:border-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white text-sm mb-3 font-medium">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-gray-600 py-3 pl-8 pr-10 focus:border-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-white via-gray-200 to-gray-300 text-black py-4 rounded-xl font-medium hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 mt-8 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-4">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg shadow-white/20">
              <ChevronDown className="text-white animate-bounce" size={20} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SignUpPage;