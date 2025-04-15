import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase, ExtendedScheduleDay, ScheduleEvent } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ScheduleManager = () => {
  const [days, setDays] = useState<ExtendedScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState(false);
  const [newDay, setNewDay] = useState({
    day_name: "",
    date: "",
    order_number: 0
  });
  const [selectedDay, setSelectedDay] = useState<ExtendedScheduleDay | null>(null);
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
      
      const { data: daysData, error: daysError } = await supabase
        .from('schedule_days')
        .select('*')
        .order('order_number');
      
      if (daysError) throw daysError;
      
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
      
      setDays(daysWithEvents as ExtendedScheduleDay[]);
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

  // ... rest of the component remains unchanged
};
