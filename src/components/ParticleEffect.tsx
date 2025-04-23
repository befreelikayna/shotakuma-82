import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

const ParticleEffect = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile) {
      const handleClick = (e: MouseEvent) => {
        const numParticles = Math.floor(Math.random() * 6) + 5;
        const newParticles: Particle[] = [];
        
        for (let i = 0; i < numParticles; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: Math.min(e.clientX, window.innerWidth - 20), // Prevent overflow
            y: Math.min(e.clientY, window.innerHeight - 20), // Prevent overflow
            size: Math.random() * 20 + 10,
            rotation: Math.random() * 360,
            opacity: Math.random() * 0.5 + 0.5
          });
        }
        
        setParticles(prev => [...prev, ...newParticles]);
        
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
      };
      
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isMobile]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {!isMobile && (
        <AnimatePresence>
          {particles.map(particle => (
            <motion.img
              key={particle.id}
              src="/lovable-uploads/79e47150-6875-466f-80d1-dff4b3631169.png"
              alt="Particle"
              className="absolute w-6 h-6 object-contain"
              style={{
                left: particle.x - particle.size / 2,
                top: particle.y - particle.size / 2,
                opacity: particle.opacity,
              }}
              initial={{ scale: 0.5, rotate: particle.rotation }}
              animate={{
                scale: 0,
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100 - 50,
                rotate: particle.rotation + (Math.random() * 360),
                opacity: 0
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ParticleEffect;
