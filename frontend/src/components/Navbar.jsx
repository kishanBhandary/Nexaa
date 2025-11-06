import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({ 
  isSignUp = false, 
  isSignIn = false, 
  onNavigateToSignIn, 
  onNavigateToSignUp 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Nexa Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Logo Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/90 via-gray-200 to-gray-300 shadow-lg shadow-white/30 flex items-center justify-center border border-white/20">
                <div className="text-black font-bold text-lg">N</div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-60 animate-pulse"></div>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
            </div>
            
            {/* Brand Text */}
            <div className="text-white font-bold text-xl tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nexa
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            {/* Navigation items can go here if needed */}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!isSignUp && !isSignIn && (
            <>
              <button 
                onClick={onNavigateToSignIn}
                className="text-white hover:text-gray-300 transition text-sm"
              >
                Sign in
              </button>
              <button 
                onClick={onNavigateToSignUp}
                className="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition text-sm font-medium shadow-lg hover:shadow-white/50"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-white/20 shadow-2xl">
          <div className="px-6 py-4 space-y-4">
            <button className="block text-white hover:text-gray-300 transition">Blog</button>
            
            {!isSignUp && !isSignIn && (
              <div className="pt-4 border-t border-white/20 space-y-2">
                <button 
                  onClick={onNavigateToSignIn}
                  className="block w-full text-left text-white hover:text-gray-300 transition"
                >
                  Sign in
                </button>
                <button 
                  onClick={onNavigateToSignUp}
                  className="block w-full bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;