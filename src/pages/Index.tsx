import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users, MapPin, Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FestivalLink from "@/components/FestivalLink";
import Footer from "@/components/Footer";
import DiscordIcon from "@/components/icons/DiscordIcon";
import TicketPackage from "@/components/TicketPackage";
import { useGalleryItems } from "@/hooks/use-gallery-items";
import { usePageContent } from "@/hooks/use-page-content";
import PageContentSection from "@/components/PageContentSection";
import PartnerLogosSlider from "@/components/PartnerLogosSlider";
import { supabase, Ticket, safeDataAccess } from "@/integrations/supabase/client";

const AnimeCharactersImage = "/lovable-uploads/88018e32-71b5-4eba-9372-973a5c4d8bc1.png";

interface TicketWithFeatures {
  id: string;
  name: string;
  price: number;
  description: string | null;
  available: boolean;
  features?: string[];
}

const Index = () => {
  const [email, setEmail] = useState("");
  const { items: galleryItems, isLoading: galleryLoading } = useGalleryItems('event');
  const { content: pageContent, isLoading: contentLoading } = usePageContent('home');
  const [tickets, setTickets] = useState<TicketWithFeatures[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  
  const defaultFeatures = {
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

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('price');
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        const enhancedTickets = data.map(ticket => {
          const typedTicket = {
            id: safeDataAccess(ticket?.id, ''),
            name: safeDataAccess(ticket?.name, ''),
            price: safeDataAccess(ticket?.price, 0),
            description: ticket?.description !== undefined ? 
              safeDataAccess(ticket.description, '') : null,
            available: safeDataAccess(ticket?.available, true)
          } as Ticket;
          
          return {
            ...typedTicket,
            features: (defaultFeatures as any)[typedTicket.name] || []
          } as TicketWithFeatures;
        });
        
        setTickets(enhancedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTickets();
    
    const channel = supabase
      .channel('tickets-homepage-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        (payload) => {
          console.log('Tickets changed (homepage):', payload);
          fetchTickets();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });
        
      if (error) throw error;
      
      toast({
        title: "Inscription réussie!",
        description: "Merci de vous être inscrit à notre newsletter.",
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error saving email subscription:", error);
      toast({
        title: "Inscription réussie!",
        description: "Merci de vous être inscrit à notre newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent">
      <Navbar />
      <HeroSection />

      {pageContent && <PageContentSection pageContent={pageContent} isLoading={contentLoading} />}

      <section className="py-20 w-full" id="tickets">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <h2 className="section-heading inline-block text-white">Billets</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mt-4">
              Choisissez le type de billet qui vous convient et préparez-vous à vivre une expérience inoubliable au festival SHOTAKU.
            </p>
          </motion.div>

          {ticketsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-4">
              {tickets
                .filter(ticket => ticket.available)
                .map((ticket) => (
                  <TicketPackage 
                    key={ticket.id}
                    name={ticket.name}
                    price={ticket.price}
                    description={ticket.description || ""}
                    features={ticket.features || []}
                    isPopular={ticket.name === "Pass 3 Jours"}
                    ticketId={ticket.id}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20" id="features">
        <div className="festival-container">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              variants={sectionVariants}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-900/50 mb-6">
                <CalendarDays className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">3 Jours d'Événements</h3>
              <p className="text-gray-300">
                Profitez de trois jours complets remplis d'activités, de spectacles et d'expériences uniques autour de la culture japonaise.
              </p>
            </motion.div>

            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              variants={sectionVariants}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-900/50 mb-6">
                <Users className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Communauté Passionnée</h3>
              <p className="text-gray-300">
                Rejoignez des milliers de fans d'anime et de manga pour célébrer ensemble notre passion commune pour la culture japonaise.
              </p>
            </motion.div>

            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              variants={sectionVariants}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-900/50 mb-6">
                <MapPin className="h-6 w-6 text-pink-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Lieu Exceptionnel</h3>
              <p className="text-gray-300">
                Un espace unique au cœur de Casablanca transformé en véritable paradis pour les amateurs de culture japonaise et geek.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PartnerLogosSlider />

      {!galleryLoading && galleryItems.length > 0 && (
        <section className="py-20 bg-transparent" id="gallery-preview">
          <div className="festival-container">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2 className="section-heading inline-block">Aperçu de la Galerie</h2>
              <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
                Découvrez quelques moments forts des éditions précédentes du festival.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.slice(0, 6).map((item) => (
                <motion.div
                  key={item.id}
                  className="overflow-hidden rounded-xl shadow-soft relative aspect-[4/3] group"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  variants={sectionVariants}
                >
                  {item.type === "image" ? (
                    <img 
                      src={item.src} 
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <span>Vidéo: {item.alt}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <p className="text-sm font-medium">{item.alt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <motion.a
                href="/gallery"
                className="inline-block px-6 py-3 rounded-full bg-festival-accent text-white font-medium 
                shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Voir toute la galerie
              </motion.a>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-festival-primary text-white">
        <div className="festival-container relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Restez informé
            </h2>
            <p className="text-slate-300 mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières informations sur le festival, les invités spéciaux et les offres exclusives.
            </p>
            <form 
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-grow px-4 py-3 rounded-full focus:outline-none text-festival-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-festival-accent text-white font-medium 
                shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90"
              >
                S'inscrire
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-4">
              En vous inscrivant, vous acceptez de recevoir nos emails et confirmez avoir lu notre politique de confidentialité.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
