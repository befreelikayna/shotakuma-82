import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Image, ArrowUp, ArrowDown, Loader2, RefreshCw, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Fetch slider images from Supabase
  const fetchImages = useCallback(async () => {
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
          description: "Impossible de charger les images du slider: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        console.log("Admin slider data loaded:", data);
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    
    // Set up a subscription to listen for changes to the slider_images table
    const channel = supabase
      .channel('admin:slider_images')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'slider_images' 
        }, 
        () => {
          console.log('Admin: Slider images changed, refreshing...');
          fetchImages();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchImages]);

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

  const handleUploadImage = async (file: File) => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `public/slider-images/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('slider-images')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            // Calculate and update progress
            const percent = Math.floor((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image: " + uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('slider-images')
        .getPublicUrl(filePath);
      
      if (publicUrlData && publicUrlData.publicUrl) {
        // Set the new image URL for adding to the slider
        setNewImageUrl(publicUrlData.publicUrl);
        
        // Close the upload dialog
        setShowUploadModal(false);
        
        toast({
          title: "Image téléchargée",
          description: "L'image a été téléchargée avec succès",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du téléchargement",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (id: string) => {
    try {
      setSavingItemId(id);
      
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
      setSavingItemId(null);
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
      setSavingItemId(id);
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
      
      // Immediately save the order changes
      await updateOrderNumbers(updatedImages);
      
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des images a été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error moving slider image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du déplacement de l'image",
        variant: "destructive",
      });
      // Refresh to get the current state
      await fetchImages();
    } finally {
      setSavingItemId(null);
    }
  };

  const updateOrderNumbers = async (imagesToUpdate = images) => {
    try {
      // Handle each update individually
      for (const item of imagesToUpdate) {
        const { error } = await supabase
          .from('slider_images')
          .update({ order_number: item.order_number })
          .eq('id', item.id);
          
        if (error) {
          console.error('Error updating image order:', error);
          return false;
        }
      }
      
      setHasUnsavedChanges(false);
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

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      setSavingItemId(id);
      
      // Update in Supabase immediately
      const { error } = await supabase
        .from('slider_images')
        .update({ active })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating image active status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de l'image: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setImages(
        images.map((image) =>
          image.id === id ? { ...image, active } : image
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `L'image est maintenant ${active ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      console.error('Error toggling image active status:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut",
        variant: "destructive",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      let hasErrors = false;
      
      // Update each image individually with only changed fields
      for (const image of images) {
        const { error } = await supabase
          .from('slider_images')
          .update({
            image_url: image.image_url,
            link: image.link,
          })
          .eq('id', image.id);
        
        if (error) {
          console.error('Error saving image:', error);
          hasErrors = true;
        }
      }
      
      if (hasErrors) {
        toast({
          title: "Erreur partielle",
          description: "Certaines modifications n'ont pas pu être enregistrées",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Modifications enregistrées",
          description: "Les changements du slider ont été enregistrés avec succès",
        });
      }
      
      setHasUnsavedChanges(false);
      
      // Refresh the images from database to ensure consistency
      fetchImages();
      
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

  const handleSaveIndividualImage = async (id: string) => {
    try {
      setSavingItemId(id);
      
      const imageToSave = images.find(img => img.id === id);
      if (!imageToSave) return;
      
      const { error } = await supabase
        .from('slider_images')
        .update({
          image_url: imageToSave.image_url,
          link: imageToSave.link,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error saving individual image:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer l'image: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Image mise à jour",
        description: "Les modifications de l'image ont été enregistrées",
      });
      
      // Refresh the images to ensure consistency
      fetchImages();
      
    } catch (error) {
      console.error('Error saving individual image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleUploadImage(event.target.files[0]);
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
        <Button 
          variant="outline" 
          onClick={fetchImages}
          className="mb-4"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser les données
        </Button>
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
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
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`image-active-${image.id}`}
                        checked={image.active}
                        onCheckedChange={(checked) =>
                          handleToggleActive(image.id, checked)
                        }
                        disabled={savingItemId === image.id}
                      />
                      <Label htmlFor={`image-active-${image.id}`} className="text-sm">
                        {image.active ? "Actif" : "Inactif"}
                      </Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveIndividualImage(image.id)}
                      disabled={savingItemId === image.id}
                    >
                      {savingItemId === image.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Enregistrer
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "up")}
                    disabled={image.order_number === 0 || savingItemId === image.id}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "down")}
                    disabled={image.order_number === images.length - 1 || savingItemId === image.id}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={savingItemId === image.id}
                  >
                    {savingItemId === image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
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
            <div className="flex gap-2">
              <Input
                id="new-image-url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isSaving}
                className="flex-1"
              />
              <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Télécharger une image</DialogTitle>
                    <DialogDescription>
                      Sélectionnez une image à télécharger pour le slider.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {isUploading ? (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-center">
                          {uploadProgress}% téléchargé
                        </p>
                      </div>
                    ) : (
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="image-upload">Image</Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <p className="text-sm text-muted-foreground">
                          Formats acceptés: JPG, PNG, GIF. Taille max: 5 MB.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isUploading}>
                          Annuler
                        </Button>
                      </DialogClose>
                      <label htmlFor="image-upload">
                        <Button 
                          as="span" 
                          disabled={isUploading}
                          className="cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Téléchargement...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Télécharger
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
