
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { customSupabase } from '@/integrations/supabase/client';

interface SliderImage {
  id: string;
  image_url: string;
  order_number: number;
  active: boolean;
  link?: string | null;
}

const Slider = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch slider images from Supabase
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        setLoading(true);
        const { data, error } = await customSupabase
          .from('slider_images')
          .select('*')
          .eq('active', true)
          .order('order_number');

        if (error) {
          throw error;
        }

        if (data && Array.isArray(data)) {
          // Create properly typed SliderImage objects with safety checks
          const sliderData: SliderImage[] = data.map(item => ({
            id: typeof item?.id === 'string' ? item.id : String(item?.id || ''),
            image_url: typeof item?.image_url === 'string' ? item.image_url : String(item?.image_url || ''),
            order_number: typeof item?.order_number === 'number' ? item.order_number : Number(item?.order_number || 0),
            active: typeof item?.active === 'boolean' ? item.active : Boolean(item?.active ?? true),
            link: item?.link ? String(item.link) : null
          }));

          setImages(sliderData);
          console.log('Slider images loaded:', sliderData);
        }
      } catch (error) {
        console.error('Error fetching slider images:', error);
        // Set default images if there's an error
        setImages([
          {
            id: '1',
            image_url: '/placeholder.svg',
            order_number: 1,
            active: true
          },
          {
            id: '2',
            image_url: '/placeholder.svg',
            order_number: 2,
            active: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    // Auto-advance slides every 6 seconds
    const slideInterval = setInterval(goToNext, 6000);
    return () => clearInterval(slideInterval);
  }, [currentIndex, images.length]);

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If no images are available, show a placeholder
  if (images.length === 0) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Aucune image disponible</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]?.image_url || '/placeholder.svg'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
          alt={`Slide ${currentIndex + 1}`}
        />
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
