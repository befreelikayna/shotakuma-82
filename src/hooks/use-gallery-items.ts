
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
    refetch: () => fetchGalleryItems(activeCategory)
  };
}
