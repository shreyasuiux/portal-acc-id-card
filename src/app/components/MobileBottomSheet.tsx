import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage heights: [50, 90]
}

export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoints = [90]
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(snapPoints[0]);

  // Prevent body scroll when sheet is open
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

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;
    
    // Close if dragged down significantly
    if (offset > 100 || velocity > 500) {
      onClose();
    }
  };

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
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: `${100 - currentSnap}%` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl z-50 lg:hidden overflow-hidden"
            style={{ maxHeight: `${currentSnap}vh` }}
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
            </div>
            
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <motion.button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 text-white touch-manipulation"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: `calc(${currentSnap}vh - 120px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
