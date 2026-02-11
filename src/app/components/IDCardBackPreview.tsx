import { motion } from 'motion/react';
import logo from '../../assets/6dce495d999ed88e54f35e49635962b824088162.png';
import type { BackSideText, Branch } from '../utils/templateData';
import { DEFAULT_BACK_TEXT } from '../utils/defaultBackText';

interface IDCardBackPreviewProps {
  scale?: number;
  backText?: BackSideText;
}

export function IDCardBackPreview({ scale = 1, backText = DEFAULT_BACK_TEXT }: IDCardBackPreviewProps) {
  // Migrate old backText format to new format with branches array
  const migrateBackText = (oldBackText: any): BackSideText => {
    if (!oldBackText) return DEFAULT_BACK_TEXT;
    
    // If it already has branches array, return as is
    if (oldBackText.branches && Array.isArray(oldBackText.branches)) {
      return oldBackText as BackSideText;
    }
    
    // If it has old format, migrate it
    if ('branch1Label' in oldBackText) {
      const branches: Branch[] = [];
      
      if (oldBackText.branch1Label || oldBackText.branch1Address) {
        branches.push({
          id: '1',
          label: oldBackText.branch1Label || '',
          address: oldBackText.branch1Address || '',
        });
      }
      
      if (oldBackText.branch2Label || oldBackText.branch2Address) {
        branches.push({
          id: '2',
          label: oldBackText.branch2Label || '',
          address: oldBackText.branch2Address || '',
        });
      }
      
      return {
        headquarterLabel: oldBackText.headquarterLabel || DEFAULT_BACK_TEXT.headquarterLabel,
        headquarterLocation: oldBackText.headquarterLocation || DEFAULT_BACK_TEXT.headquarterLocation,
        headquarterAddress: oldBackText.headquarterAddress || DEFAULT_BACK_TEXT.headquarterAddress,
        branchesLabel: oldBackText.branchesLabel || DEFAULT_BACK_TEXT.branchesLabel,
        branches: branches.length > 0 ? branches : DEFAULT_BACK_TEXT.branches,
      };
    }
    
    return DEFAULT_BACK_TEXT;
  };
  
  const currentBackText = migrateBackText(backText);
  
  // Calculate dynamic positioning for branches
  const calculateBranchPositions = () => {
    const positions: number[] = [];
    let currentTop = 124; // Starting position for first branch
    
    for (let i = 0; i < currentBackText.branches.length; i++) {
      positions.push(currentTop);
      // Each branch needs ~40px of space (label + address with wrapping)
      currentTop += 40;
    }
    
    return positions;
  };
  
  const branchPositions = calculateBranchPositions();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white shadow-2xl z-10"
      style={{
        width: `${153 * scale}px`,
        height: `${244 * scale}px`,
        fontFamily: 'Roboto',
      }}
    >
      {/* ACC Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="-translate-x-1/2 absolute" 
        style={{
          height: `${20 * scale}px`,
          left: `calc(50% + ${0.5 * scale}px)`,
          top: `${24 * scale}px`,
          width: `${42 * scale}px`,
        }}
      >
        <img 
          alt="ACC Logo" 
          className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" 
          src={logo} 
        />
      </motion.div>

      {/* Headquarter Label */}
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute font-bold not-italic text-[#0f172a]"
        style={{
          fontSize: `${7 * scale}px`,
          lineHeight: `${9 * scale}px`,
          left: `${15 * scale}px`,
          top: `${63 * scale}px`,
        }}
      >
        {currentBackText.headquarterLabel}
      </motion.p>

      {/* Location Label */}
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="absolute font-bold not-italic text-[#0f172a]"
        style={{
          fontSize: `${7 * scale}px`,
          lineHeight: `${9 * scale}px`,
          left: `${15 * scale}px`,
          top: `${78 * scale}px`,
        }}
      >
        {currentBackText.headquarterLocation}{' '}
      </motion.p>

      {/* Headquarter Address */}
      <motion.p
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="absolute font-normal not-italic text-[#0f172a] whitespace-pre-wrap"
        style={{
          fontSize: `${6 * scale}px`,
          lineHeight: `${9 * scale}px`,
          left: `${42 * scale}px`,
          top: `${78 * scale}px`,
          width: `${101 * scale}px`,
        }}
      >
        {currentBackText.headquarterAddress}
      </motion.p>

      {/* Branches Label */}
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute font-bold not-italic text-[#0f172a]"
        style={{
          fontSize: `${7 * scale}px`,
          lineHeight: `${9 * scale}px`,
          left: `${15 * scale}px`,
          top: `${110 * scale}px`,
        }}
      >
        {currentBackText.branchesLabel}
      </motion.p>

      {/* Dynamic Branches */}
      {currentBackText.branches.map((branch, index) => (
        <div key={branch.id || index}>
          {/* Branch Label */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + index * 0.1, duration: 0.4 }}
            className="absolute font-bold not-italic text-[#0f172a]"
            style={{
              fontSize: `${7 * scale}px`,
              lineHeight: `${9 * scale}px`,
              left: `${15 * scale}px`,
              top: `${branchPositions[index] * scale}px`,
            }}
          >
            {branch.label}
          </motion.p>

          {/* Branch Address */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            className="absolute font-normal not-italic text-[#0f172a] whitespace-pre-wrap"
            style={{
              fontSize: `${6 * scale}px`,
              lineHeight: `${9 * scale}px`,
              left: `${48 * scale}px`,
              top: `${branchPositions[index] * scale}px`,
              width: `${97 * scale}px`,
            }}
          >
            {branch.address}
          </motion.p>
        </div>
      ))}
    </motion.div>
  );
}