
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import AdminLogin from "@/components/admin/AdminLogin";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("slider");

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans le panneau d'administration",
      });
    }
  };
  
  // Check if there's a hash in the URL to set the active tab
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tab = hash.replace('#', '');
      setActiveTab(tab);
    } else {
      // Default to slider tab if no hash is present
      setActiveTab('slider');
      // Update URL hash using history API
      window.history.replaceState(null, '', `#slider`);
    }
  }, []);

  // Update the URL hash when the active tab changes
  useEffect(() => {
    if (isAuthenticated && activeTab) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab, isAuthenticated]);

  // Handle tab value change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash using history API to avoid full page reload
    window.history.replaceState(null, '', `#${value}`);
  };

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-festival-primary mb-6 md:mb-8 text-center">
            Panneau d'Administration
          </h1>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6 md:mb-8 w-full overflow-x-auto">
              <TabsTrigger value="gallery" className="whitespace-nowrap">Galerie</TabsTrigger>
              <TabsTrigger value="tickets" className="whitespace-nowrap">Billets</TabsTrigger>
              <TabsTrigger value="packages" className="whitespace-nowrap">Forfaits</TabsTrigger>
              <TabsTrigger value="slider" className="whitespace-nowrap">Slider</TabsTrigger>
              <TabsTrigger value="content" className="whitespace-nowrap hidden md:block">Contenu</TabsTrigger>
              <TabsTrigger value="social" className="whitespace-nowrap hidden md:block">Liens</TabsTrigger>
              <TabsTrigger value="newsletter" className="whitespace-nowrap hidden md:block">Newsletter</TabsTrigger>
            </TabsList>
            
            {/* Second row for small screens */}
            <TabsList className="grid grid-cols-3 mb-6 w-full overflow-x-auto md:hidden">
              <TabsTrigger value="content" className="whitespace-nowrap">Contenu</TabsTrigger>
              <TabsTrigger value="social" className="whitespace-nowrap">Liens</TabsTrigger>
              <TabsTrigger value="newsletter" className="whitespace-nowrap">Newsletter</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="tickets" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <TicketManager />
            </TabsContent>

            <TabsContent value="packages" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <TicketPackageManager />
            </TabsContent>

            <TabsContent value="slider" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <SliderManager />
            </TabsContent>

            <TabsContent value="content" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <ContentManager />
            </TabsContent>

            <TabsContent value="social" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <SocialLinksEditor />
            </TabsContent>

            <TabsContent value="newsletter" className="p-4 md:p-6 bg-white rounded-xl shadow-soft">
              <NewsletterSubscriptions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
