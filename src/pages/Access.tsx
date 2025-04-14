
import React, { useState, useEffect } from 'react';
import PageContentSection from '../components/PageContentSection';
import { usePageContent } from '../hooks/use-page-content';
import BadgeApplicationForm from '../components/BadgeApplicationForm';
import { Button } from '../components/ui/button';
import { Ticket, BadgeHelp } from 'lucide-react';

const Access = () => {
  const { pageContent, isLoading } = usePageContent('access');
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  
  // Load SMTP.js script when component mounts
  useEffect(() => {
    const smtpScript = document.createElement('script');
    smtpScript.src = 'https://smtpjs.com/v3/smtp.js';
    smtpScript.async = true;
    document.head.appendChild(smtpScript);
    
    return () => {
      // Clean up script when component unmounts
      if (document.head.contains(smtpScript)) {
        document.head.removeChild(smtpScript);
      }
    };
  }, []);

  const toggleBadgeForm = () => {
    setShowBadgeForm(!showBadgeForm);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Festival Access
          </h1>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              className="flex items-center gap-2" 
              size="lg"
              onClick={toggleBadgeForm}
            >
              <BadgeHelp size={20} />
              Apply for Badge
            </Button>
            
            <Button 
              className="flex items-center gap-2" 
              size="lg" 
              variant="outline" 
              asChild
            >
              <a href="/tickets">
                <Ticket size={20} />
                Get Tickets
              </a>
            </Button>
          </div>
        </div>
        
        {/* Page Content */}
        {!isLoading && pageContent && (
          <PageContentSection content={pageContent} />
        )}
        
        {/* Badge Application Form Modal */}
        {showBadgeForm && (
          <BadgeApplicationForm onClose={toggleBadgeForm} />
        )}
      </div>
    </div>
  );
};

export default Access;
