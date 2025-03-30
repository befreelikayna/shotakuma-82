
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

// This would be fetched from an API in a real application
const sliderImages = [
  {
    id: "1",
    imageUrl: "https://source.unsplash.com/random/1920x1080?anime",
    link: "https://example.com/anime",
  },
  {
    id: "2",
    imageUrl: "https://source.unsplash.com/random/1920x1080?cosplay",
    link: "https://example.com/cosplay",
  },
  {
    id: "3",
    imageUrl: "https://source.unsplash.com/random/1920x1080?japan",
    link: null,
  },
  {
    id: "4",
    imageUrl: "https://source.unsplash.com/random/1920x1080?manga",
    link: null,
  }
];

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Auto rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Slider Background */}
      <div className="absolute inset-0 z-0">
        {sliderImages.map((image, index) => (
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
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image.imageUrl})` }}
                >
                  {/* Overlay to ensure text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40"></div>
                </div>
              </a>
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image.imageUrl})` }}
              >
                {/* Overlay to ensure text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="festival-container relative z-10 mt-16">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-full shadow-soft"
            variants={itemVariants}
          >
            <span className="text-white font-medium text-sm">
              26-28 MARS 2024 • CASABLANCA, MAROC
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            variants={itemVariants}
          >
            Festival Marocain 
            <span className="text-festival-accent"> d'Anime</span> 
            <br />
            <span className="text-festival-accent">&</span> Manga
          </motion.h1>

          <motion.p
            className="max-w-2xl text-lg text-white mb-10"
            variants={itemVariants}
          >
            Le plus grand événement célébrant la culture japonaise, l'anime et le manga au Maroc. 
            Rejoignez-nous pour trois jours inoubliables d'expositions, de compétitions et de performances.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-16"
            variants={itemVariants}
          >
            <a
              href="#tickets"
              className="px-8 py-3 rounded-full bg-festival-accent text-white font-medium 
              shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90 hover:translate-y-[-2px]"
            >
              Obtenir des Billets
            </a>
            <a
              href="#program"
              className="px-8 py-3 rounded-full bg-white text-festival-primary font-medium 
              shadow-soft border border-slate-100 transition-all duration-300 
              hover:shadow-lg hover:bg-slate-50 hover:translate-y-[-2px]"
            >
              Voir le Programme
            </a>
          </motion.div>

          <motion.button
            onClick={handleScrollDown}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center justify-center 
            w-12 h-12 rounded-full bg-white shadow-soft animate-float transition-all duration-300 
            hover:shadow-md hover:bg-slate-50"
            aria-label="Scroll Down"
            variants={itemVariants}
          >
            <ChevronDown className="h-6 w-6 text-festival-primary" />
          </motion.button>
        </motion.div>
      </div>

      {/* Navigation dots for the slider */}
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
    </section>
  );
};

export default HeroSection;
