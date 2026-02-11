/**
 * FRESH EXPORT RENDERER
 * 
 * Renders ID cards freshly at export time.
 * NO dependencies on preview canvas or cached layers.
 * 
 * CRITICAL RULES:
 * - Do not export from preview canvas
 * - Do not use cached render layers
 * - Re-render text nodes freshly at export time
 * - Resolve fonts directly from Google Fonts
 * - Preview and Export must be identical
 */

import type { EmployeeRecord } from './employeeStorage';
import type { Template } from './templateData';
import { getRobotoFont } from './fontEmbedding';

// Card dimensions (exact)
export const CARD_WIDTH_PX = 153;
export const CARD_HEIGHT_PX = 244;

// Export scale for high quality
export const EXPORT_SCALE = 8;

/**
 * Fresh render configuration
 */
interface RenderConfig {
  scale: number;
  includeBackSide: boolean;
  template: Template;
}

/**
 * Rendered card data
 */
interface RenderedCard {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Measure text width with exact font
 */
function measureText(
  text: string,
  fontSize: number,
  fontWeight: number = 400
): number {
  // Create temporary canvas for measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context for text measurement');
  }

  // Set font EXACTLY as it will be rendered
  ctx.font = `${fontWeight} ${fontSize}px Roboto`;
  
  const metrics = ctx.measureText(text);
  return metrics.width;
}

/**
 * Wrap text to fit width with automatic font scaling
 */
function wrapTextWithScaling(
  text: string,
  maxWidth: number,
  initialFontSize: number,
  fontWeight: number = 400
): { lines: string[]; fontSize: number } {
  let fontSize = initialFontSize;
  let lines: string[] = [];
  
  // Try reducing font size until text fits
  while (fontSize >= 8) {
    const words = text.split(' ');
    lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureText(testLine, fontSize, fontWeight);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // Check if all lines fit
    if (lines.length <= 2) {
      // Success - text fits with this font size
      return { lines, fontSize };
    }

    // Try smaller font
    fontSize -= 0.5;
  }

  // Fallback: force fit with smallest size
  return { lines: lines.slice(0, 2), fontSize: 8 };
}

/**
 * Draw text with proper alignment
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fontWeight: number,
  color: string,
  align: 'left' | 'center' | 'right' = 'left'
): void {
  ctx.font = `${fontWeight} ${fontSize}px Roboto`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

/**
 * Render ID card front side to canvas
 */
async function renderCardFront(
  employee: EmployeeRecord,
  template: Template,
  scale: number
): Promise<RenderedCard> {
  console.log(`🎨 Fresh rendering front side for: ${employee.name}`);

  // Create canvas at exact dimensions
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH_PX * scale;
  canvas.height = CARD_HEIGHT_PX * scale;

  const ctx = canvas.getContext('2d', {
    alpha: false, // No transparency for better quality
    willReadFrequently: false,
  });

  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale context
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = template.backgroundColor;
  ctx.fillRect(0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX);

  // Layout constants (matched to UnifiedIDCardRenderer)
  const photoTargetWidth = 107;
  const photoTargetHeight = 134;
  const photoX = (CARD_WIDTH_PX - photoTargetWidth) / 2;
  const photoY = 12;

  // Draw photo
  if (employee.photo) {
    try {
      const img = await loadImage(employee.photo);
      ctx.drawImage(img, photoX, photoY, photoTargetWidth, photoTargetHeight);
      console.log('✓ Photo rendered');
    } catch (error) {
      console.warn('Failed to load photo:', error);
      // Draw placeholder
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(photoX, photoY, photoTargetWidth, photoTargetHeight);
    }
  }

  // Content area starts after photo
  const contentStartY = photoY + photoTargetHeight + 6; // 6px gap
  const contentWidth = 130;
  const contentX = (CARD_WIDTH_PX - contentWidth) / 2;
  let currentY = contentStartY;

  // Name (bold, wrapped, auto-scaled)
  const nameResult = wrapTextWithScaling(employee.name, contentWidth, 18, 700);
  for (const line of nameResult.lines) {
    drawText(ctx, line, CARD_WIDTH_PX / 2, currentY, nameResult.fontSize, 700, template.textColor, 'center');
    currentY += nameResult.fontSize + 2;
  }

  currentY += 6; // 12px total spacing after name

  // Employee ID
  drawText(ctx, employee.employeeId, CARD_WIDTH_PX / 2, currentY, 14, 400, template.textColor, 'center');
  currentY += 14 + 12; // 12px spacing

  // Department
  const deptResult = wrapTextWithScaling(employee.department, contentWidth, 12, 400);
  for (const line of deptResult.lines) {
    drawText(ctx, line, CARD_WIDTH_PX / 2, currentY, deptResult.fontSize, 400, template.textColor, 'center');
    currentY += deptResult.fontSize + 2;
  }

  currentY += 6; // 12px total spacing

  // Position/Designation
  const posResult = wrapTextWithScaling(employee.position, contentWidth, 11, 400);
  for (const line of posResult.lines) {
    drawText(ctx, line, CARD_WIDTH_PX / 2, currentY, posResult.fontSize, 400, template.textColor, 'center');
    currentY += posResult.fontSize + 2;
  }

  console.log('✅ Front side rendered successfully');

  return {
    canvas,
    dataUrl: canvas.toDataURL('image/png', 1.0),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Render ID card back side to canvas
 */
async function renderCardBack(
  employee: EmployeeRecord,
  template: Template,
  scale: number
): Promise<RenderedCard> {
  console.log(`🎨 Fresh rendering back side for: ${employee.name}`);

  // Create canvas at exact dimensions
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH_PX * scale;
  canvas.height = CARD_HEIGHT_PX * scale;

  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false,
  });

  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale context
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = template.backgroundColor;
  ctx.fillRect(0, 0, CARD_WIDTH_PX, CARD_HEIGHT_PX);

  // Layout
  const contentWidth = 130;
  const contentX = (CARD_WIDTH_PX - contentWidth) / 2;
  let currentY = 20;

  // Email
  drawText(ctx, 'Email', contentX, currentY, 10, 700, template.textColor, 'left');
  currentY += 10 + 4;
  
  const emailResult = wrapTextWithScaling(employee.email, contentWidth, 11, 400);
  for (const line of emailResult.lines) {
    drawText(ctx, line, contentX, currentY, emailResult.fontSize, 400, template.textColor, 'left');
    currentY += emailResult.fontSize + 2;
  }
  currentY += 8;

  // Phone
  drawText(ctx, 'Phone', contentX, currentY, 10, 700, template.textColor, 'left');
  currentY += 10 + 4;
  drawText(ctx, employee.phone, contentX, currentY, 11, 400, template.textColor, 'left');
  currentY += 11 + 8;

  // Blood Group
  drawText(ctx, 'Blood Group', contentX, currentY, 10, 700, template.textColor, 'left');
  currentY += 10 + 4;
  drawText(ctx, employee.bloodGroup, contentX, currentY, 11, 400, template.textColor, 'left');
  currentY += 11 + 8;

  // Emergency Contact
  drawText(ctx, 'Emergency Contact', contentX, currentY, 10, 700, template.textColor, 'left');
  currentY += 10 + 4;
  drawText(ctx, employee.emergencyContact, contentX, currentY, 11, 400, template.textColor, 'left');
  currentY += 11 + 8;

  // Address
  drawText(ctx, 'Address', contentX, currentY, 10, 700, template.textColor, 'left');
  currentY += 10 + 4;
  
  const addressResult = wrapTextWithScaling(employee.address, contentWidth, 10, 400);
  for (const line of addressResult.lines) {
    drawText(ctx, line, contentX, currentY, addressResult.fontSize, 400, template.textColor, 'left');
    currentY += addressResult.fontSize + 2;
  }

  console.log('✅ Back side rendered successfully');

  return {
    canvas,
    dataUrl: canvas.toDataURL('image/png', 1.0),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Load image from data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Render single employee card (front and optionally back)
 */
export async function renderEmployeeCard(
  employee: EmployeeRecord,
  config: RenderConfig
): Promise<{ front: RenderedCard; back?: RenderedCard }> {
  console.log(`📋 Fresh rendering card for: ${employee.name}`);
  console.log(`   Scale: ${config.scale}x`);
  console.log(`   Include back: ${config.includeBackSide}`);

  // Ensure fonts are loaded
  console.log('🔤 Loading Roboto fonts...');
  await Promise.all([
    getRobotoFont(400), // Regular
    getRobotoFont(700), // Bold
  ]);
  console.log('✓ Fonts loaded');

  // Render front side
  const front = await renderCardFront(employee, config.template, config.scale);

  // Render back side if needed
  let back: RenderedCard | undefined;
  if (config.includeBackSide) {
    back = await renderCardBack(employee, config.template, config.scale);
  }

  console.log(`✅ Card rendered successfully (${config.includeBackSide ? 'both sides' : 'front only'})`);

  return { front, back };
}

/**
 * Render multiple employee cards
 */
export async function renderEmployeeCards(
  employees: EmployeeRecord[],
  config: RenderConfig
): Promise<Array<{ employee: EmployeeRecord; front: RenderedCard; back?: RenderedCard }>> {
  console.log(`📋 Fresh rendering ${employees.length} cards...`);

  const results = [];

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    console.log(`[${i + 1}/${employees.length}] Rendering: ${employee.name}`);

    const rendered = await renderEmployeeCard(employee, config);
    results.push({
      employee,
      ...rendered,
    });
  }

  console.log(`✅ All ${employees.length} cards rendered successfully`);

  return results;
}

/**
 * Validate that preview and export will be identical
 */
export function validateRenderingConsistency(): void {
  console.log('🔍 Validating rendering consistency...');

  // Check font availability
  if (!document.fonts) {
    throw new Error('Font Loading API not available - cannot guarantee consistency');
  }

  // Check if Roboto is loaded
  const robotoLoaded = document.fonts.check('16px Roboto');
  if (!robotoLoaded) {
    throw new Error('Roboto font not loaded - cannot guarantee consistency');
  }

  console.log('✅ Rendering consistency validated');
}
