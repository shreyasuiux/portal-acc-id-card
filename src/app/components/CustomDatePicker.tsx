import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import '../../styles/custom-datepicker.css'; // ⚠️ DEPLOYMENT FIX: External CSS file

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  error?: boolean;
}

/**
 * Custom Date Picker Component
 * 
 * ⚠️ DEPLOYMENT-READY: Works in Figma Make AND after deployment
 * 
 * Provides a consistent date picker experience across ALL platforms:
 * - Windows
 * - Mac
 * - Android
 * - iOS
 * 
 * Features:
 * - Calendar popup with proper dark theme styling
 * - Manual date input with dd/mm/yyyy format
 * - Proper visibility after deployment (styles in external CSS)
 * - No platform-specific native date pickers
 */
export function CustomDatePicker({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'dd/mm/yyyy',
  disabled = false,
  required = false,
  className = '',
  id,
  error = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert YYYY-MM-DD to dd/mm/yyyy for display
  useEffect(() => {
    if (value) {
      try {
        const date = parse(value, 'yyyy-MM-dd', new Date());
        if (isValid(date)) {
          setInputValue(format(date, 'dd/MM/yyyy'));
        }
      } catch (e) {
        setInputValue('');
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // Convert YYYY-MM-DD to Date object for DayPicker
  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange(formattedDate);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow only numbers and slashes
    const cleaned = input.replace(/[^0-9/]/g, '');
    setInputValue(cleaned);

    // Try to parse dd/mm/yyyy format
    if (cleaned.length === 10) {
      try {
        const date = parse(cleaned, 'dd/MM/yyyy', new Date());
        if (isValid(date)) {
          const formattedDate = format(date, 'yyyy-MM-dd');
          onChange(formattedDate);
        }
      } catch (e) {
        // Invalid date, don't update
      }
    } else if (cleaned === '') {
      onChange('');
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // If input is incomplete, try to parse it
    if (inputValue && inputValue.length < 10) {
      // Clear invalid input
      setInputValue('');
      onChange('');
    }
    onBlur?.();
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle "Today" button
  const handleToday = () => {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            onFocus?.();
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24 ${
            error ? 'border-red-500' : 'border-slate-600'
          } ${className}`}
          maxLength={10}
          autoComplete="off"
        />
        
        {/* Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-slate-600 rounded transition-colors"
              tabIndex={-1}
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-slate-600 rounded transition-colors"
            tabIndex={-1}
            disabled={disabled}
          >
            <Calendar className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && !disabled && (
        <div className="absolute z-[1000] mt-2 left-0 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="custom-datepicker">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              showOutsideDays
              fixedWeeks
              className="p-4"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-800/50">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}