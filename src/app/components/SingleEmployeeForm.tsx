import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Check, Sparkles, Loader2, AlertCircle, CheckCircle, RefreshCw, Layout, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { removeImageBackground } from '../utils/backgroundRemoval';
import { processPhotoForIDCard } from '../utils/photoCropper';
import { getAllEmployees } from '../utils/employeeStorage';
import { toast } from 'sonner';
import type { Template } from '../utils/templateData';
import { AIExportLoader } from './AIExportLoader';
import { ImageCropModal } from './ImageCropModal';
import { CustomDatePicker } from './CustomDatePicker';

interface EmployeeFormData {
  name: string;
  employeeId: string;
  mobile: string;
  bloodGroup: string;
  website: string;
  joiningDate: string;
  validTill: string;
  photo: File | null;
}

interface SingleEmployeeFormProps {
  formData: EmployeeFormData;
  onFormChange: (data: EmployeeFormData) => void;
  selectedTemplate?: Template;
}

interface ValidationErrors {
  name?: string;
  employeeId?: string;
  mobile?: string;
  joiningDate?: string;
  validTill?: string;
  photo?: string;
}

export function SingleEmployeeForm({ formData, onFormChange, selectedTemplate }: SingleEmployeeFormProps) {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Employee name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, and (. \' -)';
    }
    return undefined;
  };

  const validateEmployeeId = (id: string): string | undefined => {
    if (!id.trim()) {
      return 'Employee ID is required';
    }
    if (id.trim().length < 2) {
      return 'Employee ID must be at least 2 digits';
    }
    if (id.trim().length > 20) {
      return 'Employee ID must be less than 20 digits';
    }
    // Only allow digits (0-9)
    if (!/^[0-9]+$/.test(id.trim())) {
      return 'Employee ID can only contain digits (0-9)';
    }
    return undefined;
  };

  const validateMobile = (mobile: string): string | undefined => {
    if (!mobile.trim()) {
      return 'Mobile number is required';
    }
    // Remove spaces, hyphens, and parentheses
    const cleanMobile = mobile.replace(/[\s\-()]/g, '');
    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return undefined;
  };

  const validateJoiningDate = (date: string): string | undefined => {
    if (!date) {
      return 'Joining date is required';
    }
    const joiningDate = new Date(date);
    const yearAgo = new Date();
    yearAgo.setFullYear(new Date().getFullYear() - 50);
    
    // Removed: Future date validation - users can create IDs for future POV
    if (joiningDate < yearAgo) {
      return 'Joining date seems too old (more than 50 years ago)';
    }
    return undefined;
  };

  const validateValidTill = (validTill: string, joiningDate: string): string | undefined => {
    if (!validTill) {
      return 'Valid till date is required';
    }
    if (!joiningDate) {
      return undefined; // Wait for joining date to be filled
    }
    const validDate = new Date(validTill);
    const joinDate = new Date(joiningDate);
    
    if (validDate <= joinDate) {
      return 'Valid till must be after joining date';
    }
    return undefined;
  };

  const validatePhoto = (photo: File | null): string | undefined => {
    if (!photo) {
      return 'Employee photo is required';
    }
    return undefined;
  };

  // Validate all fields
  const validateField = (field: keyof EmployeeFormData, value: any): string | undefined => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'employeeId':
        return validateEmployeeId(value);
      case 'mobile':
        return validateMobile(value);
      case 'joiningDate':
        return validateJoiningDate(value);
      case 'validTill':
        return validateValidTill(value, formData.joiningDate);
      case 'photo':
        return validatePhoto(value);
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
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
      onFormChange({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({
          ...prev,
          [field]: error,
        }));
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
      onFormChange({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({
          ...prev,
          [field]: error,
        }));
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
      
      // Check for duplicates if length is at least 2
      if (cleaned.length >= 2) {
        const allEmployees = getAllEmployees();
        const isDuplicate = allEmployees.some(emp => emp.employeeId.toLowerCase() === cleaned.toLowerCase());
        
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
      onFormChange({ ...formData, [field]: cleaned });
      
      // Validate the field if it has been touched
      if (touchedFields.has(field)) {
        const error = validateField(field, cleaned);
        setErrors(prev => ({
          ...prev,
          [field]: error,
        }));
      }
      return;
    }
    
    onFormChange({ ...formData, [field]: value });
    
    // Validate the field if it has been touched
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleBlur = (field: keyof EmployeeFormData) => {
    setFocusedField(null);
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validate on blur
    const value = formData[field];
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setPhotoUploaded(false);
      
      try {
        // Step 1: Remove background (mandatory)
        console.log('🎨 Step 1: Removing background...');
        let processedFile: File;
        
        try {
          processedFile = await removeImageBackground(file);
        } catch (bgError) {
          // Background removal failed - offer to proceed without it
          console.warn('Background removal failed, using original image:', bgError);
          
          toast.error('Background removal failed', {
            description: 'Proceeding with original photo. You can try again with a different image.',
            duration: 4000,
          });
          
          // Use original file if background removal fails
          processedFile = file;
        }
        
        // Step 2: Crop to exactly 1280×1600px with face-centered positioning
        console.log('✂️ Step 2: Cropping to 1280×1600px ULTRA-HI-RES...');
        const croppedBase64 = await processPhotoForIDCard(processedFile);
        
        // Store the pre-cropped base64 string
        onFormChange({ ...formData, photo: croppedBase64 as any });
        setPhotoUploaded(true);
        setOriginalPhotoUrl(croppedBase64); // Store for editing
        console.log('📸 Photo uploaded and stored for editing. URL length:', croppedBase64.length);
        
        toast.success('Photo processed successfully!', {
          description: 'Photo cropped to ID card size',
        });
      } catch (error) {
        console.error('❌ Photo processing failed:', error);
        toast.error('Photo processing failed', {
          description: error instanceof Error ? error.message : 'Please try uploading a different image.',
        });
        setPhotoUploaded(false);
      } finally {
        setIsProcessing(false);
        // Reset the input value so the same file can be selected again
        e.target.value = '';
      }
    }
  };

  const formFields = [
    { id: 'name', label: 'Employee Name', placeholder: 'Enter full name', type: 'text' },
    { id: 'employeeId', label: 'Employee ID', placeholder: 'Enter employee ID', type: 'text' },
    { id: 'mobile', label: 'Mobile Number', placeholder: 'Enter mobile number', type: 'text' },
  ];

  const handleApplyCroppedImage = (croppedImageUrl: string) => {
    // Update form data with cropped image
    onFormChange({ ...formData, photo: croppedImageUrl as any });
    setOriginalPhotoUrl(croppedImageUrl);
    
    toast.success('Photo updated successfully!', {
      description: 'Your adjustments have been applied',
    });
  };

  // Debug: Log state changes
  console.log('🔍 SingleEmployeeForm state:', { photoUploaded, isProcessing, hasOriginalPhoto: !!originalPhotoUrl, hasTemplate: !!selectedTemplate });

  return (
    <>
      <div className="space-y-6">
        {/* Applied Template Display */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm"
          >
            <Layout className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] text-slate-300">
              Applied Template:{' '}
              <span className="font-semibold text-white">{selectedTemplate.name}</span>
            </span>
          </motion.div>
        )}

        {formFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor={field.id} className="text-[13px] font-medium text-white flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              {field.label}
            </Label>
            <motion.div
              animate={{
                scale: focusedField === field.id ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Input
                id={field.id}
                value={formData[field.id as keyof EmployeeFormData] as string}
                onChange={(e) => handleInputChange(field.id as keyof EmployeeFormData, e.target.value)}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => handleBlur(field.id as keyof EmployeeFormData)}
                placeholder={field.placeholder}
                className="text-[14px] h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors[field.id as keyof EmployeeFormData] && (
                <p className="text-[12px] text-red-500 mt-1">
                  {errors[field.id as keyof EmployeeFormData]}
                </p>
              )}
            </motion.div>
          </motion.div>
        ))}

        {/* Blood Group */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <Label htmlFor="bloodGroup" className="text-[13px] font-medium text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Blood Group
          </Label>
          <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
            <SelectTrigger className="text-[14px] h-11 bg-slate-800/50 border-slate-700 text-white 
                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50">
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                <SelectItem key={group} value={group} className="text-white hover:bg-slate-700">
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Website */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <Label htmlFor="website" className="text-[13px] font-medium text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Website
          </Label>
          <Input
            id="website"
            value={formData.website}
            disabled
            className="text-[14px] h-11 bg-slate-900/50 border-slate-700 text-slate-400 cursor-not-allowed"
          />
          <p className="text-[12px] text-slate-400 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            Auto-filled from company settings
          </p>
        </motion.div>

        {/* Joining Date */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-2"
        >
          <Label htmlFor="joiningDate" className="text-[13px] font-medium text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Joining Date
          </Label>
          <CustomDatePicker
            id="joiningDate"
            value={formData.joiningDate}
            onChange={(date) => handleInputChange('joiningDate', date)}
            onBlur={() => handleBlur('joiningDate')}
            className="text-[14px] h-11 bg-slate-800/50 border-slate-700 text-white 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
          />
          {errors.joiningDate && (
            <p className="text-[12px] text-red-500 mt-1">
              {errors.joiningDate}
            </p>
          )}
        </motion.div>

        {/* Valid Till */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-2"
        >
          <Label htmlFor="validTill" className="text-[13px] font-medium text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Valid Till
          </Label>
          <CustomDatePicker
            id="validTill"
            value={formData.validTill}
            onChange={(date) => handleInputChange('validTill', date)}
            onFocus={() => setFocusedField('validTill')}
            onBlur={() => {
              setFocusedField(null);
              handleBlur('validTill');
            }}
            className={`text-[14px] h-11 bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
              errors.validTill && touchedFields.has('validTill') ? 'border-red-500' : ''
            } ${focusedField === 'validTill' ? 'ring-2 ring-blue-500/20' : ''}`}
          />
          {errors.validTill && touchedFields.has('validTill') && (
            <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.validTill}
            </p>
          )}
          {!errors.validTill && (
            <p className="text-[12px] text-slate-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
              Default: 31 Dec 2030 (editable)
            </p>
          )}
        </motion.div>

        {/* Photo Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-2"
        >
          <Label htmlFor="photo" className="text-[13px] font-medium text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Photo Upload
          </Label>
          <div className="relative">
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <motion.label
              htmlFor="photo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all relative overflow-hidden ${
                photoUploaded
                  ? 'border-green-500 bg-gradient-to-br from-green-900/30 to-emerald-900/30'
                  : 'border-blue-500/50 bg-slate-800/30 hover:border-blue-400 hover:bg-slate-800/50'
              }`}
            >
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-10 h-10 text-purple-400 mb-3" />
                    </motion.div>
                    <p className="text-[14px] text-purple-400 font-medium">AI Processing...</p>
                    <p className="text-[12px] text-slate-400 mt-1">Removing background & cropping</p>
                  </motion.div>
                ) : photoUploaded ? (
                  <motion.div
                    key="uploaded"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="flex flex-col items-center"
                  >
                    <Check className="w-10 h-10 text-green-400 mb-3" />
                    <p className="text-[14px] text-green-400 font-medium">Background removed!</p>
                    <p className="text-[12px] text-slate-400 mt-1">Photo is ready for ID card</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="w-10 h-10 text-blue-400 mb-3" />
                    </motion.div>
                    <p className="text-[14px] text-white">Upload Employee Photo</p>
                    <p className="text-[12px] text-slate-400 mt-1">Auto background removal enabled</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Animated border glow */}
              {!photoUploaded && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                      '0 0 20px 2px rgba(59, 130, 246, 0.3)',
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.label>
          </div>

          {/* Re-upload Button */}
          {photoUploaded && !isProcessing && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('photo')?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-[13px] hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30"
            >
              <RefreshCw className="w-4 h-4" />
              Re-upload Photo (with BG Removal)
            </motion.button>
          )}

          {/* Edit Photo Button */}
          {photoUploaded && !isProcessing && originalPhotoUrl && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCropModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-[13px] hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30"
            >
              <Edit3 className="w-4 h-4" />
              Edit Photo (Zoom & Crop)
            </motion.button>
          )}

          {errors.photo && (
            <p className="text-[12px] text-red-500 mt-1">
              {errors.photo}
            </p>
          )}
        </motion.div>
      </div>

      {/* Image Crop Modal */}
      {isCropModalOpen && originalPhotoUrl && selectedTemplate && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageUrl={originalPhotoUrl}
          onApply={handleApplyCroppedImage}
          onClose={() => setIsCropModalOpen(false)}
          employeeData={{
            name: formData.name,
            employeeId: formData.employeeId,
          }}
          template={selectedTemplate}
        />
      )}
    </>
  );
}