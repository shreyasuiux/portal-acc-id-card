import { useState, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { voiceAssistant, VoiceMessages } from '../utils/voiceAssistant';

export function VoiceControl() {
  const [enabled, setEnabled] = useState(voiceAssistant.isEnabled());
  const [volume, setVolume] = useState(voiceAssistant.getVolume());
  const [showHelp, setShowHelp] = useState(false);

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

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
    if (!showHelp) {
      voiceAssistant.speak(VoiceMessages.helpFirstTime, 'high');
    } else {
      voiceAssistant.stop();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* AI Assistant Logo */}
      <motion.div
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg"
        animate={{
          boxShadow: [
            '0 0 0px rgba(168, 85, 247, 0)',
            '0 0 20px rgba(168, 85, 247, 0.4)',
            '0 0 0px rgba(168, 85, 247, 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Bot className="w-5 h-5 text-purple-400" />
        </motion.div>
        <div>
          <p className="text-[11px] font-bold text-purple-300 leading-none">AI Assistant</p>
          <p className="text-[9px] text-purple-400/70 leading-none mt-0.5">Voice Guide</p>
        </div>
      </motion.div>

      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleHelpClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          showHelp
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white'
        }`}
        title="Get help"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-[12px] font-medium">Help</span>
      </motion.button>

      {/* Voice Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleVoice}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          enabled
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
        }`}
        title={enabled ? 'Voice assistant enabled' : 'Voice assistant disabled'}
      >
        {enabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
        <span className="text-[12px] font-medium">
          {enabled ? 'Voice On' : 'Voice Off'}
        </span>
      </motion.button>

      {/* Volume Slider (only when enabled) */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-emerald-400
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-emerald-400
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[10px] text-slate-400 font-medium w-8">
              {Math.round(volume * 100)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Tooltip */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-8 z-50 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl max-w-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">How to Use</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong className="text-blue-400">Single Employee:</strong> Create one ID card at a time
                </p>
                <p>
                  <strong className="text-purple-400">Bulk Upload:</strong> Upload CSV/Excel with multiple employees
                </p>
                <p>
                  <strong className="text-emerald-400">Employee Database:</strong> Manage and export saved records
                </p>
                <p className="pt-2 border-t border-slate-700 text-slate-400">
                  💡 Enable voice assistant for step-by-step guidance
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}