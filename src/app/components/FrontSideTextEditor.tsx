import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RotateCcw, FileText, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Template, FrontSideText } from '../utils/templateData';
import { DEFAULT_FRONT_TEXT } from '../utils/defaultFrontText';
import { IDCardPreview } from './IDCardPreview';
import { toast } from 'sonner';

interface FrontSideTextEditorProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSave: (frontText: FrontSideText) => void;
}

export function FrontSideTextEditor({ template, isOpen, onClose, onSave }: FrontSideTextEditorProps) {
  const [frontText, setFrontText] = useState<FrontSideText>(() => 
    template.frontText || DEFAULT_FRONT_TEXT
  );

  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(frontText);
    toast.success('Front side field labels saved!', {
      description: 'Your custom labels will be applied to all ID cards',
    });
    onClose();
  };

  const handleReset = () => {
    setFrontText(DEFAULT_FRONT_TEXT);
    toast.info('Reset to default labels', {
      description: 'All fields have been restored to default values',
    });
  };

  const handleFieldChange = (field: keyof FrontSideText, value: string | boolean) => {
    setFrontText(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sample employee data for preview
  const sampleEmployee = {
    name: 'John Doe',
    employeeId: 'EMP001',
    mobile: '+91 9876543210',
    bloodGroup: 'O+',
    website: 'www.company.com',
    joiningDate: '2024-01-15',
    validTill: '2030-12-31',
    photo: null,
  };

  const fieldOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Designation', label: 'Designation' },
    { value: 'Department', label: 'Department' },
    { value: 'Email', label: 'Email' },
    { value: 'Location', label: 'Location' },
    { value: 'Branch', label: 'Branch' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-700/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Edit Front Side Field Labels</h2>
                <p className="text-xs text-blue-100">Customize field labels displayed on ID card front</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
            {/* Form Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Customize the labels that appear on the front of your ID cards. 
                    The "Website" field can be changed to "Designation", "Department", or any custom label you need.
                  </p>
                </div>

                {/* Mobile Number Label */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Number Label
                  </label>
                  <input
                    type="text"
                    value={frontText.mobileLabel}
                    onChange={(e) => handleFieldChange('mobileLabel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mobile No., Phone, Contact"
                  />
                </div>

                {/* Blood Group Label */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Blood Group Label
                  </label>
                  <input
                    type="text"
                    value={frontText.bloodGroupLabel}
                    onChange={(e) => handleFieldChange('bloodGroupLabel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Blood Group, Blood Type"
                  />
                </div>

                {/* Customizable Field 1 */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-slate-300">
                      Customizable Field (Website/Designation/Department)
                    </label>
                    <button
                      onClick={() => handleFieldChange('field1Enabled', !frontText.field1Enabled)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {frontText.field1Enabled ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-400" />
                          <span className="text-xs text-green-400">Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                          <span className="text-xs text-slate-400">Disabled</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Choose a preset or enter custom label
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {fieldOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleFieldChange('field1Label', option.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              frontText.field1Label === option.value
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      value={frontText.field1Label}
                      onChange={(e) => handleFieldChange('field1Label', e.target.value)}
                      disabled={!frontText.field1Enabled}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g., Website, Designation, Department, Email"
                    />
                    <p className="text-xs text-slate-400">
                      This flexible field can represent Website, Designation, Department, or any other information you need.
                    </p>
                  </div>
                </div>

                {/* Joining Date Label */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Joining Date Label
                  </label>
                  <input
                    type="text"
                    value={frontText.joiningDateLabel}
                    onChange={(e) => handleFieldChange('joiningDateLabel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Joining Date, Start Date, DOJ"
                  />
                </div>

                {/* Valid Till Label */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valid Till Label
                  </label>
                  <input
                    type="text"
                    value={frontText.validTillLabel}
                    onChange={(e) => handleFieldChange('validTillLabel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Valid Till, Expires, Valid Until"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:w-96 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-t lg:border-t-0 lg:border-l border-slate-700/50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Live Preview
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPreview && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4 text-center">
                    Preview how your labels will appear
                  </p>
                  <div className="transform scale-75 origin-top">
                    <IDCardPreview
                      employeeData={sampleEmployee}
                      template={template}
                      customFrontText={frontText}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-medium text-white mb-2">Current Labels:</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="text-white font-medium">{frontText.mobileLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="text-white font-medium">{frontText.bloodGroupLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Custom Field:</span>
                      <span className={`font-medium ${frontText.field1Enabled ? 'text-white' : 'text-slate-500'}`}>
                        {frontText.field1Label} {!frontText.field1Enabled && '(Disabled)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joining:</span>
                      <span className="text-white font-medium">{frontText.joiningDateLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valid Till:</span>
                      <span className="text-white font-medium">{frontText.validTillLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-900/50 border-t border-slate-700/50 p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all text-sm w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </motion.button>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-medium transition-all text-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-none flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
