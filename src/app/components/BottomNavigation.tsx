import { motion } from 'motion/react';
import { UserPlus, Upload, Palette, Menu } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'single' | 'bulk' | 'templates' | 'more';
  onTabChange: (tab: 'single' | 'bulk' | 'templates' | 'more') => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'single' as const, icon: UserPlus, label: 'Single' },
    { id: 'bulk' as const, icon: Upload, label: 'Bulk' },
    { id: 'templates' as const, icon: Palette, label: 'Templates' },
    { id: 'more' as const, icon: Menu, label: 'More' },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Background with blur */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50" />
      
      {/* Safe area padding for iOS */}
      <div className="relative pb-safe">
        <div className="grid grid-cols-4 items-center px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center py-2 px-1 touch-manipulation"
                whileTap={{ scale: 0.9 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                
                {/* Icon container */}
                <motion.div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-2xl mb-1 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                      : 'bg-transparent'
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  
                  {/* Glow effect for active tab */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
                
                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-colors duration-300 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}