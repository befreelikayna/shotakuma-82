
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .order("price");
        
        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast({
          title: "Error",
          description: "Could not load tickets. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket: Ticket) => {
    navigate(`/checkout/${ticket.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 md:pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-festival-primary">
              Festival Tickets
            </h1>
            <p className="mt-4 text-festival-secondary max-w-2xl mx-auto">
              Choose the perfect ticket option for your SHOTAKU experience
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-2 border-festival-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft"
                  whileHover={{ y: -5, scale: 1.01 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`p-1 ${ticket.name === "Pass 3 Jours" ? "bg-red-500" : "bg-transparent"}`}>
                    <div className="p-6 bg-white rounded-t-xl">
                      <h3 className="text-xl font-bold text-festival-primary mb-2">{ticket.name}</h3>
                      <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-festival-primary">{ticket.price}</span>
                        <span className="text-festival-secondary ml-1">MAD</span>
                      </div>
                      <p className="text-festival-secondary mb-6">{ticket.description}</p>
                      
                      <ul className="space-y-3 mb-6">
                        {getTicketFeatures(ticket.name).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </span>
                            <span className="text-sm text-festival-secondary">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handleSelectTicket(ticket)}
                        className={`w-full flex justify-center items-center py-3 rounded-full transition-all duration-300 ${
                          ticket.name === "Pass 3 Jours" 
                            ? "bg-red-500 text-white hover:bg-opacity-90" 
                            : "bg-white border border-slate-200 text-festival-primary hover:bg-slate-50"
                        }`}
                      >
                        Select Ticket
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Helper function to get features based on ticket name
const getTicketFeatures = (ticketName: string): string[] => {
  const features = {
    "Pass 1 Jour": [
      "Accès à toutes les expositions",
      "Accès aux panels et discussions",
      "Accès aux projections",
      "Accès à la zone marchande"
    ],
    "Pass 3 Jours": [
      "Accès complet aux trois jours",
      "Accès à toutes les expositions",
      "Accès aux panels et discussions",
      "Accès aux projections",
      "Accès à la zone marchande",
      "T-shirt exclusif du festival"
    ],
    "Pass VIP": [
      "Accès complet aux trois jours",
      "Entrée prioritaire sans file d'attente",
      "Accès aux zones VIP",
      "Kit souvenir exclusif",
      "Rencontre avec les invités spéciaux",
      "Place réservée pour les événements principaux"
    ]
  };
  
  return features[ticketName] || ["Access to festival events"];
};

export default Tickets;
