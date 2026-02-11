import { motion } from 'motion/react';
import { Menu, X, Download, LogOut } from 'lucide-react';

interface MobileAppBarProps {
  title: string;
  onMenuClick: () => void;
  onExport?: () => void;
  showExport?: boolean;
  isMenuOpen?: boolean;
}

export function MobileAppBar({ 
  title, 
  onMenuClick, 
  onExport, 
  showExport = false,
  isMenuOpen = false 
}: MobileAppBarProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 lg:hidden"
    >
      {/* Background with blur */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50" />
      
      {/* Safe area padding for iOS notch */}
      <div className="relative pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Hamburger Menu */}
          <motion.button
            onClick={onMenuClick}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 touch-manipulation"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </motion.div>
          </motion.button>
          
          {/* Center: Title */}
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-bold text-white truncate px-2"
          >
            {title}
          </motion.h1>
          
          {/* Right: Action Button */}
          {showExport && onExport ? (
            <motion.button
              onClick={onExport}
              className="flex items-center justify-center gap-2 px-3 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm touch-manipulation shadow-lg"
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Export</span>
            </motion.button>
          ) : (
            <div className="w-10" /> // Spacer for centering
          )}
        </div>
      </div>
    </motion.div>
  );
}
