
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md py-3 shadow-soft"
          : "bg-transparent py-5"
      }`}
    >
      <div className="festival-container">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-festival-primary text-xl"
          >
            <span className="text-festival-accent">SHO</span>TAKU
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/schedule" className="nav-link">
              Schedule
            </Link>
            <Link to="/gallery" className="nav-link">
              Gallery
            </Link>
            <a
              href="#tickets"
              className="px-6 py-2 rounded-full bg-festival-accent text-white font-medium 
              shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90 hover:translate-y-[-2px]"
            >
              Tickets
            </a>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden text-festival-primary"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-soft p-4 transform transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="nav-link block p-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link block p-2"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/schedule"
              className="nav-link block p-2"
              onClick={() => setIsOpen(false)}
            >
              Schedule
            </Link>
            <Link
              to="/gallery"
              className="nav-link block p-2"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <a
              href="#tickets"
              className="block text-center px-6 py-2 rounded-full bg-festival-accent text-white font-medium 
              shadow-accent transition-all duration-300 hover:shadow-lg hover:bg-opacity-90"
              onClick={() => setIsOpen(false)}
            >
              Tickets
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
