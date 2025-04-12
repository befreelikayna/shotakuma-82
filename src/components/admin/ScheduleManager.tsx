import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScheduleDay, ScheduleEvent } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ScheduleManager = () => {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState(false);
  const [newDay, setNewDay] = useState({
    day_name: "",
    date: "",
    order_number: 0
  });
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null);
  const [editingDay, setEditingDay] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    category: "workshop",
    order_number: 0
  });
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      
      // Fetch days
      const { data: daysData, error: daysError } = await supabase
        .from('schedule_days')
        .select('*')
        .order('order_number');
      
      if (daysError) throw daysError;
      
      // Fetch events for each day
      const daysWithEvents = await Promise.all(daysData.map(async (day) => {
        const { data: events, error: eventsError } = await supabase
          .from('schedule_events')
          .select('*')
          .eq('day_id', day.id)
          .order('order_number');
        
        if (eventsError) throw eventsError;
        
        return {
          ...day,
          events: events || []
        };
      }));
      
      setDays(daysWithEvents as ScheduleDay[]);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le programme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDay = async () => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('schedule_days')
        .insert([
          {
            day_name: newDay.day_name,
            date: newDay.date,
            order_number: newDay.order_number
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Jour ajouté au programme"
      });
      
      setNewDay({
        day_name: "",
        date: "",
        order_number: 0
      });
      
      setAddingDay(false);
      fetchSchedule();
    } catch (error) {
      console.error('Error adding day:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDay = async () => {
    if (!selectedDay) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('schedule_days')
        .update({
          day_name: selectedDay.day_name,
          date: selectedDay.date,
          order_number: selectedDay.order_number
        })
        .eq('id', selectedDay.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Jour mis à jour"
      });
      
      setEditingDay(false);
      setSelectedDay(null);
      fetchSchedule();
    } catch (error) {
      console.error('Error updating day:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce jour et tous ses événements ?")) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // First delete all events for this day
      const { error: eventsError } = await supabase
        .from('schedule_events')
        .delete()
        .eq('day_id', dayId);
      
      if (eventsError) throw eventsError;
      
      // Then delete the day
      const { error: dayError } = await supabase
        .from('schedule_days')
        .delete()
        .eq('id', dayId);
      
      if (dayError) throw dayError;
      
      toast({
        title: "Succès",
        description: "Jour supprimé"
      });
      
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting day:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedDay) return;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .insert([
          {
            title: newEvent.title,
            description: newEvent.description,
            start_time: newEvent.start_time,
            end_time: newEvent.end_time,
            location: newEvent.location,
            category: newEvent.category,
            day_id: selectedDay.id,
            order_number: newEvent.order_number
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Événement ajouté au programme"
      });
      
      setNewEvent({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        category: "workshop",
        order_number: 0
      });
      
      setAddingEvent(false);
      fetchSchedule();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'événement",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !selectedDay) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('schedule_events')
        .update({
          title: selectedEvent.title,
          description: selectedEvent.description,
          start_time: selectedEvent.start_time,
          end_time: selectedEvent.end_time,
          location: selectedEvent.location,
          category: selectedEvent.category,
          day_id: selectedDay.id,
          order_number: selectedEvent.order_number
        })
        .eq('id', selectedEvent.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "L'événement a été mis à jour"
      });

      fetchSchedule();
    } catch (error) {
      console.error('Error updating schedule event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'événement",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setSelectedEvent(null);
      setEditingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Événement supprimé"
      });
      
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestion du Programme</h2>
        <Button onClick={() => setAddingDay(true)}>Ajouter un jour</Button>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucun jour dans le programme pour le moment.</p>
          <Button 
            variant="outline" 
            onClick={() => setAddingDay(true)}
            className="mt-4"
          >
            Ajouter un jour
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium">{day.day_name}</h3>
                  <p className="text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedDay(day);
                      setEditingDay(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteDay(day.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Événements</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDay(day);
                      setAddingEvent(true);
                    }}
                  >
                    Ajouter un événement
                  </Button>
                </div>

                {day.events && day.events.length > 0 ? (
                  <div className="space-y-2">
                    {day.events.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex justify-between items-center border rounded p-3 bg-background"
                      >
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.start_time} - {event.end_time}
                            {event.location && ` | ${event.location}`}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedEvent(event);
                              setEditingEvent(true);
                            }}
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg">
                    <p className="text-muted-foreground">Aucun événement pour ce jour.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedDay(day);
                        setAddingEvent(true);
                      }}
                      className="mt-2"
                    >
                      Ajouter un événement
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Day Dialog */}
      <Dialog open={addingDay} onOpenChange={setAddingDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un jour au programme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day-name">Nom du jour</Label>
              <Input 
                id="day-name" 
                value={newDay.day_name}
                onChange={(e) => setNewDay({...newDay, day_name: e.target.value})}
                placeholder="ex: Samedi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-date">Date</Label>
              <Input 
                id="day-date" 
                type="date"
                value={newDay.date}
                onChange={(e) => setNewDay({...newDay, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-order">Ordre d'affichage</Label>
              <Input 
                id="day-order" 
                type="number"
                value={newDay.order_number}
                onChange={(e) => setNewDay({...newDay, order_number: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingDay(false)}>Annuler</Button>
            <Button 
              onClick={handleAddDay}
              disabled={isSaving || !newDay.day_name || !newDay.date}
            >
              {isSaving ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Day Dialog */}
      <Dialog open={editingDay} onOpenChange={setEditingDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le jour</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-day-name">Nom du jour</Label>
                <Input 
                  id="edit-day-name" 
                  value={selectedDay.day_name}
                  onChange={(e) => setSelectedDay({...selectedDay, day_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-day-date">Date</Label>
                <Input 
                  id="edit-day-date" 
                  type="date"
                  value={selectedDay.date}
                  onChange={(e) => setSelectedDay({...selectedDay, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-day-order">Ordre d'affichage</Label>
                <Input 
                  id="edit-day-order" 
                  type="number"
                  value={selectedDay.order_number}
                  onChange={(e) => setSelectedDay({...selectedDay, order_number: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDay(false)}>Annuler</Button>
            <Button 
              onClick={handleUpdateDay}
              disabled={isSaving || !selectedDay?.day_name || !selectedDay?.date}
            >
              {isSaving ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={addingEvent} onOpenChange={setAddingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Titre</Label>
              <Input 
                id="event-title" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea 
                id="event-description" 
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Heure de début</Label>
                <Input 
                  id="event-start" 
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                  placeholder="ex: 14:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">Heure de fin</Label>
                <Input 
                  id="event-end" 
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                  placeholder="ex: 15:30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Lieu</Label>
              <Input 
                id="event-location" 
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-category">Catégorie</Label>
              <Select 
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({...newEvent, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Atelier</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="talk">Conférence</SelectItem>
                  <SelectItem value="exhibition">Exposition</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-order">Ordre d'affichage</Label>
              <Input 
                id="event-order" 
                type="number"
                value={newEvent.order_number}
                onChange={(e) => setNewEvent({...newEvent, order_number: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingEvent(false)}>Annuler</Button>
            <Button 
              onClick={handleAddEvent}
              disabled={isSaving || !newEvent.title || !newEvent.start_time || !newEvent.end_time}
            >
              {isSaving ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editingEvent} onOpenChange={setEditingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-title">Titre</Label>
                <Input 
                  id="edit-event-title" 
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-description">Description</Label>
                <Textarea 
                  id="edit-event-description" 
                  value={selectedEvent.description || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-start">Heure de début</Label>
                  <Input 
                    id="edit-event-start" 
                    value={selectedEvent.start_time}
                    onChange={(e) => setSelectedEvent({...selectedEvent, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-event-end">Heure de fin</Label>
                  <Input 
                    id="edit-event-end" 
                    value={selectedEvent.end_time}
                    onChange={(e) => setSelectedEvent({...selectedEvent, end_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-location">Lieu</Label>
                <Input 
                  id="edit-event-location" 
                  value={selectedEvent.location || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-category">Catégorie</Label>
                <Select 
                  value={selectedEvent.category}
                  onValueChange={(value) => setSelectedEvent({...selectedEvent, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Atelier</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="talk">Conférence</SelectItem>
                    <SelectItem value="exhibition">Exposition</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-order">Ordre d'affichage</Label>
                <Input 
                  id="edit-event-order" 
                  type="number"
                  value={selectedEvent.order_number}
                  onChange={(e) => setSelectedEvent({...selectedEvent, order_number: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(false)}>Annuler</Button>
            <Button 
              onClick={handleUpdateEvent}
              disabled={isSaving || !selectedEvent?.title || !selectedEvent?.start_time || !selectedEvent?.end_time}
            >
              {isSaving ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManager;
