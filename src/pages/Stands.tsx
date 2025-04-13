
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Stands = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState("https://exhibitors.shotaku.ma");

  // Simulate loading completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
              Discover our festival exhibitors and their stands
            </p>
          </motion.div>

          <div className="relative bg-white rounded-xl shadow-soft overflow-hidden h-[600px] md:h-[700px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-festival-primary" />
                  <p className="mt-4 text-festival-secondary">Loading stands information...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={url}
              title="Festival Stands"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Stands;
