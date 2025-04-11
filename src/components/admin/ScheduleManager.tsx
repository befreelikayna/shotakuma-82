
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, Pencil, Trash2, Calendar, Plus, MoveUp, MoveDown, Link, FileUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase, uploadFileToSupabase } from "@/integrations/supabase/client";

type ScheduleEvent = {
  id: string;
  day_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  category: string;
  order_number: number;
  file_url?: string | null;
  link_url?: string | null;
  link_text?: string | null;
};

type ScheduleDay = {
  id: string;
  date: string;
  day_name: string;
  order_number: number;
};

const eventCategories = [
  { value: "panel", label: "Panel" },
  { value: "workshop", label: "Atelier" },
  { value: "competition", label: "Compétition" },
  { value: "screening", label: "Projection" },
  { value: "performance", label: "Performance" },
];

const ScheduleManager = () => {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  
  // Day form state
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [dayName, setDayName] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [dayOrderNumber, setDayOrderNumber] = useState(0);
  
  // Event form state
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("panel");
  const [eventOrderNumber, setEventOrderNumber] = useState(0);
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [eventFileUrl, setEventFileUrl] = useState<string | null>(null);
  const [eventLinkUrl, setEventLinkUrl] = useState("");
  const [eventLinkText, setEventLinkText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"day" | "event">("day");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchDays = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedule_days')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setDays(data || []);
      
      if (data && data.length > 0 && !activeDay) {
        setActiveDay(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching schedule days:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les jours du programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async (dayId: string | null) => {
    if (!dayId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('day_id', dayId)
        .order('order_number', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching schedule events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements du programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDays();
    
    const channel = supabase
      .channel('schedule-admin-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schedule_days' 
      }, () => {
        console.log('Schedule days changed, refreshing...');
        fetchDays();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schedule_events' 
      }, () => {
        console.log('Schedule events changed, refreshing...');
        if (activeDay) {
          fetchEvents(activeDay);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeDay) {
      fetchEvents(activeDay);
    }
  }, [activeDay]);

  const handleRefresh = () => {
    fetchDays();
    if (activeDay) {
      fetchEvents(activeDay);
    }
    toast({
      title: "Actualisé",
      description: "Les données ont été actualisées"
    });
  };

  const openDayDialog = (day?: ScheduleDay) => {
    if (day) {
      setEditingDayId(day.id);
      setDayName(day.day_name);
      setDayDate(day.date);
      setDayOrderNumber(day.order_number);
    } else {
      setEditingDayId(null);
      setDayName("");
      setDayDate("");
      setDayOrderNumber(days.length);
    }
    
    setIsDayDialogOpen(true);
  };

  const openEventDialog = (event?: ScheduleEvent) => {
    if (event) {
      setEditingEventId(event.id);
      setEventTitle(event.title);
      setEventDescription(event.description || "");
      setEventStartTime(event.start_time);
      setEventEndTime(event.end_time);
      setEventLocation(event.location || "");
      setEventCategory(event.category);
      setEventOrderNumber(event.order_number);
      setEventFileUrl(event.file_url || null);
      setEventLinkUrl(event.link_url || "");
      setEventLinkText(event.link_text || "");
      setEventFile(null);
    } else {
      setEditingEventId(null);
      setEventTitle("");
      setEventDescription("");
      setEventStartTime("");
      setEventEndTime("");
      setEventLocation("");
      setEventCategory("panel");
      setEventOrderNumber(events.length);
      setEventFileUrl(null);
      setEventFile(null);
      setEventLinkUrl("");
      setEventLinkText("");
    }
    
    setIsEventDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEventFile(e.target.files[0]);
    }
  };

  const saveDay = async () => {
    try {
      if (!dayName || !dayDate) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        });
        return;
      }
      
      const dayData = {
        day_name: dayName,
        date: dayDate,
        order_number: dayOrderNumber
      };
      
      let result;
      
      if (editingDayId) {
        result = await supabase
          .from('schedule_days')
          .update(dayData)
          .eq('id', editingDayId);
      } else {
        result = await supabase
          .from('schedule_days')
          .insert(dayData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Succès",
        description: editingDayId 
          ? "Le jour a été mis à jour avec succès" 
          : "Le jour a été ajouté avec succès",
      });
      
      setIsDayDialogOpen(false);
      fetchDays();
    } catch (error) {
      console.error('Error saving day:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  const saveEvent = async () => {
    try {
      if (!eventTitle || !eventStartTime || !eventEndTime || !eventCategory || !activeDay) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      
      // Upload file if selected
      let fileUrl = eventFileUrl;
      if (eventFile) {
        fileUrl = await uploadFileToSupabase(eventFile, 'schedule_files');
        if (!fileUrl) {
          toast({
            title: "Erreur",
            description: "Échec du téléchargement du fichier",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }
      
      const eventData = {
        day_id: activeDay,
        title: eventTitle,
        description: eventDescription || null,
        start_time: eventStartTime,
        end_time: eventEndTime,
        location: eventLocation || null,
        category: eventCategory,
        order_number: eventOrderNumber,
        file_url: fileUrl,
        link_url: eventLinkUrl || null,
        link_text: eventLinkText || null
      };
      
      let result;
      
      if (editingEventId) {
        result = await supabase
          .from('schedule_events')
          .update(eventData)
          .eq('id', editingEventId);
      } else {
        result = await supabase
          .from('schedule_events')
          .insert(eventData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Succès",
        description: editingEventId 
          ? "L'événement a été mis à jour avec succès" 
          : "L'événement a été ajouté avec succès",
      });
      
      setIsEventDialogOpen(false);
      fetchEvents(activeDay);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteDialog = (type: "day" | "event", id: string) => {
    setDeleteType(type);
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!itemToDelete) return;
      
      let result;
      
      if (deleteType === "day") {
        result = await supabase
          .from('schedule_days')
          .delete()
          .eq('id', itemToDelete);
        
        if (itemToDelete === activeDay) {
          setActiveDay(days.find(d => d.id !== itemToDelete)?.id || null);
        }
      } else {
        result = await supabase
          .from('schedule_events')
          .delete()
          .eq('id', itemToDelete);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Succès",
        description: deleteType === "day" 
          ? "Le jour a été supprimé avec succès" 
          : "L'événement a été supprimé avec succès",
      });
      
      if (deleteType === "day") {
        fetchDays();
      } else {
        fetchEvents(activeDay);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const moveItem = async (type: "day" | "event", id: string, direction: "up" | "down") => {
    try {
      const items = type === "day" ? days : events;
      const index = items.findIndex(item => item.id === id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= items.length) return;
      
      const item = items[index];
      const swapItem = items[newIndex];
      
      const table = type === "day" ? 'schedule_days' : 'schedule_events';
      
      // Update the current item's order
      await supabase
        .from(table)
        .update({ order_number: swapItem.order_number })
        .eq('id', item.id);
      
      // Update the swapped item's order
      await supabase
        .from(table)
        .update({ order_number: item.order_number })
        .eq('id', swapItem.id);
      
      if (type === "day") {
        fetchDays();
      } else {
        fetchEvents(activeDay);
      }
    } catch (error) {
      console.error('Error moving item:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du déplacement",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion du Programme</h2>
      
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={() => openDayDialog()} 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Ajouter un jour
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>
      </div>
      
      {isLoading && days.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-festival-primary"></div>
          <span className="ml-3 text-festival-secondary">Chargement...</span>
        </div>
      ) : days.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-soft">
          <p className="text-festival-secondary">Aucun jour programmé. Cliquez sur "Ajouter un jour" pour commencer.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-white rounded-xl shadow-soft p-4">
            <h3 className="font-medium mb-3">Jours du festival</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day) => (
                  <TableRow 
                    key={day.id} 
                    className={activeDay === day.id ? "bg-slate-100" : ""}
                    onClick={() => setActiveDay(day.id)}
                  >
                    <TableCell className="font-medium">{day.day_name}</TableCell>
                    <TableCell>{formatDate(day.date)}</TableCell>
                    <TableCell>{day.order_number}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); moveItem("day", day.id, "up"); }}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); moveItem("day", day.id, "down"); }}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); openDayDialog(day); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); openDeleteDialog("day", day.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {activeDay && (
            <div className="bg-white rounded-xl shadow-soft p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  Événements - {days.find(d => d.id === activeDay)?.day_name}
                </h3>
                <Button 
                  size="sm"
                  onClick={() => openEventDialog()}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Ajouter un événement
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-festival-primary"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center p-6">
                  <p className="text-festival-secondary">Aucun événement pour ce jour.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Horaire</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Fichier/Lien</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          {eventCategories.find(c => c.value === event.category)?.label || event.category}
                        </TableCell>
                        <TableCell>
                          {event.start_time} - {event.end_time}
                        </TableCell>
                        <TableCell>{event.location || "-"}</TableCell>
                        <TableCell>
                          {event.file_url && (
                            <a href={event.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline mr-2">
                              <FileUp className="h-4 w-4 mr-1" /> Fichier
                            </a>
                          )}
                          {event.link_url && (
                            <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                              <Link className="h-4 w-4 mr-1" /> {event.link_text || 'Lien'}
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem("event", event.id, "up")}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem("event", event.id, "down")}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => openEventDialog(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteDialog("event", event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Day Dialog */}
      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDayId ? 'Modifier le jour' : 'Ajouter un jour'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="day_name" className="text-sm font-medium">Nom du jour</label>
              <Input
                id="day_name"
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder="ex: Jour 1"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="day_date" className="text-sm font-medium">Date</label>
              <Input
                id="day_date"
                type="date"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="order_number" className="text-sm font-medium">Ordre d'affichage</label>
              <Input
                id="order_number"
                type="number"
                min="0"
                value={dayOrderNumber}
                onChange={(e) => setDayOrderNumber(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={saveDay}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEventId ? 'Modifier l\'événement' : 'Ajouter un événement'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="event_title" className="text-sm font-medium">Titre</label>
              <Input
                id="event_title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Titre de l'événement"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="event_description" className="text-sm font-medium">Description</label>
              <Textarea
                id="event_description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Description de l'événement"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="event_start_time" className="text-sm font-medium">Heure de début</label>
                <Input
                  id="event_start_time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  placeholder="ex: 10:00"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="event_end_time" className="text-sm font-medium">Heure de fin</label>
                <Input
                  id="event_end_time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  placeholder="ex: 11:30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="event_location" className="text-sm font-medium">Lieu</label>
              <Input
                id="event_location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="ex: Scène principale"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="event_category" className="text-sm font-medium">Catégorie</label>
              <Select value={eventCategory} onValueChange={setEventCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="event_order" className="text-sm font-medium">Ordre d'affichage</label>
              <Input
                id="event_order"
                type="number"
                min="0"
                value={eventOrderNumber}
                onChange={(e) => setEventOrderNumber(parseInt(e.target.value) || 0)}
              />
            </div>
            
            {/* File Upload */}
            <div className="space-y-2 border p-4 rounded-md">
              <label className="text-sm font-medium">Fichier associé</label>
              
              {eventFileUrl && (
                <div className="flex items-center justify-between py-2">
                  <a 
                    href={eventFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Fichier téléchargé
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventFileUrl(null)}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              
              {!eventFileUrl && (
                <div className="flex flex-col gap-2">
                  <Input
                    id="event_file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500">
                    Formats supportés: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images (max: 5MB)
                  </p>
                </div>
              )}
            </div>
            
            {/* External Link */}
            <div className="space-y-2 border p-4 rounded-md">
              <label className="text-sm font-medium">Lien externe</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="link_url" className="text-xs">URL</label>
                  <Input
                    id="link_url"
                    value={eventLinkUrl}
                    onChange={(e) => setEventLinkUrl(e.target.value)}
                    placeholder="https://exemple.com"
                    type="url"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="link_text" className="text-xs">Texte du lien</label>
                  <Input
                    id="link_text"
                    value={eventLinkText}
                    onChange={(e) => setEventLinkText(e.target.value)}
                    placeholder="Plus d'informations"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Laisser vide si aucun lien n'est nécessaire
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={saveEvent} disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Téléchargement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "day" 
                ? "Cette action supprimera définitivement ce jour et tous les événements associés." 
                : "Cette action supprimera définitivement cet événement."}
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScheduleManager;
