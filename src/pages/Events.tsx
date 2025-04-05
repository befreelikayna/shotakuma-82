
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, Event } from "@/integrations/supabase/client";
import EventFilters from "@/components/events/EventFilters";
import EventGrid from "@/components/events/EventGrid";
import EventPagination from "@/components/events/EventPagination";
import { formatDate, extractTime, validateCategory } from "@/utils/eventUtils";

const Events = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get("category") || "all");
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const eventsPerPage = 9;

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          console.log('Events fetched from Supabase:', data);
          setTotalEventsCount(data.length);
          
          const processedEvents = data.map(event => {
            const eventDate = new Date(event.event_date);
            const currentDate = new Date();
            const isPast = eventDate < currentDate;
            
            let timeDisplay = event.start_time || extractTime(event.event_date);
            
            if (event.end_time) {
              timeDisplay = timeDisplay ? `${timeDisplay} - ${event.end_time}` : event.end_time;
            }
            
            return {
              id: event.id,
              name: event.name,
              title: event.name,
              description: event.description || '',
              date: formatDate(event.event_date),
              time: timeDisplay,
              start_time: event.start_time,
              end_time: event.end_time,
              location: event.place + (event.location ? `, ${event.location}` : ''),
              place: event.place,
              event_date: event.event_date,
              image: event.image_url || "https://source.unsplash.com/random/800x600?festival",
              image_url: event.image_url || "https://source.unsplash.com/random/800x600?festival",
              category: event.category || 'culture',
              past: isPast
            };
          });
          
          setEvents(processedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    
    const channel = supabase
      .channel('events-page-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        () => {
          console.log('Events changed, refreshing...');
          fetchEvents();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredEvents = events
    .filter(event => {
      if (activeTab === "upcoming" && event.past) return false;
      if (activeTab === "past" && !event.past) return false;
      return activeFilter === "all" || event.category === activeFilter;
    });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log('Total events:', events.length);
  console.log('Filtered events:', filteredEvents.length);
  console.log('Current events:', currentEvents.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-festival-primary mb-6">
                Événements
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                Découvrez nos événements passés et à venir {totalEventsCount > 0 && `(${totalEventsCount})`}
              </p>
            </div>

            <EventFilters 
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <EventGrid 
              events={events}
              isLoading={isLoading}
              filteredEvents={filteredEvents}
              currentEvents={currentEvents}
              activeFilter={activeFilter}
              validateCategory={validateCategory}
              formatDate={formatDate}
              activeTab={activeTab}
            />
            
            <EventPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              filteredEventsLength={filteredEvents.length}
              eventsPerPage={eventsPerPage}
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
