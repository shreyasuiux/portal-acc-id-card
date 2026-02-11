import { type Template } from '../utils/templateData';

interface TemplatePreviewCardProps {
  template: Template;
  side: 'front' | 'back';
  scale?: number;
}

export function TemplatePreviewCard({ template, side, scale = 1 }: TemplatePreviewCardProps) {
  const design = side === 'front' ? template.front : template.back;
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        width: `${153 * scale}px`,
        height: `${244 * scale}px`,
      }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: design.backgroundColor,
        }}
      />

      {/* Background Pattern */}
      {design.backgroundPattern === 'dots' && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
      )}
      {design.backgroundPattern === 'lines' && (
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 10px)',
          }}
        />
      )}

      {/* Accent Elements */}
      {design.accentElements.map((element, index) => {
        if (element.type === 'rectangle') {
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${element.position.x * scale}px`,
                top: `${element.position.y * scale}px`,
                width: `${element.size.width * scale}px`,
                height: `${element.size.height * scale}px`,
                backgroundColor: element.color,
              }}
            />
          );
        }
        if (element.type === 'line') {
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${element.position.x * scale}px`,
                top: `${element.position.y * scale}px`,
                width: `${element.size.width * scale}px`,
                height: `${element.size.height * scale}px`,
                backgroundColor: element.color,
              }}
            />
          );
        }
        if (element.type === 'circle') {
          return (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${element.position.x * scale}px`,
                top: `${element.position.y * scale}px`,
                width: `${element.size.width * scale}px`,
                height: `${element.size.height * scale}px`,
                backgroundColor: element.color,
              }}
            />
          );
        }
        return null;
      })}

      {/* Logo Placeholder */}
      {side === 'front' && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${(design.logoPosition.x - design.logoSize / 2) * scale}px`,
            top: `${design.logoPosition.y * scale}px`,
            width: `${design.logoSize * scale}px`,
            height: `${design.logoSize * scale}px`,
          }}
        >
          <div 
            className="rounded"
            style={{
              width: '100%',
              height: '100%',
              background: template.colors.primary,
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {/* Photo Placeholder */}
      {side === 'front' && design.photoSize.width > 0 && (
        <div
          className="absolute bg-slate-400/30"
          style={{
            left: `${(design.photoPosition.x - design.photoSize.width / 2) * scale}px`,
            top: `${design.photoPosition.y * scale}px`,
            width: `${design.photoSize.width * scale}px`,
            height: `${design.photoSize.height * scale}px`,
            borderRadius: 
              design.photoShape === 'circle' ? '50%' : 
              design.photoShape === 'rounded' ? `${4 * scale}px` : 
              '0',
          }}
        />
      )}

      {/* Name Placeholder */}
      {side === 'front' && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${20 * scale}px`,
            right: `${20 * scale}px`,
            top: `${design.nameStyle.position.y * scale}px`,
            height: `${design.nameStyle.fontSize * scale * 1.2}px`,
          }}
        >
          <div 
            className="h-2 rounded"
            style={{
              width: '60%',
              backgroundColor: design.nameStyle.color,
              opacity: 0.4,
            }}
          />
        </div>
      )}

      {/* Employee ID Placeholder */}
      {side === 'front' && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${20 * scale}px`,
            right: `${20 * scale}px`,
            top: `${design.employeeIdStyle.position.y * scale}px`,
            height: `${design.employeeIdStyle.fontSize * scale * 1.2}px`,
          }}
        >
          <div 
            className="h-1.5 rounded"
            style={{
              width: '40%',
              backgroundColor: design.employeeIdStyle.color,
              opacity: 0.4,
            }}
          />
        </div>
      )}

      {/* Back Side Content */}
      {side === 'back' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 space-y-2">
          {/* Logo */}
          <div
            className="rounded"
            style={{
              width: `${design.logoSize * scale}px`,
              height: `${design.logoSize * scale}px`,
              background: template.colors.primary,
              opacity: 0.3,
            }}
          />
          {/* Text Lines */}
          <div className="w-3/4 h-1 bg-slate-400/20 rounded" />
          <div className="w-2/3 h-1 bg-slate-400/20 rounded" />
          <div className="w-3/4 h-1 bg-slate-400/20 rounded" />
        </div>
      )}
    </div>
  );
}
