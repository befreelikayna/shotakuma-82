
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isMobile = useIsMobile();
  
  // Don't show custom cursor on mobile devices
  if (isMobile) return null;

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const handleClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 500);
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseEnter = () => {
      setHidden(false);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleClick);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    
    // Set cursor style for the whole app
    document.body.style.cursor = 'none';
    
    const allLinks = document.querySelectorAll('a, button, input, select, textarea');
    allLinks.forEach((el) => {
      el.style.cursor = 'none';
    });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleClick);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      
      // Reset cursor style
      document.body.style.cursor = 'auto';
      
      allLinks.forEach((el) => {
        el.style.cursor = 'auto';
      });
    };
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        x: position.x - 20,
        y: position.y - 20,
      }}
      initial={{ scale: 0 }}
      animate={{ 
        scale: clicked ? 1.2 : 1,
        rotate: clicked ? [0, -10, 10, -5, 5, 0] : 0
      }}
      transition={{
        scale: { duration: 0.2 },
        rotate: { duration: 0.5, ease: "easeInOut" }
      }}
    >
      <img 
        src="/lovable-uploads/79e47150-6875-466f-80d1-dff4b3631169.png" 
        alt="Custom cursor" 
        className="w-10 h-10 object-contain"
      />
      {clicked && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/lovable-uploads/79e47150-6875-466f-80d1-dff4b3631169.png" 
            alt="Click effect" 
            className="w-10 h-10 object-contain"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomCursor;
