
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

// These are hardcoded credentials for demo purposes
// In a real application, you would use Supabase auth properly
const ADMIN_EMAIL = "info@shotaku.ma";
const ADMIN_PASSWORD = "shotaku2025";

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes only, we're using a simple email/password check
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // First try to sign up the user if they don't exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            // Important: Set this to true to bypass email verification
            emailRedirectTo: window.location.origin,
          }
        });

        // Ignore error if user already exists
        console.log("Signup attempt result:", signUpError ? signUpError.message : "Success or user exists");
        
        // Now try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          // If we get email not confirmed error despite matching credentials
          if (error.message.includes("Email not confirmed") && 
              email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            
            // For demo purposes, we'll consider this a successful login
            console.log("Bypassing email confirmation for demo");
            onLogin(true);
            toast({
              title: "Connexion réussie",
              description: "Bienvenue dans le panneau d'administration",
            });
            return;
          }
          
          throw new Error("Authentication error: " + error.message);
        }
        
        // Authentication successful
        onLogin(true);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans le panneau d'administration",
        });
      } else {
        throw new Error("Identifiants invalides");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Veuillez vérifier vos identifiants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-soft p-6 md:p-8">
      <h2 className="text-2xl font-bold text-festival-primary mb-6 text-center">
        Connexion Admin
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
        
        {process.env.NODE_ENV !== 'production' && (
          <div className="text-xs text-muted-foreground mt-4 p-2 border border-dashed rounded">
            <div><strong>Email:</strong> info@shotaku.ma</div>
            <div><strong>Mot de passe:</strong> shotaku2025</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
