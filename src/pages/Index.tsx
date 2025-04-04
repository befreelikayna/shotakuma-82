
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import { useMobile } from "@/hooks/use-mobile";
import { EventItem } from "@/components/EventItem";
import { Ticket, Users, Calendar, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PageContentSection from "@/components/PageContentSection";
import { usePageContent } from "@/hooks/use-page-content";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { content: pageContent, isLoading: isContentLoading } = usePageContent('home');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })
          .limit(4);

        if (error) {
          console.error("Error fetching events:", error);
          throw error;
        }

        // Cast the data to Event[] to fix type error
        setEvents(data as unknown as Event[]);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (id: string) => {
    navigate(`/events/${id}`);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div>
      <HeroSection />

      {pageContent && (
        <PageContentSection 
          pageContent={pageContent} 
          isLoading={isContentLoading} 
        />
      )}

      <section className="py-16 md:py-20 bg-festival-bg">
        <div className="festival-container">
          <div className="text-center mb-14">
            <h2 className="section-heading inline-block">Découvrez SHOTAKU</h2>
            <p className="text-festival-secondary mt-4 max-w-2xl mx-auto">
              Plongez dans le plus grand événement d'anime et de manga du Maroc !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 bg-festival-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={24} className="text-festival-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3 Jours</h3>
              <p className="text-festival-secondary">
                Trois jours complets d'activités, d'expositions et d'animations
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 bg-festival-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={24} className="text-festival-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">+5000 Visiteurs</h3>
              <p className="text-festival-secondary">
                Plus de 5000 fans d'anime et de manga réunis au même endroit
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 bg-festival-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Image size={24} className="text-festival-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">+20 Exposants</h3>
              <p className="text-festival-secondary">
                Plus de 20 exposants présentant des produits liés à la culture japonaise
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-16 h-16 bg-festival-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket size={24} className="text-festival-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">+15 Activités</h3>
              <p className="text-festival-secondary">
                Plus de 15 activités différentes à découvrir pendant l'événement
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="festival-container">
          <div className="text-center mb-14">
            <h2 className="section-heading inline-block">Événements à venir</h2>
            <p className="text-festival-secondary mt-4 max-w-2xl mx-auto">
              Découvrez nos prochains événements et ne manquez aucune activité lors du festival !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <EventItem
                  key={event.id}
                  id={event.id}
                  title={event.name}
                  date={formatEventDate(event.event_date)}
                  time={formatEventTime(event.event_date)}
                  image={event.image_url || '/placeholder.svg'}
                  location={event.place}
                  category={event.category || 'culture'}
                  description={event.description || ''}
                  registrationLink="#"
                  onClick={() => handleEventClick(event.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-gray-500">Aucun événement à venir pour le moment.</p>
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="text-center mt-10">
              <motion.button
                className="inline-flex items-center justify-center bg-festival-primary text-white px-6 py-3 rounded-full font-medium hover:bg-festival-primary-dark transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/events')}
              >
                Voir tous les événements
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
