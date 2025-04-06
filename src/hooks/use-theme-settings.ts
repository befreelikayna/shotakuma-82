
import { useState, useEffect } from 'react';
import { customSupabase } from '@/integrations/supabase/client';

export interface ThemeSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
}

export const useThemeSettings = () => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await customSupabase
          .from('theme_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Safely cast the data to our expected type
          const typedData = data as any;
          const settings: ThemeSettings = {
            id: typedData.id || '',
            primary_color: typedData.primary_color || '#3b82f6',
            secondary_color: typedData.secondary_color || '#6b7280',
            accent_color: typedData.accent_color || '#f97316',
            background_color: typedData.background_color || '#ffffff',
            text_color: typedData.text_color || '#111827',
            font_heading: typedData.font_heading || 'Inter',
            font_body: typedData.font_body || 'Inter'
          };
          setSettings(settings);
        }
      } catch (err) {
        console.error('Error fetching theme settings:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch theme settings'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
    
    // Set up real-time subscription for theme settings updates
    const channel = customSupabase
      .channel('theme-settings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'theme_settings'
      }, () => {
        fetchSettings();
      })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  return { settings, isLoading, error };
};
