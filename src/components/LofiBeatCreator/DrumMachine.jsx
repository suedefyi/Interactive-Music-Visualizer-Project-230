import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiCopy, FiRotateCcw, FiShuffle, FiChevronDown, FiChevronUp } = FiIcons;

const DrumMachine = ({ audioContext, gainNode, currentStep, isPlaying }) => {
  const [selectedKit, setSelectedKit] = useState('analog');
  const [patterns, setPatterns] = useState({
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    openhat: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
    crash: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    ride: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    shaker: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
  });

  const [volumes, setVolumes] = useState({
    kick: 0.8, snare: 0.6, hihat: 0.3, openhat: 0.4, crash: 0.5, ride: 0.4, clap: 0.5, shaker: 0.2
  });

  const [patternLength, setPatternLength] = useState(16);
  const [swing, setSwing] = useState(0);
  const [expandedDrums, setExpandedDrums] = useState({});

  const prevStepRef = useRef(-1);

  // Drum kit variations
  const drumKits = {
    analog: {
      name: 'Analog Warmth',
      color: 'orange',
      characteristics: { warmth: 1.2, saturation: 0.8, lowpass: 1800 }
    },
    vinyl: {
      name: 'Vinyl Crackle',
      color: 'amber',
      characteristics: { warmth: 1.0, saturation: 1.2, lowpass: 1500, crackle: true }
    },
    tape: {
      name: 'Tape Saturation',
      color: 'yellow',
      characteristics: { warmth: 1.5, saturation: 1.5, lowpass: 2000, flutter: true }
    },
    dusty: {
      name: 'Dusty Samples',
      color: 'stone',
      characteristics: { warmth: 0.9, saturation: 0.6, lowpass: 1200, dusty: true }
    }
  };

  // Enhanced drum sound synthesis with kit variations
  const createKick = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const distortion = audioContext.createWaveShaper();

    // Kit-specific frequency adjustments
    const baseFreq = selectedKit === 'dusty' ? 50 : selectedKit === 'vinyl' ? 65 : 60;
    osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.1);

    filter.type = 'lowpass';
    filter.frequency.value = kit.characteristics.lowpass;

    // Add saturation based on kit
    if (kit.characteristics.saturation > 1) {
      const curve = new Float32Array(65536);
      for (let i = 0; i < 65536; i++) {
        const x = (i - 32768) / 32768;
        curve[i] = Math.tanh(x * kit.characteristics.saturation) * kit.characteristics.warmth;
      }
      distortion.curve = curve;
    }

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volumes.kick * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc.connect(distortion);
    distortion.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    // Add vinyl crackle
    if (kit.characteristics.crackle && Math.random() < 0.3) {
      addVinylCrackle(envelope);
    }

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.3);
  };

  const createSnare = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const noise = audioContext.createBufferSource();
    const tone = audioContext.createOscillator();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    noise.buffer = noiseBuffer;

    // Add tonal component for different kits
    const toneFreq = selectedKit === 'analog' ? 200 : selectedKit === 'tape' ? 180 : 220;
    tone.frequency.value = toneFreq;
    tone.type = 'triangle';

    const envelope = audioContext.createGain();
    const toneEnvelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = selectedKit === 'dusty' ? 800 : 1000;

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volumes.snare * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    toneEnvelope.gain.setValueAtTime(0, audioContext.currentTime);
    toneEnvelope.gain.setValueAtTime(volumes.snare * 0.3, audioContext.currentTime + 0.01);
    toneEnvelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    tone.connect(toneEnvelope);
    toneEnvelope.connect(gainNode);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.2);
    tone.start(audioContext.currentTime);
    tone.stop(audioContext.currentTime + 0.15);
  };

  const createHiHat = (open = false) => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const noise = audioContext.createBufferSource();
    const duration = open ? 0.3 : selectedKit === 'vinyl' ? 0.08 : 0.1;
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3;
    }

    noise.buffer = noiseBuffer;

    const envelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = selectedKit === 'dusty' ? 6000 : 8000;

    const volume = open ? volumes.openhat : volumes.hihat;

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volume * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + duration);
  };

  const createRide = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc1.frequency.value = 800;
    osc2.frequency.value = 1200;
    osc1.type = 'triangle';
    osc2.type = 'sine';

    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volumes.ride * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.8);
    osc2.stop(audioContext.currentTime + 0.8);
  };

  const createClap = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    
    // Create multiple quick hits for clap effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let j = 0; j < output.length; j++) {
          output[j] = (Math.random() * 2 - 1) * 0.4;
        }

        noise.buffer = noiseBuffer;

        const envelope = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;

        envelope.gain.setValueAtTime(0, audioContext.currentTime);
        envelope.gain.setValueAtTime(volumes.clap * kit.characteristics.warmth * (1 - i * 0.2), audioContext.currentTime + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(gainNode);

        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + 0.08);
      }, i * 10);
    }
  };

  const createShaker = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const noise = audioContext.createBufferSource();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    noise.buffer = noiseBuffer;

    const envelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 10000;

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volumes.shaker * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.15);
  };

  const addVinylCrackle = (targetNode) => {
    const crackle = audioContext.createBufferSource();
    const crackleBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.05, audioContext.sampleRate);
    const output = crackleBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() > 0.95 ? (Math.random() * 2 - 1) * 0.1 : 0;
    }

    crackle.buffer = crackleBuffer;
    crackle.connect(targetNode);
    crackle.start(audioContext.currentTime);
    crackle.stop(audioContext.currentTime + 0.05);
  };

  // Play drums based on current step with swing
  useEffect(() => {
    if (isPlaying && currentStep !== prevStepRef.current) {
      const swingOffset = currentStep % 2 === 1 ? swing * 0.001 : 0;
      
      setTimeout(() => {
        if (patterns.kick[currentStep]) createKick();
        if (patterns.snare[currentStep]) createSnare();
        if (patterns.hihat[currentStep]) createHiHat(false);
        if (patterns.openhat[currentStep]) createHiHat(true);
        if (patterns.crash[currentStep]) createCrash();
        if (patterns.ride[currentStep]) createRide();
        if (patterns.clap[currentStep]) createClap();
        if (patterns.shaker[currentStep]) createShaker();
      }, swingOffset);
      
      prevStepRef.current = currentStep;
    }
  }, [currentStep, isPlaying, patterns, volumes, swing, selectedKit]);

  const createCrash = () => {
    if (!audioContext || !gainNode) return;
    
    const kit = drumKits[selectedKit];
    const noise = audioContext.createBufferSource();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    noise.buffer = noiseBuffer;

    const envelope = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.setValueAtTime(volumes.crash * kit.characteristics.warmth, audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 2);
  };

  const toggleStep = (drum, step) => {
    setPatterns(prev => ({
      ...prev,
      [drum]: prev[drum].map((active, i) => i === step ? !active : active)
    }));
  };

  const playDrum = (drum) => {
    switch (drum) {
      case 'kick': createKick(); break;
      case 'snare': createSnare(); break;
      case 'hihat': createHiHat(false); break;
      case 'openhat': createHiHat(true); break;
      case 'crash': createCrash(); break;
      case 'ride': createRide(); break;
      case 'clap': createClap(); break;
      case 'shaker': createShaker(); break;
    }
  };

  const generatePattern = (drum, style) => {
    const newPattern = Array(patternLength).fill(false);
    
    switch (style) {
      case 'basic':
        if (drum === 'kick') {
          [0, 4, 8, 12].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        } else if (drum === 'snare') {
          [4, 12].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        } else if (drum === 'hihat') {
          for (let i = 0; i < patternLength; i += 2) newPattern[i] = true;
        }
        break;
      case 'syncopated':
        if (drum === 'kick') {
          [0, 3, 6, 10, 14].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        } else if (drum === 'snare') {
          [4, 11, 13].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        }
        break;
      case 'shuffle':
        if (drum === 'kick') {
          [0, 6, 8, 14].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        } else if (drum === 'hihat') {
          [0, 3, 6, 9, 12, 15].forEach(i => { if (i < patternLength) newPattern[i] = true; });
        }
        break;
      case 'random':
        for (let i = 0; i < patternLength; i++) {
          newPattern[i] = Math.random() < 0.25;
        }
        break;
    }
    
    setPatterns(prev => ({ ...prev, [drum]: newPattern }));
  };

  const clearPattern = (drum) => {
    setPatterns(prev => ({ ...prev, [drum]: Array(patternLength).fill(false) }));
  };

  const copyPattern = (fromDrum, toDrum) => {
    setPatterns(prev => ({ ...prev, [toDrum]: [...prev[fromDrum]] }));
  };

  const drumNames = {
    kick: 'Kick', snare: 'Snare', hihat: 'Hi-Hat', openhat: 'Open Hat',
    crash: 'Crash', ride: 'Ride', clap: 'Clap', shaker: 'Shaker'
  };

  const drumColors = {
    kick: 'bg-red-500', snare: 'bg-yellow-500', hihat: 'bg-blue-500', openhat: 'bg-green-500',
    crash: 'bg-purple-500', ride: 'bg-indigo-500', clap: 'bg-pink-500', shaker: 'bg-teal-500'
  };

  return (
    <div className="p-4 border-b border-orange-300/20">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-orange-200 font-medium">Drum Machine</h4>
        <select
          value={selectedKit}
          onChange={(e) => setSelectedKit(e.target.value)}
          className="bg-orange-800/50 text-orange-100 rounded px-2 py-1 text-sm"
        >
          {Object.entries(drumKits).map(([key, kit]) => (
            <option key={key} value={key}>{kit.name}</option>
          ))}
        </select>
      </div>

      {/* Pattern Length and Swing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-orange-200 text-sm">Length: {patternLength}</label>
          <input
            type="range"
            min="8"
            max="32"
            step="4"
            value={patternLength}
            onChange={(e) => setPatternLength(Number(e.target.value))}
            className="w-full h-1 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="text-orange-200 text-sm">Swing: {swing}%</label>
          <input
            type="range"
            min="0"
            max="30"
            value={swing}
            onChange={(e) => setSwing(Number(e.target.value))}
            className="w-full h-1 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {Object.keys(patterns).map(drum => (
        <div key={drum} className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => playDrum(drum)}
              className={`w-8 h-8 ${drumColors[drum]} rounded-lg flex items-center justify-center text-white text-xs`}
            >
              <SafeIcon icon={FiPlay} />
            </button>
            <span className="text-orange-200 text-sm w-16">{drumNames[drum]}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volumes[drum]}
              onChange={(e) => setVolumes(prev => ({ ...prev, [drum]: parseFloat(e.target.value) }))}
              className="flex-1 h-1 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => setExpandedDrums(prev => ({ ...prev, [drum]: !prev[drum] }))}
              className="text-orange-200/70 hover:text-orange-100 transition-colors"
            >
              <SafeIcon icon={expandedDrums[drum] ? FiChevronUp : FiChevronDown} />
            </button>
          </div>

          {/* Pattern Controls */}
          {expandedDrums[drum] && (
            <div className="mb-2 flex gap-1 flex-wrap">
              <button
                onClick={() => generatePattern(drum, 'basic')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Basic
              </button>
              <button
                onClick={() => generatePattern(drum, 'syncopated')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Syncopated
              </button>
              <button
                onClick={() => generatePattern(drum, 'shuffle')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Shuffle
              </button>
              <button
                onClick={() => generatePattern(drum, 'random')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                <SafeIcon icon={FiShuffle} />
              </button>
              <button
                onClick={() => clearPattern(drum)}
                className="px-2 py-1 bg-red-600/50 text-red-200 rounded text-xs"
              >
                <SafeIcon icon={FiRotateCcw} />
              </button>
            </div>
          )}
          
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${patternLength}, 1fr)` }}>
            {patterns[drum].slice(0, patternLength).map((active, step) => (
              <motion.button
                key={step}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleStep(drum, step)}
                className={`aspect-square rounded transition-all ${
                  active
                    ? `${drumColors[drum]} shadow-lg`
                    : 'bg-orange-800/30 hover:bg-orange-700/50'
                } ${
                  step === currentStep && isPlaying
                    ? 'ring-2 ring-yellow-400'
                    : ''
                } ${step % 4 === 0 ? 'border border-orange-500/30' : ''}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrumMachine;