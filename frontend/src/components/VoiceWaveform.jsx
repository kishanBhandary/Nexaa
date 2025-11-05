import React, { useEffect, useState } from 'react';

const VoiceWaveform = ({ isActive, type = 'listening' }) => {
  const [waveHeights, setWaveHeights] = useState(Array(8).fill(20));

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setWaveHeights(prev => 
        prev.map((_, index) => {
          const base = type === 'listening' ? 15 : 25;
          const amplitude = type === 'listening' ? 30 : 40;
          const frequency = type === 'listening' ? 0.8 : 1.2;
          return base + Math.sin((Date.now() / 150) * frequency + index * 0.5) * amplitude;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, type]);

  if (!isActive) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full animate-ping">
        <div 
          className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${
            type === 'listening' 
              ? 'bg-white/30' 
              : 'bg-white/20'
          }`}
        />
      </div>
      
      {/* Middle Glow Ring */}
      <div className="absolute inset-1 sm:inset-2 rounded-full animate-pulse">
        <div 
          className={`w-22 h-22 sm:w-28 sm:h-28 rounded-full ${
            type === 'listening' 
              ? 'bg-white/40' 
              : 'bg-white/30'
          } blur-sm`}
        />
      </div>
      
      {/* Main Container */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-white/10 to-gray-500/10 backdrop-blur-lg border border-white/30 flex items-center justify-center">
        {/* Waveform Bars */}
        <div className="flex items-center justify-center space-x-0.5 sm:space-x-1">
          {waveHeights.map((height, index) => (
            <div
              key={index}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${
                type === 'listening'
                  ? 'bg-gradient-to-t from-white via-gray-200 to-white'
                  : 'bg-gradient-to-t from-gray-300 via-white to-gray-200'
              }`}
              style={{
                height: `${Math.max(height * 0.8, 6)}px`,
                filter: `drop-shadow(0 0 4px ${
                  type === 'listening' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.5)'
                })`,
              }}
            />
          ))}
        </div>
        
        {/* Center Pulse */}
        <div 
          className={`absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full ${
            type === 'listening' 
              ? 'bg-white/20' 
              : 'bg-white/15'
          } animate-pulse`}
        />
        
        {/* Status Text */}
        <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 transform -translate-x-1/2">
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            {type === 'listening' ? 'Listening...' : 'Speaking...'}
          </p>
        </div>
      </div>
      
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            type === 'listening' 
              ? 'bg-white/70' 
              : 'bg-white/60'
          } animate-bounce opacity-60`}
          style={{
            top: `${30 + Math.sin(i * 1.2) * 20}%`,
            left: `${30 + Math.cos(i * 1.2) * 20}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;