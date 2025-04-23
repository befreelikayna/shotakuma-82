
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  category: string | null;
  order_number: number;
  active: boolean;
}

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Format URL safely
  const formatUrl = (url: string | null): string => {
    if (!url) return '';
    
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
      }
      return url;
    } catch (e) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  // Fetch partners from Supabase
  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('active', true)
        .order('category')
        .order('order_number');
      
      if (error) {
        console.error('Error fetching partners:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        setPartners(data as Partner[]);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(p => p.category || 'sponsor')));
        setCategories(uniqueCategories as string[]);
        
        // Set initial active category
        if (uniqueCategories.length > 0 && !activeCategory) {
          setActiveCategory(uniqueCategories[0] as string);
        }
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    
    // Set up a subscription to listen for changes to the partners table
    const channel = supabase
      .channel('public:partners')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'partners' 
        }, 
        () => {
          fetchPartners();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get display name for category
  const getCategoryDisplay = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'sponsor': 'Sponsors',
      'partner': 'Partenaires',
      'media': 'Médias',
      'institutional': 'Institutionnels'
    };
    
    return categoryMap[category] || category;
  };

  const filteredPartners = activeCategory 
    ? partners.filter(p => p.category === activeCategory) 
    : partners;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <motion.section 
        className="py-20 pt-28 md:pt-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="festival-container">
          <div className="text-center mb-12">
            <h1 className="section-heading inline-block">Nos Partenaires</h1>
            <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
              Découvrez tous nos partenaires qui contribuent à faire du festival SHOTAKU un événement exceptionnel.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-2 border-festival-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Category filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === category
                          ? 'bg-festival-primary text-white'
                          : 'bg-slate-100 text-festival-secondary hover:bg-slate-200'
                      }`}
                    >
                      {getCategoryDisplay(category)}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === null
                        ? 'bg-festival-primary text-white'
                        : 'bg-slate-100 text-festival-secondary hover:bg-slate-200'
                    }`}
                  >
                    Tous
                  </button>
                </div>
              )}
              
              {/* Partners grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPartners.map(partner => (
                  <motion.div
                    key={partner.id}
                    className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="h-24 flex items-center justify-center mb-4">
                      {partner.website_url ? (
                        <a 
                          href={formatUrl(partner.website_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full h-full flex items-center justify-center"
                        >
                          <img 
                            src={partner.logo_url} 
                            alt={`Logo de ${partner.name}`} 
                            className="max-h-24 max-w-full object-contain"
                          />
                        </a>
                      ) : (
                        <img 
                          src={partner.logo_url} 
                          alt={`Logo de ${partner.name}`} 
                          className="max-h-24 max-w-full object-contain"
                        />
                      )}
                    </div>
                    
                    <h3 className="text-sm font-medium text-center text-festival-primary mb-1">
                      {partner.name}
                    </h3>
                    
                    {partner.category && (
                      <span className="text-xs text-festival-secondary bg-slate-100 px-2 py-1 rounded-full">
                        {getCategoryDisplay(partner.category)}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.section>
      
      <Footer />
    </div>
  );
};

export default Partners;
