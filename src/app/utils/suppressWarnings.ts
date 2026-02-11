/**
 * Global warning suppression
 * This must be imported FIRST in the application to catch WASM warnings
 */

// ⚡ CRITICAL: Configure ONNX Runtime IMMEDIATELY before anything else
if (typeof window !== 'undefined') {
  // Set ONNX Runtime environment to force single-threaded mode
  (window as any).ort = (window as any).ort || {};
  (window as any).ort.env = (window as any).ort.env || {};
  (window as any).ort.env.wasm = (window as any).ort.env.wasm || {};
  (window as any).ort.env.wasm.numThreads = 1; // Force single thread
  (window as any).ort.env.wasm.simd = true; // Keep SIMD for performance
  (window as any).ort.env.wasm.proxy = false; // Disable worker proxy
  
  // Also set generic environment variables
  (window as any).ENV = (window as any).ENV || {};
  (window as any).ENV.WASM_NUM_THREADS = 1;
}

// Store original console methods immediately
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

/**
 * Check if a message contains WASM threading warnings
 */
function isWasmWarning(message: string): boolean {
  return (
    message.includes('env.wasm.numThreads') ||
    message.includes('numThreads') ||
    message.includes('crossOriginIsolated') ||
    message.includes('WebAssembly multi-threading') ||
    message.includes('multi-threading is not supported') ||
    message.includes('Falling back to single-threading') ||
    message.includes('will not work unless you enable') ||
    message.includes('cross-origin-isolation') ||
    message.includes('See https://web.dev/cross-origin-isolation-guide') ||
    message.includes('is set to')
  );
}

// Override console.warn globally
console.warn = function(...args: any[]) {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWasmWarning(message)) {
    return; // Suppress WASM warnings
  }
  originalWarn.apply(console, args);
};

// Override console.error globally
console.error = function(...args: any[]) {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWasmWarning(message)) {
    return; // Suppress WASM errors
  }
  originalError.apply(console, args);
};

// Override console.log globally (some libraries log to console.log)
console.log = function(...args: any[]) {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWasmWarning(message)) {
    return; // Suppress WASM logs
  }
  originalLog.apply(console, args);
};

// Log that suppression is active (for debugging)
if (typeof window !== 'undefined') {
  originalLog('🔇 WASM threading warnings suppressed (single-threaded mode active)');
}

export {};