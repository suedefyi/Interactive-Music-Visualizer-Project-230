import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import DrumMachine from './DrumMachine';
import MelodySynth from './MelodySynth';
import LofiVisuals from './LofiVisuals';
import BeatPresets from './BeatPresets';
import AudioRecorder from './AudioRecorder';

const { FiPlay, FiPause, FiSquare, FiMusic, FiX, FiSettings, FiVolume2, FiFolder, FiDownload } = FiIcons;

const LofiBeatCreator = ({ isVisible, onToggle, onAudioSourceChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(85);
  const [volume, setVolume] = useState(0.7);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisuals, setShowVisuals] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [activeTab, setActiveTab] = useState('drums');
  const [isRecording, setIsRecording] = useState(false);
  
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserRef = useRef(null);

  // Store current patterns for preset saving
  const [currentPatterns, setCurrentPatterns] = useState({
    drums: {},
    synths: {}
  });

  useEffect(() => {
    initAudioContext();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const initAudioContext = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // FIXED: Proper audio graph connection
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      gainNodeRef.current.gain.value = volume;
      
      console.log('Audio context initialized:', {
        state: audioContextRef.current.state,
        sampleRate: audioContextRef.current.sampleRate,
        gainNode: !!gainNodeRef.current,
        analyser: !!analyserRef.current
      });
      
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  const startSequencer = async () => {
    if (!audioContextRef.current) {
      await initAudioContext();
    }
    
    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    const stepTime = (60 / bpm / 4) * 1000; // 16th notes
    
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
    }, stepTime);
    
    setIsPlaying(true);
    
    // Connect to visualizer
    if (onAudioSourceChange && analyserRef.current) {
      onAudioSourceChange(analyserRef.current);
    }
    
    console.log('Sequencer started at', bpm, 'BPM');
  };

  const stopSequencer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(0);
    console.log('Sequencer stopped');
  };

  const handlePlayStop = () => {
    if (isPlaying) {
      stopSequencer();
    } else {
      startSequencer();
    }
  };

  const handleLoadPreset = (preset) => {
    // Stop current playback
    if (isPlaying) {
      stopSequencer();
    }

    // Apply preset settings
    setBpm(preset.bpm || 85);
    
    // The patterns will be loaded by the DrumMachine and MelodySynth components
    // through their own state management
    setShowPresets(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  if (!isVisible) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed bottom-20 left-4 z-50 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <SafeIcon icon={FiMusic} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed left-0 top-16 bottom-0 w-96 bg-gradient-to-b from-orange-900/90 to-yellow-900/90 backdrop-blur-lg border-r border-orange-300/20 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-orange-300/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-orange-100 font-semibold text-lg">Lofi Beat Creator</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(!showRecorder)}
              className={`text-orange-200/70 hover:text-orange-100 transition-colors ${isRecording ? 'text-red-400' : ''}`}
              title="Export Beat"
            >
              <SafeIcon icon={FiDownload} />
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="text-orange-200/70 hover:text-orange-100 transition-colors"
              title="Beat Presets"
            >
              <SafeIcon icon={FiFolder} />
            </button>
            <button
              onClick={() => setShowVisuals(!showVisuals)}
              className="text-orange-200/70 hover:text-orange-100 transition-colors"
              title="Toggle Visuals"
            >
              <SafeIcon icon={FiSettings} />
            </button>
            <button
              onClick={onToggle}
              className="text-orange-200/70 hover:text-orange-100 transition-colors"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-2 bg-red-500/20 border border-red-400/50 rounded-lg flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-400 rounded-full"
            />
            <span className="text-red-200 text-sm font-medium">Recording in progress...</span>
          </motion.div>
        )}

        {/* Transport Controls */}
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayStop}
            className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <SafeIcon icon={isPlaying ? FiPause : FiPlay} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopSequencer}
            className="w-10 h-10 bg-red-500/80 rounded-lg flex items-center justify-center text-white"
          >
            <SafeIcon icon={FiSquare} />
          </motion.button>

          <div className="flex-1">
            <div className="text-orange-200 text-sm mb-1">BPM: {bpm}</div>
            <input
              type="range"
              min="60"
              max="140"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full h-2 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 mb-4">
          <SafeIcon icon={FiVolume2} className="text-orange-200/70" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-orange-200/70 text-xs w-8">{Math.round(volume * 100)}</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-orange-300/20">
          <button
            onClick={() => setActiveTab('drums')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'drums' ? 'text-orange-100 border-b-2 border-orange-400' : 'text-orange-200/70'
            }`}
          >
            Drums
          </button>
          <button
            onClick={() => setActiveTab('synths')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'synths' ? 'text-orange-100 border-b-2 border-orange-400' : 'text-orange-200/70'
            }`}
          >
            Synths
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-16 gap-1 mt-4">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded ${
                i === currentStep && isPlaying
                  ? 'bg-yellow-400'
                  : i % 4 === 0
                  ? 'bg-orange-400/60'
                  : 'bg-orange-600/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {showVisuals && (
          <div className="h-32 border-b border-orange-300/20">
            <LofiVisuals isPlaying={isPlaying} currentStep={currentStep} />
          </div>
        )}

        {showRecorder && (
          <AudioRecorder
            audioContext={audioContextRef.current}
            gainNode={gainNodeRef.current}
            isPlaying={isPlaying}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        )}

        {showPresets && (
          <BeatPresets
            onLoadPreset={handleLoadPreset}
            currentPatterns={currentPatterns}
            currentSettings={{ bpm, volume }}
          />
        )}
        
        {activeTab === 'drums' && (
          <DrumMachine
            audioContext={audioContextRef.current}
            gainNode={gainNodeRef.current}
            currentStep={currentStep}
            isPlaying={isPlaying}
          />
        )}
        
        {activeTab === 'synths' && (
          <MelodySynth
            audioContext={audioContextRef.current}
            gainNode={gainNodeRef.current}
            currentStep={currentStep}
            isPlaying={isPlaying}
          />
        )}
      </div>
    </motion.div>
  );
};

export default LofiBeatCreator;