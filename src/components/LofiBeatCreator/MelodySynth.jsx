import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiShuffle, FiRotateCcw, FiCopy, FiChevronDown, FiChevronUp } = FiIcons;

const MelodySynth = ({ audioContext, gainNode, currentStep, isPlaying }) => {
  const [patterns, setPatterns] = useState({
    melody: Array(16).fill(null),
    bass: Array(16).fill(null),
    chord: Array(16).fill(null),
    lead: Array(16).fill(null)
  });
  
  const [selectedTrack, setSelectedTrack] = useState('melody');
  const [selectedNote, setSelectedNote] = useState('C4');
  const [volumes, setVolumes] = useState({
    melody: 0.3, bass: 0.4, chord: 0.2, lead: 0.25
  });
  
  const [synthTypes, setSynthTypes] = useState({
    melody: 'lofi',
    bass: 'sub',
    chord: 'pad',
    lead: 'pluck'
  });

  const [patternLength, setPatternLength] = useState(16);
  const [expandedTracks, setExpandedTracks] = useState({});
  
  const prevStepRef = useRef(-1);
  const activeNotesRef = useRef(new Map());

  const notes = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50
  };

  const synthPresets = {
    lofi: {
      name: 'Lofi Synth',
      waveform: 'sawtooth',
      filter: { type: 'lowpass', frequency: 1800, resonance: 2 },
      distortion: 1.5,
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.8 }
    },
    sub: {
      name: 'Sub Bass',
      waveform: 'sine',
      filter: { type: 'lowpass', frequency: 300, resonance: 1 },
      distortion: 0.8,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.9, release: 0.6 }
    },
    pad: {
      name: 'Warm Pad',
      waveform: 'triangle',
      filter: { type: 'lowpass', frequency: 2500, resonance: 0.5 },
      distortion: 0.3,
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 2.0 }
    },
    pluck: {
      name: 'Pluck Lead',
      waveform: 'square',
      filter: { type: 'lowpass', frequency: 3000, resonance: 3 },
      distortion: 2.0,
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4 }
    },
    electric: {
      name: 'Electric Piano',
      waveform: 'triangle',
      filter: { type: 'lowpass', frequency: 2200, resonance: 1.5 },
      distortion: 1.2,
      envelope: { attack: 0.02, decay: 0.8, sustain: 0.3, release: 1.2 }
    },
    vintage: {
      name: 'Vintage Synth',
      waveform: 'sawtooth',
      filter: { type: 'lowpass', frequency: 1500, resonance: 4 },
      distortion: 1.8,
      envelope: { attack: 0.1, decay: 0.4, sustain: 0.6, release: 0.9 }
    }
  };

  const createSynth = (frequency, track, duration = 0.5) => {
    if (!audioContext || !gainNode) {
      console.log('No audio context or gain node available');
      return;
    }

    try {
      const preset = synthPresets[synthTypes[track]];
      const osc = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const distortion = audioContext.createWaveShaper();

      // Oscillator setup
      osc.type = preset.waveform;
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Filter setup
      filter.type = preset.filter.type;
      filter.frequency.value = preset.filter.frequency;
      filter.Q.value = preset.filter.resonance;

      // Distortion/saturation
      if (preset.distortion > 0) {
        const curve = new Float32Array(65536);
        for (let i = 0; i < 65536; i++) {
          const x = (i - 32768) / 32768;
          curve[i] = Math.tanh(x * preset.distortion) * 0.8;
        }
        distortion.curve = curve;
        distortion.oversample = '4x';
      }

      // ADSR Envelope
      const env = preset.envelope;
      const volume = volumes[track];
      const now = audioContext.currentTime;
      const attackTime = now + env.attack;
      const decayTime = attackTime + env.decay;
      const releaseTime = now + duration;
      const endTime = releaseTime + env.release;

      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(volume, attackTime);
      envelope.gain.exponentialRampToValueAtTime(Math.max(volume * env.sustain, 0.001), decayTime);
      envelope.gain.setValueAtTime(volume * env.sustain, releaseTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, endTime);

      // Add subtle chorus effect for pad
      if (track === 'chord' && synthTypes[track] === 'pad') {
        const osc2 = audioContext.createOscillator();
        const envelope2 = audioContext.createGain();
        
        osc2.type = preset.waveform;
        osc2.frequency.setValueAtTime(frequency * 1.005, now);
        
        envelope2.gain.setValueAtTime(0, now);
        envelope2.gain.linearRampToValueAtTime(volume * 0.5, attackTime);
        envelope2.gain.exponentialRampToValueAtTime(Math.max(volume * env.sustain * 0.5, 0.001), decayTime);
        envelope2.gain.setValueAtTime(volume * env.sustain * 0.5, releaseTime);
        envelope2.gain.exponentialRampToValueAtTime(0.001, endTime);

        // Connect second oscillator
        osc2.connect(filter);
        envelope2.connect(gainNode);
        
        osc2.start(now);
        osc2.stop(endTime);
      }

      // Connect audio graph - FIXED CONNECTION ORDER
      osc.connect(filter);
      filter.connect(distortion);
      distortion.connect(envelope);
      envelope.connect(gainNode);

      // Start and stop oscillator
      osc.start(now);
      osc.stop(endTime);

      console.log(`Playing ${track}: ${frequency}Hz for ${duration}s`);

    } catch (error) {
      console.error('Error creating synth:', error);
    }
  };

  // Play melodies based on current step
  useEffect(() => {
    if (isPlaying && currentStep !== prevStepRef.current && audioContext && gainNode) {
      console.log(`Step ${currentStep} - Checking patterns`);
      
      Object.keys(patterns).forEach(track => {
        const note = patterns[track][currentStep];
        if (note) {
          const frequency = notes[note];
          if (frequency) {
            console.log(`Playing ${track}: ${note} (${frequency}Hz)`);
            const duration = track === 'chord' ? 1.0 : track === 'bass' ? 0.8 : 0.5;
            createSynth(frequency, track, duration);
          }
        }
      });
      
      prevStepRef.current = currentStep;
    }
  }, [currentStep, isPlaying, patterns, volumes, synthTypes, audioContext, gainNode]);

  const setStepNote = (track, step) => {
    setPatterns(prev => ({
      ...prev,
      [track]: prev[track].map((note, i) => 
        i === step ? (note === selectedNote ? null : selectedNote) : note
      )
    }));
  };

  const playNote = (note, track = selectedTrack) => {
    const frequency = notes[note];
    if (frequency) {
      console.log(`Manual play: ${track} - ${note} (${frequency}Hz)`);
      createSynth(frequency, track, 0.5);
    }
  };

  const generateChordProgression = (track, style) => {
    const progressions = {
      jazzy: ['C4', null, 'A3', null, 'F4', null, 'G4', null, 'C4', null, 'A3', null, 'F4', 'G4', null, null],
      melancholy: ['A3', null, 'F4', null, 'C4', null, 'G4', null, 'A3', null, 'F4', null, 'C4', null, 'G4', null],
      uplifting: ['C4', 'E4', 'G4', 'C5', 'A3', 'C4', 'E4', 'A4', 'F3', 'A3', 'C4', 'F4', 'G3', 'B3', 'D4', 'G4'],
      bass: ['C2', null, null, null, 'F2', null, null, null, 'G2', null, null, null, 'C2', null, 'G2', null]
    };

    const pattern = progressions[style] || progressions.jazzy;
    setPatterns(prev => ({ ...prev, [track]: pattern.slice(0, patternLength) }));
  };

  const clearPattern = (track) => {
    setPatterns(prev => ({ ...prev, [track]: Array(patternLength).fill(null) }));
  };

  const copyPattern = (fromTrack, toTrack) => {
    setPatterns(prev => ({ ...prev, [toTrack]: [...prev[fromTrack]] }));
  };

  const trackNames = {
    melody: 'Melody',
    bass: 'Bass',
    chord: 'Chords',
    lead: 'Lead'
  };

  const trackColors = {
    melody: 'bg-orange-500',
    bass: 'bg-red-600',
    chord: 'bg-yellow-500',
    lead: 'bg-green-500'
  };

  return (
    <div className="p-4">
      <h4 className="text-orange-200 font-medium mb-3">Lofi Synthesizers</h4>
      
      {/* Debug Info */}
      {audioContext && (
        <div className="mb-2 text-xs text-orange-300/50">
          Audio Context: {audioContext.state} | Gain Node: {gainNode ? 'Connected' : 'Missing'}
        </div>
      )}
      
      {/* Pattern Length Control */}
      <div className="mb-4">
        <label className="text-orange-200 text-sm">Pattern Length: {patternLength}</label>
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

      {/* Note Selection */}
      <div className="mb-4">
        <div className="text-orange-200 text-sm mb-2">Select Note:</div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Object.keys(notes).map(note => (
            <motion.button
              key={note}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedNote(note);
                playNote(note);
              }}
              className={`px-2 py-1 rounded text-xs transition-all ${
                selectedNote === note
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-800/50 text-orange-200 hover:bg-orange-700/50'
              }`}
            >
              {note}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Track Controls */}
      {Object.keys(patterns).map(track => (
        <div key={track} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => playNote(selectedNote, track)}
              className={`w-8 h-8 ${trackColors[track]} rounded-lg flex items-center justify-center text-white text-xs`}
            >
              <SafeIcon icon={FiPlay} />
            </button>
            <span className="text-orange-200 text-sm w-16">{trackNames[track]}</span>
            
            <select
              value={synthTypes[track]}
              onChange={(e) => setSynthTypes(prev => ({ ...prev, [track]: e.target.value }))}
              className="bg-orange-800/50 text-orange-100 rounded px-2 py-1 text-xs flex-1"
            >
              {Object.entries(synthPresets).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>

            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={volumes[track]}
              onChange={(e) => setVolumes(prev => ({ ...prev, [track]: parseFloat(e.target.value) }))}
              className="w-16 h-1 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
            />
            
            <button
              onClick={() => setExpandedTracks(prev => ({ ...prev, [track]: !prev[track] }))}
              className="text-orange-200/70 hover:text-orange-100 transition-colors"
            >
              <SafeIcon icon={expandedTracks[track] ? FiChevronUp : FiChevronDown} />
            </button>
          </div>

          {/* Pattern Generation Controls */}
          {expandedTracks[track] && (
            <div className="mb-2 flex gap-1 flex-wrap">
              <button
                onClick={() => generateChordProgression(track, 'jazzy')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Jazzy
              </button>
              <button
                onClick={() => generateChordProgression(track, 'melancholy')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Melancholy
              </button>
              <button
                onClick={() => generateChordProgression(track, 'uplifting')}
                className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
              >
                Uplifting
              </button>
              {track === 'bass' && (
                <button
                  onClick={() => generateChordProgression(track, 'bass')}
                  className="px-2 py-1 bg-orange-600/50 text-orange-100 rounded text-xs"
                >
                  Bass Line
                </button>
              )}
              <button
                onClick={() => clearPattern(track)}
                className="px-2 py-1 bg-red-600/50 text-red-200 rounded text-xs"
              >
                <SafeIcon icon={FiRotateCcw} />
              </button>
            </div>
          )}

          {/* Pattern Grid */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${patternLength}, 1fr)` }}>
            {patterns[track].slice(0, patternLength).map((note, step) => (
              <motion.button
                key={step}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setStepNote(track, step)}
                className={`aspect-square rounded text-xs transition-all ${
                  note
                    ? `${trackColors[track]} text-white`
                    : 'bg-orange-800/30 hover:bg-orange-700/50 text-orange-300'
                } ${
                  step === currentStep && isPlaying
                    ? 'ring-2 ring-yellow-400'
                    : ''
                } ${step % 4 === 0 ? 'border border-orange-500/30' : ''}`}
              >
                {note ? note.replace(/\d/, '') : '·'}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MelodySynth;