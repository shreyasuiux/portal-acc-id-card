import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RotateCcw, FileText, Eye, Plus, Trash2 } from 'lucide-react';
import type { Template, BackSideText, Branch } from '../utils/templateData';
import { DEFAULT_BACK_TEXT } from '../utils/defaultBackText';
import { IDCardBackPreview } from './IDCardBackPreview';
import { toast } from 'sonner';

interface BackSideTextEditorProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSave: (backText: BackSideText) => void;
}

export function BackSideTextEditor({ template, isOpen, onClose, onSave }: BackSideTextEditorProps) {
  // Migrate old backText format to new format with branches array
  const migrateBackText = (oldBackText: any): BackSideText => {
    // If it already has branches array, return as is
    if (oldBackText?.branches && Array.isArray(oldBackText.branches)) {
      return oldBackText as BackSideText;
    }
    
    // If it has old format, migrate it
    if (oldBackText && 'branch1Label' in oldBackText) {
      const branches: Branch[] = [];
      
      // Add branch 1 if exists
      if (oldBackText.branch1Label || oldBackText.branch1Address) {
        branches.push({
          id: '1',
          label: oldBackText.branch1Label || '',
          address: oldBackText.branch1Address || '',
        });
      }
      
      // Add branch 2 if exists
      if (oldBackText.branch2Label || oldBackText.branch2Address) {
        branches.push({
          id: '2',
          label: oldBackText.branch2Label || '',
          address: oldBackText.branch2Address || '',
        });
      }
      
      return {
        headquarterLabel: oldBackText.headquarterLabel || DEFAULT_BACK_TEXT.headquarterLabel,
        headquarterLocation: oldBackText.headquarterLocation || DEFAULT_BACK_TEXT.headquarterLocation,
        headquarterAddress: oldBackText.headquarterAddress || DEFAULT_BACK_TEXT.headquarterAddress,
        branchesLabel: oldBackText.branchesLabel || DEFAULT_BACK_TEXT.branchesLabel,
        branches: branches.length > 0 ? branches : DEFAULT_BACK_TEXT.branches,
      };
    }
    
    // Default fallback
    return DEFAULT_BACK_TEXT;
  };
  
  const [backText, setBackText] = useState<BackSideText>(() => 
    migrateBackText(template.backText)
  );

  const handleSave = () => {
    onSave(backText);
    toast.success('Back side text saved!', {
      description: 'Your custom text will be applied to all ID cards',
    });
    onClose();
  };

  const handleReset = () => {
    setBackText(DEFAULT_BACK_TEXT);
    toast.info('Reset to default text', {
      description: 'All fields have been restored to default values',
    });
  };

  const handleFieldChange = (field: keyof BackSideText, value: string) => {
    setBackText(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBranchAdd = () => {
    const newBranch: Branch = {
      id: Date.now().toString(), // Generate unique ID
      label: '',
      address: '',
    };
    setBackText(prev => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
    toast.success('Branch added!', {
      description: 'You can now edit the branch details',
    });
  };

  const handleBranchRemove = (index: number) => {
    setBackText(prev => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
    toast.success('Branch removed!', {
      description: 'The branch has been deleted from the list',
    });
  };

  const handleBranchFieldChange = (index: number, field: keyof Branch, value: string) => {
    setBackText(prev => ({
      ...prev,
      branches: prev.branches.map((branch, i) => 
        i === index ? { ...branch, [field]: value } : branch
      ),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="h-full w-full flex items-start justify-center pt-24 pb-8 px-4 md:px-6 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-6xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                style={{ maxHeight: 'calc(100vh - 7rem)' }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Edit Back Side Text</h2>
                      <p className="text-xs text-blue-100">Customize the text displayed on ID card back</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* 2-Column Grid: Form on left, Preview on right */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* LEFT: Form Fields */}
                    <div className="space-y-6">
                    {/* Headquarter Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded" />
                        Headquarter Information
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 mb-1.5 block">Headquarter Label</label>
                          <input
                            type="text"
                            value={backText.headquarterLabel}
                            onChange={(e) => handleFieldChange('headquarterLabel', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="e.g., Headquarter :"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-slate-400 mb-1.5 block">Location Label</label>
                          <input
                            type="text"
                            value={backText.headquarterLocation}
                            onChange={(e) => handleFieldChange('headquarterLocation', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="e.g., Thane :"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Headquarter Address</label>
                        <textarea
                          value={backText.headquarterAddress}
                          onChange={(e) => handleFieldChange('headquarterAddress', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                          placeholder="Enter full address..."
                        />
                      </div>
                    </div>

                    {/* Branches Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded" />
                        Branches Information
                      </h3>
                      
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Branches Label</label>
                        <input
                          type="text"
                          value={backText.branchesLabel}
                          onChange={(e) => handleFieldChange('branchesLabel', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="e.g., Branches :"
                        />
                      </div>

                      {/* Branches List */}
                      <div className="space-y-4">
                        {backText.branches.map((branch, index) => (
                          <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-purple-400">Branch {index + 1}</p>
                              <button
                                onClick={() => handleBranchRemove(index)}
                                className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">Branch Label</label>
                                <input
                                  type="text"
                                  value={branch.label}
                                  onChange={(e) => handleBranchFieldChange(index, 'label', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                                  placeholder="e.g., Mahape :"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">Branch Address</label>
                              <textarea
                                value={branch.address}
                                onChange={(e) => handleBranchFieldChange(index, 'address', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                placeholder="Enter full address..."
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleBranchAdd}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Branch
                        </button>
                      </div>
                    </div>
                    </div>

                    {/* RIGHT: Live Preview */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50 sticky top-0">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-sm font-semibold text-white">Live Preview</h4>
                        </div>
                        
                        <div className="flex items-center justify-center min-h-[500px] bg-slate-900/30 rounded-xl p-4">
                          <IDCardBackPreview scale={2} backText={backText} />
                        </div>

                        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-blue-300">
                            <strong>Real-time Preview:</strong> Changes you make will instantly appear in this preview. This is exactly how the backside will look when exported.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-4 flex items-center justify-between">
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </motion.button>
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