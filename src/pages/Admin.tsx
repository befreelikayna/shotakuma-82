
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

          <Tabs value={activeTab} onValueChange={handleTabChange} className="max-w-4xl mx-auto">
            <div className="relative mb-6 md:mb-8">
              {/* Fixed Collapsible implementation */}
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
                    <TabsTrigger value="slider" className="w-full justify-start">Slider</TabsTrigger>
                    <TabsTrigger value="gallery" className="w-full justify-start">Galerie</TabsTrigger>
                    <TabsTrigger value="events" className="w-full justify-start">Événements</TabsTrigger>
                    <TabsTrigger value="schedule" className="w-full justify-start">Programme</TabsTrigger>
                    <TabsTrigger value="tickets" className="w-full justify-start">Billets</TabsTrigger>
                    <TabsTrigger value="packages" className="w-full justify-start">Forfaits</TabsTrigger>
                    <TabsTrigger value="partners" className="w-full justify-start">Partenaires</TabsTrigger>
                    <TabsTrigger value="countdown" className="w-full justify-start">Countdown</TabsTrigger>
                    <TabsTrigger value="content" className="w-full justify-start">Contenu</TabsTrigger>
                    <TabsTrigger value="general" className="w-full justify-start">Général</TabsTrigger>
                    <TabsTrigger value="social" className="w-full justify-start">Liens</TabsTrigger>
                    <TabsTrigger value="newsletter" className="w-full justify-start">Newsletter</TabsTrigger>
                    <TabsTrigger value="theme" className="w-full justify-start">Thème</TabsTrigger>
                    <TabsTrigger value="logo" className="w-full justify-start">Logo</TabsTrigger>
                    <TabsTrigger value="assets" className="w-full justify-start">Assets</TabsTrigger>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <TabsContent value="slider" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <SliderManager />
            </TabsContent>

            <TabsContent value="gallery" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="events" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <EventManager />
            </TabsContent>

            <TabsContent value="schedule" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <ScheduleManager />
            </TabsContent>

            <TabsContent value="tickets" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <TicketManager />
            </TabsContent>

            <TabsContent value="packages" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <TicketPackageManager />
            </TabsContent>

            <TabsContent value="partners" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <PartnersManager />
            </TabsContent>

            <TabsContent value="countdown" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <CountdownManager />
            </TabsContent>

            <TabsContent value="content" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <ContentManager />
            </TabsContent>

            <TabsContent value="general" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <GeneralContentEditor />
            </TabsContent>

            <TabsContent value="theme" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <ThemeManager />
            </TabsContent>

            <TabsContent value="social" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <SocialLinksEditor />
            </TabsContent>

            <TabsContent value="newsletter" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <NewsletterSubscriptions />
            </TabsContent>

            <TabsContent value="logo" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <h2 className="text-2xl font-semibold mb-4">Gestion du Logo</h2>
              <LogoUploader />
            </TabsContent>

            <TabsContent value="assets" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <SiteAssetsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
