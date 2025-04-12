
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2, MapPin, Mail, Phone, Clock, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define the schema for contact information validation
const contactFormSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse email valide" }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis" }),
  whatsapp: z.string().optional(),
  address: z.string().min(1, { message: "L'adresse est requise" }),
  hours: z.string().optional(),
  additional_info: z.string().optional(),
  map_lat: z.string().optional(),
  map_lng: z.string().optional(),
  map_zoom: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactEditor = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      hours: "",
      additional_info: "",
      map_lat: "33.589886",
      map_lng: "-7.603869",
      map_zoom: "15",
    },
  });

  // Fetch contact info from database on component mount
  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsLoading(true);
      try {
        // Get contact info from general_content table with section_key 'contact_info'
        const { data, error } = await supabase
          .from("general_content")
          .select("*")
          .eq("section_key", "contact_info")
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found is okay for new setup
            throw error;
          }
        }

        if (data && data.content) {
          try {
            // Parse the JSON content
            const parsedContent = JSON.parse(data.content);
            
            // Reset form with fetched values
            form.reset({
              email: parsedContent.email || "",
              phone: parsedContent.phone || "",
              whatsapp: parsedContent.whatsapp || "",
              address: parsedContent.address || "",
              hours: parsedContent.hours || "",
              additional_info: parsedContent.additional_info || "",
              map_lat: parsedContent.map_lat || "33.589886",
              map_lng: parsedContent.map_lng || "-7.603869",
              map_zoom: parsedContent.map_zoom || "15",
            });
          } catch (parseError) {
            console.error("Error parsing contact info JSON:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de contact",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
    
    // Set up real-time subscription for content updates
    const channel = supabase
      .channel('contact-info-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'general_content',
        filter: 'section_key=eq.contact_info'
      }, (payload) => {
        if (payload.new && payload.new.content) {
          try {
            const parsedContent = JSON.parse(payload.new.content);
            
            // Update form with new values from real-time update
            form.reset({
              email: parsedContent.email || "",
              phone: parsedContent.phone || "",
              whatsapp: parsedContent.whatsapp || "",
              address: parsedContent.address || "",
              hours: parsedContent.hours || "",
              additional_info: parsedContent.additional_info || "",
              map_lat: parsedContent.map_lat || "33.589886",
              map_lng: parsedContent.map_lng || "-7.603869",
              map_zoom: parsedContent.map_zoom || "15",
            });
          } catch (error) {
            console.error("Error parsing real-time contact info:", error);
          }
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [form]);

  // Form submission handler
  const onSubmit = async (values: ContactFormValues) => {
    setIsLoading(true);
    
    try {
      // Store contact info as JSON in the general_content table
      const { error } = await supabase
        .from("general_content")
        .upsert(
          {
            section_key: "contact_info",
            title: "Contact Information",
            content: JSON.stringify(values),
          },
          { onConflict: "section_key" }
        );

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les informations de contact ont été mises à jour",
      });
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations de contact",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Éditeur de la Page Contact</h2>
      </div>
      
      <Separator className="my-4" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informations de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@shotaku.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 XXX XXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 XXX XXXXXX" {...field} />
                      </FormControl>
                      <FormDescription>
                        Laisser vide si identique au numéro de téléphone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Avenue Hassan II, Casablanca, Maroc"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="map_lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="map_lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="map_zoom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zoom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires et Informations Supplémentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horaires d'ouverture</FormLabel>
                    <FormControl>
                      <Input placeholder="Lun-Ven: 9h-18h, Sam: 10h-16h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additional_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informations Supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Toute information supplémentaire que vous souhaitez afficher"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="h-4 w-4" /> Enregistrer les modifications</>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
        <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-gray-500" />
          Prévisualisation de la carte
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Modifiez les coordonnées ci-dessus pour ajuster la position de la carte sur la page contact.
          Les modifications seront visibles en temps réel sur la page de contact.
        </p>
        <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Aperçu de la carte disponible sur la page Contact</p>
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;
