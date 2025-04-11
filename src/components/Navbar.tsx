import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); // Default fallback

  useEffect(() => {
    // Try to fetch logo from Supabase storage
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('logos')
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          });
        
        if (error) {
          console.error('Error fetching logo:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(data[0].name);
          
          if (publicUrl) {
            setLogoUrl(publicUrl);
            console.log('Logo loaded from Supabase:', publicUrl);
          }
        }
      } catch (error) {
        console.error('Error in logo fetch:', error);
      }
    };
    
    fetchLogo();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-soft">
      <div className="festival-container py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src={logoUrl} 
            alt="SHOTAKU Logo" 
            className="h-10 object-contain"
            onError={(e) => {
              // Fallback to default logo if Supabase logo fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
              console.log('Falling back to default logo');
            }}
          />
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md text-festival-primary"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/about" className="nav-link">À propos</Link>
          <Link to="/events" className="nav-link">Événements</Link>
          <Link to="/schedule" className="nav-link">Programme</Link>
          <Link to="/gallery" className="nav-link">Galerie</Link>
          <Link to="/volunteer" className="nav-link">Bénévole</Link>
          <Link
            to="/admin"
            className="px-3 py-1 rounded-full bg-festival-accent/10 text-festival-accent font-medium 
              hover:bg-festival-accent/20 transition-colors duration-300 ml-2"
          >
            Admin
          </Link>
        </div>

        {/* Mobile navigation */}
        <div className={cn(
          "absolute top-full left-0 right-0 bg-white shadow-md transition-all duration-300 md:hidden",
          isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/" className="nav-link" onClick={toggleMenu}>Accueil</Link>
            <Link to="/about" className="nav-link" onClick={toggleMenu}>À propos</Link>
            <Link to="/events" className="nav-link" onClick={toggleMenu}>Événements</Link>
            <Link to="/schedule" className="nav-link" onClick={toggleMenu}>Programme</Link>
            <Link to="/gallery" className="nav-link" onClick={toggleMenu}>Galerie</Link>
            <Link to="/volunteer" className="nav-link" onClick={toggleMenu}>Bénévole</Link>
            <Link
              to="/admin"
              className="px-3 py-1 w-fit rounded-full bg-festival-accent/10 text-festival-accent font-medium 
                hover:bg-festival-accent/20 transition-colors duration-300"
              onClick={toggleMenu}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
