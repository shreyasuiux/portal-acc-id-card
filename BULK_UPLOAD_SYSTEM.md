# 📂 Bulk Upload System - HR ID Card Generator

## 🎯 DESIGNED FOR NON-TECHNICAL HR EXECUTIVES

The bulk upload system is **forgiving, predictable, and zero-confusion** - designed for HR users with low technical knowledge.

---

## 📁 SUPPORTED FILE FORMATS

### All Formats Treated Equally

✅ **CSV** (.csv)  
✅ **Excel 2007+** (.xlsx)  
✅ **Excel 97-2003** (.xls)  
✅ **OpenDocument Spreadsheet** (.ods)

**No format is secondary** - all are auto-detected and parsed identically.

---

## 🔄 AUTO-DETECTION & PARSING

### Zero Manual Configuration

The system automatically:
1. ✅ Detects file type from extension
2. ✅ Parses columns without manual mapping
3. ✅ Trims whitespace from all values
4. ✅ Normalizes text case where appropriate
5. ✅ Ignores empty rows
6. ✅ Preserves original row order

**HR users don't need to:**
- ❌ Map columns manually
- ❌ Pre-format the file
- ❌ Fix minor spacing issues
- ❌ Worry about case sensitivity

---

## 📋 COLUMN NAME VARIATIONS (FORGIVING)

The system accepts **multiple variations** of column names:

### Employee Name
```
Accepted: name, employee name, emp_name, employee, empname, full name, fullname
```

### Employee ID
```
Accepted: employee id, emp_id, id, employee_id, empid, emp id, employee no
```

### Mobile Number
```
Accepted: mobile, mobile number, phone, contact, phone number, contact number, mobile no
```

### Blood Group
```
Accepted: blood group, blood, blood_group, bloodgroup, bg
```

### Website
```
Accepted: website, company site, company_site, site, web
Default: www.acc.ltd (locked, not editable)
```

### Joining Date
```
Accepted: joining date, join date, doj, date of joining, joining_date, joindate
Format: DD/MM/YYYY
Default: Current date if missing
```

### Valid Till
```
Accepted: valid till, expiry, valid_till, expiry date, valid until, validity
Format: DD/MM/YYYY
Default: 31/12/2030
```

### Photo
```
Accepted: photo, image, photo_url, image_url, photo url, picture
Type: URL or base64 encoded image
Note: Auto background removal applied
```

---

## 🎨 DEFAULT VALUE RULES

### Mobile Number Auto-Formatting

**Indian Number Format:**
```
User enters: 9876543210
System converts: +919876543210

User enters: 919876543210
System converts: +919876543210

User enters: +919876543210
System keeps: +919876543210
```

✅ **Always prefixes with +91** for 10-digit numbers

### Website (Locked Default)

```
Default value: www.acc.ltd
Editable: NO
Locked: YES
```

This is a **company-wide constant** - not employee-specific.

### Valid Till Date

```
Default: 31/12/2030
Format: DD/MM/YYYY
Auto-filled if missing from CSV
```

---

## 🖥️ BULK UPLOAD UI

### Single Drag & Drop Area

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Upload Icon]                  │
│                                             │
│   Upload CSV, Excel, or Spreadsheet file   │
│                                             │
│   Supported formats: .csv, .xlsx, .xls, .ods │
│   Click or drag & drop file here           │
│                                             │
└─────────────────────────────────────────────┘
```

**After Upload:**
```
┌─────────────────────────────────────────────┐
│         [File Icon] employees.xlsx          │
│              Excel (XLSX)                   │
│                                             │
│      ✓ 48 valid    ✗ 2 skipped            │
└─────────────────────────────────────────────┘
```

---

## ⚠️ ERROR HANDLING (VERY IMPORTANT)

### Forgiving Behavior

**DON'T block entire file for partial errors**

```
Scenario: 50 rows in CSV, 2 have errors

Old Behavior (BAD):
❌ "File has errors. Cannot import."
❌ User must fix and re-upload

New Behavior (GOOD):
✅ "48 valid employees loaded"
✅ "2 rows skipped due to errors"
✅ Export button enabled for 48 valid rows
```

### Error Display

**Inline Error Messages:**
```
┌─────────────────────────────────────────────┐
│  ⚠️  Some rows have missing or invalid data │
│                                             │
│  48 valid rows will be exported.            │
│  2 rows will be skipped.                    │
│                                             │
│  Errors found:                              │
│  • Row 12: Employee photo missing           │
│  • Row 35: Mobile number must be 10 digits  │
└─────────────────────────────────────────────┘
```

**Row Count Display:**
```
✔ Valid IDs: 48
❌ Rows Skipped: 2
Total Uploaded: 50
```

---

## 📊 VALIDATION LOGIC

### Row-Level Validation

Each row is validated independently:

```typescript
Row 1: ✓ Valid → Added to export queue
Row 2: ✓ Valid → Added to export queue
Row 3: ✗ Invalid (missing name) → Skipped
Row 4: ✓ Valid → Added to export queue
...
```

### Required Field Validation

**Employee Name:**
- ❌ Missing or < 2 characters → Skip row
- ✅ 2-50 characters → Valid

**Employee ID:**
- ❌ Missing or < 3 characters → Skip row
- ✅ 3-20 characters → Valid

**Mobile Number:**
- ❌ Not exactly 10 digits → Skip row
- ✅ 10 digits → Auto-prefix +91

**Blood Group:**
- ❌ Not in (A+, A-, B+, B-, AB+, AB-, O+, O-) → Skip row
- ✅ Valid blood group → Normalized (uppercase)

**Joining Date:**
- ❌ Invalid format → Skip row
- ✅ DD/MM/YYYY format → Valid
- ⚪ Missing → Use current date

**Valid Till:**
- ❌ Invalid format → Skip row
- ✅ DD/MM/YYYY format → Valid
- ⚪ Missing → Use 31/12/2030

---

## 🔍 PREVIEW LOGIC

### Sample ID Preview

```
┌───────────────────────────────┐
│  [ID Card Preview]            │
│                               │
│  Sample Preview (Bulk Mode)   │
│                               │
│  John Doe (First valid row)   │
└───────────────────────────────┘
```

**Preview Rules:**
- Uses **first valid row** from uploaded file
- Marked as "Sample Preview (Bulk Mode)"
- Follows exact spacing & layout rules
- Never auto-adjusts spacing

---

## 📄 EXPORT RULES (BULK)

### PDF Structure

```
For 50 valid employees:

Page 1:   Employee 1 Front
Page 2:   Employee 2 Front
Page 3:   Employee 3 Front
...
Page 50:  Employee 50 Front
Page 51:  Common Backside (shared)

Total: 51 pages
```

### Export Specifications

```
Format:     PDF
Resolution: 300 DPI
Page Size:  153×244 px (40.48×64.56 mm)
Quality:    High-resolution
File Size:  ~10-20 MB for 50 employees
Filename:   employee-id-cards_2026-02-05_50-cards.pdf
```

---

## ✅ BLOCKING CONDITIONS

**Export is BLOCKED only if:**

1. ❌ **No valid rows exist** (all rows have errors)
2. ❌ **Front template missing** (template not selected)
3. ❌ **File unreadable** (corrupted or invalid format)

**Export is NOT blocked if:**

✅ Some rows have errors (export valid rows only)  
✅ Photo URLs missing (use placeholder)  
✅ Minor formatting issues (auto-corrected)

---

## 📈 SUCCESS WORKFLOW

### Ideal User Flow

```
Step 1: HR uploads CSV file
   ↓
Step 2: System parses and validates
   ↓
Step 3: Shows summary: "48 valid, 2 skipped"
   ↓
Step 4: Preview first valid employee
   ↓
Step 5: HR clicks "Export"
   ↓
Step 6: System generates 51-page PDF
   ↓
Step 7: Browser downloads PDF
   ↓
✅ DONE - No re-upload needed
```

### Console Output (Debug)

```
🔍 Parsing bulk upload file: employees.xlsx
   File type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   File size: 125.43 KB
   Detected format: Excel (XLSX)
   Sheet name: Sheet1
   Total rows (excluding header): 50

✅ Parsing complete:
   ✓ Valid employees: 48
   ✗ Invalid rows: 2

📋 Validation errors:
   Row 12: Employee photo missing
   Row 35: Mobile number must be exactly 10 digits

📦 Bulk employees loaded: 48
```

---

## 🎨 USER EXPERIENCE GOALS

### System Must Feel:

✅ **"I upload file → I get IDs → Done."**

**NOT:**
❌ "I upload → Error → Fix file → Re-upload → Map columns → Validate → Fix again → ..."

### Key Principles:

1. **Forgiving** - Accept minor formatting issues
2. **Predictable** - Same input always produces same output
3. **Transparent** - Show exactly what went wrong (row number + reason)
4. **Actionable** - Allow exporting valid rows immediately
5. **Simple** - No manual column mapping, no config screens

---

## 🔧 TECHNICAL IMPLEMENTATION

### File Parsing Library

```typescript
import * as XLSX from 'xlsx';

// Supports: CSV, XLS, XLSX, ODS
const workbook = XLSX.read(arrayBuffer, {
  type: 'array',
  cellDates: true,
  blankrows: false, // Skip empty rows
});
```

### Column Mapping Algorithm

```typescript
// Case-insensitive, forgiving column name matching
const COLUMN_MAPPINGS = {
  name: ['name', 'employee name', 'emp_name', 'employee', ...],
  employeeId: ['employee id', 'emp_id', 'id', ...],
  mobile: ['mobile', 'mobile number', 'phone', ...],
  ...
};

// Find matching column
const matchedKey = rowKeys.find(key => {
  const normalizedKey = key.toLowerCase().trim();
  return variations.some(variation => normalizedKey === variation);
});
```

### Validation & Normalization

```typescript
// Normalize mobile number
let normalizedMobile = mobile.replace(/\D/g, ''); // Remove non-digits

if (normalizedMobile.length === 10) {
  normalizedMobile = '+91' + normalizedMobile; // Auto-prefix
}

// Normalize blood group
const normalizedBloodGroup = bloodGroup.toUpperCase().replace(/\s/g, '');
```

---

## 📊 ERROR MESSAGE EXAMPLES

### Good (Actionable)

```
✅ "Row 12: Employee photo missing"
✅ "Row 35: Mobile number must be exactly 10 digits"
✅ "Row 8: Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-"
```

### Bad (Generic)

```
❌ "Some rows have errors"
❌ "Invalid data"
❌ "Export failed"
```

---

## 🎯 SUCCESS CRITERIA

```
✅ All file formats (CSV, XLS, XLSX, ODS) work equally
✅ HR uploads once, exports once
✅ No re-upload needed for partial errors
✅ No export crash
✅ Predictable output every time
✅ Valid rows exported even if some rows invalid
✅ Clear error messages with row numbers
✅ Auto-detection of columns (no manual mapping)
✅ Auto-normalization of data (mobile, blood group, etc.)
✅ Default values auto-filled (website, valid till)
```

---

## 📱 SAMPLE CSV FORMAT

```csv
Employee Name,Employee ID,Mobile,Blood Group,Joining Date,Valid Till
John Doe,EMP001,9876543210,A+,01/01/2024,31/12/2030
Jane Smith,EMP002,9876543211,B+,15/02/2024,31/12/2030
Bob Johnson,EMP003,9876543212,O+,20/03/2024,31/12/2030
```

**Alternate Column Names (Also Work):**
```csv
name,emp_id,phone,blood,doj
John Doe,EMP001,9876543210,A+,01/01/2024
```

---

**System Status: Production-Ready for HR Users ✅**

Last Updated: February 5, 2026
