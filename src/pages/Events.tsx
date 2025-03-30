
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: "anime" | "manga" | "cosplay" | "gaming" | "culture";
  registrationLink?: string;
};

const Events = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Concours Cosplay International",
      description: "Participez à notre grand concours de cosplay avec des invités internationaux et gagnez des prix incroyables.",
      date: "26 Mars 2024",
      time: "14:00 - 17:00",
      location: "Scène principale",
      image: "https://source.unsplash.com/random/800x600?cosplay",
      category: "cosplay",
      registrationLink: "#register-cosplay"
    },
    {
      id: "2",
      title: "Projection Exclusive: Demon Slayer",
      description: "Projection en avant-première du dernier film Demon Slayer, suivie d'une discussion avec des experts en animation japonaise.",
      date: "27 Mars 2024",
      time: "19:00 - 21:30",
      location: "Cinéma du festival",
      image: "https://source.unsplash.com/random/800x600?anime",
      category: "anime"
    },
    {
      id: "3",
      title: "Atelier Manga avec Sensei Takahashi",
      description: "Apprenez les techniques de dessin manga avec le célèbre mangaka Sensei Takahashi. Places limitées, réservation obligatoire.",
      date: "26 Mars 2024",
      time: "10:00 - 12:00",
      location: "Zone Creative",
      image: "https://source.unsplash.com/random/800x600?manga-drawing",
      category: "manga",
      registrationLink: "#register-workshop"
    },
    {
      id: "4",
      title: "Tournoi Super Smash Bros Ultimate",
      description: "Affrontez les meilleurs joueurs du Maroc dans notre tournoi Super Smash Bros Ultimate. Nombreux prix à gagner!",
      date: "28 Mars 2024",
      time: "13:00 - 18:00",
      location: "Zone Gaming",
      image: "https://source.unsplash.com/random/800x600?gaming",
      category: "gaming",
      registrationLink: "#register-tournament"
    },
    {
      id: "5",
      title: "Défilé de Mode Harajuku",
      description: "Découvrez les dernières tendances de la mode japonaise avec notre défilé Harajuku exclusif.",
      date: "27 Mars 2024",
      time: "15:00 - 16:30",
      location: "Scène principale",
      image: "https://source.unsplash.com/random/800x600?harajuku",
      category: "culture"
    },
    {
      id: "6",
      title: "Concert J-Pop Live",
      description: "Vibrez au rythme de la J-Pop avec nos artistes invités qui interprèteront les meilleures chansons d'anime.",
      date: "28 Mars 2024",
      time: "20:00 - 22:00",
      location: "Scène principale",
      image: "https://source.unsplash.com/random/800x600?concert",
      category: "culture"
    }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredEvents = activeFilter === "all" 
    ? events 
    : events.filter(event => event.category === activeFilter);

  const getCategoryColor = (category: Event["category"]) => {
    switch (category) {
      case "anime":
        return "bg-blue-100 text-blue-800";
      case "manga":
        return "bg-green-100 text-green-800";
      case "cosplay":
        return "bg-purple-100 text-purple-800";
      case "gaming":
        return "bg-amber-100 text-amber-800";
      case "culture":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                Événements à Venir
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                Découvrez nos prochains événements et réservez vos places pour ne rien manquer
              </p>
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
                  Tous
                </button>
                <button
                  onClick={() => setActiveFilter("anime")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "anime"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Anime
                </button>
                <button
                  onClick={() => setActiveFilter("manga")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "manga"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Manga
                </button>
                <button
                  onClick={() => setActiveFilter("cosplay")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "cosplay"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Cosplay
                </button>
                <button
                  onClick={() => setActiveFilter("gaming")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "gaming"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Gaming
                </button>
                <button
                  onClick={() => setActiveFilter("culture")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "culture"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Culture
                </button>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-festival-primary mb-2">{event.title}</h3>
                    <p className="text-festival-secondary text-sm mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-festival-accent mr-2" />
                        <span className="text-festival-secondary">{event.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-festival-accent mr-2" />
                        <span className="text-festival-secondary">{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-festival-accent mr-2" />
                        <span className="text-festival-secondary">{event.location}</span>
                      </div>
                    </div>
                    
                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        className="block w-full text-center py-2 rounded-full bg-festival-accent text-white text-sm font-medium 
                        transition-all duration-300 hover:bg-opacity-90"
                      >
                        S'inscrire
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No results message */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-festival-secondary">Aucun événement trouvé pour cette catégorie.</p>
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
