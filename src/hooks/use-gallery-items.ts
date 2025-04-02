
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: 'cosplay' | 'event' | 'artwork' | 'guests';
  type: 'image' | 'video';
  created_at?: string;
  updated_at?: string;
}

export function useGalleryItems(initialCategory?: string) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);

  const fetchGalleryItems = async (category?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase.from('gallery_items').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Cast the data to our GalleryItem type
        const typedData = data as unknown as GalleryItem[];
        console.log("Gallery items loaded:", typedData);
        setItems(typedData);
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Add images from URLs in bulk
  const addImagesFromUrls = async (
    urls: string[],
    category: 'cosplay' | 'event' | 'artwork' | 'guests' = 'event',
    altText: string = 'Imported image'
  ) => {
    if (!urls.length) return;
    
    try {
      setIsLoading(true);
      
      const galleryItems = urls.map(url => ({
        src: url,
        alt: altText,
        category,
        type: 'image' as const
      }));
      
      const { error } = await supabase
        .from('gallery_items')
        .insert(galleryItems);
      
      if (error) {
        throw error;
      }
      
      // Refresh the gallery items
      await fetchGalleryItems(activeCategory);
      
      return {
        success: true,
        count: urls.length
      };
    } catch (err) {
      console.error('Error adding images in bulk:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize realtime subscription
  useEffect(() => {
    fetchGalleryItems(activeCategory);
    
    // Set up a realtime subscription
    const channel = supabase
      .channel('gallery-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_items' }, 
        () => {
          console.log('Gallery items changed, refreshing...');
          fetchGalleryItems(activeCategory);
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory]);

  return {
    items,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    refetch: () => fetchGalleryItems(activeCategory),
    addImagesFromUrls
  };
}
