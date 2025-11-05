import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({ 
  isSignUp = false, 
  isSignIn = false, 
  onNavigateToSignIn, 
  onNavigateToSignUp 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white to-gray-300 shadow-lg shadow-white/50"></div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            {/* Blog Dropdown with Features */}
            <div className="relative">
              <button 
                className="text-white hover:text-gray-300 transition flex items-center gap-1"
                onClick={() => setBlogDropdownOpen(!blogDropdownOpen)}
              >
                Blog <ChevronDown size={16} />
              </button>
              {blogDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl">
                  <div className="py-2">
                    <div className="px-4 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wide border-b border-white/10">Latest Posts</div>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-white/20 transition">AI Technology Trends 2025</a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-white/20 transition">Machine Learning Breakthroughs</a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-white/20 transition">Developer Insights</a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-white/20 transition">Product Updates</a>
                    <div className="px-4 py-2 text-gray-400 text-xs border-t border-white/10 mt-1">
                      <a href="#" className="text-white hover:text-gray-300 transition">View All Articles →</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
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