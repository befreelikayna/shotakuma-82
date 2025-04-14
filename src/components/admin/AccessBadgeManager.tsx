import React, { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccessBadge } from "@/hooks/use-access-badges";

const initialBadgeState: Partial<AccessBadge> = {
  title: "",
  description: "",
  image_url: null,
  type: "Media",
  is_active: true,
};

const AccessBadgeManager = () => {
  const [badges, setBadges] = useState<AccessBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Partial<AccessBadge>>(initialBadgeState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("access_badges")
        .select("*")
        .order("type");

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

  const handleOpenDialog = (badge?: AccessBadge) => {
    if (badge) {
      setCurrentBadge({ ...badge });
    } else {
      setCurrentBadge({ ...initialBadgeState });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentBadge({ ...initialBadgeState });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentBadge((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentBadge((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentBadge((prev) => ({ ...prev, is_active: checked }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `access_badges/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      setCurrentBadge((prev) => ({ ...prev, image_url: data.publicUrl }));
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Error",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBadge.title || !currentBadge.description || !currentBadge.type) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { id, ...badgeData } = currentBadge;
      
      const validatedBadgeData = {
        title: badgeData.title!,
        description: badgeData.description!,
        type: badgeData.type!,
        image_url: badgeData.image_url,
        is_active: badgeData.is_active
      };
      
      if (id) {
        const { error } = await supabase
          .from("access_badges")
          .update(validatedBadgeData)
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Badge updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("access_badges")
          .insert([validatedBadgeData]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Badge created successfully.",
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving badge:", error);
      toast({
        title: "Error",
        description: "Could not save badge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    
    try {
      const { error } = await supabase
        .from("access_badges")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Badge deleted successfully.",
      });
      
      fetchBadges();
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description: "Could not delete badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Access Badges</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Badge
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-festival-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <TableRow key={badge.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100">
                        {badge.image_url ? (
                          <img 
                            src={badge.image_url} 
                            alt={badge.title}
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{badge.title}</TableCell>
                    <TableCell>{badge.type}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{badge.description}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        badge.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {badge.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(badge)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(badge.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No badges found. Add your first badge.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentBadge.id ? "Edit Badge" : "Create New Badge"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={currentBadge.title || ""}
                onChange={handleChange}
                placeholder="Badge Title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={currentBadge.type || "Media"}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Cosplay">Cosplay</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentBadge.description || ""}
                onChange={handleChange}
                placeholder="Badge Description"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Badge Image</Label>
              {currentBadge.image_url && (
                <div className="mb-2">
                  <div className="relative aspect-video w-full rounded-md overflow-hidden bg-slate-100 mb-2">
                    <img 
                      src={currentBadge.image_url} 
                      alt="Badge Preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <a 
                      href={currentBadge.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="truncate hover:underline"
                    >
                      {currentBadge.image_url}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={currentBadge.is_active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentBadge.id ? (
                  "Update Badge"
                ) : (
                  "Create Badge"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
        <p>
          Access badges are shown on the Access page and allow festival participants to apply
          for different access types based on their roles (Media, Cosplay, Team).
        </p>
      </div>
    </div>
  );
};

export default AccessBadgeManager;
