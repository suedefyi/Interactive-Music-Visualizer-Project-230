import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart, FiCircle, FiActivity, FiZap, FiSun, FiTarget } = FiIcons;

// Reduced visualizations for better performance
const visualizations = [
  { id: 'bars', name: 'Frequency Bars', icon: FiBarChart },
  { id: 'circle', name: 'Circular Spectrum', icon: FiCircle },
  { id: 'waveform', name: 'Waveform', icon: FiActivity },
  { id: 'particles', name: 'Particles', icon: FiZap },
  { id: 'spiral', name: 'Spiral', icon: FiSun },
  { id: 'mandala', name: 'Mandala', icon: FiTarget }
];

const ControlPanel = ({ 
  selectedVisualization, 
  onVisualizationChange, 
  settings, 
  onSettingChange, 
  isListening, 
  onMicrophoneToggle 
}) => {
  const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-white/80 text-sm font-medium">{label}</label>
        <span className="text-white/60 text-sm">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const Knob = ({ label, value, onChange, min = 0, max = 100 }) => {
    const angle = ((value - min) / (max - min)) * 270 - 135;

    return (
      <div className="flex flex-col items-center">
        <label className="text-white/80 text-xs mb-2">{label}</label>
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 relative">
            <div 
              className="absolute top-1 left-1/2 w-0.5 h-4 bg-blue-400 origin-bottom transform -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-white/60 text-xs mt-1">{value}</span>
      </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-white font-bold text-xl mb-6">Controls</h2>

      <div className="mb-8">
        <h3 className="text-white/80 font-semibold mb-4">Visualization Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {visualizations.map((viz) => (
            <motion.button
              key={viz.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVisualizationChange(viz.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedVisualization === viz.id
                  ? 'bg-blue-500/30 border-blue-400 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
            >
              <SafeIcon icon={viz.icon} className="text-lg mb-1" />
              <div className="text-xs">{viz.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-white/80 font-semibold mb-4">Audio Settings</h3>
        <Slider
          label="Sensitivity"
          value={settings.sensitivity}
          onChange={(value) => onSettingChange('sensitivity', value)}
        />
        <Slider
          label="Smoothing"
          value={settings.smoothing}
          onChange={(value) => onSettingChange('smoothing', value)}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-white/80 font-semibold mb-4">Visual Settings</h3>
        <Slider
          label="Color Speed"
          value={settings.colorSpeed}
          onChange={(value) => onSettingChange('colorSpeed', value)}
        />
        <Slider
          label="Scale"
          value={settings.scale}
          onChange={(value) => onSettingChange('scale', value)}
        />
        <Slider
          label="Rotation"
          value={settings.rotation}
          onChange={(value) => onSettingChange('rotation', value)}
          min={-180}
          max={180}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-white/80 font-semibold mb-4">Effects</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Knob
            label="Brightness"
            value={settings.brightness}
            onChange={(value) => onSettingChange('brightness', value)}
          />
          <Knob
            label="Contrast"
            value={settings.contrast}
            onChange={(value) => onSettingChange('contrast', value)}
          />
          <Knob
            label="Saturation"
            value={settings.saturation}
            onChange={(value) => onSettingChange('saturation', value)}
          />
        </div>
        <Slider
          label="Blur"
          value={settings.blur}
          onChange={(value) => onSettingChange('blur', value)}
          max={10}
        />
      </div>

      {selectedVisualization === 'particles' && (
        <div className="mb-8">
          <h3 className="text-white/80 font-semibold mb-4">Particle Settings</h3>
          <Slider
            label="Particle Count"
            value={settings.particleCount}
            onChange={(value) => onSettingChange('particleCount', value)}
            min={25}
            max={200}
            step={5}
          />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;