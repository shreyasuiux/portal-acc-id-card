import { motion, AnimatePresence } from 'motion/react';
import { X, User, LogOut, Database, FileText, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onLogout: () => void;
  employeeCount: number;
  onNavigateToDatabase?: () => void;
}

export function HamburgerMenu({ isOpen, onClose, userName, onLogout, employeeCount, onNavigateToDatabase }: HamburgerMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
          
          {/* Menu Drawer */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 lg:hidden overflow-y-auto"
          >
            {/* Header Section */}
            <div className="relative p-6 pb-8 border-b border-slate-700/50">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 text-white touch-manipulation"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              {/* User Info */}
              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {userName || 'HR Executive'}
                  </h3>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-slate-400">Employees</span>
                  </div>
                  <p className="text-lg font-bold text-white">{employeeCount}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">Online</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {/* Database Management */}
              <motion.button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-left transition-colors touch-manipulation"
                whileTap={{ scale: 0.98 }}
                onClick={onNavigateToDatabase}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Employee Database</p>
                  <p className="text-xs text-slate-400">View all records</p>
                </div>
              </motion.button>
              
              {/* Export History */}
              <motion.button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-left transition-colors touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Export History</p>
                  <p className="text-xs text-slate-400">View past exports</p>
                </div>
              </motion.button>
              
              {/* Settings */}
              <motion.button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-left transition-colors touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Settings</p>
                  <p className="text-xs text-slate-400">App preferences</p>
                </div>
              </motion.button>
              
              {/* Help & Support */}
              <motion.button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 text-left transition-colors touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Help & Support</p>
                  <p className="text-xs text-slate-400">Get assistance</p>
                </div>
              </motion.button>
            </div>
            
            {/* Logout Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              <motion.button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors touch-manipulation"
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}