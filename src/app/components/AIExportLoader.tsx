import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Zap, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIExportLoaderProps {
  isVisible: boolean;
  progress?: number; // 0-100
  currentItem?: string; // "Processing: John D."
  totalItems?: number;
  currentIndex?: number;
  message?: string;
  mode?: 'single' | 'bulk';
}

export function AIExportLoader({
  isVisible,
  progress = 0,
  currentItem,
  totalItems,
  currentIndex,
  message = 'Processing...',
  mode = 'single',
}: AIExportLoaderProps) {
  const [dots, setDots] = useState('');

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
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-75 animate-pulse" />
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* AI Brain Animation */}
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
                        className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                      <motion.div
                        className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(96, 165, 250, 0.5)',
                            '0 0 20px rgba(96, 165, 250, 0.8)',
                            '0 0 10px rgba(96, 165, 250, 0.5)',
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
                        className="absolute inset-2 rounded-full border-2 border-purple-400/30 border-dashed"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.3
                        }}
                      />
                      <motion.div
                        className="absolute bottom-0 right-1/2 w-2 h-2 -mr-1 -mb-1 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(192, 132, 252, 0.5)',
                            '0 0 20px rgba(192, 132, 252, 0.8)',
                            '0 0 10px rgba(192, 132, 252, 0.5)',
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
                      <Brain className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
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
                        <Zap className="w-3 h-3 text-purple-400" fill="currentColor" />
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
                  <FileDown className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">
                    AI Export Processing
                  </h3>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300 text-sm"
                >
                  {message}{dots}
                </motion.p>
              </div>

              {/* Progress Bar (for bulk mode) */}
              {mode === 'bulk' && totalItems && totalItems > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {/* Progress info */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      {currentIndex !== undefined && `${currentIndex} of ${totalItems}`}
                    </span>
                    <span className="text-blue-400 font-semibold">
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
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
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
                  {currentItem && (
                    <motion.div
                      key={currentItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center text-sm text-slate-300"
                    >
                      Processing: <span className="text-white font-medium">{currentItem}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Single mode simple indicator */}
              {mode === 'single' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center gap-1.5"
                >
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity,
                        delay: index * 0.15
                      }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                  ))}
                </motion.div>
              )}

              {/* Info text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-slate-400 pt-2"
              >
                Please wait while we generate your high-resolution PDF
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
