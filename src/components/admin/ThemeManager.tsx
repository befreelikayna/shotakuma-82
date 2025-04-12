
import React, { useState, useEffect } from "react";
import { useThemeSettings, ThemeSettings } from "@/hooks/use-theme-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Save, CheckCircle2, PaintBucket, Palette } from "lucide-react";
import { customSupabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Theme presets based on the provided images
const themePresets = {
  default: {
    name: "Default SHOTAKU",
    primary_color: "#050F2C",
    secondary_color: "#2E3A59",
    accent_color: "#FF5370",
    background_color: "#FFFFFF",
    text_color: "#111827",
    font_heading: "Montserrat",
    font_body: "Plus Jakarta Sans",
    description: "Le thème par défaut de SHOTAKU avec des tons bleu foncé et rose.",
    preview_img: "/lovable-uploads/033dc11d-ce6a-468c-8da7-e4d60a1611bc.png",
  },
  cosmic: {
    name: "Cosmos Violet",
    primary_color: "#2B0B98",
    secondary_color: "#6B46C1",
    accent_color: "#D53F8C",
    background_color: "#03050F",
    text_color: "#FFFFFF",
    font_heading: "Montserrat",
    font_body: "Plus Jakarta Sans",
    description: "Un thème cosmique avec des tons violets et des étoiles brillantes.",
    preview_img: "/lovable-uploads/e1622249-db1a-4504-a1f6-84134f9596ba.png",
  },
  sunrise: {
    name: "Sunrise Festival",
    primary_color: "#FC8181",
    secondary_color: "#F6AD55", 
    accent_color: "#F56565",
    background_color: "#7A5197",
    text_color: "#FFFFFF",
    font_heading: "Montserrat",
    font_body: "Plus Jakarta Sans",
    description: "Une palette chaude inspirée d'un lever de soleil sur le désert marocain.",
    preview_img: "/lovable-uploads/95e4a390-2521-448c-92e8-e91a5fe0dc83.png",
  },
  bluesky: {
    name: "Ciel Bleu",
    primary_color: "#4299E1",
    secondary_color: "#667EEA",
    accent_color: "#FEB2B2",
    background_color: "#EBF8FF",
    text_color: "#2D3748",
    font_heading: "Montserrat",
    font_body: "Plus Jakarta Sans",
    description: "Un thème frais avec des bleus clairs et lumineux.",
    preview_img: "/lovable-uploads/4b2e3443-7b43-4c0e-b1e3-6874a9c4e56e.png",
  }
};

const ThemeManager = () => {
  const { settings, isLoading } = useThemeSettings();
  const [formValues, setFormValues] = useState<Partial<ThemeSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("custom");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
      
      // Try to determine if current settings match a preset
      const currentTheme = Object.entries(themePresets).find(([_, preset]) => 
        preset.primary_color === settings.primary_color &&
        preset.secondary_color === settings.secondary_color &&
        preset.accent_color === settings.accent_color
      );
      
      if (currentTheme) {
        setSelectedPreset(currentTheme[0]);
      } else {
        setSelectedPreset("");
      }
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
  
  const applyThemePreset = (presetKey: string) => {
    const preset = themePresets[presetKey as keyof typeof themePresets];
    if (!preset) return;
    
    setFormValues({
      ...formValues,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      background_color: preset.background_color,
      text_color: preset.text_color,
      font_heading: preset.font_heading,
      font_body: preset.font_body,
    });
    
    setSelectedPreset(presetKey);
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thèmes Prédéfinis
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            Personnalisation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez un thème prédéfini pour l'appliquer à votre site. Vous pourrez ensuite le personnaliser davantage si nécessaire.
          </p>
          
          <RadioGroup value={selectedPreset} onValueChange={applyThemePreset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(themePresets).map(([key, theme]) => (
              <div key={key} className="relative">
                <RadioGroupItem value={key} id={`theme-${key}`} className="peer sr-only" />
                <Label
                  htmlFor={`theme-${key}`}
                  className="flex flex-col h-full border-2 rounded-xl p-4 cursor-pointer hover:bg-accent/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent/10"
                >
                  <div className="h-40 overflow-hidden rounded-lg mb-3 relative">
                    <img 
                      src={theme.preview_img} 
                      alt={theme.name} 
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 opacity-50"
                      style={{ backgroundColor: theme.primary_color }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{theme.name}</h3>
                    {selectedPreset === key && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: theme.primary_color }}></div>
                    <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: theme.secondary_color }}></div>
                    <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: theme.accent_color }}></div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-end mt-6">
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
                  Appliquer le thème
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6 mt-4">
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="text-md font-medium mb-4">Aperçu</h3>
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
