import React, { useEffect, useRef } from 'react';

const VoiceWaveform = ({ isActive, type = 'listening', isInline = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const waveDataRef = useRef([]);
  const particlesRef = useRef([]);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Add roundRect polyfill
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }

    // Initialize wave system - more waves for smoother look
    const numWaves = isInline ? 60 : 120;
    const numParticles = isInline ? 15 : 30;
    
    // Initialize wave data with enhanced properties
    if (waveDataRef.current.length !== numWaves) {
      waveDataRef.current = Array.from({ length: numWaves }, (_, i) => ({
        height: 0.05 + Math.random() * 0.15,
        targetHeight: 0.05 + Math.random() * 0.15,
        velocity: 0,
        phase: Math.random() * Math.PI * 2,
        offsetX: (i / numWaves) * Math.PI * 4,
        frequency: 0.8 + Math.random() * 0.4,
        amplitude: 0.7 + Math.random() * 0.6,
        glowIntensity: Math.random(),
        colorShift: Math.random() * 0.3,
      }));
    }

    // Initialize enhanced particles
    if (particlesRef.current.length !== numParticles) {
      particlesRef.current = Array.from({ length: numParticles }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        size: 0.3 + Math.random() * 2,
        life: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.7,
        pulseSpeed: 0.8 + Math.random() * 0.4,
        trail: [],
        maxTrailLength: 5,
      }));
    }

    const animate = () => {
      timeRef.current += 0.016;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas
      if (isInline) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
        if (type === 'listening') {
          bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
          bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        } else {
          bgGradient.addColorStop(0, 'rgba(5, 46, 22, 0.1)');
          bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        }
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
      }
      
      // Enhanced wave configuration with more colors and effects
      const waveConfig = isInline ? (
        type === 'listening' 
        ? {
            intensity: 0.8,
            speed: 0.6,
            primaryColor: '#60A5FA',
            secondaryColor: '#3B82F6',
            accentColor: '#93C5FD',
            tertiaryColor: '#DBEAFE',
            glowColor: 'rgba(96, 165, 250, 0.4)',
            shadowColor: 'rgba(59, 130, 246, 0.2)',
            maxHeight: height * 0.6,
            smoothness: 0.12,
          }
        : {
            intensity: 1.0,
            speed: 0.8,
            primaryColor: '#34D399',
            secondaryColor: '#10B981',
            accentColor: '#6EE7B7',
            tertiaryColor: '#D1FAE5',
            glowColor: 'rgba(52, 211, 153, 0.4)',
            shadowColor: 'rgba(16, 185, 129, 0.2)',
            maxHeight: height * 0.7,
            smoothness: 0.15,
          }
      ) : (
        type === 'listening' 
        ? {
            intensity: 2.0,
            speed: 1.0,
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            accentColor: '#93C5FD',
            tertiaryColor: '#DBEAFE',
            glowColor: 'rgba(59, 130, 246, 0.6)',
            shadowColor: 'rgba(30, 64, 175, 0.3)',
            maxHeight: height * 0.25,
            smoothness: 0.08,
          }
        : {
            intensity: 2.5,
            speed: 1.2,
            primaryColor: '#FFFFFF',
            secondaryColor: '#F3F4F6',
            accentColor: '#E5E7EB',
            tertiaryColor: '#F9FAFB',
            glowColor: 'rgba(255, 255, 255, 0.8)',
            shadowColor: 'rgba(243, 244, 246, 0.4)',
            maxHeight: height * 0.35,
            smoothness: 0.06,
          }
      );
      
      // Enhanced wave physics with more realistic movement
      waveDataRef.current.forEach((wave, i) => {
        const normalizedIndex = i / (numWaves - 1);
        
        // Multiple wave harmonics for complex movement
        const baseWave = Math.sin(timeRef.current * waveConfig.speed * wave.frequency + wave.offsetX);
        const harmonic1 = Math.sin(timeRef.current * waveConfig.speed * 1.5 * wave.frequency + wave.phase) * 0.6;
        const harmonic2 = Math.sin(timeRef.current * waveConfig.speed * 2.0 * wave.frequency + wave.phase * 1.5) * 0.3;
        const harmonic3 = Math.sin(timeRef.current * waveConfig.speed * 0.5 * wave.frequency + wave.phase * 0.7) * 0.4;
        
        // Enhanced center boost with smoother falloff
        const centerDistance = Math.abs(normalizedIndex - 0.5) * 2;
        const centerBoost = Math.pow(1 - centerDistance, 3) * 2.5 + 0.3;
        
        // More complex wave combination
        const waveSum = baseWave + harmonic1 + harmonic2 + harmonic3;
        const finalWave = Math.abs(waveSum) * wave.amplitude;
        
        wave.targetHeight = finalWave * waveConfig.intensity * centerBoost * 0.25 + 0.03;
        
        // Smoother physics with enhanced damping
        const heightDiff = wave.targetHeight - wave.height;
        const acceleration = heightDiff * 0.015 - wave.velocity * waveConfig.smoothness;
        wave.velocity += acceleration;
        wave.velocity *= 0.95; // Add slight damping
        wave.height += wave.velocity;
        
        // Update glow intensity
        wave.glowIntensity = 0.5 + Math.sin(timeRef.current * 2 + wave.phase) * 0.5;
      });
      
      const waveSpacing = width / (numWaves + 1);
      
      // Enhanced waveform rendering with multiple layers and effects
      waveDataRef.current.forEach((wave, i) => {
        const x = (i + 1) * waveSpacing;
        const waveHeight = Math.max(wave.height * waveConfig.maxHeight, 1);
        const barWidth = Math.min(waveSpacing * 0.8, isInline ? 3 : 6);
        
        // Multi-layer gradient with glow effect
        const primaryGradient = ctx.createLinearGradient(x, centerY - waveHeight/2, x, centerY + waveHeight/2);
        primaryGradient.addColorStop(0, waveConfig.tertiaryColor);
        primaryGradient.addColorStop(0.3, waveConfig.accentColor);
        primaryGradient.addColorStop(0.7, waveConfig.primaryColor);
        primaryGradient.addColorStop(1, waveConfig.secondaryColor);
        
        // Dynamic shadow based on wave height and glow intensity
        const dynamicBlur = (isInline ? 6 : 12) * wave.glowIntensity * (wave.height * 3 + 0.5);
        ctx.shadowBlur = Math.min(dynamicBlur, isInline ? 12 : 20);
        ctx.shadowColor = waveConfig.shadowColor;
        
        // Main bar with enhanced styling
        ctx.fillStyle = primaryGradient;
        ctx.beginPath();
        ctx.roundRect(
          x - barWidth / 2,
          centerY - waveHeight / 2,
          barWidth,
          waveHeight,
          barWidth / 2
        );
        ctx.fill();
        
        // Add inner highlight for depth
        const highlightGradient = ctx.createLinearGradient(x - barWidth/4, centerY - waveHeight/2, x + barWidth/4, centerY + waveHeight/2);
        highlightGradient.addColorStop(0, `${waveConfig.tertiaryColor}60`);
        highlightGradient.addColorStop(0.5, `${waveConfig.accentColor}40`);
        highlightGradient.addColorStop(1, 'transparent');
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.roundRect(
          x - barWidth / 4,
          centerY - waveHeight / 2,
          barWidth / 2,
          waveHeight,
          barWidth / 4
        );
        ctx.fill();
        
        // Outer glow ring for enhanced effect
        if (!isInline && wave.height > 0.15) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = waveConfig.glowColor;
          ctx.strokeStyle = waveConfig.glowColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(
            x - barWidth / 2 - 2,
            centerY - waveHeight / 2 - 2,
            barWidth + 4,
            waveHeight + 4,
            (barWidth + 4) / 2
          );
          ctx.stroke();
        }
      });
      
      ctx.shadowBlur = 0;
      
      // Enhanced particles with trails and better physics
      if (!isInline) {
        particlesRef.current.forEach(particle => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life += 0.01 * particle.pulseSpeed;
          
          // Add current position to trail
          particle.trail.push({ x: particle.x, y: particle.y, opacity: 1 });
          if (particle.trail.length > particle.maxTrailLength) {
            particle.trail.shift();
          }
          
          // Wrap around edges with smooth transition
          if (particle.x < -0.1) particle.x = 1.1;
          if (particle.x > 1.1) particle.x = -0.1;
          if (particle.y < -0.1) particle.y = 1.1;
          if (particle.y > 1.1) particle.y = -0.1;
          
          // Draw particle trail
          particle.trail.forEach((trailPoint, index) => {
            const trailAlpha = (index / particle.trail.length) * 0.3;
            const trailX = trailPoint.x * width;
            const trailY = trailPoint.y * height;
            const trailSize = particle.size * (0.3 + (index / particle.trail.length) * 0.7);
            
            ctx.fillStyle = `${waveConfig.primaryColor}${Math.floor(trailAlpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
          });
          
          // Draw main particle with enhanced glow
          const particleX = particle.x * width;
          const particleY = particle.y * height;
          const pulseValue = 0.6 + Math.sin(particle.life) * 0.4;
          const alpha = particle.opacity * pulseValue;
          
          // Outer glow
          ctx.shadowBlur = 8;
          ctx.shadowColor = waveConfig.glowColor;
          ctx.fillStyle = `${waveConfig.accentColor}${Math.floor(alpha * 0.7 * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particle.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Main particle
          ctx.shadowBlur = 4;
          ctx.fillStyle = `${waveConfig.primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner highlight
          ctx.shadowBlur = 0;
          ctx.fillStyle = `${waveConfig.tertiaryColor}${Math.floor(alpha * 0.8 * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particle.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          
          // Reset particle when cycle completes
          if (particle.life > 2 * Math.PI) {
            particle.life = 0;
            particle.opacity = Math.random() * 0.7;
            particle.trail = [];
          }
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type, isInline]);

  if (!isActive) return null;

  // Inline mode for chat bubbles with enhanced styling
  if (isInline) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {/* Subtle gradient background overlay */}
        <div 
          className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
            type === 'listening' 
              ? 'bg-gradient-to-br from-blue-500/5 via-blue-600/8 to-blue-700/5' 
              : 'bg-gradient-to-br from-emerald-500/5 via-emerald-600/8 to-emerald-700/5'
          }`}
          style={{
            backdropFilter: 'blur(1px)',
          }}
        />
        <canvas
          ref={canvasRef}
          className="relative w-full h-full z-10"
          style={{
            mixBlendMode: 'screen',
            filter: 'contrast(1.1) saturate(1.2)',
          }}
        />
        {/* Animated border effect */}
        <div 
          className={`absolute inset-0 rounded-2xl border transition-all duration-700 ${
            type === 'listening' 
              ? 'border-blue-400/20 shadow-lg shadow-blue-500/10' 
              : 'border-emerald-400/20 shadow-lg shadow-emerald-500/10'
          }`}
          style={{
            background: `linear-gradient(45deg, ${
              type === 'listening' 
                ? 'rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.05)' 
                : 'rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05)'
            })`,
          }}
        />
      </div>
    );
  }

  // Full-screen mode with enhanced visual effects
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Enhanced background with animated gradients */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          type === 'listening' 
            ? 'bg-gradient-to-br from-slate-900/8 via-blue-900/12 to-slate-900/8' 
            : 'bg-gradient-to-br from-slate-900/8 via-emerald-900/12 to-slate-900/8'
        }`}
        style={{
          backdropFilter: 'blur(8px) saturate(1.2)',
          background: `radial-gradient(circle at 50% 50%, ${
            type === 'listening' 
              ? 'rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.05) 50%, transparent 100%' 
              : 'rgba(16, 185, 129, 0.08) 0%, rgba(5, 46, 22, 0.05) 50%, transparent 100%'
          })`,
        }}
      />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 animate-pulse ${
              type === 'listening' ? 'bg-blue-500' : 'bg-emerald-500'
            }`}
            style={{
              width: `${60 + i * 40}px`,
              height: `${60 + i * 40}px`,
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${4 + i}s`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>
      
      {/* Main Wave Container with enhanced styling */}
      <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            filter: 'contrast(1.1) brightness(0.9) saturate(1.1)',
            mixBlendMode: 'screen',
          }}
        />
        
        {/* Center Content with enhanced effects */}
        <div className="relative z-10 text-center">
          <div className="mb-12">
            {/* Enhanced AI Avatar with multiple rings */}
            <div className="relative mb-8">
              <div 
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-700 ${
                  type === 'listening' 
                    ? 'bg-gradient-to-br from-blue-500/20 via-blue-600/25 to-blue-700/20 border-2 border-blue-400/40' 
                    : 'bg-gradient-to-br from-emerald-500/20 via-emerald-600/25 to-emerald-700/20 border-2 border-emerald-400/40'
                }`}
                style={{
                  backdropFilter: 'blur(12px)',
                  boxShadow: type === 'listening' 
                    ? '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(96, 165, 250, 0.1)' 
                    : '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.1)'
                }}
              >
                <span className="text-2xl font-bold text-white/90 drop-shadow-lg">
                  AI
                </span>
              </div>
              
              {/* Multiple animated rings */}
              {[1, 2, 3].map(ring => (
                <div 
                  key={ring}
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border animate-ping ${
                    type === 'listening' ? 'border-blue-400/30' : 'border-emerald-400/30'
                  }`}
                  style={{
                    width: `${88 + ring * 16}px`,
                    height: `${88 + ring * 16}px`,
                    animationDuration: `${2.5 + ring * 0.5}s`,
                    animationDelay: `${ring * 0.3}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Enhanced Typography with text effects */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 tracking-wide">
              <span 
                className={`text-transparent bg-clip-text ${
                  type === 'listening' 
                    ? 'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400' 
                    : 'bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-400'
                }`}
                style={{
                  textShadow: type === 'listening' 
                    ? '0 0 20px rgba(59, 130, 246, 0.3)' 
                    : '0 0 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                AI Assistant
              </span>
            </h2>
            
            <div className="space-y-4">
              <p className={`text-lg sm:text-xl font-light ${
                type === 'listening' ? 'text-blue-300/90' : 'text-emerald-300/90'
              }`}>
                {type === 'listening' ? 'Listening...' : 'Speaking...'}
              </p>
              
              <p className="text-base text-gray-400/70 font-light">
                {type === 'listening' 
                  ? 'Share your thoughts' 
                  : 'Providing responses'
                }
              </p>
            </div>
          </div>
          
          {/* Enhanced status dots with wave effect */}
          <div className="flex justify-center space-x-3">
            {[0, 1, 2].map(dot => (
              <div 
                key={dot}
                className={`w-2 h-2 rounded-full animate-pulse ${
                  type === 'listening' ? 'bg-blue-400/80' : 'bg-emerald-400/80'
                }`}
                style={{
                  animationDelay: `${dot * 0.3}s`,
                  animationDuration: '2s',
                  boxShadow: type === 'listening' 
                    ? '0 0 8px rgba(96, 165, 250, 0.6)' 
                    : '0 0 8px rgba(52, 211, 153, 0.6)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceWaveform;
