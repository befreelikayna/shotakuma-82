
import React, { useState, useEffect } from "react";
import { Home, Ticket, Store, LogIn, MessageCircle, ChevronRight, ChevronLeft, Info, Image, Calendar, Users, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DesktopSideNav = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/");
  const [isAdminPage, setIsAdminPage] = useState(false);
  
  // Update active tab based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveTab("/");
    else if (path.includes("/tickets")) setActiveTab("/tickets");
    else if (path.includes("/stands")) setActiveTab("/stands");
    else if (path.includes("/about")) setActiveTab("/about");
    else if (path.includes("/gallery")) setActiveTab("/gallery");
    else if (path.includes("/events")) setActiveTab("/events");
    else if (path.includes("/volunteer")) setActiveTab("/volunteer");
    else if (path.includes("/contact")) setActiveTab("/contact");
    else if (path === "/admin") {
      setActiveTab("/admin");
      setIsAdminPage(true);
    }
    
    // Check if current route is admin
    setIsAdminPage(path.includes('/admin'));
  }, [location]);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Apply the appropriate class to the body based on expansion state
    if (!isExpanded) {
      document.body.classList.remove('with-desktop-nav');
      document.body.classList.add('with-desktop-nav-expanded');
    } else {
      document.body.classList.remove('with-desktop-nav-expanded');
      document.body.classList.add('with-desktop-nav');
    }
    
    // Add a small delay to allow the transition to complete
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };

  // Set initial body class on component mount
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('with-desktop-nav-expanded');
    } else {
      document.body.classList.add('with-desktop-nav');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('with-desktop-nav');
      document.body.classList.remove('with-desktop-nav-expanded');
    };
  }, []);

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/+212670625980`, '_blank');
  };
  
  // Don't render on admin pages
  if (isAdminPage) return null;
  
  return (
    <motion.div 
      className="fixed left-0 top-24 bottom-0 z-40 hidden md:flex flex-col"
      initial={{ x: isExpanded ? 0 : -160 }}
      animate={{ x: isExpanded ? 0 : -160 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="bg-festival-primary/90 backdrop-blur-md h-full py-8 rounded-r-xl border-r border-white/10 shadow-lg flex flex-col">
        <div className="flex flex-col space-y-6">
          <NavItem 
            to="/" 
            icon={<Home size={20} />} 
            label="Home" 
            isActive={activeTab === "/"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/tickets" 
            icon={<Ticket size={20} />} 
            label="Tickets" 
            isActive={activeTab === "/tickets"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/stands" 
            icon={<Store size={20} />} 
            label="Stands" 
            isActive={activeTab === "/stands"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/about" 
            icon={<Info size={20} />} 
            label="About" 
            isActive={activeTab === "/about"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/gallery" 
            icon={<Image size={20} />} 
            label="Gallery" 
            isActive={activeTab === "/gallery"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/events" 
            icon={<Calendar size={20} />} 
            label="Events" 
            isActive={activeTab === "/events"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/volunteer" 
            icon={<Users size={20} />} 
            label="Volunteer" 
            isActive={activeTab === "/volunteer"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/contact" 
            icon={<Mail size={20} />} 
            label="Contact" 
            isActive={activeTab === "/contact"} 
            isExpanded={isExpanded}
          />
          
          <NavItem 
            to="/admin" 
            icon={<LogIn size={20} />} 
            label="Login" 
            isActive={activeTab === "/admin"} 
            isExpanded={isExpanded}
          />
          
          {/* WhatsApp button */}
          <motion.button
            onClick={handleWhatsAppClick}
            className={`flex items-center justify-center ${isExpanded ? 'mx-4' : 'mx-auto'} h-12 rounded-full bg-green-500 shadow-lg`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="WhatsApp"
          >
            <MessageCircle size={20} color="white" />
            {isExpanded && <span className="ml-2 text-white">Chat</span>}
          </motion.button>
        </div>
        
        {/* Toggle button */}
        <motion.div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
          <motion.button
            onClick={toggleExpanded}
            className="bg-festival-accent/80 text-white rounded-full p-1 shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </motion.button>
          
          {!isExpanded && (
            <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 whitespace-nowrap text-xs bg-festival-accent/80 text-white px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
              Expand menu
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// NavItem component with animations
const NavItem = ({ to, icon, label, isActive, isExpanded }) => {
  return (
    <Link
      to={to}
      className={`flex items-center ${isExpanded ? 'px-6' : 'px-3'} py-3 relative`}
      aria-label={label}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-red-500/10 rounded-r-full"
          layoutId="activeSideTab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <motion.div
        animate={{ 
          scale: isActive ? 1.1 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className={`flex items-center ${isActive ? "text-red-500" : "text-gray-400"}`}>
          {React.cloneElement(icon, { className: `${isActive ? "text-red-500" : "text-gray-400"}` })}
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                className="ml-3 whitespace-nowrap overflow-hidden text-sm font-medium"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Link>
  );
};

export default DesktopSideNav;
