import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface AdUnitProps {
  className?: string;
  slot: "header" | "content" | "sidebar" | "footer";
  minContentLength?: number;
}

/**
 * AdUnit component that ensures ads are only displayed on pages with sufficient content
 * Follows Google AdSense policies for ad placement
 */
export const AdUnit = ({ className, slot, minContentLength = 400 }: AdUnitProps) => {
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Check if ads are enabled via environment variable
  const showAds = import.meta.env.VITE_SHOW_ADS === "true";

  useEffect(() => {
    // Reset states when route changes
    setIsLoading(true);
    setHasContent(false);
    setIsVisible(false);
    
    // Check if the page has meaningful content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // Calculate content by removing navigation, ads, and other non-content elements
      const contentText = mainContent.innerText || '';
      // Filter out navigation text, buttons, etc.
      const contentLength = contentText.replace(/Home|About|Contact|Blog|FAQ|Terms|Privacy/g, '').trim().length;
      
      console.log(`Ad content check: ${contentLength} chars on ${location.pathname}`);
      setHasContent(contentLength >= minContentLength);
    }

    // Simulate loading delay to prevent layout shift
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, minContentLength]);

  // Set up intersection observer to only show ads when in viewport
  useEffect(() => {
    if (!adRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(adRef.current);
    
    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [adRef, hasContent]);

  // Don't show ads if disabled, no content, or on certain pages
  if (!showAds || !hasContent || location.pathname.includes('health')) return null;

  // Determine ad size based on slot
  const getAdSize = () => {
    switch (slot) {
      case "header":
        return "min-h-[90px] md:min-h-[90px]"; // Leaderboard (728x90)
      case "sidebar":
        return "min-h-[600px]"; // Skyscraper (160x600)
      case "content":
        return "min-h-[250px]"; // Medium Rectangle (300x250)
      case "footer":
        return "min-h-[90px]"; // Leaderboard (728x90)
      default:
        return "min-h-[250px]";
    }
  };

  return (
    <Card 
      ref={adRef}
      className={`ad-container p-0 overflow-hidden ${getAdSize()} bg-background/50 ${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      role="complementary"
      aria-label="Advertisement Section"
    >
      <div 
        className="text-xs text-muted-foreground text-center py-1 border-b"
        aria-label="Advertisement Label"
      >
        Advertisement
      </div>
      {isVisible && (
        <div 
          id={`google-ad-${slot}`} 
          className="w-full h-full flex items-center justify-center"
          style={{ minWidth: slot === "sidebar" ? "160px" : "300px" }}
          role="none presentation"
        >
          {/* Google AdSense code will be injected here */}
          {slot === "content" && (
            <ins className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-1181029024567851"
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"></ins>
          )}
          {slot === "sidebar" && (
            <ins className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-1181029024567851"
              data-ad-slot="0987654321"
              data-ad-format="auto"
              data-full-width-responsive="true"></ins>
          )}
        </div>
      )}
    </Card>
  );
};
