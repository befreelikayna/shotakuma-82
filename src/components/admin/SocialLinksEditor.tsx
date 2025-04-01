
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Instagram, Facebook, Youtube, Twitter, Loader2, RefreshCw } from "lucide-react";
import DiscordIcon from "@/components/icons/DiscordIcon";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

const SocialLinksEditor = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: "1", title: "Instagram", url: "https://www.instagram.com/shotakume/", icon: "instagram" },
    { id: "2", title: "Facebook", url: "https://facebook.com/OTAKU.sho", icon: "facebook" },
    { id: "3", title: "Youtube", url: "https://www.youtube.com/@MarocEvents", icon: "youtube" },
    { id: "4", title: "Twitter", url: "https://x.com/shotakume", icon: "twitter" },
    { id: "5", title: "Discord", url: "https://discord.gg/KKGCF86z", icon: "discord" },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In the future, when a social links table is created in Supabase,
  // enable this code to fetch from database
  useEffect(() => {
    /*
    // When social_links table is created in Supabase, uncomment this code
    const fetchSocialLinks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('social_links')
          .select('*')
          .order('id');
        
        if (error) {
          console.error('Error fetching social links:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les liens sociaux",
            variant: "destructive",
          });
          return;
        }
        
        if (data && data.length > 0) {
          setSocialLinks(data);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSocialLinks();
    
    // Set up a realtime subscription for social_links table
    const channel = supabase
      .channel('admin:social_links')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'social_links' }, 
        () => {
          console.log('Social links changed, refreshing...');
          fetchSocialLinks();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    }; 
    */
  }, []);

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setEditForm({ title: link.title, url: link.url });
  };

  const handleSave = async () => {
    if (!editForm.url) {
      toast({
        title: "Erreur",
        description: "L'URL ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save to state (for now)
      // In the future, when the social_links table is created, this will be replaced
      // with a Supabase call
      setSocialLinks(
        socialLinks.map((link) =>
          link.id === editingId ? { ...link, title: editForm.title, url: editForm.url } : link
        )
      );
      
      /*
      // When social_links table is created, uncomment this code
      const { error } = await supabase
        .from('social_links')
        .update({ 
          title: editForm.title, 
          url: editForm.url 
        })
        .eq('id', editingId);
      
      if (error) {
        throw error;
      }
      */
      
      toast({
        title: "Succès",
        description: "Le lien social a été mis à jour."
      });
      
      setEditingId(null);
    } catch (error) {
      console.error("Error saving social link:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du lien social",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "instagram":
        return <Instagram size={20} className="text-pink-500" />;
      case "facebook":
        return <Facebook size={20} className="text-blue-600" />;
      case "youtube":
        return <Youtube size={20} className="text-red-600" />;
      case "twitter":
        return <Twitter size={20} className="text-blue-400" />;
      case "discord":
        return <DiscordIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion des Liens Sociaux</h2>
      
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Modifiez les liens vers vos réseaux sociaux.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="mb-4"
          onClick={() => {
            // In the future when the table is created, this will refresh the data
            toast({
              title: "Actualisé",
              description: "Les liens sociaux ont été actualisés."
            });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réseau</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {socialLinks.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {renderIcon(link.icon)}
                  {link.title}
                </div>
              </TableCell>
              <TableCell>
                {editingId === link.id ? (
                  <Input
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  />
                ) : (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.url}
                  </a>
                )}
              </TableCell>
              <TableCell>
                {editingId === link.id ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-green-500 text-white" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Enregistrer"
                      )}
                    </Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="outline" disabled={isSaving}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleEdit(link)} size="sm" variant="outline">
                    Modifier
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SocialLinksEditor;
