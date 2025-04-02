
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FacebookPhotosImporter from "./FacebookPhotosImporter";
import GalleryItemForm from "./GalleryItemForm";
import GalleryItemsList, { GalleryItem } from "./GalleryItemsList";

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les éléments de la galerie",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        console.log("Gallery items loaded:", data);
        setGalleryItems(data as GalleryItem[]);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
    
    const channel = supabase
      .channel('admin:gallery')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_items' }, 
        () => {
          console.log('Gallery items changed, refreshing...');
          fetchGalleryItems();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    fetchGalleryItems();
    toast({
      title: "Actualisé",
      description: "Les données ont été actualisées."
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion de la Galerie</h2>
      
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
      
      <FacebookPhotosImporter />
      
      <GalleryItemForm onSuccess={fetchGalleryItems} />
      
      <h3 className="text-lg font-medium text-festival-primary mb-4">Contenu actuel ({galleryItems.length})</h3>
      
      <GalleryItemsList 
        galleryItems={galleryItems} 
        isLoading={isLoading} 
        onDelete={() => fetchGalleryItems()}
      />
    </div>
  );
};

export default GalleryManager;
