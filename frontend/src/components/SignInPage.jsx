import React, { useState } from 'react';
import { Eye, EyeOff, X, Mail, Lock, ArrowRight, Github } from 'lucide-react';

const SignInPage = ({ onClose, onNavigateToSignUp, onSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple validation
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields!');
      setIsLoading(false);
      return;
    }

    await onSignIn(formData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg hover:shadow-white/20"
        >
          <X size={20} />
        </button>

        <div className="w-full max-w-md space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Sign In
            </h2>
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToSignUp}
                className="text-white hover:text-gray-300 font-medium transition underline"
              >
                Create one here!
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-white/20 text-white placeholder-gray-600 py-3 pl-8 pr-10 focus:border-white focus:outline-none transition"
                  required
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

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-white hover:text-gray-300 font-medium transition text-sm"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-white via-gray-200 to-gray-300 text-black py-4 rounded-xl font-medium hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 mt-8 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-300 rounded-full flex items-center justify-center text-black font-bold text-xs">
                G
              </div>
              Continue with Google
            </button>
            
            <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3">
              <Github size={20} className="text-white" />
              Continue with GitHub
            </button>
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
  );
};

export default SignInPage;