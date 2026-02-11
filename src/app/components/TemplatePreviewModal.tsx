import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Template } from '../utils/templateData';
import { TemplatePreviewCard } from './TemplatePreviewCard';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  const [currentSide, setCurrentSide] = React.useState<'front' | 'back'>('front');

  React.useEffect(() => {
    if (isOpen) {
      setCurrentSide('front');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && template && (
        <>
          {/* Backdrop - Full viewport coverage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal - Positioned below header */}
          <div className="fixed inset-0 z-[101] pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="h-full w-full flex items-start justify-center pt-24 pb-8 px-4 md:px-8 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 max-w-5xl w-full pointer-events-auto"
                style={{ maxHeight: 'calc(100vh - 7rem)' }}
              >
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-6 right-6 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{template.name}</h2>
                  <p className="text-slate-400">{template.description}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      template.category === 'professional' ? 'bg-blue-500/20 text-blue-400' :
                      template.category === 'modern' ? 'bg-purple-500/20 text-purple-400' :
                      template.category === 'creative' ? 'bg-pink-500/20 text-pink-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {template.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Color Palette:</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-600" style={{ backgroundColor: template.colors.primary }} />
                        <div className="w-6 h-6 rounded-full border-2 border-slate-600" style={{ backgroundColor: template.colors.secondary }} />
                        <div className="w-6 h-6 rounded-full border-2 border-slate-600" style={{ backgroundColor: template.colors.accent }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Front Side */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Front Side</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        currentSide === 'front' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        Active
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex items-center justify-center cursor-pointer"
                      onClick={() => setCurrentSide('front')}
                    >
                      <TemplatePreviewCard template={template} side="front" scale={2} />
                    </motion.div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-white mb-2">Design Features</h4>
                      <ul className="space-y-1 text-xs text-slate-400">
                        <li>• Layout: {template.front.layout}</li>
                        <li>• Photo Shape: {template.front.photoShape}</li>
                        <li>• Background: {template.front.backgroundPattern || 'solid'}</li>
                        <li>• Accent Elements: {template.front.accentElements.length}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Back Side</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        currentSide === 'back' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {currentSide === 'back' ? 'Active' : 'Preview'}
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex items-center justify-center cursor-pointer"
                      onClick={() => setCurrentSide('back')}
                    >
                      <TemplatePreviewCard template={template} side="back" scale={2} />
                    </motion.div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-white mb-2">Design Features</h4>
                      <ul className="space-y-1 text-xs text-slate-400">
                        <li>• Layout: {template.back.layout}</li>
                        <li>• Background: {template.back.backgroundPattern || 'solid'}</li>
                        <li>• Accent Elements: {template.back.accentElements.length}</li>
                        <li>• Info Display: Centered</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Color Information */}
                <div className="mt-8 bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-white mb-4">Color Scheme</h4>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(template.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div 
                          className="w-full h-16 rounded-lg border-2 border-slate-600"
                          style={{ background: value }}
                        />
                        <div>
                          <div className="text-xs font-medium text-white capitalize">{key}</div>
                          <div className="text-xs text-slate-500 font-mono">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}