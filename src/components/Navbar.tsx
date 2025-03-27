
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-soft">
      <div className="festival-container py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-festival-primary">
          SHOTAKU
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/about" className="nav-link">À propos</Link>
          <Link to="/schedule" className="nav-link">Programme</Link>
          <Link to="/gallery" className="nav-link">Galerie</Link>
          <Link
            to="/admin"
            className="hidden md:block px-3 py-1 rounded-full bg-festival-accent/10 text-festival-accent font-medium 
              hover:bg-festival-accent/20 transition-colors duration-300 ml-2"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
