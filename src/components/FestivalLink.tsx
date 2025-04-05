
import { useState, ReactNode } from "react";
import { ExternalLink, Share } from "lucide-react";
import { motion } from "framer-motion";

interface FestivalLinkProps {
  title: string;
  description?: string;
  url: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const FestivalLink = ({ title, description, url, icon, children }: FestivalLinkProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // If children are provided, render them instead of the default content
  if (children) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="festival-link group"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="festival-link group"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-festival-light">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-festival-primary">{title}</h3>
          {description && (
            <p className="text-sm text-festival-secondary">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-slate-100"
          aria-label="Share link"
        >
          {isCopied ? (
            <span className="text-xs font-medium text-green-600">Copied!</span>
          ) : (
            <Share className="h-4 w-4 text-festival-secondary" />
          )}
        </button>
        <ExternalLink className="h-4 w-4 text-festival-secondary" />
      </div>
    </motion.a>
  );
};

export default FestivalLink;
