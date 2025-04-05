
import { motion } from "framer-motion";
import { Event } from "@/integrations/supabase/client";
import EventItem from "@/components/EventItem";

type EventGridProps = {
  events: Event[];
  isLoading: boolean;
  filteredEvents: Event[];
  currentEvents: Event[];
  activeFilter: string;
  validateCategory: (category: string) => "anime" | "manga" | "cosplay" | "gaming" | "culture";
  formatDate: (dateString: string) => string;
  activeTab: string;
};

const EventGrid = ({ 
  events, 
  isLoading, 
  filteredEvents, 
  currentEvents, 
  activeFilter, 
  validateCategory,
  formatDate,
  activeTab
}: EventGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-festival-accent"></div>
      </div>
    );
  }

  if (filteredEvents.length > 0 && !isLoading) {
    return (
      <div className="text-center mb-6">
        <p className="text-festival-secondary">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} {activeFilter !== 'all' ? `de ${activeFilter}` : ''} {activeTab === 'upcoming' ? 'à venir' : 'passés'}
        </p>
      </div>
    );
  }

  return (
    <>
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
            <p className="text-festival-secondary">Aucun événement trouvé pour cette catégorie.</p>
          </div>
        )}
      </div>

      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-festival-secondary">Aucun événement trouvé pour cette catégorie.</p>
        </div>
      )}
    </>
  );
};

export default EventGrid;
