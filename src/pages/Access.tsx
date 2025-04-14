
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Camera, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAccessBadges } from "@/hooks/use-access-badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  "Media": <Camera className="h-10 w-10 text-blue-500" />,
  "Cosplay": <Shield className="h-10 w-10 text-purple-500" />,
  "Team": <Users className="h-10 w-10 text-pink-500" />
};

const BadgeCard = ({ title, description, image, type }: { title: string; description: string; image: string | null; type: string }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-soft overflow-hidden border border-slate-100"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            {iconMap[type as keyof typeof iconMap] || <Shield className="h-10 w-10 text-slate-400" />}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-festival-primary">{title}</h3>
        <p className="text-festival-secondary mb-4">{description}</p>
        <Button className="w-full bg-festival-accent text-white">
          Apply for {title}
        </Button>
      </div>
    </motion.div>
  );
};

const Access = () => {
  const { badges, isLoading } = useAccessBadges();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 md:pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-festival-primary mb-4">
              Access Badges
            </h1>
            <p className="text-festival-secondary max-w-3xl mx-auto">
              Select the appropriate access badge type for the festival based on your role or activities.
              Each badge type provides different access levels and benefits.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-soft overflow-hidden border border-slate-100">
                  <Skeleton className="aspect-[3/2] w-full" />
                  <div className="p-6">
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  title={badge.title}
                  description={badge.description}
                  image={badge.image_url}
                  type={badge.type}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <p className="text-festival-secondary">No access badges available at the moment.</p>
            </div>
          )}

          <div className="mt-16 bg-white p-8 rounded-xl shadow-soft">
            <h2 className="text-2xl font-semibold mb-4 text-festival-primary">
              Access Badge Information
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-festival-primary mb-2">
                  How to Apply
                </h3>
                <p className="text-festival-secondary">
                  Select the badge type that corresponds to your role and fill out the application form.
                  Our team will review your application and get back to you within 48 hours.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-festival-primary mb-2">
                  Badge Collection
                </h3>
                <p className="text-festival-secondary">
                  Approved badges can be collected at the festival entrance on the day of the event.
                  Please bring identification and your confirmation email.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-festival-primary mb-2">
                  Badge Usage
                </h3>
                <p className="text-festival-secondary">
                  Badges must be visible at all times during the festival. Different badge types grant
                  access to different areas and activities within the festival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Access;
