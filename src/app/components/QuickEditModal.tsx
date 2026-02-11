import { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { EmployeeRecord } from '../utils/employeeStorage';
import { CustomDatePicker } from './CustomDatePicker';

type EditableField = 'name' | 'employeeId' | 'mobile' | 'bloodGroup' | 'website' | 'joiningDate' | 'validTill';

interface QuickEditModalProps {
  employee: EmployeeRecord | null;
  field: EditableField;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmployee: EmployeeRecord) => void;
  allEmployees: EmployeeRecord[];
}

const fieldLabels: Record<EditableField, string> = {
  name: 'Full Name',
  employeeId: 'Employee ID',
  mobile: 'Mobile Number',
  bloodGroup: 'Blood Group',
  website: 'Website',
  joiningDate: 'Joining Date',
  validTill: 'Valid Till',
};

export function QuickEditModal({ employee, field, isOpen, onClose, onSave, allEmployees }: QuickEditModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee && isOpen) {
      setValue(employee[field]?.toString() || '');
      setError('');
    }
  }, [employee, field, isOpen]);

  if (!isOpen || !employee) return null;

  // Validation
  const validate = (): boolean => {
    setError('');

    // Name validation
    if (field === 'name') {
      if (!value.trim()) {
        setError('Name is required');
        return false;
      }
      if (value.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return false;
      }
      if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
        setError('Name can only contain letters, spaces, and (. \' -)');
        return false;
      }
    }

    // Employee ID validation
    if (field === 'employeeId') {
      if (!value.trim()) {
        setError('Employee ID is required');
        return false;
      }
      // Check if Employee ID already exists (excluding current employee)
      const isDuplicate = allEmployees.some(
        (emp) => emp.id !== employee.id && emp.employeeId === value.trim()
      );
      if (isDuplicate) {
        setError('Employee ID already exists');
        return false;
      }
    }

    // Mobile validation
    if (field === 'mobile') {
      if (!value.trim()) {
        setError('Mobile number is required');
        return false;
      }
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10 && !(cleaned.startsWith('91') && cleaned.length === 12)) {
        setError('Invalid mobile number');
        return false;
      }
    }

    // Blood Group validation
    if (field === 'bloodGroup') {
      if (!value.trim()) {
        setError('Blood group is required');
        return false;
      }
    }

    // Date validations
    if (field === 'joiningDate') {
      if (!value) {
        setError('Joining date is required');
        return false;
      }
      const joiningDate = new Date(value);
      if (isNaN(joiningDate.getTime())) {
        setError('Invalid joining date');
        return false;
      }
    }

    if (field === 'validTill') {
      if (!value) {
        setError('Valid till date is required');
        return false;
      }
      const validTillDate = new Date(value);
      if (isNaN(validTillDate.getTime())) {
        setError('Invalid valid till date');
        return false;
      }
      const joiningDate = new Date(employee.joiningDate);
      if (validTillDate <= joiningDate) {
        setError('Valid till must be after joining date');
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    const updatedEmployee = {
      ...employee,
      [field]: value.trim(),
    };

    onSave(updatedEmployee);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && field !== 'name') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const renderInput = () => {
    switch (field) {
      case 'name':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="e.g., John Smith"
            autoFocus
          />
        );

      case 'employeeId':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              // Only allow digits
              const cleaned = e.target.value.replace(/\D/g, '');
              setValue(cleaned);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="e.g., 1001"
            autoFocus
          />
        );

      case 'mobile':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => {
              // Only allow digits
              const cleaned = e.target.value.replace(/\D/g, '');
              setValue(cleaned);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="9876543210"
            autoFocus
          />
        );

      case 'bloodGroup':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            autoFocus
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        );

      case 'website':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            placeholder="www.company.com"
            autoFocus
          />
        );

      case 'joiningDate':
      case 'validTill':
        return (
          <CustomDatePicker
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            ref={dateRef}
            autoFocus
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Edit {fieldLabels[field]}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {employee.name} • ID: {employee.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              {fieldLabels[field]}
              {field !== 'website' && <span className="text-red-400 ml-1">*</span>}
            </label>
            
            {renderInput()}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}