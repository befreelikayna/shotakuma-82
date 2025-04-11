
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PartnerLogosSlider from "@/components/PartnerLogosSlider";
import Gallery from "@/components/Gallery";
import GeneralContentSection from "@/components/GeneralContentSection";
import GamingCountdown from "@/components/GamingCountdown";

const Index = () => {
  // Use target date of May 8, 2025
  const targetDate = new Date("2025-05-08T00:00:00");

  useEffect(() => {
    document.title = "SHOTAKU - Festival Marocain d'Anime & Manga";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      <Navbar />
      <HeroSection />
      
      {/* Gaming Countdown Timer - positioned after the hero section */}
      <GamingCountdown targetDate={targetDate} />
      
      <GeneralContentSection sectionKey="about" className="py-16" />
      <GeneralContentSection sectionKey="featured" className="py-16 bg-slate-50" />
      
      <section className="py-16" id="gallery">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-heading inline-block">Notre Galerie</h2>
            <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
              Découvrez les meilleurs moments des éditions précédentes
            </p>
          </motion.div>
          <Gallery />
          <div className="text-center mt-8">
            <a
              href="/gallery"
              className="inline-block px-6 py-2.5 rounded-full bg-white text-festival-primary font-medium 
                shadow-soft border border-slate-100 transition-all duration-300 
                hover:shadow-lg hover:bg-slate-50 hover:translate-y-[-2px]"
            >
              Voir toute la galerie
            </a>
          </div>
        </div>
      </section>
      
      <PartnerLogosSlider />
      <Footer />
    </motion.div>
  );
};

export default Index;
