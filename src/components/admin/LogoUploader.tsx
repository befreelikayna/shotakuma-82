
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Upload, RefreshCw } from "lucide-react";

const LogoUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  
  // Fetch the current logo when component mounts
  React.useEffect(() => {
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
    
    try {
      const filePath = `logo_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
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
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="mb-2"
        />
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

export default LogoUploader;
