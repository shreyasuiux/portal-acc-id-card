import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileSpreadsheet, 
  Archive, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  Download,
  Image as ImageIcon,
  Info,
  HelpCircle
} from 'lucide-react';
import { parseBulkFile, ParsedResult } from '../utils/bulkUploadParser';
import { extractAndMatchImages, ZipExtractionResult, ZipValidationError } from '../utils/zipImageExtractor';
import { toast } from 'sonner';
import { voiceAssistant, VoiceMessages } from '../utils/voiceAssistant';
import { generateSamplePhotoBase64 } from '../utils/samplePhotoGenerator';
import { EmployeeRecord } from '../utils/employeeStorage';
import { BulkEmployeeManager } from './BulkEmployeeManager';
import { generateAndDownloadSampleZip } from '../utils/sampleZipGenerator';
import { AIImageProcessLoader } from './AIImageProcessLoader';

/**
 * Helper function to format detailed CSV/Excel parsing errors
 */
function getDetailedErrors(invalidRows: Array<{ row: number; errors: string[] }>): string[] {
  return invalidRows.flatMap(({ row, errors }) => 
    errors.map(error => `Row ${row}: ${error}`)
  );
}

/**
 * Helper function to format ZIP validation errors
 */
function formatZipErrors(errors: ZipValidationError[]): string[] {
  return errors.map(error => {
    if (error.employeeId) {
      return `${error.employeeId}: ${error.message}`;
    }
    if (error.fileName) {
      return `${error.fileName}: ${error.message}`;
    }
    return error.message;
  });
}

/**
 * BulkUpload Component
 * Handles CSV/Excel + ZIP upload with comprehensive validation and editing capabilities
 */

interface BulkUploadProps {
  onEmployeesLoaded: (employees: EmployeeRecord[], result: ParsedResult) => void;
}

export function BulkUpload({ onEmployeesLoaded }: BulkUploadProps) {
  // CSV/Excel upload state
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedResult | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // ZIP upload state
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipResult, setZipResult] = useState<ZipExtractionResult | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  // ZIP processing progress state
  const [zipProcessedCount, setZipProcessedCount] = useState(0);
  const [zipTotalCount, setZipTotalCount] = useState(0);
  const [zipCurrentEmployee, setZipCurrentEmployee] = useState('');

  // Combined validation state
  const [isFullyValid, setIsFullyValid] = useState(false);

  // Drag and drop state
  const [isDraggingData, setIsDraggingData] = useState(false);
  const [isDraggingZip, setIsDraggingZip] = useState(false);

  // Photo naming guide tooltip state
  const [isNamingGuideExpanded, setIsNamingGuideExpanded] = useState(false);

  const handleDownloadSample = () => {
    // Create sample data with proper format
    const sampleData = [
      ['Employee Name', 'Employee ID', 'Mobile Number', 'Blood Group', 'Joining Date', 'Valid Till'],
      ['John Smith', '24EMP001', '9876543210', 'A+', '01/01/2024', '31/12/2030'],
      ['Sarah Johnson', '24EMP002', '9876543211', 'B+', '15/01/2024', '31/12/2030'],
      ['Michael Brown', '24EMP003', '9876543212', 'O+', '02/02/2024', '31/12/2030'],
      ['Emily Davis', '24EMP004', '9876543213', 'AB+', '12/02/2024', '31/12/2030'],
      ['David Wilson', '15EMP005', '9876543214', 'A-', '22/02/2024', '31/12/2030'],
      ['Lisa Anderson', '15EMP006', '9876543215', 'B-', '05/03/2024', '31/12/2030'],
      ['James Martinez', '22EMP007', '9876543216', 'O-', '18/03/2024', '31/12/2030'],
      ['Jennifer Taylor', '22EMP008', '9876543217', 'AB-', '25/03/2024', '31/12/2030'],
      ['Robert Lee', '23EMP009', '9876543218', 'A+', '03/04/2024', '31/12/2030'],
      ['Mary White', '23EMP010', '9876543219', 'B+', '14/04/2024', '31/12/2030'],
    ];

    // Convert to CSV
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_bulk_upload_sample.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    toast.success('Sample CSV downloaded!', {
      description: 'Next: Create a ZIP file with photos named exactly as Employee IDs (e.g., 24EMP001.jpg)',
      duration: 6000,
    });
    
    // Voice feedback
    voiceAssistant.speak(VoiceMessages.sampleDownloaded);
    
    console.log('📥 Sample CSV downloaded');
  };

  const handleDownloadImageGuide = () => {
    // Show detailed instructions for image naming
    toast.info('📸 Photo Naming Rules', {
      description: 'Image file name must EXACTLY match Employee ID. Example: 24EMP001.jpg, 24EMP002.png, 15EMP005.jpeg',
      duration: 8000,
    });
    
    voiceAssistant.speak('Image file name must exactly match Employee ID. Case sensitive. No spaces or suffixes allowed.');
    
    console.log('📸 Image naming guide shown');
  };

  const handleDownloadSampleZip = async () => {
    try {
      toast.info('Generating sample photos...', {
        description: 'Creating dummy employee photos with correct filenames',
      });
      
      await generateAndDownloadSampleZip();
      
      toast.success('Sample photo ZIP downloaded!', {
        description: 'Use these dummy photos to test bulk upload. Each image filename matches an Employee ID.',
        duration: 6000,
      });
      
      voiceAssistant.speak('Sample photo ZIP downloaded successfully. Each image filename matches the Employee ID from the sample CSV.');
      
      console.log('📦 Sample ZIP downloaded');
    } catch (error) {
      console.error('❌ Failed to generate sample ZIP:', error);
      toast.error('Failed to generate sample ZIP', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      
      voiceAssistant.speak('Failed to generate sample ZIP. Please try again.');
    }
  };

  const handleDataFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.log('📁 Data file selected:', selectedFile.name);
    setDataFile(selectedFile);
    setIsProcessingData(true);
    setDataError(null);
    setParseResult(null);
    setIsFullyValid(false);

    try {
      // Parse the file
      const result = await parseBulkFile(selectedFile);
      
      console.log('✅ Data file parsed successfully');
      console.log(`   Valid: ${result.validEmployees.length}`);
      console.log(`   Invalid: ${result.invalidRows.length}`);
      
      setParseResult(result);
      
      // If we have a ZIP file, revalidate it with the new employee data
      if (zipFile && result.validEmployees.length > 0) {
        await revalidateZipFile(zipFile, result.validEmployees);
      }
      
    } catch (err) {
      console.error('❌ Failed to parse data file:', err);
      setDataError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setIsProcessingData(false);
    }
  };

  const handleZipFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if data file is uploaded first
    if (!parseResult || parseResult.validEmployees.length === 0) {
      toast.error('Please upload employee data file first', {
        description: 'Upload CSV or Excel file with employee information before uploading images',
      });
      e.target.value = ''; // Reset input
      return;
    }

    await processZipFile(selectedFile, parseResult.validEmployees);
  };

  const revalidateZipFile = async (file: File, employees: EmployeeRecord[]) => {
    console.log('🔄 Re-validating ZIP file with new employee data...');
    await processZipFile(file, employees);
  };

  const processZipFile = async (file: File, employees: EmployeeRecord[]) => {
    console.log('📦 ZIP file selected:', file.name);
    setZipFile(file);
    setIsProcessingZip(true);
    setZipError(null);
    setZipResult(null);
    setIsFullyValid(false);
    
    // Reset progress
    setZipProcessedCount(0);
    setZipTotalCount(employees.length);
    setZipCurrentEmployee('');

    try {
      // Extract and match images with progress tracking
      const result = await extractAndMatchImages(file, employees, {
        onProgress: (processed, total, currentEmployee) => {
          setZipProcessedCount(processed);
          setZipTotalCount(total);
          setZipCurrentEmployee(currentEmployee);
        },
      });
      
      console.log('✅ ZIP file processed successfully');
      console.log(`   Matched: ${result.matches.length}/${result.totalEmployees}`);
      console.log(`   Errors: ${result.errors.filter(e => e.severity === 'error').length}`);
      
      setZipResult(result);

      // STRICT: Only proceed if ALL images are valid (no errors)
      if (result.isValid && parseResult) {
        console.log('✅ All images matched successfully. Applying photos to employees...');
        
        const updatedEmployees = parseResult.validEmployees.map((emp) => {
          const match = result.matches.find(m => m.employeeId === emp.employeeId);
          if (match) {
            // Use uploaded photo
            return { ...emp, photoBase64: match.imageBase64 };
          } else {
            // This should never happen if isValid=true, but keep for safety
            console.warn(`⚠️ No match for ${emp.employeeId} but isValid=true`);
            return emp;
          }
        });

        console.log('✅ All employees now have their uploaded photos');
        
        // Notify parent with updated employees
        onEmployeesLoaded(updatedEmployees, parseResult);
        setIsFullyValid(true);

        // Success voice feedback
        voiceAssistant.speak(
          `Success! All ${result.matches.length} employee photos matched and ready for export.`,
          'high'
        );
        
        // Success toast
        toast.success('All photos matched successfully!', {
          description: `${result.matches.length} employee photos linked and ready for export`,
        });
      } else {
        // Has errors - BLOCK EXPORT
        const errorCount = result.errors.filter(e => e.severity === 'error').length;
        const warningCount = result.errors.filter(e => e.severity === 'warning').length;
        
        setIsFullyValid(false);
        
        if (errorCount > 0) {
          voiceAssistant.speak(
            `Photo matching failed. ${errorCount} errors found. Please fix all errors before export.`,
            'high'
          );
          
          // Error toast with details
          const missingIds = result.missingEmployeeIds.slice(0, 3).join(', ');
          const moreCount = result.missingEmployeeIds.length > 3 ? ` and ${result.missingEmployeeIds.length - 3} more` : '';
          
          toast.error('Photo matching failed', {
            description: errorCount > 0 
              ? `Missing photos for: ${missingIds}${moreCount}. Employee photo file name must match Employee ID (e.g., ${result.missingEmployeeIds[0]}.jpg)`
              : `${errorCount} errors found. Please review and fix.`,
            duration: 8000,
          });
        } else if (warningCount > 0) {
          toast.warning('Photos matched with warnings', {
            description: `${result.matches.length} photos matched, ${warningCount} warnings found`,
          });
        }
      }
      
    } catch (err) {
      console.error('❌ Failed to process ZIP file:', err);
      setZipError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
      
      voiceAssistant.speak(
        'ZIP file processing failed. Please check the file and try again.',
        'high'
      );
    } finally {
      setIsProcessingZip(false);
    }
  };

  // Drag and drop handlers for data file
  const handleDataDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingData(true);
  };

  const handleDataDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDataDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingData(false);
  };

  const handleDataDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingData(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const validExtensions = ['.csv', '.xlsx', '.xls', '.ods'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));

      if (!isValid) {
        toast.error('Invalid file type', {
          description: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls, .ods)',
        });
        return;
      }

      console.log('📁 Data file dropped:', file.name);
      setDataFile(file);
      setIsProcessingData(true);
      setDataError(null);
      setParseResult(null);
      setIsFullyValid(false);

      try {
        const result = await parseBulkFile(file);
        
        console.log('✅ Data file parsed successfully');
        console.log(`   Valid: ${result.validEmployees.length}`);
        console.log(`   Invalid: ${result.invalidRows.length}`);
        
        setParseResult(result);
        
        if (zipFile && result.validEmployees.length > 0) {
          await revalidateZipFile(zipFile, result.validEmployees);
        }
        
      } catch (err) {
        console.error('❌ Failed to parse data file:', err);
        setDataError(err instanceof Error ? err.message : 'Failed to read file');
      } finally {
        setIsProcessingData(false);
      }
    }
  };

  // Drag and drop handlers for ZIP file
  const handleZipDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!parseResult || parseResult.validEmployees.length === 0) {
      return;
    }
    
    setIsDraggingZip(true);
  };

  const handleZipDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleZipDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZip(false);
  };

  const handleZipDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZip(false);

    if (!parseResult || parseResult.validEmployees.length === 0) {
      toast.error('Please upload employee data file first', {
        description: 'Upload CSV or Excel file with employee information before uploading images',
      });
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast.error('Invalid file type', {
          description: 'Please upload a ZIP file',
        });
        return;
      }

      await processZipFile(file, parseResult.validEmployees);
    }
  };

  return (
    <>
      {/* AI Image Processing Loader */}
      <AIImageProcessLoader
        isVisible={isProcessingZip}
        totalImages={zipTotalCount}
        processedImages={zipProcessedCount}
        currentEmployee={zipCurrentEmployee}
        stage="removing-bg"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {/* Step 1: Upload Employee Data File */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Upload Employee Data File</h3>
          </div>
          
          <div className="relative">
            <input
              id="bulk-upload-data"
              type="file"
              accept=".csv,.xlsx,.xls,.ods"
              onChange={handleDataFileChange}
              className="hidden"
            />
            <motion.label
              htmlFor="bulk-upload-data"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all relative overflow-hidden ${
                isDraggingData
                  ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
                  : 'border-blue-500/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-blue-400'
              }`}
              onDragEnter={handleDataDragEnter}
              onDragOver={handleDataDragOver}
              onDragLeave={handleDataDragLeave}
              onDrop={handleDataDrop}
            >
              {isProcessingData ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FileSpreadsheet className="w-10 h-10 text-blue-400 mb-3" />
                  </motion.div>
                  <p className="text-sm text-white font-medium">Processing file...</p>
                  <p className="text-xs text-slate-400 mt-1">Please wait</p>
                </motion.div>
              ) : dataFile && parseResult ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  <FileSpreadsheet className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-sm text-white font-medium">{dataFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{parseResult.fileFormat}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">
                        {parseResult.validEmployees.length} valid
                      </span>
                    </div>
                    {parseResult.invalidRows.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">
                          {parseResult.invalidRows.length} skipped
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div className="flex flex-col items-center">
                  <motion.div
                    animate={{ 
                      y: isDraggingData ? 0 : [0, -10, 0],
                      scale: isDraggingData ? 1.2 : 1,
                    }}
                    transition={{ duration: 2, repeat: isDraggingData ? 0 : Infinity }}
                  >
                    <Upload className={`w-10 h-10 mb-3 ${isDraggingData ? 'text-blue-300' : 'text-blue-400'}`} />
                  </motion.div>
                  <p className={`text-sm font-medium ${isDraggingData ? 'text-blue-300' : 'text-white'}`}>
                    {isDraggingData ? 'Drop file here' : 'Upload CSV or Excel File'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {isDraggingData ? 'Release to upload' : 'Click or drag & drop file here'}
                  </p>
                </motion.div>
              )}
              
              {!dataFile && !isProcessingData && !isDraggingData && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                      '0 0 30px 3px rgba(59, 130, 246, 0.3)',
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              )}
              {isDraggingData && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-blue-400/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.label>
          </div>
        </div>

        {/* Data File Errors */}
        {dataError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-400">
                  Failed to process data file
                </p>
                <p className="text-xs text-red-300 mt-1">
                  {dataError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data Validation Messages */}
        {parseResult && parseResult.invalidRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-500/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-400 mb-2">
                  Some rows have missing or invalid data
                </p>
                <p className="text-xs text-orange-300 mb-3">
                  {parseResult.validEmployees.length} valid row{parseResult.validEmployees.length !== 1 ? 's' : ''} will be exported. 
                  {parseResult.invalidRows.length} row{parseResult.invalidRows.length !== 1 ? 's' : ''} will be skipped.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-3 max-h-[120px] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] text-slate-400 mb-2 font-medium">
                    Errors found:
                  </p>
                  <ul className="space-y-1">
                    {getDetailedErrors(parseResult.invalidRows).slice(0, 5).map((error, index) => (
                      <li key={index} className="text-[10px] text-red-300 font-mono">
                        {error}
                      </li>
                    ))}
                    {parseResult.invalidRows.length > 5 && (
                      <li className="text-[10px] text-slate-500 italic">
                        ... and {parseResult.invalidRows.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload Employee Photos ZIP */}
        {parseResult && parseResult.validEmployees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Upload Employee Photos (ZIP)</h3>
            </div>

            <div className="bg-slate-800/30 border border-purple-500/30 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-purple-300 leading-relaxed">
                    Employee photo file name must match Employee ID. Example: <span className="font-mono font-bold">24EMP001.jpg</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Supported formats: .jpg, .jpeg, .png | Minimum resolution: 300×400px
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input
                id="bulk-upload-zip"
                type="file"
                accept=".zip"
                onChange={handleZipFileChange}
                className="hidden"
              />
              <motion.label
                htmlFor="bulk-upload-zip"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all relative overflow-hidden ${
                  isDraggingZip
                    ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                    : 'border-purple-500/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-purple-400'
                }`}
                onDragEnter={handleZipDragEnter}
                onDragOver={handleZipDragOver}
                onDragLeave={handleZipDragLeave}
                onDrop={handleZipDrop}
              >
                {isProcessingZip ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Archive className="w-10 h-10 text-purple-400 mb-3" />
                    </motion.div>
                    <p className="text-sm text-white font-medium">Processing images...</p>
                    <p className="text-xs text-slate-400 mt-1">Removing backgrounds & matching to employees</p>
                    <p className="text-[10px] text-slate-500 mt-2">This may take a few minutes</p>
                  </motion.div>
                ) : zipFile && zipResult ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Archive className={`w-10 h-10 mb-3 ${zipResult.isValid ? 'text-green-400' : 'text-orange-400'}`} />
                    <p className="text-sm text-white font-medium">{zipFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{zipResult.totalImages} images found</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">
                          {zipResult.matches.length} matched
                        </span>
                      </div>
                      {zipResult.errors.filter(e => e.severity === 'error').length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">
                            {zipResult.errors.filter(e => e.severity === 'error').length} errors
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-col items-center">
                    <motion.div
                      animate={{ 
                        y: isDraggingZip ? 0 : [0, -10, 0],
                        scale: isDraggingZip ? 1.2 : 1,
                      }}
                      transition={{ duration: 2, repeat: isDraggingZip ? 0 : Infinity }}
                    >
                      <ImageIcon className={`w-10 h-10 mb-3 ${isDraggingZip ? 'text-purple-300' : 'text-purple-400'}`} />
                    </motion.div>
                    <p className={`text-sm font-medium ${isDraggingZip ? 'text-purple-300' : 'text-white'}`}>
                      {isDraggingZip ? 'Drop ZIP file here' : 'Upload ZIP with Employee Photos'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {isDraggingZip ? 'Release to upload' : 'Click or drag & drop ZIP file here'}
                    </p>
                  </motion.div>
                )}
                
                {!zipFile && !isProcessingZip && !isDraggingZip && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(168, 85, 247, 0)',
                        '0 0 30px 3px rgba(168, 85, 247, 0.3)',
                        '0 0 0 0 rgba(168, 85, 247, 0)',
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                )}
                {isDraggingZip && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-purple-400/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.label>
            </div>
          </motion.div>
        )}

        {/* ZIP Errors */}
        {zipError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-400">
                  Failed to process ZIP file
                </p>
                <p className="text-xs text-red-300 mt-1">
                  {zipError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ZIP Validation Messages */}
        {zipResult && zipResult.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br border rounded-xl p-4 ${
              zipResult.errors.some(e => e.severity === 'error')
                ? 'from-red-900/30 to-rose-900/30 border-red-500/50'
                : 'from-orange-900/30 to-amber-900/30 border-orange-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                zipResult.errors.some(e => e.severity === 'error') ? 'text-red-400' : 'text-orange-400'
              }`} />
              <div className="flex-1">
                <p className={`text-xs font-medium mb-2 ${
                  zipResult.errors.some(e => e.severity === 'error') ? 'text-red-400' : 'text-orange-400'
                }`}>
                  {zipResult.errors.some(e => e.severity === 'error') 
                    ? 'Image matching errors found'
                    : 'Image matching warnings'
                  }
                </p>
                <p className={`text-xs mb-3 ${
                  zipResult.errors.some(e => e.severity === 'error') ? 'text-red-300' : 'text-orange-300'
                }`}>
                  {zipResult.matches.length} of {zipResult.totalEmployees} photos matched successfully.
                  {zipResult.errors.filter(e => e.severity === 'error').length > 0 && 
                    ` Please fix all errors before export.`
                  }
                </p>
                <div className="bg-slate-900/50 rounded-lg p-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] text-slate-400 mb-2 font-medium">
                    Issues found:
                  </p>
                  <ul className="space-y-1">
                    {formatZipErrors(zipResult.errors).slice(0, 8).map((error, index) => (
                      <li 
                        key={index} 
                        className={`text-[10px] font-mono ${
                          zipResult.errors[index]?.severity === 'error' ? 'text-red-300' : 'text-orange-300'
                        }`}
                      >
                        {error}
                      </li>
                    ))}
                    {zipResult.errors.length > 8 && (
                      <li className="text-[10px] text-slate-500 italic">
                        ... and {zipResult.errors.length - 8} more issues
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {isFullyValid && zipResult && parseResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-400">
                  All data validated successfully!
                </p>
                <p className="text-xs text-green-300 mt-1">
                  {parseResult.validEmployees.length} employee{parseResult.validEmployees.length !== 1 ? 's' : ''} with photos ready for export
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Employee Manager - Review & Edit */}
        {parseResult && parseResult.validEmployees.length > 0 && (
          <BulkEmployeeManager
            employees={parseResult.validEmployees}
            onEmployeesUpdate={(updatedEmployees) => {
              // Update parseResult with new employee list
              const newResult = { ...parseResult, validEmployees: updatedEmployees };
              setParseResult(newResult);
              onEmployeesLoaded(updatedEmployees, newResult);
            }}
            onRefreshData={() => {
              // Trigger file input click to re-upload CSV
              document.getElementById('bulk-upload-data')?.click();
            }}
            onRefreshImages={() => {
              // Trigger file input click to re-upload ZIP
              if (parseResult.validEmployees.length > 0) {
                document.getElementById('bulk-upload-zip')?.click();
              } else {
                toast.error('Please upload employee data first');
              }
            }}
            zipResult={zipResult}
          />
        )}

        {/* Download Sample CSV Button - Only show before CSV is uploaded */}
        {!parseResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <motion.button
              onClick={handleDownloadSample}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download Sample CSV Template
            </motion.button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Get a pre-filled CSV file with sample employees
            </p>
          </motion.div>
        )}

        {/* Photo Naming Guide - Only show before ZIP is uploaded */}
        {!zipResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5 }}
            className="pt-2 relative"
          >
            {/* Info Button */}
            <motion.button
              onClick={() => setIsNamingGuideExpanded(!isNamingGuideExpanded)}
              onMouseEnter={() => !isNamingGuideExpanded && window.innerWidth >= 768 && setIsNamingGuideExpanded(true)}
              onMouseLeave={() => window.innerWidth >= 768 && setIsNamingGuideExpanded(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 font-medium text-xs transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Photo Naming Guide
              <motion.div
                animate={{ rotate: isNamingGuideExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Info className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>

            {/* Expandable Tooltip Content */}
            <AnimatePresence>
              {isNamingGuideExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 right-0 mt-2 p-4 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl z-50"
                  style={{
                    boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">Photo Naming Rules</h4>
                    </div>

                    {/* Rules */}
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Match Employee ID exactly</p>
                          <p className="text-slate-400 text-[10px]">File name must be identical to Employee ID</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Supported formats</p>
                          <p className="text-slate-400 text-[10px]">.jpg, .jpeg, .png</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Case sensitive</p>
                          <p className="text-slate-400 text-[10px]">24EMP001.jpg ✓ &nbsp;&nbsp; 24emp001.jpg ✗</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">No spaces or suffixes</p>
                          <p className="text-slate-400 text-[10px]">24EMP001_photo.jpg ✗ &nbsp;&nbsp; 24EMP001 copy.jpg ✗</p>
                        </div>
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="pt-2 border-t border-purple-500/20">
                      <p className="text-[10px] font-semibold text-purple-300 mb-1.5">✓ Correct Examples:</p>
                      <div className="space-y-1">
                        <code className="block text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded border border-green-500/20">24EMP001.jpg</code>
                        <code className="block text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded border border-green-500/20">15EMP005.png</code>
                        <code className="block text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded border border-green-500/20">22EMP007.jpeg</code>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Close Button */}
                  <button
                    onClick={() => setIsNamingGuideExpanded(false)}
                    className="md:hidden absolute top-2 right-2 p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-purple-300" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Download Sample ZIP Button - Only show before ZIP is uploaded */}
        {!zipResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <motion.button
              onClick={handleDownloadSampleZip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Archive className="w-5 h-5" />
              Download Sample ZIP
            </motion.button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Get a ZIP file with sample employee photos
            </p>
          </motion.div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.7);
          }
        `}</style>
      </motion.div>
    </>
  );
}