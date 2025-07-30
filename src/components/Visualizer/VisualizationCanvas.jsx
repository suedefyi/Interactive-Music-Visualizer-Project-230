import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const VisualizationCanvas = ({ 
  visualization, 
  audioData, 
  frequencyData, 
  settings, 
  isListening 
}) => {
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

    // Initialize particles for particle visualization
    if (visualization === 'particles') {
      particles = Array.from({ length: settings.particleCount }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 360
      }));
    }

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Apply effects
      ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px)`;
      
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      time += 0.016;

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
        case 'galaxy':
          drawGalaxy(ctx, frequencyData, centerX, centerY, settings, time);
          break;
        case 'tunnel':
          drawTunnel(ctx, frequencyData, centerX, centerY, settings, time);
          break;
        case 'mandala':
          drawMandala(ctx, frequencyData, centerX, centerY, settings, time);
          break;
        case 'crystals':
          drawCrystals(ctx, frequencyData, centerX, centerY, settings, time);
          break;
        case 'matrix':
          drawMatrix(ctx, frequencyData, dimensions, settings, time);
          break;
        default:
          drawFrequencyBars(ctx, frequencyData, dimensions, settings, time);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visualization, dimensions, settings, audioData, frequencyData, isListening]);

  // Visualization functions
  const drawFrequencyBars = (ctx, data, { width, height }, settings, time) => {
    const barWidth = width / data.length;
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * height * scale;
      const hue = (i * 2 + time * colorSpeed * 100) % 360;
      
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }
  };

  const drawCircularSpectrum = (ctx, data, centerX, centerY, settings, time) => {
    const radius = Math.min(centerX, centerY) * 0.6;
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;

    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2;
      const barHeight = (data[i] / 255) * radius * scale;
      const hue = (i * 3 + time * colorSpeed * 100) % 360;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);
      
      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.lineWidth = 2;
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

    ctx.strokeStyle = `hsl(${(time * colorSpeed * 100) % 360}, 70%, 50%)`;
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
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

    particles.forEach((particle, index) => {
      const freqIndex = Math.floor((index / particles.length) * data.length);
      const freq = data[freqIndex] / 255;
      
      particle.x += particle.vx * (1 + freq * 2);
      particle.y += particle.vy * (1 + freq * 2);
      
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
      
      const hue = (particle.hue + time * colorSpeed * 100) % 360;
      const size = particle.size * (1 + freq * 2);
      
      ctx.fillStyle = `hsl(${hue}, 70%, ${50 + intensity * 30}%)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpiral = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;

    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 8 + time;
      const radius = (i / data.length) * Math.min(centerX, centerY) * 0.8;
      const intensity = data[i] / 255;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = intensity * 10 * scale;
      
      const hue = (i * 2 + time * colorSpeed * 100) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, ${30 + intensity * 40}%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawGalaxy = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;

    for (let i = 0; i < data.length; i++) {
      const intensity = data[i] / 255;
      const angle = (i / data.length) * Math.PI * 4 + time * 0.5;
      const radius = (intensity * 0.5 + 0.5) * Math.min(centerX, centerY) * 0.7;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const hue = (angle * 50 + time * colorSpeed * 100) % 360;
      const alpha = intensity * 0.8 + 0.2;
      
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, intensity * 8 * scale + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawTunnel = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const numRings = 20;

    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = (ring / numRings) * Math.min(centerX, centerY) * 0.8;
      const segments = 32;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + time + ring * 0.1;
        const dataIndex = Math.floor((i / segments) * data.length);
        const intensity = data[dataIndex] / 255;
        
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        
        const hue = (ring * 20 + i * 5 + time * colorSpeed * 100) % 360;
        const brightness = 30 + intensity * 50 + (ring / numRings) * 20;
        
        ctx.fillStyle = `hsl(${hue}, 70%, ${brightness}%)`;
        ctx.beginPath();
        ctx.arc(x, y, intensity * 5 * scale + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawMandala = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const petals = 8;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.1);

    for (let petal = 0; petal < petals; petal++) {
      ctx.save();
      ctx.rotate((petal / petals) * Math.PI * 2);
      
      for (let i = 0; i < data.length / 4; i++) {
        const intensity = data[i] / 255;
        const radius = (i / (data.length / 4)) * Math.min(centerX, centerY) * 0.6;
        const angle = (i / (data.length / 4)) * Math.PI * 2;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.5;
        
        const hue = (petal * 45 + i * 2 + time * colorSpeed * 100) % 360;
        const size = intensity * 6 * scale + 1;
        
        ctx.fillStyle = `hsl(${hue}, 70%, ${40 + intensity * 30}%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    ctx.restore();
  };

  const drawCrystals = (ctx, data, centerX, centerY, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const numCrystals = 12;

    for (let crystal = 0; crystal < numCrystals; crystal++) {
      const angle = (crystal / numCrystals) * Math.PI * 2 + time * 0.2;
      const distance = Math.min(centerX, centerY) * 0.3;
      const crystalX = centerX + Math.cos(angle) * distance;
      const crystalY = centerY + Math.sin(angle) * distance;
      
      const dataIndex = Math.floor((crystal / numCrystals) * data.length);
      const intensity = data[dataIndex] / 255;
      
      const size = intensity * 50 * scale + 20;
      const hue = (crystal * 30 + time * colorSpeed * 100) % 360;
      
      // Draw crystal shape
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const vertexAngle = (i / 6) * Math.PI * 2;
        const x = crystalX + Math.cos(vertexAngle) * size;
        const y = crystalY + Math.sin(vertexAngle) * size;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawMatrix = (ctx, data, { width, height }, settings, time) => {
    const colorSpeed = settings.colorSpeed / 100;
    const scale = settings.scale / 50;
    const cols = 20;
    const rows = 15;
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const dataIndex = Math.floor(((col + row) / (cols + rows)) * data.length);
        const intensity = data[dataIndex] / 255;
        
        if (intensity > 0.1) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          
          const hue = (col * 15 + row * 10 + time * colorSpeed * 100) % 360;
          const alpha = intensity * scale;
          
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
          ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
        }
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: `blur(${settings.blur}px)`,
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
            <p className="text-white/70">Click the microphone button to begin visualizing</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VisualizationCanvas;