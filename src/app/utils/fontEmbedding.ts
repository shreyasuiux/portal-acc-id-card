/**
 * FONT EMBEDDING SYSTEM
 * 
 * Resolves and embeds Roboto font directly from Google Fonts registry.
 * NO font substitution allowed.
 * 
 * CRITICAL RULES:
 * - Fonts loaded directly from Google Fonts CDN
 * - Roboto embedded in PDF explicitly
 * - No system font fallbacks
 * - Preview and Export use identical font data
 */

// Google Fonts API endpoint
const GOOGLE_FONTS_API = 'https://fonts.googleapis.com/css2';

// Roboto font configuration
const ROBOTO_FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  bold: 700,
};

interface FontFaceData {
  family: string;
  weight: number;
  style: string;
  url: string;
  format: string;
  data?: ArrayBuffer;
  base64?: string;
}

/**
 * Font embedding cache
 * Stores loaded font data for reuse
 */
class FontEmbeddingCache {
  private cache: Map<string, FontFaceData> = new Map();
  private loadingPromises: Map<string, Promise<FontFaceData>> = new Map();

  getCacheKey(family: string, weight: number): string {
    return `${family}-${weight}`;
  }

  get(family: string, weight: number): FontFaceData | undefined {
    return this.cache.get(this.getCacheKey(family, weight));
  }

  set(family: string, weight: number, data: FontFaceData): void {
    this.cache.set(this.getCacheKey(family, weight), data);
  }

  getLoadingPromise(family: string, weight: number): Promise<FontFaceData> | undefined {
    return this.loadingPromises.get(this.getCacheKey(family, weight));
  }

  setLoadingPromise(family: string, weight: number, promise: Promise<FontFaceData>): void {
    this.loadingPromises.set(this.getCacheKey(family, weight), promise);
  }

  clearLoadingPromise(family: string, weight: number): void {
    this.loadingPromises.delete(this.getCacheKey(family, weight));
  }

  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

const fontCache = new FontEmbeddingCache();

/**
 * Parse Google Fonts CSS to extract font URLs
 */
function parseFontCSS(css: string): Array<{ url: string; format: string }> {
  const fontUrls: Array<{ url: string; format: string }> = [];
  
  // Match @font-face rules
  const fontFaceRegex = /@font-face\s*{([^}]+)}/g;
  let match;

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const fontFaceContent = match[1];
    
    // Extract URL and format
    const urlMatch = fontFaceContent.match(/url\(([^)]+)\)\s+format\(['"]([^'"]+)['"]\)/);
    if (urlMatch) {
      fontUrls.push({
        url: urlMatch[1],
        format: urlMatch[2],
      });
    }
  }

  return fontUrls;
}

/**
 * Load Roboto font from Google Fonts
 * Downloads font file and converts to base64
 */
async function loadRobotoFont(weight: number): Promise<FontFaceData> {
  console.log(`📦 Loading Roboto font (weight: ${weight}) from Google Fonts...`);

  try {
    // Step 1: Get CSS from Google Fonts
    const fontUrl = `${GOOGLE_FONTS_API}?family=Roboto:wght@${weight}&display=swap`;
    const cssResponse = await fetch(fontUrl);
    
    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch font CSS: ${cssResponse.statusText}`);
    }

    const cssText = await cssResponse.text();
    console.log(`✓ Fetched Roboto CSS for weight ${weight}`);

    // Step 2: Parse CSS to get font file URL
    const fontUrls = parseFontCSS(cssText);
    
    if (fontUrls.length === 0) {
      throw new Error('No font URLs found in Google Fonts CSS');
    }

    // Prefer woff2 format (best compression)
    const woff2Font = fontUrls.find(f => f.format === 'woff2');
    const selectedFont = woff2Font || fontUrls[0];

    console.log(`✓ Found font URL: ${selectedFont.url.substring(0, 50)}...`);

    // Step 3: Download font file
    const fontResponse = await fetch(selectedFont.url);
    
    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file: ${fontResponse.statusText}`);
    }

    const fontData = await fontResponse.arrayBuffer();
    console.log(`✓ Downloaded Roboto font (${(fontData.byteLength / 1024).toFixed(1)} KB)`);

    // Step 4: Convert to base64
    const base64 = arrayBufferToBase64(fontData);

    const fontFaceData: FontFaceData = {
      family: 'Roboto',
      weight,
      style: 'normal',
      url: selectedFont.url,
      format: selectedFont.format,
      data: fontData,
      base64,
    };

    console.log(`✅ Roboto font loaded successfully (weight: ${weight})`);
    return fontFaceData;

  } catch (error) {
    console.error(`❌ Failed to load Roboto font (weight: ${weight}):`, error);
    throw new Error(`Font loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * Get or load Roboto font with caching
 */
export async function getRobotoFont(weight: number = 400): Promise<FontFaceData> {
  // Check cache first
  const cached = fontCache.get('Roboto', weight);
  if (cached) {
    console.log(`✓ Using cached Roboto font (weight: ${weight})`);
    return cached;
  }

  // Check if already loading
  const loadingPromise = fontCache.getLoadingPromise('Roboto', weight);
  if (loadingPromise) {
    console.log(`⏳ Waiting for Roboto font to load (weight: ${weight})...`);
    return loadingPromise;
  }

  // Load font
  const promise = loadRobotoFont(weight);
  fontCache.setLoadingPromise('Roboto', weight, promise);

  try {
    const fontData = await promise;
    fontCache.set('Roboto', weight, fontData);
    fontCache.clearLoadingPromise('Roboto', weight);
    return fontData;
  } catch (error) {
    fontCache.clearLoadingPromise('Roboto', weight);
    throw error;
  }
}

/**
 * Preload all Roboto font weights
 * Call this on app initialization
 */
export async function preloadRobotoFonts(): Promise<void> {
  console.log('🔄 Preloading Roboto fonts...');
  
  const weights = Object.values(ROBOTO_FONT_WEIGHTS);
  const startTime = performance.now();

  try {
    await Promise.all(weights.map(weight => getRobotoFont(weight)));
    
    const duration = performance.now() - startTime;
    console.log(`✅ All Roboto fonts preloaded (${duration.toFixed(0)}ms)`);
    console.log(`   Regular (400), Medium (500), Bold (700)`);
  } catch (error) {
    console.error('❌ Failed to preload Roboto fonts:', error);
    throw error;
  }
}

/**
 * Embed Roboto font in jsPDF document
 * Adds font file to PDF and registers it
 */
export async function embedRobotoInPDF(
  pdf: any, // jsPDF instance
  weight: number = 400
): Promise<void> {
  console.log(`📄 Embedding Roboto font in PDF (weight: ${weight})...`);

  try {
    // Get font data
    const fontData = await getRobotoFont(weight);

    if (!fontData.base64) {
      throw new Error('Font base64 data not available');
    }

    // Determine font style name
    let fontStyle = 'normal';
    if (weight === 700) {
      fontStyle = 'bold';
    } else if (weight === 500) {
      fontStyle = 'medium';
    }

    // Add font to PDF
    // Note: jsPDF's addFileToVFS and addFont methods
    const fontName = `Roboto-${weight}`;
    const fontFileName = `${fontName}.ttf`;

    // Add font file to virtual file system
    pdf.addFileToVFS(fontFileName, fontData.base64);

    // Register font
    pdf.addFont(fontFileName, 'Roboto', fontStyle);

    console.log(`✅ Roboto font embedded in PDF (${fontStyle})`);

  } catch (error) {
    console.error('❌ Failed to embed Roboto font in PDF:', error);
    throw error;
  }
}

/**
 * Ensure fonts are loaded in the browser
 * This preloads fonts for both preview and export
 */
export async function ensureFontsLoaded(): Promise<void> {
  console.log('🔍 Checking font availability...');

  // Check if document.fonts API is available
  if (!document.fonts) {
    console.warn('⚠️  Font Loading API not available');
    return;
  }

  try {
    // Load Roboto fonts in browser
    const weights = Object.values(ROBOTO_FONT_WEIGHTS);
    const loadPromises = weights.map(weight => 
      document.fonts.load(`${weight} 16px Roboto`)
    );

    await Promise.all(loadPromises);
    console.log('✅ Roboto fonts loaded in browser');

    // Verify fonts are available
    const ready = await document.fonts.ready;
    console.log(`✓ Font system ready (${document.fonts.size} fonts available)`);

  } catch (error) {
    console.error('❌ Failed to load fonts in browser:', error);
  }
}

/**
 * Get font face CSS for embedding
 * Generates @font-face CSS with embedded font data
 */
export async function getRobotoFontFaceCSS(weight: number = 400): Promise<string> {
  const fontData = await getRobotoFont(weight);
  
  const format = fontData.format === 'woff2' ? 'woff2' : 'woff';
  const dataUrl = `data:font/${format};base64,${fontData.base64}`;

  return `
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: ${weight};
  src: url('${dataUrl}') format('${format}');
}
`.trim();
}

/**
 * Clear font cache
 * Use for testing or memory management
 */
export function clearFontCache(): void {
  fontCache.clear();
  console.log('🗑️  Font cache cleared');
}

/**
 * Font Embedding Status
 */
export interface FontEmbeddingStatus {
  loaded: boolean;
  weights: number[];
  totalSize: number;
  errors: string[];
}

/**
 * Get font embedding status
 */
export function getFontEmbeddingStatus(): FontEmbeddingStatus {
  const weights = Object.values(ROBOTO_FONT_WEIGHTS);
  const status: FontEmbeddingStatus = {
    loaded: false,
    weights: [],
    totalSize: 0,
    errors: [],
  };

  for (const weight of weights) {
    const cached = fontCache.get('Roboto', weight);
    if (cached) {
      status.weights.push(weight);
      if (cached.data) {
        status.totalSize += cached.data.byteLength;
      }
    }
  }

  status.loaded = status.weights.length === weights.length;

  return status;
}

// Export constants
export const ROBOTO_WEIGHTS = ROBOTO_FONT_WEIGHTS;
