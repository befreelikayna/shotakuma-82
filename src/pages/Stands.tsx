
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStandsContent } from "@/hooks/use-stands-content";

const Stands = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { content, isLoading: contentLoading } = useStandsContent();
  
  // Handle iframe loading state
  useEffect(() => {
    if (!contentLoading && content) {
      // Reset iframe loading state when content changes
      setIsLoading(true);
    }
  }, [content, contentLoading]);

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
              {content?.title || "Stands & Exhibitors"}
            </h1>
            <p className="mt-4 text-festival-secondary max-w-2xl mx-auto">
              {content?.description || "Discover our festival exhibitors and their stands"}
            </p>
          </motion.div>

          {content?.is_active ? (
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
                src={content?.url || "https://exhibitors.shotaku.ma"}
                title="Festival Stands"
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-medium text-amber-800 mb-2">Stands Coming Soon</h2>
              <p className="text-amber-700">
                Our exhibitor information will be available soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Stands;
