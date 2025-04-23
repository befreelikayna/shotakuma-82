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
      {/* All background mascot animations removed */}
    </div>
  );
};

export default AnimatedMascots;
