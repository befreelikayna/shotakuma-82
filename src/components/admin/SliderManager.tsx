
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { X, Plus, Image, Link, ArrowUp, ArrowDown } from "lucide-react";

interface SliderImage {
  id: string;
  imageUrl: string;
  link?: string;
  order: number;
}

const SliderManager = () => {
  const [images, setImages] = useState<SliderImage[]>([
    {
      id: "1",
      imageUrl: "https://source.unsplash.com/random/1920x1080?anime",
      link: "https://example.com/anime",
      order: 0,
    },
    {
      id: "2",
      imageUrl: "https://source.unsplash.com/random/1920x1080?cosplay",
      link: "https://example.com/cosplay",
      order: 1,
    },
  ]);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageLink, setNewImageLink] = useState("");

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL d'image valide",
        variant: "destructive",
      });
      return;
    }

    const newImage: SliderImage = {
      id: Date.now().toString(),
      imageUrl: newImageUrl,
      link: newImageLink || undefined,
      order: images.length,
    };

    setImages([...images, newImage]);
    setNewImageUrl("");
    setNewImageLink("");

    toast({
      title: "Image ajoutée",
      description: "L'image a été ajoutée au slider avec succès",
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((image) => image.id !== id));
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée du slider",
    });
  };

  const handleMoveImage = (id: string, direction: "up" | "down") => {
    const imageIndex = images.findIndex((image) => image.id === id);
    if (
      (direction === "up" && imageIndex === 0) ||
      (direction === "down" && imageIndex === images.length - 1)
    ) {
      return;
    }

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
      order: index,
    }));
    
    setImages(updatedImages);
  };

  const handleUpdateImageUrl = (id: string, newUrl: string) => {
    setImages(
      images.map((image) =>
        image.id === id ? { ...image, imageUrl: newUrl } : image
      )
    );
  };

  const handleUpdateImageLink = (id: string, newLink: string) => {
    setImages(
      images.map((image) =>
        image.id === id ? { ...image, link: newLink || undefined } : image
      )
    );
  };

  const handleSaveChanges = () => {
    // In a real app, this would save to a database
    toast({
      title: "Modifications enregistrées",
      description: "Les changements du slider ont été enregistrés avec succès",
    });
  };

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
                className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card"
              >
                <div className="w-full md:w-40 h-24 bg-muted rounded-md overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt="Slider preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`image-url-${image.id}`}>URL de l'image</Label>
                    <Input
                      id={`image-url-${image.id}`}
                      value={image.imageUrl}
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
                </div>
                <div className="flex gap-2 md:flex-col justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "up")}
                    disabled={image.order === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveImage(image.id, "down")}
                    disabled={image.order === images.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(image.id)}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-image-link">Lien (optionnel)</Label>
            <Input
              id="new-image-link"
              value={newImageLink}
              onChange={(e) => setNewImageLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <Button onClick={handleAddImage} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter l'image
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSaveChanges} className="w-full md:w-auto">
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default SliderManager;
