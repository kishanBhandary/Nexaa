import React, { useEffect, useRef, useState } from 'react';

const VoiceWaveform = ({ isActive, type = 'listening' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  
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

    const animate = () => {
      timeRef.current += 0.015;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas with subtle fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Wave parameters based on type
      const waveConfig = type === 'listening' 
        ? {
            amplitude: 80,
            frequency: 0.8,
            speed: 1,
            rings: 4,
            baseRadius: 120,
            colors: ['rgba(59, 130, 246, 0.6)', 'rgba(147, 51, 234, 0.4)', 'rgba(79, 70, 229, 0.3)']
          }
        : {
            amplitude: 120,
            frequency: 1.2,
            speed: 1.5,
            rings: 6,
            baseRadius: 140,
            colors: ['rgba(79, 70, 229, 0.7)', 'rgba(147, 51, 234, 0.6)', 'rgba(59, 130, 246, 0.4)']
          };

      // Draw multiple wave rings
      for (let ring = 0; ring < waveConfig.rings; ring++) {
        const radius = waveConfig.baseRadius + ring * 40;
        const points = 128;
        
        // Create gradient for this ring
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius + waveConfig.amplitude
        );
        gradient.addColorStop(0, waveConfig.colors[ring % waveConfig.colors.length]);
        gradient.addColorStop(0.5, waveConfig.colors[(ring + 1) % waveConfig.colors.length]);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 - ring * 0.3;
        ctx.beginPath();
        
        // Generate wave points
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // Multiple sine waves for complex fluid motion
          const wave1 = Math.sin(timeRef.current * waveConfig.speed + angle * waveConfig.frequency + ring * 0.5);
          const wave2 = Math.sin(timeRef.current * waveConfig.speed * 0.7 + angle * waveConfig.frequency * 1.3 + ring * 0.8);
          const wave3 = Math.sin(timeRef.current * waveConfig.speed * 1.5 + angle * waveConfig.frequency * 0.6 + ring * 1.2);
          
          const waveOffset = (wave1 * 0.6 + wave2 * 0.3 + wave3 * 0.1) * waveConfig.amplitude * (1 - ring * 0.15);
          const currentRadius = radius + waveOffset;
          
          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.stroke();
        
        // Add subtle fill for inner rings
        if (ring < 2) {
          ctx.fillStyle = waveConfig.colors[ring].replace(/0\.\d+/, '0.1');
          ctx.fill();
        }
      }
      
      // Draw central glow
      const centralGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 60
      );
      centralGlow.addColorStop(0, type === 'listening' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(147, 51, 234, 0.9)');
      centralGlow.addColorStop(0.5, type === 'listening' ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.6)');
      centralGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 + Math.sin(timeRef.current * 2) * 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Floating particles
      for (let i = 0; i < 12; i++) {
        const particleAngle = (i / 12) * Math.PI * 2 + timeRef.current * 0.5;
        const particleRadius = 200 + Math.sin(timeRef.current * 1.5 + i) * 50;
        const particleX = centerX + Math.cos(particleAngle) * particleRadius;
        const particleY = centerY + Math.sin(particleAngle) * particleRadius;
        
        const alpha = 0.6 + Math.sin(timeRef.current * 2 + i) * 0.4;
        ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2 + Math.sin(timeRef.current * 3 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Particle glow
        const particleGlow = ctx.createRadialGradient(
          particleX, particleY, 0,
          particleX, particleY, 8
        );
        particleGlow.addColorStop(0, `rgba(147, 51, 234, ${alpha * 0.8})`);
        particleGlow.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 8, 0, Math.PI * 2);
        ctx.fill();
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
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Main Wave Container */}
      <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
        {/* Canvas for Wave Animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            width: '100%', 
            height: '100%',
            filter: 'blur(0.5px)'
          }}
        />
        
        {/* Center Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-2 tracking-wide">
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