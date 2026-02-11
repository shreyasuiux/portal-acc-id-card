import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileImage } from 'lucide-react';

interface ExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (includeBackSide: boolean) => void;
  mode: 'single' | 'bulk';
  employeeCount?: number;
  includeBackSide: boolean;
  onToggleBackSide: (value: boolean) => void;
}

export function ExportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  mode,
  employeeCount = 1,
  includeBackSide,
  onToggleBackSide,
}: ExportConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(includeBackSide);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Download className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Export Settings</h2>
                    <p className="text-xs text-slate-400">Configure your PDF export</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Export Summary */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <FileImage className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">Export Summary</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mode:</span>
                      <span className="text-white font-medium">
                        {mode === 'single' ? 'Single Employee' : 'Bulk Upload'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cards:</span>
                      <span className="text-white font-medium">
                        {employeeCount} {employeeCount === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Include Back Side Toggle - ONLY for Single Employee Mode */}
                {mode === 'single' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/30"
                  >
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={includeBackSide}
                          onChange={(e) => onToggleBackSide(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer transition-all peer-checked:bg-blue-500 group-hover:ring-2 ring-blue-500/50"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200 mb-0.5">
                          Include Back Side
                        </p>
                        <p className="text-xs text-slate-400">
                          Export both front and back of ID card
                        </p>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* Bulk Mode Note */}
                {mode === 'bulk' && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <p className="text-xs text-blue-200/90">
                      <span className="font-semibold">Note:</span> Bulk export includes both front and back sides by default
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-900/50">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate PDF</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
