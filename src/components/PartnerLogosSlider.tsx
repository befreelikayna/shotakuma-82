
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customSupabase, Partner, safeDataAccess } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PartnerLogosSlider = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch partner logos from Supabase
  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await customSupabase
        .from('partners')
        .select('*')
        .eq('active', true)
        .order('order_number');
      
      if (error) {
        console.error('Error fetching partner logos:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les logos des partenaires",
          variant: "destructive",
        });
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Create properly typed Partner objects
        const partnersData: Partner[] = data.map(item => ({
          id: safeDataAccess(item?.id, ''),
          name: safeDataAccess(item?.name, ''),
          logo_url: safeDataAccess(item?.logo_url, ''),
          website_url: item?.website_url ? String(item.website_url) : null,
          order_number: safeDataAccess(item?.order_number, 0),
          active: safeDataAccess(item?.active, true),
          category: item?.category ? String(item.category) : null,
        }));
        
        setPartners(partnersData);
        console.log('Partner logos loaded:', partnersData);
      }
    } catch (error) {
      console.error('Error fetching partner logos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format URLs safely
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
    fetchPartners();
    
    // Set up a subscription to listen for changes to the partners table
    const channel = customSupabase
      .channel('public:partners')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'partners' 
        }, 
        () => {
          console.log('Partners changed, refreshing...');
          fetchPartners();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);

  // If there are no partners or still loading, don't render the section
  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (partners.length === 0) {
    return null; // Don't render anything if no partners
  }

  return (
    <section className="py-14 bg-white">
      <div className="festival-container">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-heading inline-block">Nos Partenaires</h2>
          <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
            Merci à tous nos partenaires qui rendent cet événement possible.
          </p>
        </motion.div>

        <div className="mt-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="pl-4 md:basis-1/3 lg:basis-1/5">
                  <div className="p-4 h-32 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
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
                          className="max-h-20 max-w-full object-contain"
                        />
                      </a>
                    ) : (
                      <img 
                        src={partner.logo_url} 
                        alt={`Logo de ${partner.name}`} 
                        className="max-h-20 max-w-full object-contain"
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious className="border border-slate-200 -left-4 hover:bg-festival-primary hover:text-white hover:border-festival-primary" />
              <CarouselNext className="border border-slate-200 -right-4 hover:bg-festival-primary hover:text-white hover:border-festival-primary" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default PartnerLogosSlider;
