
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Loader2, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFacebookEvents } from "@/hooks/use-facebook-photos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EVENT_CATEGORIES = [
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "cosplay", label: "Cosplay" },
  { value: "gaming", label: "Gaming" },
  { value: "culture", label: "Culture" }
];

interface Event {
  id: string;
  name: string;
  description: string;
  place: string;
  location: string;
  event_date: string;
  image_url: string;
  category: string;
  created_at?: string;
}

const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    name: "",
    description: "",
    place: "",
    location: "",
    event_date: new Date().toISOString().split('T')[0],
    image_url: "",
    category: "culture"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { events: fbEvents, storedEvents, fetchEvents, saveEvent } = useFacebookEvents();

  const fetchStoredEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Events loaded:", data);
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoredEvents();
    
    const channel = supabase
      .channel('admin:events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        () => {
          console.log('Events changed, refreshing...');
          fetchStoredEvents();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    fetchStoredEvents();
    toast({
      title: "Actualisé",
      description: "Les événements ont été actualisés."
    });
  };

  const handleFacebookSync = () => {
    fetchEvents();
  };

  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.event_date) {
      toast({
        title: "Erreur",
        description: "Le nom et la date sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('events')
        .insert([{
          name: newEvent.name,
          description: newEvent.description || '',
          place: newEvent.place || '',
          location: newEvent.location || '',
          event_date: newEvent.event_date,
          image_url: newEvent.image_url || '',
          category: newEvent.category || 'culture'
        }]);
      
      if (error) {
        throw error;
      }
      
      setNewEvent({
        name: "",
        description: "",
        place: "",
        location: "",
        event_date: new Date().toISOString().split('T')[0],
        image_url: "",
        category: "culture"
      });
      
      toast({
        title: "Succès",
        description: "L'événement a été ajouté"
      });

      fetchStoredEvents();
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'événement: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFacebookEvent = async (event: any) => {
    try {
      const formattedEvent = {
        id: event.id,
        name: event.name,
        description: event.description || '',
        place: event.place?.name || '',
        location: event.place?.location ? 
          `${event.place.location.city || ''}, ${event.place.location.country || ''}` : '',
        event_date: event.start_time ? new Date(event.start_time).toISOString() : new Date().toISOString(),
        image_url: event.cover?.source || '',
        category: 'culture'
      };
      
      await saveEvent(formattedEvent);
      fetchStoredEvents();
    } catch (error) {
      console.error('Error saving Facebook event:', error);
    }
  };

  const handleUpdateEvent = async (event: Event) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          description: event.description,
          place: event.place,
          location: event.location,
          event_date: event.event_date,
          image_url: event.image_url,
          category: event.category
        })
        .eq('id', event.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Succès",
        description: "L'événement a été mis à jour"
      });

      setSelectedEvent(null);
      fetchStoredEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'événement: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Supprimé",
        description: "L'événement a été supprimé"
      });

      fetchStoredEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement: " + error.message,
        variant: "destructive",
      });
    }
  };

  const formatEventDate = (dateString: string) => {
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

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion des Événements</h2>
      
      <div className="flex justify-end mb-4 gap-2">
        <Button 
          variant="outline" 
          onClick={handleFacebookSync}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Synchroniser avec Facebook
        </Button>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
      
      {/* Add new event form */}
      <div className="bg-slate-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-festival-primary mb-4">Ajouter un nouvel événement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <Input
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              placeholder="Nom de l'événement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              value={typeof newEvent.event_date === 'string' ? newEvent.event_date.split('T')[0] : ''}
              onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
            <Input
              value={newEvent.place || ''}
              onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })}
              placeholder="Lieu de l'événement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localité</label>
            <Input
              value={newEvent.location || ''}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Ville, Pays"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            placeholder="Description de l'événement"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
            <Input
              value={newEvent.image_url || ''}
              onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
              placeholder="https://exemple.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <Select
              value={newEvent.category}
              onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleAddEvent}
          className="bg-festival-accent text-white flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Ajout en cours...
            </>
          ) : (
            <>
              <Plus size={16} /> Ajouter
            </>
          )}
        </Button>
      </div>
      
      {/* Facebook Events section */}
      {fbEvents && fbEvents.length > 0 && (
        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-medium text-festival-primary mb-4">Événements Facebook ({fbEvents.length})</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fbEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>
                      {event.start_time && formatEventDate(event.start_time)}
                    </TableCell>
                    <TableCell>
                      {event.place?.name}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveFacebookEvent(event)}
                      >
                        Importer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {/* Stored Events section */}
      <h3 className="text-lg font-medium text-festival-primary mb-4">Événements ({events.length})</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des événements...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="w-16 h-16 relative rounded-md overflow-hidden">
                      <img 
                        src={event.image_url || "https://source.unsplash.com/random/800x600?festival"}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{formatEventDate(event.event_date)}</TableCell>
                  <TableCell>{event.place}</TableCell>
                  <TableCell>
                    <span className="capitalize">{event.category}</span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Edit event modal - simplified for brevity */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Modifier l'événement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <Input
                  value={selectedEvent.name}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={selectedEvent.event_date.split('T')[0]}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, event_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <Input
                  value={selectedEvent.place}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, place: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localité</label>
                <Input
                  value={selectedEvent.location}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={selectedEvent.description}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <Input
                  value={selectedEvent.image_url}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, image_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Select
                  value={selectedEvent.category}
                  onValueChange={(value) => setSelectedEvent({ ...selectedEvent, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedEvent(null)}
              >
                Annuler
              </Button>
              <Button 
                onClick={() => handleUpdateEvent(selectedEvent)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
