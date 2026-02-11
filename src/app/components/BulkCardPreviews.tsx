import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ZoomIn, ZoomOut, Grid3x3, List, Sparkles, Pencil, Edit2, ChevronDown } from 'lucide-react';
import { IDCardDisplay } from './IDCardDisplay';
import { ImageCropModal } from './ImageCropModal';
import { QuickEditModal } from './QuickEditModal';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { Template } from '../utils/templateData';

interface BulkCardPreviewsProps {
  employees: EmployeeRecord[];
  template: Template;
  onPhotoUpdate?: (employeeId: string, photoBase64: string) => void;
  onEmployeeUpdate?: (employeeId: string, updatedEmployee: EmployeeRecord) => void;
}

type EditableField = 'name' | 'employeeId' | 'mobile' | 'bloodGroup' | 'website' | 'joiningDate' | 'validTill';

export function BulkCardPreviews({ employees, template, onPhotoUpdate, onEmployeeUpdate }: BulkCardPreviewsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [zoom, setZoom] = useState<100 | 150>(100);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [quickEditModalOpen, setQuickEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [selectedField, setSelectedField] = useState<EditableField>('name');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  if (employees.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="text-center py-12">
          <Eye className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No Employees Loaded
          </h3>
          <p className="text-sm text-slate-500">
            Upload CSV/Excel and ZIP files to see previews
          </p>
        </div>
      </div>
    );
  }

  const scale = zoom === 150 ? 1.5 : 1;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-5 lg:p-8 border border-slate-700/50 backdrop-blur-sm h-fit">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Card Previews
          </h3>
          <p className="text-sm text-slate-400">
            {employees.length} {employees.length === 1 ? 'card' : 'cards'} ready for export
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Front/Back Toggle */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setPreviewSide('front')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                previewSide === 'front'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setPreviewSide('back')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                previewSide === 'back'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Back
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setZoom(100)}
              className={`px-2 py-1.5 rounded-md transition-all ${
                zoom === 100
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="100% Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(150)}
              className={`px-2 py-1.5 rounded-md transition-all ${
                zoom === 150
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="150% Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Container with smooth scrolling */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-4'
            }
          >
            {employees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="group relative"
              >
                {/* Card Container */}
                <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                  {/* Employee Info Badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {employee.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        ID: {employee.employeeId}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 ml-2">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Card Preview */}
                  <div className="flex justify-center items-center bg-slate-950/50 rounded-lg p-4">
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <IDCardDisplay
                        employee={employee}
                        side={previewSide}
                        scale={1}
                      />
                    </div>
                  </div>

                  {/* Photo Status Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          employee.photoBase64 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-xs text-slate-400">
                        {employee.photoBase64 ? 'Photo attached' : 'No photo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Details Dropdown Button */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setDropdownOpen(dropdownOpen === employee.id ? null : employee.id);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-md transition-all text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen === employee.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                            {[
                              { field: 'name' as EditableField, label: 'Name' },
                              { field: 'employeeId' as EditableField, label: 'Employee ID' },
                              { field: 'mobile' as EditableField, label: 'Mobile' },
                              { field: 'bloodGroup' as EditableField, label: 'Blood Group' },
                              { field: 'website' as EditableField, label: 'Website' },
                              { field: 'joiningDate' as EditableField, label: 'Joining Date' },
                              { field: 'validTill' as EditableField, label: 'Valid Till' },
                            ].map(({ field, label }) => (
                              <button
                                key={field}
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setSelectedField(field);
                                  setQuickEditModalOpen(true);
                                  setDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit Photo Button */}
                      {employee.photoBase64 && (
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setCropModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md transition-all text-xs"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              ✓ {employees.filter(e => e.photoBase64).length} with photos
            </span>
            <span>
              ⚠ {employees.filter(e => !e.photoBase64).length} missing photos
            </span>
          </div>
          <span>Template: {template.name}</span>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>

      {/* Image Crop Modal */}
      {selectedEmployee && selectedEmployee.photoBase64 && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedEmployee(null);
          }}
          imageUrl={selectedEmployee.photoBase64}
          onApply={(photoBase64) => {
            if (selectedEmployee && onPhotoUpdate) {
              onPhotoUpdate(selectedEmployee.id, photoBase64);
            }
            setCropModalOpen(false);
            setSelectedEmployee(null);
          }}
          employeeData={{
            name: selectedEmployee.name,
            employeeId: selectedEmployee.employeeId,
          }}
          template={template}
        />
      )}

      {/* Edit Employee Modal */}
      {selectedEmployee && (
        <QuickEditModal
          isOpen={quickEditModalOpen}
          onClose={() => {
            setQuickEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          field={selectedField}
          allEmployees={employees}
          onSave={(updatedEmployee) => {
            if (onEmployeeUpdate) {
              onEmployeeUpdate(selectedEmployee.id, updatedEmployee);
            }
            setQuickEditModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}