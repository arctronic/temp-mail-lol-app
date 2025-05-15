import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, QrCode, AlertCircle } from "lucide-react";
import { useEmail } from "@/contexts/EmailContext";
import { useState, useEffect } from "react";

interface EmailGeneratorProps {
  onOpenQRModal: () => void;
}

// Minimum character length for usernames - should match the value in EmailContext
const MIN_USERNAME_LENGTH = 4;

export const EmailGenerator = ({ onOpenQRModal }: EmailGeneratorProps) => {
  const { 
    generatedEmail, 
    generateNewEmail, 
    copyEmailToClipboard, 
    setCustomUsername,
    domain 
  } = useEmail();

  const [username, setUsername] = useState<string>("");
  const [showLengthWarning, setShowLengthWarning] = useState<boolean>(false);

  useEffect(() => {
    // Initialize local username state from generatedEmail
    if (generatedEmail) {
      setUsername(generatedEmail.split('@')[0]);
    }
  }, [generatedEmail]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setCustomUsername(newUsername);
    
    // Show warning if username is too short
    setShowLengthWarning(newUsername.length > 0 && newUsername.length < MIN_USERNAME_LENGTH);
  };

  return (
    <Card className="p-4 sm:p-6 glass">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-secondary/30 rounded-lg gap-4">
          <div className="flex-1 flex flex-col w-full sm:w-auto">
            <div className="flex items-center space-x-1">
              <Input
                value={username}
                onChange={handleUsernameChange}
                className="w-full sm:w-auto min-w-[120px] text-base sm:text-lg bg-background/50 backdrop-blur-sm border-muted transition-colors focus:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                aria-label="Email username"
                id="email-username"
              />
              <span className="text-base sm:text-lg font-medium whitespace-nowrap" aria-label="Domain">@{domain}</span>
            </div>
            {showLengthWarning && (
              <div className="flex items-center mt-1 text-amber-500 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Username should be at least {MIN_USERNAME_LENGTH} characters</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={copyEmailToClipboard}
              className="flex-1 sm:flex-none bg-secondary/50 hover:bg-secondary/70"
              aria-label="Copy email address"
            >
              <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
              Copy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={generateNewEmail}
              className="flex-1 sm:flex-none bg-secondary/50 hover:bg-secondary/70"
              aria-label="Generate new email address"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              New
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenQRModal}
              className="flex-1 sm:flex-none bg-secondary/50 hover:bg-secondary/70"
              aria-label="Show QR code"
            >
              <QrCode className="h-4 w-4 mr-2" aria-hidden="true" />
              QR
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
