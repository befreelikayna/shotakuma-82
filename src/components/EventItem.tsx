
import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface EventItemProps {
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
}

const EventItem: React.FC<EventItemProps> = ({
  title,
  description,
  date,
  time,
  location,
  image,
  category,
  registrationLink,
  past
}) => {
  const getCategoryColor = (category: EventItemProps["category"]) => {
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
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || "https://source.unsplash.com/random/800x600?festival"}
          alt={title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
            category
          )}`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        {past && (
          <Badge
            variant="outline"
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-xs font-medium"
          >
            Passé
          </Badge>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-festival-primary mb-2">{title}</h3>
        <p className="text-festival-secondary text-sm mb-4">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-festival-accent mr-2" />
            <span className="text-festival-secondary">{date}</span>
          </div>
          {time && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-festival-accent mr-2" />
              <span className="text-festival-secondary">{time}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-festival-accent mr-2" />
            <span className="text-festival-secondary">{location}</span>
          </div>
        </div>
        
        {registrationLink && !past && (
          <a
            href={registrationLink}
            className="block w-full text-center py-2 rounded-full bg-festival-accent text-white text-sm font-medium 
            transition-all duration-300 hover:bg-opacity-90"
          >
            S'inscrire
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default EventItem;
