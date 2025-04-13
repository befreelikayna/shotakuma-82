import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { usePaymentSettings } from '@/hooks/use-payment-settings';

const StripeSettings = () => {
  const { settings, loading, saveSettings } = usePaymentSettings('stripe');
  const [stripeEnabled, setStripeEnabled] = useState(settings?.enabled || false);
  const [stripePublishableKey, setStripePublishableKey] = useState(settings?.publishable_key || '');
  const [stripeSecretKey, setStripeSecretKey] = useState(settings?.secret_key || '');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState(settings?.webhook_secret || '');
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await saveSettings({
        enabled: stripeEnabled,
        publishable_key: stripePublishableKey,
        secret_key: stripeSecretKey,
        webhook_secret: stripeWebhookSecret
      });
    } finally {
      setSaving(false);
    }
  };

  return (
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
        <Button onClick={handleSaveSettings} disabled={saving} className="mt-4">
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
  );
};

export default StripeSettings;
