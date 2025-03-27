
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: "cosplay" | "event" | "artwork" | "guests";
};

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  
  // Sample gallery items
  const galleryItems: GalleryItem[] = [
    { id: "1", src: "https://source.unsplash.com/random/800x600?anime", alt: "Cosplay competition", category: "cosplay" },
    { id: "2", src: "https://source.unsplash.com/random/800x600?manga", alt: "Main stage performance", category: "event" },
    { id: "3", src: "https://source.unsplash.com/random/800x600?japan", alt: "Manga exhibition", category: "artwork" },
    { id: "4", src: "https://source.unsplash.com/random/800x600?cosplay", alt: "Guest panel discussion", category: "guests" },
    { id: "5", src: "https://source.unsplash.com/random/800x600?festival", alt: "Cosplay group photo", category: "cosplay" },
    { id: "6", src: "https://source.unsplash.com/random/800x600?art", alt: "Artist showcase", category: "artwork" },
    { id: "7", src: "https://source.unsplash.com/random/800x600?cartoon", alt: "Audience at main event", category: "event" },
    { id: "8", src: "https://source.unsplash.com/random/800x600?costume", alt: "Special guest signing", category: "guests" },
    { id: "9", src: "https://source.unsplash.com/random/800x600?digital-art", alt: "Digital art exhibition", category: "artwork" },
    { id: "10", src: "https://source.unsplash.com/random/800x600?convention", alt: "Convention floor", category: "event" },
    { id: "11", src: "https://source.unsplash.com/random/800x600?comic", alt: "Manga workshop", category: "artwork" },
    { id: "12", src: "https://source.unsplash.com/random/800x600?character", alt: "Character cosplay", category: "cosplay" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredItems = activeFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const navigateImage = (direction: "next" | "prev") => {
    if (!selectedImage) return;
    
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    let newIndex;
    
    if (direction === "next") {
      newIndex = (currentIndex + 1) % filteredItems.length;
    } else {
      newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    }
    
    setSelectedImage(filteredItems[newIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        navigateImage("next");
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, filteredItems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-festival-primary mb-6">
                Galerie Photo
              </h1>
              <p className="text-lg text-festival-secondary max-w-2xl mx-auto">
                Explorez les moments mémorables des éditions précédentes du festival SHOTAKU
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 rounded-full bg-white shadow-soft overflow-x-auto">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "all"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setActiveFilter("cosplay")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "cosplay"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Cosplay
                </button>
                <button
                  onClick={() => setActiveFilter("event")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "event"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Événements
                </button>
                <button
                  onClick={() => setActiveFilter("artwork")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "artwork"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Œuvres d'art
                </button>
                <button
                  onClick={() => setActiveFilter("guests")}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === "guests"
                      ? "bg-festival-accent text-white shadow-accent"
                      : "text-festival-secondary hover:bg-slate-100"
                  }`}
                >
                  Invités
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0 },
                animate: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="overflow-hidden rounded-xl shadow-soft group cursor-pointer"
                  onClick={() => openLightbox(item)}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5 }
                    }
                  }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm">{item.alt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Lightbox */}
            {selectedImage && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors duration-300"
                  aria-label="Close lightbox"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <motion.img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-[90%] max-h-[80vh] object-contain rounded-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                  <p className="text-lg">{selectedImage.alt}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
