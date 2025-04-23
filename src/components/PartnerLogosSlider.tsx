
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  category: string | null;
  active: boolean;
}

const PartnerLogosSlider = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('active', true)
          .order('order_number');
        
        if (error) {
          console.error('Error fetching partners:', error);
          return;
        }
        
        if (data) {
          console.log("Fetched partners:", data);
          setPartners(data);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();

    const channel = supabase
      .channel('public:partners')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'partners' }, 
        () => {
          console.log('Partners changed, refreshing...');
          fetchPartners();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-transparent" id="partners">
      <div className="festival-container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-heading inline-block text-white">Nos Partenaires</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-4">
            Découvrez les partenaires qui nous font confiance et contribuent au succès de notre festival.
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="flex space-x-8 py-8 animate-scroll">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                className="flex-none w-48 h-24 relative bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {partner.website_url ? (
                  <a
                    href={formatUrl(partner.website_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative group"
                  >
                    <img
                      src={partner.logo_url}
                      alt={`Logo de ${partner.name}`}
                      className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-80"
                    />
                  </a>
                ) : (
                  <img
                    src={partner.logo_url}
                    alt={`Logo de ${partner.name}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerLogosSlider;
