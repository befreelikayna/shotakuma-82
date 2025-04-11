
import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
  // Format the phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formattedPhoneNumber = phoneNumber.replace(/[\s-]/g, "");
  
  return (
    <motion.a
      href={`https://wa.me/${formattedPhoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:bg-[#20c056] transition-colors duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Chat on WhatsApp: ${phoneNumber}`}
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </motion.a>
  );
};

export default WhatsAppButton;
