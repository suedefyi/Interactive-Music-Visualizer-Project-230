import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiUpload, FiMusic, FiX } = FiIcons;

const MusicPlayer = ({ onAudioSourceChange, isVisible, onToggle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    const newTracks = audioFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      file: file
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      loadTrack(newTracks[0], 0);
    }
  };

  const loadTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      onAudioSourceChange(audioRef.current);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    loadTrack(playlist[nextIndex], nextIndex);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    loadTrack(playlist[prevIndex], prevIndex);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const removeTrack = (index) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    
    if (index === currentIndex) {
      if (newPlaylist.length > 0) {
        const newIndex = index >= newPlaylist.length ? 0 : index;
        loadTrack(newPlaylist[newIndex], newIndex);
      } else {
        setCurrentTrack(null);
        setCurrentIndex(0);
        onAudioSourceChange(null);
      }
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
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
      className="fixed left-0 top-16 bottom-0 w-80 bg-black/90 backdrop-blur-lg border-r border-white/20 z-40 flex flex-col"
    >
      <audio ref={audioRef} />
      
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Music Player</h3>
          <button
            onClick={onToggle}
            className="text-white/70 hover:text-white transition-colors"
          >
            <SafeIcon icon={FiX} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-300 font-medium hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiUpload} />
          Upload Music
        </motion.button>
      </div>

      {currentTrack && (
        <div className="p-4 border-b border-white/20">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <SafeIcon icon={FiMusic} className="text-white text-xl" />
            </div>
            <h4 className="text-white font-medium text-sm truncate">{currentTrack.name}</h4>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={prevTrack}
              className="text-white/70 hover:text-white transition-colors"
              disabled={playlist.length <= 1}
            >
              <SafeIcon icon={FiSkipBack} />
            </button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black"
            >
              <SafeIcon icon={isPlaying ? FiPause : FiPlay} />
            </motion.button>
            
            <button
              onClick={nextTrack}
              className="text-white/70 hover:text-white transition-colors"
              disabled={playlist.length <= 1}
            >
              <SafeIcon icon={FiSkipForward} />
            </button>
          </div>

          <div className="mb-4">
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SafeIcon icon={FiVolume2} className="text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-white/80 font-medium mb-3">Playlist ({playlist.length})</h4>
        
        {playlist.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <SafeIcon icon={FiMusic} className="text-3xl mb-2" />
            <p className="text-sm">No music files uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`p-2 rounded-lg cursor-pointer transition-all group ${
                  index === currentIndex 
                    ? 'bg-purple-500/30 border border-purple-400' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => loadTrack(track, index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{track.name}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrack(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-400 transition-all ml-2"
                  >
                    <SafeIcon icon={FiX} className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MusicPlayer;