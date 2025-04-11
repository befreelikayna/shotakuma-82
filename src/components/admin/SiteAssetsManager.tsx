
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Upload, RefreshCw, Image, FileType } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const SiteAssetsManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Gestion des Assets du Site</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Gérez le logo et le favicon de votre site web.
        </p>
      </div>
      
      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logo" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="favicon" className="flex items-center gap-1">
            <FileType className="h-4 w-4" />
            Favicon
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logo">
          <LogoUploader />
        </TabsContent>
        
        <TabsContent value="favicon">
          <FaviconUploader />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Logo Uploader Component
const LogoUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  
  // Fetch the current logo when component mounts
  useEffect(() => {
    fetchCurrentLogo();
  }, []);
  
  const fetchCurrentLogo = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('logos')
        .list('', {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.error('Error fetching logo:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(data[0].name);
        
        setCurrentLogo(publicUrl);
      }
    } catch (error) {
      console.error('Error in fetchCurrentLogo:', error);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez sélectionner un fichier à télécharger.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const filePath = `logo_${Date.now()}.${file.name.split('.').pop()}`;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      const { error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) {
        console.error('Error uploading logo:', error);
        toast({
          title: "Erreur",
          description: "Impossible de télécharger le logo: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      
      setCurrentLogo(publicUrl);
      
      toast({
        title: "Succès",
        description: "Logo téléchargé avec succès.",
      });
      
      // Reset file input
      setFile(null);
    } catch (error) {
      console.error('Error in handleUpload:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="border border-dashed rounded-lg p-4 mb-6 bg-gray-50">
      <h3 className="text-lg font-medium mb-3">Logo du Site</h3>
      
      {currentLogo && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <p className="text-sm text-gray-500 mb-2">Logo actuel:</p>
          <img 
            src={currentLogo} 
            alt="Logo actuel" 
            className="max-h-16 object-contain mb-2" 
          />
          <p className="text-xs text-gray-400 truncate">{currentLogo}</p>
        </div>
      )}
      
      <div className="mb-4">
        <Label htmlFor="logo-upload" className="mb-2 block">Télécharger un nouveau logo</Label>
        <Input 
          id="logo-upload"
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="mb-2"
        />
        
        {isUploading && (
          <div className="my-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center mt-1">{uploadProgress}%</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="default" 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> 
          {isUploading ? "Téléchargement..." : "Télécharger le Logo"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchCurrentLogo}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Note: Le logo sera automatiquement affiché sur le site après le téléchargement.
      </p>
    </div>
  );
};

// Favicon Uploader Component
const FaviconUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFavicon, setCurrentFavicon] = useState<string | null>(null);
  
  // Fetch the current favicon when component mounts
  useEffect(() => {
    fetchCurrentFavicon();
  }, []);
  
  const fetchCurrentFavicon = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('favicons')
        .list('', {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.error('Error fetching favicon:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('favicons')
          .getPublicUrl(data[0].name);
        
        setCurrentFavicon(publicUrl);
      }
    } catch (error) {
      console.error('Error in fetchCurrentFavicon:', error);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez sélectionner un fichier à télécharger.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const filePath = `favicon_${Date.now()}.${file.name.split('.').pop()}`;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      const { error } = await supabase.storage
        .from('favicons')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) {
        console.error('Error uploading favicon:', error);
        toast({
          title: "Erreur",
          description: "Impossible de télécharger le favicon: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('favicons')
        .getPublicUrl(filePath);
      
      setCurrentFavicon(publicUrl);
      
      // Update the favicon in the document
      updateDocumentFavicon(publicUrl);
      
      toast({
        title: "Succès",
        description: "Favicon téléchargé avec succès.",
      });
      
      // Reset file input
      setFile(null);
    } catch (error) {
      console.error('Error in handleUpload:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to update the favicon in the document
  const updateDocumentFavicon = (faviconUrl: string) => {
    // Find existing favicon link or create a new one
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Update the href
    link.href = faviconUrl;
    
    // Try to determine the type based on the file extension
    const extension = faviconUrl.split('.').pop()?.toLowerCase();
    if (extension === 'png') {
      link.type = 'image/png';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      link.type = 'image/jpeg';
    } else if (extension === 'svg') {
      link.type = 'image/svg+xml';
    } else {
      link.type = 'image/x-icon';
    }
  };
  
  return (
    <div className="border border-dashed rounded-lg p-4 mb-6 bg-gray-50">
      <h3 className="text-lg font-medium mb-3">Favicon du Site</h3>
      
      {currentFavicon && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <p className="text-sm text-gray-500 mb-2">Favicon actuel:</p>
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={currentFavicon} 
              alt="Favicon actuel" 
              className="h-8 w-8 object-contain" 
            />
            <p className="text-sm">Aperçu du favicon (taille réelle)</p>
          </div>
          <p className="text-xs text-gray-400 truncate">{currentFavicon}</p>
        </div>
      )}
      
      <div className="mb-4">
        <Label htmlFor="favicon-upload" className="mb-2 block">Télécharger un nouveau favicon</Label>
        <Input 
          id="favicon-upload"
          type="file" 
          accept="image/png,image/jpeg,image/svg+xml" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="mb-2"
        />
        <p className="text-xs text-amber-600">
          Note: Lovable ne prend pas en charge les fichiers .ico. Veuillez télécharger une image PNG, JPG ou SVG.
        </p>
        
        {isUploading && (
          <div className="my-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center mt-1">{uploadProgress}%</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="default" 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> 
          {isUploading ? "Téléchargement..." : "Télécharger le Favicon"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchCurrentFavicon}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Qu'est-ce qu'un favicon?</h4>
        <p className="text-xs text-gray-500">
          Le favicon est la petite icône qui apparaît dans les onglets du navigateur, dans les favoris et dans les résultats de recherche.
          Pour un meilleur résultat, utilisez une image carrée simple, idéalement de 32x32 pixels ou plus.
        </p>
      </div>
    </div>
  );
};

export default SiteAssetsManager;
