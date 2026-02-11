# 📦 Sample Data Package - HR ID Card Generator

## 🎯 Quick Start

This package contains everything you need to test the bulk ID card generation feature.

---

## 📁 What's Included

### 1. **Documentation**
- `SAMPLE_IMAGES_GUIDE.md` - Complete guide with image URLs and instructions

### 2. **Automated Download Tools**
- `download_sample_images.html` - **EASIEST!** Open in browser, click download (requires JSZip CDN)
- `download_sample_images.py` - Python script for command-line download (requires Python 3)

### 3. **Sample CSV**
- Download from the app: **Bulk Upload** → **Download Sample CSV Template**
- File name: `employee_bulk_upload_sample.csv`
- Contains: 10 sample employees with IDs starting with 2-digit characters

---

## 🚀 Fastest Method (Recommended)

### Option 1: Browser-Based Download (No Installation Required)

1. **Open the HTML file:**
   ```bash
   # Double-click this file or open in browser:
   download_sample_images.html
   ```

2. **Click the download button:**
   - All 10 images will download automatically
   - ZIP file created in your browser
   - File name: `employee_photos.zip`

3. **Done!** You now have:
   - ✅ `employee_photos.zip` (10 images named by Employee ID)
   - Ready to upload with the sample CSV

**Requirements:** Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 📋 Alternative Methods

### Option 2: Python Script

```bash
# Run the Python script:
python3 download_sample_images.py

# Output:
# - employee_photos.zip (created automatically)
# - Contains 10 images: 24EMP001.jpg, 24EMP002.jpg, etc.
```

**Requirements:** Python 3.6+

### Option 3: Manual Download

1. Open `SAMPLE_IMAGES_GUIDE.md`
2. Follow the image URLs section
3. Download each image manually
4. Rename files to match Employee IDs
5. Create ZIP file

**Requirements:** Manual effort and patience 😅

---

## 📊 Sample Employee Data

| Employee ID | Name            | Mobile     | Blood Group | Joining Date | Valid Till   |
|-------------|-----------------|------------|-------------|--------------|--------------|
| 24EMP001    | John Smith      | 9876543210 | A+          | 01/01/2024   | 31/12/2030   |
| 24EMP002    | Sarah Johnson   | 9876543211 | B+          | 15/01/2024   | 31/12/2030   |
| 24EMP003    | Michael Brown   | 9876543212 | O+          | 02/02/2024   | 31/12/2030   |
| 24EMP004    | Emily Davis     | 9876543213 | AB+         | 12/02/2024   | 31/12/2030   |
| 15EMP005    | David Wilson    | 9876543214 | A-          | 22/02/2024   | 31/12/2030   |
| 15EMP006    | Lisa Anderson   | 9876543215 | B-          | 05/03/2024   | 31/12/2030   |
| 22EMP007    | James Martinez  | 9876543216 | O-          | 18/03/2024   | 31/12/2030   |
| 22EMP008    | Jennifer Taylor | 9876543217 | AB-         | 25/03/2024   | 31/12/2030   |
| 23EMP009    | Robert Lee      | 9876543218 | A+          | 03/04/2024   | 31/12/2030   |
| 23EMP010    | Mary White      | 9876543219 | B+          | 14/04/2024   | 31/12/2030   |

---

## 🎓 Complete Testing Workflow

### Step 1: Get the Sample CSV
1. Open the HR ID Card Generator app
2. Navigate to **Bulk Upload** mode
3. Click **"Download Sample CSV Template"**
4. Save as `employee_bulk_upload_sample.csv`

### Step 2: Get the Sample Images
**Option A (Easiest):**
```bash
# Open in browser:
download_sample_images.html
# Click download button
```

**Option B (Python):**
```bash
python3 download_sample_images.py
```

### Step 3: Upload to the App
1. **Upload CSV:**
   - Click "Upload Data File (CSV/Excel)"
   - Select `employee_bulk_upload_sample.csv`
   - Wait for validation ✅

2. **Upload Photos:**
   - Click "Upload Photo ZIP File"
   - Select `employee_photos.zip`
   - System auto-matches photos to employees ✅

3. **Review:**
   - Check the Bulk Employee Manager table
   - Verify all 10 employees have photos
   - Fix any issues using the edit buttons

4. **Export:**
   - Click "Generate & Export High-Resolution PDF"
   - Wait for processing
   - Download your 10 ID cards! 🎉

---

## 📦 Expected ZIP File Structure

```
employee_photos.zip
├── 24EMP001.jpg    (John Smith)
├── 24EMP002.jpg    (Sarah Johnson)
├── 24EMP003.jpg    (Michael Brown)
├── 24EMP004.jpg    (Emily Davis)
├── 15EMP005.jpg    (David Wilson)
├── 15EMP006.jpg    (Lisa Anderson)
├── 22EMP007.jpg    (James Martinez)
├── 22EMP008.jpg    (Jennifer Taylor)
├── 23EMP009.jpg    (Robert Lee)
└── 23EMP010.jpg    (Mary White)
```

**Important Rules:**
- ✅ Filenames MUST match Employee IDs exactly
- ✅ All files in ZIP root (no subfolders)
- ✅ Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ Case-sensitive (use UPPERCASE for IDs)

---

## 🔧 Troubleshooting

### Problem: "Photo not found for Employee ID"
**Solution:** 
- Check filename matches Employee ID exactly (e.g., `24EMP001.jpg` not `24emp001.jpg`)
- Ensure no spaces in filename
- Verify file is in ZIP root, not in a subfolder

### Problem: "Invalid image format"
**Solution:** 
- Convert image to JPG, PNG, or WEBP
- Check file is not corrupted

### Problem: Python script fails
**Solution:**
```bash
# Install Python 3 if not installed
# Script uses only standard library, no pip install needed
python3 --version  # Check Python is installed
```

### Problem: HTML download fails
**Solution:**
- Check internet connection
- Try a different browser
- Disable ad blockers temporarily
- Check browser console for CORS errors

### Problem: ZIP file too large
**Solution:**
- Images are optimized at 800×800px
- Typical ZIP size: 2-5 MB
- If larger, images may need compression

---

## 💡 Pro Tips

1. **Quick Test (2 employees):**
   - Edit CSV to include only 2 employees
   - Create ZIP with just 2 images
   - Faster for initial testing

2. **Image Quality:**
   - Sample images are 800×800px
   - For production, use 1000×1000px or higher
   - Auto background removal handles any background

3. **Batch Processing:**
   - Test with sample data first
   - Then create your own CSV with real employee data
   - Use same ZIP naming convention

4. **Mobile Testing:**
   - HTML tool works on mobile browsers
   - Download on desktop for easier file management
   - Transfer files via cloud storage if needed

---

## 📚 Additional Resources

### File Naming Convention
```
Format: [Employee ID].[extension]
Examples:
  ✅ 24EMP001.jpg
  ✅ 15EMP006.png
  ✅ 22EMP007.jpeg
  ❌ john_smith.jpg (wrong)
  ❌ 24 EMP001.jpg (space)
  ❌ 24emp001.JPG (case)
```

### CSV Format
```csv
Employee Name,Employee ID,Mobile Number,Blood Group,Joining Date,Valid Till
John Smith,24EMP001,9876543210,A+,01/01/2024,31/12/2030
```

**Important:**
- Date format: DD/MM/YYYY
- Employee ID must start with 2-digit characters (e.g., 24, 15, 22)
- Blood group must be valid (A+, A-, B+, B-, O+, O-, AB+, AB-)

---

## ✨ Summary

**Three Files You Need:**
1. ✅ `employee_bulk_upload_sample.csv` (from app)
2. ✅ `employee_photos.zip` (from HTML/Python tool)
3. ✅ HR ID Card Generator app (running)

**Two Simple Steps:**
1. Upload CSV file
2. Upload ZIP file

**Result:**
🎉 **10 professional ID cards in high-resolution PDF format!**

---

## 📞 Need Help?

- Check `SAMPLE_IMAGES_GUIDE.md` for detailed instructions
- Review app's error messages (they're detailed and helpful)
- Verify filenames match Employee IDs exactly
- Ensure ZIP has no subfolders

---

## 🎉 You're Ready!

Choose your preferred method and start generating ID cards:

```bash
# Browser Method (Easiest):
1. Open download_sample_images.html
2. Click download
3. Done!

# Python Method:
python3 download_sample_images.py

# Manual Method:
See SAMPLE_IMAGES_GUIDE.md
```

**Happy ID Card Generating! 🚀📱✨**
