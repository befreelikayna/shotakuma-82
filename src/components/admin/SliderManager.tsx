
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
      
      const newImage = {
        image_url: newImageUrl,
        link: newImageLink || null,
        order_number: images.length,
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
          description: "Impossible d'ajouter l'image au slider",
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
          description: "Impossible de supprimer l'image du slider",
          variant: "destructive",
        });
        return;
      }
      
      setImages(images.filter((image) => image.id !== id));
      
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée du slider",
      });
      
      // Update order numbers
      await updateOrderNumbers();
    } catch (error) {
      console.error('Error removing slider image:', error);
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
      setIsSaving(true);
      
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
      
      // Update order in database
      await updateOrderNumbers();
    } catch (error) {
      console.error('Error moving slider image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateOrderNumbers = async () => {
    try {
      for (const image of images) {
        await supabase
          .from('slider_images')
          .update({ order_number: image.order_number })
          .eq('id', image.id);
      }
    } catch (error) {
      console.error('Error updating order numbers:', error);
    }
  };

  const handleUpdateImageUrl = async (id: string, newUrl: string) => {
    try {
      const { error } = await supabase
        .from('slider_images')
        .update({ image_url: newUrl })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating image URL:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'URL de l'image",
          variant: "destructive",
        });
        return;
      }
      
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, image_url: newUrl } : image
        )
      );
    } catch (error) {
      console.error('Error updating image URL:', error);
    }
  };

  const handleUpdateImageLink = async (id: string, newLink: string) => {
    try {
      const { error } = await supabase
        .from('slider_images')
        .update({ link: newLink || null })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating image link:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le lien de l'image",
          variant: "destructive",
        });
        return;
      }
      
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, link: newLink || null } : image
        )
      );
    } catch (error) {
      console.error('Error updating image link:', error);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('slider_images')
        .update({ active })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating image active status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de l'image",
          variant: "destructive",
        });
        return;
      }
      
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, active } : image
        )
      );
    } catch (error) {
      console.error('Error updating image active status:', error);
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: "Modifications enregistrées",
      description: "Les changements du slider ont été enregistrés avec succès",
    });
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
          disabled={isSaving}
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default SliderManager;
