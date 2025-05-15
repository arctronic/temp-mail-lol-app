import React, { useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Outlet } from "react-router-dom";
import { trackPageView } from "@/utils/analytics";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isHomePage = currentPath === "/";

  // Get page-specific metadata with improved keywords
  const getPageMetadata = () => {
    switch (currentPath) {
      case "/":
        return {
          title: "temp-mail.lol | Secure Temporary Email Service | Disposable Email",
          description: "Create your own secure temporary email address instantly with temp-mail.lol. Perfect for privacy protection, avoiding spam, and secure testing. No registration required.",
          keywords: "temporary email, disposable email, temp-mail.lol, temp mail, burner email, anonymous email, fake email address, privacy protection",
          h1: "Secure Temporary Email Service for Privacy Protection"
        };
      case "/about":
        return {
          title: "About temp-mail.lol | Our Temporary Email Mission & Features",
          description: "Learn how temp-mail.lol provides the most secure and private temporary email service. Our mission, features, and commitment to your online privacy.",
          keywords: "about temporary email, disposable email provider, temp-mail.lol features, temporary mail service, secure email",
          h1: "About Our Secure Temporary Email Service"
        };
      case "/blog":
        return {
          title: "Email Privacy Blog | Temporary Email Tips & Digital Security Guides",
          description: "Expert advice on email privacy, temporary email usage, and digital security. Stay updated with the latest privacy tips and best practices.",
          keywords: "email privacy blog, temporary email tips, digital security guides, disposable email advice, online privacy",
          h1: "Email Privacy Blog & Temporary Email Tips"
        };
      case "/faq":
        return {
          title: "Temporary Email FAQ | Common Questions About Disposable Email",
          description: "Frequently asked questions about our temporary email service. Learn how to use disposable emails for enhanced privacy and spam protection.",
          keywords: "temporary email FAQ, disposable email questions, temp mail help, temp-mail.lol guide",
          h1: "Frequently Asked Questions About Temporary Email"
        };
      case "/privacy":
        return {
          title: "Privacy Policy | How We Protect Your Temporary Email Data",
          description: "Our comprehensive privacy policy explains how we handle your data when using our temporary email service. We prioritize your privacy and security.",
          keywords: "temporary email privacy policy, disposable email data protection, temp-mail.lol security",
          h1: "Privacy Policy for Our Temporary Email Service"
        };
      case "/terms":
        return {
          title: "Terms of Service | temp-mail.lol Temporary Email Usage Rules",
          description: "Terms and conditions for using our temporary email service. Learn about acceptable usage practices and our service commitments.",
          keywords: "temporary email terms, disposable email service rules, temp-mail.lol terms of service",
          h1: "Terms of Service for Our Temporary Email"
        };
      case "/contact":
        return {
          title: "Contact Us | Get Support for Our Temporary Email Service",
          description: "Need help with our temporary email service? Contact our team for support, feedback, or partnership inquiries about temp-mail.lol.",
          keywords: "contact temporary email support, disposable email help, temp-mail.lol contact",
          h1: "Contact Our Temporary Email Support Team"
        };
      default:
        return {
          title: "temp-mail.lol | Secure Temporary Email Service",
          description: "Create your own secure temporary email address instantly. Perfect for privacy protection and avoiding spam.",
          keywords: "temporary email, disposable email, temp-mail.lol, temp mail, burner email",
          h1: "Secure Temporary Email Service"
        };
    }
  };

  const metadata = getPageMetadata();
  
  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, metadata.title);
  }, [location.pathname, metadata.title]);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content={`https://temp-mail.lol${currentPath}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://temp-mail.lol${currentPath}`} />
        
        {/* Cache control for images */}
        <meta http-equiv="Cache-Control" content="max-age=31536000" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "temp-mail.lol",
              "headline": "${metadata.h1}",
              "description": "${metadata.description}",
              "url": "https://temp-mail.lol${currentPath}",
              "applicationCategory": "Email Service",
              "operatingSystem": "All",
              "keywords": "${metadata.keywords}",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            }
          `}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <div className="relative flex-grow">
          {/* Main content */}
          <main className="container mx-auto px-4 mb-[90px] mt-24 relative z-20">
            {!isHomePage && <Breadcrumbs />}
            {!isHomePage && (
              <header className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{metadata.h1}</h1>
              </header>
            )}
            {children}
          </main>
        </div>
        
        <Footer className="fixed bottom-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-t border-border/50" />
      </div>
    </>
  );
}
