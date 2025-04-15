
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-12 md:py-16">
          <div className="festival-container">
            <div className="bg-white rounded-2xl shadow-soft p-2 sm:p-4 w-full">
              <div className="w-full">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSe3oNCC-UX7wVsyT3wUNYMqtqmJ2FTKqRzrJC6PHKc1YI8FDQ/viewform?embedded=true" 
                  width="100%" 
                  height={isMobile ? "1600px" : "1200px"}
                  className="w-full border-0"
                  frameBorder="0" 
                  marginHeight={0}
                  marginWidth={0}
                  title="Admin Form"
                >
                  Chargement du formulaire...
                </iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
