import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Calendar, RefreshCw, FileText, Download, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, ScheduleDay, ScheduleEvent } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Schedule = () => {
  const [activeDay, setActiveDay] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      
      const { data: daysData, error: daysError } = await supabase
        .from('schedule_days')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (daysError) {
        throw daysError;
      }
      
      if (!daysData || daysData.length === 0) {
        setSchedule([]);
        return;
      }
      
      if (!activeDay) {
        setActiveDay(daysData[0].id);
      }
      
      const scheduleDays = await Promise.all(
        daysData.map(async (day) => {
          const { data: eventsData, error: eventsError } = await supabase
            .from('schedule_events')
            .select('*')
            .eq('day_id', day.id)
            .order('order_number', { ascending: true });
          
          if (eventsError) {
            console.error(`Error fetching events for day ${day.id}:`, eventsError);
            return {
              ...day,
              events: []
            } as ScheduleDay;
          }
          
          const processedEvents = (eventsData || []).map(event => ({
            ...event
          } as ScheduleEvent));
          
          return {
            ...day,
            events: processedEvents
          } as ScheduleDay;
        })
      );
      
      setSchedule(scheduleDays);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "panel":
        return "bg-blue-100 text-blue-800";
      case "workshop":
        return "bg-green-100 text-green-800";
      case "competition":
        return "bg-purple-100 text-purple-800";
      case "screening":
        return "bg-amber-100 text-amber-800";
      case "performance":
        return "bg-rose-100 text-rose-800";
      case "concert":
        return "bg-indigo-100 text-indigo-800";
      case "talk":
        return "bg-cyan-100 text-cyan-800";
      case "exhibition":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeScheduleDay = schedule.find((day) => day.id === activeDay);

  const handleRefresh = () => {
    fetchSchedule();
    toast({
      title: "Actualisé",
      description: "Le programme a été actualisé"
    });
  };

  const openPdfViewer = (pdfUrl: string) => {
    setCurrentPdfUrl(pdfUrl);
    setOpenPdfDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-festival-primary mb-6">
                Programme du Festival
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                Découvrez les événements, ateliers, projections et performances prévus pendant les quatre jours du festival
              </p>
            </div>

            <div className="flex justify-end mb-6">
              <button 
                onClick={handleRefresh} 
                className="flex items-center gap-2 text-sm text-festival-secondary hover:text-festival-primary"
              >
                <RefreshCw className="h-4 w-4" /> 
                Actualiser le programme
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-festival-primary"></div>
                <span className="ml-3 text-festival-secondary">Chargement du programme...</span>
              </div>
            ) : schedule.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl shadow-soft">
                <p className="text-festival-secondary">Aucun programme disponible pour le moment.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-10 overflow-x-auto">
                  <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
                    {schedule.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => setActiveDay(day.id)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          activeDay === day.id
                            ? "bg-festival-accent text-white shadow-accent"
                            : "text-festival-secondary hover:bg-slate-100"
                        }`}
                      >
                        {day.day_name}
                        <span className="ml-2 text-xs opacity-75">{formatDate(day.date)}</span>
                        {day.pdf_url && (
                          <a 
                            href={day.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 inline-flex items-center text-festival-accent hover:text-festival-accent/80"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {activeScheduleDay?.pdf_url && (
                  <div className="mb-8 flex justify-center">
                    <Button
                      onClick={() => openPdfViewer(activeScheduleDay.pdf_url as string)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Voir le programme complet en PDF
                    </Button>
                  </div>
                )}

                {activeScheduleDay?.image_url && (
                  <div className="mb-8 flex justify-center">
                    <img 
                      src={activeScheduleDay.image_url} 
                      alt={`Image for ${activeScheduleDay.day_name}`} 
                      className="max-w-full h-64 object-cover rounded-xl shadow-soft"
                    />
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                    <span className="text-sm text-festival-secondary">Panels</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                    <span className="text-sm text-festival-secondary">Ateliers</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                    <span className="text-sm text-festival-secondary">Compétitions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                    <span className="text-sm text-festival-secondary">Projections</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-rose-400 mr-2"></span>
                    <span className="text-sm text-festival-secondary">Performances</span>
                  </div>
                </div>

                {activeScheduleDay && (
                  <div className="space-y-4">
                    {activeScheduleDay.events && activeScheduleDay.events.length === 0 ? (
                      <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100 text-center">
                        <p className="text-festival-secondary">Aucun événement programmé pour cette journée.</p>
                      </div>
                    ) : (
                      activeScheduleDay.events && activeScheduleDay.events.map((event) => (
                        <motion.div
                          key={event.id}
                          className="bg-white rounded-xl p-6 shadow-soft border border-slate-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-festival-primary">{event.title}</h3>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(
                                  event.category
                                )}`}
                              >
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center mt-2 md:mt-0">
                              <Clock className="h-4 w-4 text-festival-secondary mr-1" />
                              <span className="text-sm font-medium text-festival-secondary">
                                {event.start_time} - {event.end_time}
                              </span>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-festival-secondary mb-4">{event.description}</p>
                          )}
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-festival-accent mr-1" />
                              <span className="text-sm text-festival-secondary">{event.location}</span>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            <div className="mt-12 text-center">
              {schedule.length > 0 && schedule.some(day => day.pdf_url) ? (
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {schedule.map((day) => (
                    day.pdf_url && (
                      <a
                        key={day.id}
                        href={day.pdf_url}
                        download
                        className="inline-flex items-center px-4 py-2 rounded-md bg-white border border-slate-200 text-festival-secondary hover:bg-slate-50 hover:text-festival-primary transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Programme {day.day_name} (PDF)
                      </a>
                    )
                  ))}
                </div>
              ) : (
                <a
                  href="#download-pdf"
                  className="inline-flex items-center px-6 py-3 rounded-full bg-festival-primary text-white font-medium 
                  shadow-soft transition-all duration-300 hover:shadow-md hover:bg-opacity-90"
                >
                  Télécharger le programme complet (PDF)
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Schedule;
