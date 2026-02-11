# 📸 Sample Employee Images Guide

## Overview
This guide provides instructions for creating a ZIP file with sample employee photos that match the CSV format used in the bulk upload feature.

---

## 📋 Sample CSV Data

The sample CSV file contains the following employees:

| Employee Name    | Employee ID | Mobile Number | Blood Group | Joining Date | Valid Till   |
|-----------------|-------------|---------------|-------------|--------------|--------------|
| John Smith      | 24EMP001    | 9876543210    | A+          | 01/01/2024   | 31/12/2030   |
| Sarah Johnson   | 24EMP002    | 9876543211    | B+          | 15/01/2024   | 31/12/2030   |
| Michael Brown   | 24EMP003    | 9876543212    | O+          | 02/02/2024   | 31/12/2030   |
| Emily Davis     | 24EMP004    | 9876543213    | AB+         | 12/02/2024   | 31/12/2030   |
| David Wilson    | 15EMP005    | 9876543214    | A-          | 22/02/2024   | 31/12/2030   |
| Lisa Anderson   | 15EMP006    | 9876543215    | B-          | 05/03/2024   | 31/12/2030   |
| James Martinez  | 22EMP007    | 9876543216    | O-          | 18/03/2024   | 31/12/2030   |
| Jennifer Taylor | 22EMP008    | 9876543217    | AB-         | 25/03/2024   | 31/12/2030   |
| Robert Lee      | 23EMP009    | 9876543218    | A+          | 03/04/2024   | 31/12/2030   |
| Mary White      | 23EMP010    | 9876543219    | B+          | 14/04/2024   | 31/12/2030   |

---

## 📦 Required ZIP File Structure

### File Naming Convention
Each image file **MUST** be named exactly as the **Employee ID** from the CSV.

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp`

### Example ZIP Contents:
```
employee_photos.zip
├── 24EMP001.jpg    (John Smith's photo)
├── 24EMP002.jpg    (Sarah Johnson's photo)
├── 24EMP003.jpg    (Michael Brown's photo)
├── 24EMP004.jpg    (Emily Davis's photo)
├── 15EMP005.jpg    (David Wilson's photo)
├── 15EMP006.jpg    (Lisa Anderson's photo)
├── 22EMP007.jpg    (James Martinez's photo)
├── 22EMP008.jpg    (Jennifer Taylor's photo)
├── 23EMP009.jpg    (Robert Lee's photo)
└── 23EMP010.jpg    (Mary White's photo)
```

---

## 🎯 Important Rules

### ✅ Correct Format
- ✅ Filename matches Employee ID exactly (case-sensitive)
- ✅ No spaces in filenames
- ✅ Use supported image formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ All files directly in ZIP root (no folders inside)

### ❌ Incorrect Format
- ❌ `john_smith.jpg` - Uses employee name instead of ID
- ❌ `24EMP001 .jpg` - Has space before extension
- ❌ `24emp001.jpg` - Wrong case (must be uppercase)
- ❌ `photos/24EMP001.jpg` - File inside a folder
- ❌ `24EMP001.gif` - Unsupported format

---

## 📸 Sample Image URLs

Use these professional headshot images for testing:

### 1. John Smith (24EMP001.jpg)
**Suggested Image:** Professional male business portrait
- Download URL: https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop

### 2. Sarah Johnson (24EMP002.jpg)
**Suggested Image:** Professional female business portrait
- Download URL: https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop

### 3. Michael Brown (24EMP003.jpg)
**Suggested Image:** Professional male portrait
- Download URL: https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop

### 4. Emily Davis (24EMP004.jpg)
**Suggested Image:** Professional female portrait
- Download URL: https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=500&fit=crop

### 5. David Wilson (15EMP005.jpg)
**Suggested Image:** Professional male portrait
- Download URL: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop

### 6. Lisa Anderson (15EMP006.jpg)
**Suggested Image:** Professional female portrait
- Download URL: https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&h=500&fit=crop

### 7. James Martinez (22EMP007.jpg)
**Suggested Image:** Professional male portrait
- Download URL: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop

### 8. Jennifer Taylor (22EMP008.jpg)
**Suggested Image:** Professional female portrait
- Download URL: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop

### 9. Robert Lee (23EMP009.jpg)
**Suggested Image:** Professional male portrait
- Download URL: https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop

### 10. Mary White (23EMP010.jpg)
**Suggested Image:** Professional female portrait
- Download URL: https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop

---

## 🛠️ How to Create the ZIP File

### Option 1: Manual Creation (Windows)
1. Create a new folder named `employee_photos`
2. Download all 10 images using the URLs above
3. Rename each image to match the Employee ID:
   - First image → `24EMP001.jpg`
   - Second image → `24EMP002.jpg`
   - And so on...
4. Select all images in the folder
5. Right-click → Send to → Compressed (zipped) folder
6. Rename to `employee_photos.zip`

### Option 2: Manual Creation (Mac)
1. Create a new folder named `employee_photos`
2. Download all 10 images using the URLs above
3. Rename each image to match the Employee ID
4. Right-click the folder → Compress "employee_photos"
5. This creates `employee_photos.zip`

### Option 3: Using Command Line (Linux/Mac)
```bash
# Create directory
mkdir employee_photos
cd employee_photos

# Download images (example using curl)
curl -o 24EMP001.jpg "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop"
curl -o 24EMP002.jpg "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop"
# ... download remaining images

# Create ZIP file
cd ..
zip -r employee_photos.zip employee_photos/
```

---

## 🔄 Upload Process

### Step 1: Download Sample CSV
1. Go to **Bulk Upload** mode
2. Click **"Download Sample CSV Template"**
3. Save as `employee_bulk_upload_sample.csv`

### Step 2: Prepare Photo ZIP
1. Create ZIP file with images named as Employee IDs
2. Save as `employee_photos.zip`

### Step 3: Upload Both Files
1. Click **"Upload Data File (CSV/Excel)"**
2. Select `employee_bulk_upload_sample.csv`
3. Wait for validation ✅
4. Click **"Upload Photo ZIP File"**
5. Select `employee_photos.zip`
6. System automatically matches photos to employees

### Step 4: Review & Export
1. Review the **Bulk Employee Manager** table
2. Check that all photos are matched correctly
3. Click **"Generate & Export High-Resolution PDF"**

---

## 💡 Pro Tips

### Image Quality Recommendations
- **Minimum Resolution:** 500 × 500 pixels
- **Recommended:** 1000 × 1000 pixels or higher
- **Format:** JPG for photos (smaller file size)
- **Background:** Plain or professional background (will be auto-removed)

### Common Issues & Solutions

**Issue:** "Photo not found for Employee ID"
- **Solution:** Check filename matches Employee ID exactly

**Issue:** "Invalid image format"
- **Solution:** Convert image to JPG, PNG, or WEBP

**Issue:** "ZIP file too large"
- **Solution:** Compress images before adding to ZIP

**Issue:** "Photos appear in wrong orientation"
- **Solution:** Rotate images before uploading

---

## 📊 Testing the System

### Quick Test (2 employees)
Create a ZIP with just 2 images:
```
test_photos.zip
├── 24EMP001.jpg
└── 24EMP002.jpg
```

Then modify the CSV to include only these 2 employees.

### Full Test (10 employees)
Use all 10 images from the sample URLs above.

---

## 🎓 Best Practices

1. **Consistent Naming:** Always use Employee ID for filenames
2. **Quality Images:** Use high-resolution professional photos
3. **Clean Backgrounds:** Plain backgrounds work best (auto-removed anyway)
4. **Proper Orientation:** Ensure photos are upright
5. **File Size:** Keep individual photos under 5 MB
6. **ZIP Organization:** No subfolders, all images in root

---

## 🚨 Automatic Features

The system automatically:
- ✅ **Removes backgrounds** from uploaded photos
- ✅ **Matches photos** to Employee IDs
- ✅ **Validates formats** and shows warnings
- ✅ **Handles missing photos** gracefully
- ✅ **Optimizes images** for ID card printing

---

## 📞 Support

If you encounter issues:
1. Check filename matches Employee ID exactly
2. Ensure ZIP contains no subfolders
3. Use supported image formats
4. Verify image files are not corrupted

**Need help?** The system shows detailed error messages for:
- Missing photos
- Invalid formats
- Filename mismatches
- ZIP structure issues

---

## ✨ Summary

**Perfect ZIP File Checklist:**
- [ ] Filenames match Employee IDs from CSV
- [ ] Images are JPG, PNG, or WEBP format
- [ ] All files in ZIP root (no folders)
- [ ] High-quality professional photos
- [ ] ZIP file is not corrupted

**Ready to test?** Download the sample CSV, create your photo ZIP, and experience the magic of bulk ID card generation! 🎉
