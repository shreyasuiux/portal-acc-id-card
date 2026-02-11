import { forwardRef, useEffect, useRef } from 'react';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { Template, BackSideText, Branch, FrontSideText } from '../utils/templateData';
import { templates } from '../utils/templateData';
import { DEFAULT_BACK_TEXT } from '../utils/defaultBackText';
import { DEFAULT_FRONT_TEXT } from '../utils/defaultFrontText';
import logo from '../../assets/6dce495d999ed88e54f35e49635962b824088162.png';

/**
 * PRINT-READY: Photo Canvas Renderer
 * 
 * QUALITY RULES:
 * - Display size: 64×80px (preview on screen)
 * - Stored size: 640×800px (PRINT-READY, no upscaling needed)
 * - PDF export at 8x scale: 512×640px effective resolution
 * - Source image: 640×800px (BETTER than PDF size!)
 * - Result: CRYSTAL CLEAR photos in PDF at 300 DPI
 * 
 * NO upscaling ever happens - we always scale DOWN from high-res source
 */
function PhotoCanvas({ photoUrl }: { photoUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoUrl) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Load the HIGH-RES 640×800px image
    const img = new Image();
    img.onload = () => {
      console.log('🖼️  PHOTO RENDERING QUALITY CHECK:');
      console.log(`📥 Source image: ${img.naturalWidth}×${img.naturalHeight}px`);
      console.log(`📐 Canvas display: 64×80px`);
      console.log(`📄 PDF export (8x): ${64 * 8}×${80 * 8}px = ${512}×${640}px`);
      
      // Quality validation
      if (img.naturalWidth < 640 || img.naturalHeight < 800) {
        console.error('❌ CRITICAL: Photo below required 640×800px!');
        console.error('⚠️  This will result in BLURRY exports!');
      } else {
        console.log('✅ Photo quality: EXCELLENT (print-ready)');
        console.log(`✅ Quality ratio: ${((img.naturalWidth / 512) * 100).toFixed(0)}% of PDF size`);
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, 64, 80);
      
      // Enable high-quality image smoothing for downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw HIGH-RES image (640×800px) scaled down to display size (64×80px)
      // NO UPSCALING - we scale DOWN from high-res source for perfect quality
      ctx.drawImage(
        img,
        0, 0,     // Source position (0,0)
        img.naturalWidth, img.naturalHeight,   // Source size (640×800px)
        0, 0,     // Destination position (0,0)
        64, 80    // Destination size (64×80px - downscaled for display)
      );
      
      console.log('✅ Photo rendered successfully (high-quality downscaling)');
    };
    img.src = photoUrl;
  }, [photoUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={80}
      style={{
        width: '64px',
        height: '80px',
        display: 'block',
      }}
    />
  );
}

interface IDCardExportRendererProps {
  employee: EmployeeRecord;
  side: 'front' | 'back';
  template?: Template;
  photoUrl?: string;
}

/**
 * Hidden component used for rendering ID cards for PDF export
 * This renders at exact pixel dimensions (153x244px) for high-quality export
 * MUST MATCH IDCardPreview and IDCardBackPreview exactly
 */
export const IDCardExportRenderer = forwardRef<HTMLDivElement, IDCardExportRendererProps>(
  ({ employee, side, template, photoUrl }, ref) => {
    // Format name - First name + First letter of last name with period
    const formatName = (name: string) => {
      if (!name) return 'Shreyas V.';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        // Just first name - capitalize first letter
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

    // Format dates
    const formatValidTill = (date: string) => {
      if (!date) return 'Dec 2030';
      
      // Handle multiple date formats
      let d: Date;
      
      // Try DD/MM/YYYY format first (common in forms)
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          // Assuming DD/MM/YYYY
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          d = new Date(year, month, day);
        } else {
          d = new Date(date);
        }
      } else {
        d = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        return 'Dec 2030';
      }
      
      return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    };

    const formatJoiningDate = (date: string) => {
      if (!date) return '12 Jan 2024';
      
      // Handle multiple date formats
      let d: Date;
      
      // Try DD/MM/YYYY format first (common in forms)
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          // Assuming DD/MM/YYYY
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          d = new Date(year, month, day);
        } else {
          d = new Date(date);
        }
      } else {
        d = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        return '12 Jan 2024';
      }
      
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (side === 'back') {
      // BACK SIDE - Match IDCardBackPreview exactly
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
        <div
          ref={ref}
          style={{
            width: '153px',
            height: '244px',
            backgroundColor: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Roboto',
          }}
        >
          {/* ACC Logo */}
          <div 
            style={{
              position: 'absolute',
              height: '20px',
              left: 'calc(50% + 0.5px)',
              top: '24px',
              width: '42px',
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
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              left: '15px',
              top: '63px',
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
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              left: '15px',
              top: '78px',
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
              fontFamily: 'Roboto',
              fontSize: '6px',
              fontWeight: 'normal',
              lineHeight: '9px',
              left: '42px',
              top: '78px',
              width: '101px',
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
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              left: '15px',
              top: '110px',
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
                  fontFamily: 'Roboto',
                  fontSize: '7px',
                  fontWeight: 'bold',
                  lineHeight: '9px',
                  left: '15px',
                  top: `${branchPositions[index]}px`,
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
                  fontFamily: 'Roboto',
                  fontSize: '6px',
                  fontWeight: 'normal',
                  lineHeight: '9px',
                  left: '48px',
                  top: `${branchPositions[index]}px`,
                  width: '97px',
                  fontStyle: 'normal',
                  color: '#0f172a',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {branch.address}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // FRONT SIDE - Match IDCardPreview exactly
    return (
      <div
        ref={ref}
        style={{
          width: '153px',
          height: '244px',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Roboto',
        }}
      >
        {/* 1️⃣ LOGO - left-[100px] top-[10px] w-[42px] h-[20px] */}
        <div
          style={{
            position: 'absolute',
            left: '100px',
            top: '10px',
            width: '42px',
            height: '20px',
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

        {/* 2️⃣ PHOTO - left-[44.5px] top-[57px] w-[64px] h-[80px] - Moved up 24px total */}
        <div
          data-photo-container="true"
          style={{
            position: 'absolute',
            left: '44.5px',
            top: '57px',
            width: '64px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            <img
              data-employee-photo="true"
              src={photoUrl}
              alt="Employee"
              style={{
                width: '64px',
                height: '80px',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
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
                  fontFamily: 'Roboto',
                  fontSize: '8px',
                  lineHeight: '12px',
                  color: '#94a3b8',
                }}
              >
                No photo
              </p>
            </div>
          )}
        </div>

        {/* 3️⃣ NAME - left-0 top-[143px] w-[153px] h-[20px] - 6px gap from photo (57+80+6=143) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '143px',
            width: '153px',
            height: '20px',
            paddingLeft: '12px',
            paddingRight: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            overflow: 'visible',
          }}
        >
          <p
            style={{
              flex: 1,
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Roboto',
              fontSize: `${getNameFontSize(employee.name)}px`,
              fontWeight: 'bold',
              lineHeight: '20px',
              color: '#213876',
              minWidth: '1px',
              minHeight: '1px',
            }}
          >
            {formatName(employee.name)}
          </p>
        </div>

        {/* 4️⃣ EMPLOYEE ID - left-0 top-[175px] w-[153px] h-[10px] - 12px gap from name (143+20+12=175) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '175px',
            width: '153px',
            height: '10px',
            overflow: 'visible',
          }}
        >
          <p
            style={{
              position: 'absolute',
              textAlign: 'center',
              fontFamily: 'Roboto',
              fontSize: '8px',
              fontWeight: 'bold',
              lineHeight: '10px',
              color: '#0f172a',
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            Emp ID : {employee.employeeId || '1111'}
          </p>
        </div>

        {/* 5️⃣ CONTACT ROW - top-[197px] - 12px gap from employee ID (175+10+12=197) */}
        {/* Phone - left-[11px] top-[197px] w-[52.75px] h-[9px] */}
        <div
          style={{
            position: 'absolute',
            left: '11px',
            top: '197px',
            height: '9px',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              color: '#0f172a',
            }}
          >
            {formatPhoneNumber(employee.mobile)}
          </p>
        </div>

        {/* Pipe 1 - left-[69.75px] top-[197px] */}
        <div
          style={{
            position: 'absolute',
            left: '69.75px',
            top: '197px',
            height: '9px',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              color: '#0f172a',
            }}
          >
            |
          </p>
        </div>

        {/* Blood Group - left-[74px] top-[197px] w-[15px] */}
        <div
          style={{
            position: 'absolute',
            left: '74px',
            top: '197px',
            width: '15px',
            height: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              color: '#0f172a',
              textAlign: 'center',
            }}
          >
            {employee.bloodGroup || 'B+'}
          </p>
        </div>

        {/* Pipe 2 - left-[92.86px] top-[197px] */}
        <div
          style={{
            position: 'absolute',
            left: '92.86px',
            top: '197px',
            height: '9px',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              color: '#0f172a',
            }}
          >
            |
          </p>
        </div>

        {/* Website - left-[100.82px] top-[197px] */}
        <div
          style={{
            position: 'absolute',
            left: '100.82px',
            top: '197px',
            height: '9px',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '7px',
              fontWeight: 'bold',
              lineHeight: '9px',
              color: '#0f172a',
            }}
          >
            www.acc.ltd
          </p>
        </div>

        {/* 6️⃣ VALID TILL - left-0 top-[218px] w-[153px] h-[7px] - 12px gap from contact (197+9+12=218) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '218px',
            width: '153px',
            height: '7px',
          }}
        >
          <p
            style={{
              position: 'absolute',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: 'Roboto',
              fontSize: '5px',
              lineHeight: '7px',
              color: '#0f172a',
              left: '50%',
              top: '0.25px',
              transform: 'translateX(-50%)',
            }}
          >
            Valid till {formatValidTill(employee.validTill)}
          </p>
        </div>

        {/* 7️⃣ JOINING DATE - left-[128.74px] top-[143.74px], rotated -90deg */}
        <div
          style={{
            position: 'absolute',
            left: '128.74px',
            top: '143.74px',
            width: '27.527px',
            height: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              transform: 'rotate(-90deg)',
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: 'Roboto',
                fontSize: '5px',
                lineHeight: '7px',
                color: '#0f172a',
              }}
            >
              {formatJoiningDate(employee.joiningDate)}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

IDCardExportRenderer.displayName = 'IDCardExportRenderer';