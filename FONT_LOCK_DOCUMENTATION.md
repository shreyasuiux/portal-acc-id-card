# FONT LOCK CONFIGURATION — ENFORCEMENT DOCUMENTATION

## 🔒 OVERVIEW

The Font Lock system enforces **ROBOTO-ONLY** typography across the entire HR ID Card Generator Portal with zero tolerance for alternative fonts.

---

## ✅ ALLOWED

- **Font Family**: `Roboto` (Google Font)
- **Font Weights**: 400 (Regular), 500 (Medium), 700 (Bold)
- **Source**: Google Fonts CDN

---

## ❌ BLOCKED

All fonts except Roboto are **STRICTLY PROHIBITED**:

- `Arial`
- `Helvetica`
- `sans-serif` (fallback)
- `serif`
- `monospace`
- `system-ui`
- `-apple-system`
- `BlinkMacSystemFont`
- `Segoe UI`
- `Ubuntu`
- `Cantarell`
- `Noto Sans`
- `Open Sans`
- `Helvetica Neue`
- `Times New Roman`
- `Georgia`
- `Courier`

### ⚠️ Common Violations

```typescript
// ❌ BLOCKED - Has fallback
fontFamily: 'Roboto, sans-serif'

// ❌ BLOCKED - Mixed font stack
fontFamily: 'Roboto, Arial, Helvetica'

// ❌ BLOCKED - System fonts
fontFamily: 'system-ui, -apple-system, Roboto'

// ✅ APPROVED - Roboto only
fontFamily: 'Roboto'
```

---

## 🛡️ ENFORCEMENT POINTS

### 1. **App Initialization** (`App.tsx`)
- Font Lock initializes on app start
- Validates root font configuration
- Logs allowed fonts and blocked patterns

### 2. **Pre-Export Validation** (`pdfExport.ts`)
- **STEP 0**: Font validation before PDF generation
- Scans DOM for non-Roboto fonts
- **BLOCKS export** if violations detected
- Provides detailed violation report

### 3. **Runtime Validation** (`fontValidation.ts`)
- `validateFontFamily()` - Validates string font families
- `validateCanvasFont()` - Validates canvas font strings
- `validateComponentStyles()` - Validates React style objects
- `scanDOMForFontViolations()` - Scans rendered DOM

---

## 🚫 BLOCKING BEHAVIOR

If a non-Roboto font is detected:

### **Generation Phase**
```
🔒 FONT LOCK: Running pre-export validation...
❌ FONT LOCK VIOLATION - EXPORT BLOCKED

VIOLATIONS FOUND (2):
  ❌ DOM element #42: div.employee-name
     Found: "Arial, sans-serif"
  ❌ DOM element #87: p.employee-id
     Found: "Helvetica, Arial, sans-serif"

ALLOWED FONT: Roboto (Google Font)
BLOCKED FONTS: Arial, Helvetica, sans-serif, ...

Export operation has been BLOCKED.
```

### **Publish Phase**
- Validation runs before any export operation
- Throws `FontValidationError` with detailed report
- User must fix violations before retrying

---

## 📋 VALIDATION API

### `validateFontFamily(fontFamily, location)`
Validates a font family string.

```typescript
import { validateFontFamily } from './utils/fontValidation';

// ✅ Passes
validateFontFamily('Roboto', 'HeaderComponent');

// ❌ Throws FontValidationError
validateFontFamily('Roboto, sans-serif', 'HeaderComponent');
validateFontFamily('Arial', 'HeaderComponent');
```

### `validateCanvasFont(canvasFont, location)`
Validates a canvas font string (e.g., `"bold 18px Roboto"`).

```typescript
import { validateCanvasFont } from './utils/fontValidation';

// ✅ Passes
validateCanvasFont('bold 18px Roboto', 'NameMeasurement');

// ❌ Throws FontValidationError
validateCanvasFont('bold 18px Roboto, sans-serif', 'NameMeasurement');
validateCanvasFont('16px Arial', 'NameMeasurement');
```

### `validateFontsBeforeExport()`
Comprehensive pre-export validation. Scans entire DOM.

```typescript
import { validateFontsBeforeExport } from './utils/fontValidation';

try {
  validateFontsBeforeExport();
  // Proceed with export
  await generatePDF();
} catch (error) {
  // Display error to user
  alert(error.message);
}
```

### `scanDOMForFontViolations()`
Returns validation results without throwing.

```typescript
import { scanDOMForFontViolations } from './utils/fontValidation';

const { isValid, violations } = scanDOMForFontViolations();

if (!isValid) {
  console.error('Font violations detected:', violations);
  violations.forEach(v => {
    console.log(`- ${v.element}: ${v.font} at ${v.location}`);
  });
}
```

---

## 🔧 INTEGRATION POINTS

### 1. **Global CSS** (`/src/styles/theme.css`)
```css
@layer base {
  * {
    font-family: Roboto;  /* NO fallbacks */
  }
  
  html {
    font-family: Roboto;  /* NO fallbacks */
  }
  
  body {
    font-family: Roboto;  /* NO fallbacks */
  }
}
```

### 2. **React Components**
```typescript
// ID Card Display Components
<div style={{ fontFamily: 'Roboto' }}>  {/* NO fallbacks */}
  {employee.name}
</div>

// Canvas Font Measurement
context.font = `bold ${fontSize}px Roboto`;  // NO fallbacks
```

### 3. **Export Engine**
```typescript
// pdfExport.ts - Step 0
console.log('🔒 STEP 0: Validating fonts (FONT LOCK)...');
validateFontsBeforeExport();  // Blocks if violations found
console.log('✓ Font validation passed (Roboto only)');
```

---

## 📊 VALIDATION FLOW

```
┌──────────────────────────────┐
│   App Initialization         │
│   initializeFontLock()       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   User Interaction           │
│   (Edit, Preview, etc.)      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Export Triggered           │
│   (Single or Bulk)           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   STEP 0: Font Validation    │
│   validateFontsBeforeExport()│
└──────────────┬───────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
  ✅ Valid         ❌ Violations
  (Continue)       (BLOCK)
       │               │
       ▼               ▼
  Generate PDF    Display Error
  (Steps 1-6)     (User Action)
```

---

## 🧪 TESTING

### Manual Testing
1. Inspect Element → Computed Styles
2. Check `font-family` for all elements
3. Verify NO fallback fonts exist

### Console Validation
```javascript
// Run in browser console
import { scanDOMForFontViolations } from './utils/fontValidation';

const result = scanDOMForFontViolations();
console.log(result.isValid ? '✅ Clean' : '❌ Violations:', result.violations);
```

### Export Testing
1. Trigger PDF export (single or bulk)
2. Check console for Font Lock messages:
   ```
   🔒 STEP 0: Validating fonts (FONT LOCK)...
   ✓ Font validation passed (Roboto only)
   ```
3. Verify export succeeds without font errors

---

## 🚨 ERROR HANDLING

### `FontValidationError`
Custom error class for font violations.

**Properties**:
- `message`: Detailed error description
- `detectedFont`: The invalid font that was detected
- `location`: Where the violation occurred

**Example**:
```typescript
try {
  validateFontFamily('Arial', 'HeaderComponent');
} catch (error) {
  if (error instanceof FontValidationError) {
    console.error('Detected:', error.detectedFont);    // "Arial"
    console.error('Location:', error.location);        // "HeaderComponent"
    console.error('Message:', error.message);          // Full error details
  }
}
```

---

## ✅ COMPLIANCE CHECKLIST

- [x] Google Fonts CDN loaded (`/src/styles/fonts.css`)
- [x] Global CSS uses `Roboto` only (`/src/styles/theme.css`)
- [x] ID Card components use `fontFamily: 'Roboto'`
- [x] Canvas font strings use `Roboto` (no fallbacks)
- [x] Font Lock initialized on app start (`App.tsx`)
- [x] Export validates fonts before generation (`pdfExport.ts`)
- [x] No `sans-serif`, `Arial`, or `Helvetica` anywhere
- [x] All text measurements use Roboto
- [x] Preview and Export use identical fonts

---

## 📦 FILES MODIFIED

1. **`/src/app/utils/fontValidation.ts`** - NEW
   - Complete Font Lock implementation
   - Validation functions
   - DOM scanning
   - Error classes

2. **`/src/app/App.tsx`** - MODIFIED
   - Added `initializeFontLock()` on mount
   - Logs font configuration at startup

3. **`/src/app/utils/pdfExport.ts`** - MODIFIED
   - Added `validateFontsBeforeExport()` call
   - Runs as STEP 0 before all exports

4. **`/src/styles/theme.css`** - MODIFIED
   - Removed ALL fallback fonts
   - `font-family: Roboto` (clean)

5. **`/src/app/components/IDCard*.tsx`** - MODIFIED
   - All `fontFamily` properties updated
   - Canvas font strings cleaned
   - NO `sans-serif` fallbacks

---

## 🎯 SUCCESS CRITERIA

- ✅ Zero font fallbacks in codebase
- ✅ Roboto loads from Google Fonts CDN
- ✅ Export validation blocks non-Roboto fonts
- ✅ Console shows Font Lock initialization
- ✅ Preview and Export render identically
- ✅ No font-related warnings/errors
- ✅ PDF exports display Roboto consistently

---

## 📞 SUPPORT

If Font Lock blocks an export:

1. **Check Console**: Read the violation report
2. **Inspect Element**: Verify computed font-family
3. **Fix Violations**: Update to `fontFamily: 'Roboto'`
4. **Re-validate**: Retry export after fixes
5. **Contact Support**: If issues persist

---

## 🔐 SECURITY NOTES

- Font Lock prevents visual inconsistency
- Ensures preview matches export exactly
- Protects against unintended font rendering
- Maintains professional typography standards
- Zero tolerance for unauthorized fonts

---

**Last Updated**: February 2026  
**Status**: 🟢 ACTIVE  
**Enforcement Level**: 🔴 STRICT (ZERO TOLERANCE)
