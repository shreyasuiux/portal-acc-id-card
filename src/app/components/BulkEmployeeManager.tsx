import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { ParsedResult } from '../utils/bulkUploadParser';
import { toast } from 'sonner';
import { removeImageBackground } from '../utils/backgroundRemoval';
import { processPhotoForIDCard } from '../utils/photoCropper';
import { CustomDatePicker } from './CustomDatePicker';

interface BulkEmployeeManagerProps {
  employees: EmployeeRecord[];
  onEmployeesUpdate: (employees: EmployeeRecord[]) => void;
  onRefreshData: () => void;
  onRefreshImages: () => void;
  zipResult?: {
    isValid: boolean;
    matches: Array<{ employeeId: string }>;
  } | null;
}

interface ValidationErrors {
  name?: string;
  employeeId?: string;
  mobile?: string;
  bloodGroup?: string;
  joiningDate?: string;
  validTill?: string;
}

export function BulkEmployeeManager({ 
  employees, 
  onEmployeesUpdate,
  onRefreshData,
  onRefreshImages,
  zipResult
}: BulkEmployeeManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'missing-photo' | 'error'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EmployeeRecord>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Determine employee status
  const getEmployeeStatus = (emp: EmployeeRecord): 'valid' | 'missing-photo' | 'error' => {
    if (!emp.photoBase64 || emp.photoBase64 === '') {
      return 'missing-photo';
    }
    // Add more validation rules here if needed
    if (!emp.name || !emp.employeeId || !emp.mobile) {
      return 'error';
    }
    return 'valid';
  };

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(emp => getEmployeeStatus(emp) === filterStatus);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.mobile.includes(query)
      );
    }

    return result;
  }, [employees, filterStatus, searchQuery]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      all: employees.length,
      valid: employees.filter(emp => getEmployeeStatus(emp) === 'valid').length,
      'missing-photo': employees.filter(emp => getEmployeeStatus(emp) === 'missing-photo').length,
      error: employees.filter(emp => getEmployeeStatus(emp) === 'error').length,
    };
  }, [employees]);

  const handleEdit = (emp: EmployeeRecord) => {
    setEditingId(emp.id);
    setEditForm(emp);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updatedEmployees = employees.map(emp => 
      emp.id === editingId ? { ...emp, ...editForm } : emp
    );

    onEmployeesUpdate(updatedEmployees);
    setEditingId(null);
    setEditForm({});
    
    toast.success('Employee updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    onEmployeesUpdate(updatedEmployees);
    toast.success('Employee removed');
  };

  const handlePhotoUpload = async (empId: string, file: File) => {
    try {
      toast.info('Processing photo...', { description: 'Removing background and cropping' });
      
      // Step 1: Remove background
      const processedFile = await removeImageBackground(file);
      
      // Step 2: Crop to 64×80px
      const croppedBase64 = await processPhotoForIDCard(processedFile);
      
      // Step 3: Update employee
      const updatedEmployees = employees.map(emp => 
        emp.id === empId ? { ...emp, photoBase64: croppedBase64 } : emp
      );
      onEmployeesUpdate(updatedEmployees);
      
      toast.success('Photo updated successfully!', { 
        description: 'Background removed and cropped to ID card size' 
      });
    } catch (err) {
      console.error('Photo upload failed:', err);
      toast.error('Failed to process photo', {
        description: err instanceof Error ? err.message : 'Please try a different image'
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    
    const updatedEmployees = employees.filter(emp => !selectedIds.has(emp.id));
    onEmployeesUpdate(updatedEmployees);
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} employee(s) removed`);
  };

  const StatusBadge = ({ status }: { status: 'valid' | 'missing-photo' | 'error' }) => {
    const config = {
      valid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Valid' },
      'missing-photo': { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Missing Photo' },
      error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Error' },
    };

    const { icon: Icon, color, bg, label } = config[status];

    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${bg}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-[10px] font-medium ${color}`}>{label}</span>
      </div>
    );
  };

  if (employees.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Review & Edit Employees</h3>
          <p className="text-xs text-slate-400 mt-1">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} loaded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onRefreshData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-all border border-blue-500/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-upload CSV
          </motion.button>
          <motion.button
            onClick={onRefreshImages}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-all border border-purple-500/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-upload ZIP
          </motion.button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          {(['all', 'valid', 'missing-photo', 'error'] as const).map((status) => {
            const labels = {
              all: 'All',
              valid: 'Valid',
              'missing-photo': 'Missing Photo',
              error: 'Errors',
            };
            const count = statusCounts[status];

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {labels[status]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-400 font-medium">
              {selectedIds.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-all"
            >
              Clear
            </button>
            <motion.button
              onClick={handleDeleteSelected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Employee List */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-700 text-xs font-medium text-slate-400">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-1">Photo</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Employee ID</div>
          <div className="col-span-2">Mobile</div>
          <div className="col-span-1">Blood</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredEmployees.map((emp, index) => {
              const status = getEmployeeStatus(emp);
              const isEditing = editingId === emp.id;
              const isSelected = selectedIds.has(emp.id);

              return (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.02 }}
                  className={isSelected ? 'bg-blue-500/10' : ''}
                >
                  {/* Main Row */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-800/40 transition-all">
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(emp.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Photo */}
                    <div className="col-span-1 flex items-center">
                      <div className="relative group">
                        {emp.photoBase64 ? (
                          <img
                            src={emp.photoBase64}
                            alt={emp.name}
                            className="w-10 h-10 rounded-lg object-contain border border-slate-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        {/* Upload Photo Button */}
                        <input
                          type="file"
                          id={`photo-${emp.id}`}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(emp.id, file);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`photo-${emp.id}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-lg"
                        >
                          <Upload className="w-4 h-4 text-white" />
                        </label>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-xs text-white truncate">{emp.name}</span>
                    </div>

                    {/* Employee ID */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-xs text-white font-mono">{emp.employeeId}</span>
                    </div>

                    {/* Mobile */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-xs text-slate-300 font-mono">{emp.mobile}</span>
                    </div>

                    {/* Blood Group */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-xs text-slate-300">{emp.bloodGroup}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      <StatusBadge status={status} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <motion.button
                        onClick={() => handleEdit(emp)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(emp.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-slate-800/60 border-t border-slate-700"
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-white">Edit Employee Details</h4>
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={handleSaveEdit}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-green-500/30"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save Changes
                              </motion.button>
                              <motion.button
                                onClick={handleCancelEdit}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </motion.button>
                            </div>
                          </div>

                          {/* Form Fields Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., John Smith"
                              />
                            </div>

                            {/* Employee ID */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Employee ID <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={editForm.employeeId || ''}
                                onChange={(e) => {
                                  // Only allow digits
                                  const cleaned = e.target.value.replace(/\D/g, '');
                                  if (cleaned.length <= 20) {
                                    setEditForm({ ...editForm, employeeId: cleaned });
                                  }
                                }}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                placeholder="e.g., 1001"
                              />
                            </div>

                            {/* Mobile */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Mobile Number <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="tel"
                                value={editForm.mobile || ''}
                                onChange={(e) => {
                                  // Only allow digits, max 10
                                  const cleaned = e.target.value.replace(/\D/g, '');
                                  if (cleaned.length <= 10) {
                                    setEditForm({ ...editForm, mobile: cleaned });
                                  }
                                }}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                placeholder="9876543210"
                              />
                            </div>

                            {/* Blood Group */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Blood Group <span className="text-red-400">*</span>
                              </label>
                              <select
                                value={editForm.bloodGroup || ''}
                                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                              </select>
                            </div>

                            {/* Website */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Website
                              </label>
                              <input
                                type="text"
                                value={editForm.website || ''}
                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="www.company.com"
                              />
                            </div>

                            {/* Joining Date */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Joining Date <span className="text-red-400">*</span>
                              </label>
                              <CustomDatePicker
                                value={editForm.joiningDate || ''}
                                onChange={(date) => setEditForm({ ...editForm, joiningDate: date })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Valid Till */}
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Valid Till <span className="text-red-400">*</span>
                              </label>
                              <CustomDatePicker
                                value={editForm.validTill || ''}
                                onChange={(date) => setEditForm({ ...editForm, validTill: date })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">No employees found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </motion.div>
  );
}