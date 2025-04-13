
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StripeSettings from './StripeSettings';
import PayPalSettings from './PayPalSettings';

const PaymentGatewaySettings = () => {
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
          <StripeSettings />
        </TabsContent>
        
        <TabsContent value="paypal">
          <PayPalSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGatewaySettings;
