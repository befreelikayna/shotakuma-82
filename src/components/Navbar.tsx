
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import FestivalLink from "./FestivalLink";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="festival-container flex items-center justify-between">
        <FestivalLink
          to="/"
          className={`text-xl sm:text-2xl font-bold ${
            isScrolled ? "text-festival-primary" : "text-white"
          }`}
        >
          <span className="text-festival-accent">Shotaku</span> Festival
        </FestivalLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${
                isScrolled
                  ? isActive
                    ? "text-festival-accent"
                    : "text-festival-primary hover:text-festival-accent"
                  : isActive
                  ? "text-festival-accent"
                  : "text-white hover:text-festival-accent"
              }`
            }
          >
            {t("navbar.home")}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `nav-link ${
                isScrolled
                  ? isActive
                    ? "text-festival-accent"
                    : "text-festival-primary hover:text-festival-accent"
                  : isActive
                  ? "text-festival-accent"
                  : "text-white hover:text-festival-accent"
              }`
            }
          >
            {t("navbar.about")}
          </NavLink>
          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              `nav-link ${
                isScrolled
                  ? isActive
                    ? "text-festival-accent"
                    : "text-festival-primary hover:text-festival-accent"
                  : isActive
                  ? "text-festival-accent"
                  : "text-white hover:text-festival-accent"
              }`
            }
          >
            {t("navbar.schedule")}
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `nav-link ${
                isScrolled
                  ? isActive
                    ? "text-festival-accent"
                    : "text-festival-primary hover:text-festival-accent"
                  : isActive
                  ? "text-festival-accent"
                  : "text-white hover:text-festival-accent"
              }`
            }
          >
            {t("navbar.gallery")}
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `nav-link ${
                isScrolled
                  ? isActive
                    ? "text-festival-accent"
                    : "text-festival-primary hover:text-festival-accent"
                  : isActive
                  ? "text-festival-accent"
                  : "text-white hover:text-festival-accent"
              }`
            }
          >
            {t("navbar.events")}
          </NavLink>
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <LanguageSelector />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-full ${
              isScrolled ? "text-festival-primary" : "text-white"
            }`}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white"
          >
            <div className="festival-container py-4 flex flex-col space-y-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-festival-accent"
                      : "text-festival-primary hover:text-festival-accent"
                  }`
                }
              >
                {t("navbar.home")}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-festival-accent"
                      : "text-festival-primary hover:text-festival-accent"
                  }`
                }
              >
                {t("navbar.about")}
              </NavLink>
              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-festival-accent"
                      : "text-festival-primary hover:text-festival-accent"
                  }`
                }
              >
                {t("navbar.schedule")}
              </NavLink>
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-festival-accent"
                      : "text-festival-primary hover:text-festival-accent"
                  }`
                }
              >
                {t("navbar.gallery")}
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive
                      ? "text-festival-accent"
                      : "text-festival-primary hover:text-festival-accent"
                  }`
                }
              >
                {t("navbar.events")}
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
