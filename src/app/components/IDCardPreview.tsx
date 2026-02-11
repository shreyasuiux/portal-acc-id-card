import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from 'figma:asset/6dce495d999ed88e54f35e49635962b824088162.png';
import { IDCardBackPreview } from './IDCardBackPreview';
import { templates, type Template, type FrontSideText } from '../utils/templateData';
import { ImageCropModal } from './ImageCropModal';
import { DEFAULT_FRONT_TEXT } from '../utils/defaultFrontText';

/**
 * CRITICAL FIX: Photo Display for Preview
 * 
 * STRICT RULES (NON-NEGOTIABLE):
 * 1. Photo stored at HIGH RESOLUTION (1280×1600px minimum)
 * 2. 64×80px is VISUAL FRAME ONLY (not image pixels)
 * 3. Image fitting uses CENTER CROP / CLIP / MASK
 * 4. NO resizing, NO canvas rasterization for display
 * 5. Preview SCALES the high-res image visually
 * 6. Source file NEVER modified or downscaled
 */
function PhotoCanvasPreview({ photoUrl, scale }: { photoUrl: string; scale: number }) {
  // CRITICAL: Use <img> with object-fit: cover for proper clip/mask behavior
  // This preserves the high-resolution source while displaying in 64×80px frame
  return (
    <img
      src={photoUrl}
      alt="Employee"
      style={{
        width: `${64 * scale}px`,      // Visual frame width (scaled)
        height: `${80 * scale}px`,     // Visual frame height (scaled)
        objectFit: 'cover',            // ✅ CENTER CROP (no stretching!)
        objectPosition: 'center',      // Center the crop
        display: 'block',
      }}
    />
  );
}

interface IDCardPreviewProps {
  employeeData: {
    name: string;
    employeeId: string;
    mobile: string;
    bloodGroup: string;
    website: string;
    joiningDate: string;
    validTill: string;
    photo: File | null;
  };
  photoBase64?: string;
  template?: Template;
  customFrontText?: FrontSideText;
  onPhotoUpdate?: (photoBase64: string) => void;
}

export function IDCardPreview({ employeeData, photoBase64, template, customFrontText, onPhotoUpdate }: IDCardPreviewProps) {
  const [zoom, setZoom] = useState<100 | 200>(100);
  const [photoUrl, setPhotoUrl] = useState<string>(photoBase64 || '');
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);

  // CRITICAL: Always use the provided template, NO fallback
  // This ensures preview matches export exactly
  const activeTemplate = template || templates[0];
  
  // Get front text labels (use custom if provided, otherwise use defaults)
  const frontText = customFrontText || activeTemplate.frontText || DEFAULT_FRONT_TEXT;
  
  // DEBUG: Log template changes to ensure synchronization
  useEffect(() => {
    console.log('🖼️ IDCardPreview: Template changed to:', template?.name || 'default');
    console.log('🔍 Active template ID:', activeTemplate.id);
    console.log('✓ Preview will render with this template');
  }, [template, activeTemplate]);
  
  // Update photoUrl when photoBase64 prop changes
  useEffect(() => {
    if (photoBase64) {
      setPhotoUrl(photoBase64);
    }
  }, [photoBase64]);

  // Convert file to URL for preview (only if not using photoBase64)
  useEffect(() => {
    if (employeeData.photo && !photoBase64 && employeeData.photo instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(employeeData.photo);
    }
  }, [employeeData.photo, photoBase64]);

  const isEmpty = !employeeData.name && !employeeData.employeeId;
  
  // Scale factor
  const scale = zoom === 200 ? 2 : 1;

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

  // Format joining date
  const formatJoiningDate = (date: string) => {
    if (!date) return '12 Jan 2024';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  // Handle photo edit
  const handleEditPhoto = () => {
    if (photoUrl) {
      setIsEditingPhoto(true);
    }
  };

  const handlePhotoUpdate = (croppedPhoto: string) => {
    setPhotoUrl(croppedPhoto);
    if (onPhotoUpdate) {
      onPhotoUpdate(croppedPhoto);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="sticky top-8"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-medium text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Live Preview
        </p>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(100)}
            className={`px-3 py-1.5 text-[12px] rounded-lg transition-all ${
              zoom === 100
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            100%
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(200)}
            className={`px-3 py-1.5 text-[12px] rounded-lg transition-all ${
              zoom === 200
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            200%
          </motion.button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-4 flex gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('front')}
          className={`flex-1 px-4 py-2.5 text-[12px] font-medium rounded-lg transition-all ${
            activeTab === 'front'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Front Side
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('back')}
          className={`flex-1 px-4 py-2.5 text-[12px] font-medium rounded-lg transition-all ${
            activeTab === 'back'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Back Side
        </motion.button>
      </div>

      <motion.div
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 flex items-center justify-center overflow-auto relative"
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.2)',
            '0 0 40px rgba(168, 85, 247, 0.3)',
            '0 0 20px rgba(59, 130, 246, 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              animate={{
                x: [Math.random() * 400, Math.random() * 400],
                y: [Math.random() * 400, Math.random() * 400],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'back' ? (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.4 }}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center',
              }}
            >
              <IDCardBackPreview scale={scale} backText={template?.backText} />
            </motion.div>
          ) : (
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.4 }}
              layout
              className="bg-white shadow-2xl relative z-10"
              style={{
                width: `${153 * scale}px`,
                height: `${244 * scale}px`,
                overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="wait">
                {isEmpty ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center p-4"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" style={{ width: `${32 * scale}px`, height: `${32 * scale}px` }} />
                      </motion.div>
                      <p className="text-slate-400 text-center" style={{ fontSize: `${10 * scale}px` }}>
                        Fill in employee details to see preview
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filled"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    {/* 1️⃣ LOGO - left-[100px] top-[10px] w-[42px] h-[20px] */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.div>

                    {/* 2️⃣ PHOTO - left-[44.5px] top-[68px] w-[64px] h-[80px] - Original specs */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute flex items-center justify-center overflow-hidden group/photo cursor-pointer"
                      style={{
                        left: `${44.5 * scale}px`,
                        top: `${68 * scale}px`,
                        width: `${64 * scale}px`,
                        height: `${80 * scale}px`,
                      }}
                      onMouseEnter={() => setIsPhotoHovered(true)}
                      onMouseLeave={() => setIsPhotoHovered(false)}
                      onClick={handleEditPhoto}
                    >
                      {photoUrl ? (
                        <>
                          <PhotoCanvasPreview photoUrl={photoUrl} scale={scale} />
                          
                          {/* Edit Photo Overlay */}
                          <AnimatePresence>
                            {isPhotoHovered && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0.8 }}
                                  className="flex flex-col items-center gap-1"
                                >
                                  <Pencil 
                                    className="text-white" 
                                    style={{ 
                                      width: `${16 * scale}px`, 
                                      height: `${16 * scale}px` 
                                    }} 
                                  />
                                  <span 
                                    className="text-white font-medium"
                                    style={{ fontSize: `${6 * scale}px` }}
                                  >
                                    Edit Photo
                                  </span>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
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
                    </motion.div>

                    {/* 3️⃣ NAME - left-0 top-[160px] w-[153px] h-[20px] */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="absolute flex items-start overflow-clip"
                      style={{
                        left: 0,
                        top: `${160 * scale}px`,
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
                          fontSize: `${getNameFontSize(employeeData.name) * scale}px`,
                          fontWeight: 'bold',
                          lineHeight: `${20 * scale}px`,
                          color: '#213876',
                          minWidth: '1px',
                          minHeight: '1px',
                        }}
                      >
                        {formatName(employeeData.name)}
                      </p>
                    </motion.div>

                    {/* 4️⃣ EMPLOYEE ID - left-0 top-[192px] w-[153px] h-[10px] - Equal 8px gap */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute overflow-clip"
                      style={{
                        left: 0,
                        top: `${192 * scale}px`,
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
                        Emp ID : {employeeData.employeeId || '1111'}
                      </p>
                    </motion.div>

                    {/* 5️⃣ CONTACT ROW - top-[210px] - Equal 8px gap */}
                    {/* Phone - left-[11px] top-[210px] w-[52.75px] h-[9px] */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="absolute"
                      style={{
                        left: `${11 * scale}px`,
                        top: `${210 * scale}px`,
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
                        {formatPhoneNumber(employeeData.mobile)}
                      </p>
                    </motion.div>

                    {/* Pipe 1 - left-[69.75px] top-[210px] */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="absolute"
                      style={{
                        left: `${69.75 * scale}px`,
                        top: `${210 * scale}px`,
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
                    </motion.div>

                    {/* Blood Group - left-[74px] top-[210px] w-[15px] */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${74 * scale}px`,
                        top: `${210 * scale}px`,
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
                        {employeeData.bloodGroup || 'B+'}
                      </p>
                    </motion.div>

                    {/* Pipe 2 - left-[92.86px] top-[210px] */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="absolute"
                      style={{
                        left: `${92.86 * scale}px`,
                        top: `${210 * scale}px`,
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
                    </motion.div>

                    {/* Website - left-[100.82px] top-[210px] */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="absolute"
                      style={{
                        left: `${100.82 * scale}px`,
                        top: `${210 * scale}px`,
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
                    </motion.div>

                    {/* 6️⃣ VALID TILL - left-0 top-[227px] w-[153px] h-[7px] */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="absolute"
                      style={{
                        left: 0,
                        top: `${227 * scale}px`,
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
                        Valid till {formatValidTill(employeeData.validTill)}
                      </p>
                    </motion.div>

                    {/* 7️⃣ JOINING DATE - left-[128.74px] top-[143.74px], rotated -90deg */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
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
                          {formatJoiningDate(employeeData.joiningDate)}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Crop Modal */}
      {photoUrl && (
        <ImageCropModal
          isOpen={isEditingPhoto}
          onClose={() => setIsEditingPhoto(false)}
          imageUrl={photoUrl}
          onApply={handlePhotoUpdate}
          employeeData={{
            name: employeeData.name,
            employeeId: employeeData.employeeId,
          }}
          template={activeTemplate}
        />
      )}
    </motion.div>
  );
}