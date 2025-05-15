import { Card } from "@/components/ui/card";
import { useEmail } from "@/contexts/EmailContext";
import { useState, useEffect, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Layout, HelpCircle, Coffee, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import type { Email } from "@/contexts/EmailContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

// Lazy load components
const EmailList = lazy(() => import('@/components/email/EmailList').then(module => ({ default: module.EmailList })));
const EmailDetailsDialog = lazy(() => import('@/components/email/EmailDetailsDialog').then(module => ({ default: module.EmailDetailsDialog })));
const QRCodeDialog = lazy(() => import('@/components/email/QRCodeDialog').then(module => ({ default: module.QRCodeDialog })));
const EmailGenerator = lazy(() => import('@/components/email/EmailGenerator').then(module => ({ default: module.EmailGenerator })));
const EmailRefreshControl = lazy(() => import('@/components/email/EmailRefreshControl').then(module => ({ default: module.EmailRefreshControl })));

const Home = () => {
  const { emails, isLoading, generatedEmail } = useEmail();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  if (!mounted) {
    return null;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <motion.div 
        className={`flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in 
          ${isMobile ? 'px-2' : 'px-4'} max-w-7xl mx-auto`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div 
          className={`text-center space-y-4 ${isMobile ? 'space-y-4' : 'space-y-6'} w-full max-w-4xl`}
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Logo />
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
              Secure Temporary Email Service for Privacy Protection
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Get an instant disposable email address for enhanced online privacy
            </p>
            <button
              onClick={() => setShowHowToUse(true)}
              className="text-primary hover:text-primary/80 text-sm sm:text-base flex items-center justify-center mx-auto gap-1"
            >
              How to Use <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <EmailGenerator onOpenQRModal={() => setIsQRModalOpen(true)} />
          </Suspense>

          <Card className="p-3 sm:p-4 md:p-6 glass">
            <Suspense fallback={<div>Loading...</div>}>
              <EmailRefreshControl />
            </Suspense>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 glass overflow-x-auto">
            <Suspense fallback={<div>Loading...</div>}>
              <EmailList 
                emails={emails}
                isLoading={isLoading}
                onViewEmail={handleEmailClick}
              />
            </Suspense>
          </Card>

          {/* Why Use Temp Mail Section */}
          <Card className="p-4 sm:p-5 md:p-6 glass overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Why Use temp-mail.lol?</h2>
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-sm sm:text-base">
                Temporary email addresses provide an essential layer of privacy and security in today's digital landscape. 
                Our <Link to="/about" className="text-primary hover:text-primary/80">secure email service</Link> offers several key benefits:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Privacy Protection</span>
                    <p className="text-sm text-muted-foreground">Shield your personal email from spam, marketing lists, and data breaches when signing up for new services or websites. Learn more in our <Link to="/blog/online-privacy-guide" className="text-primary hover:text-primary/80">online privacy guide</Link>.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">No Registration Required</span>
                    <p className="text-sm text-muted-foreground">Get an instant disposable email address with no sign-up process, personal information, or payment details required. See our <Link to="/privacy" className="text-primary hover:text-primary/80">privacy policy</Link> for details.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Real-Time Email Reception</span>
                    <p className="text-sm text-muted-foreground">Receive emails instantly with full message content, formatting, and attachment support just like a regular email service.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Testing and Development</span>
                    <p className="text-sm text-muted-foreground">Perfect for developers testing email functionality in applications or websites without using production email addresses. Check our <Link to="/faq" className="text-primary hover:text-primary/80">FAQ</Link> for developer tips.</p>
                  </div>
                </li>
              </ul>
            </div>
          </Card>

          {/* How We're Different Section */}
          <Card className="p-4 sm:p-5 md:p-6 glass overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">How We're Different</h2>
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-sm sm:text-base">
                While there are many temporary email services available, temp-mail.lol stands out with unique features and a <Link to="/about" className="text-primary hover:text-primary/80">commitment to user experience</Link>:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Enhanced Privacy Focus</span>
                    <p className="text-sm text-muted-foreground">We don't track your activity, sell your data, or require any personal information to use our service. Learn more in our <Link to="/privacy" className="text-primary hover:text-primary/80">privacy policy</Link>.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Clean, Modern Interface</span>
                    <p className="text-sm text-muted-foreground">A simple, intuitive design that works perfectly on desktop and mobile devices with no cluttered ads or confusing navigation.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Custom Email Usernames</span>
                    <p className="text-sm text-muted-foreground">Choose your own username instead of using randomly generated addresses, making it easier to use for specific services.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Attachment Support</span>
                    <p className="text-sm text-muted-foreground">Receive and download email attachments securely, unlike many other temporary email services that strip attachments. See our <Link to="/blog/secure-file-sharing" className="text-primary hover:text-primary/80">secure file sharing guide</Link>.</p>
                  </div>
                </li>
              </ul>
            </div>
          </Card>

          {/* How To Use Section */}
          <Card className="p-4 sm:p-5 md:p-6 glass overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">How To Use temp-mail.lol</h2>
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-sm sm:text-base">
                Our <Link to="/about" className="text-primary hover:text-primary/80">temporary email service</Link> is designed to be straightforward and user-friendly. Here's how to get started:
              </p>
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <p className="font-medium">Get Your Email Address</p>
                  <p className="text-sm text-muted-foreground">Use the randomly generated email address or customize your username in the input field above. Check our <Link to="/faq" className="text-primary hover:text-primary/80">FAQ</Link> for tips.</p>
                </li>
                <li>
                  <p className="font-medium">Copy Your Email</p>
                  <p className="text-sm text-muted-foreground">Click the "Copy" button to copy your temporary email address to your clipboard for easy pasting.</p>
                </li>
                <li>
                  <p className="font-medium">Use It Where Needed</p>
                  <p className="text-sm text-muted-foreground">Paste your temporary email when signing up for services, newsletters, or any other place requiring email verification. Learn more in our <Link to="/blog/best-uses-for-disposable-email" className="text-primary hover:text-primary/80">usage guide</Link>.</p>
                </li>
                <li>
                  <p className="font-medium">Receive Messages Instantly</p>
                  <p className="text-sm text-muted-foreground">Incoming emails appear automatically in the list below. Click "View" to read the full message content.</p>
                </li>
                <li>
                  <p className="font-medium">Download Attachments</p>
                  <p className="text-sm text-muted-foreground">If an email contains attachments, you can download them directly from the email view. See our <Link to="/terms" className="text-primary hover:text-primary/80">terms of service</Link> for attachment policies.</p>
                </li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                Your temporary email address will remain active while you're using the service. For extended use, consider bookmarking the page or using the QR code feature to quickly access your inbox from another device. Have questions? Visit our <Link to="/faq" className="text-primary hover:text-primary/80">FAQ page</Link> or <Link to="/contact" className="text-primary hover:text-primary/80">contact support</Link>.
              </p>
            </div>
          </Card>

          {/* Blog Section */}
          <Card className="p-4 sm:p-5 md:p-6 glass">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Latest Blog Posts</h2>
              <Link to="/blog" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm sm:text-base">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">Why You Should Use temp-mail.lol for Disposable Email Needs</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Discover why temp-mail.lol is your best choice for disposable email needs with unique features like email reusability, attachment support, and enhanced privacy.
                </p>
                <Link to="/blog/why-use-temp-mail-lol" className="text-primary hover:text-primary/80 text-xs sm:text-sm">
                  Read More →
                </Link>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">How to Protect Your Privacy Online with Temporary Emails</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn essential strategies for safeguarding your digital privacy using temporary email services alongside other proven privacy protection methods.
                </p>
                <Link to="/blog/how-to-protect-privacy-with-temp-email" className="text-primary hover:text-primary/80 text-xs sm:text-sm">
                  Read More →
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Dialog open={showHowToUse} onOpenChange={setShowHowToUse}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to Use temp-mail.lol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">1. Get Your Email Address</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Generate a random email address or customize your own username. Click "New" to get a different address.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">2. Use Your Temporary Email</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Use this email address wherever you need. All incoming emails will appear automatically in the list below.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">3. Access Your Messages</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Click on any email in the list to read its contents. Messages are automatically refreshed, but you can also manually refresh.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">4. Share Your Email</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Use the QR code feature to easily share your temporary email address with others.</p>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-medium text-primary text-sm sm:text-base">❤️ Support Our Service</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                We provide this service free of charge, but running servers and maintaining the service requires resources. 
                If you find temp-mail.lol useful, please consider <Link to="/support" className="text-primary hover:text-primary/80">supporting us</Link>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-2">
                <a 
                  href="https://buymeacoffee.com/arctronic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Buy me a coffee</span>
                </a>
                <a
                  href="https://github.com/temp-mail-lol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-sm"
                >
                  ⭐ Star on GitHub
                </a>
              </div>
              
              {/* Social Media Links */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <a
                  href="https://facebook.com/tempmaillol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com/tempmaillol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/tempmaillol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/tempmaillol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        {selectedEmail && (
          <EmailDetailsDialog
            email={selectedEmail}
            onOpenChange={() => setSelectedEmail(null)}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <QRCodeDialog 
          isOpen={isQRModalOpen} 
          onOpenChange={setIsQRModalOpen}
          email={generatedEmail}
        />
      </Suspense>
    </>
  );
};

export default Home;
