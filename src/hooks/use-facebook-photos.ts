
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export interface FacebookPhoto {
  id: string;
  source: string;
  name?: string;
}

export function useFacebookPhotos(pageId: string = 'OTAKU.sho') {
  const [photos, setPhotos] = useState<FacebookPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // NOTE: For a production app, you should create a Supabase Edge Function to securely handle the API key
      // This is a simplified version for demonstration purposes
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos?fields=source,name&limit=100&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const data = await response.json();
      console.log('Facebook photos fetched:', data);
      
      if (data.data && Array.isArray(data.data)) {
        setPhotos(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setPhotos([]);
      }
    } catch (err) {
      console.error('Error fetching Facebook photos:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos depuis Facebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // We won't automatically fetch on mount since we need a token
    // Call fetchPhotos manually when you have the token
  }, [pageId]);

  return {
    photos,
    isLoading,
    error,
    fetchPhotos
  };
}
