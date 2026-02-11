import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bot, X, CheckCircle, AlertCircle, HelpCircle, FileDown, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { voiceAssistant, VoiceMessages } from '../utils/voiceAssistant';

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(voiceAssistant.isEnabled());
  const [volume, setVolume] = useState(voiceAssistant.getVolume());

  // Update state when voice settings change
  useEffect(() => {
    const interval = setInterval(() => {
      setEnabled(voiceAssistant.isEnabled());
      setVolume(voiceAssistant.getVolume());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    const newState = !enabled;
    voiceAssistant.setEnabled(newState);
    setEnabled(newState);

    // Confirmation message when enabling
    if (newState) {
      setTimeout(() => {
        voiceAssistant.speak("Voice assistant enabled. I'm here to help.", 'high');
      }, 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    voiceAssistant.setVolume(newVolume);
  };

  return (
    <>
      {/* Floating AI Assistant Button - Hidden on Mobile */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-2xl items-center justify-center z-40 hover:scale-110 transition-transform"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Bot className="w-8 h-8 text-white" />
        </motion.div>

        {/* Notification badge when voice is ON */}
        {enabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
          >
            <Volume2 className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-8 right-8 z-[100] w-[420px] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 0 60px rgba(168, 85, 247, 0.3)',
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                      <p className="text-xs text-purple-300">Voice Guide for HR Portal</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Voice Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Voice Assistant</p>
                      <p className="text-xs text-slate-400">Enable voice feedback</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleVoice}
                      className={`w-14 h-8 rounded-full transition-all relative ${
                        enabled
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: enabled ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                      >
                        {enabled ? (
                          <Volume2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <VolumeX className="w-3 h-3 text-slate-700" />
                        )}
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Volume Slider */}
                  <AnimatePresence>
                    {enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">Volume</p>
                          <p className="text-xs font-bold text-emerald-400">
                            {Math.round(volume * 100)}%
                          </p>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-emerald-400
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-emerald-400
                            [&::-moz-range-thumb]:border-0
                            [&::-moz-range-thumb]:cursor-pointer"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Complete Implementation
                  </p>
                  
                  <div className="space-y-2">
                    {[
                      { icon: Upload, text: 'Bulk Upload: Success/partial success with error count', color: 'text-blue-400' },
                      { icon: FileDown, text: 'Export Success: Single & bulk PDF confirmations', color: 'text-purple-400' },
                      { icon: AlertCircle, text: 'Export Error: Clear error explanation', color: 'text-red-400' },
                      { icon: HelpCircle, text: 'Help Button: First-time guidance on click', color: 'text-yellow-400' },
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                      >
                        <feature.icon className={`w-4 h-4 mt-0.5 ${feature.color} flex-shrink-0`} />
                        <p className="text-xs text-slate-300 leading-relaxed">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-3 pt-3 border-t border-slate-700/50">
                  <p className="text-sm font-bold text-white">Key Features</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'OFF by default',
                      'User-controlled',
                      'Context-aware',
                      'Calm & Professional',
                      'Non-blocking',
                      'Persistent settings',
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <p className="text-xs text-slate-300">{feature}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Voice Messages */}
                <div className="space-y-2 pt-3 border-t border-slate-700/50">
                  <p className="text-sm font-bold text-white">Voice Messages</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { icon: '✅', text: 'Success. 15 employee records loaded and ready for export.' },
                      { icon: '⚠️', text: '12 records loaded successfully. 3 rows have errors.' },
                      { icon: '✅', text: 'Export complete. 15 ID cards ready for download.' },
                      { icon: '✅', text: 'ID card exported successfully.' },
                      { icon: '❌', text: 'Export failed. Please try again.' },
                      { icon: 'ℹ️', text: 'Let me explain how this works...' },
                    ].map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="flex items-start gap-2 text-xs text-slate-400 p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
                      >
                        <span className="text-sm flex-shrink-0">{message.icon}</span>
                        <p className="leading-relaxed">{message.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-t border-purple-500/20 px-6 py-4">
                <p className="text-xs text-center text-slate-400">
                  The voice assistant feels like a helpful HR colleague -<br />
                  professional, calm, and always respectful! 🎯✨
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </>
  );
}