import { Button } from "./button";
import { Coffee } from "lucide-react";

interface BuyMeCoffeeButtonProps {
  buyMeCoffeeUsername?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function BuyMeCoffeeButton({ 
  buyMeCoffeeUsername = "arctronic", 
  variant = "outline"
}: BuyMeCoffeeButtonProps) {
  const handleBuyMeCoffee = () => {
    window.open(`https://www.buymeacoffee.com/${buyMeCoffeeUsername}`, "_blank");
  };

  return (
    <Button 
      variant={variant} 
      size="sm"
      onClick={handleBuyMeCoffee}
      className="flex items-center gap-1"
    >
      <Coffee className="h-4 w-4 text-amber-500" />
      <span>Support</span>
    </Button>
  );
} 