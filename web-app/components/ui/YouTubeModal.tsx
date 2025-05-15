import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Youtube } from "lucide-react";

interface YouTubeModalProps {
  videoId: string;
  delayInSeconds?: number;
  title?: string;
}

export function YouTubeModal({ 
  videoId, 
  delayInSeconds = 120, // Default 2 minutes
  title = "Tutorial Video"
}: YouTubeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if modal has been shown before in this session
    const hasShownModal = sessionStorage.getItem("ytModalShown");
    
    if (hasShownModal === "true" || hasBeenShown) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasBeenShown(true);
      // Save to session storage to prevent showing again in this session
      sessionStorage.setItem("ytModalShown", "true");
    }, delayInSeconds * 1000);

    return () => clearTimeout(timer);
  }, [delayInSeconds, hasBeenShown]);

  const handleSubscribe = () => {
    window.open("https://www.youtube.com/@arc-tronics?sub_confirmation=1", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="flex items-center">
            <Button 
              variant="destructive" 
              onClick={handleSubscribe}
              className="flex items-center gap-2"
            >
              <Youtube className="h-4 w-4" />
              Subscribe to Channel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 