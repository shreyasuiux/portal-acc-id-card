import type { Template } from './templateData';
import type { EmployeeRecord } from './employeeStorage';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate template before export
 */
export function validateTemplate(template: Template | null | undefined): ValidationResult {
  const errors: ValidationError[] = [];

  if (!template) {
    errors.push({
      field: 'template',
      message: 'No template selected. Please select a template from the Templates tab.',
    });
    return { isValid: false, errors };
  }

  // Check if template has required configurations
  if (!template.front) {
    errors.push({
      field: 'template.front',
      message: 'Template front configuration is missing.',
    });
  }

  if (!template.back) {
    errors.push({
      field: 'template.back',
      message: 'Template back configuration is missing.',
    });
  }

  if (!template.colors) {
    errors.push({
      field: 'template.colors',
      message: 'Template color configuration is missing.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate employee data before export
 */
export function validateEmployeeData(employee: EmployeeRecord | null | undefined, employeeIndex?: number): ValidationResult {
  const errors: ValidationError[] = [];
  const prefix = employeeIndex !== undefined ? `Row ${employeeIndex + 1}: ` : '';

  if (!employee) {
    errors.push({
      field: 'employee',
      message: `${prefix}Employee data is missing.`,
    });
    return { isValid: false, errors };
  }

  // Required fields validation
  if (!employee.name || employee.name.trim() === '') {
    errors.push({
      field: 'employee.name',
      message: `${prefix}Employee name is required.`,
    });
  }

  if (!employee.employeeId || employee.employeeId.trim() === '') {
    errors.push({
      field: 'employee.employeeId',
      message: `${prefix}Employee ID is required.`,
    });
  }

  if (!employee.mobile || employee.mobile.trim() === '') {
    errors.push({
      field: 'employee.mobile',
      message: `${prefix}Mobile number is required.`,
    });
  }

  if (!employee.bloodGroup || employee.bloodGroup.trim() === '') {
    errors.push({
      field: 'employee.bloodGroup',
      message: `${prefix}Blood group is required.`,
    });
  }

  if (!employee.photoBase64) {
    errors.push({
      field: 'employee.photo',
      message: `${prefix}Employee photo is missing. Please upload a photo.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate render elements before export
 */
export function validateRenderElements(
  frontElement: HTMLElement | null,
  backElement: HTMLElement | null
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!frontElement) {
    errors.push({
      field: 'frontElement',
      message: 'Front card render element not found. Please wait for preview to load.',
    });
  }

  if (!backElement) {
    errors.push({
      field: 'backElement',
      message: 'Back card render element not found. Please wait for preview to load.',
    });
  }

  // Check if elements are actually rendered (have dimensions)
  if (frontElement) {
    const rect = frontElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      errors.push({
        field: 'frontElement',
        message: 'Front card has not rendered properly. Please refresh and try again.',
      });
    }
  }

  if (backElement) {
    const rect = backElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      errors.push({
        field: 'backElement',
        message: 'Back card has not rendered properly. Please refresh and try again.',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete export pipeline
 */
export function validateExportPipeline(
  template: Template | null | undefined,
  employee: EmployeeRecord | null | undefined,
  frontElement: HTMLElement | null,
  backElement: HTMLElement | null,
  employeeIndex?: number
): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Validate template
  const templateValidation = validateTemplate(template);
  if (!templateValidation.isValid) {
    allErrors.push(...templateValidation.errors);
  }

  // Validate employee data
  const employeeValidation = validateEmployeeData(employee, employeeIndex);
  if (!employeeValidation.isValid) {
    allErrors.push(...employeeValidation.errors);
  }

  // Validate render elements
  const renderValidation = validateRenderElements(frontElement, backElement);
  if (!renderValidation.isValid) {
    allErrors.push(...renderValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Format validation errors into a readable message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  // Filter out any invalid errors with undefined/empty messages
  const validErrors = errors.filter(e => e && e.message && e.message.trim() !== '');
  
  if (validErrors.length === 0) {
    return 'Validation failed with unknown errors. Please check your data and try again.';
  }
  
  if (validErrors.length === 1) {
    return validErrors[0].message;
  }

  // Build error list with actual newlines
  const errorMessages = validErrors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
  return `Multiple issues found:\n${errorMessages}`;
}

/**
 * Check if image data is valid base64
 */
export function validateBase64Image(base64: string | null | undefined): boolean {
  if (!base64) return false;
  
  // Check if it's a valid data URL
  if (!base64.startsWith('data:image/')) return false;
  
  // Check if it has the base64 part
  if (!base64.includes('base64,')) return false;
  
  // Check if base64 data is not empty
  const base64Data = base64.split('base64,')[1];
  return base64Data && base64Data.length > 100; // At least 100 chars for a valid image
}

/**
 * Validate bulk employee data
 */
export function validateBulkEmployeeData(employees: EmployeeRecord[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!employees || employees.length === 0) {
    errors.push({
      field: 'employees',
      message: 'No employees found to export.',
    });
    return { isValid: false, errors };
  }

  // Validate each employee
  employees.forEach((employee, index) => {
    const validation = validateEmployeeData(employee, index);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
  });

  // Limit error reporting to first 5 errors to avoid overwhelming user
  const limitedErrors = errors.slice(0, 5);
  if (errors.length > 5) {
    limitedErrors.push({
      field: 'bulk',
      message: `...and ${errors.length - 5} more errors. Please fix the above issues first.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors: limitedErrors,
  };
}
