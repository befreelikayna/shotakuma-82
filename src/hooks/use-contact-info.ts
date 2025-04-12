
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  hours?: string;
  additional_info?: string;
  map_lat: string;
  map_lng: string;
  map_zoom: string;
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('general_content')
          .select('*')
          .eq('section_key', 'contact_info')
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data && typeof data.content === 'string') {
          // Parse the JSON content
          const parsedContent = JSON.parse(data.content);
          
          // Set default values for required fields
          const contactInfo: ContactInfo = {
            email: parsedContent.email || '',
            phone: parsedContent.phone || '',
            whatsapp: parsedContent.whatsapp || '',
            address: parsedContent.address || '',
            hours: parsedContent.hours || '',
            additional_info: parsedContent.additional_info || '',
            map_lat: parsedContent.map_lat || '33.589886',
            map_lng: parsedContent.map_lng || '-7.603869',
            map_zoom: parsedContent.map_zoom || '15',
          };
          
          setContactInfo(contactInfo);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch contact info'));
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
      }, () => {
        fetchContactInfo();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { contactInfo, isLoading, error };
};
