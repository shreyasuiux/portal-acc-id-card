import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { EmployeeRecord } from '../utils/employeeStorage';
import type { Template } from '../utils/templateData';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onApply: (croppedImageUrl: string) => void;
  employeeData?: Partial<EmployeeRecord>;
  template: Template;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onApply,
  employeeData,
  template,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>(imageUrl);

  // Reset when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedImageUrl(imageUrl);
    }
  }, [isOpen, imageUrl]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
    // Generate real-time preview
    generateCroppedImage(imageUrl, croppedAreaPixels);
  }, [imageUrl]);

  const generateCroppedImage = async (imageSrc: string, pixelCrop: Area) => {
    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      // Target dimensions for high-quality export (4:5 aspect ratio)
      const TARGET_WIDTH = 1280;
      const TARGET_HEIGHT = 1600;

      // Set canvas to target dimensions for high quality
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Clear canvas to ensure transparency
      ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Draw cropped and resized image with transparency preserved
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // Convert to base64 PNG to preserve transparency
      const croppedUrl = canvas.toDataURL('image/png');
      setCroppedImageUrl(croppedUrl);
    } catch (error) {
      console.error('Error generating cropped image:', error);
    }
  };

  const handleApply = async () => {
    if (croppedAreaPixels) {
      const croppedUrl = await createCroppedImage(imageUrl, croppedAreaPixels);
      if (croppedUrl) {
        onApply(croppedUrl);
        onClose();
      }
    }
  };

  const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<string | null> => {
    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return null;

      // Target dimensions for high-quality export (4:5 aspect ratio)
      const TARGET_WIDTH = 1280;
      const TARGET_HEIGHT = 1600;

      // Set canvas to target dimensions for high quality
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Clear canvas to ensure transparency
      ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Draw cropped and resized image with transparency preserved
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // Convert to base64 PNG to preserve transparency
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error creating cropped image:', error);
      return null;
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedImageUrl(imageUrl);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-6xl max-h-[90vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 relative z-20">
                <div>
                  <h2 className="text-xl font-semibold text-white">Adjust Your Photo</h2>
                  <p className="text-sm text-slate-400 mt-1">Zoom and reposition for the perfect ID card photo</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors relative z-30"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Left: Crop Editor */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Cropper Container */}
                  <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-700/50" style={{ height: '500px' }}>
                    <Cropper
                      image={imageUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 5}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: {
                          background: '#0f172a',
                        },
                        cropAreaStyle: {
                          border: '2px solid #3b82f6',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        },
                      }}
                    />
                  </div>

                  {/* Zoom Controls */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleZoomOut}
                        type="button"
                        className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors relative z-10"
                      >
                        <ZoomOut className="w-5 h-5 text-slate-300" />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Zoom Level</span>
                          <span className="text-sm font-medium text-blue-400">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 1) / 2) * 100}%, #475569 ${((zoom - 1) / 2) * 100}%, #475569 100%)`,
                          }}
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-500">100%</span>
                          <span className="text-xs text-slate-500">300%</span>
                        </div>
                      </div>

                      <button
                        onClick={handleZoomIn}
                        type="button"
                        className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors relative z-10"
                      >
                        <ZoomIn className="w-5 h-5 text-slate-300" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Drag the image to reposition • Use mouse wheel or pinch to zoom
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Real-time Preview */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-sm font-medium text-white mb-3">ID Card Preview</h3>
                    
                    {/* Mini ID Card Preview */}
                    <div className="relative" style={{ aspectRatio: '153/244' }}>
                      <div 
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-xl"
                        style={{
                          background: template.frontGradient,
                        }}
                      >
                        {/* Photo Section */}
                        <div className="relative h-full flex flex-col items-center justify-start pt-8">
                          <div 
                            className="relative overflow-hidden rounded-lg border-2 border-white/30 shadow-lg"
                            style={{ 
                              width: '60%',
                              aspectRatio: '4/5',
                            }}
                          >
                            <img
                              src={croppedImageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Employee Info */}
                          <div className="mt-4 text-center px-4">
                            <p className="text-white font-semibold text-xs mb-0.5">
                              {employeeData?.name || 'Employee Name'}
                            </p>
                            <p className="text-white/80 text-[10px]">
                              ID: {employeeData?.employeeId || 'EMP001'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400">
                        This is how your photo will appear on the ID card
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Tips</h4>
                    <ul className="text-xs text-blue-200/80 space-y-1.5">
                      <li>• Center your face in the frame</li>
                      <li>• Ensure good lighting visibility</li>
                      <li>• Zoom in for a closer portrait</li>
                      <li>• Avoid cutting off the head</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 relative z-20">
                <button
                  onClick={handleReset}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors relative z-30"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm font-medium">Reset</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    type="button"
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors relative z-30"
                  >
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleApply}
                    type="button"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl relative z-30"
                  >
                    <span className="text-sm font-medium">✓ Apply Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}