import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { COMPANY_INFO } from '@/lib/company-info';
import { CallbackModal } from '@/components/CallbackModal';
import logoJ2L from '@/assets/logo-j2l.png';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Import category images
import workwearImg from '@/assets/categories/workwear-lifestyle.webp';
import gastroImg from '@/assets/categories/gastro-lifestyle.webp';
import sportImg from '@/assets/categories/sport-lifestyle.webp';
import corporateImg from '@/assets/categories/corporate-lifestyle.webp';
import hivisImg from '@/assets/categories/hivis-lifestyle.webp';

// Mapping univers - utilise des filtres par catégorie pour des résultats fiables
// On utilise le paramètre 'cat' pour filtrer par nom de produit (smart categories)
const universList = [
  {
    name: 'Workwear',
    image: workwearImg,
    subcategories: [
      { label: 'Vestes & Blousons', cat: 'Vestes' },
      { label: 'Pantalons', cat: 'Pantalons' },
      { label: 'Gilets', cat: 'Gilets' },
      { label: 'Accessoires', cat: 'Accessoires' },
    ]
  },
  {
    name: 'Hospitality',
    image: gastroImg,
    subcategories: [
      { label: 'Tabliers', cat: 'Tabliers' },
      { label: 'Serviettes', cat: 'Serviettes' },
      { label: 'Chemises', cat: 'Chemises' },
      { label: 'Pantalons', cat: 'Pantalons' },
    ]
  },
  {
    name: 'Corporate',
    image: corporateImg,
    subcategories: [
      { label: 'Chemises', cat: 'Chemises' },
      { label: 'Polos', cat: 'Polos' },
      { label: 'Gilets', cat: 'Gilets' },
      { label: 'Accessoires', cat: 'Accessoires' },
    ]
  },
  {
    name: 'Sport',
    image: sportImg,
    subcategories: [
      { label: 'T-shirts', cat: 'T-shirts' },
      { label: 'Sweats', cat: 'Sweats' },
      { label: 'Pantalons & Shorts', cat: 'Pantalons' },
      { label: 'Sacs', cat: 'Sacs' },
    ]
  },
  {
    name: 'Haute Visibilité',
    image: hivisImg,
    subcategories: [
      { label: 'Vestes HV', cat: 'Vestes' },
      { label: 'Gilets HV', cat: 'Gilets' },
      { label: 'Pantalons HV', cat: 'Pantalons' },
      { label: 'Accessoires', cat: 'Accessoires' },
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
  const { itemCount } = useCart();

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
                width={256}
                height={128}
                decoding="async"
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

              {/* Mega Menu Vêtements Professionnels */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'px-5 py-2.5 rounded-lg text-base font-semibold transition-all flex items-center gap-1.5',
                      'text-foreground hover:text-primary hover:bg-secondary'
                    )}
                  >
                    Vêtements Professionnels
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
                            to={`/catalogue?cat=${encodeURIComponent(univers.subcategories[0]?.cat || '')}`}
                            className="block mb-3 overflow-hidden rounded-lg border-2 border-primary/20 hover:border-primary transition-colors"
                          >
                            <img 
                              src={univers.image} 
                              alt={univers.name}
                              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                              width={192}
                              height={128}
                              loading="lazy"
                              decoding="async"
                            />
                          </Link>
                          
                          {/* Category Name */}
                          <h3 className="font-bold text-foreground text-sm mb-2">{univers.name}</h3>
                          
                          {/* Subcategories */}
                          <ul className="space-y-1.5">
                            {univers.subcategories.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  to={`/catalogue?cat=${encodeURIComponent(sub.cat)}`}
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
                  </div>
                </PopoverContent>
              </Popover>

              {/* Lien direct Nos Produits */}
              <Link
                to="/catalogue"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  'text-foreground hover:text-primary hover:bg-secondary'
                )}
              >
                Nos Produits
              </Link>

              <Link
                to="/marques"
                className={cn(
                  'px-5 py-2.5 rounded-lg text-base font-semibold transition-all',
                  location.pathname.startsWith('/marques')
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
            <div className="flex items-center gap-3">
              <Link to="/catalogue" className="hidden sm:flex">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/panier" className="relative z-10">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full accent-gradient text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Callback Modal - hidden on mobile */}
              <div className="hidden md:block">
                <CallbackModal />
              </div>

              <Link to="/panier" className="hidden sm:block">
                <Button className="font-semibold accent-gradient text-white border-0 shadow-accent hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Mon panier
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
            <div className="lg:hidden py-4 border-t border-border animate-fade-in max-h-[80vh] overflow-y-auto">
              <nav className="flex flex-col gap-2">
                {/* Quick Actions - Rappel + Téléphone */}
                <div className="px-4 pb-3 border-b border-border flex gap-2">
                  <CallbackModal />
                  <a 
                    href={`tel:${COMPANY_INFO.phoneLink}`}
                    className="flex-1"
                  >
                    <Button variant="default" className="w-full gap-2 accent-gradient text-white">
                      <Phone className="h-4 w-4" />
                      Appeler
                    </Button>
                  </a>
                </div>

                {/* Navigation principale */}
                <Link
                  to="/"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  Accueil
                </Link>

                <Link
                  to="/catalogue"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/catalogue'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  Tous les produits
                </Link>

                {/* Catégories populaires - bien visibles */}
                <div className="px-4 py-3 bg-muted/50 rounded-lg mx-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
                    Catégories populaires
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'T-shirts', cat: 'T-shirts', emoji: '👕' },
                      { label: 'Polos', cat: 'Polos', emoji: '👔' },
                      { label: 'Sweats', cat: 'Sweats', emoji: '🧥' },
                      { label: 'Vestes', cat: 'Vestes', emoji: '🧥' },
                      { label: 'Pantalons', cat: 'Pantalons', emoji: '👖' },
                      { label: 'Sacs', cat: 'Sacs', emoji: '👜' },
                    ].map((item) => (
                      <Link
                        key={item.cat}
                        to={`/catalogue?cat=${encodeURIComponent(item.cat)}`}
                        className="flex flex-col items-center p-2 rounded-lg bg-background border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-xl mb-1">{item.emoji}</span>
                        <span className="text-xs font-medium text-center">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Univers avec images */}
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
                    Nos univers
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {universList.map((univers) => (
                      <Link
                        key={univers.name}
                        to={`/catalogue?cat=${encodeURIComponent(univers.subcategories[0]?.cat || '')}`}
                        className="relative overflow-hidden rounded-lg border-2 border-border hover:border-primary group"
                      >
                        <img 
                          src={univers.image} 
                          alt={univers.name}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                          width={160}
                          height={96}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold">
                          {univers.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Marques */}
                <Link
                  to="/marques"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                    location.pathname.startsWith('/marques')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <span>Nos marques</span>
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Link>

                {/* Autres liens */}
                <Link
                  to="/personnalisation"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/personnalisation'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  Personnalisation
                </Link>

                <Link
                  to="/faq"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/faq'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  FAQ
                </Link>

                <Link
                  to="/contact"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/contact'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  Contact
                </Link>
                
                <div className="mt-2 px-4">
                  <Link to="/panier">
                    <Button className="w-full accent-gradient text-white font-semibold gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Mon panier {itemCount > 0 && `(${itemCount})`}
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
