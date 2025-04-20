import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import { Pencil, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle, Check, X, File, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ScheduleDay = {
  id: string;
  date: string;
  day_name: string;
  order_number: number;
  pdf_url?: string | null;
  created_at: string;
  updated_at: string;
};

type ScheduleEvent = {
  id: string;
  day_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  category: string;
  order_number: number;
  created_at: string;
  updated_at: string;
};

const ScheduleManager = () => {
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayDialog, setDayDialog] = useState(false);
  const [eventDialog, setEventDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isCreatingDay, setIsCreatingDay] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [dayDate, setDayDate] = useState('');
  const [dayName, setDayName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const fetchScheduleDays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedule_days')
        .select('*')
        .order('order_number');

      if (error) throw error;
      setScheduleDays(data || []);
    } catch (error) {
      console.error('Error fetching schedule days:', error);
      toast.error('Failed to load schedule days');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .order('order_number');

      if (error) throw error;
      setScheduleEvents(data || []);
    } catch (error) {
      console.error('Error fetching schedule events:', error);
      toast.error('Failed to load schedule events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleDays();
    fetchScheduleEvents();
  }, []);

  const handleOpenDayDialog = (day: ScheduleDay | null = null) => {
    if (day) {
      setSelectedDay(day);
      setDayDate(day.date);
      setDayName(day.day_name);
      setIsCreatingDay(false);
    } else {
      setSelectedDay(null);
      setDayDate('');
      setDayName('');
      setIsCreatingDay(true);
    }
    setDayDialog(true);
  };

  const handleCloseDayDialog = () => {
    setDayDialog(false);
    setSelectedDay(null);
  };

  const handleOpenEventDialog = (event: ScheduleEvent | null = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventTitle(event.title);
      setEventDescription(event.description || '');
      setEventStartTime(event.start_time);
      setEventEndTime(event.end_time);
      setEventLocation(event.location || '');
      setEventCategory(event.category);
      setIsCreatingEvent(false);
    } else {
      setSelectedEvent(null);
      setEventTitle('');
      setEventDescription('');
      setEventStartTime('');
      setEventEndTime('');
      setEventLocation('');
      setEventCategory('');
      setIsCreatingEvent(true);
    }
    setEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setEventDialog(false);
    setSelectedEvent(null);
  };

  const handleSaveDay = async () => {
    if (!dayDate.trim() || !dayName.trim()) {
      toast.error('Date and Day Name are required');
      return;
    }

    setLoading(true);
    try {
      if (isCreatingDay) {
        const newOrderNumber = scheduleDays.length > 0
          ? Math.max(...scheduleDays.map(day => day.order_number)) + 1
          : 1;

        const { error } = await supabase
          .from('schedule_days')
          .insert({
            date: dayDate,
            day_name: dayName,
            order_number: newOrderNumber,
          });

        if (error) throw error;
        toast.success('Day added successfully');
      } else if (selectedDay) {
        const { error } = await supabase
          .from('schedule_days')
          .update({ date: dayDate, day_name: dayName })
          .eq('id', selectedDay.id);

        if (error) throw error;
        toast.success('Day updated successfully');
      }

      handleCloseDayDialog();
      fetchScheduleDays();
    } catch (error) {
      console.error('Error saving schedule day:', error);
      toast.error('Failed to save schedule day');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim() || !eventStartTime.trim() || !eventEndTime.trim() || !eventCategory.trim()) {
      toast.error('Title, Start Time, End Time, and Category are required');
      return;
    }

    if (!selectedDay) {
      toast.error('A day must be selected for the event');
      return;
    }

    setLoading(true);
    try {
      if (isCreatingEvent) {
        const newOrderNumber = scheduleEvents.length > 0
          ? Math.max(...scheduleEvents.map(event => event.order_number)) + 1
          : 1;

        const { error } = await supabase
          .from('schedule_events')
          .insert({
            day_id: selectedDay.id,
            title: eventTitle,
            description: eventDescription,
            start_time: eventStartTime,
            end_time: eventEndTime,
            location: eventLocation,
            category: eventCategory,
            order_number: newOrderNumber,
          });

        if (error) throw error;
        toast.success('Event added successfully');
      } else if (selectedEvent) {
        const { error } = await supabase
          .from('schedule_events')
          .update({
            title: eventTitle,
            description: eventDescription,
            start_time: eventStartTime,
            end_time: eventEndTime,
            location: eventLocation,
            category: eventCategory,
          })
          .eq('id', selectedEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      }

      handleCloseEventDialog();
      fetchScheduleEvents();
    } catch (error) {
      console.error('Error saving schedule event:', error);
      toast.error('Failed to save schedule event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDay = async (id: string) => {
    if (!confirm('Are you sure you want to delete this day?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('schedule_days')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Day deleted successfully');
      fetchScheduleDays();
    } catch (error) {
      console.error('Error deleting schedule day:', error);
      toast.error('Failed to delete schedule day');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchScheduleEvents();
    } catch (error) {
      console.error('Error deleting schedule event:', error);
      toast.error('Failed to delete schedule event');
    } finally {
      setLoading(false);
    }
  };

  const handleReorderDay = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = scheduleDays.findIndex(day => day.id === id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === scheduleDays.length - 1) return;

    const newScheduleDays = [...scheduleDays];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    const tempOrderNumber = newScheduleDays[currentIndex].order_number;
    newScheduleDays[currentIndex].order_number = newScheduleDays[swapIndex].order_number;
    newScheduleDays[swapIndex].order_number = tempOrderNumber;

    [newScheduleDays[currentIndex], newScheduleDays[swapIndex]] = [newScheduleDays[swapIndex], newScheduleDays[currentIndex]];

    setLoading(true);
    try {
      const updates = [
        {
          id: newScheduleDays[currentIndex].id,
          order_number: newScheduleDays[currentIndex].order_number
        },
        {
          id: newScheduleDays[swapIndex].id,
          order_number: newScheduleDays[swapIndex].order_number
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("schedule_days")
          .update({ order_number: update.order_number })
          .eq('id', update.id);

        if (error) throw error;
      }

      setScheduleDays(newScheduleDays);
      toast.success("Schedule days order updated");
    } catch (error) {
      console.error("Error reordering schedule days:", error);
      toast.error("Failed to reorder schedule days");
      fetchScheduleDays();
    } finally {
      setLoading(false);
    }
  };

  const handleReorderEvent = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = scheduleEvents.findIndex(event => event.id === id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === scheduleEvents.length - 1) return;

    const newScheduleEvents = [...scheduleEvents];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    const tempOrderNumber = newScheduleEvents[currentIndex].order_number;
    newScheduleEvents[currentIndex].order_number = newScheduleEvents[swapIndex].order_number;
    newScheduleEvents[swapIndex].order_number = tempOrderNumber;

    [newScheduleEvents[currentIndex], newScheduleEvents[swapIndex]] = [newScheduleEvents[swapIndex], newScheduleEvents[currentIndex]];

    setLoading(true);
    try {
      const updates = [
        {
          id: newScheduleEvents[currentIndex].id,
          order_number: newScheduleEvents[currentIndex].order_number
        },
        {
          id: newScheduleEvents[swapIndex].id,
          order_number: newScheduleEvents[swapIndex].order_number
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("schedule_events")
          .update({ order_number: update.order_number })
          .eq('id', update.id);

        if (error) throw error;
      }

      setScheduleEvents(newScheduleEvents);
      toast.success("Schedule events order updated");
    } catch (error) {
      console.error("Error reordering schedule events:", error);
      toast.error("Failed to reorder schedule events");
      fetchScheduleEvents();
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>, dayId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      createBucketAndUpload(file, dayId);
    }
  };

  const createBucketAndUpload = async (file: File, dayId: string) => {
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('festival_assets');
        
      if (bucketError && bucketError.message.includes('404')) {
        const { error: createBucketError } = await supabase.storage
          .createBucket('festival_assets', { public: true });
          
        if (createBucketError) throw createBucketError;
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `schedule_day_${dayId}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('festival_assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('festival_assets')
        .getPublicUrl(uploadData.path);
      
      const { error: updateError } = await supabase
        .from('schedule_days')
        .update({ pdf_url: urlData.publicUrl } as Partial<ScheduleDay>)
        .eq('id', dayId);
      
      if (updateError) {
        console.error('Error updating schedule day:', updateError);
        toast.error('Impossible de mettre à jour le PDF');
        return;
      }

      toast.success('PDF téléchargé avec succès');
      fetchScheduleDays();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const removePdfFile = async (dayId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_days')
        .update({ pdf_url: null } as Partial<ScheduleDay>)
        .eq('id', dayId);
      
      if (error) {
        console.error('Error removing PDF:', error);
        toast.error('Impossible de supprimer le PDF');
        return;
      }
      
      toast.success('PDF supprimé avec succès');
      fetchScheduleDays();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Gestion du Programme</CardTitle>
            <CardDescription>
              Gérez les jours et les événements du programme
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDayDialog()} className="bg-festival-accent hover:bg-festival-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un jour
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Chargement des jours du programme...</p>
          </div>
        ) : scheduleDays.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Aucun jour de programme n'a été ajouté</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom du jour</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleDays.map((day) => (
                <TableRow key={day.id}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell>{day.day_name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderDay(day.id, 'up')}
                        disabled={loading}
                        title="Move Up"
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderDay(day.id, 'down')}
                        disabled={loading}
                        title="Move Down"
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {day.pdf_url ? (
                        <>
                          <a href={day.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                            <File className="h-4 w-4" />
                            Voir le PDF
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePdfFile(day.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            title="Remove PDF"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`pdf-upload-${day.id}`} className="cursor-pointer">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <Upload className="h-4 w-4" />
                              <span>Télécharger PDF</span>
                            </div>
                          </Label>
                          <Input
                            type="file"
                            id={`pdf-upload-${day.id}`}
                            className="hidden"
                            onChange={(e) => handlePdfUpload(e, day.id)}
                            disabled={loading}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleOpenDayDialog(day);
                        }}
                        disabled={loading}
                        title="Edit Day"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDay(day.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        title="Delete Day"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDay(day);
                          handleOpenEventDialog();
                        }}
                        disabled={loading}
                        title="Add Event"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={dayDialog} onOpenChange={setDayDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreatingDay ? 'Ajouter un nouveau jour' : 'Modifier le jour'}</DialogTitle>
              <DialogDescription>
                {isCreatingDay
                  ? 'Ajoutez un nouveau jour au programme'
                  : 'Modifiez les détails du jour existant'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day_name">Nom du jour</Label>
                <Input
                  id="day_name"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  placeholder="Jour 1, Samedi, etc."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDayDialog} disabled={loading}>
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button onClick={handleSaveDay} disabled={loading}>
                <Check className="mr-2 h-4 w-4" /> {isCreatingDay ? 'Ajouter' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={eventDialog} onOpenChange={setEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreatingEvent ? 'Ajouter un nouvel événement' : 'Modifier l\'événement'}</DialogTitle>
              <DialogDescription>
                {isCreatingEvent
                  ? 'Ajoutez un nouvel événement au programme'
                  : 'Modifiez les détails de l\'événement existant'}
              </DialogDescription>
            </DialogHeader>

            {!selectedDay && (
              <div className="text-red-500">Veuillez sélectionner un jour pour l'événement.</div>
            )}

            {selectedDay && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="event_title">Titre de l'événement</Label>
                  <Input
                    id="event_title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Nom de l'événement"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_description">Description de l'événement</Label>
                  <Input
                    id="event_description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Description de l'événement"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_start_time">Heure de début</Label>
                  <Input
                    type="time"
                    id="event_start_time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_end_time">Heure de fin</Label>
                  <Input
                    type="time"
                    id="event_end_time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_location">Lieu</Label>
                  <Input
                    id="event_location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Lieu de l'événement"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_category">Catégorie</Label>
                  <Input
                    id="event_category"
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    placeholder="Catégorie de l'événement"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseEventDialog} disabled={loading}>
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button onClick={handleSaveEvent} disabled={loading} >
                <Check className="mr-2 h-4 w-4" /> {isCreatingEvent ? 'Ajouter' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ScheduleManager;
