import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState(new Uint8Array(256));
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(256));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationRef = useRef(null);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      microphoneRef.current = stream;
      setIsListening(true);
      
      const updateAudioData = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const frequencyArray = new Uint8Array(bufferLength);
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          analyserRef.current.getByteFrequencyData(frequencyArray);
          
          setAudioData(dataArray);
          setFrequencyData(frequencyArray);
        }
        animationRef.current = requestAnimationFrame(updateAudioData);
      };
      
      updateAudioData();
      
      return { success: true };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach(track => track.stop());
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    analyserRef.current = null;
    setIsListening(false);
    setAudioData(new Uint8Array(256));
    setFrequencyData(new Uint8Array(256));
  }, []);

  const value = {
    isListening,
    audioData,
    frequencyData,
    startMicrophone,
    stopMicrophone
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};