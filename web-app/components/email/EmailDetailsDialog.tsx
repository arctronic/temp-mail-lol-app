import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDate } from "@/utils/date";
import { useState, useEffect } from "react";
import type { Email } from "@/contexts/EmailContext";
import { EmailHeader } from "./EmailHeader";
import { EmailMetadata } from "./EmailMetadata";
import { EmailContent } from "./EmailContent";
import { EmailAttachments } from "./EmailAttachments";
import { trackEmailView } from "@/utils/analytics";

interface EmailDetailsDialogProps {
  email: Email | null;
  onOpenChange: (open: boolean) => void;
}

export const EmailDetailsDialog = ({ email, onOpenChange }: EmailDetailsDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track email view
  useEffect(() => {
    if (email) {
      trackEmailView();
    }
  }, [email]);
  
  if (!email) return null;

  return (
    <Dialog open={!!email} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isFullscreen ? 'w-screen h-screen max-w-none !rounded-none' : 'max-w-4xl'
        } max-h-[90vh] overflow-hidden transition-all duration-300 animate-scale-in`}
      >
        <EmailHeader 
          isFullscreen={isFullscreen} 
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)} 
        />
        
        <div className={`space-y-6 p-4 overflow-y-auto ${
          isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[calc(90vh-120px)]'
        } animate-fade-in`}>
          <EmailMetadata email={email} />
          <EmailContent content={email.message} />
          <EmailAttachments attachments={email.attachments} />

          <div className="text-xs text-muted-foreground space-y-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <p>Created: {formatDate(email.created_at)}</p>
            <p>Last Updated: {formatDate(email.updated_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
