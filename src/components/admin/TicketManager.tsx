import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Edit, Plus, DollarSign, RefreshCw } from "lucide-react";
import { supabase, customSupabase, Ticket } from "@/integrations/supabase/client";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string | null;
  available: boolean;
}

// Type guard for database items
type TicketDataItem = {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
  available: boolean;
};

function isTicketDataItem(item: any): item is TicketDataItem {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    'name' in item &&
    'price' in item &&
    'available' in item
  );
}

const TicketManager = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await customSupabase
        .from('tickets')
        .select('*')
        .order('created_at');
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        // Filter and map the data safely
        const typedData = data
          .filter(isTicketDataItem)
          .map(item => ({
            id: item.id,
            name: item.name,
            price: typeof item.price === 'number' ? item.price : Number(item.price),
            description: item.description,
            available: Boolean(item.available)
          }));
        
        setTickets(typedData);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les billets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTickets();
    
    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        (payload) => {
          console.log('Tickets changed:', payload);
          fetchTickets();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleAddOrUpdateTicket = async () => {
    if (!currentTicket.name || currentTicket.price <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires correctement.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Saving ticket:", currentTicket);
      
      if (isEditing) {
        // Ensure price is sent as a number
        const ticketData = {
          name: currentTicket.name,
          price: Number(currentTicket.price),
          description: currentTicket.description,
          available: currentTicket.available
        };
        
        console.log("Updating ticket with data:", ticketData);
        
        const { error } = await customSupabase
          .from('tickets')
          .update(ticketData)
          .eq('id', currentTicket.id);
        
        if (error) throw error;
        
        toast({ title: "Succès", description: "Le billet a été mis à jour." });
      } else {
        const { error } = await customSupabase
          .from('tickets')
          .insert({
            name: currentTicket.name,
            price: Number(currentTicket.price),
            description: currentTicket.description,
            available: currentTicket.available
          });
        
        if (error) throw error;
        
        toast({ title: "Succès", description: "Le nouveau billet a été ajouté." });
      }

      resetForm();
      fetchTickets();
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du billet.",
        variant: "destructive",
      });
    }
  };

  const handleEditTicket = (ticket: TicketType) => {
    // Ensure price is a number when editing
    setCurrentTicket({
      ...ticket,
      price: typeof ticket.price === 'number' ? ticket.price : Number(ticket.price)
    });
    setIsEditing(true);
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const { error } = await customSupabase
        .from('tickets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Supprimé",
        description: "Le billet a été supprimé.",
      });
      
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du billet.",
        variant: "destructive",
      });
    }
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

  const handleRefreshTickets = () => {
    fetchTickets();
    toast({
      title: "Actualisation",
      description: "Liste des billets actualisée",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-festival-primary">Gestion des Billets</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshTickets}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} />
          Actualiser
        </Button>
      </div>
      
      {/* PayPal configuration section */}
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
      
      {/* Add/Edit ticket form */}
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
            value={currentTicket.description || ""}
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
      
      {/* Tickets list */}
      <h3 className="text-lg font-medium text-festival-primary mb-4">Billets disponibles</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
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
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Aucun billet trouvé
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
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
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default TicketManager;
