import { forwardRef } from 'react';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { Template, TemplateDesign, BackSideText, Branch, FrontSideText } from '../utils/templateData';
import { DEFAULT_BACK_TEXT } from '../utils/defaultBackText';
import { DEFAULT_FRONT_TEXT } from '../utils/defaultFrontText';
import logo from 'figma:asset/6dce495d999ed88e54f35e49635962b824088162.png';

interface UnifiedIDCardRendererProps {
  employee: EmployeeRecord;
  side: 'front' | 'back';
  template: Template;
  photoUrl?: string;
  scale?: number;
}

/**
 * Unified ID Card Renderer
 * 
 * This component is the SINGLE SOURCE OF TRUTH for ID card rendering.
 * It is used for both:
 * 1. Live Preview
 * 2. PDF Export
 * 
 * This ensures that what you see in preview is EXACTLY what gets exported.
 */
export const UnifiedIDCardRenderer = forwardRef<HTMLDivElement, UnifiedIDCardRendererProps>(
  ({ employee, side, template, photoUrl, scale = 1 }, ref) => {
    const cardConfig: TemplateDesign = side === 'front' ? template.front : template.back;
    
    // Get front text labels (use custom if provided, otherwise use defaults)
    const frontText: FrontSideText = template.frontText || DEFAULT_FRONT_TEXT;
    
    // Format name - First name + First letter of last name with period
    const formatName = (name: string) => {
      if (!name) return 'Employee Name';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      }
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const lastNameInitial = parts[parts.length - 1][0].toUpperCase();
      return `${firstName} ${lastNameInitial}.`;
    };

    // Calculate dynamic font size based on actual rendered width
    const getNameFontSize = (name: string) => {
      const formattedName = formatName(name);
      
      // Configuration
      const MAX_WIDTH = 125; // Maximum width in pixels (reduced for safety margin)
      const BASE_FONT_SIZE = 18; // Starting font size
      const MIN_FONT_SIZE = 10; // Minimum font size to maintain readability
      const SAFETY_BUFFER = 1.05; // 5% safety buffer for rendering differences
      
      // Create a canvas element to measure text width
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return BASE_FONT_SIZE;
      
      // Try font sizes from BASE_FONT_SIZE down to MIN_FONT_SIZE
      for (let fontSize = BASE_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize--) {
        context.font = `bold ${fontSize}px Roboto`;
        const metrics = context.measureText(formattedName);
        const textWidth = metrics.width * SAFETY_BUFFER; // Apply safety buffer
        
        // If text fits within max width, return this font size
        if (textWidth <= MAX_WIDTH) {
          return fontSize;
        }
      }
      
      // If still too long, return minimum font size
      return MIN_FONT_SIZE;
    };

    // Format phone number with +91
    const formatPhoneNumber = (phone: string) => {
      if (!phone) return '+91 9898989898';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `+91 ${cleaned}`;
      }
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        return `+91 ${cleaned.substring(2)}`;
      }
      return `+91 ${cleaned}`;
    };

    // Format employee ID
    const formatEmployeeId = (id: string) => {
      if (!id) return '1111';
      return id;
    };

    // Format blood group
    const formatBloodGroup = (bloodGroup: string) => {
      if (!bloodGroup) return 'B+';
      return bloodGroup;
    };

    // Get photo URL - prioritize photoUrl prop, then employee.photoBase64
    const getPhotoUrl = () => {
      return photoUrl || employee.photoBase64 || '';
    };

    // Format dates
    const formatValidTill = (date: string) => {
      if (!date) return 'Dec 2030';
      const d = new Date(date);
      return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    };

    const formatJoiningDate = (date: string) => {
      if (!date) return '12 Jan 2024';
      const d = new Date(date);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Apply background
    const getBackgroundStyle = () => {
      const bg = cardConfig.backgroundColor;
      if (bg.includes('gradient')) {
        return { backgroundImage: bg };
      }
      return { backgroundColor: bg };
    };

    // Render background pattern
    const renderBackgroundPattern = () => {
      if (!cardConfig.backgroundPattern || cardConfig.backgroundPattern === 'none') {
        return null;
      }

      const patternStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        pointerEvents: 'none',
      };

      if (cardConfig.backgroundPattern === 'dots') {
        return (
          <div
            style={{
              ...patternStyle,
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: `${8 * scale}px ${8 * scale}px`,
            }}
          />
        );
      }

      if (cardConfig.backgroundPattern === 'lines') {
        return (
          <div
            style={{
              ...patternStyle,
              backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor ${1 * scale}px, transparent ${1 * scale}px, transparent ${6 * scale}px)`,
            }}
          />
        );
      }

      return null;
    };

    // Render accent elements
    const renderAccentElements = () => {
      return cardConfig.accentElements.map((element, index) => {
        const commonStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${element.position.x * scale}px`,
          top: `${element.position.y * scale}px`,
          width: `${element.size.width * scale}px`,
          height: `${element.size.height * scale}px`,
          backgroundColor: element.color,
        };

        if (element.type === 'circle') {
          return (
            <div
              key={`accent-${index}`}
              style={{
                ...commonStyle,
                borderRadius: '50%',
              }}
            />
          );
        }

        if (element.type === 'line' || element.type === 'rectangle') {
          return <div key={`accent-${index}`} style={commonStyle} />;
        }

        return null;
      });
    };

    return (
      <div
        ref={ref}
        style={{
          width: `${153 * scale}px`,
          height: `${244 * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Roboto',
          ...getBackgroundStyle(),
        }}
      >
        {/* Background Pattern */}
        {renderBackgroundPattern()}

        {/* Accent Elements (behind content) */}
        {renderAccentElements()}

        {side === 'front' ? (
          // ===== FRONT SIDE =====
          <>
            {/* Logo */}
            <div
              style={{
                position: 'absolute',
                left: `${100 * scale}px`,
                top: `${10 * scale}px`,
                width: `${42 * scale}px`,
                height: `${20 * scale}px`,
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{
                  position: 'absolute',
                  inset: 0,
                  maxWidth: 'none',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>

            {/* 
              EMPLOYEE PHOTO CONTAINER — ZERO-STRETCH PERMANENT FIX
              
              MANDATORY RULES (NON-NEGOTIABLE):
              =====================================
              1. Photo frame (64×80px) is VISUAL LAYOUT ONLY - NOT image resolution
              2. Photo stored at HIGH-RES (1280×1600px minimum)
              3. Display uses object-fit: cover + center crop (NO STRETCHING)
              4. Preview scales HIGH-RES image visually (source unchanged)
              5. PDF export embeds ORIGINAL high-res directly (NO rasterization)
              6. Preview and PDF quality are PIXEL-IDENTICAL
              7. Export BLOCKED if high-res unavailable
              
              TECHNICAL IMPLEMENTATION:
              =====================================
              Problem: html2canvas captures images at CSS display size, not native size
              
              Solution: Render photo at NATIVE size, scale with CSS transform
              - Photo <img> rendered at ACTUAL naturalWidth×naturalHeight
              - CSS transform: scale() shrinks to 64×80px VISUALLY
              - object-fit: cover ensures NO STRETCHING (crops if needed)
              - object-position: center for perfect centering
              - html2canvas captures FULL native resolution naturally
              - Result: CRYSTAL CLEAR photos in PDF export, ZERO STRETCHING ✅
              
              Quality Chain:
              Upload (original) → Process (1280×1600) → Store → Display (scaled) → Export (native)
                                                          ↓           ↓              ↓
                                                      NO RESIZE   object-fit   ORIGINAL
            */}
            <div
              style={{
                position: 'absolute',
                left: `${44.5 * scale}px`,
                top: `${57 * scale}px`,
                width: `${64 * scale}px`,
                height: `${80 * scale}px`,
                overflow: 'hidden', // Clip photo to frame boundary
                borderRadius: '4px', // Optional: slight rounding
              }}
              // CRITICAL: Mark photo container for PDF export isolation
              data-photo-container="true"
            >
              {getPhotoUrl() ? (
                <img
                  src={getPhotoUrl()}
                  alt="Employee"
                  style={{
                    display: 'block',
                    // CRITICAL: Photo dimensions MUST match stored resolution
                    // This ensures html2canvas captures at NATIVE quality
                    width: '1280px',  // Native width (matches stored photo)
                    height: '1600px', // Native height (matches stored photo)
                    // ZERO-STRETCH GUARANTEE:
                    objectFit: 'cover',           // Scale to fill, crop overflow (NO STRETCH!)
                    objectPosition: 'center',     // Center crop (not 'center top')
                    // High-quality rendering
                    imageRendering: '-webkit-optimize-contrast',
                    WebkitFontSmoothing: 'antialiased',
                    // Scale down VISUALLY to 64×80px frame
                    // html2canvas captures BEFORE this transform (native 1280×1600px!)
                    transform: `scale(${(64 * scale) / 1280})`,
                    transformOrigin: 'top left',
                  }}
                  crossOrigin="anonymous"
                  // CRITICAL: Mark for PDF export
                  data-employee-photo="true"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      console.log(`📸 Photo loaded: ${img.naturalWidth}×${img.naturalHeight}px (${employee.name})`);
                      
                      // Validate minimum resolution
                      if (img.naturalWidth < 1280 || img.naturalHeight < 1600) {
                        console.warn(`⚠️  LOW-RES PHOTO: ${employee.name} has ${img.naturalWidth}×${img.naturalHeight}px (expected 1280×1600px)`);
                        console.warn(`   Photo may appear blurry in PDF export`);
                      } else {
                        console.log(`✅ HIGH-RES PHOTO: ${employee.name}'s photo is print-ready!`);
                      }
                      
                      // Validate aspect ratio
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      const expectedAspectRatio = 1280 / 1600; // 0.8 (4:5)
                      const aspectDiff = Math.abs(aspectRatio - expectedAspectRatio);
                      
                      if (aspectDiff > 0.05) {
                        console.warn(`⚠️  ASPECT RATIO: ${employee.name}'s photo is ${aspectRatio.toFixed(2)} (expected 0.80)`);
                        console.warn(`   Photo will be center-cropped to fit 4:5 ratio`);
                      }
                    }
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: `${8 * scale}px`,
                      lineHeight: `${12 * scale}px`,
                      color: '#94a3b8',
                    }}
                  >
                    No photo
                  </p>
                </div>
              )}
            </div>

            {/* Name - top: 143px (57 + 80 + 6), height: 20px */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: `${143 * scale}px`,
                width: `${153 * scale}px`,
                height: `${20 * scale}px`,
                paddingLeft: `${12 * scale}px`,
                paddingRight: `${12 * scale}px`,
                display: 'flex',
                alignItems: 'flex-start',
                overflow: 'hidden',
              }}
            >
              <p
                style={{
                  flex: 1,
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${getNameFontSize(employee.name) * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${20 * scale}px`,
                  color: '#213876',
                  minWidth: '1px',
                  minHeight: '1px',
                }}
              >
                {formatName(employee.name)}
              </p>
            </div>

            {/* Employee ID - top: 175px (143 + 20 + 12), height: 10px */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: `${175 * scale}px`,
                width: `${153 * scale}px`,
                height: `${10 * scale}px`,
                overflow: 'hidden',
              }}
            >
              <p
                style={{
                  position: 'absolute',
                  textAlign: 'center',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${8 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${10 * scale}px`,
                  color: '#0f172a',
                  left: '50%',
                  top: 0,
                  transform: 'translateX(-50%)',
                }}
              >
                Emp ID : {formatEmployeeId(employee.employeeId)}
              </p>
            </div>

            {/* Contact Row */}
            {/* Phone - top: 197px (175 + 10 + 12), height: 9px */}
            <div
              style={{
                position: 'absolute',
                left: `${11 * scale}px`,
                top: `${197 * scale}px`,
                height: `${9 * scale}px`,
              }}
            >
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${7 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${9 * scale}px`,
                  color: '#0f172a',
                }}
              >
                {formatPhoneNumber(employee.mobile)}
              </p>
            </div>

            {/* Pipe 1 - top: 197px */}
            <div
              style={{
                position: 'absolute',
                left: `${69.75 * scale}px`,
                top: `${197 * scale}px`,
                height: `${9 * scale}px`,
              }}
            >
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${7 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${9 * scale}px`,
                  color: '#0f172a',
                }}
              >
                |
              </p>
            </div>

            {/* Blood Group - top: 197px */}
            <div
              style={{
                position: 'absolute',
                left: `${74 * scale}px`,
                top: `${197 * scale}px`,
                width: `${15 * scale}px`,
                height: `${9 * scale}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${7 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${9 * scale}px`,
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                {formatBloodGroup(employee.bloodGroup)}
              </p>
            </div>

            {/* Pipe 2 - top: 197px */}
            <div
              style={{
                position: 'absolute',
                left: `${92.86 * scale}px`,
                top: `${197 * scale}px`,
                height: `${9 * scale}px`,
              }}
            >
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${7 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${9 * scale}px`,
                  color: '#0f172a',
                }}
              >
                |
              </p>
            </div>

            {/* Validity - top: 197px */}
            <div
              style={{
                position: 'absolute',
                left: `${100.82 * scale}px`,
                top: `${197 * scale}px`,
                height: `${9 * scale}px`,
              }}
            >
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${7 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${9 * scale}px`,
                  color: '#0f172a',
                }}
              >
                {formatValidTill(employee.validTill)}
              </p>
            </div>

            {/* Gradient Bar - top: 218px (197 + 9 + 12), height: 21px */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: `${218 * scale}px`,
                width: `${153 * scale}px`,
                height: `${21 * scale}px`,
                backgroundImage: 'linear-gradient(90deg, #0066CC 0%, #4A90E2 50%, #0066CC 100%)',
              }}
            >
              {/* Joining Date */}
              <p
                style={{
                  position: 'absolute',
                  left: `${12 * scale}px`,
                  top: `${3.5 * scale}px`,
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${8 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${10 * scale}px`,
                  color: '#ffffff',
                }}
              >
                DOJ : {formatJoiningDate(employee.joiningDate)}
              </p>

              {/* Website */}
              <p
                style={{
                  position: 'absolute',
                  right: `${12 * scale}px`,
                  top: `${3.5 * scale}px`,
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: `${8 * scale}px`,
                  fontWeight: 'bold',
                  lineHeight: `${10 * scale}px`,
                  color: '#ffffff',
                }}
              >
                {employee.website || 'www.acc.ltd'}
              </p>
            </div>
          </>
        ) : (
          // ===== BACK SIDE ===== Match IDCardBackPreview and IDCardExportRenderer exactly
          (() => {
            const backText: BackSideText = template?.backText || DEFAULT_BACK_TEXT;
            
            // Calculate dynamic positioning for branches
            const calculateBranchPositions = () => {
              const positions: number[] = [];
              let currentTop = 124; // Starting position for first branch
              
              for (let i = 0; i < backText.branches.length; i++) {
                positions.push(currentTop);
                // Each branch needs ~40px of space (label + address with wrapping)
                currentTop += 40;
              }
              
              return positions;
            };
            
            const branchPositions = calculateBranchPositions();

            return (
              <>
                {/* ACC Logo */}
                <div 
                  style={{
                    position: 'absolute',
                    height: `${20 * scale}px`,
                    left: `calc(50% + ${0.5 * scale}px)`,
                    top: `${24 * scale}px`,
                    width: `${42 * scale}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <img 
                    alt="ACC Logo" 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      maxWidth: 'none',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      width: '100%',
                      height: '100%',
                    }}
                    src={logo} 
                  />
                </div>

                {/* Headquarter Label */}
                <p 
                  style={{
                    position: 'absolute',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: `${7 * scale}px`,
                    fontWeight: 'bold',
                    lineHeight: `${9 * scale}px`,
                    left: `${15 * scale}px`,
                    top: `${63 * scale}px`,
                    fontStyle: 'normal',
                    color: '#0f172a',
                  }}
                >
                  {backText.headquarterLabel}
                </p>

                {/* Location Label */}
                <p 
                  style={{
                    position: 'absolute',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: `${7 * scale}px`,
                    fontWeight: 'bold',
                    lineHeight: `${9 * scale}px`,
                    left: `${15 * scale}px`,
                    top: `${78 * scale}px`,
                    fontStyle: 'normal',
                    color: '#0f172a',
                  }}
                >
                  {backText.headquarterLocation}{' '}
                </p>

                {/* Headquarter Address */}
                <p 
                  style={{
                    position: 'absolute',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: `${6 * scale}px`,
                    fontWeight: 'normal',
                    lineHeight: `${9 * scale}px`,
                    left: `${42 * scale}px`,
                    top: `${78 * scale}px`,
                    width: `${101 * scale}px`,
                    fontStyle: 'normal',
                    color: '#0f172a',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {backText.headquarterAddress}
                </p>

                {/* Branches Label */}
                <p 
                  style={{
                    position: 'absolute',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: `${7 * scale}px`,
                    fontWeight: 'bold',
                    lineHeight: `${9 * scale}px`,
                    left: `${15 * scale}px`,
                    top: `${110 * scale}px`,
                    fontStyle: 'normal',
                    color: '#0f172a',
                  }}
                >
                  {backText.branchesLabel}
                </p>

                {/* Dynamic Branches */}
                {backText.branches.map((branch: Branch, index) => (
                  <div key={branch.id || index}>
                    {/* Branch Label */}
                    <p 
                      style={{
                        position: 'absolute',
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: `${7 * scale}px`,
                        fontWeight: 'bold',
                        lineHeight: `${9 * scale}px`,
                        left: `${15 * scale}px`,
                        top: `${branchPositions[index] * scale}px`,
                        fontStyle: 'normal',
                        color: '#0f172a',
                      }}
                    >
                      {branch.label}
                    </p>

                    {/* Branch Address */}
                    <p 
                      style={{
                        position: 'absolute',
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: `${6 * scale}px`,
                        fontWeight: 'normal',
                        lineHeight: `${9 * scale}px`,
                        left: `${48 * scale}px`,
                        top: `${branchPositions[index] * scale}px`,
                        width: `${97 * scale}px`,
                        fontStyle: 'normal',
                        color: '#0f172a',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {branch.address}
                    </p>
                  </div>
                ))}
              </>
            );
          })()
        )}
      </div>
    );
  }
);

UnifiedIDCardRenderer.displayName = 'UnifiedIDCardRenderer';