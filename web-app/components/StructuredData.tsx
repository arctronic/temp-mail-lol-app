import React from 'react';

interface StructuredDataProps {
  type: 'article' | 'website' | 'organization';
  data: {
    headline?: string;
    description?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: {
      name: string;
      url: string;
    };
    publisher?: {
      name: string;
      logo: {
        url: string;
      };
    };
  };
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.headline,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          dateModified: data.dateModified,
          author: {
            '@type': 'Person',
            name: data.author?.name,
            url: data.author?.url
          },
          publisher: {
            '@type': 'Organization',
            name: data.publisher?.name,
            logo: {
              '@type': 'ImageObject',
              url: data.publisher?.logo.url
            }
          }
        };
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.publisher?.name,
          url: window.location.origin
        };
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: data.publisher?.name,
          logo: data.publisher?.logo.url,
          url: window.location.origin
        };
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  );
}; 