
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
import Index from "./pages/Index";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Volunteer from "./pages/Volunteer";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import DynamicPage from "./pages/DynamicPage";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [dynamicRoutes, setDynamicRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CustomCursor />
          <ParticleEffect />
          <CountdownProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/events" element={<Events />} />
                <Route path="/admin" element={<Admin />} />
                
                {/* Dynamic routes generated from database */}
                {!isLoading && dynamicRoutes.map(page => (
                  <Route 
                    key={page.id} 
                    path={page.path} 
                    element={<DynamicPage pageSlug={page.slug} />} 
                  />
                ))}
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </CountdownProvider>
          <WhatsAppButton phoneNumber="+212670625980" />
        </BrowserRouter>
      </>
    </QueryClientProvider>
  );
};

export default App;
