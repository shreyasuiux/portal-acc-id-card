# 🔄 Reset Feature - ID Card Generator

## Overview

A comprehensive reset functionality that allows HR users to quickly clear all form fields, uploaded files, and templates back to their initial state.

---

## 🎯 Location

The **Reset** button is located in the header, next to the search bar:

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar]  [🔄 Reset]  [Profile]       │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Visual Design

### Button Appearance

```css
/* Gradient background with orange/red theme */
Background: gradient from orange-500/20 to red-500/20
Border: orange-500/50
Icon: Rotating on hover (180° rotation)
Text: Orange-400 color
```

### Hover Effect

```
Before Hover: Static icon
On Hover:     Icon rotates 180° smoothly (500ms)
              Border brightens to orange-400
              Background intensifies
```

---

## 🔧 Functionality

### What Gets Reset?

#### 1. **Single Employee Mode**
```typescript
✅ Employee Name → ''
✅ Employee ID → ''
✅ Mobile Number → ''
✅ Blood Group → ''
✅ Website → 'www.acc.ltd' (default)
✅ Joining Date → ''
✅ Valid Till → '2030-12-31' (default)
✅ Photo → null (cleared)
```

#### 2. **Bulk Upload Mode**
```typescript
✅ Uploaded file → removed
✅ Bulk employees array → []
✅ Parse result → null
✅ Valid/invalid row counts → reset
✅ Error messages → cleared
```

#### 3. **Template**
```typescript
✅ Selected template → Reset to first template (templates[0])
✅ Template customization → Reset to defaults
```

#### 4. **UI State**
```typescript
✅ Saved employee → null
✅ Refresh key → incremented (forces re-render)
✅ Form validation errors → cleared
✅ Photo upload state → reset
```

---

## 🎨 User Experience

### Before Reset (Form Filled)

```
┌──────────────────────────────────────┐
│  Employee Name: John Doe             │
│  Employee ID: EMP001                 │
│  Mobile: +919876543210               │
│  Blood Group: A+                     │
│  Photo: [uploaded_photo.jpg]         │
│                                      │
│  Template: Professional Blue         │
└──────────────────────────────────────┘
```

### After Reset (Clean State)

```
┌──────────────────────────────────────┐
│  Employee Name: [empty]              │
│  Employee ID: [empty]                │
│  Mobile: [empty]                     │
│  Blood Group: [select]               │
│  Photo: [no file]                    │
│                                      │
│  Template: Modern Gradient (default) │
└──────────────────────────────────────┘
```

---

## 📋 Behavior Details

### Visibility Rules

The reset button **only appears** when:
- ✅ Mode is **"Single Employee"**
- ✅ Mode is **"Bulk Upload"**

The reset button **does NOT appear** when:
- ❌ Mode is **"View All Employees"**
- ❌ Mode is **"Templates"**

### Confirmation

**No confirmation dialog** - the reset happens immediately with:
- ✅ Success toast notification
- ✅ Visual feedback (rotating icon)
- ✅ Instant UI update

---

## 🔔 Notifications

### Success Toast

```typescript
toast.success('Form reset successfully', {
  description: 'All fields and template have been cleared'
})
```

**Display:**
```
✅ Form reset successfully
   All fields and template have been cleared
```

---

## 💡 Use Cases

### 1. **Quick Clear After Export**
```
User exports ID card → Wants to create another → Clicks Reset
Result: Clean form ready for next employee
```

### 2. **Mistake Correction**
```
User enters wrong data → Realizes mistake → Clicks Reset
Result: Fresh start without manually clearing each field
```

### 3. **Template Testing**
```
User customizes template → Wants default → Clicks Reset
Result: Template returns to first default template
```

### 4. **Bulk Upload Retry**
```
User uploads wrong CSV → Clicks Reset → Can upload correct file
Result: Previous file and errors cleared
```

---

## 🔄 Technical Implementation

### Reset Handler Function

```typescript
const handleResetForm = () => {
  // 1. Reset form data
  setFormData({
    name: '',
    employeeId: '',
    mobile: '',
    bloodGroup: '',
    website: 'www.acc.ltd',
    joiningDate: '',
    validTill: '2030-12-31',
    photo: null,
  });
  
  // 2. Clear saved employee
  setSavedEmployee(null);
  
  // 3. Clear bulk upload data
  setBulkEmployees([]);
  setBulkParseResult(null);
  
  // 4. Reset template to default
  setSelectedTemplate(templates[0]);
  
  // 5. Force re-render
  setRefreshKey(prevKey => prevKey + 1);
  
  // 6. Show success notification
  toast.success('Form reset successfully', {
    description: 'All fields and template have been cleared',
  });
  
  console.log('🔄 Form reset to initial state');
};
```

### Component Integration

```typescript
// Header component receives reset handler
<Header 
  onNavigateToDatabase={handleNavigateToDatabase} 
  onSearch={handleSearch}
  searchQuery={searchQuery}
  onResetForm={mode === 'single' || mode === 'bulk' ? handleResetForm : undefined}
/>
```

### Force Re-render with Key Prop

```typescript
// Components use refreshKey to force complete re-render
<SingleEmployeeForm 
  key={refreshKey}  // ← Forces unmount/remount
  formData={formData} 
  onFormChange={setFormData} 
/>

<BulkUpload 
  key={refreshKey}  // ← Forces unmount/remount
  onEmployeesLoaded={handleBulkEmployeesLoaded} 
/>
```

---

## 🎭 Animation Details

### Icon Animation

```typescript
<RotateCcw className="w-4 h-4 text-orange-400 group-hover:rotate-180 transition-transform duration-500" />
```

**Behavior:**
- Default: 0° rotation
- On hover: Rotates counterclockwise 180°
- Duration: 500ms smooth transition
- Easing: Default ease

### Button Animation

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  ...
>
```

**Behavior:**
- Hover: Scales up to 105%
- Click: Scales down to 95%
- Smooth spring animation

---

## ✅ Success Criteria

```
✅ Button visible only in Single/Bulk modes
✅ One-click reset (no confirmation dialog)
✅ All form fields cleared
✅ Photo upload cleared
✅ Bulk upload data cleared
✅ Template reset to default
✅ Toast notification shown
✅ Icon rotates on hover
✅ Smooth animations
✅ Console log for debugging
✅ Forces complete re-render
```

---

## 🚀 Benefits for HR Users

1. **Speed** - One click clears everything
2. **Simplicity** - No complex menus or dialogs
3. **Visual Feedback** - Rotating icon + toast
4. **Predictable** - Always returns to same initial state
5. **Forgiving** - Easy to start over if mistakes made
6. **Professional** - Smooth animations and polish

---

## 🎯 Keyboard Shortcut (Future Enhancement)

Potential future addition:
```
Ctrl+R (Windows) / Cmd+R (Mac) → Trigger reset
```

---

**Status: Fully Implemented ✅**

The reset feature is production-ready and provides HR users with a quick, intuitive way to clear the form and start fresh.
