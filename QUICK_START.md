# 🚀 Quick Start - Sample Images for Bulk Upload

## ⚡ Fastest Way (1 Minute)

### Step 1: Download Images
Open this file in your browser:
```
download_sample_images.html
```
Click the **"Download All Images as ZIP"** button.

### Step 2: Download CSV
1. Open the HR ID Card Generator app
2. Go to **Bulk Upload** mode
3. Click **"Download Sample CSV Template"**

### Step 3: Upload & Generate
1. Upload the CSV file
2. Upload the `employee_photos.zip` file
3. Click **"Generate & Export High-Resolution PDF"**

**Done! 🎉**

---

## 📦 What You'll Get

**ZIP File Structure:**
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

**CSV Data:**
- 10 sample employees
- Valid dates and data
- Employee IDs start with 2-digit characters
- All required fields included

---

## 🛠️ Alternative Methods

### Browser (Easiest) ⭐ RECOMMENDED
```
Open: download_sample_images.html
Click: Download button
Result: employee_photos.zip
```

### Python
```bash
python3 download_sample_images.py
```

### Bash (Linux/Mac)
```bash
chmod +x download_sample_images.sh
./download_sample_images.sh
```

---

## ✅ File Naming Rules

**IMPORTANT:** Image filenames MUST match Employee IDs exactly!

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `24EMP001.jpg` | `24emp001.jpg` (wrong case) |
| `24EMP001.jpg` | `john_smith.jpg` (name instead of ID) |
| `24EMP001.jpg` | `24 EMP001.jpg` (space) |
| `24EMP001.jpg` | `24EMP001 .jpg` (space before extension) |

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp`

---

## 📋 Sample Employee List

| ID | Name | Mobile | Blood | Joining | Valid Till |
|----|------|--------|-------|---------|------------|
| 24EMP001 | John Smith | 9876543210 | A+ | 01/01/2024 | 31/12/2030 |
| 24EMP002 | Sarah Johnson | 9876543211 | B+ | 15/01/2024 | 31/12/2030 |
| 24EMP003 | Michael Brown | 9876543212 | O+ | 02/02/2024 | 31/12/2030 |
| 24EMP004 | Emily Davis | 9876543213 | AB+ | 12/02/2024 | 31/12/2030 |
| 15EMP005 | David Wilson | 9876543214 | A- | 22/02/2024 | 31/12/2030 |
| 15EMP006 | Lisa Anderson | 9876543215 | B- | 05/03/2024 | 31/12/2030 |
| 22EMP007 | James Martinez | 9876543216 | O- | 18/03/2024 | 31/12/2030 |
| 22EMP008 | Jennifer Taylor | 9876543217 | AB- | 25/03/2024 | 31/12/2030 |
| 23EMP009 | Robert Lee | 9876543218 | A+ | 03/04/2024 | 31/12/2030 |
| 23EMP010 | Mary White | 9876543219 | B+ | 14/04/2024 | 31/12/2030 |

---

## 🎯 Common Issues

### "Photo not found for Employee ID"
→ Check filename matches Employee ID exactly (case-sensitive)

### "Invalid image format"
→ Use JPG, PNG, or WEBP format

### "ZIP structure invalid"
→ Ensure images are in ZIP root (no subfolders)

### Downloads fail in HTML tool
→ Check internet connection or try Python/Bash script

---

## 📚 More Help

- **Detailed Guide:** `SAMPLE_IMAGES_GUIDE.md`
- **Full Documentation:** `SAMPLE_DATA_README.md`

---

## 💡 Pro Tips

1. **Test with 2 employees first** - faster validation
2. **Use high-quality images** - 1000×1000px recommended
3. **Background removal is automatic** - any background works
4. **Check the Bulk Employee Manager** - review before export

---

## ✨ Result

You'll generate a professional PDF containing:
- ✅ 10 high-resolution ID cards (front & back)
- ✅ Automatic background removal
- ✅ Perfect alignment and spacing
- ✅ Print-ready quality
- ✅ Exact 153 × 244 px card dimensions

**File:** `bulk-id-cards_10-employees.pdf`

---

**Need Help?** The app shows detailed error messages and validation feedback!

**Ready to go? Open `download_sample_images.html` and start! 🚀**
