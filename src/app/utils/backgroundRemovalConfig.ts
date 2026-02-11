/**
 * ⚠️ DEPLOYMENT FIX: Background Removal Configuration
 * 
 * This configuration is specifically designed to work in PRODUCTION/DEPLOYED environments
 * Not just in Figma Make, but also when published to live websites.
 * 
 * Key fixes for deployment:
 * 1. Absolute CDN URLs for all assets
 * 2. CORS-enabled fetch configuration
 * 3. Single-threaded mode (no SharedArrayBuffer needed)
 * 4. Proper WASM path configuration
 */

// CRITICAL: Configure ONNX Runtime BEFORE any library imports
if (typeof window !== 'undefined') {
  console.log('🚀 Configuring ONNX Runtime for PRODUCTION deployment...');
  
  // Initialize ort namespace
  (window as any).ort = (window as any).ort || {};
  (window as any).ort.env = (window as any).ort.env || {};
  (window as any).ort.env.wasm = (window as any).ort.env.wasm || {};
  
  // ⚠️ DEPLOYMENT FIX #1: Force single-threaded mode
  (window as any).ort.env.wasm.numThreads = 1;
  (window as any).ort.env.wasm.simd = true; // Keep SIMD for performance
  (window as any).ort.env.wasm.proxy = false; // Disable worker proxy
  
  // ⚠️ DEPLOYMENT FIX #2: Absolute CDN URLs for WASM files
  // These work in production/deployed environments
  (window as any).ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
  
  // Alternative: Specify individual files
  (window as any).ort.env.wasm.wasmBinary = undefined; // Let it load from CDN
  
  // ⚠️ DEPLOYMENT FIX #3: Set base path for all ONNX assets
  try {
    (window as any).ort.env.wasm.wasmPaths = {
      'ort-wasm.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort-wasm.wasm',
      'ort-wasm-simd.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort-wasm-simd.wasm',
      'ort-wasm-threaded.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort-wasm-threaded.wasm',
    };
  } catch (e) {
    console.warn('Could not set individual WASM paths, using base path');
  }
  
  // Also set generic environment variables
  (window as any).ENV = (window as any).ENV || {};
  (window as any).ENV.WASM_NUM_THREADS = 1;
  
  console.log('✓ ONNX Runtime configured for PRODUCTION');
  console.log('  - Single-threaded mode: ON');
  console.log('  - SIMD acceleration: ON');
  console.log('  - CDN delivery: ON');
  console.log('  - WASM base: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/');
}

let isConfigured = false;

/**
 * Configure @imgly/background-removal library for production deployment
 * 
 * This function sets up the library to work reliably in deployed/live environments
 */
export async function configureBackgroundRemoval() {
  if (isConfigured) {
    console.log('✓ Background removal already configured');
    return;
  }

  console.log('⚙️ Configuring background removal for PRODUCTION...');

  try {
    // Set environment variables before importing the library
    if (typeof window !== 'undefined') {
      // Force single-threaded mode
      (window as any).ENV = (window as any).ENV || {};
      (window as any).ENV.WASM_NUM_THREADS = 1;
      
      // ⚠️ DEPLOYMENT FIX #4: Set publicPath globally
      (window as any).__BACKGROUND_REMOVAL_PUBLIC_PATH__ = 
        'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/';
    }
    
    // Try to import and configure the library
    try {
      const bgRemoval = await import('@imgly/background-removal');
      
      // ⚠️ DEPLOYMENT FIX #5: Configure with absolute CDN paths
      if (bgRemoval.Config && typeof bgRemoval.Config.set === 'function') {
        bgRemoval.Config.set({
          // CRITICAL: Absolute CDN path for model files
          publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
          
          // Use CPU for cross-browser compatibility
          device: 'cpu',
          
          // Force single thread (no SharedArrayBuffer needed)
          numThreads: 1,
          
          // Disable debug output in production
          debug: false,
          
          // ⚠️ DEPLOYMENT FIX #6: CORS-enabled fetch configuration
          fetchArgs: {
            mode: 'cors', // Enable CORS for CDN
            cache: 'force-cache', // Cache model downloads
            credentials: 'omit', // No credentials needed for CDN
          },
          
          // Progress tracking
          progress: (key: string, current: number, total: number) => {
            if (key === 'fetch:model') {
              const progress = (current / total) * 100;
              console.log(`📥 Downloading AI model: ${progress.toFixed(0)}%`);
            } else if (key === 'compute:inference') {
              const progress = (current / total) * 100;
              console.log(`🤖 Processing: ${progress.toFixed(0)}%`);
            }
          },
        });
        
        console.log('✓ Background removal library configured');
        console.log('  - Model path: CDN (absolute URL)');
        console.log('  - Device: CPU');
        console.log('  - Threads: 1 (production-safe)');
        console.log('  - CORS: Enabled');
      } else {
        console.log('⚠️ Config.set not available, using default settings');
      }
      
      // ⚠️ DEPLOYMENT FIX #7: Try to preload the model
      if (typeof (bgRemoval as any).preload === 'function') {
        try {
          console.log('📥 Preloading AI model from CDN...');
          await (bgRemoval as any).preload({
            model: 'medium', // Medium model for best quality
            publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
          });
          console.log('✓ AI model preloaded successfully');
        } catch (preloadError) {
          console.log('⚠️ Preload not available, will load on first use');
        }
      }
    } catch (configError) {
      console.warn('⚠️ Could not configure library, using defaults:', configError);
    }

    isConfigured = true;
    console.log('✅ Background removal ready for PRODUCTION');
    
  } catch (error) {
    console.error('❌ Failed to configure background removal:', error);
    isConfigured = true; // Mark as configured to avoid repeated attempts
    throw error;
  }
}

/**
 * ⚠️ DEPLOYMENT CHECKLIST:
 * 
 * When you deploy/publish your website, make sure:
 * 
 * 1. ✅ This configuration file loads BEFORE any background removal
 * 2. ✅ Your hosting allows loading assets from CDN (jsdelivr.net)
 * 3. ✅ CORS is not blocked by your hosting provider
 * 4. ✅ Your build process doesn't try to bundle WASM files
 * 5. ✅ Browser console shows "ONNX Runtime configured for PRODUCTION"
 * 
 * Common deployment issues:
 * - Model files 404: Check CDN URLs are accessible
 * - CORS errors: Check browser console, might need CDN fallback
 * - WASM errors: Check if hosting blocks WebAssembly
 * - Slow loading: First load downloads model (~20MB), cached after
 * 
 * Debug in production:
 * Open browser console and look for:
 * - "✓ ONNX Runtime configured for PRODUCTION"
 * - "📥 Downloading AI model: X%"
 * - "🤖 Processing: X%"
 * 
 * If you see errors, check:
 * 1. Network tab: Are CDN requests succeeding?
 * 2. Console tab: Any CORS or security errors?
 * 3. Application tab: Is the model cached?
 */
