// ============================================
// SAMPLE PHOTO GENERATOR
// ============================================
// Generates professional sample employee photos
// for employees who don't have photos uploaded
// ============================================

// Professional sample employee headshots from Unsplash
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1758599543154-76ec1c4257df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMzQwMjUxfDA&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1758518729459-235dcaadc611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc3dvbWFuJTIwaGVhZHNob3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAyNTA3MDd8MA&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1603252112050-5ee77b4b4fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbGUlMjBleGVjdXRpdmUlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzAzNTM0NDF8MA&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1758691737610-1f18e008f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGZlbWFsZSUyMGV4ZWN1dGl2ZSUyMGhlYWRzaG90fGVufDF8fHx8MTc3MDM1MzQ0MXww&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1644269444230-c6d1f2722e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBlbXBsb3llZSUyMHBvcnRyYWl0JTIwbWFsZXxlbnwxfHx8fDE3NzAzNTM0NDJ8MA&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1758691737605-69a0e78bd193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBlbXBsb3llZSUyMHBvcnRyYWl0JTIwZmVtYWxlfGVufDF8fHx8MTc3MDM1MzQ0Mnww&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1719108249136-3155cad6d5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdGFmZiUyMGhlYWRzaG90JTIwbWFufGVufDF8fHx8MTc3MDM1MzQ0Mnww&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1608611239479-6f43deec2fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdGFmZiUyMGhlYWRzaG90JTIwd29tYW58ZW58MXx8fHwxNzcwMzUzNDQzfDA&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1701463206030-fd8a77b61698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwbWFsZSUyMGFzaWFufGVufDF8fHx8MTc3MDM1MzQ0M3ww&ixlib=rb-4.1.0&q=80&w=400',
  'https://images.unsplash.com/photo-1761125050322-bbfc155571bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwZmVtYWxlJTIwaW5kaWFufGVufDF8fHx8MTc3MDM1MzQ0M3ww&ixlib=rb-4.1.0&q=80&w=400',
];

/**
 * Get a sample photo for an employee based on their ID
 * Uses consistent assignment so same ID always gets same photo
 */
export function getSamplePhoto(employeeId: string): string {
  // Use employee ID to consistently assign same photo
  const hash = employeeId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % SAMPLE_PHOTOS.length;
  return SAMPLE_PHOTOS[index];
}

/**
 * Convert image URL to base64 data URL
 */
export async function urlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert URL to base64:', error);
    throw error;
  }
}

/**
 * Generate a sample photo base64 for an employee
 * This is used when no photo is uploaded
 */
export async function generateSamplePhotoBase64(employeeId: string): Promise<string> {
  const photoUrl = getSamplePhoto(employeeId);
  
  try {
    return await urlToBase64(photoUrl);
  } catch (error) {
    console.error(`Failed to generate sample photo for ${employeeId}:`, error);
    // Return a placeholder data URL if fetch fails
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQaG90bzwvdGV4dD48L3N2Zz4=';
  }
}

/**
 * Get all sample photos as array
 */
export function getAllSamplePhotos(): string[] {
  return [...SAMPLE_PHOTOS];
}

/**
 * Get random sample photo
 */
export function getRandomSamplePhoto(): string {
  return SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
}
