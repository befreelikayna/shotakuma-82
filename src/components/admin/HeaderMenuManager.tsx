
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle, Check, X, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface SubMenuItem {
  id: string;
  title: string;
  url: string;
  order_number: number;
}

interface HeaderLink {
  id: string;
  title: string;
  url: string;
  order_number: number;
  is_active: boolean;
  submenu?: SubMenuItem[];
}

const HeaderMenuManager = () => {
  const [links, setLinks] = useState<HeaderLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentLink, setCurrentLink] = useState<HeaderLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmenu, setFormSubmenu] = useState<SubMenuItem[]>([]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("header_menu_links")
        .select("*")
        .order("order_number");

      if (error) throw error;
      
      if (data) {
        const parsedLinks = data.map(link => {
          const submenuData = link.submenu ? 
            (typeof link.submenu === 'string' ? JSON.parse(link.submenu) : link.submenu) as SubMenuItem[] 
            : undefined;
          
          return {
            ...link,
            submenu: submenuData
          };
        });
        setLinks(parsedLinks);
      }
    } catch (error) {
      console.error("Error fetching header links:", error);
      toast.error("Failed to load header links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenDialog = (link: HeaderLink | null = null) => {
    if (link) {
      setCurrentLink(link);
      setFormTitle(link.title);
      setFormUrl(link.url);
      setFormIsActive(link.is_active);
      setFormSubmenu(link.submenu || []);
      setIsCreating(false);
    } else {
      setCurrentLink(null);
      setFormTitle("");
      setFormUrl("");
      setFormIsActive(true);
      setFormSubmenu([]);
      setIsCreating(true);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setCurrentLink(null);
    setErrorMessage(null);
  };

  const handleAddSubmenuItem = () => {
    setFormSubmenu([
      ...formSubmenu,
      {
        id: crypto.randomUUID(),
        title: "",
        url: "",
        order_number: formSubmenu.length
      }
    ]);
  };

  const handleUpdateSubmenuItem = (index: number, field: keyof SubMenuItem, value: string) => {
    const newSubmenu = [...formSubmenu];
    newSubmenu[index] = { ...newSubmenu[index], [field]: value };
    setFormSubmenu(newSubmenu);
  };

  const handleRemoveSubmenuItem = (index: number) => {
    setFormSubmenu(formSubmenu.filter((_, i) => i !== index));
  };

  const handleSaveLink = async () => {
    if (!formTitle.trim() || !formUrl.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    const validSubmenu = formSubmenu.filter(item => item.title.trim() && item.url.trim());
    const hasInvalidSubmenuItems = formSubmenu.length > 0 && validSubmenu.length !== formSubmenu.length;
    
    if (hasInvalidSubmenuItems) {
      toast.error("All submenu items must have a title and URL");
      return;
    }

    setLoading(true);
    try {
      const processedSubmenu = validSubmenu.map((item, index) => ({
        ...item,
        order_number: index,
      }));

      const submenuForDb = processedSubmenu.length > 0 ? processedSubmenu : null;

      const linkData = {
        title: formTitle,
        url: formUrl,
        is_active: formIsActive,
        submenu: submenuForDb
      };

      if (isCreating) {
        const newOrderNumber = links.length > 0 
          ? Math.max(...links.map(link => link.order_number)) + 1 
          : 1;

        // Insert through RPC function to bypass RLS if available, otherwise use regular insert
        try {
          // First try regular insert in case RLS is configured
          const { error } = await supabase
            .from("header_menu_links")
            .insert({
              ...linkData,
              order_number: newOrderNumber
            });

          if (error) {
            throw error;
          }
          toast.success("Link added successfully");
        } catch (insertError: any) {
          console.error("Insert error:", insertError);
          setErrorMessage(`Unable to add menu item. Make sure you have proper permissions or contact your administrator. Error: ${insertError.message}`);
          setLoading(false);
          return;
        }
      } else if (currentLink) {
        try {
          const { error } = await supabase
            .from("header_menu_links")
            .update(linkData)
            .eq('id', currentLink.id);

          if (error) {
            throw error;
          }
          toast.success("Link updated successfully");
        } catch (updateError: any) {
          console.error("Update error:", updateError);
          setErrorMessage(`Unable to update menu item. Make sure you have proper permissions or contact your administrator. Error: ${updateError.message}`);
          setLoading(false);
          return;
        }
      }

      handleCloseDialog();
      fetchLinks();
    } catch (error: any) {
      console.error("Error saving header link:", error);
      setErrorMessage(`Failed to save header link: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("header_menu_links")
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Link deleted successfully");
      fetchLinks();
    } catch (error: any) {
      console.error("Error deleting header link:", error);
      toast.error(`Failed to delete header link: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderLink = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex(link => link.id === id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    
    if (direction === 'down' && currentIndex === links.length - 1) return;

    const newLinks = [...links];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    const tempOrderNumber = newLinks[currentIndex].order_number;
    newLinks[currentIndex].order_number = newLinks[swapIndex].order_number;
    newLinks[swapIndex].order_number = tempOrderNumber;

    [newLinks[currentIndex], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[currentIndex]];
    
    setLoading(true);
    try {
      const updates = [
        {
          id: newLinks[currentIndex].id,
          order_number: newLinks[currentIndex].order_number
        },
        {
          id: newLinks[swapIndex].id,
          order_number: newLinks[swapIndex].order_number
        }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from("header_menu_links")
          .update({ order_number: update.order_number })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      setLinks(newLinks);
      toast.success("Menu order updated");
    } catch (error) {
      console.error("Error reordering menu links:", error);
      toast.error("Failed to reorder menu links");
      fetchLinks();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("header_menu_links")
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setLinks(links.map(link => 
        link.id === id ? { ...link, is_active: !currentStatus } : link
      ));
      
      toast.success(`Link ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error toggling link status:", error);
      toast.error("Failed to update link status");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitialMenu = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const initialLinks = [
        { title: 'Accueil', url: '/', order_number: 0 },
        { title: 'À propos', url: '/about', order_number: 1 },
        { title: 'Programme', url: '/schedule', order_number: 2 },
        { title: 'Galerie', url: '/gallery', order_number: 3 },
        { title: 'Événements', url: '/events', order_number: 4 },
        { title: 'Bénévoles', url: '/volunteer', order_number: 5 },
        { title: 'Contact', url: '/contact', order_number: 6 },
        { title: 'Billets', url: '/tickets', order_number: 7 },
        { title: 'Stands', url: '/stands', order_number: 8 },
        { title: 'Accès', url: '/access', order_number: 9 },
      ];

      // Insert links individually to better handle errors
      for (const link of initialLinks) {
        const { error } = await supabase
          .from('header_menu_links')
          .insert({
            ...link,
            is_active: true,
          });

        if (error) {
          console.error('Error inserting menu item:', error);
          throw error;
        }
      }

      toast.success("Menu initial créé");
      fetchLinks();
    } catch (error: any) {
      console.error('Error creating initial menu:', error);
      setErrorMessage(`Impossible de créer le menu initial. Erreur: ${error.message || error}`);
      toast.error("Impossible de créer le menu initial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Menu Navigation</CardTitle>
            <CardDescription>
              Gérez les liens qui apparaissent dans la barre de navigation
            </CardDescription>
          </div>
          {links.length > 0 && (
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-festival-accent hover:bg-festival-accent/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un lien
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {loading && links.length === 0 ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Chargement des liens...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="pt-6 text-center">
            <p className="text-muted-foreground mb-6">Aucun lien n'a été ajouté au menu</p>
            <div className="flex flex-col gap-4 items-center">
              <Button onClick={handleCreateInitialMenu} className="bg-festival-accent hover:bg-festival-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Initialiser le menu avec les pages existantes
              </Button>
              <span className="text-sm text-muted-foreground">ou</span>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un lien manuellement
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-center">Actif</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    {link.title}
                    {link.submenu && link.submenu.length > 0 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {link.submenu.length} sous-menu{link.submenu.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      {link.url}
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={`Voir ${link.title}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={() => handleToggleActive(link.id, link.is_active)}
                      disabled={loading}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReorderLink(link.id, 'up')}
                        disabled={loading}
                        title="Move Up"
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReorderLink(link.id, 'down')}
                        disabled={loading}
                        title="Move Down"
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDialog(link)}
                        disabled={loading}
                        title="Edit Link"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Ajouter un nouveau lien' : 'Modifier le lien'}</DialogTitle>
              <DialogDescription>
                {isCreating 
                  ? 'Ajoutez un nouveau lien à la barre de navigation'
                  : 'Modifiez les détails du lien existant'}
              </DialogDescription>
            </DialogHeader>

            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Accueil, À propos, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="/about, /events, etc."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="active">Afficher dans le menu</Label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sous-menu (optionnel)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubmenuItem}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Ajouter un sous-menu
                  </Button>
                </div>

                {formSubmenu.map((item, index) => (
                  <div key={item.id} className="space-y-2 p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSubmenuItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor={`submenu-title-${index}`}>Titre du sous-menu</Label>
                      <Input
                        id={`submenu-title-${index}`}
                        value={item.title}
                        onChange={(e) => handleUpdateSubmenuItem(index, 'title', e.target.value)}
                        placeholder="Titre du sous-menu"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`submenu-url-${index}`}>URL du sous-menu</Label>
                      <Input
                        id={`submenu-url-${index}`}
                        value={item.url}
                        onChange={(e) => handleUpdateSubmenuItem(index, 'url', e.target.value)}
                        placeholder="/sous-menu-url"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading}>
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button onClick={handleSaveLink} disabled={loading}>
                <Check className="mr-2 h-4 w-4" /> {isCreating ? 'Ajouter' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HeaderMenuManager;
