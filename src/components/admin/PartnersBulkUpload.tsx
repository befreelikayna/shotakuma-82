import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { customSupabase, uploadFileToSupabase } from '@/integrations/supabase/client';
import { Upload, X } from "lucide-react";

interface PartnersBulkUploadProps {
  onComplete: () => void;
}

const PartnersBulkUpload = ({ onComplete }: PartnersBulkUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const selectedFiles = Array.from(e.target.files);
      
      // Filter to only accept image files
      const imageFiles = selectedFiles.filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length !== selectedFiles.length) {
        toast({
          title: "Fichiers non valides ignorés",
          description: "Seuls les fichiers d'image sont acceptés.",
          variant: "destructive",
        });
      }
      
      setFiles(imageFiles);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleClearFiles = () => {
    setFiles([]);
  };
  
  const handleBulkUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez sélectionner des fichiers à télécharger.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        
        // Upload the file to storage with correct parameters
        const logoUrl = await uploadFileToSupabase(file, "partners", `logos/${file.name}`);
        
        if (!logoUrl) {
          errorCount++;
          continue;
        }
        
        // Extract name from filename (remove extension)
        const fileName = file.name.split('.').slice(0, -1).join('.');
        const partnerName = fileName.replace(/_/g, ' ').replace(/-/g, ' ');
        
        // Create partner entry
        const { error } = await customSupabase
          .from('partners')
          .insert({
            name: partnerName,
            logo_url: logoUrl,
            category: 'sponsor',
            active: true,
            order_number: i,
            website_url: null // Set to null by default
          });
          
        if (error) {
          console.error('Error creating partner:', error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error('Error in bulk upload:', error);
        errorCount++;
      }
      
      // Update progress
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    setIsUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Téléchargement terminé",
        description: `${successCount} logo(s) téléchargé(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}.`,
        variant: errorCount > 0 ? "default" : "default",
      });
      setFiles([]);
      onComplete();
    } else {
      toast({
        title: "Échec du téléchargement",
        description: "Aucun logo n'a pu être téléchargé. Veuillez vérifier les fichiers et réessayer.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="border border-dashed rounded-lg p-4 mb-6 bg-gray-50">
      <h3 className="text-lg font-medium mb-3">Téléchargement en masse</h3>
      
      <div className="mb-4">
        <Input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="mb-2"
        />
        
        {files.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium mb-1">
              {files.length} fichier(s) sélectionné(s)
            </div>
            
            <div className="grid gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-white">
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center text-sm text-gray-700">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isUploading && (
        <Progress value={progress} className="h-2 mb-3" />
      )}
      
      <div className="flex gap-2">
        <Button 
          variant="default" 
          onClick={handleBulkUpload} 
          disabled={files.length === 0 || isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> 
          Télécharger {files.length > 0 && `(${files.length})`}
        </Button>
        
        {files.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearFiles}
            disabled={isUploading}
          >
            Effacer la sélection
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Note: Les noms des partenaires seront extraits des noms de fichiers.
      </p>
    </div>
  );
};

export default PartnersBulkUpload;
