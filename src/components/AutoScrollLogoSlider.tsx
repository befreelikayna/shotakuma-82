
import { useState, useEffect } from 'react';
import { customSupabase, Partner, safeDataAccess } from '@/integrations/supabase/client';

const AutoScrollLogoSlider = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await customSupabase
        .from('partners')
        .select('*')
        .eq('active', true)
        .order('order_number');
      
      if (error) {
        console.error('Error fetching partners for auto scroll:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Create properly typed partner objects
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
      }
    } catch (error) {
      console.error('Error fetching partners for auto scroll:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPartners();
    
    const channel = customSupabase
      .channel('auto-scroll-partner-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'partners' 
        }, 
        () => {
          console.log('Partners changed, refreshing auto-scroll logos...');
          fetchPartners();
        })
      .subscribe();
    
    return () => {
      customSupabase.removeChannel(channel);
    };
  }, []);
  
  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (partners.length === 0) {
    return null;
  }
  
  // Create duplicate partners array for seamless scrolling
  const doubledPartners = [...partners, ...partners];
  
  return (
    <div className="py-10 bg-slate-50">
      <div className="festival-container mb-6">
        <h3 className="text-xl font-medium text-center text-festival-primary">Nos Partenaires</h3>
      </div>
      <div className="overflow-hidden relative">
        <div className="slider-track w-[200%] flex gap-12">
          {/* First set of logos */}
          <div className="flex gap-12 w-1/2">
            {partners.map((partner) => (
              <div key={`first-${partner.id}`} className="h-16 flex items-center">
                {partner.website_url ? (
                  <a 
                    href={partner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-full flex items-center"
                  >
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name} 
                      className="h-12 object-contain grayscale hover:grayscale-0 transition" 
                    />
                  </a>
                ) : (
                  <img 
                    src={partner.logo_url} 
                    alt={partner.name} 
                    className="h-12 object-contain grayscale hover:grayscale-0 transition" 
                  />
                )}
              </div>
            ))}
          </div>
          {/* Second set of logos (duplicate for infinite scroll) */}
          <div className="flex gap-12 w-1/2">
            {partners.map((partner) => (
              <div key={`second-${partner.id}`} className="h-16 flex items-center">
                {partner.website_url ? (
                  <a 
                    href={partner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-full flex items-center"
                  >
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name} 
                      className="h-12 object-contain grayscale hover:grayscale-0 transition" 
                    />
                  </a>
                ) : (
                  <img 
                    src={partner.logo_url} 
                    alt={partner.name} 
                    className="h-12 object-contain grayscale hover:grayscale-0 transition" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoScrollLogoSlider;
