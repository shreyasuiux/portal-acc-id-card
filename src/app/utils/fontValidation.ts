/**
 * FONT LOCK CONFIGURATION
 * 
 * STRICT RULES:
 * - ONLY Google Font "Roboto" is allowed
 * - NO fallback fonts (sans-serif, Arial, Helvetica, system-ui, etc.)
 * - NO mixed font stacks
 * - NO system fonts
 * 
 * If any non-Roboto font is detected:
 * - Block generation
 * - Block publish
 * - Throw an error
 */

// Allowed font configuration
export const ALLOWED_FONT = 'Roboto';
export const ALLOWED_FONT_WEIGHTS = [400, 500, 700]; // Regular, Medium, Bold

// Blocked fonts and patterns
const BLOCKED_FONTS = [
  'Arial',
  'Helvetica',
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Ubuntu',
  'Cantarell',
  'Noto Sans',
  'Open Sans',
  'Helvetica Neue',
  'Times New Roman',
  'Georgia',
  'Courier',
];

// Font validation error class
export class FontValidationError extends Error {
  constructor(message: string, public detectedFont: string, public location: string) {
    super(message);
    this.name = 'FontValidationError';
  }
}

/**
 * Validate font family string
 * @param fontFamily - Font family string to validate
 * @param location - Location identifier for error reporting
 * @throws FontValidationError if invalid font detected
 */
export function validateFontFamily(fontFamily: string, location: string): void {
  if (!fontFamily) {
    throw new FontValidationError(
      'Font family is required',
      'undefined',
      location
    );
  }

  // Clean the font family string
  const cleanFont = fontFamily.trim().replace(/['"]/g, '');

  // Check if it's exactly "Roboto" (case-insensitive)
  if (cleanFont.toLowerCase() !== 'roboto') {
    throw new FontValidationError(
      `FONT LOCK VIOLATION: Only "Roboto" is allowed. Found: "${cleanFont}" at ${location}`,
      cleanFont,
      location
    );
  }

  // Check for blocked fonts in the string
  for (const blocked of BLOCKED_FONTS) {
    if (fontFamily.toLowerCase().includes(blocked.toLowerCase())) {
      throw new FontValidationError(
        `FONT LOCK VIOLATION: Blocked font "${blocked}" detected in "${fontFamily}" at ${location}`,
        blocked,
        location
      );
    }
  }

  console.log(`✅ Font validation passed: "${fontFamily}" at ${location}`);
}

/**
 * Validate canvas font string
 * @param canvasFont - Canvas font string (e.g., "bold 18px Roboto")
 * @param location - Location identifier for error reporting
 * @throws FontValidationError if invalid font detected
 */
export function validateCanvasFont(canvasFont: string, location: string): void {
  if (!canvasFont) {
    throw new FontValidationError(
      'Canvas font string is required',
      'undefined',
      location
    );
  }

  // Extract font family from canvas font string
  // Format: "[style] [weight] [size] [family]"
  const parts = canvasFont.split(' ');
  const fontFamily = parts[parts.length - 1];

  validateFontFamily(fontFamily, `${location} (canvas)`);

  // Check for blocked fonts anywhere in the string
  for (const blocked of BLOCKED_FONTS) {
    if (canvasFont.toLowerCase().includes(blocked.toLowerCase())) {
      throw new FontValidationError(
        `FONT LOCK VIOLATION: Blocked font "${blocked}" detected in canvas font "${canvasFont}" at ${location}`,
        blocked,
        location
      );
    }
  }
}

/**
 * Validate all fonts in a component's style object
 * @param styles - React style object
 * @param componentName - Name of the component for error reporting
 * @throws FontValidationError if invalid font detected
 */
export function validateComponentStyles(
  styles: React.CSSProperties,
  componentName: string
): void {
  if (styles.fontFamily) {
    validateFontFamily(
      typeof styles.fontFamily === 'string' ? styles.fontFamily : String(styles.fontFamily),
      componentName
    );
  }
}

/**
 * Scan DOM for non-Roboto fonts (development mode only)
 * This runs in the browser and blocks publish if violations are found
 */
export function scanDOMForFontViolations(): {
  isValid: boolean;
  violations: Array<{ element: string; font: string; location: string }>;
} {
  const violations: Array<{ element: string; font: string; location: string }> = [];

  try {
    // Get all elements
    const allElements = document.querySelectorAll('*');

    allElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;

      if (!fontFamily) return;

      // Clean font family string
      const cleanFont = fontFamily.toLowerCase().replace(/['"]/g, '').trim();

      // Check if it starts with "roboto" (it might be "roboto, ..." in computed styles)
      if (!cleanFont.startsWith('roboto')) {
        violations.push({
          element: element.tagName.toLowerCase(),
          font: fontFamily,
          location: `DOM element #${index}: ${element.className || element.id || 'unknown'}`,
        });
      }

      // Check for explicitly blocked fonts
      for (const blocked of BLOCKED_FONTS) {
        if (cleanFont.includes(blocked.toLowerCase()) && blocked.toLowerCase() !== 'roboto') {
          violations.push({
            element: element.tagName.toLowerCase(),
            font: fontFamily,
            location: `DOM element #${index}: ${element.className || element.id || 'unknown'} (blocked: ${blocked})`,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error scanning DOM for font violations:', error);
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Pre-export font validation
 * Call this before any export operation
 * @throws FontValidationError if violations are found
 */
export function validateFontsBeforeExport(): void {
  console.log('🔒 FONT LOCK: Running pre-export validation...');

  const { isValid, violations } = scanDOMForFontViolations();

  if (!isValid) {
    const violationReport = violations
      .map((v) => `  ❌ ${v.location}\n     Found: "${v.font}"`)
      .join('\n');

    const errorMessage = `
╔════════════════════════════════════════════════════════════╗
║           FONT LOCK VIOLATION - EXPORT BLOCKED            ║
╚════════════════════════════════════════════════════════════╝

🚫 CRITICAL: Non-Roboto fonts detected in the document!

VIOLATIONS FOUND (${violations.length}):
${violationReport}

ALLOWED FONT: Roboto (Google Font)
BLOCKED FONTS: ${BLOCKED_FONTS.join(', ')}

🔧 FIX REQUIRED:
1. Remove all non-Roboto font references
2. Update fontFamily to 'Roboto' (no fallbacks)
3. Re-run export after fixes

Export operation has been BLOCKED.
`;

    throw new FontValidationError(errorMessage, 'multiple', 'pre-export-validation');
  }

  console.log('✅ FONT LOCK: All fonts validated successfully');
  console.log(`✅ Using: ${ALLOWED_FONT} (Google Font)`);
  console.log('✅ Export operation approved');
}

/**
 * Validate font configuration on app initialization
 */
export function initializeFontLock(): void {
  console.log('🔒 FONT LOCK: Initializing...');
  console.log(`✅ Allowed Font: ${ALLOWED_FONT}`);
  console.log(`✅ Allowed Weights: ${ALLOWED_FONT_WEIGHTS.join(', ')}`);
  console.log(`🚫 Blocked Fonts: ${BLOCKED_FONTS.length} patterns`);
  console.log('✅ Font Lock initialized successfully');

  // Warn if CSS variables contain blocked fonts
  if (typeof window !== 'undefined') {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const fontFamily = rootStyles.fontFamily;
    
    if (fontFamily && !fontFamily.toLowerCase().includes('roboto')) {
      console.error('⚠️  WARNING: Root font-family does not include Roboto:', fontFamily);
    }
  }
}

// Export validation functions
export const FontLock = {
  ALLOWED_FONT,
  ALLOWED_FONT_WEIGHTS,
  BLOCKED_FONTS,
  validateFontFamily,
  validateCanvasFont,
  validateComponentStyles,
  validateFontsBeforeExport,
  scanDOMForFontViolations,
  initializeFontLock,
};
