
import React from "react";
import { Home, Ticket, Store, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileBottomNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (!isMobile) return null;
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md shadow-lg rounded-t-xl border-t border-gray-100">
        <button 
          onClick={handleBack} 
          className="flex flex-col items-center justify-center w-12 h-12 text-gray-600"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="text-xs mt-1">Back</span>
        </button>
        
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center w-12 h-12 text-gray-600"
          aria-label="Home"
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <div className="relative -mt-8">
          <Link
            to="/whatsapp"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-pink-500 shadow-lg"
            aria-label="WhatsApp"
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://wa.me/+212670625980`, '_blank');
            }}
          >
            <img 
              src="/lovable-uploads/2cea2730-b91a-4fb8-9507-d9b16048c39a.png" 
              alt="WhatsApp" 
              className="w-8 h-8 object-contain"
            />
          </Link>
        </div>
        
        <Link 
          to="/tickets" 
          className="flex flex-col items-center justify-center w-12 h-12 text-gray-600"
          aria-label="Buy Ticket"
        >
          <Ticket size={20} />
          <span className="text-xs mt-1">Tickets</span>
        </Link>
        
        <Link 
          to="/stands" 
          className="flex flex-col items-center justify-center w-12 h-12 text-gray-600"
          aria-label="Get a Stand"
        >
          <Store size={20} />
          <span className="text-xs mt-1">Stands</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
