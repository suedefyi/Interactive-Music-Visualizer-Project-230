import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMic, FiSettings, FiBarChart, FiSmartphone, FiX, FiChevronRight, FiChevronLeft } = FiIcons;

const steps = [
  {
    title: "Welcome to Music Visualizer",
    content: "Transform your audio into stunning visual experiences with real-time visualizations that respond to your microphone input.",
    icon: FiBarChart,
    image: "🎵"
  },
  {
    title: "Enable Microphone Access",
    content: "Click the microphone button in the header to start capturing audio. Your browser will ask for permission to access your microphone.",
    icon: FiMic,
    image: "🎤"
  },
  {
    title: "Choose Your Visualization",
    content: "Select from 10 different visualization types including frequency bars, circular spectrum, particles, and more. Each responds uniquely to your audio.",
    icon: FiBarChart,
    image: "🌈"
  },
  {
    title: "Customize Your Experience",
    content: "Use sliders and knobs to adjust sensitivity, colors, effects, and visual parameters. Fine-tune the experience to match your style.",
    icon: FiSettings,
    image: "🎛️"
  },
  {
    title: "Mobile-Friendly Controls",
    content: "On mobile devices, tap the settings button to access quick controls. Switch between visualizations and adjust key settings easily.",
    icon: FiSmartphone,
    image: "📱"
  },
  {
    title: "Ready to Visualize!",
    content: "You're all set! Play some music, speak, or make sounds near your microphone and watch the magic happen. Access this guide anytime from the help menu.",
    icon: FiChevronRight,
    image: "✨"
  }
];

const HowToGuide = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md w-full overflow-hidden"
      >
        <div className="relative p-6 text-center">
          <button
            onClick={skip}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>

          <div className="mb-6">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-6xl mb-4"
            >
              {steps[currentStep].image}
            </motion.div>
            
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={steps[currentStep].icon} className="text-white text-xl" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {steps[currentStep].content}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-400' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiChevronLeft} />
              Previous
            </button>

            <span className="text-white/50 text-sm">
              {currentStep + 1} of {steps.length}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <SafeIcon icon={FiChevronRight} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HowToGuide;