
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import DiscordIcon from "@/components/icons/DiscordIcon";

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

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setEditForm({ title: link.title, url: link.url });
  };

  const handleSave = () => {
    if (!editForm.url) {
      toast({
        title: "Erreur",
        description: "L'URL ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    setSocialLinks(
      socialLinks.map((link) =>
        link.id === editingId ? { ...link, title: editForm.title, url: editForm.url } : link
      )
    );
    
    setEditingId(null);
    toast({
      title: "Succès",
      description: "Le lien social a été mis à jour."
    });
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
                    <Button onClick={handleSave} size="sm" className="bg-green-500 text-white">
                      Enregistrer
                    </Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
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
