
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, MoveUp, MoveDown, ExternalLink } from "lucide-react";
import { customSupabase, Partner, safeDataAccess } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PartnerFormData = {
  id?: string;
  name: string;
  logo_url: string;
  website_url: string;
  order_number: number;
  active: boolean;
  category: string;
};

const PartnersManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<PartnerFormData>({
    name: '',
    logo_url: '',
    website_url: '',
    order_number: 0,
    active: true,
    category: 'sponsor'
  });
  
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await customSupabase
        .from('partners')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        const partnersData: Partner[] = data.map(item => ({
          id: safeDataAccess(item?.id, ''),
          name: safeDataAccess(item?.name, ''),
          logo_url: safeDataAccess(item?.logo_url, ''),
          website_url: item?.website_url ? String(item.website_url) : null,
          order_number: safeDataAccess(item?.order_number, 0),
          active: safeDataAccess(item?.active, true),
          category: item?.category ? String(item.category) : null,
        }));
        
        setPartners(partnersData);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les partenaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPartners();
    
    const channel = customSupabase
      .channel('admin-partners-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'partners' }, 
        (payload) => {
          console.log('Partners changed:', payload);
          fetchPartners();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  const handleAddPartner = () => {
    setCurrentPartner({
      name: '',
      logo_url: '',
      website_url: '',
      order_number: partners.length > 0 ? Math.max(...partners.map(p => p.order_number)) + 1 : 1,
      active: true,
      category: 'sponsor'
    });
    setFormOpen(true);
  };
  
  const handleEditPartner = (partner: Partner) => {
    setCurrentPartner({
      id: partner.id,
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      order_number: partner.order_number,
      active: partner.active,
      category: partner.category || ''
    });
    setFormOpen(true);
  };
  
  const handleDeletePartner = (partner: Partner) => {
    setCurrentPartner({
      id: partner.id,
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      order_number: partner.order_number,
      active: partner.active,
      category: partner.category || ''
    });
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!currentPartner.id) return;
    
    try {
      const { error } = await customSupabase
        .from('partners')
        .delete()
        .eq('id', currentPartner.id);
      
      if (error) throw error;
      
      toast({
        title: "Supprimé",
        description: "Le partenaire a été supprimé avec succès",
      });
      
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le partenaire",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentPartner.name.trim() || !currentPartner.logo_url.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom et l'URL du logo sont requis",
          variant: "destructive",
        });
        return;
      }
      
      const partnerData = {
        name: currentPartner.name.trim(),
        logo_url: currentPartner.logo_url.trim(),
        website_url: currentPartner.website_url.trim() || null,
        order_number: currentPartner.order_number,
        active: currentPartner.active,
        category: currentPartner.category.trim() || null
      };
      
      let result;
      
      if (currentPartner.id) {
        result = await customSupabase
          .from('partners')
          .update(partnerData)
          .eq('id', currentPartner.id);
      } else {
        result = await customSupabase
          .from('partners')
          .insert(partnerData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: currentPartner.id ? "Mise à jour réussie" : "Ajout réussi",
        description: currentPartner.id 
          ? "Le partenaire a été mis à jour avec succès" 
          : "Le nouveau partenaire a été ajouté avec succès",
      });
      
      setFormOpen(false);
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le partenaire",
        variant: "destructive",
      });
    }
  };
  
  const movePartner = async (partner: Partner, direction: 'up' | 'down') => {
    const currentIndex = partners.findIndex(p => p.id === partner.id);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === partners.length - 1)) {
      return;
    }
    
    const swapWith = partners[direction === 'up' ? currentIndex - 1 : currentIndex + 1];
    
    try {
      const { error: error1 } = await customSupabase
        .from('partners')
        .update({ order_number: swapWith.order_number })
        .eq('id', partner.id);
      
      if (error1) throw error1;
      
      const { error: error2 } = await customSupabase
        .from('partners')
        .update({ order_number: partner.order_number })
        .eq('id', swapWith.id);
      
      if (error2) throw error2;
      
      fetchPartners();
    } catch (error) {
      console.error(`Error moving partner ${direction}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de déplacer le partenaire ${direction === 'up' ? 'vers le haut' : 'vers le bas'}`,
        variant: "destructive",
      });
    }
  };
  
  // Improved URL validation function
  const getDisplayUrl = (websiteUrl: string | null): { hostname: string, isValid: boolean } => {
    if (!websiteUrl || websiteUrl.trim() === '') {
      return { hostname: '-', isValid: false };
    }
    
    try {
      // Make sure the URL has a protocol
      const urlString = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      const url = new URL(urlString);
      return { hostname: url.hostname, isValid: true };
    } catch (e) {
      console.warn('Invalid URL:', websiteUrl);
      return { hostname: websiteUrl, isValid: false };
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des Partenaires</h2>
        <Button onClick={handleAddPartner}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un partenaire
        </Button>
      </div>
      
      {partners.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-festival-secondary">Aucun partenaire ajouté pour le moment.</p>
          <Button 
            onClick={handleAddPartner} 
            variant="outline" 
            className="mt-4"
          >
            Ajouter votre premier partenaire
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24">Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Site Web</TableHead>
                <TableHead className="text-center">Actif</TableHead>
                <TableHead className="text-center">Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner, index) => {
                const { hostname, isValid } = getDisplayUrl(partner.website_url);
                
                return (
                  <TableRow key={partner.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="h-12 w-20 bg-white flex items-center justify-center rounded border">
                        <img 
                          src={partner.logo_url} 
                          alt={partner.name} 
                          className="max-h-10 max-w-16 object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell className="text-slate-500">{partner.category || '-'}</TableCell>
                    <TableCell>
                      {isValid ? (
                        <a 
                          href={partner.website_url!} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          {hostname}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-slate-400">{hostname}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`h-2 w-2 rounded-full mx-auto ${partner.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => movePartner(partner, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => movePartner(partner, 'down')}
                        disabled={index === partners.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditPartner(partner)}
                        className="h-8 w-8 text-slate-500 hover:text-festival-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePartner(partner)}
                        className="h-8 w-8 text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentPartner.id ? "Modifier le partenaire" : "Ajouter un partenaire"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du partenaire *</Label>
                <Input 
                  id="name" 
                  value={currentPartner.name} 
                  onChange={(e) => setCurrentPartner({...currentPartner, name: e.target.value})}
                  placeholder="Ex: Nom de l'entreprise"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL du logo *</Label>
                <Input 
                  id="logo_url" 
                  value={currentPartner.logo_url} 
                  onChange={(e) => setCurrentPartner({...currentPartner, logo_url: e.target.value})}
                  placeholder="https://exemple.com/logo.png"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Site web</Label>
                <Input 
                  id="website_url" 
                  value={currentPartner.website_url} 
                  onChange={(e) => setCurrentPartner({...currentPartner, website_url: e.target.value})}
                  placeholder="https://exemple.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input 
                  id="category" 
                  value={currentPartner.category} 
                  onChange={(e) => setCurrentPartner({...currentPartner, category: e.target.value})}
                  placeholder="Ex: Sponsor, Média, Partenaire technique"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order_number">Ordre d'affichage</Label>
                <Input 
                  id="order_number" 
                  type="number"
                  min="0"
                  value={currentPartner.order_number} 
                  onChange={(e) => setCurrentPartner({...currentPartner, order_number: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="active" 
                  checked={currentPartner.active}
                  onCheckedChange={(checked) => setCurrentPartner({...currentPartner, active: checked})}
                />
                <Label htmlFor="active">Actif</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {currentPartner.id ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce partenaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le partenaire "{currentPartner.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnersManager;
