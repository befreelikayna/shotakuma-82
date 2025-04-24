
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface CountdownProps {
  targetDate: Date;
  title: string;
  backgroundColor: string;
  textColor: string;
  backgroundImageUrl?: string | null;
  showPopup: boolean;
  onClose: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownPopup: React.FC<CountdownProps> = ({
  targetDate,
  title,
  backgroundColor,
  textColor,
  backgroundImageUrl,
  showPopup,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        // Time is up
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const timeLeftNow = calculateTimeLeft();
      setTimeLeft(timeLeftNow);

      // Optional: Close the popup when countdown reaches zero
      if (
        timeLeftNow.days === 0 &&
        timeLeftNow.hours === 0 &&
        timeLeftNow.minutes === 0 &&
        timeLeftNow.seconds === 0
      ) {
        toast({
          title: "Countdown Complete!",
          description: "The event has started!",
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  const bgColor = backgroundColor || "#1F1F3F";
  const txtColor = textColor || "#00FFB9";

  return (
    <AnimatePresence>
      {showPopup && (
        <Dialog open={showPopup} onOpenChange={() => onClose()}>
          <DialogContent
            className="p-0 border-0 overflow-hidden max-w-lg w-full"
            style={{ background: "transparent" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <div
                className="rounded-lg p-6 relative overflow-hidden"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: `0 0 15px rgba(0, 255, 185, 0.2)`,
                  border: "1px solid rgba(0, 255, 185, 0.3)",
                }}
              >
                {/* Add a semi-transparent overlay if background image is used */}
                {backgroundImageUrl && (
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      backgroundColor: `${bgColor}CC`, // Add transparency 
                      backdropFilter: "blur(2px)" 
                    }} 
                  />
                )}
                
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-gray-300 hover:text-white bg-gray-800/50 rounded-full p-1 z-10"
                >
                  <X size={18} />
                </button>

                <div className="text-center mb-4 relative z-10">
                  <h2
                    className="text-xl font-bold tracking-wider"
                    style={{ color: txtColor }}
                  >
                    {title || "COUNTDOWN TO EVENT"}
                  </h2>
                </div>

                <div className="flex justify-center items-center space-x-3 md:space-x-4 py-2 relative z-10">
                  <CountdownUnit
                    value={formatTime(timeLeft.days)}
                    label="DAYS"
                    bgColor={bgColor}
                    textColor={txtColor}
                  />
                  <CountdownSeparator color={txtColor} />
                  <CountdownUnit
                    value={formatTime(timeLeft.hours)}
                    label="HOURS"
                    bgColor={bgColor}
                    textColor={txtColor}
                  />
                  <CountdownSeparator color={txtColor} />
                  <CountdownUnit
                    value={formatTime(timeLeft.minutes)}
                    label="MINUTES"
                    bgColor={bgColor}
                    textColor={txtColor}
                  />
                  <CountdownSeparator color={txtColor} />
                  <CountdownUnit
                    value={formatTime(timeLeft.seconds)}
                    label="SECONDS"
                    bgColor={bgColor}
                    textColor={txtColor}
                  />
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

const CountdownUnit: React.FC<{
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
}> = ({ value, label, bgColor, textColor }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-md flex items-center justify-center text-2xl md:text-3xl font-mono font-bold relative overflow-hidden"
        style={{
          backgroundColor: `${bgColor}80`,
          border: `1px solid ${textColor}40`,
          boxShadow: `0 0 10px ${textColor}20`,
        }}
      >
        <div
          className="relative z-10"
          style={{ color: textColor }}
        >
          {value}
        </div>
      </div>
      <div
        className="text-xs mt-1 font-medium tracking-wider"
        style={{ color: textColor }}
      >
        {label}
      </div>
    </div>
  );
};

const CountdownSeparator: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      className="text-2xl md:text-3xl font-bold pb-6"
      style={{ color }}
    >
      :
    </div>
  );
};

export default CountdownPopup;
