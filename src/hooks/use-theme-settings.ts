
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
          
          // Apply theme settings to CSS variables
          applyThemeSettings(settings);
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
      }, (payload) => {
        const newSettings = payload.new as any;
        if (newSettings) {
          const themeSettings: ThemeSettings = {
            id: newSettings.id || '',
            primary_color: newSettings.primary_color || '#3b82f6',
            secondary_color: newSettings.secondary_color || '#6b7280',
            accent_color: newSettings.accent_color || '#f97316',
            background_color: newSettings.background_color || '#ffffff',
            text_color: newSettings.text_color || '#111827',
            font_heading: newSettings.font_heading || 'Inter',
            font_body: newSettings.font_body || 'Inter'
          };
          
          setSettings(themeSettings);
          applyThemeSettings(themeSettings);
        }
      })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  // Function to apply theme settings to CSS variables
  const applyThemeSettings = (settings: ThemeSettings) => {
    if (!settings) return;
    
    const root = document.documentElement;
    
    // Convert hex colors to hsl values for CSS variables
    const primaryHSL = hexToHSL(settings.primary_color);
    const secondaryHSL = hexToHSL(settings.secondary_color);
    const accentHSL = hexToHSL(settings.accent_color);
    
    // Apply colors
    root.style.setProperty('--festival-primary', settings.primary_color);
    root.style.setProperty('--festival-secondary', settings.secondary_color);
    root.style.setProperty('--festival-accent', settings.accent_color);
    
    // Update CSS variables for the shadcn theme
    if (primaryHSL) {
      root.style.setProperty('--primary', primaryHSL);
      root.style.setProperty('--accent', accentHSL || '355 100% 72%');
      root.style.setProperty('--secondary', secondaryHSL || '217 33% 17%');
    }
    
    // Load fonts if they're not already loaded
    if (settings.font_heading && settings.font_body) {
      loadGoogleFonts(settings.font_heading, settings.font_body);
      
      // Apply fonts
      document.body.style.fontFamily = `'${settings.font_body}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`;
      
      // Apply heading fonts via CSS variable
      root.style.setProperty('--font-heading', `'${settings.font_heading}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`);
    }
  };
  
  return { settings, isLoading, error };
};

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string | null {
  if (!hex) return null;
  
  // Remove the # if it exists
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h = h / 6;
  }
  
  // Convert to degrees, and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

// Helper function to load Google Fonts
function loadGoogleFonts(headingFont: string, bodyFont: string) {
  const fonts = [headingFont, bodyFont].filter(Boolean);
  if (fonts.length === 0) return;
  
  // Format font names for URL
  const formattedFonts = fonts.map(font => 
    font.replace(/\s+/g, '+')
  ).join('|');
  
  // Check if the link already exists
  const existingLink = document.getElementById('google-fonts');
  if (existingLink) {
    existingLink.setAttribute('href', `https://fonts.googleapis.com/css2?family=${formattedFonts}:wght@300;400;500;600;700&display=swap`);
    return;
  }
  
  // Create a new link element
  const link = document.createElement('link');
  link.id = 'google-fonts';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFonts}:wght@300;400;500;600;700&display=swap`;
  
  // Append to head
  document.head.appendChild(link);
}
