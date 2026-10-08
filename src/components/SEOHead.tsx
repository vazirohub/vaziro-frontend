import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schema?: object | object[];
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'Vaziro™ — Verified Home Care, Nurses, Physio, Tutors & Cooks in Delhi NCR',
  description = 'Hire pre-verified independent home caregivers, nurses, physiotherapists, home tutors, cooks, and trainers across Delhi, Noida, Gurugram. 100% Escrow milestone protection and DigiLocker ID checks.',
  keywords = 'home care Delhi, elderly caregiver Noida, home nurse Gurugram, physiotherapist at home Delhi NCR, home tutor Delhi, home cook, fitness trainer, yoga instructor, verified professionals India, Vaziro',
  canonical = 'https://vaziro.com/',
  ogType = 'website',
  ogImage = 'https://vaziro.com/logo.png',
  schema,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to create or update meta tags
    const updateMetaTag = (attribute: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'title', title);

    // 3. Open Graph
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonical);
    updateMetaTag('property', 'og:image', ogImage);

    // 4. Twitter Cards
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // 6. Dynamic JSON-LD Schema injection
    let scriptElement: HTMLScriptElement | null = null;
    if (schema) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.id = 'page-dynamic-schema';
      scriptElement.text = JSON.stringify(schema);
      document.head.appendChild(scriptElement);
    }

    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, schema]);

  return null;
};
