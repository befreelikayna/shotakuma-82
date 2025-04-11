
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const pageTemplate = (title: string, slug: string, layout: string) => `
import React from "react";
import { usePageContent } from "@/hooks/use-page-content";
import PageContentSection from "@/components/PageContentSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ${title.replace(/[^a-zA-Z0-9]/g, '')}Page = () => {
  const { content, isLoading } = usePageContent("${slug}");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="pt-20 md:pt-32">
        <PageContentSection pageContent={content} isLoading={isLoading} />
      </div>
      <Footer />
    </div>
  );
};

export default ${title.replace(/[^a-zA-Z0-9]/g, '')}Page;
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { title, slug, path, layout } = await req.json();
    
    // Validate input
    if (!title || !slug || !path) {
      return new Response(
        JSON.stringify({ error: "Title, slug, and path are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Generate file content for the new page
    const fileContent = pageTemplate(title, slug, layout || 'default');
    
    // In a real edge function, this would write to filesystem or trigger a Git operation
    // For this demo, we'll return the content that should be created
    
    const response = {
      success: true,
      message: "Page file content generated successfully",
      fileContent,
      path,
    };
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
