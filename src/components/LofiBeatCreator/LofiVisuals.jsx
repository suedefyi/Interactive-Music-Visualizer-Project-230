import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const LofiVisuals = ({ isPlaying, currentStep }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          hue: 30 + Math.random() * 60 // Orange/yellow range
        });
      }
    }

    let time = 0;

    const draw = () => {
      // Clear with vintage tint
      ctx.fillStyle = 'rgba(20, 15, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw vinyl record
      const recordRadius = Math.min(canvas.width, canvas.height) * 0.15;
      const rotation = isPlaying ? time * 0.02 : 0;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Record base
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, recordRadius);
      gradient.addColorStop(0, '#2a1810');
      gradient.addColorStop(0.7, '#1a1008');
      gradient.addColorStop(1, '#0a0604');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, recordRadius, 0, Math.PI * 2);
      ctx.fill();

      // Record grooves
      for (let r = recordRadius * 0.3; r < recordRadius * 0.9; r += 3) {
        ctx.strokeStyle = `rgba(139, 69, 19, ${0.3 + Math.sin(time * 0.1) * 0.1})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center hole
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, 0, recordRadius * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw floating particles
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulse with beat
        const beatPulse = currentStep % 4 === 0 && isPlaying ? 1.5 : 1;
        const size = particle.size * beatPulse;

        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cassette tape
      const tapeWidth = canvas.width * 0.4;
      const tapeHeight = canvas.height * 0.25;
      const tapeX = canvas.width * 0.7;
      const tapeY = canvas.height * 0.7;

      // Tape body
      ctx.fillStyle = 'rgba(101, 67, 33, 0.8)';
      ctx.fillRect(tapeX - tapeWidth/2, tapeY - tapeHeight/2, tapeWidth, tapeHeight);

      // Tape reels
      const reelRadius = tapeHeight * 0.15;
      const reelOffset = tapeWidth * 0.25;
      
      ['left', 'right'].forEach((side, index) => {
        const reelX = tapeX + (side === 'left' ? -reelOffset : reelOffset);
        const reelRotation = isPlaying ? time * (0.03 + index * 0.01) : 0;
        
        ctx.save();
        ctx.translate(reelX, tapeY);
        ctx.rotate(reelRotation);
        
        ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, reelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reel spokes
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = 'rgba(160, 82, 45, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(i * Math.PI / 3) * reelRadius * 0.8,
            Math.sin(i * Math.PI / 3) * reelRadius * 0.8
          );
          ctx.stroke();
        }
        
        ctx.restore();
      });

      // Add vintage film grain
      if (Math.random() < 0.1) {
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            1, 1
          );
        }
      }

      time += 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStep]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-orange-900/30 to-yellow-900/30 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-4 left-4 text-orange-300/60 text-xs"
      >
        ♪ lofi vibes ♪
      </motion.div>
      
      <motion.div
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-4 right-4 text-orange-400/40 text-2xl"
      >
        🎧
      </motion.div>
    </div>
  );
};

export default LofiVisuals;