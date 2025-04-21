
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SoloMCC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-32 pb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-6">Solo MCC</h1>
        <div className="w-full max-w-2xl flex justify-center">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSdnWyepVTS8aH3drtp1ehRpdQw0DDm9nYxUKma7JiKoEKqacw/viewform"
            width="100%" 
            height="900" 
            style={{ border: "none", borderRadius: "0.75rem" }}
            allowFullScreen
            title="Solo MCC Webform"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SoloMCC;
