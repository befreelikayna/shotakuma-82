import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import ParticleEffect from "./components/ParticleEffect";
import CountdownProvider from "./components/CountdownProvider";
import WhatsAppButton from "./components/WhatsAppButton";
import ThemeProvider from "./components/ThemeProvider";
import AnimatedMascots from "./components/admin/AnimatedMascots";
import MobileBottomNav from "./components/MobileBottomNav";
import DesktopSideNav from "./components/DesktopSideNav";
import { useIsMobile } from "./hooks/use-mobile";
import Index from "./pages/Index";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Volunteer from "./pages/Volunteer";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import DynamicPage from "./pages/DynamicPage";
import Tickets from "./pages/Tickets";
import Checkout from "./pages/Checkout";
import Stands from "./pages/Stands";
import Access from "./pages/Access";
import { supabase } from "./integrations/supabase/client";
import Koreaboo from "./pages/Koreaboo";
import SoloMCC from "./pages/SoloMCC";

const queryClient = new QueryClient();

const App = () => {
  const [dynamicRoutes, setDynamicRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchDynamicPages = async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("is_published", true);
        
        if (error) throw error;
        
        setDynamicRoutes(data || []);
      } catch (error) {
        console.error("Error fetching dynamic pages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicPages();

    // Subscribe to changes in the pages table
    const channel = supabase
      .channel("pages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pages" },
        () => {
          fetchDynamicPages();
        }
      )
      .subscribe();

    // Check if current route is admin
    const checkRoute = () => {
      setIsAdminPage(window.location.pathname.includes('/admin'));
    };
    
    checkRoute();
    window.addEventListener('popstate', checkRoute);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeProvider>
            <CustomCursor />
            <ParticleEffect />
            {/* Add the mascots to the entire application with a lower opacity */}
            <AnimatedMascots 
              className="opacity-30 hidden md:block" 
              scale={0.7} 
              speed={0.5} 
            />
            <DesktopSideNav />
            <CountdownProvider>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/volunteer" element={<Volunteer />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/checkout/:ticketId" element={<Checkout />} />
                  <Route path="/stands" element={<Stands />} />
                  <Route path="/access" element={<Access />} />
                  <Route path="/koreaboo" element={<Koreaboo />} />
                  <Route path="/solo-mcc" element={<SoloMCC />} />
                  {/* Dynamic routes generated from database */}
                  {!isLoading && dynamicRoutes.map(page => (
                    <Route 
                      key={page.id} 
                      path={page.path} 
                      element={<DynamicPage pageSlug={page.slug} />} 
                    />
                  ))}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </CountdownProvider>
            {!isMobile && <WhatsAppButton phoneNumber="+212670625980" />}
            <MobileBottomNav />
          </ThemeProvider>
        </BrowserRouter>
      </>
    </QueryClientProvider>
  );
};

export default App;
