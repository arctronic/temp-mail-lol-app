import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Video, Youtube } from "lucide-react";

interface VideoButtonProps {
  videoId: string;
  title?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function VideoButton({ 
  videoId, 
  title = "Tutorial Video",
  variant = "ghost"
}: VideoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubscribe = () => {
    window.open("https://www.youtube.com/@arc-tronics?sub_confirmation=1", "_blank");
  };

  return (
    <>
      <Button 
        variant={variant} 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <Video className="h-4 w-4" />
        <span>Tutorial</span>
      </Button>

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
    </>
  );
} 