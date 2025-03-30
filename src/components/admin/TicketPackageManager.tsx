
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Edit, Plus, DollarSign, Check } from "lucide-react";

interface TicketFeature {
  id: string;
  text: string;
}

interface TicketPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: TicketFeature[];
  isPopular: boolean;
}

const TicketPackageManager = () => {
  const [ticketPackages, setTicketPackages] = useState<TicketPackage[]>([
    {
      id: "1",
      name: "Pass 1 Jour",
      price: 150,
      description: "Accès à tous les événements pour une journée",
      features: [
        { id: "1-1", text: "Accès à toutes les expositions" },
        { id: "1-2", text: "Accès aux panels et discussions" },
        { id: "1-3", text: "Accès aux projections" },
        { id: "1-4", text: "Accès à la zone marchande" }
      ],
      isPopular: false
    },
    {
      id: "2",
      name: "Pass 3 Jours",
      price: 350,
      description: "Accès à tous les événements pendant les trois jours du festival",
      features: [
        { id: "2-1", text: "Accès complet aux trois jours" },
        { id: "2-2", text: "Accès à toutes les expositions" },
        { id: "2-3", text: "Accès aux panels et discussions" },
        { id: "2-4", text: "Accès aux projections" },
        { id: "2-5", text: "Accès à la zone marchande" },
        { id: "2-6", text: "T-shirt exclusif du festival" }
      ],
      isPopular: true
    },
    {
      id: "3",
      name: "Pass VIP",
      price: 500,
      description: "Accès prioritaire, cadeaux exclusifs et rencontres avec les invités spéciaux",
      features: [
        { id: "3-1", text: "Accès complet aux trois jours" },
        { id: "3-2", text: "Entrée prioritaire sans file d'attente" },
        { id: "3-3", text: "Accès aux zones VIP" },
        { id: "3-4", text: "Kit souvenir exclusif" },
        { id: "3-5", text: "Rencontre avec les invités spéciaux" },
        { id: "3-6", text: "Place réservée pour les événements principaux" }
      ],
      isPopular: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<TicketPackage>({
    id: "",
    name: "",
    price: 0,
    description: "",
    features: [],
    isPopular: false
  });
  
  const [newFeature, setNewFeature] = useState("");

  const handleAddOrUpdatePackage = () => {
    if (!currentPackage.name || currentPackage.price <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires correctement.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      setTicketPackages(
        ticketPackages.map((pkg) =>
          pkg.id === currentPackage.id ? currentPackage : pkg
        )
      );
      toast({ title: "Succès", description: "Le forfait de billets a été mis à jour." });
    } else {
      const newId = Date.now().toString();
      setTicketPackages([...ticketPackages, { ...currentPackage, id: newId }]);
      toast({ title: "Succès", description: "Le nouveau forfait de billets a été ajouté." });
    }

    resetForm();
  };

  const handleEditPackage = (pkg: TicketPackage) => {
    setIsEditing(true);
    setCurrentPackage(JSON.parse(JSON.stringify(pkg)));
  };

  const handleDeletePackage = (id: string) => {
    setTicketPackages(ticketPackages.filter((pkg) => pkg.id !== id));
    toast({
      title: "Supprimé",
      description: "Le forfait de billets a été supprimé.",
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentPackage({
      id: "",
      name: "",
      price: 0,
      description: "",
      features: [],
      isPopular: false
    });
    setNewFeature("");
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    
    const featureId = `feature-${Date.now()}`;
    setCurrentPackage({
      ...currentPackage,
      features: [...currentPackage.features, { id: featureId, text: newFeature.trim() }]
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (featureId: string) => {
    setCurrentPackage({
      ...currentPackage,
      features: currentPackage.features.filter(feature => feature.id !== featureId)
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion des Forfaits de Billets</h2>
      
      {/* Ticket Package Form */}
      <div className="bg-slate-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-festival-primary mb-4">
          {isEditing ? "Modifier un forfait" : "Ajouter un nouveau forfait"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <Input
              value={currentPackage.name}
              onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
              placeholder="Nom du forfait"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
            <Input
              type="number"
              value={currentPackage.price}
              onChange={(e) => setCurrentPackage({ ...currentPackage, price: Number(e.target.value) })}
              placeholder="Prix"
              min={0}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            value={currentPackage.description}
            onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
            placeholder="Description du forfait"
            rows={2}
          />
        </div>
        
        {/* Features List */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Caractéristiques</label>
          <div className="bg-white p-4 rounded-md border border-slate-200 mb-2">
            {currentPackage.features.length > 0 ? (
              <ul className="space-y-2">
                {currentPackage.features.map((feature) => (
                  <li key={feature.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFeature(feature.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune caractéristique ajoutée</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Ajouter une caractéristique"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddFeature}
              variant="outline"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="popular-package"
            checked={currentPackage.isPopular}
            onCheckedChange={(checked) => setCurrentPackage({ ...currentPackage, isPopular: checked })}
          />
          <label htmlFor="popular-package" className="text-sm font-medium text-gray-700">
            Marquer comme populaire (mis en évidence)
          </label>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddOrUpdatePackage}
            className="bg-festival-accent text-white flex items-center gap-2"
          >
            {isEditing ? <Edit size={16} /> : <Plus size={16} />}
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
          {isEditing && (
            <Button onClick={resetForm} variant="outline">
              Annuler
            </Button>
          )}
        </div>
      </div>
      
      {/* Packages List */}
      <h3 className="text-lg font-medium text-festival-primary mb-4">Forfaits disponibles</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Caractéristiques</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticketPackages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell>{pkg.name}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} /> {pkg.price} MAD
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
              <TableCell>{pkg.features.length} éléments</TableCell>
              <TableCell>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pkg.isPopular ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pkg.isPopular ? "Populaire" : "Standard"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPackage(pkg)}
                    className="p-2 h-auto"
                  >
                    <Edit size={16} className="text-blue-500" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-2 h-auto"
                  >
                    <Trash size={16} className="text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketPackageManager;
