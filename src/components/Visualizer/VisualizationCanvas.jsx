import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const VisualizationCanvas = ({ visualization, audioData, frequencyData, settings, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let time = 0;
    let particles = [];

    // Optimized particle count
    const maxParticles = Math.min(settings.particleCount, 200);

    // Initialize particles for particle visualization
    if (visualization === 'particles') {
      particles = Array.from({ length: maxParticles }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 360
      }));
    }

    const draw = () => {
      // Throttle canvas updates for better performance
      if (time % 2 === 0) {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Simplified filter application
        const brightness = settings.brightness / 100;
        const contrast = settings.contrast / 100;
        
        ctx.globalAlpha = brightness;
        ctx.filter = `contrast(${contrast}) blur(${Math.min(settings.blur, 5)}px)`;

        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;

        switch (visualization) {
          case 'bars':
            drawFrequencyBars(ctx, frequencyData, dimensions, settings, time);
            break;
          case 'circle':
            drawCircularSpectrum(ctx, frequencyData, centerX, centerY, settings, time);
            break;
          case 'waveform':
            drawWaveform(ctx, audioData, dimensions, settings, time);
            break;
          case 'particles':
            drawParticles(ctx, particles, frequencyData, dimensions, settings, time);
            break;
          case 'spiral':
            drawSpiral(ctx, frequencyData, centerX, centerY, settings, time);
            break;
          default:
            drawFrequencyBars(ctx, frequencyData, dimensions, settings, time);
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
  }, [visualization, dimensions, settings, audioData, frequencyData, isListening]);

  // Optimized visualization functions
  const drawFrequencyBars = (ctx, data, { width, height }, settings, time) => {
    const barCount = Math.min(data.length, 64); // Reduced bar count
    const barWidth = width / barCount;
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * data.length);
      const barHeight = (data[dataIndex] / 255) * height * scale;
      const hue = (i * 6 + time * colorSpeed * 2) % 360;
      
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
    }
  };

  const drawCircularSpectrum = (ctx, data, centerX, centerY, settings, time) => {
    const radius = Math.min(centerX, centerY) * 0.6;
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const segments = Math.min(data.length, 48); // Reduced segments

    for (let i = 0; i < segments; i++) {
      const dataIndex = Math.floor((i / segments) * data.length);
      const angle = (i / segments) * Math.PI * 2;
      const barHeight = (data[dataIndex] / 255) * radius * scale;
      const hue = (i * 8 + time * colorSpeed * 2) % 360;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawWaveform = (ctx, data, { width, height }, settings, time) => {
    const centerY = height / 2;
    const scale = settings.scale / 50;
    const colorSpeed = settings.colorSpeed / 100;
    const stepSize = Math.max(1, Math.floor(data.length / width)); // Optimize by skipping points

    ctx.strokeStyle = `hsl(${(time * colorSpeed * 2) % 360}, 70%, 50%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < data.length; i += stepSize) {
      const x = (i / data.length) * width;
      const y = centerY + ((data[i] - 128) / 128) * centerY * scale;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawParticles = (ctx, particles, data, { width, height }, settings, time) => {
    const avgFreq = data.reduce((sum, val) => sum + val, 0) / data.length;
    const intensity = avgFreq / 255;
    const colorSpeed = settings.colorSpeed / 100;

    // Update and draw fewer particles for better performance
    const activeParticles = particles.slice(0, Math.min(particles.length, 100));

    activeParticles.forEach((particle, index) => {
      const freqIndex = Math.floor((index / activeParticles.length) * data.length);
      const freq = data[freqIndex] / 255;

      particle.x += particle.vx * (1 + freq);
      particle.y += particle.vy * (1 + freq);

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));

      const hue = (particle.hue + time * colorSpeed) % 360;
      const size = particle.size * (1 + freq);

      ctx.fillStyle = `hsl(${hue}, 70%, ${50 + intensity * 30}%)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpiral = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const segments = Math.min(data.length, 32); // Reduced segments

    for (let i = 0; i < segments; i++) {
      const dataIndex = Math.floor((i / segments) * data.length);
      const angle = (i / segments) * Math.PI * 4 + time * 0.02;
      const radius = (i / segments) * Math.min(centerX, centerY) * 0.8;
      const intensity = data[dataIndex] / 255;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = intensity * 8 * scale + 2;
      const hue = (i * 12 + time * colorSpeed) % 360;

      ctx.fillStyle = `hsl(${hue}, 70%, ${30 + intensity * 40}%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{
          transform: `rotate(${settings.rotation}deg) scale(${settings.scale / 50})`
        }}
      />
      {!isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <div className="text-center text-white">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🎵
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Start Your Audio Experience</h3>
            <p className="text-white/70">Use microphone or upload music to begin</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VisualizationCanvas;