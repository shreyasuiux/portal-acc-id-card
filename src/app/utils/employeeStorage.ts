export interface EmployeeRecord {
  id: string;
  name: string;
  employeeId: string;
  mobile: string;
  bloodGroup: string;
  website: string;
  joiningDate: string;
  validTill: string;
  photoBase64: string;
  createdAt: string;
}

const STORAGE_KEY = 'hr_employees';

// Get all employees from localStorage
export function getAllEmployees(): EmployeeRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading employees:', error);
    return [];
  }
}

// Save employee to localStorage
export function saveEmployee(employeeData: {
  name: string;
  employeeId: string;
  mobile: string;
  bloodGroup: string;
  website: string;
  joiningDate: string;
  validTill: string;
  photo: File | string | null; // Can be File (legacy) or base64 string (new)
}): Promise<EmployeeRecord> {
  return new Promise((resolve, reject) => {
    try {
      const employees = getAllEmployees();
      
      // Check if employee ID already exists
      const existingIndex = employees.findIndex(e => e.employeeId === employeeData.employeeId);
      
      // Handle photo - can be File or already base64
      if (employeeData.photo) {
        // Check if it's already a base64 string
        if (typeof employeeData.photo === 'string') {
          // Already base64 - use directly
          const newEmployee: EmployeeRecord = {
            id: existingIndex >= 0 ? employees[existingIndex].id : `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: employeeData.name,
            employeeId: employeeData.employeeId,
            mobile: employeeData.mobile,
            bloodGroup: employeeData.bloodGroup,
            website: employeeData.website,
            joiningDate: employeeData.joiningDate,
            validTill: employeeData.validTill,
            photoBase64: employeeData.photo,
            createdAt: existingIndex >= 0 ? employees[existingIndex].createdAt : new Date().toISOString(),
          };
          
          if (existingIndex >= 0) {
            employees[existingIndex] = newEmployee;
          } else {
            employees.push(newEmployee);
          }
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
          resolve(newEmployee);
        } else {
          // It's a File object - convert to base64 (legacy support)
          const reader = new FileReader();
          reader.onloadend = () => {
            const newEmployee: EmployeeRecord = {
              id: existingIndex >= 0 ? employees[existingIndex].id : `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: employeeData.name,
              employeeId: employeeData.employeeId,
              mobile: employeeData.mobile,
              bloodGroup: employeeData.bloodGroup,
              website: employeeData.website,
              joiningDate: employeeData.joiningDate,
              validTill: employeeData.validTill,
              photoBase64: reader.result as string,
              createdAt: existingIndex >= 0 ? employees[existingIndex].createdAt : new Date().toISOString(),
            };
            
            if (existingIndex >= 0) {
              employees[existingIndex] = newEmployee;
            } else {
              employees.push(newEmployee);
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
            resolve(newEmployee);
          };
          reader.onerror = () => reject(new Error('Failed to read photo'));
          reader.readAsDataURL(employeeData.photo);
        }
      } else {
        const newEmployee: EmployeeRecord = {
          id: existingIndex >= 0 ? employees[existingIndex].id : `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: employeeData.name,
          employeeId: employeeData.employeeId,
          mobile: employeeData.mobile,
          bloodGroup: employeeData.bloodGroup,
          website: employeeData.website,
          joiningDate: employeeData.joiningDate,
          validTill: employeeData.validTill,
          photoBase64: '',
          createdAt: existingIndex >= 0 ? employees[existingIndex].createdAt : new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          employees[existingIndex] = newEmployee;
        } else {
          employees.push(newEmployee);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        resolve(newEmployee);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Update employee
export function updateEmployee(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
  return new Promise((resolve, reject) => {
    try {
      const employees = getAllEmployees();
      const index = employees.findIndex(e => e.id === id);
      
      if (index === -1) {
        reject(new Error('Employee not found'));
        return;
      }
      
      employees[index] = { ...employees[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
      resolve(employees[index]);
    } catch (error) {
      reject(error);
    }
  });
}

// Delete employee
export function deleteEmployee(id: string): boolean {
  try {
    const employees = getAllEmployees();
    const filtered = employees.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
}

// Search employees
export function searchEmployees(query: string, filters: {
  bloodGroup?: string;
  year?: string;
}): EmployeeRecord[] {
  const employees = getAllEmployees();
  const lowerQuery = query.toLowerCase();
  
  return employees.filter(emp => {
    // Text search
    const matchesQuery = !query || 
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.employeeId.toLowerCase().includes(lowerQuery) ||
      emp.mobile.includes(query);
    
    // Blood group filter
    const matchesBloodGroup = !filters.bloodGroup || emp.bloodGroup === filters.bloodGroup;
    
    // Year filter
    const matchesYear = !filters.year || 
      new Date(emp.joiningDate).getFullYear().toString() === filters.year;
    
    return matchesQuery && matchesBloodGroup && matchesYear;
  });
}

// Bulk save employees from bulk upload
export interface BulkSaveResult {
  totalProcessed: number;
  newlySaved: number;
  updated: number;
  skipped: number;
  duplicates: Array<{ employeeId: string; action: 'updated' | 'skipped' }>;
}

export function saveBulkEmployees(
  employees: EmployeeRecord[],
  options: {
    onDuplicate: 'update' | 'skip'; // What to do if Employee ID already exists
  } = { onDuplicate: 'skip' }
): BulkSaveResult {
  try {
    const existingEmployees = getAllEmployees();
    const existingEmployeeIds = new Set(existingEmployees.map(e => e.employeeId));
    
    const result: BulkSaveResult = {
      totalProcessed: employees.length,
      newlySaved: 0,
      updated: 0,
      skipped: 0,
      duplicates: [],
    };

    const updatedEmployees = [...existingEmployees];

    employees.forEach(newEmployee => {
      const existingIndex = updatedEmployees.findIndex(
        e => e.employeeId === newEmployee.employeeId
      );

      if (existingIndex >= 0) {
        // Duplicate found
        if (options.onDuplicate === 'update') {
          // Update existing employee with new data
          updatedEmployees[existingIndex] = {
            ...newEmployee,
            id: updatedEmployees[existingIndex].id, // Keep original ID
            createdAt: updatedEmployees[existingIndex].createdAt, // Keep original creation date
          };
          result.updated++;
          result.duplicates.push({ employeeId: newEmployee.employeeId, action: 'updated' });
          console.log(`   ✓ Updated: ${newEmployee.employeeId}`);
        } else {
          // Skip duplicate
          result.skipped++;
          result.duplicates.push({ employeeId: newEmployee.employeeId, action: 'skipped' });
          console.log(`   ⊘ Skipped: ${newEmployee.employeeId} (already exists)`);
        }
      } else {
        // New employee - add to database
        updatedEmployees.push(newEmployee);
        result.newlySaved++;
        console.log(`   ✓ Saved: ${newEmployee.employeeId}`);
      }
    });

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
    
    console.log('💾 Bulk save complete:');
    console.log(`   Total: ${result.totalProcessed}`);
    console.log(`   New: ${result.newlySaved}`);
    console.log(`   Updated: ${result.updated}`);
    console.log(`   Skipped: ${result.skipped}`);

    return result;
  } catch (error) {
    console.error('Error saving bulk employees:', error);
    throw new Error('Failed to save employees to database');
  }
}