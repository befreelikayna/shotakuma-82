
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Event = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: "panel" | "workshop" | "competition" | "screening" | "performance";
};

type Day = {
  date: string;
  dayName: string;
  events: Event[];
};

const Schedule = () => {
  const [activeDay, setActiveDay] = useState<string>("day1");
  const [schedule, setSchedule] = useState<Day[]>([
    {
      date: "26 Mars 2024",
      dayName: "Jour 1",
      events: [
        {
          id: "e1",
          title: "Cérémonie d'ouverture",
          description: "Lancement officiel du festival avec des discours de bienvenue et une performance spéciale.",
          startTime: "10:00",
          endTime: "11:00",
          location: "Scène principale",
          category: "performance",
        },
        {
          id: "e2",
          title: "Panel: Histoire du Manga",
          description: "Une exploration de l'évolution du manga à travers les décennies.",
          startTime: "11:30",
          endTime: "12:30",
          location: "Salle de conférence A",
          category: "panel",
        },
        {
          id: "e3",
          title: "Atelier de Dessin Manga",
          description: "Apprenez les bases du dessin manga avec un artiste professionnel.",
          startTime: "13:00",
          endTime: "14:30",
          location: "Zone créative",
          category: "workshop",
        },
        {
          id: "e4",
          title: "Projection: Films d'animation classiques",
          description: "Redécouvrez les chefs-d'œuvre de l'animation japonaise.",
          startTime: "15:00",
          endTime: "17:00",
          location: "Cinéma",
          category: "screening",
        },
        {
          id: "e5",
          title: "Concert J-Pop",
          description: "Un concert énergique célébrant la musique pop japonaise.",
          startTime: "18:00",
          endTime: "20:00",
          location: "Scène principale",
          category: "performance",
        },
      ],
    },
    {
      date: "27 Mars 2024",
      dayName: "Jour 2",
      events: [
        {
          id: "e6",
          title: "Qualifications Concours Cosplay",
          description: "Première phase du grand concours de cosplay du festival.",
          startTime: "10:30",
          endTime: "12:30",
          location: "Scène principale",
          category: "competition",
        },
        {
          id: "e7",
          title: "Panel: Industrie de l'Anime",
          description: "Discussion sur l'état actuel et le futur de l'industrie de l'animation japonaise.",
          startTime: "13:00",
          endTime: "14:00",
          location: "Salle de conférence B",
          category: "panel",
        },
        {
          id: "e8",
          title: "Atelier de Calligraphie",
          description: "Découvrez l'art de la calligraphie japonaise.",
          startTime: "14:30",
          endTime: "16:00",
          location: "Zone créative",
          category: "workshop",
        },
        {
          id: "e9",
          title: "Tournoi Jeux Vidéo",
          description: "Compétition sur les jeux de combat les plus populaires.",
          startTime: "16:30",
          endTime: "19:00",
          location: "Zone gaming",
          category: "competition",
        },
        {
          id: "e10",
          title: "Projection: Nouveaux Animes",
          description: "Avant-première de séries d'anime récentes et à venir.",
          startTime: "19:30",
          endTime: "21:30",
          location: "Cinéma",
          category: "screening",
        },
      ],
    },
    {
      date: "28 Mars 2024",
      dayName: "Jour 3",
      events: [
        {
          id: "e11",
          title: "Atelier Cosplay",
          description: "Conseils et techniques pour créer vos propres costumes.",
          startTime: "10:00",
          endTime: "11:30",
          location: "Zone créative",
          category: "workshop",
        },
        {
          id: "e12",
          title: "Finale Concours Cosplay",
          description: "Grande finale du concours avec présentation des meilleurs cosplays.",
          startTime: "12:00",
          endTime: "14:00",
          location: "Scène principale",
          category: "competition",
        },
        {
          id: "e13",
          title: "Panel: Rencontre avec les Invités",
          description: "Session de questions-réponses avec nos invités spéciaux.",
          startTime: "14:30",
          endTime: "15:30",
          location: "Salle de conférence A",
          category: "panel",
        },
        {
          id: "e14",
          title: "Parade Cosplay",
          description: "Défilé de tous les cosplayers à travers le festival.",
          startTime: "16:00",
          endTime: "17:00",
          location: "Tout le site",
          category: "performance",
        },
        {
          id: "e15",
          title: "Cérémonie de Clôture",
          description: "Remise des prix et spectacle final pour conclure le festival.",
          startTime: "18:00",
          endTime: "20:00",
          location: "Scène principale",
          category: "performance",
        },
      ],
    },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getCategoryColor = (category: Event["category"]) => {
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeSchedule = schedule.find((day) => day.dayName.toLowerCase().replace(/\s+/g, "") === activeDay);

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
                Découvrez les événements, ateliers, projections et performances prévus pendant les trois jours du festival
              </p>
            </div>

            {/* Day Tabs */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 rounded-full bg-white shadow-soft">
                {schedule.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDay(day.dayName.toLowerCase().replace(/\s+/g, ""))}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeDay === day.dayName.toLowerCase().replace(/\s+/g, "")
                        ? "bg-festival-accent text-white shadow-accent"
                        : "text-festival-secondary hover:bg-slate-100"
                    }`}
                  >
                    {day.dayName}
                    <span className="ml-2 text-xs opacity-75">{day.date}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Categories Legend */}
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

            {/* Schedule List */}
            <div className="space-y-4">
              {activeSchedule?.events.map((event) => (
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
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                  </div>
                  <p className="text-festival-secondary mb-4">{event.description}</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-festival-accent mr-1" />
                    <span className="text-sm text-festival-secondary">{event.location}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Download Button */}
            <div className="mt-12 text-center">
              <a
                href="#download-pdf"
                className="inline-flex items-center px-6 py-3 rounded-full bg-festival-primary text-white font-medium 
                shadow-soft transition-all duration-300 hover:shadow-md hover:bg-opacity-90"
              >
                Télécharger le programme complet (PDF)
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Schedule;
