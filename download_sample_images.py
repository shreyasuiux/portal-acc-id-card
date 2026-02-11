#!/usr/bin/env python3
"""
Sample Employee Image Downloader
Downloads 10 professional headshot images and creates a ZIP file
with filenames matching the sample CSV Employee IDs
"""

import os
import zipfile
import urllib.request
from pathlib import Path

# Employee data with image URLs
EMPLOYEES = [
    {
        'id': '24EMP001',
        'name': 'John Smith',
        'url': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '24EMP002',
        'name': 'Sarah Johnson',
        'url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '24EMP003',
        'name': 'Michael Brown',
        'url': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '24EMP004',
        'name': 'Emily Davis',
        'url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '15EMP005',
        'name': 'David Wilson',
        'url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '15EMP006',
        'name': 'Lisa Anderson',
        'url': 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '22EMP007',
        'name': 'James Martinez',
        'url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '22EMP008',
        'name': 'Jennifer Taylor',
        'url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '23EMP009',
        'name': 'Robert Lee',
        'url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&q=80'
    },
    {
        'id': '23EMP010',
        'name': 'Mary White',
        'url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&q=80'
    }
]

def download_images():
    """Download all sample employee images"""
    
    # Create temp directory for images
    temp_dir = Path('temp_employee_photos')
    temp_dir.mkdir(exist_ok=True)
    
    print('📸 Downloading Sample Employee Images...\n')
    
    downloaded_files = []
    
    for employee in EMPLOYEES:
        emp_id = employee['id']
        emp_name = employee['name']
        url = employee['url']
        filename = f"{emp_id}.jpg"
        filepath = temp_dir / filename
        
        try:
            print(f'⬇️  Downloading {emp_name} ({emp_id})...')
            
            # Set user agent to avoid 403 errors
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req) as response:
                with open(filepath, 'wb') as out_file:
                    out_file.write(response.read())
            
            downloaded_files.append(filepath)
            print(f'   ✅ Saved as {filename}')
            
        except Exception as e:
            print(f'   ❌ Error downloading {emp_name}: {str(e)}')
    
    return temp_dir, downloaded_files

def create_zip(temp_dir, downloaded_files):
    """Create ZIP file from downloaded images"""
    
    if not downloaded_files:
        print('\n❌ No images downloaded. Cannot create ZIP file.')
        return
    
    zip_filename = 'employee_photos.zip'
    
    print(f'\n📦 Creating ZIP file: {zip_filename}...')
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for filepath in downloaded_files:
            # Add file to ZIP with just the filename (no path)
            zipf.write(filepath, filepath.name)
            print(f'   📎 Added {filepath.name}')
    
    print(f'\n✅ ZIP file created successfully!')
    print(f'📍 Location: {os.path.abspath(zip_filename)}')
    print(f'📊 Total images: {len(downloaded_files)}/{len(EMPLOYEES)}')

def cleanup(temp_dir):
    """Remove temporary directory"""
    
    print(f'\n🧹 Cleaning up temporary files...')
    
    try:
        for file in temp_dir.glob('*'):
            file.unlink()
        temp_dir.rmdir()
        print('   ✅ Cleanup complete')
    except Exception as e:
        print(f'   ⚠️  Cleanup warning: {str(e)}')

def main():
    """Main execution function"""
    
    print('=' * 60)
    print('🎯 HR ID Card Generator - Sample Image Downloader')
    print('=' * 60)
    print()
    
    try:
        # Step 1: Download images
        temp_dir, downloaded_files = download_images()
        
        if not downloaded_files:
            print('\n❌ Failed to download any images.')
            return
        
        # Step 2: Create ZIP file
        create_zip(temp_dir, downloaded_files)
        
        # Step 3: Cleanup
        cleanup(temp_dir)
        
        # Final instructions
        print('\n' + '=' * 60)
        print('✨ SUCCESS! Your sample photo ZIP is ready!')
        print('=' * 60)
        print('\n📋 Next Steps:')
        print('   1. Download the sample CSV from the app')
        print('   2. Upload the CSV file')
        print('   3. Upload the employee_photos.zip file')
        print('   4. Generate bulk ID cards!')
        print('\n💡 Tip: The ZIP contains images named by Employee ID')
        print('   (24EMP001.jpg, 24EMP002.jpg, etc.)')
        print()
        
    except KeyboardInterrupt:
        print('\n\n⚠️  Download cancelled by user.')
    except Exception as e:
        print(f'\n❌ An error occurred: {str(e)}')

if __name__ == '__main__':
    main()
