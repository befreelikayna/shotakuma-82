import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Plus, Edit, Trash } from "lucide-react";
import { customSupabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type TicketType = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  available: boolean;
};

const TicketManager = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [newTicket, setNewTicket] = useState<Omit<TicketType, 'id'>>({
    name: '',
    price: 0,
    description: '',
    available: true
  });

  const [isEditingPayPal, setIsEditingPayPal] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await customSupabase
        .from('tickets')
        .select('*')
        .order('price');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const typedData = Array.isArray(data) ? data.map(item => {
          return {
            id: String(item?.id || ''),
            name: String(item?.name || ''),
            price: typeof item?.price === 'number' ? item.price : Number(item?.price || 0),
            description: item?.description !== undefined ? String(item.description || '') : null,
            available: Boolean(item?.available)
          } as TicketType;
        }) : [];
        
        setTickets(typedData);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les billets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = customSupabase
      .channel('tickets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          fetchTickets();
        })
      .subscribe();

    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);

  const handleAdd = async () => {
    try {
      const { error } = await customSupabase
        .from('tickets')
        .insert([newTicket]);

      if (error) {
        throw error;
      }

      toast({
        title: "Billet ajouté",
        description: "Le billet a été ajouté avec succès",
      });
      setNewTicket({ name: '', price: 0, description: '', available: true });
      setIsAddDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error("Error adding ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le billet",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingTicket) return;

    try {
      setSavingItemId(editingTicket.id);
      const { error } = await customSupabase
        .from('tickets')
        .update(editingTicket)
        .eq('id', editingTicket.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Billet mis à jour",
        description: "Le billet a été mis à jour avec succès",
      });
      setIsEditDialogOpen(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le billet",
        variant: "destructive",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSavingItemId(id);
      const { error } = await customSupabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Billet supprimé",
        description: "Le billet a été supprimé avec succès",
      });
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le billet",
        variant: "destructive",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion des Billets</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} />
          Actualiser
        </Button>
      </div>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un billet
      </Button>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-md p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{ticket.name}</h3>
                <p className="text-sm text-muted-foreground">Prix: {ticket.price} DH</p>
                <p className="text-sm text-muted-foreground">Disponibilité: {ticket.available ? 'Oui' : 'Non'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTicket(ticket);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(ticket.id)}
                  disabled={savingItemId === ticket.id}
                >
                  {savingItemId === ticket.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau billet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newTicket.name}
                onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix
              </Label>
              <Input
                type="number"
                id="price"
                value={newTicket.price}
                onChange={(e) => setNewTicket({ ...newTicket, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTicket.description || ''}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">
                Disponible
              </Label>
              <Switch
                id="available"
                checked={newTicket.available}
                onCheckedChange={(checked) => setNewTicket({ ...newTicket, available: checked })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleAdd}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le billet</DialogTitle>
          </DialogHeader>
          {editingTicket ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editingTicket.name}
                  onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Prix
                </Label>
                <Input
                  type="number"
                  id="edit-price"
                  value={editingTicket.price}
                  onChange={(e) => setEditingTicket({ ...editingTicket, price: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingTicket.description || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-available" className="text-right">
                  Disponible
                </Label>
                <Switch
                  id="edit-available"
                  checked={editingTicket.available}
                  onCheckedChange={(checked) => setEditingTicket({ ...editingTicket, available: checked })}
                  className="col-span-3"
                />
              </div>
            </div>
          ) : (
            <div>Chargement...</div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleEdit} disabled={savingItemId === editingTicket?.id}>
              {savingItemId === editingTicket?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketManager;
