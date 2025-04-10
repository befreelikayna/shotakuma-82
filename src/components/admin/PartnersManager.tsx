
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, PencilIcon, Trash2Icon, ExternalLink } from "lucide-react";
import { customSupabase, Partner, safeDataAccess, uploadFileToSupabase } from "@/integrations/supabase/client";
import PartnersBulkUpload from "./PartnersBulkUpload";

const PartnersManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  
  // Partner form state
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState<string>("sponsor");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Fetch partners from Supabase
  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await customSupabase
        .from('partners')
        .select('*')
        .order('order_number');
      
      if (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les partenaires",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setPartners(data as Partner[]);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPartners();
    
    const channel = customSupabase
      .channel('admin:partners')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'partners' }, 
        () => {
          console.log('Partners changed, refreshing...');
          fetchPartners();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  const resetForm = () => {
    setName("");
    setLogoUrl("");
    setWebsiteUrl("");
    setOrderNumber(partners.length);
    setIsActive(true);
    setCategory("sponsor");
    setLogoFile(null);
    setIsEditing(false);
    setEditingPartnerId(null);
  };
  
  const handleOpenSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };
  
  const handleCloseSheet = () => {
    resetForm();
    setIsSheetOpen(false);
  };
  
  const handleEdit = (partner: Partner) => {
    setName(partner.name);
    setLogoUrl(partner.logo_url);
    setWebsiteUrl(partner.website_url || "");
    setOrderNumber(partner.order_number);
    setIsActive(partner.active);
    setCategory(partner.category || "sponsor");
    setIsEditing(true);
    setEditingPartnerId(partner.id);
    setIsSheetOpen(true);
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };
  
  const handleSave = async () => {
    try {
      // Validate form
      if (!name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du partenaire est requis",
          variant: "destructive",
        });
        return;
      }

      // URL validation regex
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      
      if (websiteUrl && !urlRegex.test(websiteUrl)) {
        toast({
          title: "Erreur",
          description: "L'URL du site web n'est pas valide",
          variant: "destructive",
        });
        return;
      }
      
      // If a new logo file is selected, upload it
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        const uploadedUrl = await uploadFileToSupabase(logoFile);
        if (!uploadedUrl) {
          toast({
            title: "Erreur",
            description: "Impossible de télécharger le logo",
            variant: "destructive",
          });
          return;
        }
        finalLogoUrl = uploadedUrl;
      } else if (!logoUrl) {
        toast({
          title: "Erreur",
          description: "Une URL ou un fichier de logo est requis",
          variant: "destructive",
        });
        return;
      }
      
      const partnerData: Partial<Partner> = {
        name,
        logo_url: finalLogoUrl,
        website_url: websiteUrl || null,
        order_number: orderNumber,
        active: isActive,
        category
      };
      
      if (isEditing && editingPartnerId) {
        // Update existing partner
        const { error } = await customSupabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartnerId);
          
        if (error) {
          console.error('Error updating partner:', error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le partenaire",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Succès",
          description: "Partenaire mis à jour avec succès",
        });
      } else {
        // Create new partner
        const { error } = await customSupabase
          .from('partners')
          .insert(partnerData);
          
        if (error) {
          console.error('Error creating partner:', error);
          toast({
            title: "Erreur",
            description: "Impossible de créer le partenaire",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Succès",
          description: "Partenaire créé avec succès",
        });
      }
      
      // Close sheet and refresh partners
      handleCloseSheet();
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      try {
        const { error } = await customSupabase
          .from('partners')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting partner:', error);
          toast({
            title: "Erreur",
            description: "Impossible de supprimer le partenaire",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Succès",
          description: "Partenaire supprimé avec succès",
        });
        
        // Refresh partners
        fetchPartners();
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleRefresh = () => {
    fetchPartners();
    toast({
      title: "Actualisé",
      description: "Les données ont été actualisées"
    });
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion des Partenaires</h2>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={handleOpenSheet}>
                Ajouter un Partenaire
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{isEditing ? "Modifier le partenaire" : "Ajouter un partenaire"}</SheetTitle>
                <SheetDescription>
                  {isEditing 
                    ? "Modifiez les détails du partenaire existant" 
                    : "Ajoutez un nouveau partenaire au festival"}
                </SheetDescription>
              </SheetHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du partenaire</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez le nom"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                      <SelectItem value="partner">Partenaire</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="institutional">Institutionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  {logoUrl && (
                    <div className="mb-2">
                      <img 
                        src={logoUrl} 
                        alt="Logo prévisualisé" 
                        className="max-h-24 max-w-full object-contain rounded-md border border-slate-200"
                      />
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mb-2"
                  />
                  <div className="text-xs text-gray-500">ou</div>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL du logo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">URL du site web (optionnel)</Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://exemple.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Ordre d'affichage</Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    min={0}
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active">Actif</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={handleCloseSheet}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>
                    {isEditing ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          {partners.length} partenaire(s)
        </div>
      </div>
      
      <PartnersBulkUpload onComplete={fetchPartners} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "64px" }}>Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Site Web</TableHead>
                <TableHead className="text-center">Ordre</TableHead>
                <TableHead className="text-center">Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun partenaire trouvé
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {partner.logo_url && (
                        <img 
                          src={partner.logo_url} 
                          alt={`Logo de ${partner.name}`} 
                          className="h-8 w-auto object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs capitalize bg-gray-100">
                        {partner.category || "sponsor"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {partner.website_url && (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {new URL(partner.website_url).hostname}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{partner.order_number}</TableCell>
                    <TableCell className="text-center">
                      {partner.active ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-gray-300"></span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(partner)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(partner.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PartnersManager;
