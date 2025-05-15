import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

const AdBlockerModal = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAdBlocker = async () => {
      try {
        // Try to load a known ad script
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        setIsAdBlockerDetected(false);
      } catch (e) {
        setIsAdBlockerDetected(true);
        setIsOpen(true);
      }
    };

    checkAdBlocker();
  }, []);

  const handleCheckAgain = () => {
    window.location.reload();
  };

  if (!isAdBlockerDetected) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Ad Blocker Detected
          </DialogTitle>
          <DialogDescription className="pt-4">
            We've noticed you're using an ad blocker. Our service is completely free, but we rely on ad revenue to cover server costs and keep the service running.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            To continue using our service, please:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li>Disable your ad blocker for this site</li>
            <li>Refresh the page</li>
            <li>Enjoy our ad-supported free service</li>
          </ol>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCheckAgain}>
              Check Again
            </Button>
            <Button variant="destructive" onClick={handleCheckAgain}>
              I've Disabled Ad Blocker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdBlockerModal; 