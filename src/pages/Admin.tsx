
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryManager from "@/components/admin/GalleryManager";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";
import TicketManager from "@/components/admin/TicketManager";
import TicketPackageManager from "@/components/admin/TicketPackageManager";
import NewsletterSubscriptions from "@/components/admin/NewsletterSubscriptions";
import SliderManager from "@/components/admin/SliderManager";
import ContentManager from "@/components/admin/ContentManager";
import EventManager from "@/components/admin/EventManager";
import ThemeManager from "@/components/admin/ThemeManager";
import GeneralContentEditor from "@/components/admin/GeneralContentEditor";
import PartnersManager from "@/components/admin/PartnersManager";
import CountdownManager from "@/components/admin/CountdownManager";
import ScheduleManager from "@/components/admin/ScheduleManager";
import SiteAssetsManager from "@/components/admin/SiteAssetsManager";
import LogoUploader from "@/components/admin/LogoUploader";
import HeaderMenuManager from "@/components/admin/HeaderMenuManager";
import AdminLogin from "@/components/admin/AdminLogin";
import { supabase } from "@/integrations/supabase/client";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, Menu } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("slider");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (data && data.session) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans le panneau d'administration",
      });
    }
  };
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tab = hash.replace('#', '');
      setActiveTab(tab);
    } else {
      setActiveTab('slider');
      window.history.replaceState(null, '', `#slider`);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab, isAuthenticated]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, '', `#${value}`);
    setIsMenuOpen(false); // Close menu after selection
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-festival-secondary">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="pt-20 md:pt-32 pb-20 px-4 md:px-0">
          <div className="festival-container">
            <AdminLogin onLogin={handleLogin} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Create a list of section items
  const sectionItems = [
    { id: "slider", label: "Slider" },
    { id: "gallery", label: "Galerie" },
    { id: "events", label: "Événements" },
    { id: "schedule", label: "Programme" },
    { id: "tickets", label: "Billets" },
    { id: "packages", label: "Forfaits" },
    { id: "partners", label: "Partenaires" },
    { id: "countdown", label: "Countdown" },
    { id: "content", label: "Contenu" },
    { id: "general", label: "Général" },
    { id: "social", label: "Liens" },
    { id: "menu", label: "Navigation" },
    { id: "newsletter", label: "Newsletter" },
    { id: "theme", label: "Thème" },
    { id: "logo", label: "Logo" },
    { id: "assets", label: "Assets" },
  ];

  const handleSectionSelect = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, '', `#${id}`);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="pt-20 md:pt-32 pb-20 px-4 md:px-0">
        <div className="festival-container">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-festival-primary text-center md:text-left">
              Panneau d'Administration
            </h1>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6 md:mb-8">
              {/* Section selector dropdown */}
              <Collapsible open={isMenuOpen} onOpenChange={setIsMenuOpen} className="w-full">
                <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm mb-2">
                  <h3 className="text-lg font-medium">
                    Section: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-9 w-9">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="bg-white rounded-lg shadow-sm p-4 mb-4 z-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sectionItems.map((item) => (
                      <Button 
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSectionSelect(item.id)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Content panels */}
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              {activeTab === "slider" && <SliderManager />}
              {activeTab === "gallery" && <GalleryManager />}
              {activeTab === "events" && <EventManager />}
              {activeTab === "schedule" && <ScheduleManager />}
              {activeTab === "tickets" && <TicketManager />}
              {activeTab === "packages" && <TicketPackageManager />}
              {activeTab === "partners" && <PartnersManager />}
              {activeTab === "countdown" && <CountdownManager />}
              {activeTab === "content" && <ContentManager />}
              {activeTab === "general" && <GeneralContentEditor />}
              {activeTab === "theme" && <ThemeManager />}
              {activeTab === "social" && <SocialLinksEditor />}
              {activeTab === "menu" && <HeaderMenuManager />}
              {activeTab === "newsletter" && <NewsletterSubscriptions />}
              {activeTab === "logo" && (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Gestion du Logo</h2>
                  <LogoUploader />
                </>
              )}
              {activeTab === "assets" && <SiteAssetsManager />}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
