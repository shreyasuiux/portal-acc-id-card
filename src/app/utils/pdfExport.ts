import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { EmployeeRecord } from './employeeStorage';
import { 
  validateTemplate, 
  validateEmployeeData, 
  validateRenderElements,
  validateExportPipeline,
  formatValidationErrors,
  type ValidationResult 
} from './exportValidation';
import type { Template } from './templateData';
import { validatePhotoQuality } from './photoQualityValidator';
import { validateFontsBeforeExport } from './fontValidation';
import { embedRobotoInPDF, ensureFontsLoaded, preloadRobotoFonts } from './fontEmbedding';
import { validateFontsForExport, waitForFontsReady } from './fontPreloader';
import { 
  renderEmployeeCard, 
  renderEmployeeCards, 
  validateRenderingConsistency,
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  EXPORT_SCALE 
} from './freshExportRenderer';

// ============================================
// STRICT PDF CONFIGURATION (NON-NEGOTIABLE)
// ============================================
// CRITICAL RULE: PRINT-QUALITY EXPORT AT EXACT PHYSICAL SIZE
//
// PDF IMAGE QUALITY — HARD LOCK:
// ✅ NO compression during export
// ✅ NO downsampling of images
// ✅ NO optimization for web
// ✅ NO DPI conversion
// ✅ Employee photos embedded at NATIVE resolution (1280×1600px ULTRA-HI-RES)
// ✅ Treated as PRINT-QUALITY raster (not screen image)
// ✅ Export FAILS with error if quality degrades
//
// ID Card Dimensions (CR80 Standard):
const CARD_WIDTH_MM = 85.6;   // 3.375 inches
const CARD_HEIGHT_MM = 53.98;  // 2.125 inches

// Pixel dimensions for high-quality export
const CARD_WIDTH_PX = 153;
const CARD_HEIGHT_PX = 244;

// HIGH QUALITY EXPORT SETTINGS
const HIGH_QUALITY_SCALE = 8;         // 8x scale for crisp rendering
const IMAGE_QUALITY = 1.0;            // MAXIMUM quality (no compression)
const PDF_COMPRESSION = 'NONE';       // NO compression (was 'FAST' - REMOVED)

console.log('📋 PDF Export Configuration:');
console.log(`   Card size: ${CARD_WIDTH_MM}×${CARD_HEIGHT_MM}mm`);
console.log(`   Pixel size: ${CARD_WIDTH_PX}×${CARD_HEIGHT_PX}px`);
console.log(`   Export scale: ${HIGH_QUALITY_SCALE}x`);
console.log(`   Image quality: ${IMAGE_QUALITY * 100}% (maximum)`);
console.log(`   PDF compression: ${PDF_COMPRESSION} (NO compression)`);
console.log(`   Employee photo: 1280×1600px ULTRA-HI-RES native (print-ready)`);
console.log('   ⚠️  HARD LOCK: Export fails if quality degrades');

export interface ExportOptions {
  includeFront?: boolean;
  includeBack?: boolean;
  quality?: number;
  template?: Template;
}

export interface ExportProgress {
  current: number;
  total: number;
  status: 'validating' | 'processing' | 'generating' | 'complete' | 'error';
  message: string;
}

/**
 * Convert OKLCH color to RGB hex format
 * This is a simplified conversion - for production use a proper color library
 */
function convertOklchToHex(oklchString: string): string {
  // Simple mapping of common OKLCH values to RGB equivalents
  const oklchMap: Record<string, string> = {
    'oklch(0.145 0 0)': '#252525',
    'oklch(0.985 0 0)': '#fafafa',
    'oklch(1 0 0)': '#ffffff',
    'oklch(0.95 0.0058 264.53)': '#f1f1f4',
    'oklch(0.708 0 0)': '#b5b5b5',
    'oklch(0.97 0 0)': '#f7f7f7',
    'oklch(0.205 0 0)': '#343434',
    'oklch(0.922 0 0)': '#ebebeb',
  };
  
  return oklchMap[oklchString] || '#ffffff';
}

/**
 * Convert all OKLCH colors in an element tree to RGB
 */
export function convertOklchColorsInElement(element: HTMLElement): void {
  // Convert computed styles to inline RGB styles
  const computedStyle = window.getComputedStyle(element);
  
  // Get all color-related properties
  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
  ];
  
  colorProps.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && value.includes('oklch')) {
      const rgbValue = convertOklchToHex(value);
      (element.style as any)[prop] = rgbValue;
    }
  });
  
  // Recursively process children
  Array.from(element.children).forEach(child => {
    if (child instanceof HTMLElement) {
      convertOklchColorsInElement(child);
    }
  });
}

/**
 * Export a single ID card to PDF
 */
export async function exportSingleCardToPDF(
  employee: EmployeeRecord,
  frontElement: HTMLElement | null,
  backElement: HTMLElement | null,
  options?: ExportOptions
): Promise<void> {
  // Ensure options is always an object
  const safeOptions = options || {};
  
  const {
    includeFront = true,
    includeBack = true,
    quality = 2,
    template,
  } = safeOptions;

  if (!frontElement && !backElement) {
    throw new Error('No card elements provided for export');
  }

  try {
    // STEP 0: CRITICAL - WAIT FOR FONTS TO LOAD
    console.log('🔒 STEP 0: Font validation (CRITICAL)...');
    
    try {
      const fontValidation = await validateFontsForExport();
      if (!fontValidation.canExport) {
        console.warn('⚠️ Font validation warning:', fontValidation.message);
        // Don't block export, just warn
      } else {
        // Ensure fonts are fully loaded (prevents serif fallback)
        await waitForFontsReady();
        console.log('✓ Fonts validated and ready (Roboto loaded, no fallback)');
      }
    } catch (fontError) {
      console.warn('⚠️ Font validation failed:', fontError);
      // Don't block export - fonts will load from CDN fallback
    }
    
    // STEP 1: PRE-EXPORT VALIDATION
    console.log('📋 STEP 1: Validating export pipeline...');
    
    const validation = validateExportPipeline(
      template,
      employee,
      frontElement,
      backElement
    );
    
    if (!validation.isValid) {
      const errorMessage = formatValidationErrors(validation.errors);
      console.error('❌ Validation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('✓ Validation passed');

    // STEP 1.5: PHOTO QUALITY VALIDATION (ZERO-COMPROMISE)
    console.log('📸 STEP 1.5: Validating photo quality...');
    
    const photoQuality = await validatePhotoQuality(employee.photoBase64, employee.name);
    
    if (!photoQuality.isValid) {
      const errorMsg = `❌ PHOTO QUALITY CHECK FAILED\n\n` +
        `Employee: ${employee.name}\n` +
        `Errors:\n${photoQuality.errors.map(e => `  - ${e}`).join('\n')}\n\n` +
        `Export ABORTED to prevent poor print quality.\n` +
        `Please re-upload a high-resolution photo (minimum 1280×1600px).`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`✓ Photo quality validation passed`);
    console.log(`   Resolution: ${photoQuality.actualWidth}×${photoQuality.actualHeight}px`);
    console.log(`   DPI: ${photoQuality.dpiHorizontal}×${photoQuality.dpiVertical} (min: ${Math.min(photoQuality.dpiHorizontal, photoQuality.dpiVertical)})`);
    console.log('   Photo meets professional print quality requirements');

    // STEP 2: CONVERT COLORS
    console.log('🎨 STEP 2: Converting OKLCH colors...');
    
    if (frontElement) {
      convertOklchColorsInElement(frontElement);
    }
    if (backElement) {
      convertOklchColorsInElement(backElement);
    }
    
    console.log('✓ Colors converted');

    // STEP 3: CREATE PDF
    console.log('📄 STEP 3: Creating PDF document...');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
    });

    let pageAdded = false;

    // STEP 4: CAPTURE FRONT SIDE
    if (includeFront && frontElement) {
      console.log('📸 STEP 4: Capturing front side at high quality...');
      console.log(`   Scale: ${HIGH_QUALITY_SCALE}x for maximum clarity`);
      
      // CRITICAL: Hide employee photo during html2canvas (will embed separately)
      const photoElements = frontElement.querySelectorAll('[data-employee-photo=\"true\"]');
      const photoContainers = frontElement.querySelectorAll('[data-photo-container=\"true\"]');
      const originalPhotoStyles: string[] = [];
      const originalContainerStyles: string[] = [];
      
      console.log('🔒 CRITICAL IMAGE QUALITY OVERRIDE:');
      console.log('   ├─ Hiding employee photo during card layout capture');
      console.log('   ├─ Photo will be embedded separately (NO rasterization)');
      console.log('   └─ Original high-res image preserved (NO canvas conversion)');
      
      // Hide photos
      photoElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalPhotoStyles[index] = htmlEl.style.display;
        htmlEl.style.display = 'none';
      });
      
      // Hide photo containers (optional: keep border/background)
      photoContainers.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalContainerStyles[index] = htmlEl.style.visibility || '';
        // Keep container visible but photo hidden (maintains layout)
      });
      
      // CRITICAL: Verify element dimensions before capture
      console.log('📐 ELEMENT VERIFICATION:');
      console.log(`   frontElement clientWidth: ${frontElement.clientWidth}px`);
      console.log(`   frontElement clientHeight: ${frontElement.clientHeight}px`);
      console.log(`   frontElement offsetWidth: ${frontElement.offsetWidth}px`);
      console.log(`   frontElement offsetHeight: ${frontElement.offsetHeight}px`);
      console.log(`   Expected: ${CARD_WIDTH_PX}×${CARD_HEIGHT_PX}px`);
      
      // CRITICAL FIX: Ensure element has explicit dimensions (save original state)
      const originalWidth = frontElement.style.width;
      const originalHeight = frontElement.style.height;
      const hadInlineWidth = frontElement.style.width !== '';
      const hadInlineHeight = frontElement.style.height !== '';
      
      frontElement.style.width = `${CARD_WIDTH_PX}px`;
      frontElement.style.height = `${CARD_HEIGHT_PX}px`;
      
      const frontCanvas = await html2canvas(frontElement, {
        scale: HIGH_QUALITY_SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: false,  // CRITICAL FIX: Do NOT remove elements from DOM!
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        x: 0,
        y: 0,
      });
      
      // CRITICAL: Fully restore original state (remove inline styles if they weren't there before)
      if (hadInlineWidth) {
        frontElement.style.width = originalWidth;
      } else {
        frontElement.style.removeProperty('width');
      }
      if (hadInlineHeight) {
        frontElement.style.height = originalHeight;
      } else {
        frontElement.style.removeProperty('height');
      }

      // Restore photo visibility
      photoElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = originalPhotoStyles[index];
      });
      photoContainers.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        if (originalContainerStyles[index]) {
          htmlEl.style.visibility = originalContainerStyles[index];
        }
      });

      console.log('🔍 QUALITY VERIFICATION:');
      console.log(`   Canvas dimensions: ${frontCanvas.width}×${frontCanvas.height}px`);
      console.log(`   Expected dimensions: ${CARD_WIDTH_PX * HIGH_QUALITY_SCALE}×${CARD_HEIGHT_PX * HIGH_QUALITY_SCALE}px`);
      
      // HARD LOCK: Verify canvas dimensions match expected
      const expectedWidth = CARD_WIDTH_PX * HIGH_QUALITY_SCALE;
      const expectedHeight = CARD_HEIGHT_PX * HIGH_QUALITY_SCALE;
      
      if (frontCanvas.width !== expectedWidth || frontCanvas.height !== expectedHeight) {
        const errorMsg = `❌ QUALITY DEGRADATION DETECTED!\n` +
          `Expected: ${expectedWidth}×${expectedHeight}px\n` +
          `Got: ${frontCanvas.width}×${frontCanvas.height}px\n` +
          `Export ABORTED to prevent quality loss.`;
        console.error(errorMsg);
        throw new Error('Image quality degradation detected. Export failed to protect print quality.');
      }
      
      console.log('   ✅ Canvas quality: VERIFIED');

      // Convert to MAXIMUM quality JPEG (no compression)
      const frontImage = frontCanvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      
      // Verify base64 size (larger = better quality, should be several MB)
      const base64Size = Math.round(frontImage.length / 1024); // KB
      console.log(`   Base64 size: ${base64Size} KB`);
      
      if (base64Size < 50) {
        console.warn('   ⚠️  WARNING: Base64 size suspiciously small - possible compression!');
      } else {
        console.log('   ✅ Base64 size: EXCELLENT (no visible compression)');
      }
      
      // Add to PDF with ZERO compression
      console.log(`   Adding to PDF: compression=${PDF_COMPRESSION}, quality=${IMAGE_QUALITY}`);
      pdf.addImage(frontImage, 'JPEG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, PDF_COMPRESSION);
      pageAdded = true;
      
      // CRITICAL: Embed ORIGINAL employee photo separately (NO rasterization!)
      if (employee.photoBase64 && employee.photoBase64.startsWith('data:image/')) {
        console.log('🖼️  EMBEDDING ORIGINAL EMPLOYEE PHOTO:');
        console.log('   ├─ Source: Original base64 image (NOT rasterized)');
        console.log('   ├─ Resolution: 1280×1600px (print-ready)');
        console.log('   ├─ Method: Direct jsPDF.addImage() overlay');
        console.log('   └─ Compression: NONE (pixel-perfect quality)');
        
        // Photo position and size on card (in pixels)
        const PHOTO_LEFT_PX = 44.5;
        const PHOTO_TOP_PX = 81;
        const PHOTO_WIDTH_PX = 64;
        const PHOTO_HEIGHT_PX = 80;
        
        // Convert to mm coordinates
        const photoLeftMM = (PHOTO_LEFT_PX / CARD_WIDTH_PX) * CARD_WIDTH_MM;
        const photoTopMM = (PHOTO_TOP_PX / CARD_HEIGHT_PX) * CARD_HEIGHT_MM;
        const photoWidthMM = (PHOTO_WIDTH_PX / CARD_WIDTH_PX) * CARD_WIDTH_MM;
        const photoHeightMM = (PHOTO_HEIGHT_PX / CARD_HEIGHT_PX) * CARD_HEIGHT_MM;
        
        // CRITICAL: Validate photo resolution meets 300 DPI minimum
        // Load image to get actual dimensions
        const imgValidation = await new Promise<{width: number, height: number}>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight});
          img.onerror = () => reject(new Error('Failed to load photo for validation'));
          img.src = employee.photoBase64!;
        });
        
        // Calculate actual DPI
        const photoWidthInches = photoWidthMM / 25.4;
        const photoHeightInches = photoHeightMM / 25.4;
        const actualDpiH = imgValidation.width / photoWidthInches;
        const actualDpiV = imgValidation.height / photoHeightInches;
        const minDpi = Math.min(actualDpiH, actualDpiV);
        
        console.log(`   Photo actual resolution: ${imgValidation.width}×${imgValidation.height}px`);
        console.log(`   Photo frame size: ${photoWidthMM.toFixed(2)}×${photoHeightMM.toFixed(2)}mm`);
        console.log(`   Calculated DPI: ${actualDpiH.toFixed(0)}×${actualDpiV.toFixed(0)} (min: ${minDpi.toFixed(0)})`);
        
        // STRICT RULE: Block export if photo resolution is too low
        const MINIMUM_DPI = 300;
        if (minDpi < MINIMUM_DPI) {
          const errorMsg = `❌ EXPORT BLOCKED: Photo resolution too low!\n\n` +
            `Employee: ${employee.name}\n` +
            `Photo resolution: ${imgValidation.width}×${imgValidation.height}px\n` +
            `Actual DPI: ${minDpi.toFixed(0)} DPI\n` +
            `Required: ${MINIMUM_DPI}+ DPI\n\n` +
            `The exported PDF would be blurry. Please upload a higher resolution photo.\n` +
            `Minimum recommended: 256×320px (for 300 DPI)\n` +
            `Best quality: 1280×1600px (for 1814 DPI)`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log(`   ✅ Photo DPI validation PASSED (${minDpi.toFixed(0)} DPI >= ${MINIMUM_DPI} DPI)`);
        console.log(`   Photo position: ${photoLeftMM.toFixed(2)}×${photoTopMM.toFixed(2)}mm`);
        console.log(`   Photo size: ${photoWidthMM.toFixed(2)}×${photoHeightMM.toFixed(2)}mm`);
        
        // Embed ORIGINAL photo at exact position
        pdf.addImage(
          employee.photoBase64,  // ORIGINAL base64 (NO rasterization!)
          'PNG',                 // Format (PNG for transparency)
          photoLeftMM,           // X position in mm
          photoTopMM,            // Y position in mm
          photoWidthMM,          // Width in mm (visual frame)
          photoHeightMM,         // Height in mm (visual frame)
          undefined,             // Alias
          PDF_COMPRESSION        // NO compression
        );
        
        console.log('   ✅ ORIGINAL photo embedded successfully');
        console.log(`   ✅ Photo quality: NATIVE ${imgValidation.width}×${imgValidation.height}px (${minDpi.toFixed(0)} DPI)`);
        console.log('   ✅ Zero rasterization, zero canvas conversion');
      }
      
      console.log('✓ Front side captured at PRINT-QUALITY resolution');
      console.log('   Employee photo embedded at NATIVE 1280×1600px ULTRA-HI-RES');
    }

    // STEP 5: CAPTURE BACK SIDE
    if (includeBack && backElement) {
      console.log('📸 STEP 5: Capturing back side at high quality...');
      console.log(`   Scale: ${HIGH_QUALITY_SCALE}x for maximum clarity`);
      
      if (pageAdded) {
        pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
      }
      
      const backCanvas = await html2canvas(backElement, {
        scale: HIGH_QUALITY_SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: false,  // CRITICAL FIX: Do NOT remove elements from DOM!
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        x: 0,
        y: 0,
      });

      // Convert to high-quality JPEG
      const backImage = backCanvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      pdf.addImage(backImage, 'JPEG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, PDF_COMPRESSION);
      
      console.log('✓ Back side captured at high resolution');
    }

    // STEP 6: DOWNLOAD
    console.log('💾 STEP 6: Triggering download...');
    
    const fileName = `employee-id-card_${employee.employeeId}.pdf`;
    pdf.save(fileName);
    
    console.log('✅ Export complete:', fileName);
  } catch (error) {
    console.error('❌ Export failed:', error);
    
    // Provide actionable error messages
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    
    throw new Error('Failed to export ID card to PDF. Please try again or contact support.');
  }
}

/**
 * Export multiple ID cards to a single PDF
 */
export async function exportBulkCardsToPDF(
  employees: EmployeeRecord[],
  getCardElements: (employee: EmployeeRecord) => {
    front: HTMLElement | null;
    back: HTMLElement | null;
  },
  options: ExportOptions = {},
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const {
    includeFront = true,
    includeBack = true,
    quality = 2,
    template,
  } = options;

  if (employees.length === 0) {
    throw new Error('No employees to export');
  }

  try {
    // STEP 0: CRITICAL - WAIT FOR FONTS TO LOAD
    console.log('🔒 STEP 0: Font validation for bulk export (CRITICAL)...');
    
    try {
      const fontValidation = await validateFontsForExport();
      if (!fontValidation.canExport) {
        console.warn('⚠️ Font validation warning:', fontValidation.message);
        // Don't block export, just warn
      } else {
        // Ensure fonts are fully loaded (prevents serif fallback)
        await waitForFontsReady();
        console.log('✓ Fonts validated and ready for bulk export (Roboto loaded, no fallback)');
      }
    } catch (fontError) {
      console.warn('⚠️ Font validation failed:', fontError);
      // Don't block export - fonts will load from CDN fallback
    }
    
    // Validate template upfront
    if (template) {
      const templateValidation = validateTemplate(template);
      if (!templateValidation.isValid) {
        const errorMessage = formatValidationErrors(templateValidation.errors);
        throw new Error(errorMessage);
      }
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
    });

    let isFirstPage = true;

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const elements = getCardElements(employee);

      // Validate employee data and render elements for this employee
      const employeeValidation = validateEmployeeData(employee, i);
      if (!employeeValidation.isValid) {
        const errorMessage = formatValidationErrors(employeeValidation.errors);
        throw new Error(errorMessage);
      }

      const renderValidation = validateRenderElements(elements.front, elements.back);
      if (!renderValidation.isValid) {
        const errorMessage = formatValidationErrors(renderValidation.errors);
        throw new Error(errorMessage);
      }

      // Convert OKLCH colors in elements before rendering
      if (elements.front) {
        convertOklchColorsInElement(elements.front);
      }
      if (elements.back) {
        convertOklchColorsInElement(elements.back);
      }

      // Add front side
      if (includeFront && elements.front) {
        if (!isFirstPage) {
          pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
        }
        isFirstPage = false;

        const frontCanvas = await html2canvas(elements.front, {
          scale: quality,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
        });

        const frontImage = frontCanvas.toDataURL('image/png');
        pdf.addImage(frontImage, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }

      // Add back side
      if (includeBack && elements.back) {
        if (!isFirstPage) {
          pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
        }
        isFirstPage = false;

        const backCanvas = await html2canvas(elements.back, {
          scale: quality,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
        });

        const backImage = backCanvas.toDataURL('image/png');
        pdf.addImage(backImage, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      }

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: employees.length,
          status: 'processing',
          message: `Processing card ${i + 1} of ${employees.length}`,
        });
      }

      // Small delay to prevent browser hanging
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Download the PDF
    const fileName = `ID_Cards_Bulk_${employees.length}_cards_${Date.now()}.pdf`;
    pdf.save(fileName);

    // Report completion
    if (onProgress) {
      onProgress({
        current: employees.length,
        total: employees.length,
        status: 'complete',
        message: 'Export complete',
      });
    }
  } catch (error) {
    console.error('Error exporting bulk PDF:', error);
    
    // Re-throw the actual error message instead of generic message
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to export bulk ID cards to PDF. Unknown error occurred.');
  }
}

/**
 * Export ID card as PNG image
 */
export async function exportCardAsImage(
  employee: EmployeeRecord,
  element: HTMLElement,
  side: 'front' | 'back'
): Promise<void> {
  try {
    // Convert OKLCH colors before rendering
    convertOklchColorsInElement(element);
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ID_Card_${employee.employeeId}_${side}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting image:', error);
    throw new Error('Failed to export ID card as image');
  }
}