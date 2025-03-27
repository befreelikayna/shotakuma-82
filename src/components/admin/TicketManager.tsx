
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Edit, Plus, DollarSign } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
}

const TicketManager = () => {
  const [tickets, setTickets] = useState<TicketType[]>([
    {
      id: "1",
      name: "Pass 1 Jour",
      price: 150,
      description: "Accès à tous les événements pour une journée",
      available: true,
    },
    {
      id: "2",
      name: "Pass 3 Jours",
      price: 350,
      description: "Accès à tous les événements pendant les trois jours du festival",
      available: true,
    },
    {
      id: "3",
      name: "Pass VIP",
      price: 500,
      description: "Accès prioritaire, cadeaux exclusifs et rencontres avec les invités spéciaux",
      available: false,
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketType>({
    id: "",
    name: "",
    price: 0,
    description: "",
    available: true,
  });
  
  const [paypalSettings, setPaypalSettings] = useState({
    clientId: "YOUR_PAYPAL_CLIENT_ID",
    secretKey: "YOUR_PAYPAL_SECRET_KEY",
    isLive: false,
  });

  const [isEditingPayPal, setIsEditingPayPal] = useState(false);
  
  const handleAddOrUpdateTicket = () => {
    if (!currentTicket.name || currentTicket.price <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires correctement.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      setTickets(
        tickets.map((ticket) =>
          ticket.id === currentTicket.id ? currentTicket : ticket
        )
      );
      toast({ title: "Succès", description: "Le billet a été mis à jour." });
    } else {
      const newId = Date.now().toString();
      setTickets([...tickets, { ...currentTicket, id: newId }]);
      toast({ title: "Succès", description: "Le nouveau billet a été ajouté." });
    }

    resetForm();
  };

  const handleEditTicket = (ticket: TicketType) => {
    setIsEditing(true);
    setCurrentTicket(ticket);
  };

  const handleDeleteTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
    toast({
      title: "Supprimé",
      description: "Le billet a été supprimé.",
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTicket({
      id: "",
      name: "",
      price: 0,
      description: "",
      available: true,
    });
  };

  const handleSavePayPalSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres PayPal ont été mis à jour.",
    });
    setIsEditingPayPal(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion des Billets</h2>
      
      {/* PayPal Settings */}
      <div className="bg-slate-50 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-festival-primary">Configuration PayPal</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingPayPal(!isEditingPayPal)}
          >
            {isEditingPayPal ? "Annuler" : "Modifier"}
          </Button>
        </div>
        
        {isEditingPayPal ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <Input
                value={paypalSettings.clientId}
                onChange={(e) => setPaypalSettings({ ...paypalSettings, clientId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
              <Input
                type="password"
                value={paypalSettings.secretKey}
                onChange={(e) => setPaypalSettings({ ...paypalSettings, secretKey: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="paypal-mode"
                checked={paypalSettings.isLive}
                onCheckedChange={(checked) => setPaypalSettings({ ...paypalSettings, isLive: checked })}
              />
              <label htmlFor="paypal-mode" className="text-sm font-medium text-gray-700">
                Mode Production (décochez pour le mode Sandbox)
              </label>
            </div>
            <Button onClick={handleSavePayPalSettings} className="bg-festival-accent text-white">
              Sauvegarder
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Mode:</strong> {paypalSettings.isLive ? "Production" : "Sandbox (Test)"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Client ID:</strong> {paypalSettings.clientId.substring(0, 10)}...
            </p>
            <p className="text-sm text-gray-600">
              <strong>Secret Key:</strong> {paypalSettings.secretKey.replace(/./g, "*")}
            </p>
          </div>
        )}
      </div>
      
      {/* Ticket Form */}
      <div className="bg-slate-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-festival-primary mb-4">
          {isEditing ? "Modifier un billet" : "Ajouter un nouveau billet"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <Input
              value={currentTicket.name}
              onChange={(e) => setCurrentTicket({ ...currentTicket, name: e.target.value })}
              placeholder="Nom du billet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
            <Input
              type="number"
              value={currentTicket.price}
              onChange={(e) => setCurrentTicket({ ...currentTicket, price: Number(e.target.value) })}
              placeholder="Prix"
              min={0}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            value={currentTicket.description}
            onChange={(e) => setCurrentTicket({ ...currentTicket, description: e.target.value })}
            placeholder="Description du billet"
            rows={3}
          />
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="ticket-available"
            checked={currentTicket.available}
            onCheckedChange={(checked) => setCurrentTicket({ ...currentTicket, available: checked })}
          />
          <label htmlFor="ticket-available" className="text-sm font-medium text-gray-700">
            Disponible à la vente
          </label>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddOrUpdateTicket}
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
      
      {/* Tickets List */}
      <h3 className="text-lg font-medium text-festival-primary mb-4">Billets disponibles</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.name}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} /> {ticket.price} MAD
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
              <TableCell>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {ticket.available ? "Disponible" : "Indisponible"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditTicket(ticket)}
                    className="p-2 h-auto"
                  >
                    <Edit size={16} className="text-blue-500" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteTicket(ticket.id)}
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

export default TicketManager;
