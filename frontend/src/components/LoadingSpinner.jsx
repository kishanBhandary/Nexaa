import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white to-gray-300 animate-pulse mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-white/30 animate-spin mx-auto"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Loading...</h2>
          <p className="text-gray-400">Initializing your experience</p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse" style={{
            animation: 'loading 2s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;