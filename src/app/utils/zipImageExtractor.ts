import JSZip from 'jszip';
import type { EmployeeRecord } from './employeeStorage';
import { removeImageBackground } from './backgroundRemoval';
import { processPhotoForIDCard } from './photoCropper';

// ============================================
// ZIP IMAGE EXTRACTOR WITH BACKGROUND REMOVAL
// ============================================
// STRICT EMPLOYEE ID MATCHING ONLY
// - Image filename (without extension) MUST exactly match Employee ID
// - Supported formats: .jpg, .jpeg, .png
// - No placeholders allowed - ALL images must be provided
// - Automatic background removal applied to all images
// ============================================

export interface ImageMatchResult {
  employeeId: string;
  imageBase64: string;
  fileName: string;
  width: number;
  height: number;
  format: string;
}

export interface ZipValidationError {
  type: 'missing_image' | 'extra_image' | 'duplicate' | 'invalid_format' | 'corrupted' | 'unsupported_format';
  employeeId?: string;
  fileName?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ZipExtractionResult {
  matches: ImageMatchResult[];
  errors: ZipValidationError[];
  totalImages: number;
  totalEmployees: number;
  isValid: boolean;
  missingEmployeeIds: string[]; // Employee IDs without images
}

// Progress callback for UI updates
export interface ZipProgressCallback {
  onProgress?: (processed: number, total: number, currentEmployee: string) => void;
  onStageChange?: (stage: 'extracting' | 'removing-bg' | 'cropping' | 'finalizing') => void;
}

// STRICT: Only .jpg, .jpeg, .png allowed
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
// HIGH-RES: Photos are now stored at 640×800px for professional print quality
// const MIN_WIDTH = 300;
// const MIN_HEIGHT = 400;

/**
 * Extract images from ZIP file and match to employees
 */
export async function extractAndMatchImages(
  zipFile: File,
  employees: EmployeeRecord[],
  progressCallback?: ZipProgressCallback
): Promise<ZipExtractionResult> {
  console.log('📦 Extracting images from ZIP:', zipFile.name);
  console.log(`   Total employees to match: ${employees.length}`);

  const result: ZipExtractionResult = {
    matches: [],
    errors: [],
    totalImages: 0,
    totalEmployees: employees.length,
    isValid: false,
    missingEmployeeIds: [],
  };

  try {
    // Load ZIP file
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);

    // Extract all image files
    const imageFiles: Array<{ name: string; file: JSZip.JSZipObject }> = [];

    zipData.forEach((relativePath, file) => {
      // Skip folders and hidden files
      if (file.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
        return;
      }

      // Check if file has supported extension
      const lowerPath = relativePath.toLowerCase();
      const hasValidExt = SUPPORTED_FORMATS.some(ext => lowerPath.endsWith(ext));

      if (hasValidExt) {
        // Get just the filename (remove path)
        const fileName = relativePath.split('/').pop() || relativePath;
        imageFiles.push({ name: fileName, file });
      }
    });

    result.totalImages = imageFiles.length;
    console.log(`   Images found in ZIP: ${imageFiles.length}`);

    // Check for duplicate filenames
    const fileNameCounts = new Map<string, number>();
    imageFiles.forEach(({ name }) => {
      const count = fileNameCounts.get(name) || 0;
      fileNameCounts.set(name, count + 1);
    });

    const duplicates = Array.from(fileNameCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([name]) => name);

    if (duplicates.length > 0) {
      duplicates.forEach(name => {
        result.errors.push({
          type: 'duplicate',
          fileName: name,
          message: `Duplicate image filename: ${name}`,
          severity: 'error',
        });
      });
    }

    // Create a map of filenames for quick lookup (case-sensitive)
    const imageMap = new Map<string, JSZip.JSZipObject>();
    imageFiles.forEach(({ name, file }) => {
      // Store with and without extension for matching
      const nameWithoutExt = name.replace(/\.[^.]+$/, '');
      imageMap.set(name, file);
      imageMap.set(nameWithoutExt, file);
    });

    // Match images to employees
    const matchedFileNames = new Set<string>();

    for (const employee of employees) {
      let matched = false;
      let imageFile: JSZip.JSZipObject | undefined;
      let matchedFileName = '';

      // Try to match by Employee ID (strict match)
      for (const ext of SUPPORTED_FORMATS) {
        const fileName = `${employee.employeeId}${ext}`;
        if (imageMap.has(fileName)) {
          imageFile = imageMap.get(fileName);
          matchedFileName = fileName;
          matched = true;
          break;
        }
      }

      // Also try without extension
      if (!matched && imageMap.has(employee.employeeId)) {
        imageFile = imageMap.get(employee.employeeId);
        matchedFileName = imageFiles.find(f => 
          f.name.replace(/\.[^.]+$/, '') === employee.employeeId
        )?.name || '';
        matched = true;
      }

      if (matched && imageFile) {
        try {
          // Extract image as arraybuffer
          const arrayBuffer = await imageFile.async('arraybuffer');
          
          // Determine MIME type from filename extension
          const ext = matchedFileName.toLowerCase().match(/\.(jpg|jpeg|png)$/)?.[1] || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
          
          const originalBlob = new Blob([arrayBuffer], { type: mimeType });
          
          // Validate image first
          const validation = await validateImage(originalBlob);
          
          if (!validation.isValid && validation.severity === 'error') {
            result.errors.push({
              type: validation.error as any,
              employeeId: employee.employeeId,
              fileName: matchedFileName,
              message: `${employee.employeeId}: ${validation.message}`,
              severity: validation.severity,
            });
            continue;
          }
          
          // Add warning if exists but continue processing
          if (!validation.isValid && validation.severity === 'warning') {
            result.errors.push({
              type: validation.error as any,
              employeeId: employee.employeeId,
              fileName: matchedFileName,
              message: `${employee.employeeId}: ${validation.message}`,
              severity: validation.severity,
            });
          }

          // Convert blob to File for background removal
          const originalFile = new File([originalBlob], matchedFileName, { type: mimeType });
          
          console.log(`   🎨 Removing background for: ${employee.employeeId}...`);
          
          // ALWAYS remove background - mandatory processing
          try {
            const processedFile = await removeImageBackground(originalFile);
            console.log(`   ✓ Background removed: ${employee.employeeId}`);
            
            // Crop to exactly 640×800px HIGH-RES with face-centered positioning
            console.log(`   ✂️ Cropping to HIGH-RES 640×800px: ${employee.employeeId}...`);
            const croppedBase64 = await processPhotoForIDCard(processedFile);
            console.log(`   ✓ Cropped: ${employee.employeeId}`);
            
            result.matches.push({
              employeeId: employee.employeeId,
              imageBase64: croppedBase64,
              fileName: matchedFileName,
              width: 640, // Always 640×800px after processing
              height: 800,
              format: 'png', // Always PNG after processing
            });
            matchedFileNames.add(matchedFileName);
            console.log(`   ✅ Fully processed: ${employee.employeeId} → ${matchedFileName}`);
          } catch (bgError) {
            // Background removal failed - this is an ERROR
            console.error(`   ❌ Background removal failed for ${employee.employeeId}:`, bgError);
            result.errors.push({
              type: 'corrupted',
              employeeId: employee.employeeId,
              fileName: matchedFileName,
              message: `Background removal failed for ${employee.employeeId}. Please ensure the image is clear and well-lit.`,
              severity: 'error',
            });
          }
        } catch (err) {
          result.errors.push({
            type: 'corrupted',
            employeeId: employee.employeeId,
            fileName: matchedFileName,
            message: `Failed to process image for ${employee.employeeId}: ${err instanceof Error ? err.message : 'Unknown error'}`,
            severity: 'error',
          });
        }
      } else {
        // CRITICAL: No image found for this employee
        // STRICT RULE: Missing images are ERRORS - block preview/export
        result.errors.push({
          type: 'missing_image',
          employeeId: employee.employeeId,
          message: `Missing photo for Employee ID: ${employee.employeeId}. File must be named ${employee.employeeId}.jpg, ${employee.employeeId}.jpeg, or ${employee.employeeId}.png`,
          severity: 'error',
        });
        console.log(`   ❌ Missing: ${employee.employeeId}`);
        result.missingEmployeeIds.push(employee.employeeId);
      }

      // Update progress
      if (progressCallback?.onProgress) {
        progressCallback.onProgress(result.matches.length, employees.length, employee.employeeId);
      }
    }

    // Check for extra images (images without matching employee)
    imageFiles.forEach(({ name }) => {
      if (!matchedFileNames.has(name) && !duplicates.includes(name)) {
        const nameWithoutExt = name.replace(/\.[^.]+$/, '');
        result.errors.push({
          type: 'extra_image',
          fileName: name,
          message: `Image "${name}" does not match any Employee ID`,
          severity: 'warning',
        });
        console.log(`   ⚠ Extra: ${name}`);
      }
    });

    // Determine if valid
    const hasErrors = result.errors.some(err => err.severity === 'error');
    // STRICT: Only valid if ALL employees have matching images (no errors)
    result.isValid = !hasErrors;

    console.log('✅ ZIP extraction complete:');
    console.log(`   Matches: ${result.matches.length}/${employees.length}`);
    console.log(`   Errors: ${result.errors.filter(e => e.severity === 'error').length}`);
    console.log(`   Warnings: ${result.errors.filter(e => e.severity === 'warning').length}`);

    return result;

  } catch (error) {
    console.error('❌ ZIP extraction failed:', error);
    throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image format and resolution
 */
async function validateImage(blob: Blob): Promise<{
  isValid: boolean;
  error?: string;
  message?: string;
  severity: 'error' | 'warning';
  width?: number;
  height?: number;
  format?: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const format = blob.type.replace('image/', '');

      // Check resolution
      // Resolution validation removed - we resize to 64×80px anyway
      // if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      //   resolve({
      //     isValid: false,
      //     error: 'low_resolution',
      //     message: `Low resolution (${width}×${height}px). Minimum: ${MIN_WIDTH}×${MIN_HEIGHT}px`,
      //     severity: 'warning',
      //     width,
      //     height,
      //     format,
      //   });
      //   return;
      // }

      // Valid
      resolve({
        isValid: true,
        severity: 'error',
        width,
        height,
        format,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'invalid_format',
        message: 'Invalid or corrupted image file',
        severity: 'error',
      });
    };

    img.src = url;
  });
}

/**
 * Convert Blob to base64 data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert File to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format validation errors for display
 */
export function formatZipErrors(errors: ZipValidationError[]): string[] {
  const errorMessages: string[] = [];
  const warningMessages: string[] = [];

  errors.forEach(err => {
    if (err.severity === 'error') {
      errorMessages.push(err.message);
    } else {
      warningMessages.push(err.message);
    }
  });

  return [...errorMessages, ...warningMessages];
}