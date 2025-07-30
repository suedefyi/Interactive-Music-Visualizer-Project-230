import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import Header from './Header';
import ControlPanel from './ControlPanel';
import VisualizationCanvas from './VisualizationCanvas';
import MobileControls from './MobileControls';

const Visualizer = ({ onShowGuide }) => {
  const { user, logout } = useAuth();
  const { isListening, startMicrophone, stopMicrophone, audioData, frequencyData } = useAudio();
  
  const [selectedVisualization, setSelectedVisualization] = useState('bars');
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [settings, setSettings] = useState({
    sensitivity: 50,
    smoothing: 30,
    colorSpeed: 25,
    scale: 50,
    rotation: 0,
    brightness: 75,
    contrast: 50,
    saturation: 75,
    blur: 0,
    particleCount: 100
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMicrophoneToggle = async () => {
    if (isListening) {
      stopMicrophone();
    } else {
      const result = await startMicrophone();
      if (!result.success) {
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header 
        user={user}
        onLogout={handleLogout}
        onShowGuide={onShowGuide}
        isListening={isListening}
        onMicrophoneToggle={handleMicrophoneToggle}
        onToggleControls={() => setShowControls(!showControls)}
        showControls={showControls}
      />

      <div className="flex h-screen pt-16">
        <AnimatePresence>
          {showControls && !isMobile && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 overflow-y-auto"
            >
              <ControlPanel
                selectedVisualization={selectedVisualization}
                onVisualizationChange={setSelectedVisualization}
                settings={settings}
                onSettingChange={handleSettingChange}
                isListening={isListening}
                onMicrophoneToggle={handleMicrophoneToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative">
          <VisualizationCanvas
            visualization={selectedVisualization}
            audioData={audioData}
            frequencyData={frequencyData}
            settings={settings}
            isListening={isListening}
          />
        </div>
      </div>

      {isMobile && (
        <MobileControls
          selectedVisualization={selectedVisualization}
          onVisualizationChange={setSelectedVisualization}
          settings={settings}
          onSettingChange={handleSettingChange}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
        />
      )}
    </div>
  );
};

export default Visualizer;