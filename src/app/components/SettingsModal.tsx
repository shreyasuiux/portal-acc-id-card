import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Bell, Globe, Palette, Download, Shield, Key, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoSave: true,
    darkMode: true,
    language: 'en',
    pdfQuality: 'high',
    autoBackup: true,
    twoFactor: false,
  });
  
  const [removeBgApiKey, setRemoveBgApiKey] = useState('');
  
  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('removebg_api_key') || '';
    setRemoveBgApiKey(savedKey);
  }, [isOpen]);
  
  const handleSaveApiKey = () => {
    localStorage.setItem('removebg_api_key', removeBgApiKey.trim());
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
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
            <div className="h-full w-full flex items-start justify-center pt-24 pb-8 px-4 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                className="relative w-full max-w-2xl pointer-events-auto"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-8 py-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Settings</h2>
                          <p className="text-slate-400 text-sm">Customize your experience</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1 p-8 space-y-6">
                    {/* Notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <SettingItem
                          label="Push Notifications"
                          description="Receive notifications for important updates"
                          checked={settings.notifications}
                          onChange={() => handleToggle('notifications')}
                        />
                        <SettingItem
                          label="Email Alerts"
                          description="Get email notifications for card generations"
                          checked={settings.emailAlerts}
                          onChange={() => handleToggle('emailAlerts')}
                        />
                      </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-4 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Appearance</h3>
                      </div>
                      
                      <SettingItem
                        label="Dark Mode"
                        description="Use dark theme across the application"
                        checked={settings.darkMode}
                        onChange={() => handleToggle('darkMode')}
                      />

                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Language
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>

                    {/* Export & Storage */}
                    <div className="space-y-4 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Export & Storage</h3>
                      </div>
                      
                      <SettingItem
                        label="Auto-Save"
                        description="Automatically save employee data"
                        checked={settings.autoSave}
                        onChange={() => handleToggle('autoSave')}
                      />

                      <SettingItem
                        label="Automatic Backup"
                        description="Daily backup of employee database"
                        checked={settings.autoBackup}
                        onChange={() => handleToggle('autoBackup')}
                      />

                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          PDF Export Quality
                        </label>
                        <select
                          value={settings.pdfQuality}
                          onChange={(e) => setSettings({ ...settings, pdfQuality: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                        >
                          <option value="low">Standard (Faster)</option>
                          <option value="medium">Medium</option>
                          <option value="high">High (Recommended)</option>
                          <option value="ultra">Ultra (Slowest)</option>
                        </select>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-4 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">Security</h3>
                      </div>
                      
                      <SettingItem
                        label="Two-Factor Authentication"
                        description="Add an extra layer of security to your account"
                        checked={settings.twoFactor}
                        onChange={() => handleToggle('twoFactor')}
                      />

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-sm text-blue-300">
                          <strong>Security Tip:</strong> Enable two-factor authentication for enhanced account protection.
                        </p>
                      </div>
                    </div>

                    {/* API Configuration - Professional Background Removal */}
                    <div className="space-y-4 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Professional Background Removal</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-yellow-300 font-medium mb-2">
                              <strong>Upgrade to 100% Accuracy!</strong>
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              For <strong>professional-grade</strong> background removal with 0% error, add your <strong>remove.bg API key</strong>.
                              Without it, the system uses local AI processing (medium accuracy). Get your free API key at{' '}
                              <a 
                                href="https://www.remove.bg/api" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                remove.bg/api
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Remove.bg API Key (Optional)
                        </label>
                        <input
                          type="text"
                          value={removeBgApiKey}
                          onChange={(e) => setRemoveBgApiKey(e.target.value)}
                          onBlur={handleSaveApiKey}
                          placeholder="Enter your API key for professional results..."
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          API key is stored locally and never shared. Saved automatically on blur.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center">
                    <button
                      onClick={() => {
                        // Reset to defaults
                        setSettings({
                          notifications: true,
                          emailAlerts: true,
                          autoSave: true,
                          darkMode: true,
                          language: 'en',
                          pdfQuality: 'high',
                          autoBackup: true,
                          twoFactor: false,
                        });
                      }}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      Reset to Defaults
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Save Settings
                    </button>
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

function SettingItem({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400 mt-1">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}