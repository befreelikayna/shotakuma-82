
import React, { useEffect, useState } from 'react';
import { useThemeSettings } from '@/hooks/use-theme-settings';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, isLoading } = useThemeSettings();
  const [currentBg, setCurrentBg] = useState<string | null>(null);

  useEffect(() => {
    if (settings && settings.background_color) {
      // Check if the background color is a dark color
      const isDark = isColorDark(settings.background_color);
      
      // Handle non-default backgrounds based on theme presets
      if (settings.primary_color === '#2B0B98' && settings.secondary_color === '#6B46C1') {
        // This is the Cosmic theme
        setCurrentBg('/lovable-uploads/e1622249-db1a-4504-a1f6-84134f9596ba.png');
        document.body.classList.add('dark-theme');
      } else if (settings.primary_color === '#FC8181' && settings.secondary_color === '#F6AD55') {
        // This is the Sunrise theme
        setCurrentBg('/lovable-uploads/95e4a390-2521-448c-92e8-e91a5fe0dc83.png');
        document.body.classList.remove('dark-theme');
      } else if (settings.primary_color === '#4299E1' && settings.secondary_color === '#667EEA') {
        // This is the Blue Sky theme
        setCurrentBg('/lovable-uploads/4b2e3443-7b43-4c0e-b1e3-6874a9c4e56e.png');
        document.body.classList.remove('dark-theme');
      } else {
        // Default SHOTAKU theme
        setCurrentBg('/lovable-uploads/033dc11d-ce6a-468c-8da7-e4d60a1611bc.png');
        
        // Set dark mode based on color analysis
        if (isDark) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (currentBg) {
      document.body.style.backgroundImage = `url('${currentBg}')`;
      document.body.classList.add('background-animation');
    }
    
    return () => {
      document.body.style.backgroundImage = '';
      document.body.classList.remove('background-animation');
    };
  }, [currentBg]);

  return <>{children}</>;
};

// Helper function to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  // Remove the # if it exists
  hexColor = hexColor.replace('#', '');
  
  // Parse the RGB components
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Calculate luminance (perceived brightness)
  // Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark (luminance < 0.5)
  return luminance < 0.5;
}

export default ThemeProvider;
