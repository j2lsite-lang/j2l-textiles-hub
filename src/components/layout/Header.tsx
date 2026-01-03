import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Phone, PhoneCall, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { cn } from '@/lib/utils';
import { COMPANY_INFO } from '@/lib/company-info';
import logoJ2L from '@/assets/logo-j2l.png';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Import category images
import workwearImg from '@/assets/categories/workwear-pro.jpg';
import gastroImg from '@/assets/categories/gastro-pro.jpg';
import sportImg from '@/assets/categories/sport-pro.jpg';
import corporateImg from '@/assets/categories/corporate-pro.jpg';
import hivisImg from '@/assets/categories/hivis-pro.jpg';

const universList = [
  {
    name: 'Workwear',
    image: workwearImg,
    subcategories: [
      { label: 'Distribution - Logistique', query: 'workwear' },
      { label: 'Industrie - Sécurité - BTP', query: 'workwear' },
      { label: 'Jardinerie - Bricolage', query: 'workwear' },
      { label: 'EPI', query: 'workwear' },
    ]
  },
  {
    name: 'Hospitality',
    image: gastroImg,
    subcategories: [
      { label: 'CHR Métiers de bouche', query: 'hospitality' },
      { label: 'Santé - Beauté - Hygiène', query: 'hospitality' },
      { label: 'Accueil', query: 'hospitality' },
      { label: 'Artisanat - Commerce', query: 'hospitality' },
    ]
  },
  {
    name: 'Création / Événementiel',
    image: corporateImg,
    subcategories: [
      { label: 'Créateur de marques', query: 'evenementiel' },
      { label: 'Université - BDE - écoles', query: 'evenementiel' },
      { label: 'Media Merchandising', query: 'evenementiel' },
      { label: 'Tourisme - Culture', query: 'evenementiel' },
    ]
  },
  {
    name: 'Sport',
    image: sportImg,
    subcategories: [
      { label: 'Sports collectifs', query: 'sport' },
      { label: 'Sports individuels', query: 'sport' },
      { label: 'Matériel de sport', query: 'sport' },
    ]
  },
  {
    name: 'Haute Visibilité',
    image: hivisImg,
    subcategories: [
      { label: 'Vestes haute visibilité', query: 'hivis' },
      { label: 'Pantalons', query: 'hivis' },
      { label: 'Accessoires', query: 'hivis' },
    ]
  },
];

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Produits' },
  { href: '/personnalisation', label: 'Personnalisation' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { itemCount } = useQuoteCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-primary text-primary-foreground text-sm py-2">
        <div className="container-page flex items-center justify-between">
          <p className="text-white/70">
            Devis gratuit en 24h • Livraison rapide • Personnalisation sur-mesure
          </p>
          <a 
            href={`tel:${COMPANY_INFO.phoneLink}`}
            className="flex items-center gap-2 text-white hover:text-accent transition-colors font-medium"
          >
            <Phone className="h-4 w-4" />
            {COMPANY_INFO.phone}
          </a>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-border'
            : 'bg-white'
        )}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-24 md:h-32">
            {/* Logo Premium */}
            <Link to="/" className="flex items-center group">
              <img 
                src={logoJ2L} 
                alt="J2L Textiles" 
                className="h-20 md:h-28 lg:h-32 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname === '/'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                Accueil
              </Link>

              {/* Mega Menu Univers */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'px-5 py-2.5 rounded-lg text-base font-semibold transition-all flex items-center gap-1.5',
                      'text-foreground hover:text-primary hover:bg-secondary'
                    )}
                  >
                    Univers
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 border-t-4 border-t-primary shadow-xl" 
                  align="center"
                  sideOffset={8}
                >
                  <div className="bg-white">
                    <div className="flex gap-0">
                      {universList.map((univers) => (
                        <div key={univers.name} className="w-48 p-4 border-r last:border-r-0 border-border">
                          {/* Category Image */}
                          <Link 
                            to={`/catalogue?category=${univers.subcategories[0]?.query || ''}`}
                            className="block mb-3 overflow-hidden rounded-lg border-2 border-primary/20 hover:border-primary transition-colors"
                          >
                            <img 
                              src={univers.image} 
                              alt={univers.name}
                              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          
                          {/* Category Name */}
                          <h3 className="font-bold text-foreground text-sm mb-2">{univers.name}</h3>
                          
                          {/* Subcategories */}
                          <ul className="space-y-1.5">
                            {univers.subcategories.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  to={`/catalogue?category=${sub.query}`}
                                  className="text-sm text-primary hover:text-accent transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="border-t border-border p-3 text-center bg-muted/30">
                      <Link 
                        to="/catalogue" 
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        Voir tous les produits
                      </Link>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Link
                to="/catalogue"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname === '/catalogue'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                Marques
              </Link>

              <Link
                to="/personnalisation"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname === '/personnalisation'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                Personnalisation
              </Link>

              <Link
                to="/faq"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname === '/faq'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                FAQ
              </Link>

              <Link
                to="/contact"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname === '/contact'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/catalogue" className="hidden sm:flex">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/devis" className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full accent-gradient text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Call button */}
              <a href={`tel:${COMPANY_INFO.phoneLink}`} className="hidden md:block">
                <Button variant="outline" size="sm" className="flex items-center gap-2 font-semibold border-primary/20 hover:border-primary hover:bg-primary/5">
                  <PhoneCall className="h-4 w-4 text-accent" />
                  {COMPANY_INFO.phone}
                </Button>
              </a>

              <Link to="/devis" className="hidden sm:block">
                <Button className="font-semibold accent-gradient text-white border-0 shadow-accent hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Demander un devis
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === link.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/devis" className="mt-2">
                  <Button className="w-full accent-gradient text-white font-semibold">
                    Demander un devis
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
