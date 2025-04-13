
import React, { useState, useEffect } from "react";
import { Home, Ticket, Store, User, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileBottomNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/");
  
  // Update active tab based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveTab("/");
    else if (path.includes("/tickets")) setActiveTab("/tickets");
    else if (path.includes("/stands")) setActiveTab("/stands");
    else if (path === "/profile") setActiveTab("/profile");
  }, [location]);
  
  if (!isMobile) return null;
  
  const handleAddClick = () => {
    window.open(`https://wa.me/+212670625980`, '_blank');
  };
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center justify-between px-6 py-3 bg-black/95 backdrop-blur-md shadow-lg rounded-t-xl border-t border-gray-800">
        <NavItem 
          to="/" 
          icon={<Home size={20} />} 
          label="Home" 
          isActive={activeTab === "/"} 
        />
        
        <NavItem 
          to="/tickets" 
          icon={<Ticket size={20} />} 
          label="Tickets" 
          isActive={activeTab === "/tickets"} 
        />
        
        {/* Center button for WhatsApp */}
        <div className="relative -mt-8">
          <motion.button
            onClick={handleAddClick}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="WhatsApp"
          >
            <Plus size={24} color="white" />
          </motion.button>
        </div>
        
        <NavItem 
          to="/stands" 
          icon={<Store size={20} />} 
          label="Stands" 
          isActive={activeTab === "/stands"} 
        />
        
        <NavItem 
          to="/profile" 
          icon={<User size={20} />} 
          label="Profile" 
          isActive={activeTab === "/profile"} 
        />
      </div>
    </motion.div>
  );
};

// NavItem component with animations
const NavItem = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center w-12 h-12 relative"
      aria-label={label}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-red-500/10 rounded-full"
          layoutId="activeTab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <motion.div
        animate={{ 
          y: isActive ? -2 : 0,
          scale: isActive ? 1.1 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className={`flex flex-col items-center ${isActive ? "text-red-500" : "text-gray-400"}`}>
          {React.cloneElement(icon, { className: `${isActive ? "text-red-500" : "text-gray-400"}` })}
          <span className="text-xs mt-1">{label}</span>
        </div>
      </motion.div>
    </Link>
  );
};

export default MobileBottomNav;
