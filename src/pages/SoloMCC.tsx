
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SoloMCC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow px-4 pt-20 md:pt-32 pb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-6">Solo MCC</h1>
        <div className="w-full max-w-3xl mx-auto">
          <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSdnWyepVTS8aH3drtp1ehRpdQw0DDm9nYxUKma7JiKoEKqacw/viewform?embedded=true" 
              width="100%" 
              height={1200} 
              style={{ border: 0 }}
              title="Solo MCC Registration Form"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SoloMCC;

