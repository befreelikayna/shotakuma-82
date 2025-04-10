
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { useCountdownSettings } from "@/hooks/use-countdown-settings";
import CountdownPopup from "./CountdownPopup";

interface CountdownTriggerProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  showIcon?: boolean;
  className?: string;
  label?: string;
}

const CountdownTrigger: React.FC<CountdownTriggerProps> = ({
  variant = "default",
  showIcon = true,
  className = "",
  label = "Show Countdown"
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const { settings, loading } = useCountdownSettings();

  const handleClick = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  if (loading || !settings || !settings.enabled) {
    return null;
  }

  const targetDate = new Date(settings.targetDate);
  const now = new Date();

  // Don't show the trigger if the target date is in the past
  if (targetDate <= now) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={handleClick}
        className={className}
      >
        {showIcon && <Timer className="mr-2 h-4 w-4" />}
        {label}
      </Button>

      <CountdownPopup
        targetDate={targetDate}
        title={settings.title}
        backgroundColor={settings.backgroundColor}
        textColor={settings.textColor}
        showPopup={showPopup}
        onClose={handleClose}
      />
    </>
  );
};

export default CountdownTrigger;
