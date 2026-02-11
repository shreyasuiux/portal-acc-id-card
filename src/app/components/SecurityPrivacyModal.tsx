import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, Eye, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface SecurityPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityPrivacyModal({ isOpen, onClose }: SecurityPrivacyModalProps) {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    dataEncryption: true,
    activityLog: true,
    shareAnalytics: false,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container - Positioned below header */}
          <div className="h-full w-full flex items-start justify-center pt-24 pb-8 px-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="relative w-full max-w-3xl pointer-events-auto my-auto"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl" />

              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 px-8 py-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>
                        <p className="text-slate-400 text-sm">Manage your security settings</p>
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
                  {/* Security Status */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Security Status: Strong</h3>
                    </div>
                    <p className="text-sm text-green-300">
                      Your account is protected with Microsoft 365 SSO authentication and enterprise-grade encryption.
                    </p>
                  </div>

                  {/* Authentication */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Key className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Authentication</h3>
                    </div>
                    
                    <SecurityToggle
                      icon={Lock}
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security with 2FA"
                      checked={settings.twoFactorAuth}
                      onChange={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                      recommended
                    />

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes (Recommended)</option>
                        <option value="60">60 minutes</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Data Protection */}
                  <div className="space-y-4 pt-6 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Data Protection</h3>
                    </div>
                    
                    <SecurityToggle
                      icon={Lock}
                      label="End-to-End Encryption"
                      description="Encrypt all employee data at rest and in transit"
                      checked={settings.dataEncryption}
                      onChange={() => setSettings({ ...settings, dataEncryption: !settings.dataEncryption })}
                      locked
                    />

                    <SecurityToggle
                      icon={Eye}
                      label="Activity Log"
                      description="Track all actions performed in the portal"
                      checked={settings.activityLog}
                      onChange={() => setSettings({ ...settings, activityLog: !settings.activityLog })}
                    />
                  </div>

                  {/* Privacy Settings */}
                  <div className="space-y-4 pt-6 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Privacy</h3>
                    </div>
                    
                    <SecurityToggle
                      icon={Eye}
                      label="Share Usage Analytics"
                      description="Help us improve by sharing anonymous usage data"
                      checked={settings.shareAnalytics}
                      onChange={() => setSettings({ ...settings, shareAnalytics: !settings.shareAnalytics })}
                    />

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-sm text-blue-300 mb-2">
                        <strong>Your Privacy Matters:</strong>
                      </p>
                      <ul className="text-xs text-blue-200 space-y-1 ml-4">
                        <li>• We never share your personal data with third parties</li>
                        <li>• All employee data is stored locally in your browser</li>
                        <li>• You have full control over your information</li>
                      </ul>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-4 pt-6 border-t border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
                    <div className="space-y-2">
                      <ActivityItem
                        icon={CheckCircle2}
                        text="Successful login from Chrome, Windows"
                        time="2 hours ago"
                        type="success"
                      />
                      <ActivityItem
                        icon={CheckCircle2}
                        text="Password last changed"
                        time="30 days ago"
                        type="success"
                      />
                      <ActivityItem
                        icon={Eye}
                        text="Profile information updated"
                        time="2 days ago"
                        type="info"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center">
                  <button
                    onClick={() => {
                      // Download security report
                      alert('Security report will be downloaded');
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Download Security Report
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SecurityToggle({ 
  icon: Icon,
  label, 
  description, 
  checked, 
  onChange,
  recommended = false,
  locked = false,
}: { 
  icon: any;
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: () => void;
  recommended?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white">{label}</div>
            {recommended && (
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                Recommended
              </span>
            )}
            {locked && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                Active
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">{description}</div>
        </div>
      </div>
      <button
        onClick={locked ? undefined : onChange}
        disabled={locked}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-slate-600'
        } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
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

function ActivityItem({ icon: Icon, text, time, type }: { icon: any; text: string; time: string; type: 'success' | 'info' | 'warning' }) {
  const colors = {
    success: 'text-green-400',
    info: 'text-blue-400',
    warning: 'text-orange-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
      <Icon className={`w-4 h-4 ${colors[type]}`} />
      <div className="flex-1">
        <div className="text-sm text-white">{text}</div>
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  );
}