
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItemFormProps {
  onSuccess?: () => void;
}

const GalleryItemForm = ({ onSuccess }: GalleryItemFormProps) => {
  const [newItem, setNewItem] = useState({
    src: "",
    alt: "",
    category: "cosplay" as "cosplay" | "event" | "artwork" | "guests",
    type: "image" as "image" | "video"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.src || !newItem.alt) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('gallery_items')
        .insert([{
          src: newItem.src,
          alt: newItem.alt,
          category: newItem.category,
          type: newItem.type
        }]);
      
      if (error) {
        throw error;
      }
      
      setNewItem({
        src: "",
        alt: "",
        category: "cosplay",
        type: "image"
      });
      
      toast({
        title: "Succès",
        description: "L'élément a été ajouté à la galerie."
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding gallery item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'élément à la galerie: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-lg mb-8">
      <h3 className="text-lg font-medium text-festival-primary mb-4">Ajouter un nouveau contenu</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <Input
            value={newItem.src}
            onChange={(e) => setNewItem({ ...newItem, src: e.target.value })}
            placeholder="URL de l'image ou vidéo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Input
            value={newItem.alt}
            onChange={(e) => setNewItem({ ...newItem, alt: e.target.value })}
            placeholder="Description du contenu"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <Select
            value={newItem.category}
            onValueChange={(value: "cosplay" | "event" | "artwork" | "guests") => 
              setNewItem({ ...newItem, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cosplay">Cosplay</SelectItem>
              <SelectItem value="event">Événements</SelectItem>
              <SelectItem value="artwork">Œuvres d'art</SelectItem>
              <SelectItem value="guests">Invités</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <Select
            value={newItem.type}
            onValueChange={(value: "image" | "video") => 
              setNewItem({ ...newItem, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Vidéo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleAddItem}
        className="bg-festival-accent text-white flex items-center gap-2"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Ajout en cours...
          </>
        ) : (
          <>
            <Plus size={16} /> Ajouter
          </>
        )}
      </Button>
    </div>
  );
};

export default GalleryItemForm;
