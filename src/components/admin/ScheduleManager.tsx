
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash, Save, CalendarIcon, UploadCloud, FileText, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Schema for day validation
const daySchema = z.object({
  day_name: z.string().min(1, { message: "Le nom du jour est requis" }),
  date: z.date({ required_error: "La date est requise" }),
});

// Schema for event validation
const eventSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().optional(),
  start_time: z.string().min(1, { message: "L'heure de début est requise" }),
  end_time: z.string().min(1, { message: "L'heure de fin est requise" }),
  location: z.string().optional(),
  category: z.string().min(1, { message: "La catégorie est requise" }),
});

const ScheduleManager = () => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUploading, setPdfUploading] = useState<Record<string, boolean>>({});
  const [addingDay, setAddingDay] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [addingEventToDay, setAddingEventToDay] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<{
    dayId: string;
    eventId: string;
  } | null>(null);

  const dayForm = useForm<z.infer<typeof daySchema>>({
    resolver: zodResolver(daySchema),
    defaultValues: {
      day_name: "",
    },
  });

  const eventForm = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      category: "panel",
    },
  });

  const fetchDays = async () => {
    try {
      setLoading(true);
      const { data: daysData, error: daysError } = await supabase
        .from("schedule_days")
        .select("*")
        .order("order_number");

      if (daysError) throw daysError;

      // For each day, get events
      const daysWithEvents = await Promise.all(
        daysData.map(async (day) => {
          const { data: eventsData, error: eventsError } = await supabase
            .from("schedule_events")
            .select("*")
            .eq("day_id", day.id)
            .order("order_number");

          if (eventsError) throw eventsError;

          return {
            ...day,
            events: eventsData || [],
          };
        })
      );

      setDays(daysWithEvents);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du programme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDays();
  }, []);

  const handleCreateDay = async (values: z.infer<typeof daySchema>) => {
    try {
      // Find max order number
      const maxOrder = days.length > 0
        ? Math.max(...days.map(day => day.order_number))
        : -1;
      
      const { data, error } = await supabase.from("schedule_days").insert({
        day_name: values.day_name,
        date: format(values.date, "yyyy-MM-dd"),
        order_number: maxOrder + 1,
      }).select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Jour ajouté au programme",
      });

      setAddingDay(false);
      dayForm.reset();
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error creating day:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le jour",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDay = async (dayId: string, values: z.infer<typeof daySchema>) => {
    try {
      const { error } = await supabase
        .from("schedule_days")
        .update({
          day_name: values.day_name,
          date: format(values.date, "yyyy-MM-dd"),
        })
        .eq("id", dayId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Jour mis à jour",
      });

      setEditingDay(null);
      dayForm.reset();
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error updating day:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le jour",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce jour et tous ses événements ?")) {
      return;
    }

    try {
      // Delete all events first
      const { error: eventsError } = await supabase
        .from("schedule_events")
        .delete()
        .eq("day_id", dayId);

      if (eventsError) throw eventsError;

      // Then delete the day
      const { error: dayError } = await supabase
        .from("schedule_days")
        .delete()
        .eq("id", dayId);

      if (dayError) throw dayError;

      toast({
        title: "Succès",
        description: "Jour supprimé du programme",
      });
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error deleting day:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le jour",
        variant: "destructive",
      });
    }
  };

  const handleDayDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const reorderedDays = Array.from(days);
    const [removed] = reorderedDays.splice(result.source.index, 1);
    reorderedDays.splice(result.destination.index, 0, removed);
    
    // Update UI immediately
    setDays(reorderedDays);
    
    // Update order_number in database
    try {
      const updates = reorderedDays.map((day, index) => ({
        id: day.id,
        order_number: index
      }));
      
      for (const update of updates) {
        await supabase
          .from("schedule_days")
          .update({ order_number: update.order_number })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error updating day order:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre des jours",
        variant: "destructive",
      });
      // Refresh to get original order
      fetchDays();
    }
  };

  const handleCreateEvent = async (dayId: string, values: z.infer<typeof eventSchema>) => {
    try {
      // Find max order number for this day's events
      const dayEvents = days.find(d => d.id === dayId)?.events || [];
      const maxOrder = dayEvents.length > 0
        ? Math.max(...dayEvents.map((event: any) => event.order_number))
        : -1;
      
      const { data, error } = await supabase.from("schedule_events").insert({
        day_id: dayId,
        title: values.title,
        description: values.description || null,
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location || null,
        category: values.category,
        order_number: maxOrder + 1,
      }).select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement ajouté au programme",
      });

      setAddingEventToDay(null);
      eventForm.reset();
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (dayId: string, eventId: string, values: z.infer<typeof eventSchema>) => {
    try {
      const { error } = await supabase
        .from("schedule_events")
        .update({
          title: values.title,
          description: values.description || null,
          start_time: values.start_time,
          end_time: values.end_time,
          location: values.location || null,
          category: values.category,
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement mis à jour",
      });

      setEditingEvent(null);
      eventForm.reset();
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'événement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement supprimé du programme",
      });
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
  };

  const handleEventDragEnd = async (dayId: string, result: any) => {
    if (!result.destination) return;
    
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    
    const reorderedEvents = Array.from(day.events);
    const [removed] = reorderedEvents.splice(result.source.index, 1);
    reorderedEvents.splice(result.destination.index, 0, removed);
    
    // Update UI immediately
    setDays(days.map(d => 
      d.id === dayId ? { ...d, events: reorderedEvents } : d
    ));
    
    // Update order_number in database
    try {
      const updates = reorderedEvents.map((event: any, index: number) => ({
        id: event.id,
        order_number: index
      }));
      
      for (const update of updates) {
        await supabase
          .from("schedule_events")
          .update({ order_number: update.order_number })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error updating event order:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre des événements",
        variant: "destructive",
      });
      // Refresh to get original order
      fetchDays();
    }
  };

  // Handle PDF upload for a day
  const handlePdfUpload = async (dayId: string, file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers PDF sont autorisés",
        variant: "destructive",
      });
      return;
    }

    try {
      setPdfUploading({...pdfUploading, [dayId]: true});
      
      const day = days.find(d => d.id === dayId);
      if (!day) {
        throw new Error("Jour non trouvé");
      }

      // Create file name based on day name
      const sanitizedDayName = day.day_name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filePath = `schedule_pdfs/${dayId}/${sanitizedDayName}-${Date.now()}.pdf`;
      
      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('festival_assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('festival_assets')
        .getPublicUrl(data?.path || filePath);
      
      // Update day with PDF URL
      const { error: updateError } = await supabase
        .from('schedule_days')
        .update({ pdf_url: urlData.publicUrl })
        .eq('id', dayId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Succès",
        description: `PDF pour ${day.day_name} téléchargé avec succès`,
      });
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive",
      });
    } finally {
      setPdfUploading({...pdfUploading, [dayId]: false});
    }
  };

  const handleRemovePdf = async (dayId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce PDF ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('schedule_days')
        .update({ pdf_url: null })
        .eq('id', dayId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Succès",
        description: "PDF supprimé avec succès",
      });
      
      // Refresh days
      fetchDays();
    } catch (error) {
      console.error("Error removing PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le PDF",
        variant: "destructive",
      });
    }
  };

  // When editing a day, load its data into the form
  useEffect(() => {
    if (editingDay) {
      const day = days.find(d => d.id === editingDay);
      if (day) {
        dayForm.setValue('day_name', day.day_name);
        try {
          dayForm.setValue('date', new Date(day.date));
        } catch (e) {
          console.error("Invalid date:", e);
        }
      }
    }
  }, [editingDay, days, dayForm]);

  // When editing an event, load its data into the form
  useEffect(() => {
    if (editingEvent) {
      const day = days.find(d => d.id === editingEvent.dayId);
      const event = day?.events.find((e: any) => e.id === editingEvent.eventId);
      
      if (event) {
        eventForm.setValue('title', event.title);
        eventForm.setValue('description', event.description || "");
        eventForm.setValue('start_time', event.start_time);
        eventForm.setValue('end_time', event.end_time);
        eventForm.setValue('location', event.location || "");
        eventForm.setValue('category', event.category);
      }
    }
  }, [editingEvent, days, eventForm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Chargement du programme...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-festival-primary">Programme</h2>
        <Button onClick={() => {
          dayForm.reset();
          setAddingDay(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un jour
        </Button>
      </div>

      <Tabs defaultValue="days">
        <TabsList>
          <TabsTrigger value="days">Jours</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="days" className="space-y-4 pt-4">
          {days.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Aucun jour n'a été créé pour le programme.</p>
                <Button className="mt-4" onClick={() => {
                  dayForm.reset();
                  setAddingDay(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un jour
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDayDragEnd}>
              <Droppable droppableId="days">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {days.map((day, index) => (
                      <Draggable key={day.id} draggableId={day.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border-l-4 border-l-festival-primary"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle>{day.day_name}</CardTitle>
                                  <CardDescription>
                                    {format(new Date(day.date), "dd MMMM yyyy", {
                                      locale: fr,
                                    })}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingDay(day.id)}
                                  >
                                    Modifier
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteDay(day.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* PDF Upload Section */}
                                <div className="border rounded-lg p-4 bg-slate-50">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Programme PDF
                                  </h4>
                                  
                                  {day.pdf_url ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <a 
                                          href={day.pdf_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-sm flex items-center"
                                        >
                                          <FileText className="w-4 h-4 mr-1" /> 
                                          Voir le PDF
                                        </a>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemovePdf(day.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="file"
                                        accept=".pdf"
                                        id={`pdf-upload-${day.id}`}
                                        className="text-sm"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handlePdfUpload(day.id, e.target.files[0]);
                                          }
                                        }}
                                        disabled={pdfUploading[day.id]}
                                      />
                                      {pdfUploading[day.id] && (
                                        <div className="animate-spin h-4 w-4 border border-festival-primary border-t-transparent rounded-full"></div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    eventForm.reset();
                                    setAddingEventToDay(day.id);
                                  }}
                                  variant="outline"
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Ajouter un événement à cette journée
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6 pt-4">
          {days.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Vous devez d'abord créer au moins un jour.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {days.map((day) => (
                <Accordion key={day.id} type="single" collapsible className="border rounded-lg">
                  <AccordionItem value={day.id}>
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{day.day_name} - {format(new Date(day.date), "dd MMMM yyyy", { locale: fr })}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({day.events?.length || 0} événements)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 space-y-4">
                        {day.events?.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">
                              Aucun événement programmé pour cette journée.
                            </p>
                            <Button
                              className="mt-4"
                              size="sm"
                              onClick={() => {
                                eventForm.reset();
                                setAddingEventToDay(day.id);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Ajouter un événement
                            </Button>
                          </div>
                        ) : (
                          <DragDropContext onDragEnd={(result) => handleEventDragEnd(day.id, result)}>
                            <Droppable droppableId={`events-${day.id}`}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2"
                                >
                                  {day.events.map((event: any, index: number) => (
                                    <Draggable
                                      key={event.id}
                                      draggableId={event.id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="border rounded-md p-3 bg-white"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h4 className="font-medium">{event.title}</h4>
                                              <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-1" />
                                                <span>{event.start_time} - {event.end_time}</span>
                                                {event.location && (
                                                  <>
                                                    <span className="mx-1">•</span>
                                                    <span>{event.location}</span>
                                                  </>
                                                )}
                                              </div>
                                              {event.description && (
                                                <p className="text-sm mt-2 text-muted-foreground">
                                                  {event.description}
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingEvent({
                                                  dayId: day.id,
                                                  eventId: event.id,
                                                })}
                                              >
                                                Modifier
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="text-destructive hover:text-destructive"
                                              >
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        )}
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              eventForm.reset();
                              setAddingEventToDay(day.id);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un événement
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Day Form Dialog */}
      {addingDay && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter un jour</h3>
            <Form {...dayForm}>
              <form onSubmit={dayForm.handleSubmit(handleCreateDay)} className="space-y-4">
                <FormField
                  control={dayForm.control}
                  name="day_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du jour</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Jour 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={dayForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span className="text-muted-foreground">
                                  Choisir une date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddingDay(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Edit Day Dialog */}
      {editingDay && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier le jour</h3>
            <Form {...dayForm}>
              <form onSubmit={dayForm.handleSubmit((values) => handleUpdateDay(editingDay, values))} className="space-y-4">
                <FormField
                  control={dayForm.control}
                  name="day_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du jour</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Jour 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={dayForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span className="text-muted-foreground">
                                  Choisir une date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingDay(null)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Add Event Dialog */}
      {addingEventToDay && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Ajouter un événement - {days.find(d => d.id === addingEventToDay)?.day_name}
            </h3>
            <Form {...eventForm}>
              <form onSubmit={eventForm.handleSubmit((values) => handleCreateEvent(addingEventToDay, values))} className="space-y-4">
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'événement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de début</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 10:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de fin</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 11:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Salle A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="panel">Panel</SelectItem>
                          <SelectItem value="workshop">Atelier</SelectItem>
                          <SelectItem value="competition">Compétition</SelectItem>
                          <SelectItem value="screening">Projection</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="talk">Conférence</SelectItem>
                          <SelectItem value="exhibition">Exposition</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée de l'événement"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddingEventToDay(null)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}

      {/* Edit Event Dialog */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Modifier l'événement - {days.find(d => d.id === editingEvent.dayId)?.day_name}
            </h3>
            <Form {...eventForm}>
              <form onSubmit={eventForm.handleSubmit((values) => handleUpdateEvent(editingEvent.dayId, editingEvent.eventId, values))} className="space-y-4">
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'événement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de début</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 10:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de fin</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 11:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Salle A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="panel">Panel</SelectItem>
                          <SelectItem value="workshop">Atelier</SelectItem>
                          <SelectItem value="competition">Compétition</SelectItem>
                          <SelectItem value="screening">Projection</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="talk">Conférence</SelectItem>
                          <SelectItem value="exhibition">Exposition</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée de l'événement"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingEvent(null)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
