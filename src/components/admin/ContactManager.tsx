
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  hours: string;
  additional_info: string;
};

const ContactManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    address: "",
    whatsapp: "",
    hours: "",
    additional_info: "",
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      // Instead of fetching from contact_info, we'll get content from general_content
      const { data, error } = await supabase
        .from("general_content")
        .select("*")
        .eq("section_key", "contact_info")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // The record doesn't exist yet, which is fine for new setup
          console.log("No contact info found, will create on first save");
        } else {
          throw error;
        }
      }

      if (data && data.content) {
        try {
          // Parse the JSON content which contains our contact info
          const parsedContent = JSON.parse(data.content);
          setContactInfo({
            email: parsedContent.email || "",
            phone: parsedContent.phone || "",
            address: parsedContent.address || "",
            whatsapp: parsedContent.whatsapp || "",
            hours: parsedContent.hours || "",
            additional_info: parsedContent.additional_info || "",
          });
        } catch (parseError) {
          console.error("Error parsing contact info JSON:", parseError);
        }
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast({
        title: "Error",
        description: "Failed to load contact information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store the contact info as JSON in the general_content table
      const { error } = await supabase
        .from("general_content")
        .upsert(
          {
            section_key: "contact_info",
            content: JSON.stringify(contactInfo),
            title: "Contact Information",
          },
          { onConflict: "section_key" }
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={contactInfo.email}
                onChange={handleChange}
                placeholder="contact@shotaku.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={contactInfo.phone}
                onChange={handleChange}
                placeholder="+212 XXX XXXXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={contactInfo.whatsapp}
                onChange={handleChange}
                placeholder="+212 XXX XXXXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                name="hours"
                value={contactInfo.hours}
                onChange={handleChange}
                placeholder="Mon-Fri: 9AM-5PM"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={contactInfo.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional Information</Label>
            <Textarea
              id="additional_info"
              name="additional_info"
              value={contactInfo.additional_info}
              onChange={handleChange}
              placeholder="Any additional information you want to display"
              rows={4}
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactManager;
