import JSZip from 'jszip';

/**
 * Generate a sample ZIP file with dummy employee photos
 * Each image filename matches the corresponding Employee ID from the sample CSV
 */

interface SampleEmployee {
  employeeId: string;
  name: string;
}

/**
 * Generate a placeholder image for an employee
 */
function generatePlaceholderImage(employeeId: string, name: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 500);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 500);

    // Add geometric pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(200, 250, 30 + i * 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Avatar circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(200, 180, 80, 0, Math.PI * 2);
    ctx.fill();

    // Avatar icon (simple person silhouette)
    ctx.fillStyle = '#667eea';
    // Head
    ctx.beginPath();
    ctx.arc(200, 160, 30, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.arc(200, 220, 50, 0, Math.PI, true);
    ctx.fill();

    // Employee ID badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(50, 300, 300, 60);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 300, 300, 60);

    // Employee ID text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(employeeId, 200, 330);

    // Employee name
    ctx.font = '16px Roboto';
    ctx.fillStyle = '#475569';
    ctx.fillText(name, 200, 355);

    // Sample watermark
    ctx.font = 'bold 14px Roboto';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('SAMPLE PHOTO', 200, 450);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

/**
 * Generate and download sample ZIP file with employee photos
 */
export async function generateAndDownloadSampleZip(): Promise<void> {
  // Sample employees matching the CSV
  const sampleEmployees: SampleEmployee[] = [
    { employeeId: '24EMP001', name: 'John Smith' },
    { employeeId: '24EMP002', name: 'Sarah Johnson' },
    { employeeId: '24EMP003', name: 'Michael Brown' },
    { employeeId: '24EMP004', name: 'Emily Davis' },
    { employeeId: '15EMP005', name: 'David Wilson' },
    { employeeId: '15EMP006', name: 'Lisa Anderson' },
    { employeeId: '22EMP007', name: 'James Martinez' },
    { employeeId: '22EMP008', name: 'Jennifer Taylor' },
    { employeeId: '23EMP009', name: 'Robert Lee' },
    { employeeId: '23EMP010', name: 'Mary White' },
  ];

  console.log('📸 Generating sample employee photos...');

  try {
    // Create ZIP instance
    const zip = new JSZip();

    // Generate all images
    for (const employee of sampleEmployees) {
      console.log(`   Creating image for ${employee.employeeId}...`);
      const imageBlob = await generatePlaceholderImage(employee.employeeId, employee.name);
      
      // Add to ZIP with filename matching Employee ID
      zip.file(`${employee.employeeId}.jpg`, imageBlob);
    }

    console.log('✅ All sample photos generated');
    console.log('📦 Creating ZIP file...');

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(zipBlob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_photos_sample.zip');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);

    console.log('✅ Sample ZIP downloaded successfully');
  } catch (error) {
    console.error('❌ Failed to generate sample ZIP:', error);
    throw new Error('Failed to generate sample ZIP file');
  }
}

/**
 * Get list of sample Employee IDs for reference
 */
export function getSampleEmployeeIds(): string[] {
  return [
    '24EMP001',
    '24EMP002',
    '24EMP003',
    '24EMP004',
    '15EMP005',
    '15EMP006',
    '22EMP007',
    '22EMP008',
    '23EMP009',
    '23EMP010',
  ];
}