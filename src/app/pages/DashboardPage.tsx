import { useState, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
import { ModeSelector } from '../components/ModeSelector';
import { SingleEmployeeForm } from '../components/SingleEmployeeForm';
import { BulkUpload } from '../components/BulkUpload';
import { IDCardPreview } from '../components/IDCardPreview';
import { EmployeeDatabase } from '../components/EmployeeDatabase';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { ExportConfirmModal } from '../components/ExportConfirmModal';
import { IDCardExportRenderer } from '../components/IDCardExportRenderer';
import { Templates } from '../components/Templates';
import { AIAssistantWidget } from '../components/AIAssistantWidget';
import { BottomNavigation } from '../components/BottomNavigation';
import { MobileAppBar } from '../components/MobileAppBar';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { BulkCardPreviews } from '../components/BulkCardPreviews';
import { AIExportLoader } from '../components/AIExportLoader';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Sparkles, Download } from 'lucide-react';
import { saveEmployee, type EmployeeRecord, getAllEmployees, saveBulkEmployees } from '../utils/employeeStorage';
import { exportBulkCardsToPDF } from '../utils/bulkPdfExport';
import { templates, type Template } from '../utils/templateData';
import { getSelectedTemplate, setSelectedTemplate as saveSelectedTemplate, resetToOriginalTemplate } from '../utils/templateStorage';
import { voiceAssistant, VoiceMessages } from '../utils/voiceAssistant';
import type { ParsedResult } from '../utils/bulkUploadParser';
import { dispatchAuthChange } from '../routes';
import { useNavigate } from 'react-router';

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

export function DashboardPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'single' | 'bulk' | 'viewAll' | 'templates'>('single');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedEmployee, setSavedEmployee] = useState<EmployeeRecord | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [exportRendererKey, setExportRendererKey] = useState(0); // Force remount after export
  const [includeBackSide, setIncludeBackSide] = useState(true); // Toggle for back side export
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  
  // Bulk export refs - for rendering multiple cards
  const bulkRenderRefsMap = useRef<Map<string, { front: HTMLDivElement | null; back: HTMLDivElement | null }>>(new Map());
  
  // Mobile navigation state - Start with 'single' tab
  const [mobileTab, setMobileTab] = useState<'single' | 'bulk' | 'templates' | 'more'>('single');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  
  // Bulk upload state
  const [bulkEmployees, setBulkEmployees] = useState<EmployeeRecord[]>([]);
  const [bulkParseResult, setBulkParseResult] = useState<ParsedResult | null>(null);
  
  // AI Export Loader state
  const [exportLoaderVisible, setExportLoaderVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportCurrentItem, setExportCurrentItem] = useState('');
  const [exportCurrentIndex, setExportCurrentIndex] = useState(0);
  const [exportTotalItems, setExportTotalItems] = useState(0);
  const [exportMessage, setExportMessage] = useState('Processing...');
  const [exportMode, setExportMode] = useState<'single' | 'bulk'>('single');
  
  // Export confirmation modal state
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    employeeId: '',
    mobile: '',
    bloodGroup: '',
    website: 'www.acc.ltd',
    joiningDate: '',
    validTill: '2030-12-31',
    photo: null,
  });

  useEffect(() => {
    const storedTemplate = getSelectedTemplate();
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Auto-switch to appropriate view based on search
      if (mode === 'single' || mode === 'bulk') {
        setMode('viewAll');
      }
    }
  };

  const handleBulkEmployeesLoaded = (employees: EmployeeRecord[], result: ParsedResult) => {
    console.log('📦 Bulk employees loaded:', employees.length);
    setBulkEmployees(employees);
    setBulkParseResult(result);
    
    // Show toast with summary
    if (result.invalidRows.length > 0) {
      toast.warning('File processed with warnings', {
        description: `${employees.length} valid employees loaded. ${result.invalidRows.length} rows skipped due to errors.`,
        duration: 5000,
      });
      // Voice feedback for partial success
      voiceAssistant.speak(VoiceMessages.bulkUploadPartialSuccess(employees.length, result.invalidRows.length));
    } else {
      toast.success('File processed successfully', {
        description: `${employees.length} employees ready for export`,
      });
      // Voice feedback for full success
      voiceAssistant.speak(VoiceMessages.bulkUploadSuccess(employees.length));
    }
  };

  const isFormValid = () => {
    if (mode === 'single') {
      return (
        formData.name.trim() !== '' &&
        formData.employeeId.trim() !== '' &&
        formData.mobile.trim() !== '' &&
        formData.bloodGroup !== '' &&
        formData.photo !== null
      );
    }
    
    if (mode === 'bulk') {
      return bulkEmployees.length > 0;
    }
    
    return false;
  };

  const handleGenerateExport = async () => {
    setIsGenerating(true);
    setExportLoaderVisible(true);
    
    try {
      console.log('🚀 Export Started');
      console.log('🔍 Selected template:', selectedTemplate.name);
      console.log('📊 Mode:', mode);
      
      // BULK MODE
      if (mode === 'bulk') {
        console.log('📦 Bulk Export Mode');
        console.log('📊 Bulk employees:', bulkEmployees.length);
        
        // Set export mode for loader
        setExportMode('bulk');
        setExportTotalItems(bulkEmployees.length);
        setExportProgress(0);
        setExportMessage('Initializing bulk export...');
        
        if (bulkEmployees.length === 0) {
          toast.error('No employees to export', {
            description: 'Please upload a CSV/Excel file with employee data first',
          });
          setExportLoaderVisible(false);
          return;
        }
        
        // Show progress toast
        toast.info('Starting bulk export...', {
          description: `Preparing to export ${bulkEmployees.length} ID cards`,
        });
        
        // Wait for bulk render elements to mount
        console.log('⏳ Waiting for bulk render elements...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Export with progress callback
        await exportBulkCardsToPDF(
          bulkEmployees,
          (employee) => {
            // Get front element for this employee
            const refs = bulkRenderRefsMap.current.get(employee.id);
            return refs?.front || null;
          },
          (employee) => {
            // Get back element (using first employee as template)
            const refs = bulkRenderRefsMap.current.get(bulkEmployees[0].id);
            return refs?.back || null;
          },
          {
            template: selectedTemplate,
            includeFront: true,
            includeBack: includeBackSide,
            quality: 6, // High quality for bulk export
            onProgress: (progress) => {
              console.log(`📊 Progress: ${progress.current}/${progress.total} - ${progress.message}`);
              if (progress.status === 'processing') {
                toast.info(`Processing ${progress.currentEmployee}`, {
                  description: `${progress.current} of ${progress.total} cards completed`,
                });
              }
              
              // Update AI Export Loader
              setExportMode('bulk');
              setExportProgress((progress.current / progress.total) * 100);
              setExportCurrentItem(progress.currentEmployee);
              setExportCurrentIndex(progress.current);
              setExportTotalItems(progress.total);
              setExportMessage(progress.message);
            },
          }
        );
        
        console.log('✅ PDF export complete. Now saving to Employee Database...');
        
        // Save all employees to Employee Database
        try {
          const saveResult = saveBulkEmployees(bulkEmployees, { onDuplicate: 'skip' });
          
          console.log('💾 Bulk save to database complete');
          
          // Refresh employee count
          const updatedEmployees = getAllEmployees();
          setEmployeeCount(updatedEmployees.length);
          
          // Success toast with database save info
          let description = `Successfully exported ${bulkEmployees.length} ID cards`;
          
          if (saveResult.newlySaved > 0) {
            description += ` and saved ${saveResult.newlySaved} new employee${saveResult.newlySaved > 1 ? 's' : ''} to database`;
          }
          
          if (saveResult.skipped > 0) {
            description += `. ${saveResult.skipped} already existed (skipped)`;
          }
          
          toast.success('Bulk export complete!', {
            description,
            duration: 8000,
            action: saveResult.newlySaved > 0 ? {
              label: 'View Database',
              onClick: () => {
                setMode('viewAll');
                setMobileTab('single');
              },
            } : undefined,
          });
          
          // Voice feedback with database info
          if (saveResult.newlySaved > 0) {
            voiceAssistant.speak(
              `Bulk export complete. ${bulkEmployees.length} ID cards exported and ${saveResult.newlySaved} employees saved to database.`
            );
          } else {
            voiceAssistant.speak(
              `Bulk export complete. ${bulkEmployees.length} ID cards exported. All employees already in database.`
            );
          }
          
        } catch (saveError) {
          console.error('❌ Failed to save to database:', saveError);
          
          // Show warning but don't fail the export
          toast.warning('Export successful, database save failed', {
            description: 'PDF exported successfully but employees could not be saved to database',
            duration: 6000,
          });
          
          // Still show success for export
          toast.success('Bulk export complete!', {
            description: `Successfully exported ${bulkEmployees.length} ID cards`,
          });
          
          voiceAssistant.speak(`Bulk export complete. ${bulkEmployees.length} ID cards exported successfully.`);
        }
        
        // Reset bulk data
        setBulkEmployees([]);
        setBulkParseResult(null);
        setRefreshKey(prevKey => prevKey + 1);
        
        console.log('✅ Bulk export complete');
        return;
      }
      
      // SINGLE MODE - USE BULK EXPORT ENGINE (SINGLE = "BULK OF 1")
      console.log('📊 Form data:', {
        name: formData.name,
        employeeId: formData.employeeId,
        hasPhoto: !!formData.photo,
      });
      
      // Set export mode for loader
      setExportMode('single');
      setExportMessage('Generating your ID card...');
      setExportTotalItems(1);
      setExportProgress(0);
      
      // Step 1: Save employee
      console.log('💾 Saving employee...');
      const savedEmp = await saveEmployee(formData);
      setSavedEmployee(savedEmp);
      
      // Step 2: Wait for render elements to mount
      console.log('⏳ Waiting for render elements...');
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Step 3: Validate render elements exist
      if (!frontCardRef.current || !backCardRef.current) {
        throw new Error('Render elements not ready. Please wait and try again.');
      }
      
      console.log('✓ Render elements ready');
      console.log('🎯 CRITICAL: Using BULK export engine for single employee (enforcing layout consistency)');
      
      // Step 4: Export to PDF using BULK export engine (treating single as "bulk of 1")
      toast.info('Generating PDF...', {
        description: 'Creating high-resolution ID card',
      });
      
      // CRITICAL: Use BULK export engine with array of 1 employee
      // This ensures 100% identical layout, positioning, and rendering
      console.log('🎯 Export Settings:', {
        includeBackSide,
        mode: 'single',
        template: selectedTemplate.name
      });
      
      await exportBulkCardsToPDF(
        [savedEmp], // Array with single employee
        (employee) => frontCardRef.current, // Get front element
        (employee) => backCardRef.current,  // Get back element
        {
          template: selectedTemplate,
          includeFront: true,
          includeBack: includeBackSide,
          quality: 6, // Use same quality as bulk
          onProgress: (progress) => {
            console.log(`📊 Single export progress: ${progress.message}`);
            setExportProgress((progress.current / progress.total) * 100);
            setExportCurrentItem(progress.currentEmployee);
            setExportMessage(progress.message);
          },
        }
      );
      
      // CRITICAL: Force remount of export renderers to clean up any DOM modifications
      setExportRendererKey(prev => prev + 1);
      
      // Step 5: Success
      toast.success('PDF downloaded successfully!', {
        description: `File: employee-id-card_${savedEmp.employeeId}.pdf`,
      });
      
      // Voice feedback for single export success
      voiceAssistant.speak(VoiceMessages.exportSingleSuccess);
      
      // Step 6: Reset form
      setFormData({
        name: '',
        employeeId: '',
        mobile: '',
        bloodGroup: '',
        website: 'www.acc.ltd',
        joiningDate: '',
        validTill: '2030-12-31',
        photo: null,
      });
      setSavedEmployee(null);
      setRefreshKey(prevKey => prevKey + 1);
      
      console.log('✅ Export complete (via unified bulk engine)');
    } catch (error) {
      console.error('❌ Export error:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate PDF';
      
      toast.error('Export Failed', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Voice feedback for export error
      voiceAssistant.speak(VoiceMessages.exportError);
    } finally {
      setIsGenerating(false);
      setExportLoaderVisible(false);
    }
  };

  const handleEditEmployee = (employee: EmployeeRecord) => {
    setEditingEmployee(employee);
  };

  const handleCloseEditModal = () => {
    setEditingEmployee(null);
  };

  const handleSaveEmployee = () => {
    toast.success('Employee updated successfully!');
    setEditingEmployee(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleNavigateToDatabase = () => {
    setMode('viewAll');
  };

  const handleResetForm = () => {
    // Reset form data to initial state
    setFormData({
      name: '',
      employeeId: '',
      mobile: '',
      bloodGroup: '',
      website: 'www.acc.ltd',
      joiningDate: '',
      validTill: '2030-12-31',
      photo: null,
    });
    
    // Reset saved employee
    setSavedEmployee(null);
    
    // Reset bulk upload data
    setBulkEmployees([]);
    setBulkParseResult(null);
    
    // Reset template to default (first template)
    setSelectedTemplate(templates[0]);
    saveSelectedTemplate(templates[0]);
    
    // Increment refresh key to trigger re-renders
    setRefreshKey(prevKey => prevKey + 1);
    
    toast.success('Form reset successfully', {
      description: 'All fields and template have been cleared',
    });
    
    console.log('🔄 Form reset to initial state');
  };

  // Handle template selection from Templates component
  const handleTemplateSelect = (template: Template) => {
    console.log('🎨 Template selected:', template.name);
    console.log('🔄 Updating active template state...');
    
    // CRITICAL: Update template state FIRST
    setSelectedTemplate(template);
    saveSelectedTemplate(template);
    
    // CRITICAL: Force re-render of ALL components that depend on template
    // This ensures preview, export renderer, and PDF generation all use new template
    setRefreshKey(prevKey => prevKey + 1);
    
    // Log validation
    console.log('✓ Template state updated');
    console.log('✓ Preview will re-render with new template');
    console.log('✓ Export will use new template');
    
    // Validate synchronization
    setTimeout(() => {
      const currentTemplate = getSelectedTemplate();
      if (currentTemplate.id !== template.id) {
        console.error('❌ TEMPLATE SYNC ERROR: State mismatch detected!');
        toast.error('Template sync error - please try again');
      } else {
        console.log('✅ Template synchronization verified');
      }
    }, 100);
  };

  // Handle navigation to single employee mode from template gallery
  const handleNavigateToSingleMode = () => {
    setMode('single');
    console.log('📍 Navigated to Single Employee mode');
  };

  // Mobile tab change handler - syncs with desktop mode
  const handleMobileTabChange = (tab: 'single' | 'bulk' | 'templates' | 'more') => {
    setMobileTab(tab);
    setIsMenuOpen(false);
    
    // Sync with desktop mode
    if (tab === 'single' || tab === 'bulk' || tab === 'templates') {
      setMode(tab);
    } else if (tab === 'more') {
      // Open hamburger menu
      setIsMenuOpen(true);
    }
  };

  // Get mobile page title based on current tab
  const getMobileTitle = () => {
    if (mobileTab === 'single') return 'Single Employee';
    if (mobileTab === 'bulk') return 'Bulk Upload';
    if (mobileTab === 'templates') return 'Templates';
    if (mobileTab === 'more') return 'More Options';
    return 'ID Card Generator';
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatchAuthChange(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Load employee count
  useEffect(() => {
    const employees = getAllEmployees();
    setEmployeeCount(employees.length);
  }, [refreshKey]);

  // Sync mobile tab with mode changes from desktop
  useEffect(() => {
    if (mode === 'viewAll') {
      setMobileTab('single');
    } else if (mode === 'single') {
      setMobileTab('single');
    } else if (mode === 'bulk') {
      setMobileTab('bulk');
    } else if (mode === 'templates') {
      setMobileTab('templates');
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-x-hidden">
      {/* Animated background elements - fixed to viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <Header 
        onNavigateToDatabase={handleNavigateToDatabase} 
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8 relative z-10">
        {/* Desktop Mode Selector - Hidden on Mobile */}
        <div className="hidden lg:block">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>
        
        {mode === 'viewAll' ? (
          <EmployeeDatabase 
            refreshKey={refreshKey} 
            onEditEmployee={handleEditEmployee} 
            searchQuery={searchQuery} 
            onSearch={handleSearch}
            selectedTemplate={selectedTemplate}
          />
        ) : mode === 'templates' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Templates 
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onNavigateToSingleMode={handleNavigateToSingleMode}
            />
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-4 lg:mt-8"
            >
              {/* LEFT COLUMN - Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-5 lg:p-8 border border-slate-700/50 h-fit backdrop-blur-sm"
              >
                {mode === 'single' ? (
                  <SingleEmployeeForm 
                    key={refreshKey} 
                    formData={formData} 
                    onFormChange={setFormData}
                    selectedTemplate={selectedTemplate}
                  />
                ) : (
                  <BulkUpload 
                    key={refreshKey}
                    onEmployeesLoaded={handleBulkEmployeesLoaded} 
                  />
                )}
              </motion.div>

              {/* RIGHT COLUMN - Preview Section */}
              <div>
                {mode === 'bulk' ? (
                  <BulkCardPreviews
                    key={`bulk-previews-${refreshKey}-${selectedTemplate.id}`}
                    employees={bulkEmployees}
                    template={selectedTemplate}
                    onPhotoUpdate={(employeeId, photoBase64) => {
                      setBulkEmployees(prev =>
                        prev.map(emp =>
                          emp.id === employeeId
                            ? { ...emp, photoBase64 }
                            : emp
                        )
                      );
                    }}
                    onEmployeeUpdate={(employeeId, updatedEmployee) => {
                      setBulkEmployees(prev =>
                        prev.map(emp =>
                          emp.id === employeeId
                            ? updatedEmployee
                            : emp
                        )
                      );
                    }}
                  />
                ) : (
                  <IDCardPreview 
                    key={`preview-${refreshKey}-${selectedTemplate.id}`}
                    employeeData={formData} 
                    photoBase64={typeof formData.photo === 'string' ? formData.photo : undefined}
                    template={selectedTemplate}
                    onPhotoUpdate={(photoBase64) => {
                      setFormData(prev => ({ ...prev, photo: photoBase64 }));
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* PRIMARY ACTION BUTTON - STICKY AT BOTTOM */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="fixed bottom-0 left-0 right-0 z-40 px-4 lg:px-8 pb-20 lg:pb-6 pointer-events-none"
            >
              <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-3 pointer-events-auto">
                {/* Export Button - Shows Export Modal on Click */}
                <motion.button
                  onClick={() => {
                    if (isFormValid() && !isGenerating) {
                      setShowExportModal(true);
                    }
                  }}
                  disabled={!isFormValid() || isGenerating}
                  whileHover={isFormValid() && !isGenerating ? { scale: 1.02, y: -2 } : {}}
                  whileTap={isFormValid() && !isGenerating ? { scale: 0.98 } : {}}
                  className="relative group w-full max-w-2xl"
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-all ${
                    isFormValid() && !isGenerating
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-100 blur-xl group-hover:blur-2xl'
                      : 'bg-slate-700 opacity-30'
                  }`} />
                  
                  {/* Button content with glassmorphism backdrop */}
                  <div className={`relative px-8 lg:px-12 py-4 lg:py-5 rounded-2xl text-sm lg:text-[14px] font-medium transition-all flex items-center justify-center gap-3 backdrop-blur-xl border ${
                    isFormValid() && !isGenerating
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white border-blue-400/30'
                      : 'bg-slate-800/90 text-slate-500 cursor-not-allowed border-slate-700/50'
                  }`}>
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        <span className="hidden sm:inline">Generating High-Resolution PDF…</span>
                        <span className="sm:hidden">Generating PDF…</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Generate & Export High-Resolution PDF</span>
                        <span className="sm:hidden">Generate & Export PDF</span>
                        {isFormValid() && (
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-2"
                          >
                            →
                          </motion.span>
                        )}
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </main>

      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={!!editingEmployee}
        onClose={handleCloseEditModal}
        onSave={handleSaveEmployee}
      />

      {/* Export Confirmation Modal */}
      <ExportConfirmModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={(includeBack) => {
          setIncludeBackSide(includeBack);
          setShowExportModal(false);
          handleGenerateExport();
        }}
        mode={mode as 'single' | 'bulk'}
        employeeCount={mode === 'bulk' ? bulkEmployees.length : 1}
        includeBackSide={includeBackSide}
        onToggleBackSide={setIncludeBackSide}
      />

      {/* Hidden Export Renderers */}
      {savedEmployee && savedEmployee.photoBase64 && (
        <div style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '0',
          width: '153px',
          height: '244px',
          overflow: 'visible',
        }}>
          <IDCardExportRenderer 
            key={`front-${selectedTemplate.id}-${exportRendererKey}`}
            ref={frontCardRef} 
            employee={savedEmployee} 
            side="front" 
            template={selectedTemplate}
            photoUrl={savedEmployee.photoBase64}
          />
          <IDCardExportRenderer 
            key={`back-${selectedTemplate.id}-${exportRendererKey}`}
            ref={backCardRef} 
            employee={savedEmployee} 
            side="back" 
            template={selectedTemplate}
            photoUrl={savedEmployee.photoBase64}
          />
        </div>
      )}

      {/* Hidden Bulk Export Renderers */}
      {bulkEmployees.length > 0 && (
        <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
          {bulkEmployees.map((employee) => (
            <div key={employee.id}>
              <IDCardExportRenderer 
                ref={(el) => {
                  if (el) {
                    const existing = bulkRenderRefsMap.current.get(employee.id) || { front: null, back: null };
                    bulkRenderRefsMap.current.set(employee.id, { ...existing, front: el });
                  }
                }}
                employee={employee} 
                side="front" 
                template={selectedTemplate}
                photoUrl={employee.photoBase64 || ''}
              />
              <IDCardExportRenderer 
                ref={(el) => {
                  if (el) {
                    const existing = bulkRenderRefsMap.current.get(employee.id) || { front: null, back: null };
                    bulkRenderRefsMap.current.set(employee.id, { ...existing, back: el });
                  }
                }}
                employee={employee} 
                side="back" 
                template={selectedTemplate}
                photoUrl={employee.photoBase64 || ''}
              />
            </div>
          ))}
        </div>
      )}

      {/* AI Assistant Widget - Desktop Only */}
      <div className="hidden lg:block">
        <AIAssistantWidget />
      </div>

      {/* Mobile Navigation Components */}
      <MobileAppBar
        title={getMobileTitle()}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onExport={isFormValid() && !isGenerating ? handleGenerateExport : undefined}
        showExport={(mode === 'single' || mode === 'bulk') && isFormValid()}
        isMenuOpen={isMenuOpen}
      />

      <BottomNavigation
        activeTab={mobileTab}
        onTabChange={handleMobileTabChange}
      />

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName="HR Executive"
        onLogout={handleLogout}
        employeeCount={employeeCount}
        onNavigateToDatabase={handleNavigateToDatabase}
      />
      
      {/* AI Export Loader */}
      {exportLoaderVisible && (
        <AIExportLoader
          isVisible={exportLoaderVisible}
          progress={exportProgress}
          currentItem={exportCurrentItem}
          currentIndex={exportCurrentIndex}
          totalItems={exportTotalItems}
          message={exportMessage}
          mode={exportMode}
        />
      )}
    </div>
  );
}