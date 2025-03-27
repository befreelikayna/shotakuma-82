import React from "react";
import { Link } from "react-router-dom";

const AdminLink = () => {
  return (
    <Link
      to="/admin"
      className="hidden md:block px-3 py-1 rounded-full bg-festival-accent/10 text-festival-accent font-medium 
        hover:bg-festival-accent/20 transition-colors duration-300 ml-2"
    >
      Admin
    </Link>
  );
};

export default AdminLink;
