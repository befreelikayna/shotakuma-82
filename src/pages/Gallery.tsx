
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: "cosplay" | "event" | "artwork" | "guests";
  type: "image" | "video";
};

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  
  // Fetch gallery items from Supabase
  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les éléments de la galerie",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        console.log("Gallery items loaded:", data);
        setGalleryItems(data as GalleryItem[]);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGalleryItems();
    
    // Set up a realtime subscription 
    const channel = supabase
      .channel('public:gallery')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery_items' }, 
        () => {
          console.log('Gallery items changed, refreshing...');
          fetchGalleryItems();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
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

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Chargement de la galerie...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>Aucun élément trouvé pour cette catégorie.</p>
              </div>
            ) : (
              /* Gallery Grid */
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
                      {item.type === "image" ? (
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="relative aspect-[4/3] bg-slate-200 flex items-center justify-center">
                          <video 
                            src={item.src} 
                            className="object-cover w-full h-full" 
                            muted 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="text-white text-lg">Cliquez pour lire la vidéo</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm">{item.alt}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

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
                
                {selectedImage.type === "image" ? (
                  <motion.img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-w-[90%] max-h-[80vh] object-contain rounded-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.video
                    src={selectedImage.src}
                    className="max-w-[90%] max-h-[80vh] object-contain rounded-md"
                    controls
                    autoPlay
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
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
