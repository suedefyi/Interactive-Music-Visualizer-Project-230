import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiX, FiBarChart, FiCircle, FiActivity, FiZap } = FiIcons;

const MobileControls = ({ 
  selectedVisualization, 
  onVisualizationChange, 
  settings, 
  onSettingChange,
  showControls,
  onToggleControls
}) => {
  const [activeTab, setActiveTab] = useState('viz');

  const visualizations = [
    { id: 'bars', name: 'Bars', icon: FiBarChart },
    { id: 'circle', name: 'Circle', icon: FiCircle },
    { id: 'waveform', name: 'Wave', icon: FiActivity },
    { id: 'particles', name: 'Particles', icon: FiZap },
  ];

  const QuickSlider = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-white/70 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleControls}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <SafeIcon icon={showControls ? FiX : FiSettings} />
      </motion.button>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-t border-white/20 max-h-80 overflow-hidden"
          >
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab('viz')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'viz' ? 'text-white bg-white/10' : 'text-white/70'
                }`}
              >
                Visualizations
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'settings' ? 'text-white bg-white/10' : 'text-white/70'
                }`}
              >
                Settings
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-60">
              {activeTab === 'viz' && (
                <div className="grid grid-cols-4 gap-2">
                  {visualizations.map((viz) => (
                    <motion.button
                      key={viz.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onVisualizationChange(viz.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedVisualization === viz.id
                          ? 'bg-blue-500/30 border-blue-400 text-white'
                          : 'bg-white/10 border-white/20 text-white/70'
                      }`}
                    >
                      <SafeIcon icon={viz.icon} className="text-lg mb-1" />
                      <div className="text-xs">{viz.name}</div>
                    </motion.button>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-3">
                  <QuickSlider
                    label="Sensitivity"
                    value={settings.sensitivity}
                    onChange={(value) => onSettingChange('sensitivity', value)}
                  />
                  <QuickSlider
                    label="Color Speed"
                    value={settings.colorSpeed}
                    onChange={(value) => onSettingChange('colorSpeed', value)}
                  />
                  <QuickSlider
                    label="Scale"
                    value={settings.scale}
                    onChange={(value) => onSettingChange('scale', value)}
                  />
                  <QuickSlider
                    label="Brightness"
                    value={settings.brightness}
                    onChange={(value) => onSettingChange('brightness', value)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileControls;