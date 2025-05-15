
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface EmailHeaderProps {
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

export const EmailHeader = ({ isFullscreen, onFullscreenToggle }: EmailHeaderProps) => {
  return (
    <DialogHeader className="flex-row justify-between items-center">
      <DialogTitle className="text-xl font-bold">
        Email Details
      </DialogTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFullscreenToggle}
        className="h-8 w-8"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </DialogHeader>
  );
};
