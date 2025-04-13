
import React from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface WhatsAppButtonProps {
  phoneNumber: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
  // Format the phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formattedPhoneNumber = phoneNumber.replace(/[\s-]/g, "");
  const isMobile = useIsMobile();
  
  // Don't render on mobile as it's handled by the bottom nav
  if (isMobile) return null;
  
  return (
    <motion.a
      href={`https://wa.me/${formattedPhoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Chat on WhatsApp: ${phoneNumber}`}
    >
      <img 
        src="/lovable-uploads/2cea2730-b91a-4fb8-9507-d9b16048c39a.png" 
        alt="WhatsApp" 
        className="w-full h-full object-cover rounded-lg"
      />
    </motion.a>
  );
};

export default WhatsAppButton;
