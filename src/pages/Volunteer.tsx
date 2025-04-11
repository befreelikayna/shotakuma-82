
import React from 'react';
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Volunteer = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-12 md:py-16">
          <div className="festival-container">
            <motion.div
              className="text-center mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-festival-primary mb-4">
                Devenez Bénévole
              </h1>
              <p className="text-lg text-festival-secondary max-w-3xl mx-auto">
                Rejoignez l'équipe SHOTAKU et participez à l'organisation du festival.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-soft p-2 sm:p-4 w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-full">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSeFkIe3uclhTVKiml8p8z0HsEmkmsRKpNjElbQj_uz_Zs-7Fw/viewform?embedded=true" 
                  width="100%" 
                  height={isMobile ? "1600px" : "1200px"}
                  className="w-full border-0"
                  frameBorder="0" 
                  marginHeight={0}
                  marginWidth={0}
                  title="Formulaire de bénévolat SHOTAKU"
                >
                  Chargement du formulaire...
                </iframe>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Volunteer;
