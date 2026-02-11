import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Download, Edit2, Trash2, Users, FileDown } from 'lucide-react';
import { getAllEmployees, deleteEmployee, searchEmployees, type EmployeeRecord } from '../utils/employeeStorage';
import { IDCardPreview } from './IDCardPreview';
import { IDCardExportRenderer } from './IDCardExportRenderer';
import { exportSingleCardToPDF, exportBulkCardsToPDF } from '../utils/pdfExport';
import { toast } from 'sonner';
import { templates, type Template } from '../utils/templateData';
import { AIExportLoader } from './AIExportLoader';

interface EmployeeDatabaseProps {
  onEditEmployee: (employee: EmployeeRecord) => void;
  refreshKey?: number;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  selectedTemplate?: Template;
}

export function EmployeeDatabase({ onEditEmployee, refreshKey, searchQuery: externalSearchQuery = '', onSearch, selectedTemplate }: EmployeeDatabaseProps) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportingEmployee, setExportingEmployee] = useState<EmployeeRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeBackSide, setIncludeBackSide] = useState(true); // Toggle for back side export
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  // AI Export Loader state
  const [exportLoaderVisible, setExportLoaderVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportCurrentItem, setExportCurrentItem] = useState('');
  const [exportCurrentIndex, setExportCurrentIndex] = useState(0);
  const [exportTotalItems, setExportTotalItems] = useState(0);
  const [exportMessage, setExportMessage] = useState('Processing...');
  const [exportMode, setExportMode] = useState<'single' | 'bulk'>('single');

  // Use external search query if provided, otherwise use local
  const activeSearchQuery = externalSearchQuery || localSearchQuery;

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, [activeSearchQuery, bloodGroupFilter, yearFilter, refreshKey]);

  const loadEmployees = () => {
    const results = searchEmployees(activeSearchQuery, {
      bloodGroup: bloodGroupFilter,
      year: yearFilter,
    });
    setEmployees(results);
    
    // Select first employee if none selected
    if (!selectedEmployee && results.length > 0) {
      setSelectedEmployee(results[0]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      loadEmployees();
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
      }
    }
  };

  const handleBulkDelete = () => {
    const selectedEmployees = employees.filter(emp => selectedIds.has(emp.id));
    const employeeNames = selectedEmployees.map(e => e.name).join(', ');
    const count = selectedIds.size;
    
    const message = count === 1 
      ? `Are you sure you want to delete this employee?\n\n${employeeNames}\n\nThis action cannot be undone.`
      : `Are you sure you want to delete ${count} employees?\n\n${count <= 5 ? employeeNames : `${selectedEmployees.slice(0, 3).map(e => e.name).join(', ')} and ${count - 3} more...`}\n\nThis action cannot be undone.`;
    
    if (confirm(message)) {
      selectedIds.forEach(id => deleteEmployee(id));
      
      toast.success(`Successfully deleted ${count} employee${count > 1 ? 's' : ''}`, {
        description: count === 1 ? employeeNames : `${count} employees removed from database`,
      });
      
      loadEmployees();
      setSelectedIds(new Set());
      
      // Clear selected employee if it was deleted
      if (selectedEmployee && selectedIds.has(selectedEmployee.id)) {
        setSelectedEmployee(null);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setLocalSearchQuery(value);
    }
  };

  const handleExportSingle = async (employee: EmployeeRecord) => {
    try {
      setExportingEmployee(employee);
      setIsExporting(true);
      setExportLoaderVisible(true);
      setExportMode('single');
      setExportMessage(`Generating ID card for ${employee.name}...`);
      
      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      if (frontCardRef.current && backCardRef.current) {
        toast.info('Generating PDF...', {
          description: `Creating ID card for ${employee.name}`,
        });
        
        await exportSingleCardToPDF(
          employee,
          frontCardRef.current,
          backCardRef.current,
          { 
            includeFront: true, 
            includeBack: includeBackSide, 
            quality: 3,
            template: selectedTemplate || templates[0]  // Pass template to export
          }
        );
        
        toast.success('PDF downloaded successfully!', {
          description: `ID card for ${employee.name} exported.`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: 'Please try again.',
      });
    } finally {
      setIsExporting(false);
      setExportingEmployee(null);
      setExportLoaderVisible(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.size === 0) {
      toast.error('No employees selected', {
        description: 'Please select at least one employee to export.',
      });
      return;
    }

    try {
      setIsExporting(true);
      const selectedEmployees = employees.filter(emp => selectedIds.has(emp.id));
      
      toast.info(`Exporting ${selectedEmployees.length} ID cards...`, {
        description: 'This may take a moment.',
      });
      
      // Create a temporary container in the viewport but hidden
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '0';
      tempContainer.style.top = '0';
      tempContainer.style.zIndex = '-9999';
      tempContainer.style.opacity = '0';
      tempContainer.style.pointerEvents = 'none';
      document.body.appendChild(tempContainer);
      
      // Create a map to store refs for each employee
      const employeeRefs = new Map<string, { front: HTMLDivElement | null; back: HTMLDivElement | null }>();
      
      // For bulk export, we'll need to render and capture each one
      for (let i = 0; i < selectedEmployees.length; i++) {
        const emp = selectedEmployees[i];
        setExportingEmployee(emp);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (frontCardRef.current && backCardRef.current) {
          // Clone nodes and append to temp container to ensure they have dimensions
          const frontClone = frontCardRef.current.cloneNode(true) as HTMLDivElement;
          const backClone = backCardRef.current.cloneNode(true) as HTMLDivElement;
          
          tempContainer.appendChild(frontClone);
          tempContainer.appendChild(backClone);
          
          // Store the cloned refs
          employeeRefs.set(emp.id, {
            front: frontClone,
            back: backClone,
          });
        }
      }
      
      // Wait a bit to ensure all clones are rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now export all at once
      await exportBulkCardsToPDF(
        selectedEmployees,
        (employee) => {
          const refs = employeeRefs.get(employee.id);
          return {
            front: refs?.front || null,
            back: refs?.back || null,
          };
        },
        { 
          includeFront: true, 
          includeBack: includeBackSide, 
          quality: 2,
          template: selectedTemplate || templates[0]  // Pass template to export
        },
        (progress) => {
          // Progress callback
          if (progress.current % 5 === 0 || progress.current === progress.total) {
            toast.info(`Processing ${progress.current} of ${progress.total} cards...`);
          }
        }
      );
      
      // Clean up temp container
      document.body.removeChild(tempContainer);
      
      toast.success(`Successfully exported ${selectedEmployees.length} ID cards!`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk export error:', error);
      toast.error('Bulk export failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsExporting(false);
      setExportingEmployee(null);
      setExportLoaderVisible(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === employees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map(e => e.id)));
    }
  };

  // Get unique years from employees
  const uniqueYears = [...new Set(
    getAllEmployees().map(e => new Date(e.joiningDate).getFullYear().toString())
  )].sort().reverse();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="grid grid-cols-[1fr_400px] gap-8">
      {/* Left: Employee List */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Search & Filters */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or mobile..."
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {activeSearchQuery || bloodGroupFilter || yearFilter ? (
              <button
                onClick={() => {
                  setLocalSearchQuery('');
                  setBloodGroupFilter('');
                  setYearFilter('');
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">
                {selectedIds.size} employee{selectedIds.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                <button
                  onClick={handleBulkExport}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Export Selected
                </button>
              </div>
            </div>
            {/* Include Back Side Toggle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeBackSide}
                    onChange={(e) => setIncludeBackSide(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/20 rounded-full peer transition-all peer-checked:bg-white/40"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-4"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white">Include Back Side</span>
                  <span className="text-xs text-white/70">(Export both front & back)</span>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {employees.length} Employee{employees.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={selectAll}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {selectedIds.size === employees.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Employee Cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          <AnimatePresence>
            {employees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No employees found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {activeSearchQuery || bloodGroupFilter || yearFilter
                    ? 'Try adjusting your filters'
                    : 'Add employees to get started'}
                </p>
              </motion.div>
            ) : (
              employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedEmployee(employee)}
                  className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedEmployee?.id === employee.id
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(employee.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(employee.id);
                      }}
                      className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                    />

                    {/* Photo */}
                    <div className="w-16 h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      {employee.photoBase64 ? (
                        <img
                          src={employee.photoBase64}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate">
                        {employee.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Emp ID: {employee.employeeId}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{employee.mobile}</span>
                        <span>•</span>
                        <span>{employee.bloodGroup}</span>
                        <span>•</span>
                        <span>{new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(employee);
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                        title="Export ID Card"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEmployee(employee);
                        }}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee.id);
                        }}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right: ID Card Preview */}
      <div>
        {selectedEmployee ? (
          <IDCardPreview
            employeeData={{
              name: selectedEmployee.name,
              employeeId: selectedEmployee.employeeId,
              mobile: selectedEmployee.mobile,
              bloodGroup: selectedEmployee.bloodGroup,
              website: selectedEmployee.website,
              joiningDate: selectedEmployee.joiningDate,
              validTill: selectedEmployee.validTill,
              photo: null, // We'll handle base64 separately
            }}
            photoBase64={selectedEmployee.photoBase64}
            template={selectedTemplate}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sticky top-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-12 border border-slate-700/50 flex items-center justify-center h-[500px]"
          >
            <div className="text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select an employee to preview ID card</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hidden Export Renderers - Fixed positioning for proper rendering */}
      {exportingEmployee && (
        <div style={{ 
          position: 'fixed', 
          left: '0', 
          top: '0', 
          zIndex: '-9999', 
          opacity: '0', 
          pointerEvents: 'none',
          visibility: 'hidden'
        }}>
          <IDCardExportRenderer 
            ref={frontCardRef} 
            employee={exportingEmployee} 
            side="front" 
            template={selectedTemplate}
            photoUrl={exportingEmployee.photoBase64}
          />
          <IDCardExportRenderer 
            ref={backCardRef} 
            employee={exportingEmployee} 
            side="back" 
            template={selectedTemplate}
            photoUrl={exportingEmployee.photoBase64}
          />
        </div>
      )}

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