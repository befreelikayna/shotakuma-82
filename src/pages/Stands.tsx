
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Stands = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe3oNCC-UX7wVsyT3wUNYMqtqmJ2FTKqRzrJC6PHKc1YI8FDQ/viewform?embedded=true";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 md:pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-festival-primary">
              Stands & Exhibitors
            </h1>
            <p className="mt-4 text-festival-secondary max-w-2xl mx-auto">
              Register your stand for the festival
            </p>
          </motion.div>

          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-soft overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-festival-primary" />
                    <p className="mt-4 text-festival-secondary">Loading form...</p>
                  </div>
                </div>
              )}
              
              <iframe
                src={formUrl}
                title="Stand Registration Form"
                className="w-full border-0"
                style={{ height: isMobile ? "1600px" : "1200px" }}
                onLoad={() => setIsLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Stands;
