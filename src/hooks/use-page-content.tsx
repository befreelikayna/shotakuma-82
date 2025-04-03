
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PageContent {
  header: {
    title: string;
    subtitle: string;
  };
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  sidebar?: {
    title: string;
    content: string;
  };
  footer: {
    text: string;
  };
}

const defaultContent: Record<string, PageContent> = {
  home: {
    header: {
      title: "Festival Marocain d'Anime & Manga",
      subtitle: "Le plus grand événement célébrant la culture japonaise au Maroc",
    },
    sections: [
      {
        id: "s1",
        title: "Bienvenue au SHOTAKU",
        content: "Le plus grand événement célébrant la culture japonaise, l'anime et le manga au Maroc.",
      }
    ],
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
};

export const usePageContent = (pageId: string) => {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_id', pageId)
          .single();

        if (error) {
          // If the page isn't found, use the default content
          if (error.code === 'PGRST116') { // PGRST116: No rows returned
            setContent(defaultContent[pageId] || defaultContent.home);
            return;
          }
          throw error;
        }

        if (data && data.content) {
          try {
            const parsedContent = JSON.parse(data.content);
            setContent(parsedContent);
          } catch (e) {
            console.error(`Error parsing content for page ${pageId}:`, e);
            setError(new Error(`Error parsing content for page ${pageId}`));
            setContent(defaultContent[pageId] || defaultContent.home);
          }
        } else {
          setContent(defaultContent[pageId] || defaultContent.home);
        }
      } catch (err) {
        console.error("Error fetching page content:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching page content'));
        setContent(defaultContent[pageId] || defaultContent.home);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageContent();
    
    // Set up a realtime subscription for content updates
    const channel = supabase
      .channel(`page-content-${pageId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'page_content',
          filter: `page_id=eq.${pageId}`
        }, 
        () => {
          console.log(`Page content for ${pageId} changed, refreshing...`);
          fetchPageContent();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  return { content, isLoading, error };
};
