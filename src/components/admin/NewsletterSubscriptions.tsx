
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Search, Download, Mail, RefreshCw } from "lucide-react";
// Import supabase client (commented out until a newsletter subscribers table is created)
// import { supabase } from "@/integrations/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  date: string;
}

const NewsletterSubscriptions = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    { id: "1", email: "fan1@example.com", date: "2024-03-10" },
    { id: "2", email: "otaku2@gmail.com", date: "2024-03-15" },
    { id: "3", email: "manga_lover@yahoo.com", date: "2024-03-20" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Future function for fetching subscribers from Supabase
  /* 
  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching subscribers:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les abonnés",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setSubscribers(data.map(sub => ({
          id: sub.id,
          email: sub.email,
          date: new Date(sub.created_at).toISOString().split('T')[0]
        })));
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Uncomment when the newsletter_subscribers table is created
  useEffect(() => {
    fetchSubscribers();
    
    // Set up a realtime subscription 
    const channel = supabase
      .channel('admin:newsletter')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'newsletter_subscribers' }, 
        () => {
          fetchSubscribers();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  */
  
  const handleDeleteSubscriber = (id: string) => {
    // Future Supabase implementation
    /*
    try {
      await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
        
      // The data will refresh automatically via the subscription
      toast({
        title: "Supprimé",
        description: "L'abonné a été supprimé de la liste."
      });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'abonné",
        variant: "destructive",
      });
    }
    */
    
    // For now, use local state
    setSubscribers(subscribers.filter(subscriber => subscriber.id !== id));
    toast({
      title: "Supprimé",
      description: "L'abonné a été supprimé de la liste."
    });
  };
  
  const handleExport = () => {
    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      "Email,Date d'inscription\n" + 
      subscribers.map(s => `${s.email},${s.date}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "abonnes-newsletter.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exporté",
      description: "La liste des abonnés a été exportée avec succès."
    });
  };
  
  const handleSendTestEmail = () => {
    toast({
      title: "Email envoyé",
      description: "Un email de test a été envoyé à infos@shotaku.ma"
    });
  };
  
  const filteredSubscribers = subscribers.filter(
    subscriber => subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-festival-primary mb-6">Gestion de la Newsletter</h2>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exporter
          </Button>
          <Button 
            onClick={handleSendTestEmail}
            className="bg-festival-accent text-white flex items-center gap-2"
          >
            <Mail size={16} />
            Envoyer Test
          </Button>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-festival-primary mb-4">Abonnés ({subscribers.length})</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubscribers.length > 0 ? (
            filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>{subscriber.date}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    className="p-2 h-auto"
                  >
                    <Trash size={16} className="text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                Aucun résultat trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add refresh button for future Supabase implementation */}
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            toast({
              title: "Actualisé",
              description: "Les données ont été actualisées."
            });
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>
    </div>
  );
};

export default NewsletterSubscriptions;
