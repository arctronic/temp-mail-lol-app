import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EmailProvider } from "./contexts/EmailContext";
import { MainLayout } from "./layout/MainLayout";
import { ThemeProvider } from "./providers/theme-provider";
import { YouTubeModal } from "./components/ui/YouTubeModal";
import { BuyMeCoffeeModal } from "./components/ui/BuyMeCoffeeModal";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Health from "./pages/Health";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <EmailProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/health" element={<Health />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </EmailProvider>
        </TooltipProvider>
        <Toaster />
        <Sonner />
        <YouTubeModal 
          videoId="XMzv-FU82CI"
          title="How to Use This Website"
        />
        <BuyMeCoffeeModal 
          delayInSeconds={300}
          buyMeCoffeeUsername="arctronic"
          title="Support This Project"
        />
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
