import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { updateEmployee, getAllEmployees, type EmployeeRecord } from '../utils/employeeStorage';
import { removeImageBackground } from '../utils/backgroundRemoval';
import { toast } from 'sonner';
import { CustomDatePicker } from './CustomDatePicker';

interface EditEmployeeModalProps {
  employee: EmployeeRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ValidationErrors {
  name?: string;
  employeeId?: string;
  mobile?: string;
  joiningDate?: string;
  validTill?: string;
}

export function EditEmployeeModal({ employee, isOpen, onClose, onSave }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    mobile: '',
    bloodGroup: '',
    website: '',
    joiningDate: '',
    validTill: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        employeeId: employee.employeeId,
        mobile: employee.mobile,
        bloodGroup: employee.bloodGroup,
        website: employee.website,
        joiningDate: employee.joiningDate,
        validTill: employee.validTill,
      });
      setPhotoPreview(employee.photoBase64);
      setErrors({});
      setTouchedFields(new Set());
    }
  }, [employee]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Employee name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Name can only contain letters, spaces, and (. \' -)';
    return undefined;
  };

  const validateEmployeeId = (id: string): string | undefined => {
    if (!id.trim()) return 'Employee ID is required';
    if (id.trim().length < 2) return 'Employee ID must be at least 2 digits';
    if (id.trim().length > 20) return 'Employee ID must be less than 20 digits';
    // Only allow digits (0-9)
    if (!/^[0-9]+$/.test(id.trim())) return 'Employee ID can only contain digits (0-9)';
    return undefined;
  };

  const validateMobile = (mobile: string): string | undefined => {
    if (!mobile.trim()) return 'Mobile number is required';
    const cleanMobile = mobile.replace(/[\s\-()]/g, '');
    if (!/^[0-9]{10}$/.test(cleanMobile)) return 'Please enter a valid 10-digit mobile number';
    return undefined;
  };

  const validateJoiningDate = (date: string): string | undefined => {
    if (!date) return 'Joining date is required';
    // Removed: Future date validation - users can create IDs for future POV
    return undefined;
  };

  const validateValidTill = (validTill: string, joiningDate: string): string | undefined => {
    if (!validTill) return 'Valid till date is required';
    if (!joiningDate) return undefined;
    const validDate = new Date(validTill);
    const joinDate = new Date(joiningDate);
    if (validDate <= joinDate) return 'Valid till must be after joining date';
    return undefined;
  };

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name': return validateName(value);
      case 'employeeId': return validateEmployeeId(value);
      case 'mobile': return validateMobile(value);
      case 'joiningDate': return validateJoiningDate(value);
      case 'validTill': return validateValidTill(value, formData.joiningDate);
      default: return undefined;
    }
  };

  const handleInputChange = (field: keyof Omit<EmployeeRecord, 'id' | 'timestamp' | 'photoBase64'>, value: string) => {
    // Special handling for name - only allow letters, spaces, and (. ' -)
    if (field === 'name') {
      // Remove any digits from the input
      const cleaned = value.replace(/[0-9]/g, '');
      
      // If digits were removed, show a toast warning
      if (cleaned !== value) {
        toast.error('Numbers are not allowed in employee name', {
          description: 'Name can only contain letters, spaces, and (. \' -)',
          duration: 3000,
        });
      }
      
      // Update with cleaned value (no digits)
      setFormData({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }
    
    // Special handling for mobile number - limit to 10 digits
    if (field === 'mobile') {
      // Remove all non-digit characters
      const cleaned = value.replace(/\D/g, '');
      
      // Check if trying to enter more than 10 digits
      if (cleaned.length > 10) {
        toast.error('Mobile number cannot exceed 10 digits', {
          description: 'Please enter a valid 10-digit mobile number',
          duration: 3000,
        });
        return; // Don't update the value
      }
      
      // Update with cleaned value (only digits)
      setFormData({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }
    
    // Special handling for employee ID - only allow digits
    if (field === 'employeeId') {
      // Remove all non-digit characters
      const cleaned = value.replace(/\D/g, '');
      
      // Check if trying to enter more than 20 digits
      if (cleaned.length > 20) {
        toast.error('Employee ID cannot exceed 20 digits', {
          description: 'Please enter a valid numeric Employee ID',
          duration: 3000,
        });
        return; // Don't update the value
      }
      
      // Check for duplicates if length is at least 2 (excluding current employee)
      if (cleaned.length >= 2) {
        const allEmployees = getAllEmployees();
        const isDuplicate = allEmployees.some(
          emp => emp.employeeId.toLowerCase() === cleaned.toLowerCase() && emp.id !== employee?.id
        );
        
        if (isDuplicate) {
          toast.error('Employee ID already exists', {
            description: 'This Employee ID is already taken. Please use a different ID.',
            duration: 4000,
          });
          setErrors(prev => ({
            ...prev,
            employeeId: 'This Employee ID is already taken',
          }));
        } else {
          // Clear the error if it was a duplicate error
          if (errors.employeeId === 'This Employee ID is already taken') {
            setErrors(prev => ({
              ...prev,
              employeeId: undefined,
            }));
          }
        }
      }
      
      // Update with cleaned value (only digits)
      setFormData({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
      return;
    }
    
    setFormData({ ...formData, [field]: value });
    
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
    const value = formData[field as keyof typeof formData];
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // ALWAYS remove background - mandatory processing
      const processedFile = await removeImageBackground(file);
      setPhotoFile(processedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
      
      toast.success('Background removed successfully', {
        description: 'Photo processed and ready',
      });
    } catch (error) {
      console.error('❌ Background removal failed:', error);
      toast.error('Background removal failed', {
        description: 'Please try uploading a different image or ensure the image is clear and well-lit.',
      });
      // Do NOT use original image - background removal is mandatory
    } finally {
      setIsProcessing(false);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsSaving(true);
    try {
      await updateEmployee(employee.id, {
        ...formData,
        photoBase64: photoPreview,
      });
      onSave();
      onClose();
      toast.success('Employee updated successfully');
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && employee && (
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
            <div className="h-full w-full flex items-center justify-center py-8 px-4 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col pointer-events-auto my-auto"
                style={{ maxHeight: '90vh' }}
              >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Edit Employee</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Form - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Employee Photo
                      </label>
                      <div className="flex items-center gap-4">
                        {/* Preview */}
                        <div className="w-24 h-28 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              No photo
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <label className="flex-1 cursor-pointer">
                          <div className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg border-2 border-dashed border-slate-600 hover:border-blue-500 transition-all flex items-center justify-center gap-2">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                <span className="text-sm text-blue-400">Processing...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-sm text-slate-300">Change Photo</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            disabled={isProcessing}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., John Smith"
                        required
                      />
                      {errors.name && (
                        <div className="text-sm text-red-400 mt-1">
                          <AlertCircle className="w-4 h-4 inline-block mr-1" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Employee ID */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Employee ID <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        onBlur={() => handleBlur('employeeId')}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1001"
                        required
                      />
                      {errors.employeeId && (
                        <div className="text-sm text-red-400 mt-1">
                          <AlertCircle className="w-4 h-4 inline-block mr-1" />
                          {errors.employeeId}
                        </div>
                      )}
                    </div>

                    {/* Mobile & Blood Group */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          onBlur={() => handleBlur('mobile')}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="9876543210"
                          required
                        />
                        {errors.mobile && (
                          <div className="text-sm text-red-400 mt-1">
                            <AlertCircle className="w-4 h-4 inline-block mr-1" />
                            {errors.mobile}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Blood Group <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
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
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="www.company.com"
                      />
                    </div>

                    {/* Joining Date & Valid Till */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Joining Date <span className="text-red-400">*</span>
                        </label>
                        <CustomDatePicker
                          value={formData.joiningDate}
                          onChange={(date) => handleInputChange('joiningDate', date)}
                          onBlur={() => handleBlur('joiningDate')}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {errors.joiningDate && (
                          <div className="text-sm text-red-400 mt-1">
                            <AlertCircle className="w-4 h-4 inline-block mr-1" />
                            {errors.joiningDate}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Valid Till <span className="text-red-400">*</span>
                        </label>
                        <CustomDatePicker
                          value={formData.validTill}
                          onChange={(date) => handleInputChange('validTill', date)}
                          onBlur={() => handleBlur('validTill')}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {errors.validTill && (
                          <div className="text-sm text-red-400 mt-1">
                            <AlertCircle className="w-4 h-4 inline-block mr-1" />
                            {errors.validTill}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}