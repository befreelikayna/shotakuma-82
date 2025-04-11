
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MapPin, Phone, Send, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import ContactMap from "@/components/ContactMap";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez saisir une adresse e-mail valide.",
  }),
  subject: z.string().min(5, {
    message: "Le sujet doit comporter au moins 5 caractères.",
  }),
  message: z.string().min(10, {
    message: "Le message doit comporter au moins 10 caractères.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  hours: string;
  additional_info: string;
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "contact@shotaku-festival.ma",
    phone: "+212 6 70 62 59 80",
    address: "23 Rue des Festivals, Casablanca, 20000, Maroc",
    whatsapp: "",
    hours: "",
    additional_info: "",
  });
  
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("general_content")
          .select("*")
          .eq("section_key", "contact_info")
          .single();

        if (error) {
          console.error("Error fetching contact info:", error);
          return;
        }

        if (data && data.content) {
          try {
            const parsedContent = JSON.parse(data.content);
            setContactInfo({
              email: parsedContent.email || contactInfo.email,
              phone: parsedContent.phone || contactInfo.phone,
              address: parsedContent.address || contactInfo.address,
              whatsapp: parsedContent.whatsapp || contactInfo.whatsapp,
              hours: parsedContent.hours || contactInfo.hours,
              additional_info: parsedContent.additional_info || contactInfo.additional_info,
            });
          } catch (parseError) {
            console.error("Error parsing contact info:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store the message in general_content as a fallback 
      // (in a production app, you would store this in a messages table or send by email)
      const { error } = await supabase.from("general_content").insert([
        {
          section_key: `contact_message_${Date.now()}`,
          title: values.subject,
          content: JSON.stringify({
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
            date: new Date().toISOString(),
          }),
        },
      ]);

      if (error) throw error;
      
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-32 pb-12">
        <section className="py-12">
          <div className="festival-container">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="section-heading inline-block">Contactez-nous</h1>
              <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
                Une question sur le festival ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-soft"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-festival-primary">Envoyez-nous un message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Votre nom" 
                                {...field}
                                className="pl-10" 
                              />
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Votre email" 
                                type="email"
                                {...field}
                                className="pl-10" 
                              />
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sujet</FormLabel>
                          <FormControl>
                            <Input placeholder="Sujet de votre message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Votre message" 
                              className="min-h-[150px]" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
              
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h2 className="text-2xl font-semibold mb-6 text-festival-primary">Informations de contact</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Adresse</h3>
                        <p className="text-festival-secondary">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Email</h3>
                        <p className="text-festival-secondary">
                          {contactInfo.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Téléphone</h3>
                        <p className="text-festival-secondary">
                          {contactInfo.phone}
                        </p>
                      </div>
                    </div>
                    
                    {contactInfo.hours && (
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg mb-1">Horaires</h3>
                          <p className="text-festival-secondary">
                            {contactInfo.hours}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {contactInfo.additional_info && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-medium text-lg mb-2">Informations supplémentaires</h3>
                        <p className="text-festival-secondary whitespace-pre-line">
                          {contactInfo.additional_info}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden h-[300px]">
                  <ContactMap />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
