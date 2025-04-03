
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

export interface FacebookPhoto {
  id: string;
  source: string;
  name?: string;
}

export interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  place?: {
    name: string;
    location?: {
      city: string;
      country: string;
    }
  };
  cover?: {
    source: string;
  };
  // Added fields for managing custom images and categories
  custom_image?: string;
  category?: "anime" | "manga" | "cosplay" | "gaming" | "culture";
}

export function useFacebookPhotos(pageId: string = 'OTAKU.sho') {
  const [photos, setPhotos] = useState<FacebookPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get access token from localStorage (temporary solution for demo)
      const accessToken = localStorage.getItem('fb_access_token');
      
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos?fields=source,name&limit=100&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const data = await response.json();
      console.log('Facebook photos fetched:', data);
      
      if (data.data && Array.isArray(data.data)) {
        setPhotos(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setPhotos([]);
      }
    } catch (err) {
      console.error('Error fetching Facebook photos:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos depuis Facebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    photos,
    isLoading,
    error,
    fetchPhotos
  };
}

export function useFacebookEvents(pageId: string = 'OTAKU.sho') {
  const [events, setEvents] = useState<FacebookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedEvents, setStoredEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get access token from localStorage (temporary solution for demo)
      const accessToken = localStorage.getItem('fb_access_token');
      
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/events?fields=name,description,start_time,end_time,place,cover&limit=100&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      console.log('Facebook events fetched:', data);
      
      if (data.data && Array.isArray(data.data)) {
        setEvents(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setEvents([]);
      }

      // Now fetch stored events with custom images from Supabase
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false });
          
        if (error) throw error;
        
        if (eventsData) {
          console.log('Stored events fetched:', eventsData);
          setStoredEvents(eventsData);
        }
      } catch (dbError) {
        console.error('Error fetching stored events:', dbError);
      }
    } catch (err) {
      console.error('Error fetching Facebook events:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements depuis Facebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to save event to database
  const saveEvent = async (event: FacebookEvent & { image?: string, category?: string, event_date?: string }) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('events')
        .upsert({
          id: event.id,
          name: event.name,
          description: event.description || '',
          place: event.place?.name || '',
          location: event.place?.location ? 
            `${event.place.location.city || ''}, ${event.place.location.country || ''}` : '',
          event_date: event.event_date || event.start_time || new Date().toISOString(),
          image_url: event.image || event.cover?.source || '',
          category: event.category || 'culture'
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Événement sauvegardé avec succès"
      });
      
      // Refresh the stored events
      fetchEvents();
      return data;
    } catch (err) {
      console.error('Error saving event:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'événement",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    events,
    storedEvents,
    isLoading,
    error,
    fetchEvents,
    saveEvent
  };
}
