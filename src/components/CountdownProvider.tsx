
import React, { useState, useEffect } from "react";
import CountdownPopup from "./CountdownPopup";
import { useCountdownSettings } from "@/hooks/use-countdown-settings";

const CountdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, loading } = useCountdownSettings();
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    if (loading) return;
    
    // Check if countdown should be shown
    if (settings && settings.enabled) {
      const targetDate = new Date(settings.targetDate);
      const now = new Date();
      
      // Only show countdown if target date is in the future
      if (targetDate > now) {
        // Show only if showOnLoad is true
        if (settings.showOnLoad) {
          setShowPopup(true);
          
          // Auto-close if duration is set
          if (settings.displayDuration && settings.displayDuration > 0) {
            const timer = setTimeout(() => {
              setShowPopup(false);
            }, settings.displayDuration * 1000);
            
            return () => clearTimeout(timer);
          }
        }
      }
    }
  }, [settings, loading]);
  
  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {children}
      
      {settings && !loading && (
        <CountdownPopup
          targetDate={new Date(settings.targetDate)}
          title={settings.title}
          backgroundColor={settings.backgroundColor}
          textColor={settings.textColor}
          showPopup={showPopup}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default CountdownProvider;
