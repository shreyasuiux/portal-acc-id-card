import { motion, AnimatePresence } from 'motion/react';
import { Image, Sparkles, Scissors, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIImageProcessLoaderProps {
  isVisible: boolean;
  totalImages?: number;
  processedImages?: number;
  currentEmployee?: string;
  stage?: 'extracting' | 'removing-bg' | 'cropping' | 'finalizing';
}

const stageMessages = {
  extracting: 'Extracting images from ZIP',
  'removing-bg': 'Removing backgrounds with AI',
  cropping: 'Cropping and resizing photos',
  finalizing: 'Finalizing processed images',
};

const stageIcons = {
  extracting: Image,
  'removing-bg': RefreshCw,
  cropping: Scissors,
  finalizing: Sparkles,
};

export function AIImageProcessLoader({
  isVisible,
  totalImages = 0,
  processedImages = 0,
  currentEmployee,
  stage = 'removing-bg',
}: AIImageProcessLoaderProps) {
  const [dots, setDots] = useState('');
  const progress = totalImages > 0 ? (processedImages / totalImages) * 100 : 0;
  const StageIcon = stageIcons[stage];

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
          style={{ isolation: 'isolate' }}
        >
          {/* Glassmorphism card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              delay: 0.05 
            }}
            className="relative w-[90%] max-w-md rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 p-8 shadow-2xl backdrop-blur-xl border border-white/10"
          >
            {/* Gradient glow effect */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 blur-xl opacity-75 animate-pulse" />
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* AI Image Processing Animation */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Rotating orbit rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: 'linear' 
                    }}
                    className="absolute inset-0"
                  >
                    <div className="relative w-24 h-24">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-green-400/30"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                      <motion.div
                        className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(74, 222, 128, 0.5)',
                            '0 0 20px rgba(74, 222, 128, 0.8)',
                            '0 0 10px rgba(74, 222, 128, 0.5)',
                          ]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity 
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: 'linear' 
                    }}
                    className="absolute inset-0"
                  >
                    <div className="relative w-24 h-24">
                      <motion.div
                        className="absolute inset-2 rounded-full border-2 border-blue-400/30 border-dashed"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.3
                        }}
                      />
                      <motion.div
                        className="absolute bottom-0 right-1/2 w-2 h-2 -mr-1 -mb-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(96, 165, 250, 0.5)',
                            '0 0 20px rgba(96, 165, 250, 0.8)',
                            '0 0 10px rgba(96, 165, 250, 0.5)',
                          ]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Center icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="relative z-10 flex items-center justify-center w-24 h-24"
                  >
                    <div className="relative">
                      <StageIcon className="w-12 h-12 text-green-400" strokeWidth={1.5} />
                      {/* Sparkles */}
                      <motion.div
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: 0
                        }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      </motion.div>
                      <motion.div
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: 0.5
                        }}
                        className="absolute -bottom-1 -left-1"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" fill="currentColor" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* AI Processing Text */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Image className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    AI Photo Processing
                  </h3>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300 text-sm"
                >
                  {stageMessages[stage]}{dots}
                </motion.p>
              </div>

              {/* Progress Bar */}
              {totalImages > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {/* Progress info */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      {processedImages} of {totalImages} photos
                    </span>
                    <span className="text-green-400 font-semibold">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 100, 
                        damping: 20 
                      }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full"
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        animate={{ 
                          x: ['-100%', '100%']
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>

                  {/* Current item being processed */}
                  {currentEmployee && (
                    <motion.div
                      key={currentEmployee}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center text-sm text-slate-300"
                    >
                      Processing: <span className="text-white font-medium">{currentEmployee}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Info text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-slate-400 pt-2"
              >
                AI is removing backgrounds and cropping photos to 64×80px
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
