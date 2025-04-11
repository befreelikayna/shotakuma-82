
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface HeaderLink {
  id: string;
  title: string;
  url: string;
  order_number: number;
  is_active: boolean;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); // Default fallback
  const [navLinks, setNavLinks] = useState<HeaderLink[]>([]);

  useEffect(() => {
    // Fetch navigation links from database
    const fetchNavLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('header_menu_links')
          .select('*')
          .eq('is_active', true)
          .order('order_number');
        
        if (error) {
          console.error('Error fetching navigation links:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setNavLinks(data);
        }
      } catch (error) {
        console.error('Error in navigation links fetch:', error);
      }
    };
    
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
    
    // Try to fetch favicon from Supabase storage and update the document
    const fetchFavicon = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('favicons')
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          });
        
        if (error) {
          console.error('Error fetching favicon:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const { data: { publicUrl } } = supabase.storage
            .from('favicons')
            .getPublicUrl(data[0].name);
          
          if (publicUrl) {
            // Find existing favicon link or create a new one
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            
            // Update the href
            link.href = publicUrl;
            
            // Try to determine the type based on the file extension
            const extension = publicUrl.split('.').pop()?.toLowerCase();
            if (extension === 'png') {
              link.type = 'image/png';
            } else if (extension === 'jpg' || extension === 'jpeg') {
              link.type = 'image/jpeg';
            } else if (extension === 'svg') {
              link.type = 'image/svg+xml';
            } else {
              link.type = 'image/x-icon';
            }
            
            console.log('Favicon loaded from Supabase:', publicUrl);
          }
        }
      } catch (error) {
        console.error('Error in favicon fetch:', error);
      }
    };
    
    fetchNavLinks();
    fetchLogo();
    fetchFavicon();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Set up real-time subscription for navigation menu changes
  useEffect(() => {
    const menuChannel = supabase
      .channel('header_menu_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'header_menu_links' 
        }, 
        () => {
          // Refresh the navigation links when changes occur
          const fetchNavLinks = async () => {
            const { data } = await supabase
              .from('header_menu_links')
              .select('*')
              .eq('is_active', true)
              .order('order_number');
            
            if (data) {
              setNavLinks(data);
            }
          };
          
          fetchNavLinks();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, []);

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
          {navLinks.map(link => (
            <Link 
              key={link.id}
              to={link.url} 
              className="nav-link"
            >
              {link.title}
            </Link>
          ))}
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
            {navLinks.map(link => (
              <Link 
                key={link.id}
                to={link.url} 
                className="nav-link" 
                onClick={toggleMenu}
              >
                {link.title}
              </Link>
            ))}
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
