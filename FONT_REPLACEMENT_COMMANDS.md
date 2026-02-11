# 🔧 Font Replacement Commands - Arial/Helvetica → Roboto

## Quick Fix - Run These Commands in Your Terminal

### For macOS/Linux:

```bash
# Navigate to your project root, then run:

# Replace all fontFamily: 'Arial, sans-serif' with Roboto
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/fontFamily: 'Arial, sans-serif'/fontFamily: 'Roboto, sans-serif'/g" {} \;

# Replace context.font canvas declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/context\.font = `bold \${fontSize}px Arial, sans-serif`/context.font = `bold ${fontSize}px Roboto, sans-serif`/g' {} \;

# Replace direct font declarations in canvas
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/bold 24px Arial/bold 24px Roboto/g' {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/16px Arial/16px Roboto/g' {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/bold 14px Arial/bold 14px Roboto/g' {} \;

# Replace Tailwind font declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/font-\\['Arial:Bold',sans-serif\\]/font-['Roboto',sans-serif] font-bold/g" {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/font-\\['Arial:Regular',sans-serif\\]/font-['Roboto',sans-serif]/g" {} \;
```

### For Windows (Git Bash/WSL):

```bash
# Replace all fontFamily: 'Arial, sans-serif' with Roboto
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/fontFamily: 'Arial, sans-serif'/fontFamily: 'Roboto, sans-serif'/g" {} \;

# Replace context.font canvas declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/context\.font = `bold \${fontSize}px Arial, sans-serif`/context.font = `bold ${fontSize}px Roboto, sans-serif`/g' {} \;

# Replace direct font declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/bold 24px Arial/bold 24px Roboto/g' {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/16px Arial/16px Roboto/g' {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/bold 14px Arial/bold 14px Roboto/g' {} \;

# Replace Tailwind font declarations
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/font-\\['Arial:Bold',sans-serif\\]/font-['Roboto',sans-serif] font-bold/g" {} \;
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/font-\\['Arial:Regular',sans-serif\\]/font-['Roboto',sans-serif]/g" {} \;
```

---

## Or Use VS Code Find & Replace (CTRL/CMD + SHIFT + F)

### Search & Replace Patterns:

1. **Pattern 1:**
   - Find: `fontFamily: 'Arial, sans-serif'`
   - Replace: `fontFamily: 'Roboto, sans-serif'`
   - Files to include: `**/*.tsx, **/*.ts`

2. **Pattern 2:**
   - Find: `context.font = \`bold \${fontSize}px Arial, sans-serif\``
   - Replace: `context.font = \`bold \${fontSize}px Roboto, sans-serif\``
   - Files to include: `**/*.tsx, **/*.ts`

3. **Pattern 3:**
   - Find: `bold 24px Arial`
   - Replace: `bold 24px Roboto`
   - Files to include: `**/*.tsx, **/*.ts`

4. **Pattern 4:**
   - Find: `16px Arial`
   - Replace: `16px Roboto`
   - Files to include: `**/*.tsx, **/*.ts`

5. **Pattern 5:**
   - Find: `bold 14px Arial`
   - Replace: `bold 14px Roboto`
   - Files to include: `**/*.tsx, **/*.ts`

6. **Pattern 6:**
   - Find (Regex): `font-\['Arial:Bold',sans-serif\]`
   - Replace: `font-['Roboto',sans-serif] font-bold`
   - Files to include: `**/*.tsx`

7. **Pattern 7:**
   - Find (Regex): `font-\['Arial:Regular',sans-serif\]`
   - Replace: `font-['Roboto',sans-serif]`
   - Files to include: `**/*.tsx`

---

## Files That Will Be Updated (97 instances total):

1. `/src/app/components/IDCardBackPreview.tsx` - 1 instance
2. `/src/app/components/IDCardDisplay.tsx` - 17 instances  
3. `/src/app/components/IDCardExportRenderer.tsx` - 38 instances
4. `/src/app/components/IDCardPreview.tsx` - 19 instances
5. `/src/app/components/UnifiedIDCardRenderer.tsx` - 13 instances
6. `/src/app/utils/sampleZipGenerator.ts` - 3 instances
7. `/src/imports/Container-12-1090.tsx` - 8 instances
8. `/src/imports/Container-12-1123.tsx` - 8 instances
9. `/src/imports/Container.tsx` - 10 instances

---

## Verification Commands:

After running the replacement, verify with:

```bash
# Check if any Arial fonts remain
grep -r "Arial" ./src --include="*.tsx" --include="*.ts" | wc -l

# Should return 0 if all replaced successfully

# Check if Roboto is now used
grep -r "Roboto" ./src --include="*.tsx" --include="*.ts" | wc -l

# Should return 97 or more
```

---

## ✅ Font Import Already Added:

The Roboto font has been imported in `/src/styles/fonts.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
```

---

## 🎯 Result:

After running these commands, ALL 97 instances of Arial/Helvetica will be replaced with Roboto, maintaining the exact same font weights and styles.

**No Helvetica. No Arial. Only Roboto.** ✓
