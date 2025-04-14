
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export type AccessBadge = Database['public']['Tables']['access_badges']['Row'];

export const useAccessBadges = () => {
  const [badges, setBadges] = useState<AccessBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('access_badges')
        .select('*')
        .eq('is_active', true)
        .order('type');

      if (error) {
        console.error("Error fetching access badges:", error);
        toast({
          title: "Error",
          description: "Could not load access badges.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setBadges(data);
      }
    } catch (error) {
      console.error("Error fetching access badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();

    // Set up a subscription to listen for changes
    const channel = supabase
      .channel("access-badges-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_badges" },
        () => {
          fetchBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { badges, isLoading, refetch: fetchBadges };
};
