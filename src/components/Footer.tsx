
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Discord } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-festival-primary text-white pt-16 pb-8">
      <div className="festival-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-festival-accent">SHO</span>TAKU
              </h2>
            </Link>
            <p className="text-sm text-slate-300 mb-6">
              Le plus grand Festival Marocain de l'anime, du Manga et de la culture Geek.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/shotakume"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/OTAKU.sho"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/shotakume"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@MarocEvents"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/KKGCF86z"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                aria-label="Discord"
              >
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors duration-300">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Programme
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Galerie
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Événement</h3>
            <ul className="space-y-2">
              <li>
                <a href="#tickets" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Billets
                </a>
              </li>
              <li>
                <a href="#cosplay" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Concours Cosplay
                </a>
              </li>
              <li>
                <a href="#exhibitors" className="text-slate-300 hover:text-white transition-colors duration-300">
                  Exposants
                </a>
              </li>
              <li>
                <a href="#faq" className="text-slate-300 hover:text-white transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-festival-accent mr-2 mt-0.5" />
                <span className="text-slate-300">Casablanca, Maroc</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-festival-accent mr-2 mt-0.5" />
                <a href="mailto:infos@shotaku.ma" className="text-slate-300 hover:text-white transition-colors duration-300">
                  infos@shotaku.ma
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400 mb-4 md:mb-0 text-center md:text-left">
            &copy; {currentYear} SHOTAKU. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <a href="#terms" className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
              Conditions d'utilisation
            </a>
            <a href="#privacy" className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
