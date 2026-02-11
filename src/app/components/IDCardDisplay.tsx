import logo from '../../assets/6dce495d999ed88e54f35e49635962b824088162.png';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { BackSideText, Branch } from '../utils/templateData';
import { DEFAULT_BACK_TEXT } from '../utils/defaultBackText';

interface IDCardDisplayProps {
  employee: EmployeeRecord;
  side: 'front' | 'back';
  scale?: number;
}

/**
 * IDCardDisplay - Displays the exact layout used in single employee preview
 * This matches the pixel-perfect positioning from IDCardPreview.tsx
 */
export function IDCardDisplay({ employee, side, scale = 1 }: IDCardDisplayProps) {
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
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const formatJoiningDate = (date: string) => {
    if (!date) return '12 Jan 2024';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  // Calculate dynamic font size
  const getNameFontSize = (name: string) => {
    const formattedName = formatName(name);
    const MAX_WIDTH = 125;
    const BASE_FONT_SIZE = 18;
    const MIN_FONT_SIZE = 10;
    const SAFETY_BUFFER = 1.05;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return BASE_FONT_SIZE;
    
    for (let fontSize = BASE_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize--) {
      context.font = `bold ${fontSize}px Roboto`;
      const metrics = context.measureText(formattedName);
      const textWidth = metrics.width * SAFETY_BUFFER;
      
      if (textWidth <= MAX_WIDTH) {
        return fontSize;
      }
    }
    
    return MIN_FONT_SIZE;
  };

  if (side === 'back') {
    // Use the default back text (headquarters and branches)
    const backText: BackSideText = DEFAULT_BACK_TEXT;
    
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
        className="bg-white shadow-2xl relative"
        style={{
          width: `${153 * scale}px`,
          height: `${244 * scale}px`,
          overflow: 'hidden',
          fontFamily: 'Roboto',
        }}
      >
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
            fontFamily: 'Roboto',
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
            fontFamily: 'Roboto',
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
            fontFamily: 'Roboto',
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
            fontFamily: 'Roboto',
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
                fontFamily: 'Roboto',
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
                fontFamily: 'Roboto',
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
      </div>
    );
  }

  // FRONT SIDE
  return (
    <div
      className="bg-white shadow-2xl relative"
      style={{
        width: `${153 * scale}px`,
        height: `${244 * scale}px`,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        className="absolute"
        style={{
          left: `${100 * scale}px`,
          top: `${10 * scale}px`,
          width: `${42 * scale}px`,
          height: `${20 * scale}px`,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
        />
      </div>

      {/* Photo - top: 57px, height: 80px */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${44.5 * scale}px`,
          top: `${57 * scale}px`,
          width: `${64 * scale}px`,
          height: `${80 * scale}px`,
        }}
      >
        {employee.photoBase64 ? (
          <img
            src={employee.photoBase64}
            alt="Employee"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 25%',
            }}
          />
        ) : (
          <div className="flex items-center justify-center size-full bg-[#f1f5f9]">
            <p
              style={{
                fontFamily: 'Roboto',
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
        className="absolute flex items-start overflow-visible"
        style={{
          left: 0,
          top: `${143 * scale}px`,
          width: `${153 * scale}px`,
          height: `${20 * scale}px`,
          paddingLeft: `${12 * scale}px`,
          paddingRight: `${12 * scale}px`,
        }}
      >
        <p
          className="flex-1 text-center whitespace-pre-wrap"
          style={{
            fontFamily: 'Roboto',
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
        className="absolute overflow-visible"
        style={{
          left: 0,
          top: `${175 * scale}px`,
          width: `${153 * scale}px`,
          height: `${10 * scale}px`,
        }}
      >
        <p
          className="absolute text-center"
          style={{
            fontFamily: 'Roboto',
            fontSize: `${8 * scale}px`,
            fontWeight: 'bold',
            lineHeight: `${10 * scale}px`,
            color: '#0f172a',
            left: '50%',
            top: 0,
            transform: 'translateX(-50%)',
          }}
        >
          Emp ID : {employee.employeeId || '1111'}
        </p>
      </div>

      {/* Phone - top: 197px (175 + 10 + 12), height: 9px */}
      <div
        className="absolute"
        style={{
          left: `${11 * scale}px`,
          top: `${197 * scale}px`,
          height: `${9 * scale}px`,
        }}
      >
        <p
          style={{
            fontFamily: 'Roboto',
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
        className="absolute"
        style={{
          left: `${69.75 * scale}px`,
          top: `${197 * scale}px`,
          height: `${9 * scale}px`,
        }}
      >
        <p
          style={{
            fontFamily: 'Roboto',
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
        className="absolute flex items-center justify-center"
        style={{
          left: `${74 * scale}px`,
          top: `${197 * scale}px`,
          width: `${15 * scale}px`,
          height: `${9 * scale}px`,
        }}
      >
        <p
          style={{
            fontFamily: 'Roboto',
            fontSize: `${7 * scale}px`,
            fontWeight: 'bold',
            lineHeight: `${9 * scale}px`,
            color: '#0f172a',
            textAlign: 'center',
          }}
        >
          {employee.bloodGroup || 'B+'}
        </p>
      </div>

      {/* Pipe 2 - top: 197px */}
      <div
        className="absolute"
        style={{
          left: `${92.86 * scale}px`,
          top: `${197 * scale}px`,
          height: `${9 * scale}px`,
        }}
      >
        <p
          style={{
            fontFamily: 'Roboto',
            fontSize: `${7 * scale}px`,
            fontWeight: 'bold',
            lineHeight: `${9 * scale}px`,
            color: '#0f172a',
          }}
        >
          |
        </p>
      </div>

      {/* Website - top: 197px */}
      <div
        className="absolute"
        style={{
          left: `${100.82 * scale}px`,
          top: `${197 * scale}px`,
          height: `${9 * scale}px`,
        }}
      >
        <p
          style={{
            fontFamily: 'Roboto',
            fontSize: `${7 * scale}px`,
            fontWeight: 'bold',
            lineHeight: `${9 * scale}px`,
            color: '#0f172a',
          }}
        >
          www.acc.ltd
        </p>
      </div>

      {/* Valid Till - top: 218px (197 + 9 + 12), height: 7px */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: `${218 * scale}px`,
          width: `${153 * scale}px`,
          height: `${7 * scale}px`,
        }}
      >
        <p
          className="absolute text-center whitespace-pre-wrap"
          style={{
            fontFamily: 'Roboto',
            fontSize: `${5 * scale}px`,
            lineHeight: `${7 * scale}px`,
            color: '#0f172a',
            left: '50%',
            top: `${0.25 * scale}px`,
            transform: 'translateX(-50%)',
            width: `${40 * scale}px`,
          }}
        >
          Valid till {formatValidTill(employee.validTill)}
        </p>
      </div>

      {/* Joining Date (Rotated) */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: `${128.74 * scale}px`,
          top: `${143.74 * scale}px`,
          width: `${27.527 * scale}px`,
          height: `${7 * scale}px`,
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
              fontSize: `${5 * scale}px`,
              lineHeight: `${7 * scale}px`,
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
