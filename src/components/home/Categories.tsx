import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { 
  Shirt, 
  HardHat, 
  Gift, 
  Backpack, 
  Umbrella, 
  ShieldAlert 
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/utils';

const categories = [
  {
    icon: Shirt,
    name: 'T-shirts & Polos',
    description: 'Coton, polyester, bio',
    query: 't-shirt',
  },
  {
    icon: HardHat,
    name: 'Vêtements de travail',
    description: 'Vestes, pantalons, blouses',
    query: 'travail',
  },
  {
    icon: Gift,
    name: 'Objets publicitaires',
    description: 'Goodies et accessoires',
    query: 'objet',
  },
  {
    icon: Backpack,
    name: 'Bagagerie',
    description: 'Sacs, sacoches, valises',
    query: 'sac',
  },
  {
    icon: Umbrella,
    name: 'Pluie & Vent',
    description: 'Parapluies, coupe-vent',
    query: 'parapluie',
  },
  {
    icon: ShieldAlert,
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mt-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/catalogue?q=${category.query}`}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="surface-elevated p-6 text-center hover-lift h-full flex flex-col items-center justify-center relative overflow-hidden">
                {/* Hover accent border */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-accent/30 transition-colors duration-300" />
                
                <div className="relative z-10">
                  {/* Premium icon container */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto transition-all duration-300',
                    'bg-primary/8 group-hover:bg-accent/10'
                  )}>
                    <category.icon 
                      className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-300" 
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                  <ArrowRight className="h-4 w-4 mx-auto mt-3 text-accent opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2" strokeWidth={1.75} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
