
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GamingCountdownProps {
  targetDate: Date;
}

const GamingCountdown: React.FC<GamingCountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="relative w-full py-12 px-4 overflow-hidden bg-black">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40" 
        style={{ backgroundImage: "url('/lovable-uploads/e4d48f19-ce83-4615-b6af-14728099e564.png')" }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2 
          className="text-center text-3xl md:text-5xl font-bold text-white mb-8 tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          MOROCCO GAMING EXPO
        </motion.h2>
        
        {/* Countdown timer */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-3xl mx-auto">
          <CountdownItem value={formatNumber(timeLeft.days)} label="DAYS" />
          <CountdownItem value={formatNumber(timeLeft.hours)} label="HOURS" />
          <CountdownItem value={formatNumber(timeLeft.minutes)} label="MINUTES" />
          <CountdownItem value={formatNumber(timeLeft.seconds)} label="SECONDS" />
        </div>
        
        {/* Event info */}
        <motion.div 
          className="text-center mt-10 text-white space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xl md:text-2xl">FROM 8 TO 11 MAY 2025</p>
          <p className="text-lg md:text-xl">CASABLANCA, MAROC</p>
        </motion.div>
      </div>
    </div>
  );
};

const CountdownItem = ({ value, label }: { value: string; label: string }) => {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative w-full aspect-square">
        <div className="absolute inset-0 bg-black border-2 border-[#FF5533] rounded-md"></div>
        <div className="absolute inset-1 bg-gradient-to-b from-gray-900 to-black rounded-md flex items-center justify-center">
          <span className="text-[#FF5533] text-4xl md:text-6xl font-bold font-mono">
            {value}
          </span>
        </div>
      </div>
      <span className="text-white text-xs md:text-sm mt-2 tracking-wider">
        {label}
      </span>
    </motion.div>
  );
};

export default GamingCountdown;
