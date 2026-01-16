import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/routing/ScrollToTop";
import { WwwRedirect } from "@/components/routing/WwwRedirect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import Product from "./pages/Product";
import Personnalisation from "./pages/Personnalisation";
import Panier from "./pages/Panier";
import Checkout from "./pages/Checkout";
import Devis from "./pages/Devis";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import CGV from "./pages/CGV";
import Retours from "./pages/Retours";
import Livraison from "./pages/Livraison";
import LocationPage from "./pages/LocationPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WwwRedirect />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/catalogue/:category" element={<Catalogue />} />
            <Route path="/univers/:world" element={<Catalogue />} />
            <Route path="/produit/:slug" element={<Product />} />
            <Route path="/personnalisation" element={<Personnalisation />} />
            <Route path="/panier" element={<Panier />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/paiement-succes" element={<PaymentSuccess />} />
            <Route path="/paiement-annule" element={<PaymentCancelled />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/retours" element={<Retours />} />
            <Route path="/livraison" element={<Livraison />} />
            {/* SEO Pages - French locations */}
            <Route path="/zones" element={<LocationPage />} />
            <Route path="/zones/:department" element={<LocationPage />} />
            <Route path="/zones/:department/:city" element={<LocationPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
