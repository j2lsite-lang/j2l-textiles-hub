import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

// Custom SVG icons for a unique, premium textile look
const TshirtIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <path d="M16 12L8 20V28L16 24V52H48V24L56 28V20L48 12H40L38 16C38 18.2 35.3 20 32 20S26 18.2 26 16L24 12H16Z" 
      className="stroke-primary" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 16C26 18.2 28.7 20 32 20S38 18.2 38 16" 
      className="stroke-accent" strokeLinecap="round"/>
  </svg>
);

const WorkwearIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <path d="M20 12L12 20V52H52V20L44 12H20Z" 
      className="stroke-primary" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 12V20H40V12" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="28" y="28" width="8" height="12" rx="1" className="stroke-accent" strokeLinecap="round"/>
    <circle cx="32" cy="24" r="2" className="fill-accent"/>
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <rect x="12" y="24" width="40" height="28" rx="2" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="16" y="16" width="32" height="8" rx="1" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 16V52" className="stroke-accent" strokeLinecap="round"/>
    <path d="M32 16C32 16 28 12 24 12C20 12 20 16 20 16" className="stroke-accent" strokeLinecap="round"/>
    <path d="M32 16C32 16 36 12 40 12C44 12 44 16 44 16" className="stroke-accent" strokeLinecap="round"/>
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <rect x="12" y="20" width="40" height="32" rx="3" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 20V16C20 12 24 10 32 10S44 12 44 16V20" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 28H28" className="stroke-accent" strokeLinecap="round"/>
    <circle cx="24" cy="40" r="3" className="stroke-accent"/>
  </svg>
);

const UmbrellaIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <path d="M32 8C18 8 8 20 8 32H56C56 20 46 8 32 8Z" className="stroke-primary" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 32V50C32 52 30 54 28 54S24 52 24 50" className="stroke-primary" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 32C20 28 24 24 32 24S44 28 44 32" className="stroke-accent" strokeLinecap="round"/>
  </svg>
);

const SafetyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" strokeWidth="1.5">
    <path d="M16 12L8 20V28L16 24V52H48V24L56 28V20L48 12H40L38 16C38 18.2 35.3 20 32 20S26 18.2 26 16L24 12H16Z" 
      className="stroke-primary" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 32H48" className="stroke-accent" strokeLinecap="round"/>
    <path d="M16 40H48" className="stroke-accent" strokeLinecap="round"/>
  </svg>
);

const categories = [
  {
    Icon: TshirtIcon,
    name: 'T-shirts & Polos',
    description: 'Coton, polyester, bio',
    query: 't-shirt',
  },
  {
    Icon: WorkwearIcon,
    name: 'Vêtements de travail',
    description: 'Vestes, pantalons, blouses',
    query: 'travail',
  },
  {
    Icon: GiftIcon,
    name: 'Objets publicitaires',
    description: 'Goodies et accessoires',
    query: 'objet',
  },
  {
    Icon: BagIcon,
    name: 'Bagagerie',
    description: 'Sacs, sacoches, valises',
    query: 'sac',
  },
  {
    Icon: UmbrellaIcon,
    name: 'Pluie & Vent',
    description: 'Parapluies, coupe-vent',
    query: 'parapluie',
  },
  {
    Icon: SafetyIcon,
    name: 'Haute visibilité',
    description: 'Vêtements normés',
    query: 'visibilite',
  },
];

export function Categories() {
  return (
    <section className="section-padding section-gray">
      <div className="container-page">
        <SectionHeader
          eyebrow="Catégories"
          title="Explorez notre gamme"
          description="Des milliers de produits textiles et objets promotionnels à personnaliser"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 mt-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/catalogue?q=${category.query}`}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="bg-white rounded-2xl p-5 text-center hover-lift h-full flex flex-col items-center justify-center border border-border/50 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                {/* Premium illustration container */}
                <div className="w-20 h-20 mb-4 p-3 rounded-xl bg-gradient-to-br from-secondary to-muted/50 group-hover:from-accent/5 group-hover:to-accent/10 transition-all duration-300">
                  <category.Icon />
                </div>
                
                <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {category.description}
                </p>
                <div className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-all text-xs font-medium">
                  <span>Voir</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
