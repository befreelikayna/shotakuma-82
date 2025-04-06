
import React, { useState, useEffect } from 'react';
import { customSupabase } from '@/integrations/supabase/client';

interface SliderImage {
  id: string;
  image_url: string;
  link: string | null;
  order_number: number;
  active: boolean;
}

const SliderComponent = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await customSupabase
          .from('slider_images')
          .select('*')
          .eq('active', true)
          .order('order_number');

        if (error) {
          throw error;
        }

        if (data) {
          setImages(data as SliderImage[]);
          console.info('Slider images loaded:', data);
        }
      } catch (error) {
        console.error('Error loading slider images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="animate-spin h-12 w-12 border-4 border-festival-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Aucune image disponible</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.image_url}
            alt={`Slider image ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
      ))}
    </div>
  );
};

export default SliderComponent;
