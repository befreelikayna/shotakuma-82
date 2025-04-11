
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageContent } from "@/hooks/use-page-content";
import PageContentSection from "@/components/PageContentSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

interface DynamicPageProps {
  pageSlug: string;
}

const DynamicPage = ({ pageSlug }: DynamicPageProps) => {
  const { content, isLoading: contentLoading } = usePageContent(pageSlug);
  const [pageExists, setPageExists] = useState(true);
  const [isCheckingPage, setIsCheckingPage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPageExists = async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("slug")
          .eq("slug", pageSlug)
          .eq("is_published", true)
          .single();
        
        if (error || !data) {
          setPageExists(false);
          // Redirect to 404 page after a short delay
          setTimeout(() => navigate("/404"), 100);
        } else {
          setPageExists(true);
        }
      } catch (error) {
        console.error("Error checking page:", error);
        setPageExists(false);
      } finally {
        setIsCheckingPage(false);
      }
    };

    if (pageSlug) {
      checkPageExists();
    }
  }, [pageSlug, navigate]);

  if (isCheckingPage || !pageExists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement de la page...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-32 pb-12">
        <PageContentSection pageContent={content} isLoading={contentLoading} />
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
