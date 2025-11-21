import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({ 
  isSignUp = false, 
  isSignIn = false, 
  onNavigateToSignIn, 
  onNavigateToSignUp 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="absolute top-0 left-0 right-0 mobile-nav-z px-4 sm:px-6 py-3 sm:py-4 safe-area-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Stylish Nexaa Logo - Same as Footer */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group">
              {/* Main Brand Text */}
              <h3 className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 tracking-wide leading-tight transform hover:scale-105 transition-transform duration-300 drop-shadow-lg">
                Nexaa
              </h3>
              
              {/* Underline Decoration */}
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-white to-gray-500 rounded-full opacity-60 animate-pulse"></div>
              
              {/* Floating Sparkles */}
              <div className="absolute -top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce shadow-lg shadow-white/50"></div>
              <div className="absolute top-0 -left-1 w-1 h-1 bg-gray-300/80 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 right-4 w-0.5 h-0.5 bg-white/60 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            {/* Navigation items can go here if needed */}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          {!isSignUp && !isSignIn && (
            <>
              <button 
                onClick={onNavigateToSignIn}
                className="touch-button text-white hover:text-gray-300 transition text-sm px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Sign in
              </button>
              <button 
                onClick={onNavigateToSignUp}
                className="touch-button bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 hover:text-black transition text-sm font-medium shadow-lg hover:shadow-white/50"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="touch-button md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu - Improved */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm mobile-modal-backdrop"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Content */}
          <div className="md:hidden absolute top-full left-0 right-0 mx-4 mt-2 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl animate-slide-up-mobile">
            <div className="p-4 space-y-3">
              {!isSignUp && !isSignIn && (
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      onNavigateToSignIn();
                      closeMobileMenu();
                    }}
                    className="touch-button block w-full text-left text-white hover:text-gray-300 transition px-4 py-3 rounded-xl hover:bg-white/10"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => {
                      onNavigateToSignUp();
                      closeMobileMenu();
                    }}
                    className="touch-button block w-full bg-white text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-200 hover:text-black transition font-medium text-center"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;