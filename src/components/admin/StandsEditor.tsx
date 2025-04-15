import React, { useState, useEffect } from "react";
import { Edit, Save, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStandsContent, StandsContent } from "@/hooks/use-stands-content";

const StandsEditor = () => {
  const { content, isLoading, refetch } = useStandsContent();
  const [editableContent, setEditableContent] = useState<StandsContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content && !editableContent) {
      setEditableContent(content);
    }
  }, [content, editableContent]);

  const handleSave = async () => {
    if (!editableContent) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('stands_content')
        .upsert(editableContent, { 
          onConflict: 'id' 
        });

      if (error) throw error;
      
      toast({
        title: "Changes saved",
        description: "The Stands page content has been updated successfully.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error saving stands content:", error);
      toast({
        title: "Error",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    if (content) {
      setEditableContent(content);
    }
    setIsEditing(false);
  };

  const isGoogleDocsUrl = (url: string) => {
    return url && url.includes('docs.google.com');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-festival-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Stands Page Editor</h2>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleReset} variant="outline">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Content
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg border shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editableContent?.title || ""}
              onChange={(e) => editableContent && setEditableContent({...editableContent, title: e.target.value})}
              disabled={!isEditing}
              placeholder="Page Title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editableContent?.description || ""}
              onChange={(e) => editableContent && setEditableContent({...editableContent, description: e.target.value})}
              disabled={!isEditing}
              placeholder="Page description"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              External URL
              {isEditing && isGoogleDocsUrl(editableContent?.url || "") && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Google Docs</span>
              )}
            </Label>
            <Input
              id="url"
              value={editableContent?.url || ""}
              onChange={(e) => editableContent && setEditableContent({...editableContent, url: e.target.value})}
              disabled={!isEditing}
              placeholder="https://exhibitors.shotaku.ma"
            />
            {editableContent?.url && (
              <a 
                href={editableContent.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm flex items-center text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open URL
              </a>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={editableContent?.is_active || false}
              onCheckedChange={(checked) => editableContent && setEditableContent({...editableContent, is_active: checked})}
              disabled={!isEditing}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="text-md font-medium mb-2">Preview</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-lg font-medium">{editableContent?.title || "Stands & Exhibitors"}</h4>
            <p className="text-sm text-gray-600 my-2">{editableContent?.description || "Discover our festival exhibitors and their stands"}</p>
            <div className="mt-2 text-sm text-gray-500">
              URL: {editableContent?.url || "Not set"}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Status: {editableContent?.is_active ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {isEditing && isGoogleDocsUrl(editableContent?.url || "") && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Tips for Google Docs:</strong> For Google Docs to work in the iframe, make sure to:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Ensure the document is set to "Anyone with the link can view"</li>
              <li>Use the "/preview" format instead of "/edit" or "/view" (e.g., https://docs.google.com/document/d/DOC_ID/preview)</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-700">
        <p>
          The Stands page displays content from this editor and embeds the external URL in an iframe.
          Make sure the external URL is accessible and properly formatted.
        </p>
      </div>
    </div>
  );
};

export default StandsEditor;
