
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCountdownSettings } from '@/hooks/use-countdown-settings';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

const CountdownDateManager = () => {
  const { countdownSettings, updateCountdownSettings, isLoading } = useCountdownSettings();
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:00");
  
  useEffect(() => {
    if (countdownSettings?.target_date) {
      try {
        const targetDate = new Date(countdownSettings.target_date);
        setDate(targetDate);
        setTime(format(targetDate, 'HH:mm'));
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [countdownSettings]);

  const handleSave = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      // Parse the time
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create a new date with the selected date and time
      const targetDate = new Date(date);
      targetDate.setHours(hours, minutes, 0, 0);
      
      // Update the countdown settings
      await updateCountdownSettings({
        target_date: targetDate.toISOString(),
        is_active: true
      });
      
      toast.success("Countdown date and time updated successfully");
    } catch (error) {
      console.error("Error saving countdown date:", error);
      toast.error("Failed to update countdown date");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Event Countdown Settings</CardTitle>
        <CardDescription>Set the date and time for the Shotaku event countdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date">Event Date</Label>
          <div className="border rounded-md p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="mx-auto"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Event Time</Label>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        {date && (
          <div className="bg-pink-100 dark:bg-pink-950 p-4 rounded-md">
            <p className="text-sm font-medium text-pink-800 dark:text-pink-300">
              Event will start on: {date ? format(date, 'PPPP') : 'Not set'} at {time}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !date}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {isLoading ? "Saving..." : "Save Countdown Date & Time"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CountdownDateManager;
