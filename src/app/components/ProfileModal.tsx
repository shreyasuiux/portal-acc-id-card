import { AnimatePresence, motion } from 'motion/react';
import { X, User, Mail, Building, Calendar, Edit2, Save, Camera } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CustomDatePicker } from './CustomDatePicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; avatar: string };
  onSave: (updatedUser: { name: string; email: string; avatar: string }) => void;
}

export function ProfileModal({ isOpen, onClose, user, onSave }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: 'Human Resources',
    role: 'HR Executive',
    joinDate: '2024-01-15',
    avatar: user.avatar,
  });

  const handleSave = () => {
    onSave({
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar,
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
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
                className="relative w-full max-w-lg pointer-events-auto"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-8 py-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">My Profile</h2>
                          <p className="text-slate-400 text-sm">Manage your account information</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </motion.button>
                        )}
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
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-500/30">
                          <ImageWithFallback
                            src={formData.avatar}
                            alt={formData.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{formData.name}</h3>
                        <p className="text-slate-400 text-sm mb-2">{formData.role}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            Active
                          </span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Department
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Role
                        </label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Join Date */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Join Date
                        </label>
                        <CustomDatePicker
                          value={formData.joinDate}
                          onChange={(date) => setFormData({ ...formData, joinDate: date })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-2xl font-bold text-blue-400">142</div>
                        <div className="text-xs text-slate-400 mt-1">Cards Generated</div>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-2xl font-bold text-purple-400">38</div>
                        <div className="text-xs text-slate-400 mt-1">Days Active</div>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-2xl font-bold text-green-400">98%</div>
                        <div className="text-xs text-slate-400 mt-1">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  {isEditing && (
                    <div className="px-8 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-end gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}