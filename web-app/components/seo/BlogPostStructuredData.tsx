import { Helmet } from "react-helmet-async";

interface BlogPostStructuredDataProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}

export const BlogPostStructuredData = ({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: BlogPostStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "temp-mail.lol",
      logo: {
        "@type": "ImageObject",
        url: "https://temp-mail.lol/logo.png",
      },
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}; 