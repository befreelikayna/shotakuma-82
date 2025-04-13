
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FacebookPhotosImporter from "./FacebookPhotosImporter";
import GalleryItemForm from "./GalleryItemForm";
import GalleryItemsList, { GalleryItem } from "./GalleryItemsList";
import { useGalleryItems } from "@/hooks/use-gallery-items";

const GalleryManager = () => {
  const { items: galleryItems, isLoading, refetch } = useGalleryItems();

  const handleRefresh = () => {
    refetch();
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
      
      <GalleryItemForm onSuccess={refetch} />
      
      <h3 className="text-lg font-medium text-festival-primary mb-4">Contenu actuel ({galleryItems.length})</h3>
      
      <GalleryItemsList 
        galleryItems={galleryItems} 
        isLoading={isLoading} 
        onDelete={refetch}
      />
    </div>
  );
};

export default GalleryManager;
