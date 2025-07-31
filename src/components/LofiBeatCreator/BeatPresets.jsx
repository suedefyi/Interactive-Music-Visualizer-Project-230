import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiSave, FiFolder, FiTrash2, FiDownload, FiUpload } = FiIcons;

const BeatPresets = ({ onLoadPreset, currentPatterns, currentSettings }) => {
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem('lofiBeatPresets');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const defaultPresets = [
    {
      id: 'chill-hop',
      name: 'Chill Hop',
      description: 'Classic lofi hip-hop beat',
      bpm: 85,
      drumKit: 'vinyl',
      swing: 15,
      drums: {
        kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        shaker: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
      },
      synths: {
        melody: [null, null, 'C4', null, null, 'E4', null, 'G4', null, null, 'A4', null, null, 'G4', null, null],
        bass: ['C2', null, null, null, 'F2', null, null, null, 'G2', null, null, null, 'C2', null, 'G2', null],
        chord: ['C4', null, null, null, 'F4', null, null, null, 'G4', null, null, null, 'C4', null, null, null]
      }
    },
    {
      id: 'jazzy-cafe',
      name: 'Jazzy Café',
      description: 'Smooth jazz-influenced lofi',
      bpm: 78,
      drumKit: 'analog',
      swing: 20,
      drums: {
        kick: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
        ride: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false]
      },
      synths: {
        melody: ['A4', null, 'F4', null, 'C4', null, 'G4', null, 'A4', null, 'F4', null, 'C4', null, 'G4', null],
        bass: ['A2', null, null, null, 'F2', null, null, null, 'C3', null, null, null, 'G2', null, null, null],
        chord: ['A3', null, 'F3', null, 'C4', null, 'G3', null, 'A3', null, 'F3', null, 'C4', null, 'G3', null]
      }
    },
    {
      id: 'study-vibes',
      name: 'Study Vibes',
      description: 'Minimal and focused',
      bpm: 90,
      drumKit: 'tape',
      swing: 10,
      drums: {
        kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
        shaker: [false, false, true, false, false, true, false, false, false, true, false, false, true, false, false, false]
      },
      synths: {
        melody: [null, null, null, null, 'E4', null, null, null, null, null, 'G4', null, null, null, null, null],
        bass: ['C2', null, null, null, null, null, null, null, 'G2', null, null, null, null, null, null, null],
        chord: ['C4', null, null, null, null, null, null, null, 'G4', null, null, null, null, null, null, null]
      }
    },
    {
      id: 'nostalgic-rain',
      name: 'Nostalgic Rain',
      description: 'Melancholic and atmospheric',
      bpm: 75,
      drumKit: 'dusty',
      swing: 25,
      drums: {
        kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [false, true, false, false, true, false, false, true, false, false, true, false, false, true, false, false],
        crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
      },
      synths: {
        melody: ['D4', null, null, 'F4', null, null, 'A4', null, null, 'G4', null, null, 'F4', null, null, null],
        bass: ['D2', null, null, null, null, null, null, null, 'A2', null, null, null, null, null, null, null],
        chord: ['D3', null, 'F3', null, 'A3', null, null, null, 'G3', null, null, null, 'F3', null, null, null]
      }
    }
  ];

  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      description: 'Custom preset',
      isCustom: true,
      timestamp: new Date().toISOString(),
      ...currentSettings,
      drums: currentPatterns.drums,
      synths: currentPatterns.synths
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('lofiBeatPresets', JSON.stringify(updatedPresets));
    
    setPresetName('');
    setShowSaveDialog(false);
  };

  const deletePreset = (presetId) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('lofiBeatPresets', JSON.stringify(updatedPresets));
  };

  const exportPreset = (preset) => {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preset.name.replace(/\s+/g, '_')}_lofi_preset.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importPreset = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target.result);
        preset.id = Date.now().toString();
        preset.isCustom = true;
        preset.imported = true;
        
        const updatedPresets = [...savedPresets, preset];
        setSavedPresets(updatedPresets);
        localStorage.setItem('lofiBeatPresets', JSON.stringify(updatedPresets));
      } catch (error) {
        alert('Invalid preset file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const allPresets = [...defaultPresets, ...savedPresets];

  return (
    <div className="p-4 border-b border-orange-300/20">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-orange-200 font-medium">Beat Presets</h4>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importPreset}
            className="hidden"
            id="import-preset"
          />
          <label
            htmlFor="import-preset"
            className="p-2 bg-orange-600/50 text-orange-100 rounded cursor-pointer hover:bg-orange-600/70 transition-colors"
            title="Import Preset"
          >
            <SafeIcon icon={FiUpload} />
          </label>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 bg-orange-600/50 text-orange-100 rounded hover:bg-orange-600/70 transition-colors"
            title="Save Current as Preset"
          >
            <SafeIcon icon={FiSave} />
          </button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-orange-800/30 rounded-lg border border-orange-600/30"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1 bg-orange-900/50 text-orange-100 rounded px-2 py-1 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && savePreset()}
            />
            <button
              onClick={savePreset}
              disabled={!presetName.trim()}
              className="px-3 py-1 bg-orange-600 text-orange-100 rounded text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-3 py-1 bg-gray-600 text-gray-100 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Preset Grid */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {allPresets.map((preset) => (
          <motion.div
            key={preset.id}
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-orange-800/20 rounded-lg border border-orange-600/20 hover:border-orange-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h5 className="text-orange-100 font-medium text-sm">{preset.name}</h5>
                <p className="text-orange-300/70 text-xs">{preset.description}</p>
                <div className="text-orange-400/60 text-xs mt-1">
                  {preset.bpm} BPM • {preset.drumKit} • Swing: {preset.swing}%
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="p-1.5 bg-orange-600 text-orange-100 rounded hover:bg-orange-700 transition-colors"
                  title="Load Preset"
                >
                  <SafeIcon icon={FiPlay} />
                </button>
                <button
                  onClick={() => exportPreset(preset)}
                  className="p-1.5 bg-blue-600 text-blue-100 rounded hover:bg-blue-700 transition-colors"
                  title="Export Preset"
                >
                  <SafeIcon icon={FiDownload} />
                </button>
                {preset.isCustom && (
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="p-1.5 bg-red-600 text-red-100 rounded hover:bg-red-700 transition-colors"
                    title="Delete Preset"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Mini Pattern Preview */}
            <div className="grid grid-cols-16 gap-0.5 mb-1">
              {preset.drums.kick.map((active, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-sm ${
                    active ? 'bg-red-400' : 'bg-orange-800/30'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-16 gap-0.5">
              {preset.drums.snare.map((active, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-sm ${
                    active ? 'bg-yellow-400' : 'bg-orange-800/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BeatPresets;