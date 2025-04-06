
import React, { useState, useEffect } from "react";
import { useThemeSettings, ThemeSettings } from "@/hooks/use-theme-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { customSupabase } from "@/integrations/supabase/client";

const ThemeManager = () => {
  const { settings, isLoading } = useThemeSettings();
  const [formValues, setFormValues] = useState<Partial<ThemeSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!settings?.id) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await customSupabase
        .from('theme_settings')
        .update({
          primary_color: formValues.primary_color,
          secondary_color: formValues.secondary_color,
          accent_color: formValues.accent_color,
          background_color: formValues.background_color,
          text_color: formValues.text_color,
          font_heading: formValues.font_heading,
          font_body: formValues.font_body,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);
      
      if (error) throw error;
      
      toast({
        title: "Thème mis à jour",
        description: "Les paramètres du thème ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres du thème",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement des paramètres...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Paramètres du Thème</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Couleurs</h3>
          
          <div className="space-y-2">
            <Label htmlFor="primary_color">Couleur Primaire</Label>
            <div className="flex gap-2">
              <Input 
                id="primary_color"
                name="primary_color"
                type="color"
                value={formValues.primary_color || '#3b82f6'}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text"
                value={formValues.primary_color || '#3b82f6'}
                onChange={handleInputChange}
                name="primary_color"
                className="flex-grow"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondary_color">Couleur Secondaire</Label>
            <div className="flex gap-2">
              <Input 
                id="secondary_color"
                name="secondary_color"
                type="color"
                value={formValues.secondary_color || '#6b7280'}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text"
                value={formValues.secondary_color || '#6b7280'}
                onChange={handleInputChange}
                name="secondary_color"
                className="flex-grow"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accent_color">Couleur d'Accent</Label>
            <div className="flex gap-2">
              <Input 
                id="accent_color"
                name="accent_color"
                type="color"
                value={formValues.accent_color || '#f97316'}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text"
                value={formValues.accent_color || '#f97316'}
                onChange={handleInputChange}
                name="accent_color"
                className="flex-grow"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Typographie</h3>
          
          <div className="space-y-2">
            <Label htmlFor="font_heading">Police des Titres</Label>
            <Input 
              id="font_heading"
              name="font_heading"
              value={formValues.font_heading || 'Inter'}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font_body">Police du Corps</Label>
            <Input 
              id="font_body"
              name="font_body"
              value={formValues.font_body || 'Inter'}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text_color">Couleur du Texte</Label>
            <div className="flex gap-2">
              <Input 
                id="text_color"
                name="text_color"
                type="color"
                value={formValues.text_color || '#111827'}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text"
                value={formValues.text_color || '#111827'}
                onChange={handleInputChange}
                name="text_color"
                className="flex-grow"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="text-md font-medium mb-2">Aperçu</h3>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="h-20 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: formValues.primary_color || '#3b82f6' }}
          >
            Couleur Primaire
          </div>
          <div 
            className="h-20 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: formValues.secondary_color || '#6b7280' }}
          >
            Couleur Secondaire
          </div>
          <div 
            className="h-20 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: formValues.accent_color || '#f97316' }}
          >
            Couleur d'Accent
          </div>
          <div 
            className="h-20 rounded border flex items-center justify-center"
            style={{ color: formValues.text_color || '#111827' }}
          >
            Couleur du Texte
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;
