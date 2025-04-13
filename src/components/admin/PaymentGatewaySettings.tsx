
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentGatewaySettings = () => {
  // Stripe settings
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  
  // PayPal settings
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalMode, setPaypalMode] = useState("sandbox");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        setLoading(true);
        // In a real application, fetch stored settings from your database
        const { data: stripeData, error: stripeError } = await supabase
          .from('theme_settings')
          .select('value')
          .eq('key', 'stripe_settings')
          .single();

        if (stripeData?.value) {
          const stripeSettings = JSON.parse(stripeData.value);
          setStripeEnabled(stripeSettings.enabled || false);
          setStripePublishableKey(stripeSettings.publishableKey || "");
          setStripeSecretKey(stripeSettings.secretKey || "");
          setStripeWebhookSecret(stripeSettings.webhookSecret || "");
        }

        const { data: paypalData, error: paypalError } = await supabase
          .from('theme_settings')
          .select('value')
          .eq('key', 'paypal_settings')
          .single();

        if (paypalData?.value) {
          const paypalSettings = JSON.parse(paypalData.value);
          setPaypalEnabled(paypalSettings.enabled || false);
          setPaypalClientId(paypalSettings.clientId || "");
          setPaypalClientSecret(paypalSettings.clientSecret || "");
          setPaypalMode(paypalSettings.mode || "sandbox");
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast({
          title: "Error",
          description: "Could not load payment settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  const saveStripeSettings = async () => {
    try {
      setSaving(true);
      
      // In a real application, save to your database
      const { error } = await supabase
        .from('theme_settings')
        .upsert({
          key: 'stripe_settings',
          value: JSON.stringify({
            enabled: stripeEnabled,
            publishableKey: stripePublishableKey,
            secretKey: stripeSecretKey,
            webhookSecret: stripeWebhookSecret,
          })
        });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Stripe payment settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving Stripe settings:", error);
      toast({
        title: "Error",
        description: "Could not save Stripe settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePayPalSettings = async () => {
    try {
      setSaving(true);
      
      // In a real application, save to your database
      const { error } = await supabase
        .from('theme_settings')
        .upsert({
          key: 'paypal_settings',
          value: JSON.stringify({
            enabled: paypalEnabled,
            clientId: paypalClientId,
            clientSecret: paypalClientSecret,
            mode: paypalMode,
          })
        });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "PayPal payment settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving PayPal settings:", error);
      toast({
        title: "Error",
        description: "Could not save PayPal settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-festival-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Payment Gateway Settings</h2>
          <p className="text-muted-foreground">
            Configure your payment gateways to accept payments on your festival site
          </p>
        </div>
      </div>

      <Tabs defaultValue="stripe">
        <TabsList className="mb-4">
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Stripe Configuration</CardTitle>
                  <CardDescription>
                    Set up Stripe to accept credit card payments
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="stripe-enabled">Enabled</Label>
                  <Switch
                    id="stripe-enabled"
                    checked={stripeEnabled}
                    onCheckedChange={setStripeEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                  <Input
                    id="stripe-publishable-key"
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    placeholder="pk_test_..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret-key">Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    type="password"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook-secret">Webhook Secret (Optional)</Label>
                  <Input
                    id="stripe-webhook-secret"
                    type="password"
                    value={stripeWebhookSecret}
                    onChange={(e) => setStripeWebhookSecret(e.target.value)}
                    placeholder="whsec_..."
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg mt-2">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important</p>
                      <p>Store your Stripe secret keys securely. Never expose them to the public.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={saveStripeSettings}
                disabled={saving}
                className="mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paypal">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>PayPal Configuration</CardTitle>
                  <CardDescription>
                    Set up PayPal to accept payments through PayPal
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="paypal-enabled">Enabled</Label>
                  <Switch
                    id="paypal-enabled"
                    checked={paypalEnabled}
                    onCheckedChange={setPaypalEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-mode">Environment</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="sandbox"
                        name="paypal-mode"
                        value="sandbox"
                        checked={paypalMode === "sandbox"}
                        onChange={() => setPaypalMode("sandbox")}
                        className="h-4 w-4 mr-2"
                      />
                      <Label htmlFor="sandbox">Sandbox (Testing)</Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="live"
                        name="paypal-mode"
                        value="live"
                        checked={paypalMode === "live"}
                        onChange={() => setPaypalMode("live")}
                        className="h-4 w-4 mr-2"
                      />
                      <Label htmlFor="live">Live (Production)</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">Client ID</Label>
                  <Input
                    id="paypal-client-id"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    placeholder="Your PayPal client ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-secret">Client Secret</Label>
                  <Input
                    id="paypal-client-secret"
                    type="password"
                    value={paypalClientSecret}
                    onChange={(e) => setPaypalClientSecret(e.target.value)}
                    placeholder="Your PayPal client secret"
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg mt-2">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important</p>
                      <p>Create a PayPal Developer account to get your API credentials. Keep your credentials secure.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={savePayPalSettings}
                disabled={saving}
                className="mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGatewaySettings;
