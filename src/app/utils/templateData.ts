export interface Template {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'modern' | 'classic';
  description: string;
  front: TemplateDesign;
  back: TemplateDesign;
  backText?: BackSideText;  // Optional custom back side text
  frontText?: FrontSideText;  // Optional custom front side text
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface FrontSideText {
  mobileLabel: string;
  bloodGroupLabel: string;
  field1Label: string;  // Customizable field (Website/Designation/Department/etc.)
  field1Enabled: boolean;
  joiningDateLabel: string;
  validTillLabel: string;
}

export interface BackSideText {
  headquarterLabel: string;
  headquarterLocation: string;
  headquarterAddress: string;
  branchesLabel: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  label: string;
  address: string;
}

export interface TemplateDesign {
  backgroundColor: string;
  backgroundPattern?: 'gradient' | 'dots' | 'lines' | 'none';
  layout: 'modern' | 'classic' | 'creative' | 'minimal';
  logoPosition: { x: number; y: number };
  logoSize: number;
  photoPosition: { x: number; y: number };
  photoSize: { width: number; height: number };
  photoShape: 'circle' | 'rounded' | 'square';
  nameStyle: {
    fontSize: number;
    fontWeight: string;
    color: string;
    position: { x: number; y: number };
  };
  employeeIdStyle: {
    fontSize: number;
    color: string;
    position: { x: number; y: number };
  };
  accentElements: Array<{
    type: 'line' | 'circle' | 'rectangle' | 'wave';
    position: { x: number; y: number };
    size: { width: number; height: number };
    color: string;
  }>;
}

export const templates: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'modern',
    description: 'Clean, simple design with focus on employee photo and essential information',
    thumbnail: 'modern-minimal',
    colors: {
      primary: '#0066CC',
      secondary: '#FFFFFF',
      accent: '#4A90E2',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'none',
      layout: 'minimal',
      logoPosition: { x: 15, y: 15 },
      logoSize: 35,
      photoPosition: { x: 76.5, y: 60 },
      photoSize: { width: 100, height: 120 },
      photoShape: 'rounded',
      nameStyle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        position: { x: 76.5, y: 185 },
      },
      employeeIdStyle: {
        fontSize: 11,
        color: '#0066CC',
        position: { x: 76.5, y: 200 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 0, y: 50 },
          size: { width: 153, height: 3 },
          color: '#0066CC',
        },
      ],
    },
    back: {
      backgroundColor: '#F8F9FA',
      backgroundPattern: 'none',
      layout: 'minimal',
      logoPosition: { x: 76.5, y: 20 },
      logoSize: 30,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666666',
        position: { x: 20, y: 60 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#999999',
        position: { x: 20, y: 75 },
      },
      accentElements: [],
    },
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    category: 'professional',
    description: 'Traditional corporate design with elegant typography and structured layout',
    thumbnail: 'corporate-professional',
    colors: {
      primary: '#0066CC',
      secondary: '#002855',
      accent: '#4A90E2',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'lines',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 20 },
      logoSize: 40,
      photoPosition: { x: 76.5, y: 70 },
      photoSize: { width: 90, height: 110 },
      photoShape: 'rounded',
      nameStyle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002855',
        position: { x: 76.5, y: 185 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 200 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 0, y: 0 },
          size: { width: 153, height: 15 },
          color: '#0066CC',
        },
        {
          type: 'rectangle',
          position: { x: 0, y: 229 },
          size: { width: 153, height: 15 },
          color: '#002855',
        },
      ],
    },
    back: {
      backgroundColor: '#F5F5F5',
      backgroundPattern: 'lines',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 122 },
      logoSize: 35,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#002855',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#0066CC',
        position: { x: 20, y: 35 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 20, y: 50 },
          size: { width: 113, height: 1 },
          color: '#0066CC',
        },
      ],
    },
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    category: 'creative',
    description: 'Bold gradient backgrounds with modern aesthetic and vibrant colors',
    thumbnail: 'creative-gradient',
    colors: {
      primary: '#0066CC',
      secondary: '#4A90E2',
      accent: '#7AB8FF',
      background: 'linear-gradient(135deg, #0066CC 0%, #4A90E2 100%)',
      text: '#FFFFFF',
    },
    front: {
      backgroundColor: 'linear-gradient(135deg, #0066CC 0%, #4A90E2 100%)',
      backgroundPattern: 'gradient',
      layout: 'creative',
      logoPosition: { x: 20, y: 20 },
      logoSize: 35,
      photoPosition: { x: 76.5, y: 65 },
      photoSize: { width: 95, height: 115 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        position: { x: 76.5, y: 185 },
      },
      employeeIdStyle: {
        fontSize: 11,
        color: '#FFFFFF',
        position: { x: 76.5, y: 200 },
      },
      accentElements: [
        {
          type: 'circle',
          position: { x: 130, y: 30 },
          size: { width: 60, height: 60 },
          color: 'rgba(255, 255, 255, 0.1)',
        },
      ],
    },
    back: {
      backgroundColor: 'linear-gradient(135deg, #4A90E2 0%, #7AB8FF 100%)',
      backgroundPattern: 'gradient',
      layout: 'creative',
      logoPosition: { x: 76.5, y: 110 },
      logoSize: 40,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#FFFFFF',
        position: { x: 20, y: 35 },
      },
      accentElements: [],
    },
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    category: 'modern',
    description: 'Cutting-edge design with geometric patterns and tech-inspired elements',
    thumbnail: 'tech-futuristic',
    colors: {
      primary: '#0066CC',
      secondary: '#00D4FF',
      accent: '#4A90E2',
      background: '#0A0E27',
      text: '#FFFFFF',
    },
    front: {
      backgroundColor: '#0A0E27',
      backgroundPattern: 'dots',
      layout: 'modern',
      logoPosition: { x: 20, y: 15 },
      logoSize: 35,
      photoPosition: { x: 76.5, y: 60 },
      photoSize: { width: 95, height: 115 },
      photoShape: 'rounded',
      nameStyle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        position: { x: 76.5, y: 180 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#00D4FF',
        position: { x: 76.5, y: 195 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 0, y: 175 },
          size: { width: 153, height: 2 },
          color: '#00D4FF',
        },
        {
          type: 'rectangle',
          position: { x: 0, y: 0 },
          size: { width: 153, height: 5 },
          color: '#0066CC',
        },
      ],
    },
    back: {
      backgroundColor: '#0F1429',
      backgroundPattern: 'dots',
      layout: 'modern',
      logoPosition: { x: 76.5, y: 110 },
      logoSize: 40,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#00D4FF',
        position: { x: 20, y: 35 },
      },
      accentElements: [],
    },
  },
  {
    id: 'executive-elite',
    name: 'Executive Elite',
    category: 'professional',
    description: 'Premium luxury design with gold accents and sophisticated styling',
    thumbnail: 'executive-elite',
    colors: {
      primary: '#0066CC',
      secondary: '#1A1A1A',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'none',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 18 },
      logoSize: 38,
      photoPosition: { x: 76.5, y: 65 },
      photoSize: { width: 92, height: 112 },
      photoShape: 'rounded',
      nameStyle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        position: { x: 76.5, y: 182 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 197 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 30, y: 177 },
          size: { width: 93, height: 1 },
          color: '#D4AF37',
        },
        {
          type: 'rectangle',
          position: { x: 0, y: 0 },
          size: { width: 5, height: 244 },
          color: '#D4AF37',
        },
      ],
    },
    back: {
      backgroundColor: '#F9F9F9',
      backgroundPattern: 'none',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 115 },
      logoSize: 35,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1A1A1A',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#0066CC',
        position: { x: 20, y: 35 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 148, y: 0 },
          size: { width: 5, height: 244 },
          color: '#D4AF37',
        },
      ],
    },
  },
  {
    id: 'clean-simple',
    name: 'Clean & Simple',
    category: 'modern',
    description: 'Ultra-minimal design focusing on clarity and readability',
    thumbnail: 'clean-simple',
    colors: {
      primary: '#0066CC',
      secondary: '#F5F5F5',
      accent: '#4A90E2',
      background: '#FFFFFF',
      text: '#333333',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'none',
      layout: 'minimal',
      logoPosition: { x: 76.5, y: 15 },
      logoSize: 32,
      photoPosition: { x: 76.5, y: 55 },
      photoSize: { width: 88, height: 108 },
      photoShape: 'square',
      nameStyle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333333',
        position: { x: 76.5, y: 170 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 185 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 25, y: 165 },
          size: { width: 103, height: 1 },
          color: '#E0E0E0',
        },
      ],
    },
    back: {
      backgroundColor: '#FAFAFA',
      backgroundPattern: 'none',
      layout: 'minimal',
      logoPosition: { x: 76.5, y: 100 },
      logoSize: 30,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 9,
        fontWeight: '600',
        color: '#333333',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 8,
        color: '#0066CC',
        position: { x: 20, y: 32 },
      },
      accentElements: [],
    },
  },
  {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    category: 'creative',
    description: 'Eye-catching design with bold colors and dynamic layout',
    thumbnail: 'bold-vibrant',
    colors: {
      primary: '#0066CC',
      secondary: '#FF6B35',
      accent: '#FFD23F',
      background: '#0066CC',
      text: '#FFFFFF',
    },
    front: {
      backgroundColor: '#0066CC',
      backgroundPattern: 'none',
      layout: 'creative',
      logoPosition: { x: 20, y: 18 },
      logoSize: 36,
      photoPosition: { x: 76.5, y: 62 },
      photoSize: { width: 96, height: 116 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        position: { x: 76.5, y: 183 },
      },
      employeeIdStyle: {
        fontSize: 11,
        color: '#FFD23F',
        position: { x: 76.5, y: 198 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 0, y: 224 },
          size: { width: 153, height: 20 },
          color: '#FF6B35',
        },
        {
          type: 'circle',
          position: { x: -20, y: 30 },
          size: { width: 80, height: 80 },
          color: 'rgba(255, 210, 63, 0.15)',
        },
      ],
    },
    back: {
      backgroundColor: '#0052A3',
      backgroundPattern: 'none',
      layout: 'creative',
      logoPosition: { x: 76.5, y: 105 },
      logoSize: 38,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#FFD23F',
        position: { x: 20, y: 35 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 0, y: 0 },
          size: { width: 153, height: 10 },
          color: '#FF6B35',
        },
      ],
    },
  },
  {
    id: 'glassmorphism-modern',
    name: 'Glassmorphism Modern',
    category: 'modern',
    description: 'Contemporary glassmorphism effect with frosted elements',
    thumbnail: 'glassmorphism-modern',
    colors: {
      primary: '#0066CC',
      secondary: '#FFFFFF',
      accent: '#4A90E2',
      background: 'linear-gradient(135deg, #E0F2FF 0%, #FFFFFF 100%)',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: 'linear-gradient(135deg, #E0F2FF 0%, #FFFFFF 100%)',
      backgroundPattern: 'gradient',
      layout: 'modern',
      logoPosition: { x: 20, y: 18 },
      logoSize: 34,
      photoPosition: { x: 76.5, y: 60 },
      photoSize: { width: 94, height: 114 },
      photoShape: 'rounded',
      nameStyle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        position: { x: 76.5, y: 180 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 195 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 25, y: 55 },
          size: { width: 103, height: 125 },
          color: 'rgba(255, 255, 255, 0.3)',
        },
      ],
    },
    back: {
      backgroundColor: 'linear-gradient(135deg, #F0F8FF 0%, #FFFFFF 100%)',
      backgroundPattern: 'gradient',
      layout: 'modern',
      logoPosition: { x: 76.5, y: 108 },
      logoSize: 36,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1A1A1A',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#0066CC',
        position: { x: 20, y: 35 },
      },
      accentElements: [],
    },
  },
  {
    id: 'classic-corporate',
    name: 'Classic Corporate',
    category: 'classic',
    description: 'Timeless professional design with traditional business aesthetics',
    thumbnail: 'classic-corporate',
    colors: {
      primary: '#0066CC',
      secondary: '#002855',
      accent: '#8B0000',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'none',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 20 },
      logoSize: 38,
      photoPosition: { x: 76.5, y: 68 },
      photoSize: { width: 90, height: 110 },
      photoShape: 'square',
      nameStyle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002855',
        position: { x: 76.5, y: 183 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 198 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 20, y: 63 },
          size: { width: 113, height: 2 },
          color: '#0066CC',
        },
        {
          type: 'line',
          position: { x: 20, y: 178 },
          size: { width: 113, height: 2 },
          color: '#0066CC',
        },
      ],
    },
    back: {
      backgroundColor: '#F8F8F8',
      backgroundPattern: 'none',
      layout: 'classic',
      logoPosition: { x: 76.5, y: 112 },
      logoSize: 34,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#002855',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#0066CC',
        position: { x: 20, y: 35 },
      },
      accentElements: [
        {
          type: 'line',
          position: { x: 0, y: 55 },
          size: { width: 153, height: 1 },
          color: '#CCCCCC',
        },
      ],
    },
  },
  {
    id: 'sleek-industrial',
    name: 'Sleek Industrial',
    category: 'modern',
    description: 'Industrial-inspired design with strong lines and modern typography',
    thumbnail: 'sleek-industrial',
    colors: {
      primary: '#0066CC',
      secondary: '#2C2C2C',
      accent: '#00A8E8',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    front: {
      backgroundColor: '#FFFFFF',
      backgroundPattern: 'lines',
      layout: 'modern',
      logoPosition: { x: 20, y: 18 },
      logoSize: 36,
      photoPosition: { x: 76.5, y: 58 },
      photoSize: { width: 92, height: 112 },
      photoShape: 'square',
      nameStyle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2C2C2C',
        position: { x: 76.5, y: 175 },
      },
      employeeIdStyle: {
        fontSize: 10,
        color: '#0066CC',
        position: { x: 76.5, y: 190 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 0, y: 53 },
          size: { width: 10, height: 125 },
          color: '#0066CC',
        },
        {
          type: 'line',
          position: { x: 0, y: 170 },
          size: { width: 153, height: 2 },
          color: '#00A8E8',
        },
      ],
    },
    back: {
      backgroundColor: '#F5F5F5',
      backgroundPattern: 'lines',
      layout: 'modern',
      logoPosition: { x: 76.5, y: 110 },
      logoSize: 35,
      photoPosition: { x: 0, y: 0 },
      photoSize: { width: 0, height: 0 },
      photoShape: 'circle',
      nameStyle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2C2C2C',
        position: { x: 20, y: 20 },
      },
      employeeIdStyle: {
        fontSize: 9,
        color: '#0066CC',
        position: { x: 20, y: 35 },
      },
      accentElements: [
        {
          type: 'rectangle',
          position: { x: 143, y: 0 },
          size: { width: 10, height: 244 },
          color: '#0066CC',
        },
      ],
    },
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter(template => template.category === category);
}