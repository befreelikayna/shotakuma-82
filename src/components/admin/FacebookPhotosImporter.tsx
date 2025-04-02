
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFacebookPhotos } from "@/hooks/use-facebook-photos";
import { useGalleryItems } from "@/hooks/use-gallery-items";

const FacebookPhotosImporter = () => {
  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("OTAKU.sho");
  const [selectedPhotos, setSelectedPhotos] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState<Record<string, boolean>>({});
  
  const { photos, isLoading, error, fetchPhotos } = useFacebookPhotos(pageId);
  const { addImagesFromUrls } = useGalleryItems();

  const handleFetchPhotos = async () => {
    if (!accessToken) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un token d'accès Facebook",
        variant: "destructive",
      });
      return;
    }

    // Store token temporarily in localStorage or use a context
    // This is not secure for production, but works for demo
    localStorage.setItem('fb_access_token', accessToken);
    
    await fetchPhotos();
  };

  const toggleSelectPhoto = (photoId: string) => {
    setSelectedPhotos(prev => ({
      ...prev,
      [photoId]: !prev[photoId]
    }));
  };

  const selectAllPhotos = () => {
    const allSelected = photos.reduce((acc, photo) => {
      acc[photo.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setSelectedPhotos(allSelected);
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos({});
  };

  const importSelectedPhotos = async () => {
    const selectedIds = Object.entries(selectedPhotos)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (selectedIds.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins une photo à importer",
      });
      return;
    }
    
    // Find the photos to import and get their URLs
    const photosToImport = photos.filter(photo => selectedIds.includes(photo.id));
    const photoUrls = photosToImport.map(photo => photo.source);
    
    try {
      // Mark all as importing
      const importingState = selectedIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setImporting(importingState);
      
      // Use our hook to add images in bulk
      const result = await addImagesFromUrls(
        photoUrls, 
        'event', 
        'Photo importée de Facebook'
      );
      
      if (result?.success) {
        setSelectedPhotos({});
      }
    } finally {
      setImporting({});
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-lg mb-8">
      <h3 className="text-lg font-medium text-festival-primary mb-4">Importer des photos depuis Facebook</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID de la page</label>
          <Input
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="OTAKU.sho"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token d'accès</label>
          <Input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Token d'accès Facebook"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <Button 
          onClick={handleFetchPhotos}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
              Chargement...
            </>
          ) : (
            "Charger les photos"
          )}
        </Button>
        
        {photos.length > 0 && (
          <>
            <Button 
              onClick={selectAllPhotos} 
              variant="outline"
            >
              Tout sélectionner
            </Button>
            <Button 
              onClick={deselectAllPhotos} 
              variant="outline"
            >
              Tout désélectionner
            </Button>
            <Button 
              onClick={importSelectedPhotos} 
              className="bg-festival-accent text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Importer la sélection
            </Button>
          </>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className={`relative rounded-lg overflow-hidden border-2 ${selectedPhotos[photo.id] ? 'border-festival-accent' : 'border-transparent'}`}
            onClick={() => toggleSelectPhoto(photo.id)}
          >
            <img 
              src={photo.source} 
              alt={photo.name || "Facebook photo"}
              className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
            />
            
            {selectedPhotos[photo.id] && (
              <div className="absolute top-2 right-2 bg-festival-accent text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            {importing[photo.id] && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs truncate">
              {photo.name || "Sans titre"}
            </div>
          </div>
        ))}
        
        {isLoading && [...Array(10)].map((_, i) => (
          <div key={`skeleton-${i}`} className="bg-slate-200 animate-pulse h-40 rounded-lg" />
        ))}
        
        {!isLoading && photos.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            {error ? (
              <p>Une erreur est survenue lors du chargement des photos.</p>
            ) : (
              <p>Aucune photo trouvée. Veuillez vérifier l'ID de la page et le token d'accès.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookPhotosImporter;
