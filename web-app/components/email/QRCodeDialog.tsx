
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "qrcode.react";

interface QRCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export const QRCodeDialog = ({ isOpen, onOpenChange, email }: QRCodeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="animate-scale-in">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <QRCode value={email} size={200} className="animate-fade-in" />
        </div>
        <p className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
          Scan this QR code to view the email on your phone
        </p>
      </DialogContent>
    </Dialog>
  );
};
