/**
 * SMART FACE-CENTERED PHOTO POSITIONING FOR ID CARDS
 * 
 * Frame specs: 640×800 px HIGH-RES (stored size for print quality)
 * Display: 64×80 px (scaled down in preview)
 * Strategy: Face-centered crop with cover fit
 * Fallback: Center crop if face detection unavailable
 */

export interface PhotoPosition {
  objectFit: 'cover' | 'contain';
  objectPosition: string;
  transform?: string;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate optimal photo position for face-centered crop
 * 
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param faceBox - Detected face bounding box (optional)
 * @returns CSS positioning styles
 */
export function calculatePhotoPosition(
  imageWidth: number,
  imageHeight: number,
  faceBox?: FaceBox | null
): PhotoPosition {
  // Frame dimensions (fixed)
  const FRAME_WIDTH = 64;
  const FRAME_HEIGHT = 80;
  const FRAME_ASPECT = FRAME_WIDTH / FRAME_HEIGHT; // 0.8 (portrait)
  
  const imageAspect = imageWidth / imageHeight;
  
  // If face is detected, use smart positioning
  if (faceBox) {
    return calculateFaceCenteredPosition(imageWidth, imageHeight, faceBox, FRAME_WIDTH, FRAME_HEIGHT);
  }
  
  // FALLBACK: Center crop strategy
  // Always use cover to fill frame completely
  if (imageAspect > FRAME_ASPECT) {
    // Image is wider than frame - crop sides, position center
    return {
      objectFit: 'cover',
      objectPosition: 'center 25%', // Slightly upper for better portrait framing
    };
  } else {
    // Image is taller than frame - crop top/bottom, position upper-center
    return {
      objectFit: 'cover',
      objectPosition: 'center 20%', // Position face in upper portion
    };
  }
}

/**
 * Calculate face-centered position with intelligent crop
 */
function calculateFaceCenteredPosition(
  imageWidth: number,
  imageHeight: number,
  faceBox: FaceBox,
  frameWidth: number,
  frameHeight: number
): PhotoPosition {
  // Calculate face center
  const faceCenterX = faceBox.x + faceBox.width / 2;
  const faceCenterY = faceBox.y + faceBox.height / 2;
  
  // Convert to percentage of image
  const faceCenterXPercent = (faceCenterX / imageWidth) * 100;
  const faceCenterYPercent = (faceCenterY / imageHeight) * 100;
  
  // Target positioning:
  // X: Center face horizontally in frame (50%)
  // Y: Position face slightly upper-middle (35-40% from top)
  // This ensures head is visible while allowing shoulder crop
  
  // Calculate optimal Y offset
  // Target: 10-14% top padding from frame top
  const targetTopPadding = 12; // 12% of frame height
  const targetYPosition = targetTopPadding + (faceBox.height / imageHeight * 100) / 2;
  
  // Ensure face doesn't go out of bounds
  const minY = 10; // Don't position too high
  const maxY = 60; // Don't position too low
  const adjustedY = Math.max(minY, Math.min(maxY, targetYPosition));
  
  return {
    objectFit: 'cover',
    objectPosition: `${faceCenterXPercent}% ${adjustedY}%`,
  };
}

/**
 * Simple face detection using browser's experimental Face Detection API
 * Falls back to center positioning if unavailable
 * 
 * @param imageUrl - Base64 or URL of image
 * @returns Promise with face bounding box or null
 */
export async function detectFace(imageUrl: string): Promise<FaceBox | null> {
  try {
    // Check if Face Detection API is available
    // @ts-ignore - Experimental API
    if (!window.FaceDetector) {
      console.log('Face Detection API not available - using center fallback');
      return null;
    }
    
    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // @ts-ignore - Experimental API
    const faceDetector = new FaceDetector({
      maxDetectedFaces: 1,
      fastMode: true,
    });
    
    const faces = await faceDetector.detect(img);
    
    if (faces && faces.length > 0) {
      const face = faces[0];
      const box = face.boundingBox;
      
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }
    
    return null;
  } catch (error) {
    console.log('Face detection failed, using center fallback:', error);
    return null;
  }
}

/**
 * Get optimal photo styles for ID card photo frame
 * This is the main function to use in components
 * 
 * @param imageUrl - Employee photo URL
 * @param enableFaceDetection - Whether to attempt face detection
 * @returns Promise with CSS styles object
 */
export async function getOptimalPhotoStyles(
  imageUrl: string,
  enableFaceDetection = false
): Promise<PhotoPosition> {
  try {
    // Load image to get dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;
    
    // Attempt face detection if enabled
    let faceBox: FaceBox | null = null;
    if (enableFaceDetection) {
      faceBox = await detectFace(imageUrl);
    }
    
    return calculatePhotoPosition(imageWidth, imageHeight, faceBox);
  } catch (error) {
    console.error('Error calculating photo position:', error);
    
    // Ultimate fallback
    return {
      objectFit: 'cover',
      objectPosition: 'center 25%',
    };
  }
}

/**
 * Synchronous version for immediate rendering
 * Uses intelligent defaults based on aspect ratio
 */
export function getDefaultPhotoStyles(): PhotoPosition {
  return {
    objectFit: 'cover',
    objectPosition: 'center 25%', // Upper-center for portrait framing
  };
}