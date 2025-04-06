
import React from 'react';
import { useGeneralContent } from '@/hooks/use-general-content';
import { Loader2 } from 'lucide-react';

interface GeneralContentSectionProps {
  sectionKey: string;
  className?: string;
}

const GeneralContentSection = ({ sectionKey, className = '' }: GeneralContentSectionProps) => {
  const { content, isLoading, error } = useGeneralContent(sectionKey);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement du contenu...</span>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="p-8 text-center text-gray-500">
        {error ? `Erreur: ${error.message}` : "Contenu non disponible"}
      </div>
    );
  }
  
  return (
    <section className={`py-12 ${className}`}>
      <div className="festival-container">
        {content.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-festival-primary mb-3 text-center">
            {content.title}
          </h2>
        )}
        
        {content.subtitle && (
          <p className="text-lg text-festival-secondary mb-6 text-center max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
        
        {content.content && (
          <div className="prose prose-lg max-w-3xl mx-auto">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-festival-secondary">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        
        {content.image_url && (
          <div className="mt-8 flex justify-center">
            <img 
              src={content.image_url} 
              alt={content.title || 'Content image'} 
              className="rounded-lg max-w-full md:max-w-2xl shadow-md"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default GeneralContentSection;
