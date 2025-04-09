
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Save, Plus } from 'lucide-react';
import { customSupabase } from '@/integrations/supabase/client';
import { GeneralContent, useGeneralContent } from '@/hooks/use-general-content';

const GeneralContentEditor = () => {
  const [contentItems, setContentItems] = useState<GeneralContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [newSectionKey, setNewSectionKey] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await customSupabase
        .from('general_content')
        .select('*')
        .order('section_key');
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        // Type-safe conversion of data
        const typedContent: GeneralContent[] = data.map(item => {
          const typedItem = item as any;
          return {
            id: typedItem.id || '',
            section_key: typedItem.section_key || '',
            title: typedItem.title || null,
            subtitle: typedItem.subtitle || null,
            content: typedItem.content || null,
            image_url: typedItem.image_url || null
          };
        });
        
        setContentItems(typedContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le contenu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContent();
    
    // Set up real-time subscription
    const channel = customSupabase
      .channel('general-content-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'general_content'
      }, () => {
        fetchContent();
      })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  const handleInputChange = (id: string, field: keyof GeneralContent, value: string) => {
    setContentItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleSave = async (id: string) => {
    const item = contentItems.find(item => item.id === id);
    if (!item) return;
    
    setIsSaving(id);
    
    try {
      const { error } = await customSupabase
        .from('general_content')
        .update({
          title: item.title,
          subtitle: item.subtitle,
          content: item.content,
          image_url: item.image_url
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Contenu mis à jour',
        description: `Le contenu "${item.section_key}" a été mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le contenu',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(null);
    }
  };
  
  const handleAddNew = async () => {
    if (!newSectionKey.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une clé de section',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAddingNew(true);
    
    try {
      const { data, error } = await customSupabase
        .from('general_content')
        .insert({
          section_key: newSectionKey.trim(),
          title: 'Nouveau titre',
          subtitle: 'Nouveau sous-titre',
          content: 'Contenu ici...'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setNewSectionKey('');
      
      toast({
        title: 'Section ajoutée',
        description: `La section "${newSectionKey}" a été ajoutée avec succès`,
      });
      
      // Fetch updated content
      fetchContent();
    } catch (error) {
      console.error('Error adding content:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la section',
        variant: 'destructive',
      });
    } finally {
      setIsAddingNew(false);
    }
  };
  
  const handleRefresh = () => {
    fetchContent();
    toast({
      title: 'Actualisé',
      description: 'Le contenu a été actualisé',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement du contenu...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contenu Général</h2>
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
      
      <div className="flex gap-2 items-end">
        <div className="space-y-2 flex-grow">
          <Label htmlFor="new-section-key">Ajouter une nouvelle section</Label>
          <Input 
            id="new-section-key" 
            placeholder="Clé de section (ex: hero, about, features)" 
            value={newSectionKey}
            onChange={(e) => setNewSectionKey(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAddNew} 
          disabled={isAddingNew || !newSectionKey.trim()}
          className="flex items-center gap-2"
        >
          {isAddingNew ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ajout...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Ajouter
            </>
          )}
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-8">
        {contentItems.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-md p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Section: {item.section_key}</h3>
              <Button 
                onClick={() => handleSave(item.id)} 
                disabled={isSaving === item.id}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isSaving === item.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${item.id}`}>Titre</Label>
                <Input 
                  id={`title-${item.id}`}
                  value={item.title || ''}
                  onChange={(e) => handleInputChange(item.id, 'title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`subtitle-${item.id}`}>Sous-titre</Label>
                <Input 
                  id={`subtitle-${item.id}`}
                  value={item.subtitle || ''}
                  onChange={(e) => handleInputChange(item.id, 'subtitle', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`content-${item.id}`}>Contenu</Label>
              <Textarea 
                id={`content-${item.id}`}
                value={item.content || ''}
                onChange={(e) => handleInputChange(item.id, 'content', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`image-${item.id}`}>URL de l'image</Label>
              <Input 
                id={`image-${item.id}`}
                value={item.image_url || ''}
                onChange={(e) => handleInputChange(item.id, 'image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        ))}
        
        {contentItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun contenu général n'a été créé. Utilisez le formulaire ci-dessus pour ajouter du contenu.
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralContentEditor;
