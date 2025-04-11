
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Trash, Edit2, Eye, EyeOff, Save, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Page {
  id: string;
  title: string;
  slug: string;
  path: string;
  is_published: boolean;
  layout: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface PageFormValues {
  title: string;
  slug: string;
  path: string;
  is_published: boolean;
  layout: string;
  meta_description: string;
}

const formatPath = (path: string) => {
  // Remove leading and trailing slashes, ensure it starts with /
  return '/' + path.replace(/^\/+|\/+$/g, '');
};

const formatSlug = (slug: string) => {
  // Convert to lowercase, remove special chars, replace spaces with hyphens
  return slug.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
};

const PageManager = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PageFormValues>({
    defaultValues: {
      title: "",
      slug: "",
      path: "",
      is_published: false,
      layout: "default",
      meta_description: "",
    },
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel("pages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pages" },
        () => {
          fetchPages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateDialog = () => {
    form.reset({
      title: "",
      slug: "",
      path: "",
      is_published: false,
      layout: "default",
      meta_description: "",
    });
    setCurrentPage(null);
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (page: Page) => {
    form.reset({
      title: page.title,
      slug: page.slug,
      path: page.path,
      is_published: page.is_published,
      layout: page.layout || "default",
      meta_description: page.meta_description || "",
    });
    setCurrentPage(page);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const createPageFile = async (title: string, slug: string, path: string, layout: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-page", {
        body: { title, slug, path, layout },
      });

      if (error) throw error;

      toast({
        title: "Fichier créé",
        description: `Le fichier pour la page "${title}" a été généré`,
      });
      
      console.log("Page file created:", data);
      return data;
    } catch (error) {
      console.error("Error creating page file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le fichier de la page",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onSubmit = async (values: PageFormValues) => {
    setIsSubmitting(true);
    try {
      // Format values
      const formattedValues = {
        ...values,
        slug: formatSlug(values.slug || values.title),
        path: formatPath(values.path || values.slug || values.title),
      };
      
      let result;
      if (isCreating) {
        // Create new page
        const { data, error } = await supabase
          .from("pages")
          .insert([formattedValues])
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        // Create the page file in the filesystem
        await createPageFile(
          result.title,
          result.slug,
          result.path,
          result.layout
        );
        
        toast({
          title: "Page créée",
          description: `La page "${values.title}" a été créée`,
        });
      } else {
        // Update existing page
        const { data, error } = await supabase
          .from("pages")
          .update(formattedValues)
          .eq("id", currentPage!.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        toast({
          title: "Page mise à jour",
          description: `La page "${values.title}" a été mise à jour`,
        });
      }

      setIsDialogOpen(false);
      fetchPages();
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la page",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublished = async (page: Page) => {
    try {
      const { error } = await supabase
        .from("pages")
        .update({ is_published: !page.is_published })
        .eq("id", page.id);

      if (error) throw error;
      
      toast({
        title: page.is_published ? "Page masquée" : "Page publiée",
        description: `La page "${page.title}" a été ${page.is_published ? "masquée" : "publiée"}`,
      });
    } catch (error) {
      console.error("Error updating page status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la page",
        variant: "destructive",
      });
    }
  };

  const deletePage = async (id: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page "${title}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Page supprimée",
        description: `La page "${title}" a été supprimée`,
      });
      
      fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page",
        variant: "destructive",
      });
    }
  };

  // Automatically update slug when title changes (only when creating)
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (isCreating && watchTitle) {
      form.setValue("slug", formatSlug(watchTitle));
      form.setValue("path", formatPath(formatSlug(watchTitle)));
    }
  }, [watchTitle, isCreating, form]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestion des Pages</h2>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <PlusCircle size={18} />
          <span>Nouvelle Page</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-festival-primary align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableCaption>Liste des pages du site</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Chemin</TableHead>
                <TableHead className="w-[120px]">Publié</TableHead>
                <TableHead className="w-[180px]">Créé le</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Aucune page n'a encore été créée.
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        {page.title}
                      </div>
                    </TableCell>
                    <TableCell>{page.path}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={page.is_published}
                          onCheckedChange={() => togglePublished(page)}
                          aria-label="Toggle page visibility"
                        />
                        <span className="text-sm text-muted-foreground">
                          {page.is_published ? "Publié" : "Brouillon"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(page.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(page)}
                        >
                          <Edit2 size={16} />
                          <span className="sr-only">Éditer</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePage(page.id, page.title)}
                        >
                          <Trash size={16} />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Créer une nouvelle page" : "Modifier la page"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de la page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="slug-de-la-page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/chemin-de-la-page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Layout</FormLabel>
                      <FormControl>
                        <Input placeholder="default" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Description (meta)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description pour les moteurs de recherche"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0">Publier la page</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {isCreating ? "Créer la page" : "Mettre à jour"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageManager;
