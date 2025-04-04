import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, RefreshCw, Loader2 } from "lucide-react";
import { customSupabase } from "@/integrations/supabase/client";

interface PageContent {
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

const pages = [
  { id: "home", name: "Accueil" },
  { id: "about", name: "À propos" },
  { id: "events", name: "Événements" },
  { id: "schedule", name: "Programme" },
  { id: "gallery", name: "Galerie" },
];

const initialContent: Record<string, PageContent> = {
  home: {
    header: {
      title: "Festival Marocain d'Anime & Manga",
      subtitle: "Le plus grand événement célébrant la culture japonaise au Maroc",
    },
    sections: [
      {
        id: "s1",
        title: "Bienvenue au SHOTAKU",
        content: "Le plus grand événement célébrant la culture japonaise, l'anime et le manga au Maroc. Rejoignez-nous pour trois jours inoubliables d'expositions, de compétitions et de performances.",
      },
      {
        id: "s2",
        title: "Événements à ne pas manquer",
        content: "Concours de cosplay, ateliers de dessin manga, concerts de J-pop, et bien plus encore!",
      },
    ],
    sidebar: {
      title: "Informations pratiques",
      content: "Dates: 26-28 Mars 2024\nLieu: Casablanca, Maroc\nBillets: Disponibles en ligne",
    },
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
  about: {
    header: {
      title: "À propos de SHOTAKU",
      subtitle: "Notre histoire et notre mission",
    },
    sections: [
      {
        id: "s1",
        title: "Notre histoire",
        content: "Fondé en 2018, SHOTAKU est devenu le premier festival d'anime et de manga au Maroc.",
      },
    ],
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
  events: {
    header: {
      title: "Événements",
      subtitle: "Découvrez nos événements exceptionnels",
    },
    sections: [
      {
        id: "s1",
        title: "Programme des événements",
        content: "Consultez notre programme complet des événements pour ne rien manquer!",
      },
    ],
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
  schedule: {
    header: {
      title: "Programme",
      subtitle: "Planifiez votre visite",
    },
    sections: [
      {
        id: "s1",
        title: "Horaire des activités",
        content: "Consultez l'horaire complet de toutes nos activités pendant les trois jours du festival.",
      },
    ],
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
  gallery: {
    header: {
      title: "Galerie",
      subtitle: "Les meilleurs moments de SHOTAKU",
    },
    sections: [
      {
        id: "s1",
        title: "Photos et vidéos",
        content: "Revivez les meilleurs moments des éditions précédentes à travers notre galerie de photos et vidéos.",
      },
    ],
    footer: {
      text: "SHOTAKU © 2024 | Le festival d'anime et manga du Maroc",
    },
  },
};

const ContentManager = () => {
  const [selectedPage, setSelectedPage] = useState("home");
  const [content, setContent] = useState<Record<string, PageContent>>(initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch content from the database
  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await customSupabase
        .from('page_content')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Convert the database data to our content structure
        const newContent: Record<string, PageContent> = { ...initialContent };
        
        data.forEach(item => {
          if (item.page_id && item.content) {
            try {
              const parsedContent = typeof item.content === 'string' 
                ? JSON.parse(item.content)
                : item.content;
              newContent[item.page_id] = parsedContent;
            } catch (e) {
              console.error(`Error parsing content for page ${item.page_id}:`, e);
            }
          }
        });
        
        setContent(newContent);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu des pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    
    // Set up a realtime subscription for content updates
    const channel = customSupabase
      .channel('admin:page_content')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'page_content' }, 
        () => {
          console.log('Page content changed, refreshing...');
          fetchContent();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);

  const handleContentChange = (
    pageId: string,
    section: keyof PageContent,
    field: string,
    value: string,
    sectionId?: string
  ) => {
    setContent((prev) => {
      const newContent = { ...prev };
      
      if (section === "sections" && sectionId) {
        const sectionIndex = newContent[pageId].sections.findIndex(
          (s) => s.id === sectionId
        );
        if (sectionIndex !== -1) {
          newContent[pageId].sections[sectionIndex] = {
            ...newContent[pageId].sections[sectionIndex],
            [field]: value,
          };
        }
      } else if (section === "header") {
        newContent[pageId].header = {
          ...newContent[pageId].header,
          [field]: value,
        };
      } else if (section === "footer") {
        newContent[pageId].footer = {
          ...newContent[pageId].footer,
          [field]: value,
        };
      } else if (section === "sidebar" && newContent[pageId].sidebar) {
        newContent[pageId].sidebar = {
          ...newContent[pageId].sidebar!,
          [field]: value,
        };
      }
      
      return newContent;
    });
  };

  const addSection = (pageId: string) => {
    setContent((prev) => {
      const newContent = { ...prev };
      newContent[pageId].sections.push({
        id: `s${Date.now()}`,
        title: "Nouvelle section",
        content: "Contenu de la nouvelle section",
      });
      return newContent;
    });
  };

  const removeSection = (pageId: string, sectionId: string) => {
    setContent((prev) => {
      const newContent = { ...prev };
      newContent[pageId].sections = newContent[pageId].sections.filter(
        (section) => section.id !== sectionId
      );
      return newContent;
    });
  };

  const addSidebar = (pageId: string) => {
    setContent((prev) => {
      const newContent = { ...prev };
      if (!newContent[pageId].sidebar) {
        newContent[pageId].sidebar = {
          title: "Sidebar Title",
          content: "Sidebar Content",
        };
      }
      return newContent;
    });
  };

  const removeSidebar = (pageId: string) => {
    setContent((prev) => {
      const newContent = { ...prev };
      delete newContent[pageId].sidebar;
      return newContent;
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      // For each page, save or update the content in the database
      for (const pageId of Object.keys(content)) {
        const pageContent = content[pageId];
        
        const { data: existingContent, error: fetchError } = await customSupabase
          .from('page_content')
          .select('*')
          .eq('page_id', pageId)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows returned
          throw fetchError;
        }
        
        if (existingContent) {
          // Update existing content
          const { error: updateError } = await customSupabase
            .from('page_content')
            .update({ 
              content: pageContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingContent.id);
          
          if (updateError) throw updateError;
        } else {
          // Insert new content
          const { error: insertError } = await customSupabase
            .from('page_content')
            .insert({ 
              page_id: pageId, 
              content: pageContent
            });
          
          if (insertError) throw insertError;
        }
      }
      
      toast({
        title: "Contenu enregistré",
        description: "Les modifications du contenu ont été enregistrées avec succès",
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du contenu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchContent();
    toast({
      title: "Actualisation",
      description: "Le contenu a été actualisé",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement du contenu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Gestion du Contenu</h2>
          <p className="text-sm text-muted-foreground">
            Modifiez le contenu textuel des différentes pages du site.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Actualiser
        </Button>
      </div>

      <Tabs value={selectedPage} onValueChange={setSelectedPage}>
        <TabsList className="mb-6">
          {pages.map((page) => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map((page) => (
          <TabsContent key={page.id} value={page.id} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Edit className="mr-2 h-4 w-4" /> En-tête
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`${page.id}-header-title`}>Titre</Label>
                  <Input
                    id={`${page.id}-header-title`}
                    value={content[page.id].header.title}
                    onChange={(e) =>
                      handleContentChange(
                        page.id,
                        "header",
                        "title",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${page.id}-header-subtitle`}>Sous-titre</Label>
                  <Input
                    id={`${page.id}-header-subtitle`}
                    value={content[page.id].header.subtitle}
                    onChange={(e) =>
                      handleContentChange(
                        page.id,
                        "header",
                        "subtitle",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Sections
                </h3>
                <Button onClick={() => addSection(page.id)} variant="outline" size="sm">
                  Ajouter une section
                </Button>
              </div>
              
              {content[page.id].sections.map((section) => (
                <div key={section.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Section</h4>
                    <Button
                      onClick={() => removeSection(page.id, section.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      Supprimer
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${page.id}-${section.id}-title`}>Titre de section</Label>
                    <Input
                      id={`${page.id}-${section.id}-title`}
                      value={section.title}
                      onChange={(e) =>
                        handleContentChange(
                          page.id,
                          "sections",
                          "title",
                          e.target.value,
                          section.id
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${page.id}-${section.id}-content`}>Contenu</Label>
                    <Textarea
                      id={`${page.id}-${section.id}-content`}
                      value={section.content}
                      onChange={(e) =>
                        handleContentChange(
                          page.id,
                          "sections",
                          "content",
                          e.target.value,
                          section.id
                        )
                      }
                      rows={4}
                    />
                  </div>
                </div>
              ))}

              {content[page.id].sections.length === 0 && (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Aucune section. Cliquez sur "Ajouter une section" pour en créer une.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Barre latérale
                </h3>
                {!content[page.id].sidebar ? (
                  <Button onClick={() => addSidebar(page.id)} variant="outline" size="sm">
                    Ajouter une barre latérale
                  </Button>
                ) : (
                  <Button onClick={() => removeSidebar(page.id)} variant="ghost" size="sm" 
                    className="h-8 text-destructive hover:text-destructive">
                    Supprimer la barre latérale
                  </Button>
                )}
              </div>

              {content[page.id].sidebar ? (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor={`${page.id}-sidebar-title`}>Titre</Label>
                    <Input
                      id={`${page.id}-sidebar-title`}
                      value={content[page.id].sidebar.title}
                      onChange={(e) =>
                        handleContentChange(
                          page.id,
                          "sidebar",
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${page.id}-sidebar-content`}>Contenu</Label>
                    <Textarea
                      id={`${page.id}-sidebar-content`}
                      value={content[page.id].sidebar.content}
                      onChange={(e) =>
                        handleContentChange(
                          page.id,
                          "sidebar",
                          "content",
                          e.target.value
                        )
                      }
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Aucune barre latérale. Cliquez sur "Ajouter une barre latérale" pour en créer une.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Edit className="mr-2 h-4 w-4" /> Pied de page
              </h3>
              <div className="space-y-1">
                <Label htmlFor={`${page.id}-footer-text`}>Texte du pied de page</Label>
                <Input
                  id={`${page.id}-footer-text`}
                  value={content[page.id].footer.text}
                  onChange={(e) =>
                    handleContentChange(
                      page.id,
                      "footer",
                      "text",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="pt-6">
        <Button 
          onClick={handleSaveChanges} 
          className="w-full md:w-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer toutes les modifications"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentManager;
