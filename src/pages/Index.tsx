import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventItem from "@/components/EventItem";
import SliderComponent from "@/components/Slider";
import TicketPackage from "@/components/TicketPackage";
import { customSupabase, Event, Ticket } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";

// Type guards for database items
type TicketDataItem = {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
  available: boolean;
};

function isTicketDataItem(item: any): item is TicketDataItem {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    'name' in item &&
    'price' in item &&
    'available' in item
  );
}

type EventDataItem = {
  id: string;
  name: string;
  description: string | null;
  place: string;
  location: string | null;
  event_date: string;
  image_url: string | null;
  category: string;
};

function isEventDataItem(item: any): item is EventDataItem {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    'name' in item &&
    'place' in item &&
    'event_date' in item &&
    'category' in item
  );
}

const Home = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);

  // Default features for ticket packages
  const defaultFeatures = {
    "Basic": [
      "Accès à tous les événements",
      "Places standards",
      "Badge du festival"
    ],
    "Premium": [
      "Accès à tous les événements", 
      "Places VIP",
      "Badge du festival",
      "Tote bag exclusif",
      "Rencontre avec les artistes"
    ],
    "VIP": [
      "Accès à tous les événements",
      "Places VIP Front Row",
      "Badge spécial du festival",
      "Tote bag exclusif premium",
      "Accès backstage",
      "Rencontre avec les artistes",
      "Participation à l'after party"
    ]
  };

  // Fetch tickets from Supabase
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoadingTickets(true);
        const { data, error } = await customSupabase
          .from('tickets')
          .select('*')
          .eq('available', true);
        
        if (error) {
          throw error;
        }
        
        if (data && Array.isArray(data)) {
          // Process tickets with type safety
          const ticketData = data.filter(isTicketDataItem);
          
          // Add default features based on ticket name
          const enhancedTickets = ticketData.map(item => {
            const ticketName = item.name as keyof typeof defaultFeatures;
            
            // Create a properly typed ticket object
            const typedTicket = {
              id: item.id,
              name: item.name,
              price: typeof item.price === 'number' ? item.price : Number(item.price),
              description: item.description,
              available: Boolean(item.available)
            } as Ticket;
            
            // Add features based on ticket name
            return {
              ...typedTicket,
              features: (defaultFeatures as any)[typedTicket.name] || []
            };
          });
          
          setTickets(enhancedTickets);
        } else {
          setTickets([]);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoadingTickets(false);
      }
    };
    
    fetchTickets();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        let query = customSupabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });
  
        if (date) {
          const formattedDate = format(date, 'yyyy-MM-dd');
          query = query.eq('event_date', formattedDate);
        }
  
        const { data, error } = await query;
  
        if (error) {
          throw error;
        }
  
        if (data && Array.isArray(data)) {
          // Process events with type safety
          const eventData = data.filter(isEventDataItem);
          
          // Convert to Event type
          const typedEvents = eventData.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            place: item.place,
            location: item.location,
            event_date: item.event_date,
            image_url: item.image_url,
            category: item.category,
            // Add title property to make it compatible with EventItem
            title: item.name,
            // Other properties EventItem might need
            date: format(new Date(item.event_date), 'dd/MM/yyyy'),
            time: "19:00", // Default time if not provided
            image: item.image_url || "/placeholder.svg",
            registrationLink: "#"
          } as Event));
          
          setEvents(typedEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchEvents();
  }, [date]);

  return (
    <>
      <Helmet>
        <title>Festival</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>
      <Navbar />
      <main className="font-light">
        {/* Hero Section */}
        <section className="relative h-screen-75 md:h-screen overflow-hidden">
          <SliderComponent />
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-festival-secondary to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">Festival</h1>
            <p className="text-lg md:text-xl lg:text-2xl font-light">Bienvenue au festival</p>
            <Button className="mt-6 bg-festival-primary text-white">Découvrir</Button>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="festival-container my-12">
          <h2 className="text-3xl text-center md:text-4xl font-display font-bold text-festival-primary mb-8">
            Calendrier
          </h2>
          <div className="flex justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* Events Section */}
        <section className="festival-container my-12">
          <h2 className="text-3xl text-center md:text-4xl font-display font-bold text-festival-primary mb-8">
            Événements
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-festival-primary border-t-transparent rounded-full"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((eventItem) => (
                <EventItem key={eventItem.id} 
                  title={eventItem.name}
                  description={eventItem.description || ""}
                  date={format(new Date(eventItem.event_date), 'dd/MM/yyyy')}
                  time="19:00"
                  location={eventItem.place}
                  image={eventItem.image_url || "/placeholder.svg"}
                  category={eventItem.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun événement prévu pour cette date.
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section className="festival-container my-12">
          <h2 className="text-3xl text-center md:text-4xl font-display font-bold text-festival-primary mb-8">
            Galerie
          </h2>
          {/* Placeholder for Gallery component */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-200 h-60 rounded"></div>
            <div className="bg-gray-200 h-60 rounded"></div>
            <div className="bg-gray-200 h-60 rounded"></div>
          </div>
        </section>

        {/* Tickets Section */}
        <div className="festival-container my-12">
          <h2 className="text-3xl text-center md:text-4xl font-display font-bold text-festival-primary mb-8">
            Nos Billets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingTickets ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-festival-primary border-t-transparent rounded-full"></div>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket, index) => (
                <TicketPackage 
                  key={ticket.id || index}
                  name={ticket.name}
                  price={ticket.price}
                  features={ticket.features || []}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Aucun billet disponible pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Section */}
        <section className="bg-festival-secondary py-16">
          <div className="festival-container text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Inscrivez-vous à notre newsletter
            </h2>
            <p className="text-lg text-white mb-8">
              Restez informé de toutes les dernières nouvelles et mises à jour du festival.
            </p>
            <div className="flex justify-center">
              <div className="w-full md:w-3/4 lg:w-1/2">
                <div className="flex flex-col md:flex-row">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 md:mb-0 md:mr-2"
                  />
                  <Button className="bg-festival-primary text-white w-full md:w-auto">
                    S'inscrire
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Home;
