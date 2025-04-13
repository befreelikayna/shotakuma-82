
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PaymentSetting {
  id: string;
  provider: string;
  enabled: boolean;
  publishable_key?: string | null;
  secret_key?: string | null;
  webhook_secret?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  mode?: string | null;
  created_at: string;
  updated_at: string;
}

export const usePaymentSettings = (provider: string) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PaymentSetting | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('provider', provider)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching ${provider} settings:`, error);
        toast({
          title: 'Error',
          description: `Could not load ${provider} payment settings.`,
          variant: 'destructive',
        });
      }

      setSettings(data || null);
    } catch (error) {
      console.error(`Error fetching ${provider} settings:`, error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsData: Partial<PaymentSetting>) => {
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          ...settingsData,
          provider,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'provider' 
        });

      if (error) throw error;
      
      toast({
        title: 'Settings Saved',
        description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} payment settings have been updated successfully.`,
      });

      await fetchSettings();
    } catch (error) {
      console.error(`Error saving ${provider} settings:`, error);
      toast({
        title: 'Error',
        description: `Could not save ${provider} settings.`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [provider]);

  return { settings, loading, saveSettings };
};
