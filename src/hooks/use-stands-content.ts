
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export type StandsContent = Database['public']['Tables']['stands_content']['Row'];

export const useStandsContent = () => {
  const [content, setContent] = useState<StandsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stands_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching stands content:", error);
        toast({
          title: "Error",
          description: "Could not load stands page content.",
          variant: "destructive",
        });
        return;
      }

      // If no record exists, create a default one
      if (!data) {
        const defaultContent: StandsContent = {
          id: '', // will be generated by the database
          title: 'Stands & Exhibitors',
          description: 'Discover our festival exhibitors and their stands',
          url: 'https://exhibitors.shotaku.ma',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newData, error: insertError } = await supabase
          .from('stands_content')
          .insert(defaultContent)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating default stands content:", insertError);
        } else {
          setContent(newData);
        }
      } else {
        setContent(data);
      }
    } catch (error) {
      console.error("Error fetching stands content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    // Set up a subscription to listen for changes
    const channel = supabase
      .channel("stands-content-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stands_content" },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { content, isLoading, refetch: fetchContent };
};
