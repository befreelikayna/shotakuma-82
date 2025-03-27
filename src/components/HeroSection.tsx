
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
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
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-festival-accent opacity-5 rounded-full blur-3xl animate-pulse-light"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
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
            <span className="text-festival-primary font-medium text-sm">
              26-28 MARS 2024 • CASABLANCA, MAROC
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-festival-primary mb-6 tracking-tight"
            variants={itemVariants}
          >
            Festival Marocain 
            <span className="text-festival-accent"> d'Anime</span> 
            <br />
            <span className="text-festival-accent">&</span> Manga
          </motion.h1>

          <motion.p
            className="max-w-2xl text-lg text-festival-secondary mb-10"
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
    </section>
  );
};

export default HeroSection;
