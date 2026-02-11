import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { motion } from 'motion/react';
import { User, Upload, Database, Layout } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'single' | 'bulk' | 'viewAll' | 'templates';
  onModeChange: (mode: 'single' | 'bulk' | 'viewAll' | 'templates') => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const tabs = [
    {
      id: 'single',
      label: 'Single Employee',
      icon: User,
      description: 'Create one ID card'
    },
    {
      id: 'bulk',
      label: 'Bulk Upload',
      sublabel: '(CSV / Excel)',
      icon: Upload,
      description: 'Upload multiple employees'
    },
    {
      id: 'viewAll',
      label: 'Employee Database',
      icon: Database,
      description: 'View all records'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Layout,
      description: 'Browse template gallery'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as 'single' | 'bulk' | 'viewAll' | 'templates')}>
        <div className="grid grid-cols-4 gap-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <input
                  type="radio"
                  id={tab.id}
                  value={tab.id}
                  checked={isActive}
                  onChange={() => onModeChange(tab.id as any)}
                  className="sr-only"
                />
                
                {/* Glow effect for active tab */}
                {isActive && (
                  <motion.div
                    layoutId="tabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 rounded-2xl blur-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <label
                  htmlFor={tab.id}
                  className={`
                    relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer
                    border-2 transition-all duration-300 h-full min-h-[140px]
                    ${isActive 
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 border-transparent shadow-xl shadow-blue-500/30' 
                      : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600/70 hover:bg-slate-800/80 backdrop-blur-sm'
                    }
                  `}
                >
                  {/* Radio indicator */}
                  <div className={`
                    absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? 'border-white bg-white' 
                      : 'border-slate-500 bg-transparent group-hover:border-slate-400'
                    }
                  `}>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-blue-600"
                      />
                    )}
                  </div>
                  
                  {/* Icon */}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon 
                      className={`
                        w-8 h-8 transition-colors
                        ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}
                      `}
                    />
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="text-center">
                    <div className={`
                      font-semibold transition-colors
                      ${isActive ? 'text-white text-[15px]' : 'text-slate-300 text-[14px] group-hover:text-white'}
                    `}>
                      {tab.label}
                    </div>
                    {tab.sublabel && (
                      <div className={`
                        text-[12px] mt-0.5 transition-colors
                        ${isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'}
                      `}>
                        {tab.sublabel}
                      </div>
                    )}
                  </div>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-t-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </label>
              </motion.div>
            );
          })}
        </div>
      </RadioGroup>
    </motion.div>
  );
}