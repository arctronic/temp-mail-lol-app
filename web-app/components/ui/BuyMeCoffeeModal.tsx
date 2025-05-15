import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Coffee } from "lucide-react";

interface BuyMeCoffeeModalProps {
  delayInSeconds?: number;
  buyMeCoffeeUsername?: string;
  title?: string;
}

export function BuyMeCoffeeModal({ 
  delayInSeconds = 300, // Default 5 minutes
  buyMeCoffeeUsername = "arctronic", // Default username
  title = "Support This Project"
}: BuyMeCoffeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if modal has been shown before in this session
    const hasShownModal = sessionStorage.getItem("bmcModalShown");
    
    if (hasShownModal === "true" || hasBeenShown) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasBeenShown(true);
      // Save to session storage to prevent showing again in this session
      sessionStorage.setItem("bmcModalShown", "true");
    }, delayInSeconds * 1000);

    return () => clearTimeout(timer);
  }, [delayInSeconds, hasBeenShown]);

  const handleBuyMeCoffee = () => {
    window.open(`https://www.buymeacoffee.com/${buyMeCoffeeUsername}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4 space-y-4">
          <Coffee className="h-16 w-16 text-amber-500" />
          <p className="text-center">
            Enjoying this free service? Consider buying me a coffee to help keep it running!
          </p>
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="flex w-full items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Maybe Later
            </Button>
            <Button 
              variant="default"
              onClick={handleBuyMeCoffee}
              className="flex items-center gap-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black"
            >
              <Coffee className="h-4 w-4" />
              Buy me a coffee
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 