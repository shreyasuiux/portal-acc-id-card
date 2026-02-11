/**
 * 🔒 FONT PRELOADER - CRITICAL FOR PDF EXPORT CONSISTENCY
 * 
 * ⚠️ PRODUCTION FIX:
 * Ensures Roboto fonts are FULLY LOADED before PDF generation starts.
 * Prevents serif fallback (Image 2 style) and ensures clean Roboto (Image 1 style).
 * 
 * CRITICAL RULES:
 * 1. Wait for document.fonts.ready
 * 2. Verify all Roboto weights loaded
 * 3. Block PDF export if fonts not ready
 * 4. Show error if font loading fails
 */

export interface FontLoadStatus {
  loaded: boolean;
  ready: boolean;
  weights: {
    [key: number]: boolean;
  };
  totalFonts: number;
  message: string;
}

/**
 * Roboto font weights used in ID cards
 */
const REQUIRED_WEIGHTS = [400, 500, 700];

/**
 * Check if document.fonts API is available
 */
export function isFontAPIAvailable(): boolean {
  return typeof document !== 'undefined' && 'fonts' in document;
}

/**
 * Wait for ALL fonts to be ready
 * This is CRITICAL before PDF generation
 */
export async function waitForFontsReady(): Promise<void> {
  console.log('⏳ Waiting for fonts to load...');
  
  if (!isFontAPIAvailable()) {
    console.warn('⚠️ Font Loading API not available - proceeding without font check');
    // Wait 2 seconds as fallback
    await new Promise(resolve => setTimeout(resolve, 2000));
    return;
  }
  
  try {
    // Wait for all fonts to finish loading
    await document.fonts.ready;
    console.log('✅ All fonts loaded and ready');
  } catch (error) {
    console.error('❌ Font loading error:', error);
    throw new Error('Failed to load fonts. Please refresh and try again.');
  }
}

/**
 * Verify Roboto font is loaded for a specific weight
 */
export function isRobotoLoaded(weight: number = 400): boolean {
  if (!isFontAPIAvailable()) {
    return false;
  }
  
  const testText = 'Test';
  const testSize = '16px';
  const fontString = `${weight} ${testSize} Roboto`;
  
  return document.fonts.check(fontString);
}

/**
 * Get comprehensive font load status
 */
export function getFontLoadStatus(): FontLoadStatus {
  if (!isFontAPIAvailable()) {
    return {
      loaded: false,
      ready: false,
      weights: {},
      totalFonts: 0,
      message: 'Font API not available',
    };
  }
  
  const weights: { [key: number]: boolean } = {};
  let allLoaded = true;
  
  // Check each required weight
  for (const weight of REQUIRED_WEIGHTS) {
    const loaded = isRobotoLoaded(weight);
    weights[weight] = loaded;
    
    if (!loaded) {
      allLoaded = false;
      console.warn(`⚠️ Roboto ${weight} not loaded`);
    }
  }
  
  const ready = document.fonts.status === 'loaded';
  
  return {
    loaded: allLoaded,
    ready,
    weights,
    totalFonts: document.fonts.size,
    message: allLoaded && ready 
      ? 'All fonts ready' 
      : 'Some fonts not loaded',
  };
}

/**
 * Preload all Roboto fonts
 * Call this at app startup
 */
export async function preloadRobotoFonts(): Promise<void> {
  console.log('🔄 Preloading Roboto fonts...');
  
  if (!isFontAPIAvailable()) {
    console.warn('⚠️ Font API not available - skipping preload');
    return;
  }
  
  try {
    // Load all required weights
    const loadPromises = REQUIRED_WEIGHTS.map(weight => {
      const fontString = `${weight} 16px Roboto`;
      console.log(`  Loading: ${fontString}`);
      return document.fonts.load(fontString);
    });
    
    await Promise.all(loadPromises);
    
    // Wait for fonts to be fully ready
    await document.fonts.ready;
    
    console.log('✅ Roboto fonts preloaded successfully');
    
    // Verify all weights loaded
    const status = getFontLoadStatus();
    if (!status.loaded) {
      console.error('❌ Some fonts failed to load:', status);
      throw new Error('Font loading incomplete');
    }
    
  } catch (error) {
    console.error('❌ Font preloading failed:', error);
    throw error;
  }
}

/**
 * CRITICAL: Validate fonts before PDF export
 * Blocks export if fonts not ready
 */
export async function validateFontsForExport(): Promise<{
  canExport: boolean;
  message: string;
}> {
  console.log('🔍 Validating fonts for PDF export...');
  
  // Check if Font API is available
  if (!isFontAPIAvailable()) {
    return {
      canExport: false,
      message: 'Font API not available. Cannot guarantee font consistency.',
    };
  }
  
  // Check font status
  const status = getFontLoadStatus();
  
  // If not loaded, try waiting
  if (!status.loaded || !status.ready) {
    console.log('⏳ Fonts not ready, waiting...');
    
    try {
      await waitForFontsReady();
      
      // Recheck status
      const newStatus = getFontLoadStatus();
      
      if (!newStatus.loaded || !newStatus.ready) {
        return {
          canExport: false,
          message: 'Fonts are still loading. Please wait a moment and try again.',
        };
      }
      
    } catch (error) {
      return {
        canExport: false,
        message: 'Font loading failed. Please refresh the page and try again.',
      };
    }
  }
  
  // All good!
  console.log('✅ Fonts validated - ready for export');
  return {
    canExport: true,
    message: 'Fonts ready',
  };
}

/**
 * Get font loading progress (0-100)
 */
export function getFontLoadingProgress(): number {
  if (!isFontAPIAvailable()) {
    return 0;
  }
  
  const status = getFontLoadStatus();
  const loadedWeights = Object.values(status.weights).filter(Boolean).length;
  const totalWeights = REQUIRED_WEIGHTS.length;
  
  return Math.round((loadedWeights / totalWeights) * 100);
}

/**
 * Listen for font load events
 */
export function onFontsLoaded(callback: () => void): void {
  if (!isFontAPIAvailable()) {
    // Call immediately if API not available
    callback();
    return;
  }
  
  document.fonts.ready.then(() => {
    console.log('🎉 Fonts loaded event fired');
    callback();
  });
}

/**
 * Force font re-render (fixes Safari font caching issues)
 */
export function forceFontRerender(): void {
  // Trigger reflow
  document.body.style.fontFamily = 'Roboto, sans-serif';
  
  // Force redraw
  void document.body.offsetHeight;
  
  console.log('🔄 Forced font re-render');
}
