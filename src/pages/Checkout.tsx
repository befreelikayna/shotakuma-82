
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, Ticket } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Checkout = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!ticketId) {
      navigate("/tickets");
      return;
    }

    const fetchTicket = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", ticketId)
          .single();
        
        if (error) throw error;
        if (!data) {
          toast({
            title: "Ticket Not Found",
            description: "We couldn't find the ticket you're looking for.",
            variant: "destructive",
          });
          navigate("/tickets");
          return;
        }
        
        setTicket(data);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast({
          title: "Error",
          description: "Could not load ticket information. Please try again later.",
          variant: "destructive",
        });
        navigate("/tickets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId, navigate]);

  const handleCheckout = async () => {
    if (!ticket || !paymentMethod) return;
    
    try {
      setProcessing(true);
      
      // Normally we would create a Stripe or PayPal checkout session here
      // For now we'll just show a toast message
      if (paymentMethod === "stripe") {
        // In a real app, create a Stripe Checkout session via Supabase Edge Function
        toast({
          title: "Redirecting to Stripe",
          description: "You'll be redirected to complete your payment shortly.",
        });
        
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // This would be replaced with actual Stripe checkout redirect
        toast({
          title: "Stripe Integration",
          description: "Integration with Stripe would redirect to payment page",
        });
      } else if (paymentMethod === "paypal") {
        // In a real app, create a PayPal Checkout session
        toast({
          title: "Redirecting to PayPal",
          description: "You'll be redirected to complete your payment shortly.",
        });
        
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // This would be replaced with actual PayPal checkout redirect
        toast({
          title: "PayPal Integration",
          description: "Integration with PayPal would redirect to payment page",
        });
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast({
        title: "Checkout Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const selectPaymentMethod = (method: "stripe" | "paypal") => {
    setPaymentMethod(method);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="pt-20 md:pt-32 pb-20 flex justify-center">
          <div className="animate-spin h-10 w-10 border-2 border-festival-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 md:pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-festival-primary mb-6">Checkout</h1>
            
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-festival-secondary">Ticket Type:</span>
                  <span className="font-medium">{ticket.name}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-festival-secondary">Price:</span>
                  <span className="font-medium">{ticket.price} MAD</span>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>This is a demo checkout page. No actual payment will be processed.</p>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-4 mb-8">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "stripe" 
                        ? "border-festival-primary bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => selectPaymentMethod("stripe")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                        paymentMethod === "stripe" ? "border-festival-primary" : "border-gray-300"
                      }`}>
                        {paymentMethod === "stripe" && <div className="w-3 h-3 rounded-full bg-festival-primary"></div>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pay with Credit Card (Stripe)</p>
                        <p className="text-sm text-gray-500">Secure payment via Stripe</p>
                      </div>
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paypal" 
                        ? "border-festival-primary bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => selectPaymentMethod("paypal")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                        paymentMethod === "paypal" ? "border-festival-primary" : "border-gray-300"
                      }`}>
                        {paymentMethod === "paypal" && <div className="w-3 h-3 rounded-full bg-festival-primary"></div>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pay with PayPal</p>
                        <p className="text-sm text-gray-500">You will be redirected to PayPal</p>
                      </div>
                      <div className="text-blue-600 font-bold text-lg">PayPal</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={!paymentMethod || processing}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                    !paymentMethod || processing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-festival-accent hover:bg-opacity-90"
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${ticket.price} MAD`
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
