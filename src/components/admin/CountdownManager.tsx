
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useCountdownSettings, CountdownSettings } from "@/hooks/use-countdown-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CountdownPopup from "../CountdownPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CountdownManager: React.FC = () => {
  const { settings, loading, fetchSettings, saveSettings } = useCountdownSettings();
  const [editSettings, setEditSettings] = useState<CountdownSettings | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (settings && !loading) {
      setEditSettings(settings);
    }
  }, [settings, loading]);

  const handleSave = async () => {
    if (!editSettings) return;
    
    setIsSaving(true);
    const success = await saveSettings(editSettings);
    setIsSaving(false);
    
    if (success) {
      toast({
        title: "Success",
        description: "Countdown settings have been saved.",
      });
      fetchSettings();
    } else {
      toast({
        title: "Error",
        description: "Failed to save countdown settings.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div>
      {editSettings && (
        <>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">General Settings</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Countdown Settings</CardTitle>
                  <CardDescription>Configure your countdown timer settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Countdown Title</Label>
                    <Input 
                      id="title"
                      value={editSettings.title}
                      onChange={(e) => setEditSettings({...editSettings, title: e.target.value})}
                      placeholder="Countdown Title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input 
                      id="targetDate"
                      type="datetime-local"
                      value={editSettings.targetDate.slice(0, 16)}
                      onChange={(e) => setEditSettings({...editSettings, targetDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enabled"
                      checked={editSettings.enabled}
                      onCheckedChange={(checked) => setEditSettings({...editSettings, enabled: checked})}
                    />
                    <Label htmlFor="enabled">Enable Countdown</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="showOnLoad"
                      checked={editSettings.showOnLoad}
                      onCheckedChange={(checked) => setEditSettings({...editSettings, showOnLoad: checked})}
                    />
                    <Label htmlFor="showOnLoad">Show on Page Load</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayDuration">
                      Auto Close After (seconds, 0 = never)
                    </Label>
                    <Input 
                      id="displayDuration"
                      type="number"
                      min="0"
                      value={editSettings.displayDuration || 0}
                      onChange={(e) => setEditSettings({
                        ...editSettings, 
                        displayDuration: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look of your countdown timer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="backgroundColor"
                        type="color"
                        value={editSettings.backgroundColor}
                        onChange={(e) => setEditSettings({...editSettings, backgroundColor: e.target.value})}
                        className="w-12 h-12 p-1"
                      />
                      <Input 
                        value={editSettings.backgroundColor}
                        onChange={(e) => setEditSettings({...editSettings, backgroundColor: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="textColor"
                        type="color"
                        value={editSettings.textColor}
                        onChange={(e) => setEditSettings({...editSettings, textColor: e.target.value})}
                        className="w-12 h-12 p-1"
                      />
                      <Input 
                        value={editSettings.textColor}
                        onChange={(e) => setEditSettings({...editSettings, textColor: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="button" onClick={handlePreviewClick}>
                      Preview Countdown
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
          
          {previewVisible && (
            <CountdownPopup
              targetDate={new Date(editSettings.targetDate)}
              title={editSettings.title}
              backgroundColor={editSettings.backgroundColor}
              textColor={editSettings.textColor}
              showPopup={true}
              onClose={() => setPreviewVisible(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CountdownManager;
