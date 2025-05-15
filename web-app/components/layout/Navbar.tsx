import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotalRequests } from "@/components/TotalRequests";
import { VideoButton } from "@/components/ui/VideoButton";
import { BuyMeCoffeeButton } from "@/components/ui/BuyMeCoffeeButton";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "About" },
    { path: "/faq", label: "FAQ" },
    { path: "/contact", label: "Contact" },
    { path: "/privacy", label: "Privacy" },
    { path: "/terms", label: "Terms" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mt-3">
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-xl border-b border-border/20 shadow-lg shadow-background/5" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-mono font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent hover:from-primary hover:to-primary/80 transition-all mr-6">
              temp-mail.lol
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <VideoButton 
                videoId="XMzv-FU82CI" 
                title="How to Use This Website"
              />
              <BuyMeCoffeeButton 
                buyMeCoffeeUsername="arctronic" 
              />
              <TotalRequests compact className="animate-in slide-in-from-right-4 duration-300" />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:text-primary relative group",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full",
                  location.pathname === item.path && "w-full"
                )} />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <VideoButton 
              videoId="XMzv-FU82CI" 
              title="How to Use This Website"
            />
            <BuyMeCoffeeButton 
              buyMeCoffeeUsername="arctronic" 
            />
            <TotalRequests compact className="animate-in slide-in-from-right-4 duration-300" />
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 right-0 bg-background/40 backdrop-blur-xl border-b border-border/20 shadow-lg shadow-background/5 transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:text-primary relative group py-2",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full",
                  location.pathname === item.path && "w-full"
                )} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 