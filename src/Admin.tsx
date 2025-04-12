
import React, { useEffect, useState } from "react";
import CountdownDateManager from "./components/admin/CountdownDateManager";
import CountdownManager from "./components/admin/CountdownManager";
import AdminLogin from "./components/admin/AdminLogin";
import ContentManager from "./components/admin/ContentManager";
import GalleryManager from "./components/admin/GalleryManager";
import SiteAssetsManager from "./components/admin/SiteAssetsManager";
import SliderManager from "./components/admin/SliderManager";
import SocialLinksEditor from "./components/admin/SocialLinksEditor";
import EventManager from "./components/admin/EventManager";
import PartnersManager from "./components/admin/PartnersManager";
import ThemeManager from "./components/admin/ThemeManager";
import TicketManager from "./components/admin/TicketManager";
import ScheduleManager from "./components/admin/ScheduleManager";
import NewsletterSubscriptions from "./components/admin/NewsletterSubscriptions";
import ContactManager from "./components/admin/ContactManager";
import AnimatedMascots from "./components/admin/AnimatedMascots";
import { supabase } from "./integrations/supabase/client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAdmin(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedMascots scale={0.8} speed={0.5} />
        <div className="animate-spin h-10 w-10 border-4 border-pink-600 rounded-full border-t-transparent z-10"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen relative overflow-hidden">
      {/* Add the animated mascots behind the content */}
      <AnimatedMascots scale={0.7} speed={0.6} />
      
      {/* Admin content with relative z-index to appear above mascots */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-6">SHOTAKU Admin Panel</h1>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="flex flex-wrap mb-6 bg-white/80 backdrop-blur-sm rounded-md p-1 relative">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="countdown">Countdown</TabsTrigger>
            <TabsTrigger value="countdown-date">Event Date</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="slider">Slider</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-soft p-6 relative">
            <TabsContent value="content" className="space-y-4">
              <ContentManager />
            </TabsContent>
            <TabsContent value="countdown" className="space-y-4">
              <CountdownManager />
            </TabsContent>
            <TabsContent value="countdown-date" className="space-y-4">
              <CountdownDateManager />
            </TabsContent>
            <TabsContent value="gallery" className="space-y-4">
              <GalleryManager />
            </TabsContent>
            <TabsContent value="slider" className="space-y-4">
              <SliderManager />
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <EventManager />
            </TabsContent>
            <TabsContent value="partners" className="space-y-4">
              <PartnersManager />
            </TabsContent>
            <TabsContent value="schedule" className="space-y-4">
              <ScheduleManager />
            </TabsContent>
            <TabsContent value="tickets" className="space-y-4">
              <TicketManager />
            </TabsContent>
            <TabsContent value="social" className="space-y-4">
              <SocialLinksEditor />
            </TabsContent>
            <TabsContent value="assets" className="space-y-4">
              <SiteAssetsManager />
            </TabsContent>
            <TabsContent value="theme" className="space-y-4">
              <ThemeManager />
            </TabsContent>
            <TabsContent value="newsletter" className="space-y-4">
              <NewsletterSubscriptions />
            </TabsContent>
            <TabsContent value="contact" className="space-y-4">
              <ContactManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
