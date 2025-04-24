import { motion } from "framer-motion";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CountdownTrigger from "./CountdownTrigger";

interface SliderImage {
  id: string;
  image_url: string;
  link: string | null;
  order_number: number;
  active: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const targetDate = new Date("2025-05-08T00:00:00");

  const fetchSliderImages = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('slider_images').select('*').eq('active', true).order('order_number');
      if (error) {
        console.error('Error fetching slider images:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les images du slider",
          variant: "destructive"
        });
        return;
      }
      if (data && data.length > 0) {
        console.log("Slider images loaded:", data);
        setSliderImages(data);
      } else {
        console.log("No active slider images found");
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderImages();
    const channel = supabase.channel('public:slider_images').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'slider_images'
    }, () => {
      console.log('Slider images changed, refreshing...');
      fetchSliderImages();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (sliderImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(difference / (1000 * 60 * 60) % 24),
          minutes: Math.floor(difference / 1000 / 60 % 60),
          seconds: Math.floor(difference / 1000 % 60)
        };
      } else {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  const defaultBackground = "bg-gradient-to-br from-slate-900 to-gray-800";

  const handleRefresh = () => {
    fetchSliderImages();
    toast({
      title: "Actualisation",
      description: "Images du slider actualisées"
    });
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0 z-0">
        {sliderImages.length > 0 ? (
          sliderImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {image.link ? (
                <a
                  href={image.link}
                  className="block absolute inset-0 cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center w-full h-full"
                    style={{
                      backgroundImage: `url(${image.image_url})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
                  </div>
                </a>
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center w-full h-full"
                  style={{
                    backgroundImage: `url(${image.image_url})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-gray-800 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          </div>
        )}
      </div>

      <div className="festival-container relative z-10 flex flex-col items-center">
        {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={handleRefresh}
            className="absolute top-0 right-4 p-2 bg-black/30 rounded-full hover:bg-black/40 transition-colors"
            title="Refresh slider images"
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </button>
        )}

        <motion.div
          className="flex flex-col items-center text-center max-w-7xl mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="inline-block mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-full shadow-soft" variants={itemVariants}>
            <span className="text-white font-medium text-xs sm:text-sm">ÉVENT LE 8.9.10.11 MAY 2025 • CASABLANCA, MAROC</span>
          </motion.div>

          <motion.h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight" variants={itemVariants}>
            Festival Marocain 
            <span className="text-festival-accent"> d'Anime</span> 
            <br />
            <span className="text-festival-accent">&</span> Manga
          </motion.h1>

          <motion.p className="max-w-2xl text-base sm:text-lg text-white mb-6 sm:mb-10" variants={itemVariants}>
            Le plus grand événement célébrant la culture japonaise, l'anime et le manga au Maroc. 
            Rejoignez-nous pour trois jours inoubliables d'expositions, de compétitions et de performances.
          </motion.p>

          <motion.div className="flex justify-center mb-6 sm:mb-10" variants={itemVariants}>
            <div className="flex space-x-2 md:space-x-4 bg-black/30 backdrop-blur-sm px-6 py-4 rounded-lg border border-white/10">
              <div className="elementor-countdown-item flex flex-col items-center">
                <span className="elementor-countdown-digits elementor-countdown-days text-2xl md:text-3xl font-bold text-festival-accent">{formatTime(timeLeft.days)}</span>
                <span className="elementor-countdown-label text-xs text-white/80 uppercase mt-1">Days</span>
              </div>
              <div className="flex items-center text-white/60 text-2xl font-bold">:</div>
              <div className="elementor-countdown-item flex flex-col items-center">
                <span className="elementor-countdown-digits elementor-countdown-hours text-2xl md:text-3xl font-bold text-festival-accent">{formatTime(timeLeft.hours)}</span>
                <span className="elementor-countdown-label text-xs text-white/80 uppercase mt-1">Hours</span>
              </div>
              <div className="flex items-center text-white/60 text-2xl font-bold">:</div>
              <div className="elementor-countdown-item flex flex-col items-center">
                <span className="elementor-countdown-digits elementor-countdown-minutes text-2xl md:text-3xl font-bold text-festival-accent">{formatTime(timeLeft.minutes)}</span>
                <span className="elementor-countdown-label text-xs text-white/80 uppercase mt-1">Minutes</span>
              </div>
              <div className="flex items-center text-white/60 text-2xl font-bold">:</div>
              <div className="elementor-countdown-item flex flex-col items-center">
                <span className="elementor-countdown-digits elementor-countdown-seconds text-2xl md:text-3xl font-bold text-festival-accent">{formatTime(timeLeft.seconds)}</span>
                <span className="elementor-countdown-label text-xs text-white/80 uppercase mt-1">Seconds</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10 w-full sm:w-auto" variants={itemVariants}>
            <a href="https://bit.ly/ShotakuTicket" className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-festival-accent text-white font-medium 
              shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90 hover:translate-y-[-2px] text-center">
              Get Your Ticket
            </a>
            <a href="/stands" className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white text-festival-primary font-medium 
              shadow-soft border border-slate-100 transition-all duration-300 
              hover:shadow-lg hover:bg-slate-50 hover:translate-y-[-2px] text-center">
              Reserve Your Stand
            </a>
            <CountdownTrigger variant="secondary" label="Voir Countdown" className="w-full sm:w-auto" />
          </motion.div>

          <motion.button onClick={handleScrollDown} aria-label="Scroll Down" variants={itemVariants} className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-soft animate-float transition-all duration-300 hover:shadow-md hover:bg-slate-50 py-0 px-0 mx-[240px] my-[120px]">
            <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-festival-primary" />
          </motion.button>
        </motion.div>
      </div>

      {sliderImages.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
