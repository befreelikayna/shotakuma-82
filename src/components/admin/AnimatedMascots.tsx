import React from "react";
import { motion } from "framer-motion";

interface AnimatedMascotsProps {
  className?: string;
  scale?: number;
  speed?: number;
}

const AnimatedMascots = ({ className = "", scale = 1, speed = 1 }: AnimatedMascotsProps) => {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* Top right mascot - Gaming Lion */}
      <motion.div 
        className="absolute -right-20 top-10 w-48 h-48 md:w-72 md:h-72"
        style={{ scale }}
        initial={{ x: 100, y: -50, rotate: 5 }}
        animate={{ 
          x: [50, 30, 50],
          y: [-20, -40, -20],
          rotate: [5, -5, 5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 12 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/db9ceac3-13af-45a9-8852-0e5c8119cfed.png" 
          alt="Gaming Lion Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Top left mascot - Jumping Lion */}
      <motion.div 
        className="absolute -left-20 top-40 w-48 h-48 md:w-72 md:h-72"
        style={{ scale }}
        initial={{ x: -100, y: -30, rotate: -10 }}
        animate={{ 
          x: [-40, -60, -40],
          y: [-10, -30, -10],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/545ddf23-e2d5-471e-81bc-c541cfc61724.png" 
          alt="Jumping Lion Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Bottom right mascot - Standing Lion */}
      <motion.div 
        className="absolute right-10 -bottom-10 w-40 h-40 md:w-64 md:h-64"
        style={{ scale }}
        initial={{ x: 50, y: 80, rotate: 5 }}
        animate={{ 
          x: [30, 50, 30],
          y: [40, 20, 40],
          rotate: [0, 8, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 18 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/258f108b-07b5-4a72-9953-3558bdae087f.png" 
          alt="Standing Lion Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Keep the original mascots for variety, but make them appear less frequently on larger screens */}
      <motion.div 
        className="absolute -left-10 bottom-20 w-40 h-40 md:w-60 md:h-60 hidden lg:block"
        style={{ scale }}
        initial={{ x: -100, y: 50, rotate: -5 }}
        animate={{ 
          x: [-30, -50, -30],
          y: [20, 40, 20],
          rotate: [-10, 0, -10]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/a5cf6f11-ad42-41c3-98d8-1e00769df04f.png" 
          alt="Mascot" 
          className="w-full h-full object-contain transform -scale-x-100"
        />
      </motion.div>
    </div>
  );
};

export default AnimatedMascots;
