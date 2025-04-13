
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketPackageProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  ticketId?: string; // Add ticketId prop
}

const TicketPackage = ({
  name,
  price,
  description,
  features,
  isPopular = false,
  ticketId = '', // Default to empty string
}: TicketPackageProps) => {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft"
      whileHover={{ y: -5, scale: 1.01 }}
    >
      <div className={`p-1 ${isPopular ? "bg-festival-accent" : "bg-transparent"}`}>
        <div className="p-6 bg-white rounded-t-xl">
          {isPopular && (
            <span className="inline-block py-1 px-3 rounded-full bg-festival-accent text-white text-xs font-medium mb-3">
              Populaire
            </span>
          )}
          <h3 className="text-xl font-bold text-festival-primary mb-2">{name}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-bold text-festival-primary">{price}</span>
            <span className="text-festival-secondary ml-1">MAD</span>
          </div>
          <p className="text-festival-secondary mb-6">{description}</p>
          
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </span>
                <span className="text-sm text-festival-secondary">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link
            to={`/checkout/${ticketId}`}
            className={`w-full flex justify-center items-center py-3 rounded-full transition-all duration-300 ${
              isPopular 
                ? "bg-festival-accent text-white hover:bg-opacity-90" 
                : "bg-white border border-slate-200 text-festival-primary hover:bg-slate-50"
            }`}
          >
            Acheter
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketPackage;
