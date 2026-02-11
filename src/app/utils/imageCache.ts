/**
 * 🎯 HIGH-RESOLUTION IMAGE CACHE SYSTEM
 * 
 * CRITICAL FOR PRODUCTION QUALITY:
 * This cache stores processed, high-resolution images to prevent:
 * 1. Re-processing background removal (slow + quality loss)
 * 2. Re-encoding images multiple times (quality loss)
 * 3. Canvas-based compression (Safari quality loss)
 * 4. Multiple base64 conversions (memory waste)
 * 
 * GUARANTEE:
 * - Background removal runs ONLY ONCE per image
 * - Processed image stored at ORIGINAL HIGH RESOLUTION
 * - Export uses cached high-res image (no re-processing)
 * - Same quality in preview, export, and after deployment
 * 
 * SAFARI FIX:
 * - Uses Blob storage instead of repeated base64 conversions
 * - Object URLs for efficient rendering
 * - Binary embedding for PDF export
 */

/**
 * Cached image data structure
 */
interface CachedImageData {
  // Original processed file (with background removed, HIGH-RES)
  originalBlob: Blob;
  
  // High-resolution base64 (1280×1600px) - for storage/export
  highResBase64: string;
  
  // Object URL for efficient rendering (Safari optimization)
  objectUrl: string;
  
  // Metadata
  width: number;
  height: number;
  processedAt: number;
  
  // Quality tracking
  hadTransparentBackground: boolean; // Was already transparent (no processing needed)
  qualityLevel: 'original' | 'processed'; // Track if we did background removal
}

/**
 * Global image cache
 * Key: employeeId or unique image identifier
 * Value: Cached high-res image data
 */
const imageCache = new Map<string, CachedImageData>();

/**
 * Store processed image in cache
 * This should be called ONCE after background removal + cropping
 * 
 * @param key - Unique identifier (employeeId)
 * @param blob - The processed image blob (HIGH-RES, background removed)
 * @param base64 - High-res base64 string (1280×1600px)
 * @param metadata - Additional metadata
 */
export function cacheProcessedImage(
  key: string,
  blob: Blob,
  base64: string,
  metadata: {
    width: number;
    height: number;
    hadTransparentBackground?: boolean;
    qualityLevel?: 'original' | 'processed';
  }
): void {
  // Revoke old object URL if exists
  const existing = imageCache.get(key);
  if (existing) {
    URL.revokeObjectURL(existing.objectUrl);
  }
  
  // Create new object URL (Safari optimization)
  const objectUrl = URL.createObjectURL(blob);
  
  // Store in cache
  imageCache.set(key, {
    originalBlob: blob,
    highResBase64: base64,
    objectUrl,
    width: metadata.width,
    height: metadata.height,
    processedAt: Date.now(),
    hadTransparentBackground: metadata.hadTransparentBackground || false,
    qualityLevel: metadata.qualityLevel || 'processed',
  });
  
  console.log(`📦 Image cached for key: ${key}`);
  console.log(`   Size: ${metadata.width}×${metadata.height}px`);
  console.log(`   Quality: ${metadata.qualityLevel}`);
  console.log(`   Background: ${metadata.hadTransparentBackground ? 'Already transparent' : 'Removed'}`);
}

/**
 * Get cached image data
 * Returns null if not found - caller should process and cache
 */
export function getCachedImage(key: string): CachedImageData | null {
  const cached = imageCache.get(key);
  
  if (cached) {
    console.log(`✅ Image cache HIT for key: ${key}`);
    return cached;
  }
  
  console.log(`❌ Image cache MISS for key: ${key}`);
  return null;
}

/**
 * Check if image is cached
 */
export function isImageCached(key: string): boolean {
  return imageCache.has(key);
}

/**
 * Get high-res base64 from cache
 * This is what should be used for storage and export
 */
export function getCachedBase64(key: string): string | null {
  const cached = imageCache.get(key);
  return cached ? cached.highResBase64 : null;
}

/**
 * Get object URL from cache (for rendering in UI)
 * This is faster than base64 in Safari
 */
export function getCachedObjectUrl(key: string): string | null {
  const cached = imageCache.get(key);
  return cached ? cached.objectUrl : null;
}

/**
 * Get original blob from cache (for PDF export)
 * This avoids re-encoding and preserves maximum quality
 */
export function getCachedBlob(key: string): Blob | null {
  const cached = imageCache.get(key);
  return cached ? cached.originalBlob : null;
}

/**
 * Remove image from cache and clean up resources
 */
export function removeCachedImage(key: string): void {
  const cached = imageCache.get(key);
  if (cached) {
    URL.revokeObjectURL(cached.objectUrl);
    imageCache.delete(key);
    console.log(`🗑️ Image cache cleared for key: ${key}`);
  }
}

/**
 * Clear entire cache (call on app unmount or when clearing all data)
 */
export function clearImageCache(): void {
  imageCache.forEach((data) => {
    URL.revokeObjectURL(data.objectUrl);
  });
  imageCache.clear();
  console.log('🧹 Entire image cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalImages: number;
  totalSize: number; // Approximate size in bytes
  oldestImage: number | null; // Timestamp
  newestImage: number | null; // Timestamp
} {
  const images = Array.from(imageCache.values());
  
  return {
    totalImages: images.length,
    totalSize: images.reduce((sum, img) => sum + img.highResBase64.length, 0),
    oldestImage: images.length > 0 ? Math.min(...images.map(img => img.processedAt)) : null,
    newestImage: images.length > 0 ? Math.max(...images.map(img => img.processedAt)) : null,
  };
}

/**
 * Convert File/Blob to high-quality base64
 * Used when initially storing processed images
 * 
 * @param blob - The image blob
 * @param quality - JPEG quality (1.0 = maximum, only for JPEGs)
 * @returns Promise<string> - Base64 data URL
 */
export async function blobToBase64(
  blob: Blob,
  quality: number = 1.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 to Blob (for caching)
 * 
 * @param base64 - Base64 data URL
 * @returns Blob
 */
export function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Get image dimensions from base64
 * 
 * @param base64 - Base64 data URL
 * @returns Promise<{width: number, height: number}>
 */
export async function getBase64Dimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
}

/**
 * SMART CACHE WRAPPER: Process image only if not cached
 * 
 * This is the main function to use for photo uploads:
 * 1. Check cache first
 * 2. If cached, return immediately (no processing)
 * 3. If not cached, process and cache
 * 
 * @param employeeId - Unique employee identifier
 * @param file - Image file to process
 * @param processFunc - Function to process image (background removal + cropping)
 * @returns Promise<string> - High-res base64
 */
export async function getOrProcessImage(
  employeeId: string,
  file: File,
  processFunc: (file: File) => Promise<{ blob: Blob; base64: string; metadata: any }>
): Promise<string> {
  // Check cache first
  const cached = getCachedImage(employeeId);
  if (cached) {
    console.log('✅ Using cached image (no re-processing)');
    return cached.highResBase64;
  }
  
  // Not cached - process image
  console.log('🔄 Image not cached - processing...');
  const result = await processFunc(file);
  
  // Cache the result
  cacheProcessedImage(employeeId, result.blob, result.base64, result.metadata);
  
  return result.base64;
}

/**
 * Pre-cache image from existing base64
 * Used when loading employees from storage
 * 
 * @param key - Employee ID
 * @param base64 - Existing base64 string
 */
export async function precacheFromBase64(key: string, base64: string): Promise<void> {
  // Don't re-cache if already exists
  if (isImageCached(key)) {
    return;
  }
  
  const blob = base64ToBlob(base64);
  const dimensions = await getBase64Dimensions(base64);
  
  cacheProcessedImage(key, blob, base64, {
    width: dimensions.width,
    height: dimensions.height,
    hadTransparentBackground: false,
    qualityLevel: 'processed',
  });
  
  console.log(`📦 Pre-cached image for key: ${key}`);
}
