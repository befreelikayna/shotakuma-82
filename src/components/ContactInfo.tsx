
import React from 'react';
import { useContactInfo } from '@/hooks/use-contact-info';
import { Mail, Phone, MapPin, Clock, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type ContactInfoProps = {
  className?: string;
};

const ContactInfo = ({ className = '' }: ContactInfoProps) => {
  const { contactInfo, isLoading, error } = useContactInfo();
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !contactInfo) {
    return (
      <div className={`p-4 bg-red-50 text-red-600 rounded-lg ${className}`}>
        Une erreur est survenue lors du chargement des informations de contact.
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {contactInfo.email && (
        <div className="flex items-start">
          <Mail className="h-5 w-5 mr-3 text-festival-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-festival-primary">Email</h3>
            <a href={`mailto:${contactInfo.email}`} className="text-festival-secondary hover:text-festival-primary transition-colors">
              {contactInfo.email}
            </a>
          </div>
        </div>
      )}
      
      {contactInfo.phone && (
        <div className="flex items-start">
          <Phone className="h-5 w-5 mr-3 text-festival-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-festival-primary">Téléphone</h3>
            <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className="text-festival-secondary hover:text-festival-primary transition-colors">
              {contactInfo.phone}
            </a>
            {contactInfo.whatsapp && (
              <div className="mt-1">
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-festival-primary hover:underline"
                >
                  WhatsApp: {contactInfo.whatsapp}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {contactInfo.address && (
        <div className="flex items-start">
          <MapPin className="h-5 w-5 mr-3 text-festival-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-festival-primary">Adresse</h3>
            <address className="not-italic text-festival-secondary">
              {contactInfo.address.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </address>
          </div>
        </div>
      )}
      
      {contactInfo.hours && (
        <div className="flex items-start">
          <Clock className="h-5 w-5 mr-3 text-festival-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-festival-primary">Horaires</h3>
            <p className="text-festival-secondary">
              {contactInfo.hours}
            </p>
          </div>
        </div>
      )}
      
      {contactInfo.additional_info && (
        <div className="flex items-start">
          <Info className="h-5 w-5 mr-3 text-festival-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-festival-primary">Informations supplémentaires</h3>
            <div className="text-festival-secondary">
              {contactInfo.additional_info.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
