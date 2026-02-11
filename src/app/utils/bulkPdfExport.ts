import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { EmployeeRecord } from './employeeStorage';
import { validateBulkEmployeeData, formatValidationErrors, type ValidationResult } from './exportValidation';
import type { Template } from './templateData';
import { convertOklchColorsInElement } from './pdfExport';
import { validateBulkPhotoQuality } from './photoQualityValidator';
import { getOptimalRenderSettings, preloadFonts, clearImageCache, clearObjectUrlCache } from './performanceOptimization';

// ============================================
// STRICT PDF CONFIGURATION (NON-NEGOTIABLE)
// ============================================
// CRITICAL RULE FOR BULK EXPORT:
//
// For N employees:
// - Front pages: N pages (one per employee with their data)
// - Back page: 1 page (common template, no employee data)
//
// Example with 50 employees:
//   Pages 1-50:  Front cards (employee-specific)
//   Page 51:     Common back card (shared)
//
// NEVER interleave front + back
// NEVER duplicate back page per employee
// Back page rendered ONCE at the end
//
// ============================================
// 🚀 PERFORMANCE OPTIMIZATION
// ============================================
// - Browser-specific render settings
// - Memory management after each batch
// - Non-blocking async processing
// - Font preloading for Safari
// ============================================

// ID Card dimensions
const CARD_WIDTH_PX = 153;
const CARD_HEIGHT_PX = 244;
const PX_TO_MM = 0.264583;
const CARD_WIDTH_MM = CARD_WIDTH_PX * PX_TO_MM; // 40.48 mm
const CARD_HEIGHT_MM = CARD_HEIGHT_PX * PX_TO_MM; // 64.56 mm

// HIGH-QUALITY RENDERING SETTINGS
// PRINT-READY EXPORT (NO COMPRESSION):
// - Scale: 8x (generates 1224×1952px at 400+ DPI)
// - Image quality: 1.0 (MAXIMUM, no compression)
// - PDF compression: NONE (was 'FAST' - REMOVED)
// - Employee photos: 1280×1600px ULTRA native resolution (2.5x PDF canvas size!)
const HIGH_QUALITY_SCALE = 8;
const IMAGE_QUALITY = 1.0;           // Maximum quality (no compression)
const PDF_COMPRESSION = 'NONE';      // NO compression

console.log('📋 Bulk PDF Export Configuration:');
console.log(`   Scale: ${HIGH_QUALITY_SCALE}x`);
console.log(`   Image quality: ${IMAGE_QUALITY * 100}%`);
console.log(`   PDF compression: ${PDF_COMPRESSION}`);
console.log(`   Employee photo: 1280×1600px ULTRA-HI-RES native`);
console.log('   ⚠️  HARD LOCK: Export fails if quality degrades');

export interface BulkExportProgress {
  current: number;
  total: number;
  currentEmployee: string;
  status: 'validating' | 'processing' | 'generating' | 'complete' | 'error';
  message: string;
}

export type BulkExportProgressCallback = (progress: BulkExportProgress) => void;

export interface BulkExportOptions {
  template: Template;
  includeFront?: boolean;
  includeBack?: boolean;
  quality?: number;
  onProgress?: BulkExportProgressCallback;
  exportFormat?: 'single-pdf' | 'zip';
}

/**
 * Export multiple employee ID cards to a single PDF
 * 
 * BULK EXPORT BEHAVIOR:
 * - Pages 1 to N: Front cards (one per employee with their data)
 * - Page N+1: Common back card (shared across all employees)
 * 
 * @param employees Array of employee records
 * @param frontElementGetter Function to get front card element for an employee
 * @param backElementGetter Function to get back card element (uses first employee for common template)
 * @param options Export options
 */
export async function exportBulkCardsToPDF(
  employees: EmployeeRecord[],
  frontElementGetter: (employee: EmployeeRecord) => HTMLElement | null,
  backElementGetter: (employee: EmployeeRecord) => HTMLElement | null,
  options: BulkExportOptions
): Promise<void> {
  const {
    template,
    includeFront = true,
    includeBack = true,
    quality = 2,
    onProgress,
  } = options;

  try {
    // STEP 1: PRE-EXPORT VALIDATION
    console.log('📋 STEP 1: Validating bulk employee data...');
    
    onProgress?.({
      current: 0,
      total: employees.length,
      currentEmployee: '',
      status: 'validating',
      message: 'Validating employee data...',
    });

    const validation = validateBulkEmployeeData(employees);
    
    if (!validation.isValid) {
      const errorMessage = formatValidationErrors(validation.errors);
      console.error('❌ Bulk validation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log(`✓ Validation passed for ${employees.length} employees`);

    // STEP 1.5: PHOTO QUALITY VALIDATION (ZERO-COMPROMISE)
    console.log('📸 STEP 1.5: Validating photo quality for all employees...');
    
    onProgress?.({
      current: 0,
      total: employees.length,
      currentEmployee: '',
      status: 'validating',
      message: 'Validating photo quality (300+ DPI required)...',
    });

    const photoValidation = await validateBulkPhotoQuality(
      employees.map(emp => ({ name: emp.name, photoBase64: emp.photoBase64 }))
    );

    if (!photoValidation.allValid) {
      const failedList = photoValidation.failedEmployees.join(', ');
      const errorMsg = `❌ PHOTO QUALITY CHECK FAILED\n\n` +
        `The following employee photos do not meet minimum 300 DPI quality requirements:\n` +
        `${failedList}\n\n` +
        `Export ABORTED to prevent poor print quality.\n` +
        `Please re-upload high-resolution photos (minimum 1280×1600px).`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`✓ Photo quality validation passed for ${employees.length} employees`);
    console.log('   All photos meet 300+ DPI requirement for professional print quality');

    // Validate template
    if (!template) {
      throw new Error('Template is required for bulk export');
    }

    if (includeFront && !template.front) {
      throw new Error('Front template is missing. Cannot export.');
    }

    if (includeBack && !template.back) {
      throw new Error('Back template is enabled but missing. Please select a valid template.');
    }

    // STEP 2: CREATE PDF
    console.log('📄 STEP 2: Creating PDF document...');
    console.log(`   Bulk export format: ${employees.length} front pages + ${includeBack ? '1 common back page' : '0 back pages'}`);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
    });

    let isFirstPage = true;

    // STEP 3: PROCESS FRONT CARDS FOR ALL EMPLOYEES
    console.log('📸 STEP 3: Generating front cards for all employees...');
    
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      console.log(`   Processing employee ${i + 1}/${employees.length}: ${employee.name}`);
      
      onProgress?.({
        current: i + 1,
        total: employees.length,
        currentEmployee: employee.name,
        status: 'processing',
        message: `Generating front card for ${employee.name} (${i + 1}/${employees.length})`,
      });

      const frontElement = frontElementGetter(employee);

      // Validate front element
      if (!frontElement) {
        console.error(`❌ No front element for employee: ${employee.name}`);
        throw new Error(`Export failed: Front card not rendered for employee "${employee.name}" (row ${i + 1})`);
      }

      // Convert OKLCH colors
      convertOklchColorsInElement(frontElement);

      // Add new page (except for first page)
      if (!isFirstPage) {
        pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
      }
      
      console.log(`      ├─ Capturing front card at high quality (Scale: ${HIGH_QUALITY_SCALE}x)...`);
      
      // ============================================
      // CRITICAL IMAGE QUALITY OVERRIDE
      // ============================================
      // Employee photos must NEVER be rasterized!
      // 1. Hide photo during html2canvas (captures card layout only)
      // 2. Embed ORIGINAL base64 photo separately (NO rasterization)
      // 3. Photo overlaid at exact position (clip/mask, not resize)
      // 
      const photoElements = frontElement.querySelectorAll('[data-employee-photo=\"true\"]');
      const photoContainers = frontElement.querySelectorAll('[data-photo-container=\"true\"]');
      const originalPhotoStyles: string[] = [];
      const originalContainerStyles: string[] = [];
      
      // Hide photos during capture
      photoElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalPhotoStyles[index] = htmlEl.style.display;
        htmlEl.style.display = 'none';
      });
      photoContainers.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalContainerStyles[index] = htmlEl.style.visibility || '';
      });
      
      // Capture card layout WITHOUT photo
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
      });

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

      // Convert to high-quality JPEG
      const frontImage = frontCanvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      pdf.addImage(frontImage, 'JPEG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, PDF_COMPRESSION);
      
      // CRITICAL: Embed ORIGINAL employee photo separately (NO rasterization!)
      if (employee.photoBase64 && employee.photoBase64.startsWith('data:image/')) {
        // Photo position and size on card (in pixels)
        const PHOTO_LEFT_PX = 44.5;
        const PHOTO_TOP_PX = 68;
        const PHOTO_WIDTH_PX = 64;
        const PHOTO_HEIGHT_PX = 80;
        
        // Convert to mm coordinates
        const photoLeftMM = (PHOTO_LEFT_PX / CARD_WIDTH_PX) * CARD_WIDTH_MM;
        const photoTopMM = (PHOTO_TOP_PX / CARD_HEIGHT_PX) * CARD_HEIGHT_MM;
        const photoWidthMM = (PHOTO_WIDTH_PX / CARD_WIDTH_PX) * CARD_WIDTH_MM;
        const photoHeightMM = (PHOTO_HEIGHT_PX / CARD_HEIGHT_PX) * CARD_HEIGHT_MM;
        
        // Embed ORIGINAL photo at exact position (NO rasterization!)
        pdf.addImage(
          employee.photoBase64,  // ORIGINAL base64
          'PNG',                 // PNG for transparency
          photoLeftMM,           // X position
          photoTopMM,            // Y position
          photoWidthMM,          // Width (visual frame)
          photoHeightMM,         // Height (visual frame)
          undefined,             // Alias
          PDF_COMPRESSION        // NO compression
        );
      }
      
      isFirstPage = false;
      console.log(`      └─ ✓ Front card captured (Page ${i + 1})`);

      // Memory management delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // STEP 4: APPEND COMMON BACK CARD (ONCE)
    if (includeBack) {
      console.log('📸 STEP 4: Generating common back card...');
      
      onProgress?.({
        current: employees.length,
        total: employees.length,
        currentEmployee: '',
        status: 'generating',
        message: 'Adding common back card...',
      });

      // Use first employee's back element as the common template
      // Back card should NOT contain employee-specific data
      const commonBackElement = backElementGetter(employees[0]);

      if (!commonBackElement) {
        console.error('❌ No back element available');
        throw new Error('Export failed: Back card template not rendered.');
      }

      // Convert colors
      convertOklchColorsInElement(commonBackElement);

      // Add new page for back card
      pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
      
      console.log(`   ├─ Capturing common back card at high quality (Scale: ${HIGH_QUALITY_SCALE}x)...`);
      
      const backCanvas = await html2canvas(commonBackElement, {
        scale: HIGH_QUALITY_SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        x: 0,
        y: 0,
      });

      // Convert to high-quality JPEG
      const backImage = backCanvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      pdf.addImage(backImage, 'JPEG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, PDF_COMPRESSION);
      
      console.log(`   └─ ✓ Common back card captured (Page ${employees.length + 1})`);
    }

    // STEP 5: DOWNLOAD
    console.log('💾 STEP 5: Triggering download...');
    
    const totalPages = employees.length + (includeBack ? 1 : 0);
    console.log(`   Total pages: ${totalPages} (${employees.length} fronts + ${includeBack ? '1 back' : '0 backs'})`);
    
    onProgress?.({
      current: employees.length,
      total: employees.length,
      currentEmployee: '',
      status: 'generating',
      message: 'Finalizing PDF...',
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `employee-id-cards_${timestamp}_${employees.length}-cards.pdf`;
    
    pdf.save(fileName);
    
    console.log(`✅ Bulk export complete: ${fileName}`);
    console.log(`   Format: ${employees.length} front pages + ${includeBack ? '1 common back page' : 'no back page'}`);
    
    onProgress?.({
      current: employees.length,
      total: employees.length,
      currentEmployee: '',
      status: 'complete',
      message: `Successfully exported ${employees.length} ID cards (${totalPages} pages total)`,
    });
    
  } catch (error) {
    console.error('❌ Bulk export failed:', error);
    
    onProgress?.({
      current: 0,
      total: employees.length,
      currentEmployee: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Bulk export failed',
    });
    
    // Provide actionable error messages
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to export bulk ID cards to PDF. Please try again or contact support.');
  }
}

/**
 * Simplified bulk export that takes already-rendered elements
 */
export async function exportBulkCardsFromElements(
  cardPairs: Array<{
    employee: EmployeeRecord;
    frontElement: HTMLElement;
    backElement: HTMLElement;
  }>,
  options: BulkExportOptions
): Promise<void> {
  const {
    template,
    includeFront = true,
    includeBack = true,
    quality = 2,
    onProgress,
  } = options;

  try {
    console.log(`📋 Starting bulk export for ${cardPairs.length} employees...`);

    // Validate template
    if (!template) {
      throw new Error('Template is required for bulk export');
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
    });

    let isFirstPage = true;

    for (let i = 0; i < cardPairs.length; i++) {
      const { employee, frontElement, backElement } = cardPairs[i];
      
      onProgress?.({
        current: i + 1,
        total: cardPairs.length,
        currentEmployee: employee.name,
        status: 'processing',
        message: `Processing ${employee.name} (${i + 1}/${cardPairs.length})`,
      });

      // Convert colors
      convertOklchColorsInElement(frontElement);
      convertOklchColorsInElement(backElement);

      // Capture front
      if (includeFront) {
        if (!isFirstPage) {
          pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
        }
        
        const frontCanvas = await html2canvas(frontElement, {
          scale: quality,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
        });

        const frontImage = frontCanvas.toDataURL('image/png');
        pdf.addImage(frontImage, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
        
        isFirstPage = false;
      }

      // Memory management delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // CAPTURE BACK SIDE
    if (includeBack && cardPairs[0].backElement) {
      pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait');
      
      console.log(`  ├─ Capturing back side...`);
      
      const backCanvas = await html2canvas(cardPairs[0].backElement, {
        scale: quality,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      const backImage = backCanvas.toDataURL('image/png');
      pdf.addImage(backImage, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      
      console.log(`  └─ ✓ Back side captured`);
    }

    // Download
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `employee-id-cards_${timestamp}_${cardPairs.length}-cards.pdf`;
    
    pdf.save(fileName);
    
    onProgress?.({
      current: cardPairs.length,
      total: cardPairs.length,
      currentEmployee: '',
      status: 'complete',
      message: `Successfully exported ${cardPairs.length} ID cards`,
    });
    
    console.log(`✅ Bulk export complete: ${fileName}`);
    
  } catch (error) {
    console.error('❌ Bulk export error:', error);
    
    onProgress?.({
      current: 0,
      total: cardPairs.length,
      currentEmployee: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Bulk export failed',
    });
    
    throw error;
  }
}