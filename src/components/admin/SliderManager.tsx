
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Image, Link, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SliderImage {
  id: string;
  image_url: string;
  link: string | null;
  order_number: number;
  active: boolean;
}

const SliderManager = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageLink, setNewImageLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch slider images from Supabase
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('order_number');
      
      if (error) {
        console.error('Error fetching slider images:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les images du slider",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL d'image valide",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Get the highest order_number
      const highestOrder = images.length > 0 
        ? Math.max(...images.map(img => img.order_number))
        : -1;
        
      const newImage = {
        image_url: newImageUrl,
        link: newImageLink || null,
        order_number: highestOrder + 1,
        active: true
      };

      const { data, error } = await supabase
        .from('slider_images')
        .insert([newImage])
        .select();
      
      if (error) {
        console.error('Error adding slider image:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'image au slider: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        setImages([...images, data[0]]);
        setNewImageUrl("");
        setNewImageLink("");
        
        toast({
          title: "Image ajoutée",
          description: "L'image a été ajoutée au slider avec succès",
        });
      }
    } catch (error) {
      console.error('Error adding slider image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'image",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async (id: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('slider_images')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing slider image:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'image du slider: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      setImages(images.filter((image) => image.id !== id));
      
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée du slider",
      });
    } catch (error) {
      console.error('Error removing slider image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveImage = async (id: string, direction: "up" | "down") => {
    const imageIndex = images.findIndex((image) => image.id === id);
    if (
      (direction === "up" && imageIndex === 0) ||
      (direction === "down" && imageIndex === images.length - 1)
    ) {
      return;
    }

    try {
      const newImages = [...images];
      const targetIndex = direction === "up" ? imageIndex - 1 : imageIndex + 1;
      
      // Swap the items
      [newImages[imageIndex], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[imageIndex],
      ];
      
      // Update order values
      const updatedImages = newImages.map((image, index) => ({
        ...image,
        order_number: index,
      }));
      
      setImages(updatedImages);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error moving slider image:', error);
    }
  };

  const updateOrderNumbers = async () => {
    try {
      // Create an array of updates with all required fields for each image
      const updates = images.map((image, index) => ({
        id: image.id,
        image_url: image.image_url,
        link: image.link,
        order_number: index,
        active: image.active
      }));
      
      // Handle each update individually to avoid RLS issues
      for (const item of updates) {
        const { error } = await supabase
          .from('slider_images')
          .update({
            image_url: item.image_url,
            link: item.link,
            order_number: item.order_number,
            active: item.active
          })
          .eq('id', item.id);
          
        if (error) {
          console.error('Error updating image:', error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour l'ordre des images: " + error.message,
            variant: "destructive",
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating order numbers:', error);
      return false;
    }
  };

  const handleUpdateImageUrl = (id: string, newUrl: string) => {
    setImages(
      images.map((image) =>
        image.id === id ? { ...image, image_url: newUrl } : image
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateImageLink = (id: string, newLink: string) => {
    setImages(
      images.map((image) =>
        image.id === id ? { ...image, link: newLink || null } : image
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setImages(
      images.map((image) =>
        image.id === id ? { ...image, active } : image
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Update each image individually
      for (const image of images) {
        const { error } = await supabase
          .from('slider_images')
          .update({
            image_url: image.image_url,
            link: image.link,
            order_number: image.order_number,
            active: image.active
          })
          .eq('id', image.id);
        
        if (error) {
          console.error('Error saving image:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer les modifications: " + error.message,
            variant: "destructive",
          });
          return;
        }
      }
      
      toast({
        title: "Modifications enregistrées",
        description: "Les changements du slider ont été enregistrés avec succès",
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement des modifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement des images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Gestion du Slider</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ajoutez, modifiez ou supprimez les images du slider de la page d'accueil.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Images actuelles</h3>
        {images.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Aucune image dans le slider. Ajoutez-en une ci-dessous.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`flex flex-col md:flex-row gap-4 p-4 border rounded-lg ${
                  image.active ? "bg-card" : "bg-muted/40"
                }`}
              >
                <div className="w-full md:w-40 h-24 bg-muted rounded-md overflow-hidden">
                  <img
                    src={image.image_url}
                    alt="Slider preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`image-url-${image.id}`}>URL de l'image</Label>
                    <Input
                      id={`image-url-${image.id}`}
                      value={image.image_url}
                      onChange={(e) =>
                        handleUpdateImageUrl(image.id, e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`image-link-${image.id}`}>
                      Lien (optionnel)
                    </Label>
                    <Input
                      id={`image-link-${image.id}`}
                      value={image.link || ""}
                      onChange={(e) =>
                        handleUpdateImageLink(image.id, e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Switch
                      id={`image-active-${image.id}`}
                      checked={image.active}
                      onCheckedChange={(checked) =>
                        handleToggleActive(image.id, checked)
                      }
                    />
                    <Label htmlFor={`image-active-${image.id}`} className="text-sm">
                      {image.active ? "Actif" : "Inactif"}
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "up")}
                    disabled={image.order_number === 0 || isSaving}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "down")}
                    disabled={image.order_number === images.length - 1 || isSaving}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ajouter une nouvelle image</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-image-url">URL de l'image</Label>
            <Input
              id="new-image-url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-image-link">Lien (optionnel)</Label>
            <Input
              id="new-image-link"
              value={newImageLink}
              onChange={(e) => setNewImageLink(e.target.value)}
              placeholder="https://example.com"
              disabled={isSaving}
            />
          </div>
          <Button 
            onClick={handleAddImage} 
            className="w-full md:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> 
                Ajouter l'image
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSaveChanges} 
          className="w-full md:w-auto"
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Enregistrement en cours...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SliderManager;
