
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { useFacebookEvents } from "@/hooks/use-facebook-photos";

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image: string;
  category: "anime" | "manga" | "cosplay" | "gaming" | "culture";
  registrationLink?: string;
  past?: boolean;
};

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get("category") || "all");
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "upcoming");
  const { events: fbEvents, isLoading: isFbEventsLoading, error: fbEventsError, fetchEvents } = useFacebookEvents();
  
  // Combined upcoming and past events
  const [events, setEvents] = useState<Event[]>([
    // Upcoming events
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
    },
    
    // Past events from Facebook - manually added from provided list
    {
      id: "7",
      title: "Shotaku Shogatsu - Tour @Rabat Isamgi",
      description: "Festival japonais avec activités, concours et animations autour de la culture japonaise.",
      date: "30 Décembre 2023",
      location: "ISMAGi Rabat Reconnu par l'Etat · الرباط",
      image: "https://source.unsplash.com/random/800x600?japan-festival",
      category: "culture",
      past: true
    },
    {
      id: "8",
      title: "Shotaku Summer Edition - ISMAGI, Rabat",
      description: "Édition estivale du festival Shotaku avec des activités spéciales pour la saison.",
      date: "23 Juillet 2023",
      location: "ISMAGI, Rabat",
      image: "https://source.unsplash.com/random/800x600?summer-festival",
      category: "culture",
      past: true
    },
    {
      id: "9",
      title: "Shotaku 9e festival - Enim, Rabat",
      description: "9ème édition du festival Shotaku célébrant la culture japonaise et l'univers geek au Maroc.",
      date: "29 Avril 2023",
      location: "École nationale supérieure des mines de Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?anime-festival",
      category: "anime",
      past: true
    },
    {
      id: "10",
      title: "Shotaku Chiisai 3 @Rabat",
      description: "Édition compacte du festival Shotaku avec focus sur les ateliers et démonstrations.",
      date: "29 Janvier 2023",
      location: "Rabat",
      image: "https://source.unsplash.com/random/800x600?workshop-anime",
      category: "manga",
      past: true
    },
    {
      id: "11",
      title: "SHOTAKU AUI EDITION",
      description: "Édition spéciale du festival Shotaku à l'Université Al Akhawayn.",
      date: "26 Novembre 2022",
      location: "Al Akhawayn University in Ifrane · إفران",
      image: "https://source.unsplash.com/random/800x600?university-festival",
      category: "culture",
      past: true
    },
    {
      id: "12",
      title: "Gamers M Area @Shotaku 7e Festival",
      description: "Espace gaming du festival avec tournois et démonstrations de jeux vidéo.",
      date: "24 Juillet 2022",
      location: "Rabat · الدار البيضاء",
      image: "https://source.unsplash.com/random/800x600?gaming-arena",
      category: "gaming",
      past: true
    },
    {
      id: "13",
      title: "Shotaku 8e festival - Rabat",
      description: "8ème édition du festival Shotaku avec de nombreuses activités et invités spéciaux.",
      date: "24 Juillet 2022",
      location: "Rabat Morocco · الرباط",
      image: "https://source.unsplash.com/random/800x600?festival",
      category: "culture",
      past: true
    },
    {
      id: "14",
      title: "Shotaku Chiisai 2e Festival - Théâtre Bahnini",
      description: "Deuxième édition du festival Shotaku Chiisai avec spectacles et animations.",
      date: "22 Février 2020",
      location: "Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?theatre-event",
      category: "culture",
      past: true
    },
    {
      id: "15",
      title: "Shotaku 7e festival - Rabat",
      description: "7ème édition du festival célébrant la culture japonaise et l'univers geek au Maroc.",
      date: "8 Décembre 2019",
      location: "Ecole de danse Colibri Centre Artistique · الرباط",
      image: "https://source.unsplash.com/random/800x600?dance-school",
      category: "culture",
      past: true
    },
    {
      id: "16",
      title: "Gamers M Area @Shotaku 7",
      description: "Zone gaming avec les derniers jeux et tournois compétitifs.",
      date: "8 Décembre 2019",
      location: "Ecole de danse Colibri Centre Artistique · الرباط",
      image: "https://source.unsplash.com/random/800x600?gaming-competition",
      category: "gaming",
      past: true
    },
    {
      id: "17",
      title: "Faber Castell Drawing contest @Shotaku 7",
      description: "Concours de dessin sponsorisé par Faber Castell avec prix à gagner.",
      date: "8 Décembre 2019",
      location: "Ecole de danse Colibri Centre Artistique · الرباط",
      image: "https://source.unsplash.com/random/800x600?drawing-contest",
      category: "manga",
      past: true
    },
    {
      id: "18",
      title: "L'Foire / JAPAN @Kenitra",
      description: "Foire japonaise avec expositions, ventes et animations culturelles.",
      date: "17 Mars 2019",
      location: "ENSA-K · القنيطرة",
      image: "https://source.unsplash.com/random/800x600?japan-fair",
      category: "culture",
      past: true
    },
    {
      id: "19",
      title: "Tournoi PUBG @Kenitra",
      description: "Compétition officielle PUBG avec récompenses pour les meilleures équipes.",
      date: "17 Mars 2019",
      location: "ENSA-K · القنيطرة",
      image: "https://source.unsplash.com/random/800x600?esport",
      category: "gaming",
      past: true
    },
    {
      id: "20",
      title: "Shotaku 6e Festival - Mega Mall",
      description: "6ème édition du festival Shotaku avec encore plus d'activités et d'animations.",
      date: "24 Juin 2018",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?mall-event",
      category: "culture",
      past: true
    },
    {
      id: "21",
      title: "Shotaku 5e Festival - Mega Mall",
      description: "5ème édition du festival célébrant la culture japonaise au centre commercial Mega Mall.",
      date: "4 Février 2018",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?anime-convention",
      category: "anime",
      past: true
    },
    {
      id: "22",
      title: "Asiexpo 2 @Théâtre Allal El Fassi",
      description: "Deuxième édition de l'exposition asiatique avec focus sur le Japon et la Corée.",
      date: "15 Octobre 2017",
      location: "Théatre Allal El fassi Agdal Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?asia-expo",
      category: "culture",
      past: true
    },
    {
      id: "23",
      title: "Shotaku 4 @Mega Mall",
      description: "4ème édition du festival Shotaku avec concours de cosplay et animations.",
      date: "11 Février 2017",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?cosplay-contest",
      category: "cosplay",
      past: true
    },
    {
      id: "24",
      title: "Shotaku 3 @Mega Mall - Rabat",
      description: "3ème édition du festival avec des concours, expositions et performances live.",
      date: "3 Août 2016",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?anime-fest",
      category: "anime",
      past: true
    },
    {
      id: "25",
      title: "Shotaku 2 @ Théâtre allal el fassi Rabat",
      description: "Deuxième édition du festival Shotaku avec une programmation enrichie.",
      date: "24 Janvier 2016",
      location: "Théâtre allal el fassi Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?theatre-festival",
      category: "culture",
      past: true
    },
    {
      id: "26",
      title: "Shotaku @ Rabat",
      description: "Première édition du festival Shotaku célébrant la culture japonaise au Maroc.",
      date: "25 Juillet 2015",
      location: "Salle Allal Lfassi, Agdal. · الرباط",
      image: "https://source.unsplash.com/random/800x600?first-festival",
      category: "culture",
      past: true
    },
    {
      id: "27",
      title: "✖ CASTING TOP COSPLAYEUR ✖ ♕ MAROC EVENTS ♕",
      description: "Casting pour trouver les meilleurs cosplayeurs du Maroc.",
      date: "25 Juillet 2015",
      location: "Salle Allal Lfassi, Agdal. · الرباط",
      image: "https://source.unsplash.com/random/800x600?cosplay-casting",
      category: "cosplay",
      past: true
    },
    {
      id: "28",
      title: "Concours dessin 3 @Shotaku 3",
      description: "Concours de dessin avec plusieurs catégories et prix à gagner.",
      date: "3 Août 2016",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?drawing-competition",
      category: "manga",
      past: true
    },
    {
      id: "29",
      title: "Best Morrocan Cosplay 2K16 @Shotaku 3",
      description: "Compétition pour désigner le meilleur cosplay marocain de l'année 2016.",
      date: "3 Août 2016",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?best-cosplay",
      category: "cosplay",
      past: true
    },
    {
      id: "30",
      title: "Compétition de dessin @ Shotaku 2",
      description: "Compétition artistique avec plusieurs catégories de dessins manga et anime.",
      date: "24 Janvier 2016",
      location: "Théâtre allal el fassi Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?drawing",
      category: "manga",
      past: true
    },
    {
      id: "31",
      title: "Maroc Events - Staff recrutement *2",
      description: "Session de recrutement pour rejoindre l'équipe d'organisation des événements.",
      date: "22 Mars 2020",
      location: "Maroc Events · الرباط",
      image: "https://source.unsplash.com/random/800x600?recruitment",
      category: "culture",
      past: true
    },
    {
      id: "32",
      title: "Shotaku Chiisai 2 - Rabat",
      description: "Edition compacte du festival Shotaku à Rabat.",
      date: "22 Février 2020",
      location: "Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?small-festival",
      category: "culture",
      past: true
    },
    {
      id: "33",
      title: "Shotaku 2017 @Morocco",
      description: "Edition spéciale du festival Shotaku au Maroc.",
      date: "31 Décembre 2017",
      location: "Morocco",
      image: "https://source.unsplash.com/random/800x600?morocco-festival",
      category: "culture",
      past: true
    },
    {
      id: "34",
      title: "Shotaku @Théâtre allal el fassi - ST1",
      description: "Première édition spéciale du festival Shotaku au théâtre Allal El Fassi.",
      date: "9 Juillet 2017",
      location: "Théatre Allal El fassi Agdal Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?theatre-anime",
      category: "culture",
      past: true
    },
    {
      id: "35",
      title: "Shotaku Awards - Page",
      description: "Cérémonie de remise des prix Shotaku Awards.",
      date: "11 Février 2017",
      location: "Maroc Events · الرباط",
      image: "https://source.unsplash.com/random/800x600?awards-ceremony",
      category: "culture",
      past: true
    },
    {
      id: "36",
      title: "Concours cosplays (Best cosplayeurs 2017) @Shotaku 4",
      description: "Concours pour élire les meilleurs cosplayeurs de 2017.",
      date: "11 Février 2017",
      location: "Mega Mall Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?cosplay-awards",
      category: "cosplay",
      past: true
    },
    {
      id: "37",
      title: "Shotaku Awards - Groupe",
      description: "Remise des prix pour les groupes de cosplay.",
      date: "11 Février 2017",
      location: "Maroc Events · الرباط",
      image: "https://source.unsplash.com/random/800x600?group-cosplay",
      category: "cosplay",
      past: true
    },
    {
      id: "38",
      title: "Shotaku Awards - chaîne",
      description: "Remise des prix pour les chaînes de contenu japonais.",
      date: "11 Février 2017",
      location: "Maroc Events · الرباط",
      image: "https://source.unsplash.com/random/800x600?content-awards",
      category: "culture",
      past: true
    },
    {
      id: "39",
      title: "Gamers M 4 - The legends area",
      description: "Espace dédié aux jeux vidéo légendaires.",
      date: "11 Février 2017",
      location: "Maroc Events · الرباط",
      image: "https://source.unsplash.com/random/800x600?retro-gaming",
      category: "gaming",
      past: true
    },
    {
      id: "40",
      title: "Ohayo Japan 3",
      description: "Troisième édition de l'événement dédié à la culture japonaise.",
      date: "6 Avril 2019",
      location: "École Nationale Supérieure des Mines de Rabat · الرباط",
      image: "https://source.unsplash.com/random/800x600?japan-culture",
      category: "culture",
      past: true
    },
    {
      id: "41",
      title: "L'after Shotaku 6e Festival @Théâtre Bahnini",
      description: "Soirée post-festival avec animations et rencontres.",
      date: "18 Juillet 2018",
      location: "Théâtre Bahnini · الرباط",
      image: "https://source.unsplash.com/random/800x600?after-party",
      category: "culture",
      past: true
    }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Attempt to fetch Facebook events if we have an access token
  useEffect(() => {
    const hasToken = localStorage.getItem('fb_access_token');
    if (hasToken) {
      fetchEvents();
    }
  }, []);

  // Process Facebook events when they load
  useEffect(() => {
    if (fbEvents && fbEvents.length > 0) {
      console.log("Processing Facebook events:", fbEvents);

      // We can add Facebook events to our events list if needed
      // For now, we're using the manual list as it's more complete
    }
  }, [fbEvents]);

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
      // Filter by tab (upcoming or past)
      if (activeTab === "upcoming" && event.past) return false;
      if (activeTab === "past" && !event.past) return false;
      // Filter by category
      return activeFilter === "all" || event.category === activeFilter;
    });

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
                Événements
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                Découvrez nos événements passés et à venir
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
                  À venir
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === "past"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Passés
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
                    {event.past && (
                      <Badge
                        variant="outline"
                        className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-xs font-medium"
                      >
                        Passé
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-festival-primary mb-2">{event.title}</h3>
                    <p className="text-festival-secondary text-sm mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-festival-accent mr-2" />
                        <span className="text-festival-secondary">{event.date}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-festival-accent mr-2" />
                          <span className="text-festival-secondary">{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-festival-accent mr-2" />
                        <span className="text-festival-secondary">{event.location}</span>
                      </div>
                    </div>
                    
                    {event.registrationLink && !event.past && (
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
            
            {/* Pagination for Past Events (if there are many) */}
            {activeTab === "past" && filteredEvents.length > 9 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-festival-accent text-white">1</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50">2</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50">3</button>
                  <span className="text-festival-secondary mx-1">...</span>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-festival-secondary hover:bg-slate-50">
                    <ChevronRight className="h-5 w-5" />
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
