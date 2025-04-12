
import React from "react";
import { motion } from "framer-motion";

interface AnimatedMascotsProps {
  className?: string;
  scale?: number;
  speed?: number;
}

const AnimatedMascots = ({ className = "", scale = 1, speed = 1 }: AnimatedMascotsProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* Top left mascot */}
      <motion.div 
        className="absolute -left-10 top-10 w-40 h-40 md:w-60 md:h-60"
        style={{ scale }}
        initial={{ x: -100, y: -50, rotate: -10 }}
        animate={{ 
          x: [-50, -30, -50],
          y: [-30, -50, -30],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/a5cf6f11-ad42-41c3-98d8-1e00769df04f.png" 
          alt="Mascot" 
          className="w-full h-full object-contain transform -scale-x-100"
        />
      </motion.div>

      {/* Top right mascot */}
      <motion.div 
        className="absolute -right-10 top-40 w-36 h-36 md:w-52 md:h-52"
        style={{ scale }}
        initial={{ x: 100, y: -30, rotate: 10 }}
        animate={{ 
          x: [30, 50, 30],
          y: [-30, -10, -30],
          rotate: [5, -5, 5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 10 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/b6757ef7-31f5-4857-8334-a40d2e25cecb.png" 
          alt="Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Bottom left mascot */}
      <motion.div 
        className="absolute left-20 -bottom-20 w-44 h-44 md:w-64 md:h-64"
        style={{ scale }}
        initial={{ x: -50, y: 100, rotate: -5 }}
        animate={{ 
          x: [-20, -40, -20],
          y: [40, 20, 40],
          rotate: [-10, 0, -10]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 12 / speed,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/lovable-uploads/9c053731-1362-4cc0-a67d-e190a8859e32.png" 
          alt="Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};

export default AnimatedMascots;
