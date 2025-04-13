import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { usePaymentSettings } from '@/hooks/use-payment-settings';

const PayPalSettings = () => {
  const { settings, loading, saveSettings } = usePaymentSettings('paypal');
  const [paypalEnabled, setPaypalEnabled] = useState(settings?.enabled || false);
  const [paypalClientId, setPaypalClientId] = useState(settings?.client_id || '');
  const [paypalClientSecret, setPaypalClientSecret] = useState(settings?.client_secret || '');
  const [paypalMode, setPaypalMode] = useState(settings?.mode || 'sandbox');
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await saveSettings({
        enabled: paypalEnabled,
        client_id: paypalClientId,
        client_secret: paypalClientSecret,
        mode: paypalMode
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
          onClick={handleSaveSettings}
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
  );
};

export default PayPalSettings;
