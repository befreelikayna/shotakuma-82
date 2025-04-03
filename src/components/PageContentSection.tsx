
import React from 'react';
import { motion } from "framer-motion";
import { PageContent } from '@/hooks/use-page-content';
import { Loader2 } from 'lucide-react';

interface PageContentSectionProps {
  pageContent: PageContent | null;
  isLoading: boolean;
}

const PageContentSection = ({ pageContent, isLoading }: PageContentSectionProps) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement du contenu...</span>
      </div>
    );
  }
  
  if (!pageContent) {
    return null;
  }
  
  return (
    <section className="py-20" id="page-content">
      <div className="festival-container">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <h2 className="section-heading inline-block">{pageContent.header.title}</h2>
          <p className="text-festival-secondary max-w-2xl mx-auto mt-4">
            {pageContent.header.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${pageContent.sidebar ? 'md:col-span-2' : 'md:col-span-3'}`}>
            {pageContent.sections.map((section) => (
              <motion.div
                key={section.id}
                className="bg-white rounded-2xl p-8 shadow-soft border border-slate-100 mb-8"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h3 className="text-xl font-semibold mb-3 text-festival-primary">{section.title}</h3>
                <div className="text-festival-secondary whitespace-pre-wrap">
                  {section.content.split('\n').map((text, i) => (
                    <p key={i} className="mb-3">
                      {text}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {pageContent.sidebar && (
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-soft border border-slate-100 h-fit sticky top-24"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <h3 className="text-xl font-semibold mb-3 text-festival-primary">{pageContent.sidebar.title}</h3>
              <div className="text-festival-secondary whitespace-pre-wrap">
                {pageContent.sidebar.content.split('\n').map((text, i) => (
                  <p key={i} className="mb-3">
                    {text}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageContentSection;
