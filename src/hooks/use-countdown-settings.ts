
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CountdownSettings {
  id?: string;
  title: string;
  targetDate: string;
  backgroundColor: string;
  textColor: string;
  enabled: boolean;
  showOnLoad: boolean;
  displayDuration?: number;
}

const defaultSettings: CountdownSettings = {
  title: "COUNTDOWN TO FESTIVAL",
  targetDate: "2025-05-08T00:00:00", // May 8, 2025
  backgroundColor: "#1F1F3F",
  textColor: "#00FFB9",
  enabled: true,
  showOnLoad: true,
  displayDuration: 0 // 0 means display until manually closed
};

export const useCountdownSettings = () => {
  const [settings, setSettings] = useState<CountdownSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Fetch settings from the database
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('countdown_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching countdown settings:', error);
        return;
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching countdown settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to the database
  const saveSettings = async (newSettings: CountdownSettings) => {
    try {
      let response;
      if (newSettings.id) {
        response = await supabase
          .from('countdown_settings')
          .update({ 
            title: newSettings.title,
            targetDate: newSettings.targetDate,
            backgroundColor: newSettings.backgroundColor,
            textColor: newSettings.textColor,
            enabled: newSettings.enabled,
            showOnLoad: newSettings.showOnLoad,
            displayDuration: newSettings.displayDuration,
          })
          .eq('id', newSettings.id);
      } else {
        response = await supabase
          .from('countdown_settings')
          .insert({ 
            title: newSettings.title,
            targetDate: newSettings.targetDate,
            backgroundColor: newSettings.backgroundColor,
            textColor: newSettings.textColor,
            enabled: newSettings.enabled,
            showOnLoad: newSettings.showOnLoad,
            displayDuration: newSettings.displayDuration,
          });
      }

      if (response.error) {
        throw response.error;
      }
      
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving countdown settings:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, fetchSettings, saveSettings };
};
