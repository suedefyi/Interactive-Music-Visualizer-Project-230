import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMusic, FiMic, FiMicOff, FiSettings, FiHelpCircle, FiLogOut, FiEye, FiEyeOff, FiHeadphones, FiRadio } = FiIcons;

const Header = ({ 
  user, 
  onLogout, 
  onShowGuide, 
  isListening, 
  onMicrophoneToggle, 
  onToggleControls, 
  showControls,
  onToggleMusicPlayer,
  showMusicPlayer,
  onToggleLofiBeat,
  showLofiBeat
}) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiMusic} className="text-white text-sm" />
          </div>
          <h1 className="text-white font-bold text-lg hidden sm:block">Music Visualizer</h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleLofiBeat}
            className={`p-2 rounded-lg transition-colors ${
              showLofiBeat 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={showLofiBeat ? 'Hide Lofi Beat Creator' : 'Show Lofi Beat Creator'}
          >
            <SafeIcon icon={FiRadio} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMusicPlayer}
            className={`p-2 rounded-lg transition-colors ${
              showMusicPlayer 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={showMusicPlayer ? 'Hide Music Player' : 'Show Music Player'}
          >
            <SafeIcon icon={FiHeadphones} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleControls}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors hidden md:block"
            title={showControls ? 'Hide Controls' : 'Show Controls'}
          >
            <SafeIcon icon={showControls ? FiEyeOff : FiEye} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMicrophoneToggle}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isListening ? 'Stop Microphone' : 'Start Microphone'}
          >
            <SafeIcon icon={isListening ? FiMicOff : FiMic} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowGuide}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Show Guide"
          >
            <SafeIcon icon={FiHelpCircle} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Logout"
          >
            <SafeIcon icon={FiLogOut} />
          </motion.button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;