
import React, { useState, useEffect } from 'react';
import { customSupabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  type: string;
  category: string;
}

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await customSupabase
          .from('gallery_items')
          .select('*')
          .limit(6); // Limit to 6 items for the preview
        
        if (error) {
          throw error;
        }
        
        if (data && Array.isArray(data)) {
          // Type-safe conversion of data
          const galleryItems: GalleryItem[] = data.map(item => {
            // Handle potential null values safely
            const typedItem = item as any;
            return {
              id: String(typedItem?.id || ''),
              src: String(typedItem?.src || ''),
              alt: String(typedItem?.alt || ''),
              type: String(typedItem?.type || 'image'),
              category: String(typedItem?.category || 'general')
            };
          });
          
          setItems(galleryItems);
        }
      } catch (error) {
        console.error('Error fetching gallery items:', error);
        // Set default items in case of error
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleryItems();
    
    // Set up a real-time subscription
    const channel = customSupabase
      .channel('gallery-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'gallery_items' 
        }, 
        () => {
          fetchGalleryItems();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-200 h-60 rounded flex items-center justify-center">
          <span className="text-gray-500">Aucune image</span>
        </div>
        <div className="bg-gray-200 h-60 rounded flex items-center justify-center">
          <span className="text-gray-500">Aucune image</span>
        </div>
        <div className="bg-gray-200 h-60 rounded flex items-center justify-center">
          <span className="text-gray-500">Aucune image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-gray-200 h-60 rounded overflow-hidden relative group cursor-pointer"
        >
          {item.type === 'image' ? (
            <img 
              src={item.src} 
              alt={item.alt} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span>Vidéo: {item.alt}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm">{item.alt}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
