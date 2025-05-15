import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Github, Mail, Coffee } from "lucide-react";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`w-full py-4 mt-auto border-t border-border/50 ${className}`}>
      <div className="container flex flex-col items-center space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-center space-x-4">
          <Dialog>
            <DialogTrigger className="hover:text-primary transition-colors">
              Terms & Policy
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight mb-6">Terms & Privacy Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Terms of Service</h2>
                  <p className="text-muted-foreground">
                    By using our temporary email service, you agree to these terms. This service is provided "as is" without warranties. 
                    We reserve the right to modify or terminate the service at any time.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Privacy Policy</h2>
                  <p className="text-muted-foreground">
                    We respect your privacy and are committed to protecting your data. We do not store emails permanently, and all data 
                    is automatically deleted after 24 hours. We do not collect personal information beyond what's necessary for the service 
                    to function.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Usage Guidelines</h2>
                  <p className="text-muted-foreground">
                    This service is intended for legitimate testing and development purposes. Any abuse or illegal activities are strictly 
                    prohibited and may result in immediate termination of service access.
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>

          <span>•</span>

          <Dialog>
            <DialogTrigger className="hover:text-primary transition-colors">
              About
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight mb-6">About This Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
                  <p className="text-muted-foreground">
                    temp-mail.lol provides a fast, secure, and reliable temporary email service. Our mission is to protect your privacy 
                    by offering instant disposable email addresses, making it easy to avoid spam and keep your primary inbox clean.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Features</h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Instant disposable email addresses</li>
                    <li>No registration required</li>
                    <li>Custom email username support</li>
                    <li>Real-time email notifications</li>
                    <li>Attachment support</li>
                    <li>Mobile-friendly interface</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Support Our Service</h2>
                  <p className="text-muted-foreground">
                    temp-mail.lol is provided free of charge, but running our servers and maintaining the service requires resources. 
                    If you find our service valuable, please consider supporting us:
                  </p>
                  <div className="flex flex-col space-y-4 mt-2">
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <Coffee className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Buy Me a Coffee</h3>
                          <p className="text-sm text-muted-foreground">Your support helps keep our servers running and enables us to improve the service.</p>
                          <a 
                            href="https://buymeacoffee.com/arctronic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-primary hover:underline mt-2"
                          >
                            <span>Support temp-mail.lol</span>
                          </a>
                        </div>
                      </div>
                    </Card>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">Contact & Support</h2>
                  <p className="text-muted-foreground">
                    Have questions, suggestions, or need assistance? We're here to help:
                  </p>
                  <div className="flex flex-col space-y-3">
                    <a 
                      href="https://tronics.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <div>
                        <span className="font-semibold">Developer Contact</span>
                        <p className="text-sm">Visit tronics.dev</p>
                      </div>
                    </a>
                    <a 
                      href="mailto:contact@temp-mail.lol"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <div>
                        <span className="font-semibold">Email Support</span>
                        <p className="text-sm">contact@temp-mail.lol</p>
                      </div>
                    </a>
                    <a 
                      href="https://github.com/arctronic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <div>
                        <span className="font-semibold">GitHub</span>
                        <p className="text-sm">Report issues or contribute</p>
                      </div>
                    </a>
                  </div>
                </section>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mt-2">
          <a 
            href="https://tronics.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>tronics.dev</span>
          </a>
          <a 
            href="https://github.com/temp-mail-lol" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
            <span>GitHub</span>
          </a>
          <a 
            href="mailto:contact@temp-mail.lol"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>Email</span>
          </a>
          <a 
            href="https://buymeacoffee.com/arctronic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Coffee className="h-5 w-5" />
            <span>Buy me a coffee</span>
          </a>
        </div>

        <div className="text-xs mt-2">
          © {new Date().getFullYear()} temp-mail.lol by <a href="https://tronics.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">tronics.dev</a>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
