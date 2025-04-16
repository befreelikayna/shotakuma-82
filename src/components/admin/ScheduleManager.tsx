import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash, Save, CalendarIcon, UploadCloud, FileText, X, Clock, Image, Link } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const daySchema = z.object({
  day_name: z.string().min(1, { message: "Le nom du jour est requis" }),
  date: z.date({ required_error: "La date est requise" }),
});

const eventSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().optional(),
  start_time: z.string().min(1, { message: "L'heure de début est requise" }),
  end_time: z.string().min(1, { message: "L'heure de fin est requise" }),
  location: z.string().optional(),
  category: z.string().min(1, { message: "La catégorie est requise" }),
});

const urlSchema = z.object({
  url: z.string().url({ message: "Veuillez entrer une URL valide" }).min(1, { message: "L'URL est requise" }),
});

const ScheduleManager = () => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileUploading, setFileUploading] = useState<Record<string, boolean>>({});
  const [addingDay, setAddingDay] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [addingEventToDay, setAddingEventToDay] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<{
    dayId: string;
    eventId: string;
  } | null>(null);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [currentDayIdForUrl, setCurrentDayIdForUrl] = useState<string | null>(null);

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

  const urlForm = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
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
      const { error: eventsError } = await supabase
        .from("schedule_events")
        .delete()
        .eq("day_id", dayId);

      if (eventsError) throw eventsError;

      const { error: dayError } = await supabase
        .from("schedule_days")
        .delete()
        .eq("id", dayId);

      if (dayError) throw dayError;

      toast({
        title: "Succès",
        description: "Jour supprimé du programme",
      });
      
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
    
    setDays(reorderedDays);
    
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
      fetchDays();
    }
  };

  const handleCreateEvent = async (dayId: string, values: z.infer<typeof eventSchema>) => {
    try {
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
    
    setDays(days.map(d => 
      d.id === dayId ? { ...d, events: reorderedEvents } : d
    ));
    
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
      fetchDays();
    }
  };

  const getFileType = (file: File): 'pdf' | 'image' | null => {
    if (file.type === 'application/pdf') {
      return 'pdf';
    } else if (file.type.startsWith('image/')) {
      return 'image';
    }
    return null;
  };

  const handleFileUpload = async (dayId: string, file: File) => {
    const fileType = getFileType(file);
    
    if (!file || !fileType) {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers PDF ou images sont autorisés",
        variant: "destructive",
      });
      return;
    }

    try {
      setFileUploading({...fileUploading, [dayId]: true});
      
      const day = days.find(d => d.id === dayId);
      if (!day) {
        throw new Error("Jour non trouvé");
      }

      // Check if bucket exists and create it if it doesn't
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('festival_assets');
          
        if (bucketError) {
          // Create bucket if there's any error
          const { error: createBucketError } = await supabase.storage
            .createBucket('festival_assets', { public: true });
            
          if (createBucketError) {
            throw new Error(`Impossible de créer le bucket: ${createBucketError.message}`);
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }

      const sanitizedDayName = day.day_name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const extension = fileType === 'pdf' ? 'pdf' : file.name.split('.').pop();
      const filePath = `schedule_files/${dayId}/${sanitizedDayName}-${Date.now()}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from('festival_assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('festival_assets')
        .getPublicUrl(data?.path || filePath);
      
      // Update the schedule day with the file URL
      const { error: updateError } = await supabase
        .from('schedule_days')
        .update({ 
          pdf_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', dayId);
      
      if (updateError) {
        console.error("Error updating file URL:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Succès",
        description: `Fichier pour ${day.day_name} téléchargé avec succès`,
      });
      
      fetchDays();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier. Vérifiez que le bucket de stockage existe.",
        variant: "destructive",
      });
    } finally {
      setFileUploading({...fileUploading, [dayId]: false});
    }
  };

  const handleUrlSubmit = async (values: z.infer<typeof urlSchema>) => {
    if (!currentDayIdForUrl) return;
    
    try {
      const day = days.find(d => d.id === currentDayIdForUrl);
      if (!day) {
        throw new Error("Jour non trouvé");
      }

      // Update the schedule day with the URL
      const { error: updateError } = await supabase
        .from('schedule_days')
        .update({ 
          pdf_url: values.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentDayIdForUrl);
      
      if (updateError) {
        console.error("Error updating URL:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Succès",
        description: `URL ajoutée pour ${day.day_name}`,
      });
      
      // Close dialog and reset form
      setIsUrlDialogOpen(false);
      setCurrentDayIdForUrl(null);
      urlForm.reset();
      
      fetchDays();
    } catch (error) {
      console.error("Error setting URL:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'URL",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = async (dayId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('schedule_days')
        .update({ 
          pdf_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', dayId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Succès",
        description: "Fichier supprimé avec succès",
      });
      
      fetchDays();
    } catch (error) {
      console.error("Error removing file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive",
      });
    }
  };

  const getFilePreview = (url: string) => {
    if (!url) return null;

    // Check if it's a URL (not a file from storage)
    const isExternalUrl = !url.includes("supabase.co/storage") && !url.includes("festival_assets");
    
    if (isExternalUrl) {
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <Link className="w-4 h-4 mr-1" /> 
          Lien externe
        </a>
      );
    }
    
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    
    if (isImage) {
      return (
        <div className="flex flex-col items-center gap-2">
          <img src={url} alt="Programme" className="max-h-24 rounded-md border border-gray-300" />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <Image className="w-4 h-4 mr-1" /> 
            Voir l'image
          </a>
        </div>
      );
    } else {
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" /> 
          Voir le PDF
        </a>
      );
    }
  };

  const openUrlDialog = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (day && day.pdf_url && !day.pdf_url.includes("supabase.co/storage") && !day.pdf_url.includes("festival_assets")) {
      urlForm.setValue("url", day.pdf_url);
    } else {
      urlForm.setValue("url", "");
    }
    
    setCurrentDayIdForUrl(dayId);
    setIsUrlDialogOpen(true);
  };

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
                                <div className="border rounded-lg p-4 bg-slate-50">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Programme (PDF, image ou URL)
                                  </h4>
                                  
                                  {day.pdf_url ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        {getFilePreview(day.pdf_url)}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveFile(day.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col space-y-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Input
                                          type="file"
                                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                          id={`file-upload-${day.id}`}
                                          className="text-sm"
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              handleFileUpload(day.id, e.target.files[0]);
                                            }
                                          }}
                                          disabled={fileUploading[day.id]}
                                        />
                                        {fileUploading[day.id] && (
                                          <div className="animate-spin h-4 w-4 border border-festival-primary border-t-transparent rounded-full"></div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <div className="w-full border-t border-gray-300 my-2"></div>
                                        <span className="px-2 bg-slate-50 text-xs text-gray-500">OU</span>
                                        <div className="w-full border-t border-gray-300 my-2"></div>
                                      </div>
                                      
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => openUrlDialog(day.id)}
                                        className="flex items-center"
                                      >
                                        <Link className="mr-2 h-4 w-4" /> Ajouter un lien URL
                                      </Button>
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
