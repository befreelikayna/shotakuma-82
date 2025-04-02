
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Image, Video, Trash, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: "cosplay" | "event" | "artwork" | "guests";
  type: "image" | "video";
  created_at?: string;
  updated_at?: string;
}

interface GalleryItemsListProps {
  galleryItems: GalleryItem[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

const GalleryItemsList = ({ galleryItems, isLoading, onDelete }: GalleryItemsListProps) => {
  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Supprimé",
        description: "L'élément a été supprimé de la galerie."
      });

      if (onDelete) {
        onDelete(id);
      }
    } catch (error: any) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément de la galerie: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement des éléments de la galerie...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aperçu</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {galleryItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="w-20 h-20 relative overflow-hidden rounded-md">
                  {item.type === "image" ? (
                    <img 
                      src={item.src} 
                      alt={item.alt} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Video size={24} className="text-slate-500" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.alt}</TableCell>
              <TableCell>
                <span className="capitalize">{item.category}</span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  {item.type === "image" ? <Image size={16} /> : <Video size={16} />}
                  {item.type}
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 h-auto"
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GalleryItemsList;
