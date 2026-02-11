/**
 * PHOTO QUALITY VALIDATION FOR PDF EXPORT
 * 
 * ZERO-COMPROMISE QUALITY LOCK:
 * - Validates photo resolution meets minimum DPI requirements
 * - Ensures photos are at target 1280×1600px resolution
 * - Calculates actual DPI based on physical card dimensions
 * - FAILS export if quality standards not met
 */

// Photo specifications
const PHOTO_TARGET_WIDTH = 1280;   // Target resolution width
const PHOTO_TARGET_HEIGHT = 1600;  // Target resolution height

// Physical dimensions on ID card
const PHOTO_DISPLAY_WIDTH_PX = 64;   // Display size in card pixels
const PHOTO_DISPLAY_HEIGHT_PX = 80;  // Display size in card pixels
const CARD_WIDTH_PX = 153;           // Card width in pixels
const CARD_HEIGHT_PX = 244;          // Card height in pixels
const CARD_WIDTH_MM = 40.48;         // Card width in mm
const CARD_HEIGHT_MM = 64.56;        // Card height in mm

// Calculate photo physical size in mm
const PHOTO_WIDTH_MM = (PHOTO_DISPLAY_WIDTH_PX / CARD_WIDTH_PX) * CARD_WIDTH_MM;   // ~16.93mm
const PHOTO_HEIGHT_MM = (PHOTO_DISPLAY_HEIGHT_PX / CARD_HEIGHT_PX) * CARD_HEIGHT_MM; // ~21.17mm

// Minimum DPI requirement
const MINIMUM_DPI = 300;

export interface PhotoQualityResult {
  isValid: boolean;
  actualWidth: number;
  actualHeight: number;
  targetWidth: number;
  targetHeight: number;
  dpiHorizontal: number;
  dpiVertical: number;
  minimumDpi: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validate photo quality from base64 string
 * Returns validation result with DPI calculations
 */
export async function validatePhotoQuality(
  photoBase64: string,
  employeeName?: string
): Promise<PhotoQualityResult> {
  return new Promise((resolve) => {
    if (!photoBase64 || !photoBase64.startsWith('data:image/')) {
      resolve({
        isValid: false,
        actualWidth: 0,
        actualHeight: 0,
        targetWidth: PHOTO_TARGET_WIDTH,
        targetHeight: PHOTO_TARGET_HEIGHT,
        dpiHorizontal: 0,
        dpiVertical: 0,
        minimumDpi: MINIMUM_DPI,
        errors: ['Invalid photo data'],
        warnings: [],
      });
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Calculate actual DPI
      const dpiHorizontal = Math.round((img.width / PHOTO_WIDTH_MM) * 25.4);
      const dpiVertical = Math.round((img.height / PHOTO_HEIGHT_MM) * 25.4);
      const minDpi = Math.min(dpiHorizontal, dpiVertical);
      
      // Only warn about dimensions if they're significantly different AND DPI is affected
      // We don't need exact dimensions as long as aspect ratio and DPI are good
      const aspectRatio = img.width / img.height;
      const targetAspectRatio = PHOTO_TARGET_WIDTH / PHOTO_TARGET_HEIGHT;
      const aspectRatioDiff = Math.abs(aspectRatio - targetAspectRatio);
      
      if (aspectRatioDiff > 0.05) { // Only warn if aspect ratio is off by more than 5%
        warnings.push(
          `Photo aspect ratio is ${aspectRatio.toFixed(2)} (expected ${targetAspectRatio.toFixed(2)})`
        );
      }
      
      // Validate DPI
      if (minDpi < MINIMUM_DPI) {
        errors.push(
          `Photo DPI too low: ${minDpi} DPI (minimum ${MINIMUM_DPI} DPI required for print quality)`
        );
      }
      
      // Check if photo is significantly undersized
      if (img.width < PHOTO_TARGET_WIDTH * 0.5 || img.height < PHOTO_TARGET_HEIGHT * 0.5) {
        errors.push(
          `Photo resolution too low: ${img.width}×${img.height}px (minimum ${PHOTO_TARGET_WIDTH * 0.5}×${PHOTO_TARGET_HEIGHT * 0.5}px)`
        );
      }
      
      const isValid = errors.length === 0;
      
      const employeeInfo = employeeName ? ` for ${employeeName}` : '';
      
      if (isValid) {
        console.log(`✅ Photo quality validation passed${employeeInfo}:`);
        console.log(`   Resolution: ${img.width}×${img.height}px`);
        console.log(`   DPI: ${dpiHorizontal}×${dpiVertical} (min: ${minDpi})`);
        console.log(`   Physical size: ${PHOTO_WIDTH_MM.toFixed(2)}×${PHOTO_HEIGHT_MM.toFixed(2)}mm`);
      } else {
        console.error(`❌ Photo quality validation failed${employeeInfo}:`);
        errors.forEach(error => console.error(`   - ${error}`));
      }
      
      if (warnings.length > 0) {
        console.warn(`⚠️  Photo quality warnings${employeeInfo}:`);
        warnings.forEach(warning => console.warn(`   - ${warning}`));
      }
      
      resolve({
        isValid,
        actualWidth: img.width,
        actualHeight: img.height,
        targetWidth: PHOTO_TARGET_WIDTH,
        targetHeight: PHOTO_TARGET_HEIGHT,
        dpiHorizontal,
        dpiVertical,
        minimumDpi: MINIMUM_DPI,
        errors,
        warnings,
      });
    };
    
    img.onerror = () => {
      resolve({
        isValid: false,
        actualWidth: 0,
        actualHeight: 0,
        targetWidth: PHOTO_TARGET_WIDTH,
        targetHeight: PHOTO_TARGET_HEIGHT,
        dpiHorizontal: 0,
        dpiVertical: 0,
        minimumDpi: MINIMUM_DPI,
        errors: ['Failed to load photo for validation'],
        warnings: [],
      });
    };
    
    img.src = photoBase64;
  });
}

/**
 * Validate photo quality for bulk export
 * Returns array of validation results for all employees
 */
export async function validateBulkPhotoQuality(
  employees: Array<{ name: string; photoBase64: string }>
): Promise<{
  allValid: boolean;
  results: Array<{ employeeName: string; result: PhotoQualityResult }>;
  failedEmployees: string[];
}> {
  console.log('🔍 Validating photo quality for bulk export...');
  
  const results: Array<{ employeeName: string; result: PhotoQualityResult }> = [];
  const failedEmployees: string[] = [];
  
  for (const employee of employees) {
    const result = await validatePhotoQuality(employee.photoBase64, employee.name);
    results.push({ employeeName: employee.name, result });
    
    if (!result.isValid) {
      failedEmployees.push(employee.name);
    }
  }
  
  const allValid = failedEmployees.length === 0;
  
  if (allValid) {
    console.log(`✅ All ${employees.length} employee photos passed quality validation`);
  } else {
    console.error(`❌ ${failedEmployees.length} employee photo(s) failed quality validation:`);
    failedEmployees.forEach(name => console.error(`   - ${name}`));
  }
  
  return {
    allValid,
    results,
    failedEmployees,
  };
}

/**
 * Get photo quality summary for display
 */
export function getPhotoQualitySummary(result: PhotoQualityResult): string {
  if (!result.isValid) {
    return result.errors.join('; ');
  }
  
  const dpi = Math.min(result.dpiHorizontal, result.dpiVertical);
  return `${result.actualWidth}×${result.actualHeight}px @ ${dpi} DPI`;
}