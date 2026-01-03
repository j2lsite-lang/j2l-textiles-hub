import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { cn } from '@/lib/utils';
import { COMPANY_INFO } from '@/lib/company-info';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Catalogue' },
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
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-display font-bold text-foreground">
                J2L<span className="text-accent group-hover:text-primary transition-colors">Textiles</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    location.pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
