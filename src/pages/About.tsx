
import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="festival-container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-festival-primary mb-6">
                À propos de <span className="text-festival-accent">SHOTAKU</span>
              </h1>
              <p className="text-lg text-festival-secondary">
                Découvrez l'histoire et la mission derrière le plus grand festival d'anime au Maroc
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p>
                SHOTAKU est né de la passion commune de quelques amis pour la culture japonaise, l'anime et le manga. Ce qui a commencé comme une petite réunion entre passionnés en 2015 est devenu aujourd'hui le plus grand festival d'anime et de manga au Maroc.
              </p>

              <p>
                Notre mission est de créer un espace où les fans marocains de la culture japonaise peuvent se réunir, partager leur passion, et découvrir de nouvelles facettes de cette culture riche et diverse. Nous voulons également mettre en valeur les talents locaux et servir de pont culturel entre le Maroc et le Japon.
              </p>

              <h2>Notre Vision</h2>
              <p>
                Nous aspirons à faire de SHOTAKU un événement de référence non seulement au Maroc, mais dans toute l'Afrique du Nord. Notre vision est de créer une plateforme qui célèbre la diversité et la richesse de la culture japonaise, tout en encourageant la créativité et l'expression artistique locale.
              </p>

              <h2>Le Festival</h2>
              <p>
                SHOTAKU se déroule sur trois jours remplis d'activités diverses :
              </p>
              <ul>
                <li>Expositions d'art et de manga</li>
                <li>Concours de cosplay</li>
                <li>Panels et discussions avec des invités spéciaux</li>
                <li>Projections d'anime</li>
                <li>Ateliers créatifs (dessin manga, origami, calligraphie)</li>
                <li>Espace jeux vidéo et e-sports</li>
                <li>Zone marchande avec des produits exclusifs</li>
                <li>Performances musicales et culturelles</li>
              </ul>

              <h2>Notre Équipe</h2>
              <p>
                SHOTAKU est organisé par une équipe dévouée de passionnés qui travaillent toute l'année pour vous offrir une expérience inoubliable. Notre équipe rassemble des experts en organisation d'événements, des artistes, des spécialistes de la culture japonaise et des bénévoles enthousiastes.
              </p>

              <h2>Nos Partenaires</h2>
              <p>
                Le succès de SHOTAKU repose également sur le soutien précieux de nos partenaires, qui partagent notre passion et notre vision. Nous collaborons avec des entreprises locales et internationales, des institutions culturelles, des écoles d'art et des médias pour enrichir l'expérience du festival.
              </p>

              <p>
                Rejoignez-nous lors de la prochaine édition de SHOTAKU pour une célébration inoubliable de la culture japonaise au cœur du Maroc !
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
