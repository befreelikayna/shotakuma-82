
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
  const [activeTab, setActiveTab] = useState("gallery");

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
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tab = hash.replace('#', '');
      setActiveTab(tab);
    }
  }, []);

  // Update the URL hash when the active tab changes
  React.useEffect(() => {
    if (isAuthenticated && activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="pt-32 pb-20">
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
      <div className="pt-32 pb-20">
        <div className="festival-container">
          <h1 className="text-3xl md:text-4xl font-bold text-festival-primary mb-8 text-center">
            Panneau d'Administration
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-7 mb-8">
              <TabsTrigger value="gallery">Galerie</TabsTrigger>
              <TabsTrigger value="tickets">Billets</TabsTrigger>
              <TabsTrigger value="packages">Forfaits</TabsTrigger>
              <TabsTrigger value="slider">Slider</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="social">Liens</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="p-6 bg-white rounded-xl shadow-soft">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="tickets" className="p-6 bg-white rounded-xl shadow-soft">
              <TicketManager />
            </TabsContent>

            <TabsContent value="packages" className="p-6 bg-white rounded-xl shadow-soft">
              <TicketPackageManager />
            </TabsContent>

            <TabsContent value="slider" className="p-6 bg-white rounded-xl shadow-soft">
              <SliderManager />
            </TabsContent>

            <TabsContent value="content" className="p-6 bg-white rounded-xl shadow-soft">
              <ContentManager />
            </TabsContent>

            <TabsContent value="social" className="p-6 bg-white rounded-xl shadow-soft">
              <SocialLinksEditor />
            </TabsContent>

            <TabsContent value="newsletter" className="p-6 bg-white rounded-xl shadow-soft">
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
