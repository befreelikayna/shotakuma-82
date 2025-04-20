import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
  const [loading, setLoading] = useState(false);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [currentDay, setCurrentDay] = useState<ScheduleDay | null>(null);
  const [currentEvent, setCurrentEvent] = useState<ScheduleEvent | null>(null);
  const [isCreatingDay, setIsCreatingDay] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const [formDayDate, setFormDayDate] = useState("");
  const [formDayName, setFormDayName] = useState("");

  const [formEventDayId, setFormEventDayId] = useState<string | null>(null);
  const [formEventTitle, setFormEventTitle] = useState("");
  const [formEventDescription, setFormEventDescription] = useState("");
  const [formEventStartTime, setFormEventStartTime] = useState("");
  const [formEventEndTime, setFormEventEndTime] = useState("");
  const [formEventLocation, setFormEventLocation] = useState("");
  const [formEventCategory, setFormEventCategory] = useState("");

  const fetchScheduleDays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schedule_days")
        .select("*")
        .order("order_number");

      if (error) throw error;
      if (data) setScheduleDays(data as ScheduleDay[]);
    } catch (error) {
      console.error("Error fetching schedule days:", error);
      toast.error("Failed to load schedule days");
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schedule_events")
        .select("*")
        .order("order_number");

      if (error) throw error;
      if (data) setScheduleEvents(data as ScheduleEvent[]);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      toast.error("Failed to load schedule events");
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
      setCurrentDay(day);
      setFormDayDate(day.date);
      setFormDayName(day.day_name);
      setIsCreatingDay(false);
    } else {
      setCurrentDay(null);
      setFormDayDate("");
      setFormDayName("");
      setIsCreatingDay(true);
    }
    setShowDayDialog(true);
  };

  const handleCloseDayDialog = () => {
    setShowDayDialog(false);
    setCurrentDay(null);
  };

  const handleOpenEventDialog = (event: ScheduleEvent | null = null) => {
    if (event) {
      setCurrentEvent(event);
      setFormEventDayId(event.day_id);
      setFormEventTitle(event.title);
      setFormEventDescription(event.description || "");
      setFormEventStartTime(event.start_time);
      setFormEventEndTime(event.end_time);
      setFormEventLocation(event.location || "");
      setFormEventCategory(event.category);
      setIsCreatingEvent(false);
    } else {
      setCurrentEvent(null);
      setFormEventDayId(scheduleDays.length > 0 ? scheduleDays[0].id : null);
      setFormEventTitle("");
      setFormEventDescription("");
      setFormEventStartTime("");
      setFormEventEndTime("");
      setFormEventLocation("");
      setFormEventCategory("");
      setIsCreatingEvent(true);
    }
    setShowEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setShowEventDialog(false);
    setCurrentEvent(null);
  };

  const handleSaveDay = async () => {
    if (!formDayDate.trim() || !formDayName.trim()) {
      toast.error("Date and Day Name are required");
      return;
    }

    setLoading(true);
    try {
      const dayData = {
        date: formDayDate,
        day_name: formDayName,
      };

      if (isCreatingDay) {
        const newOrderNumber = scheduleDays.length > 0
          ? Math.max(...scheduleDays.map(day => day.order_number)) + 1
          : 1;

        const { error } = await supabase
          .from("schedule_days")
          .insert({
            ...dayData,
            order_number: newOrderNumber
          });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        toast.success("Schedule day added successfully");
      } else if (currentDay) {
        const { error } = await supabase
          .from("schedule_days")
          .update(dayData)
          .eq('id', currentDay.id);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        toast.success("Schedule day updated successfully");
      }

      handleCloseDayDialog();
      fetchScheduleDays();
    } catch (error: any) {
      console.error("Error saving schedule day:", error);
      toast.error(`Failed to save schedule day: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!formEventDayId || !formEventTitle.trim() || !formEventStartTime.trim() || !formEventEndTime.trim() || !formEventCategory.trim()) {
      toast.error("Day, Title, Start Time, End Time and Category are required");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        day_id: formEventDayId,
        title: formEventTitle,
        description: formEventDescription,
        start_time: formEventStartTime,
        end_time: formEventEndTime,
        location: formEventLocation,
        category: formEventCategory,
      };

      if (isCreatingEvent) {
        const newOrderNumber = scheduleEvents.length > 0
          ? Math.max(...scheduleEvents.map(event => event.order_number)) + 1
          : 1;

        const { error } = await supabase
          .from("schedule_events")
          .insert({
            ...eventData,
            order_number: newOrderNumber
          });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        toast.success("Schedule event added successfully");
      } else if (currentEvent) {
        const { error } = await supabase
          .from("schedule_events")
          .update(eventData)
          .eq('id', currentEvent.id);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        toast.success("Schedule event updated successfully");
      }

      handleCloseEventDialog();
      fetchScheduleEvents();
    } catch (error: any) {
      console.error("Error saving schedule event:", error);
      toast.error(`Failed to save schedule event: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDay = async (id: string) => {
    if (!confirm("Are you sure you want to delete this day and all associated events?")) return;

    setLoading(true);
    try {
      // Delete associated events first
      const { error: eventsError } = await supabase
        .from("schedule_events")
        .delete()
        .eq('day_id', id);

      if (eventsError) throw eventsError;

      // Then delete the day
      const { error } = await supabase
        .from("schedule_days")
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Schedule day and associated events deleted successfully");
      fetchScheduleDays();
      fetchScheduleEvents();
    } catch (error) {
      console.error("Error deleting schedule day:", error);
      toast.error("Failed to delete schedule day");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Schedule event deleted successfully");
      fetchScheduleEvents();
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      toast.error("Failed to delete schedule event");
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

  const handleUploadPdf = async (dayId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${dayId}.${fileExt}`;
      const filePath = `schedule_pdfs/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('schedules')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('schedules')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('schedule_days')
        .update({ pdf_url: urlData.publicUrl } as Partial<ScheduleDay>)
        .eq('id', dayId);
      
      if (updateError) throw updateError;

      toast.success('PDF uploaded successfully');
      fetchScheduleDays();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    }
  };

  const handleRemovePdf = async (dayId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_days')
        .update({ pdf_url: null } as Partial<ScheduleDay>)
        .eq('id', dayId);
      
      if (error) throw error;

      toast.success('PDF removed successfully');
      fetchScheduleDays();
    } catch (error) {
      console.error('Error removing PDF:', error);
      toast.error('Failed to remove PDF');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Schedule Days</h2>
        <Button onClick={() => handleOpenDayDialog()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      {loading && scheduleDays.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Loading schedule days...</p>
        </div>
      ) : scheduleDays.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No schedule days added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleDays.map((day) => (
            <div key={day.id} className="p-4 border rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{day.day_name}</h3>
                <div className="flex space-x-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDayDialog(day)}
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
                </div>
              </div>
              <p className="text-gray-600">Date: {day.date}</p>
              
              <div className="mt-2 flex items-center justify-between">
                {day.pdf_url ? (
                  <div className="flex items-center space-x-2">
                    <a href={day.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                      <File className="h-4 w-4 mr-1" />
                      View PDF
                    </a>
                    <Button variant="outline" size="sm" onClick={() => handleRemovePdf(day.id)}>
                      Remove PDF
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`upload-pdf-${day.id}`} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload PDF</span>
                      </div>
                    </Label>
                    <Input
                      type="file"
                      id={`upload-pdf-${day.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleUploadPdf(day.id, file);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Schedule Events</h2>
        <Button onClick={() => handleOpenEventDialog()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {loading && scheduleEvents.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Loading schedule events...</p>
        </div>
      ) : scheduleEvents.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No schedule events added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleEvents.map((event) => (
            <div key={event.id} className="p-4 border rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{event.title}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderEvent(event.id, 'up')}
                    disabled={loading}
                    title="Move Up"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderEvent(event.id, 'down')}
                    disabled={loading}
                    title="Move Down"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEventDialog(event)}
                    disabled={loading}
                    title="Edit Event"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    title="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600">Time: {event.start_time} - {event.end_time}</p>
              <p className="text-gray-600">Location: {event.location}</p>
              <p className="text-gray-600">Category: {event.category}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreatingDay ? 'Add Schedule Day' : 'Edit Schedule Day'}</DialogTitle>
            <DialogDescription>
              {isCreatingDay
                ? 'Add a new day to the schedule'
                : 'Edit the details of the existing schedule day'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={formDayDate}
                onChange={(e) => setFormDayDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="day_name">Day Name</Label>
              <Input
                type="text"
                id="day_name"
                value={formDayName}
                onChange={(e) => setFormDayName(e.target.value)}
                placeholder="e.g., Day 1, Saturday"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDayDialog} disabled={loading}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSaveDay} disabled={loading}>
              <Check className="mr-2 h-4 w-4" /> {isCreatingDay ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreatingEvent ? 'Add Schedule Event' : 'Edit Schedule Event'}</DialogTitle>
            <DialogDescription>
              {isCreatingEvent
                ? 'Add a new event to the schedule'
                : 'Edit the details of the existing schedule event'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day_id">Day</Label>
              <select
                id="day_id"
                className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-festival-primary focus:outline-none focus:ring-festival-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={formEventDayId || ''}
                onChange={(e) => setFormEventDayId(e.target.value)}
              >
                {scheduleDays.map((day) => (
                  <option key={day.id} value={day.id}>{day.day_name} ({day.date})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={formEventTitle}
                onChange={(e) => setFormEventTitle(e.target.value)}
                placeholder="Event Title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                value={formEventDescription}
                onChange={(e) => setFormEventDescription(e.target.value)}
                placeholder="Event Description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                type="time"
                id="start_time"
                value={formEventStartTime}
                onChange={(e) => setFormEventStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                type="time"
                id="end_time"
                value={formEventEndTime}
                onChange={(e) => setFormEventEndTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                value={formEventLocation}
                onChange={(e) => setFormEventLocation(e.target.value)}
                placeholder="Event Location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                value={formEventCategory}
                onChange={(e) => setFormEventCategory(e.target.value)}
                placeholder="Event Category"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseEventDialog} disabled={loading}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={loading}>
              <Check className="mr-2 h-4 w-4" /> {isCreatingEvent ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManager;
