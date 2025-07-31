import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDownload, FiSquare, FiClock, FiMusic } = FiIcons;

const AudioRecorder = ({ audioContext, gainNode, isPlaying, onStartRecording, onStopRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(60); // Default 1 minute
  const [currentRecordingTime, setCurrentRecordingTime] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('lofi-beat');
  
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const destinationRef = useRef(null);

  const startRecording = async () => {
    if (!audioContext || !gainNode || !isPlaying) {
      alert('Please start playing your beat first!');
      return;
    }

    try {
      // Create a MediaStreamDestination to capture audio
      destinationRef.current = audioContext.createMediaStreamDestination();
      
      // Connect the gain node to the destination
      gainNode.connect(destinationRef.current);
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(destinationRef.current.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        createDownloadableFile();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setIsRecording(true);
      setCurrentRecordingTime(0);
      onStartRecording?.();
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setCurrentRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= recordingDuration) {
            stopRecording();
            return recordingDuration;
          }
          return newTime;
        });
      }, 1000);
      
      // Auto-stop after selected duration
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, recordingDuration * 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onStopRecording?.();
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Disconnect from destination
      if (destinationRef.current && gainNode) {
        try {
          gainNode.disconnect(destinationRef.current);
        } catch (e) {
          // Node might already be disconnected
        }
      }
    }
  };

  const createDownloadableFile = async () => {
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      
      // Convert to WAV/MP3-like format for better compatibility
      const audioBuffer = await blob.arrayBuffer();
      const audioData = await audioContext.decodeAudioData(audioBuffer.slice(0));
      
      // Create a new blob with better format
      const wavBlob = audioBufferToWav(audioData);
      const url = URL.createObjectURL(wavBlob);
      
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error creating download file:', error);
      // Fallback to original blob
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const downloadRecording = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${fileName}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border-t border-orange-300/20">
      <h4 className="text-orange-200 font-medium mb-3 flex items-center gap-2">
        <SafeIcon icon={FiMusic} />
        Export Beat
      </h4>

      {/* File Name Input */}
      <div className="mb-4">
        <label className="text-orange-200 text-sm mb-1 block">File Name:</label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
          className="w-full bg-orange-800/30 text-orange-100 rounded px-3 py-2 text-sm border border-orange-600/30 focus:outline-none focus:border-orange-400"
          placeholder="my-lofi-beat"
        />
      </div>

      {/* Duration Selection */}
      <div className="mb-4">
        <label className="text-orange-200 text-sm mb-2 block flex items-center gap-2">
          <SafeIcon icon={FiClock} />
          Recording Duration: {formatTime(recordingDuration)}
        </label>
        <input
          type="range"
          min="10"
          max="180"
          step="10"
          value={recordingDuration}
          onChange={(e) => setRecordingDuration(Number(e.target.value))}
          disabled={isRecording}
          className="w-full h-2 bg-orange-800/50 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-orange-300/70 mt-1">
          <span>10s</span>
          <span>1m</span>
          <span>2m</span>
          <span>3m</span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="space-y-3">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startRecording}
            disabled={!isPlaying}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-full"></div>
            Start Recording ({formatTime(recordingDuration)})
          </motion.button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-center">
              <div className="text-red-200 font-medium mb-1">Recording...</div>
              <div className="text-red-100 text-lg font-mono">
                {formatTime(currentRecordingTime)} / {formatTime(recordingDuration)}
              </div>
              <div className="w-full bg-red-800/50 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(currentRecordingTime / recordingDuration) * 100}%` }}
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopRecording}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiSquare} />
              Stop Recording
            </motion.button>
          </div>
        )}

        {/* Download Button */}
        {downloadUrl && !isRecording && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadRecording}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiDownload} />
            Download Recording
          </motion.button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-orange-800/20 rounded-lg border border-orange-600/20">
        <p className="text-orange-200/80 text-xs leading-relaxed">
          <strong>How to use:</strong> Start playing your beat, then click "Start Recording". 
          The recording will capture your lofi beat for the selected duration and create a downloadable audio file.
        </p>
      </div>
    </div>
  );
};

export default AudioRecorder;