import * as XLSX from 'xlsx';
import type { EmployeeRecord } from './employeeStorage';

// ============================================
// BULK UPLOAD PARSER
// ============================================
// Supports: CSV, Excel (.xls, .xlsx), ODS
// Features:
// - Auto-detect file format
// - Forgiving column name matching
// - Auto-normalize data
// - Skip invalid rows
// - Provide validation feedback
// ============================================

export interface ParsedResult {
  validEmployees: EmployeeRecord[];
  invalidRows: InvalidRow[];
  totalRows: number;
  fileName: string;
  fileFormat: string;
}

export interface InvalidRow {
  rowNumber: number;
  errors: string[];
  data?: any;
}

// ============================================
// COLUMN NAME MAPPING (CASE INSENSITIVE)
// ============================================
// Accept multiple variations of column names
// HR users may use different naming conventions
// ============================================

const COLUMN_MAPPINGS = {
  name: ['name', 'employee name', 'emp_name', 'employee', 'empname', 'full name', 'fullname'],
  employeeId: ['employee id', 'emp_id', 'id', 'employee_id', 'empid', 'emp id', 'employee no'],
  mobile: ['mobile', 'mobile number', 'phone', 'contact', 'phone number', 'contact number', 'mobile no'],
  bloodGroup: ['blood group', 'blood', 'blood_group', 'bloodgroup', 'bg'],
  website: ['website', 'company site', 'company_site', 'site', 'web'],
  joiningDate: ['joining date', 'join date', 'doj', 'date of joining', 'joining_date', 'joindate'],
  validTill: ['valid till', 'expiry', 'valid_till', 'expiry date', 'valid until', 'validity'],
  photo: ['photo', 'image', 'photo_url', 'image_url', 'photo url', 'picture'],
};

// Default values
const DEFAULT_WEBSITE = 'www.acc.ltd';
const DEFAULT_VALID_TILL = '31/12/2030';

/**
 * Main parser function - supports CSV, Excel, ODS
 */
export async function parseBulkFile(file: File): Promise<ParsedResult> {
  console.log('🔍 Parsing bulk upload file:', file.name);
  console.log('   File type:', file.type);
  console.log('   File size:', (file.size / 1024).toFixed(2), 'KB');

  const fileFormat = getFileFormat(file);
  console.log('   Detected format:', fileFormat);

  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse with xlsx library (supports CSV, XLS, XLSX, ODS)
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('   Sheet name:', sheetName);

    // Convert sheet to JSON
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      blankrows: false, // Skip empty rows
    });

    console.log('   Total rows (excluding header):', rawData.length);

    // Process rows
    const result = processRows(rawData, file.name, fileFormat);
    
    console.log('✅ Parsing complete:');
    console.log(`   ✓ Valid employees: ${result.validEmployees.length}`);
    console.log(`   ✗ Invalid rows: ${result.invalidRows.length}`);

    return result;
    
  } catch (error) {
    console.error('❌ Failed to parse file:', error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect file format from extension and MIME type
 */
function getFileFormat(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') return 'CSV';
  if (extension === 'xlsx') return 'Excel (XLSX)';
  if (extension === 'xls') return 'Excel (XLS)';
  if (extension === 'ods') return 'OpenDocument Spreadsheet';
  
  // Fallback to MIME type
  if (file.type.includes('csv')) return 'CSV';
  if (file.type.includes('spreadsheet')) return 'Excel';
  
  return 'Spreadsheet';
}

/**
 * Process rows and validate data
 */
function processRows(rawData: any[], fileName: string, fileFormat: string): ParsedResult {
  const validEmployees: EmployeeRecord[] = [];
  const invalidRows: InvalidRow[] = [];

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because Excel rows start at 1 and row 1 is header
    
    // Map columns to expected field names
    const mappedRow = mapColumns(row);
    
    // Validate and normalize row
    const validation = validateRow(mappedRow, rowNumber);
    
    if (validation.isValid && validation.employee) {
      validEmployees.push(validation.employee);
    } else {
      invalidRows.push({
        rowNumber,
        errors: validation.errors,
        data: mappedRow,
      });
    }
  });

  return {
    validEmployees,
    invalidRows,
    totalRows: rawData.length,
    fileName,
    fileFormat,
  };
}

/**
 * Map column names to expected field names
 * Case-insensitive and forgiving
 */
function mapColumns(row: any): any {
  const mapped: any = {};
  
  // Get all keys from the row
  const rowKeys = Object.keys(row);
  
  // For each expected field, try to find matching column
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    const matchedKey = rowKeys.find(key => {
      const normalizedKey = key.toLowerCase().trim();
      return variations.some(variation => normalizedKey === variation);
    });
    
    if (matchedKey) {
      mapped[field] = row[matchedKey];
    }
  }
  
  return mapped;
}

/**
 * Validate row and create employee record
 */
function validateRow(row: any, rowNumber: number): {
  isValid: boolean;
  errors: string[];
  employee?: EmployeeRecord;
} {
  const errors: string[] = [];
  
  // Normalize values (trim whitespace)
  const name = String(row.name || '').trim();
  const employeeId = String(row.employeeId || '').trim();
  const mobile = String(row.mobile || '').trim();
  const bloodGroup = String(row.bloodGroup || '').trim();
  const website = String(row.website || DEFAULT_WEBSITE).trim();
  
  // Handle dates - convert Date objects to DD/MM/YYYY format
  const joiningDate = formatDateValue(row.joiningDate);
  const validTill = formatDateValue(row.validTill) || DEFAULT_VALID_TILL;
  const photo = String(row.photo || '').trim();
  
  // Validate required fields
  if (!name || name.length < 2) {
    errors.push('Employee name is required (minimum 2 characters)');
  } else if (name.length > 50) {
    errors.push('Employee name is too long (maximum 50 characters)');
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    errors.push('Employee name can only contain letters, spaces, and (. \' -)');
  }
  
  if (!employeeId || employeeId.length < 2) {
    errors.push('Employee ID is required (minimum 2 characters)');
  } else if (employeeId.length > 20) {
    errors.push('Employee ID is too long (maximum 20 characters)');
  }
  
  // Validate and normalize mobile number
  let normalizedMobile = mobile.replace(/\D/g, ''); // Remove non-digits
  
  if (!normalizedMobile) {
    errors.push('Mobile number is required');
  } else if (normalizedMobile.length === 10) {
    // Auto-prefix with +91 for Indian numbers
    normalizedMobile = '+91' + normalizedMobile;
  } else if (normalizedMobile.length === 12 && normalizedMobile.startsWith('91')) {
    // Already has country code
    normalizedMobile = '+' + normalizedMobile;
  } else if (normalizedMobile.length === 13 && normalizedMobile.startsWith('+91')) {
    // Already formatted
    normalizedMobile = normalizedMobile;
  } else {
    errors.push('Mobile number must be exactly 10 digits');
  }
  
  // Validate blood group
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const normalizedBloodGroup = bloodGroup.toUpperCase().replace(/\s/g, '');
  
  if (!normalizedBloodGroup) {
    errors.push('Blood group is required');
  } else if (!validBloodGroups.includes(normalizedBloodGroup)) {
    errors.push(`Invalid blood group (must be one of: ${validBloodGroups.join(', ')})`);
  }
  
  // If no errors, create employee record
  if (errors.length === 0) {
    const employee: EmployeeRecord = {
      id: generateId(),
      name,
      employeeId: employeeId.toUpperCase(), // Normalize to uppercase
      mobile: normalizedMobile,
      bloodGroup: normalizedBloodGroup,
      website: website || DEFAULT_WEBSITE,
      joiningDate: joiningDate || formatCurrentDate(),
      validTill: validTill || DEFAULT_VALID_TILL,
      photo: photo || '', // Will be filled with background-removed image
      timestamp: Date.now(),
    };
    
    return {
      isValid: true,
      errors: [],
      employee,
    };
  }
  
  return {
    isValid: false,
    errors,
  };
}

/**
 * Format date value to DD/MM/YYYY
 */
function formatDateValue(date: any): string | undefined {
  // If undefined or null, return undefined
  if (!date) {
    return undefined;
  }
  
  // If it's already a string, return as-is (assume it's already formatted)
  if (typeof date === 'string') {
    const trimmed = date.trim();
    return trimmed || undefined;
  }
  
  // If it's a Date object, convert to DD/MM/YYYY
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // If it's a number (Excel serial date), convert to Date first
  if (typeof date === 'number') {
    const excelDate = XLSX.SSF.parse_date_code(date);
    const day = String(excelDate.d).padStart(2, '0');
    const month = String(excelDate.m).padStart(2, '0');
    const year = excelDate.y;
    return `${day}/${month}/${year}`;
  }
  
  return undefined;
}

/**
 * Format current date as DD/MM/YYYY
 */
function formatCurrentDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate unique ID for employee record
 */
function generateId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format validation errors for display
 */
export function formatValidationSummary(result: ParsedResult): string {
  const { validEmployees, invalidRows, totalRows } = result;
  
  if (invalidRows.length === 0) {
    return `✅ All ${totalRows} rows are valid and ready for export`;
  }
  
  const parts: string[] = [];
  
  if (validEmployees.length > 0) {
    parts.push(`✅ ${validEmployees.length} valid employee${validEmployees.length > 1 ? 's' : ''}`);
  }
  
  if (invalidRows.length > 0) {
    parts.push(`❌ ${invalidRows.length} row${invalidRows.length > 1 ? 's' : ''} skipped due to errors`);
  }
  
  return parts.join(' | ');
}

/**
 * Get detailed error messages for invalid rows
 */
export function getDetailedErrors(invalidRows: InvalidRow[]): string[] {
  return invalidRows.slice(0, 10).map(row => { // Show max 10 errors
    const errorList = row.errors.join(', ');
    return `Row ${row.rowNumber}: ${errorList}`;
  });
}