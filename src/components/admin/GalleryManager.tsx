
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Plus, Image, Video, RefreshCw } from "lucide-react";
// Import supabase client (commented out until gallery_items table is created)
// import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: "cosplay" | "event" | "artwork" | "guests";
  type: "image" | "video";
}

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    { id: "1", src: "https://source.unsplash.com/random/800x600?anime", alt: "Cosplay competition", category: "cosplay", type: "image" },
    { id: "2", src: "https://source.unsplash.com/random/800x600?manga", alt: "Main stage performance", category: "event", type: "image" },
    { id: "3", src: "https://source.unsplash.com/random/800x600?japan", alt: "Manga exhibition", category: "artwork", type: "image" },
  ]);

  const [newItem, setNewItem] = useState({
    src: "",
    alt: "",
    category: "cosplay" as "cosplay" | "event" | "artwork" | "guests",
    type: "image" as "image" | "video"
  });

  const [isLoading, setIsLoading] = useState(false);

  // Future function for fetching gallery items from Supabase
  /* 
  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les éléments de la galerie",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setGalleryItems(data);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Uncomment when the gallery_items table is created
  useEffect(() => {
    fetchGalleryItems();
    
    // Set up a realtime subscription 
    const channel = supabase
      .channel('admin:gallery')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_items' }, 
        () => {
          fetchGalleryItems();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  */

  const handleAddItem = () => {
    if (!newItem.src || !newItem.alt) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Future Supabase implementation
    /*
    try {
      setIsLoading(true);
      
      await supabase
        .from('gallery_items')
        .insert([{
          src: newItem.src,
          alt: newItem.alt,
          category: newItem.category,
          type: newItem.type
        }]);
      
      // Data will refresh automatically via the subscription
      
      setNewItem({
        src: "",
        alt: "",
        category: "cosplay",
        type: "image"
      });
      
      toast({
        title: "Succès",
        description: "L'élément a été ajouté à la galerie."
      });
    } catch (error) {
      console.error('Error adding gallery item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'élément à la galerie",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    */

    // For now, use local state
    const newId = Date.now().toString();
    setGalleryItems([...galleryItems, { ...newItem, id: newId }]);
    
    setNewItem({
      src: "",
      alt: "",
      category: "cosplay",
      type: "image"
    });

    toast({
      title: "Succès",
      description: "L'élément a été ajouté à la galerie."
    });
  };

  const handleDeleteItem = (id: string) => {
    // Future Supabase implementation
    /*
    try {
      await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);
      
      // Data will refresh automatically via the subscription
      
      toast({
        title: "Supprimé",
        description: "L'élément a été supprimé de la galerie."
      });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément de la galerie",
        variant: "destructive",
      });
    }
    */
    
    // For now, use local state
    setGalleryItems(galleryItems.filter(item => item.id !== id));
    toast({
      title: "Supprimé",
      description: "L'élément a été supprimé de la galerie."
    });
  };

  const handleRefresh = () => {
    // Future implementation will call fetchGalleryItems()
    toast({
      title: "Actualisé",
      description: "Les données ont été actualisées."
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion de la Galerie</h2>
      
      <div className="flex justify-end mb-4">
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
      
      <div className="bg-slate-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-festival-primary mb-4">Ajouter un nouveau contenu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <Input
              value={newItem.src}
              onChange={(e) => setNewItem({ ...newItem, src: e.target.value })}
              placeholder="URL de l'image ou vidéo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input
              value={newItem.alt}
              onChange={(e) => setNewItem({ ...newItem, alt: e.target.value })}
              placeholder="Description du contenu"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <Select
              value={newItem.category}
              onValueChange={(value: "cosplay" | "event" | "artwork" | "guests") => 
                setNewItem({ ...newItem, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cosplay">Cosplay</SelectItem>
                <SelectItem value="event">Événements</SelectItem>
                <SelectItem value="artwork">Œuvres d'art</SelectItem>
                <SelectItem value="guests">Invités</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select
              value={newItem.type}
              onValueChange={(value: "image" | "video") => 
                setNewItem({ ...newItem, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleAddItem}
          className="bg-festival-accent text-white flex items-center gap-2"
        >
          <Plus size={16} /> Ajouter
        </Button>
      </div>
      
      <h3 className="text-lg font-medium text-festival-primary mb-4">Contenu actuel ({galleryItems.length})</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aperçu</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {galleryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="w-20 h-20 relative overflow-hidden rounded-md">
                    {item.type === "image" ? (
                      <img 
                        src={item.src} 
                        alt={item.alt} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Video size={24} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.alt}</TableCell>
                <TableCell>
                  <span className="capitalize">{item.category}</span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {item.type === "image" ? <Image size={16} /> : <Video size={16} />}
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2 h-auto"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GalleryManager;
