import React, { useEffect, useRef, useState } from 'react';

const VoiceWaveform = ({ isActive, type = 'listening' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const barsRef = useRef([]);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match container
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize bars for waveform
    const numBars = 40;
    if (barsRef.current.length === 0) {
      barsRef.current = Array.from({ length: numBars }, (_, i) => ({
        height: Math.random() * 0.5 + 0.1,
        targetHeight: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.02 + Math.random() * 0.03
      }));
    }

    const animate = () => {
      timeRef.current += 0.02;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Wave parameters based on type - matching app theme
      const waveConfig = type === 'listening' 
        ? {
            intensity: 0.8,
            speed: 1,
            color: 'rgba(255, 255, 255, 0.9)', // Pure white
            glowColor: 'rgba(255, 255, 255, 0.6)',
            maxHeight: height * 0.15
          }
        : {
            intensity: 1.2,
            speed: 1.5,
            color: 'rgba(229, 231, 235, 0.9)', // Light gray
            glowColor: 'rgba(255, 255, 255, 0.8)',
            maxHeight: height * 0.25
          };
      
      const barWidth = Math.min(width / numBars * 0.7, 8);
      const spacing = width / numBars;
      
      // Update bar heights with smooth transitions
      barsRef.current.forEach((bar, i) => {
        // Create organic movement
        const wave1 = Math.sin(timeRef.current * waveConfig.speed + i * 0.3) * waveConfig.intensity;
        const wave2 = Math.sin(timeRef.current * waveConfig.speed * 1.5 + i * 0.15) * 0.5;
        const wave3 = Math.sin(timeRef.current * waveConfig.speed * 0.8 + i * 0.5) * 0.3;
        
        bar.targetHeight = Math.abs(wave1 + wave2 + wave3) * 0.3 + 0.1;
        
        // Smooth interpolation
        bar.height += (bar.targetHeight - bar.height) * 0.1;
      });
      
      // Draw waveform bars
      barsRef.current.forEach((bar, i) => {
        const x = centerX - (numBars * spacing) / 2 + i * spacing + spacing / 2;
        const barHeight = bar.height * waveConfig.maxHeight;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, centerY - barHeight/2, x, centerY + barHeight/2);
        gradient.addColorStop(0, waveConfig.color);
        gradient.addColorStop(0.5, waveConfig.glowColor);
        gradient.addColorStop(1, waveConfig.color);
        
        // Draw main bar
        ctx.fillStyle = gradient;
        ctx.fillRect(
          x - barWidth / 2, 
          centerY - barHeight / 2, 
          barWidth, 
          barHeight
        );
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = waveConfig.glowColor;
        ctx.fillRect(
          x - barWidth / 2, 
          centerY - barHeight / 2, 
          barWidth, 
          barHeight
        );
        ctx.shadowBlur = 0;
        
        // Add reflection effect
        ctx.globalAlpha = 0.3;
        const reflectionGradient = ctx.createLinearGradient(
          x, centerY + barHeight/2, 
          x, centerY + barHeight/2 + barHeight * 0.5
        );
        reflectionGradient.addColorStop(0, waveConfig.color);
        reflectionGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(
          x - barWidth / 2, 
          centerY + barHeight / 2, 
          barWidth, 
          barHeight * 0.5
        );
        ctx.globalAlpha = 1;
      });
      
      // Add floating particles for extra magic - matching theme
      for (let i = 0; i < 8; i++) {
        const particleX = centerX + Math.sin(timeRef.current * 0.5 + i * 0.8) * (width * 0.3);
        const particleY = centerY + Math.cos(timeRef.current * 0.7 + i * 0.6) * 30;
        const alpha = 0.3 + Math.sin(timeRef.current * 2 + i) * 0.2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Particle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = waveConfig.glowColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Background Overlay - matching app gradient theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/80 to-black backdrop-blur-sm" />
      
      {/* Main Wave Container */}
      <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
        {/* Canvas for Waveform Animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />
        
        {/* Center Content */}
        <div className="relative z-10 text-center">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 tracking-wide">
              AI
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 font-light tracking-widest">
              {type === 'listening' ? 'Listening...' : 'Speaking...'}
            </p>
          </div>
          
          {/* Subtle pulse indicator */}
          <div className="w-2 h-2 bg-white rounded-full mx-auto animate-pulse"
               style={{
                 animationDuration: type === 'listening' ? '2s' : '1.5s', 
                 boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
               }}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceWaveform;
