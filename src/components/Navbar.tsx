import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SubMenuItem {
  id: string;
  title: string;
  url: string;
  order_number: number;
}

interface HeaderLink {
  id: string;
  title: string;
  url: string;
  order_number: number;
  is_active: boolean;
  submenu?: SubMenuItem[];
}

const DEFAULT_MENU_LINKS: HeaderLink[] = [
  { id: "home", title: "Accueil", url: "/", order_number: 0, is_active: true },
  { id: "about", title: "À propos", url: "/about", order_number: 1, is_active: true },
  { id: "events", title: "Événements", url: "/events", order_number: 2, is_active: true },
  { id: "schedule", title: "Programme", url: "/schedule", order_number: 3, is_active: true },
  { id: "gallery", title: "Galerie", url: "/gallery", order_number: 4, is_active: true },
  { id: "contact", title: "Contact", url: "/contact", order_number: 5, is_active: true },
];

const RESERVE_DROPDOWN_LINKS = [
  { id: "koreaboo", label: "Koreaboo", url: "/koreaboo" },
  { id: "solo-mcc", label: "Solo MCC", url: "/solo-mcc" },
  { id: "stands", label: "Reserve Your Stand", url: "/stands" },
  { id: "access", label: "Get Your Access Badge", url: "/access" },
  { id: "volunteer", label: "Bénévole", url: "/volunteer" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [navLinks, setNavLinks] = useState<HeaderLink[]>([]);

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('header_menu_links').select('*').eq('is_active', true).order('order_number');
        if (error) {
          console.error('Error fetching navigation links:', error);
          return;
        }
        if (data && data.length > 0) {
          const parsedLinks = data.map(link => {
            const submenuData = link.submenu ? 
              (typeof link.submenu === 'string' ? JSON.parse(link.submenu) : link.submenu) as SubMenuItem[] 
              : undefined;
            
            return {
              ...link,
              submenu: submenuData
            };
          });
          setNavLinks(parsedLinks);
        } else {
          setNavLinks(DEFAULT_MENU_LINKS);
        }
      } catch (error) {
        console.error('Error in navigation links fetch:', error);
        setNavLinks(DEFAULT_MENU_LINKS);
      }
    };

    const fetchLogo = async () => {
      try {
        const {
          data,
          error
        } = await supabase.storage.from('logos').list('', {
          limit: 1,
          sortBy: {
            column: 'created_at',
            order: 'desc'
          }
        });
        if (error) {
          console.error('Error fetching logo:', error);
          return;
        }
        if (data && data.length > 0) {
          const {
            data: {
              publicUrl
            }
          } = supabase.storage.from('logos').getPublicUrl(data[0].name);
          if (publicUrl) {
            setLogoUrl(publicUrl);
            console.log('Logo loaded from Supabase:', publicUrl);
          }
        }
      } catch (error) {
        console.error('Error in logo fetch:', error);
      }
    };

    const fetchFavicon = async () => {
      try {
        const {
          data,
          error
        } = await supabase.storage.from('favicons').list('', {
          limit: 1,
          sortBy: {
            column: 'created_at',
            order: 'desc'
          }
        });
        if (error) {
          console.error('Error fetching favicon:', error);
          return;
        }
        if (data && data.length > 0) {
          const {
            data: {
              publicUrl
            }
          } = supabase.storage.from('favicons').getPublicUrl(data[0].name);
          if (publicUrl) {
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = publicUrl;
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

  useEffect(() => {
    const menuChannel = supabase.channel('header_menu_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'header_menu_links'
    }, () => {
      const fetchNavLinks = async () => {
        const {
          data
        } = await supabase.from('header_menu_links').select('*').eq('is_active', true).order('order_number');
        if (data && data.length > 0) {
          const parsedLinks = data.map(link => {
            const submenuData = link.submenu ? 
              (typeof link.submenu === 'string' ? JSON.parse(link.submenu) : link.submenu) as SubMenuItem[] 
              : undefined;
            
            return {
              ...link,
              submenu: submenuData
            };
          });
          setNavLinks(parsedLinks);
        } else {
          setNavLinks(DEFAULT_MENU_LINKS);
        }
      };
      fetchNavLinks();
    }).subscribe();
    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, []);

  const buildDesktopMenuLinks = () => {
    return navLinks
      .filter(
        link =>
          link.is_active &&
          !["koreaboo", "solo-mcc", "stands", "access", "volunteer"].includes(link.id)
      )
      .map(link => 
        link.submenu && link.submenu.length ? (
          <div key={link.id} className="relative group">
            <button className="nav-link text-white/80 hover:text-white flex items-center gap-1">
              {link.title}
              <svg width="10" height="6" viewBox="0 0 10 6" className="ml-1 transition-transform duration-200 group-hover:rotate-180">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 py-2 bg-festival-primary/95 backdrop-blur-md rounded-lg shadow-xl 
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-40">
              {link.submenu.map(subItem => (
                <Link
                  key={subItem.id}
                  to={subItem.url}
                  className="block px-4 py-2 text-white/80 hover:text-white hover:bg-festival-accent/20"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link key={link.id} to={link.url} className="nav-link text-white/80 hover:text-white">
            {link.title}
          </Link>
        )
      );
  };

  const desktopAdminLink = (
    <Link 
      to="/admin" 
      className="px-3 py-1 rounded-full bg-festival-accent/20 text-white 
      hover:bg-festival-accent/30 transition-colors duration-300 ml-2 flex items-center"
    >
      <LogIn size={18} />
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 
      bg-festival-primary/80 backdrop-blur-md border-b border-white/10 shadow-soft">
      <div className="festival-container py-4 flex justify-between items-center bg-[#080829]/[0.87]">
        <Link to="/" className="flex items-center">
          <img src={logoUrl} alt="SHOTAKU Logo" className="h-10 object-contain brightness-150 contrast-125" onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = "/logo.png";
            console.log('Falling back to default logo');
          }} />
        </Link>
        
        <button className="md:hidden p-2 rounded-md text-white hover:bg-festival-accent/30" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>

        <div className="hidden md:flex items-center space-x-6">
          {buildDesktopMenuLinks()}
          <Popover>
            <PopoverTrigger asChild>
              <button className="nav-link flex items-center font-semibold gap-1 px-3 py-2 rounded-lg transition-colors 
                text-white/80 hover:text-white focus:outline-none" style={{ background: "transparent" }}>
                Get Your Ticket
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={8}
              align="center"
              className="z-50 min-w-[200px] bg-[#080829]/[0.97] backdrop-blur-md p-2 rounded-xl shadow-xl mt-2 border border-white/10"
            >
              <div className="flex flex-col gap-1">
                {RESERVE_DROPDOWN_LINKS.map(item => (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="block w-full text-left px-4 py-2 text-white/90 font-medium rounded-lg transition 
                      hover:bg-festival-accent/30 hover:text-white focus:outline-none"
                    style={{
                      fontFamily: "inherit",
                      fontSize: "1rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {desktopAdminLink}
        </div>

        <div className={cn(
          "absolute top-full left-0 right-0 bg-festival-primary/90 backdrop-blur-md shadow-md transition-all duration-300 md:hidden",
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="flex flex-col p-4 space-y-4 bg-[#050F2C]/95">
            <Link to="/" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Accueil
            </Link>
            <Link to="/about" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              À propos
            </Link>
            <Link to="/events" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Événements
            </Link>
            <Link to="/schedule" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Programme
            </Link>
            <Link to="/gallery" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Galerie
            </Link>
            <Link to="/volunteer" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Bénévole
            </Link>
            <div className="relative">
              <details>
                <summary className="nav-link text-white/80 hover:text-white flex items-center gap-1 cursor-pointer select-none list-none">
                  Get Your Ticket
                  <ChevronDown className="w-4 h-4 ml-1 inline" />
                </summary>
                <div className="pl-3 mt-2 flex flex-col bg-[#080829]/[0.97] rounded-lg shadow border border-white/10">
                  {RESERVE_DROPDOWN_LINKS.map(item => (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="block px-4 py-2 text-white/90 font-medium rounded hover:bg-festival-accent/30 hover:text-white transition"
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
            <Link to="/contact" className="nav-link text-white hover:text-white flex items-center gap-2" onClick={toggleMenu}>
              Contact
            </Link>
            <div className="flex justify-end pt-4 border-t border-white/10">
              <Link to="/admin" className="px-3 py-2 rounded-full bg-festival-accent/20 text-white 
                  hover:bg-festival-accent/30 transition-colors duration-300 flex flex-col items-center gap-1" onClick={toggleMenu}>
                <LogIn size={18} />
                <span className="text-xs">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
