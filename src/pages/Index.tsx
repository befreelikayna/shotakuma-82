
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Event, customSupabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import HeroSection from "@/components/HeroSection";
import PageContentSection from "@/components/PageContentSection";
import TicketPackage from "@/components/TicketPackage";
import EventItem from "@/components/EventItem";
import { usePageContent } from "@/hooks/use-page-content";

const Index = () => {
  const { content: pageContent, isLoading: contentLoading } = usePageContent('home');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const { data, error } = await customSupabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          const upcomingEvents = (data as Event[]).filter(event => new Date(event.event_date) >= new Date());
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements",
          variant: "destructive",
        });
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive",
      });
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const { error } = await customSupabase
        .from('newsletter_subscribers')
        .insert({ email });
    
      if (error) {
        if (error.code === '23505') {
          setError("Cette adresse email est déjà inscrite.");
        } else {
          setError("Une erreur s'est produite. Veuillez réessayer.");
          console.error("Newsletter subscription error:", error);
        }
      } else {
        setSuccess(true);
        setEmail('');
        toast({
          title: "Merci!",
          description: "Vous êtes maintenant inscrit à notre newsletter.",
        });
      }
    } catch (err) {
      console.error("Error submitting newsletter form:", err);
      setError("Une erreur s'est produite. Veuillez réessayer ultérieurement.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <HeroSection />
      
      <PageContentSection pageContent={pageContent} isLoading={contentLoading} />
      
      <section className="py-20" id="tickets">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-heading inline-block">Billets & Forfaits</h2>
            <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
              Réservez vos billets pour vivre une expérience inoubliable au Festival SHOTAKU.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TicketPackage
              title="Billet Standard"
              price="50 DH"
              description="Accès à tous les événements et activités du festival pendant une journée."
              features={[
                "Accès aux expositions",
                "Participation aux ateliers",
                "Accès aux projections",
              ]}
              buttonText="Acheter un billet"
              buttonLink="#"
            />
            <TicketPackage
              title="Pass Premium"
              price="120 DH"
              description="Accès illimité à tous les événements et activités du festival pendant les trois jours."
              features={[
                "Accès prioritaire",
                "Rencontres avec les invités",
                "Goodies exclusifs",
              ]}
              buttonText="Acheter un pass"
              buttonLink="#"
            />
            <TicketPackage
              title="Forfait VIP"
              price="250 DH"
              description="Expérience VIP avec accès exclusif aux coulisses, rencontres privées et avantages spéciaux."
              features={[
                "Accès VIP à tous les événements",
                "Accès aux coulisses",
                "Rencontres privées avec les invités",
                "Repas et boissons offerts",
              ]}
              buttonText="Réserver un forfait"
              buttonLink="#"
            />
          </div>
        </div>
      </section>

      <section className="py-20" id="program">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-heading inline-block">Programme des Événements</h2>
            <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
              Découvrez le programme complet des événements, des projections aux compétitions de cosplay.
            </p>
          </motion.div>

          {eventsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Chargement des événements...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventItem
                  key={event.id}
                  title={event.name}
                  date={new Date(event.event_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  time={new Date(event.event_date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  image={event.image_url || "https://source.unsplash.com/random/800x600?anime"}
                  location={event.location || event.place}
                  registrationLink="#"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-festival-primary text-white" id="newsletter">
        <div className="festival-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-heading inline-block text-white">
              Inscrivez-vous à la Newsletter
            </h2>
            <p className="text-festival-secondary-light max-w-2xl mx-auto mt-4">
              Restez informé de toutes les dernières nouvelles et mises à jour du festival.
            </p>
          </motion.div>

          <motion.form
            className="max-w-md mx-auto"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-full text-black shadow-soft focus:ring-festival-accent focus:border-festival-accent"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 px-4 py-2 rounded-full bg-festival-accent text-white font-medium shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="mt-3 text-sm text-green-500 text-center">
                <CheckCircle className="inline-block mr-1" size="1em" />{" "}
                Merci pour votre inscription!
              </p>
            )}
          </motion.form>
        </div>
      </section>
    </>
  );
};

export default Index;
