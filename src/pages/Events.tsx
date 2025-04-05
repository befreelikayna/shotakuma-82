import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventItem from "@/components/EventItem";
import { supabase, Event } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const Events = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get("category") || "all");
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const eventsPerPage = 9;

  // Fetch events from Supabase
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
            
            const standardTime = "10:00";
            
            return {
              id: event.id,
              name: event.name,
              title: event.name,
              description: event.description || '',
              date: formatDate(event.event_date),
              time: standardTime,
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
        (payload) => {
          console.log('Events changed, refreshing...');
          fetchEvents();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Ensure category is valid for EventItem component
  const validateCategory = (category: string): "anime" | "manga" | "cosplay" | "gaming" | "culture" => {
    const validCategories = ["anime", "manga", "cosplay", "gaming", "culture"];
    return validCategories.includes(category) 
      ? category as "anime" | "manga" | "cosplay" | "gaming" | "culture" 
      : "culture";
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") {
      params.set("category", activeFilter);
    }
    params.set("tab", activeTab);
    setSearchParams(params);
  }, [activeFilter, activeTab, setSearchParams]);

  const filteredEvents = events
    .filter(event => {
      if (activeTab === "upcoming" && event.past) return false;
      if (activeTab === "past" && !event.past) return false;
      return activeFilter === "all" || event.category === activeFilter;
    });

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                {t("events.title")}
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                {t("events.description")} {totalEventsCount > 0 && `(${totalEventsCount})`}
              </p>
            </div>

            {/* Tabs for Upcoming/Past Events */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === "upcoming"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.upcoming")}
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === "past"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.past")}
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center mb-10 overflow-x-auto">
              <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "all"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.all")}
                </button>
                <button
                  onClick={() => setActiveFilter("anime")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "anime"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.anime")}
                </button>
                <button
                  onClick={() => setActiveFilter("manga")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "manga"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.manga")}
                </button>
                <button
                  onClick={() => setActiveFilter("cosplay")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "cosplay"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.cosplay")}
                </button>
                <button
                  onClick={() => setActiveFilter("gaming")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "gaming"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.gaming")}
                </button>
                <button
                  onClick={() => setActiveFilter("culture")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "culture"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  {t("events.filters.culture")}
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-festival-accent"></div>
              </div>
            )}

            {/* Filtered count */}
            {!isLoading && filteredEvents.length > 0 && (
              <div className="text-center mb-6">
                <p className="text-festival-secondary">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} {activeFilter !== 'all' ? `de ${activeFilter}` : ''} {activeTab === 'upcoming' ? 'à venir' : 'passés'}
                </p>
              </div>
            )}

            {/* Events Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.length > 0 ? (
                  currentEvents.map((event) => (
                    <EventItem 
                      key={event.id} 
                      id={event.id}
                      title={event.title || event.name}
                      description={event.description || ''}
                      date={event.date || formatDate(event.event_date)}
                      time={event.time}
                      location={event.location || event.place}
                      image={event.image || event.image_url || ''}
                      category={validateCategory(event.category)}
                      registrationLink={event.registrationLink}
                      past={event.past}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-festival-secondary">{t("events.noEvents")}</p>
                  </div>
                )}
              </div>
            )}

            {/* No results message */}
            {!isLoading && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-festival-secondary">{t("events.noEvents")}</p>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && filteredEvents.length > eventsPerPage && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-2">
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    «
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button 
                      key={index}
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        currentPage === index + 1 
                          ? "bg-festival-accent text-white" 
                          : "border border-slate-200 text-festival-secondary hover:bg-slate-50"
                      }`}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    »
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
