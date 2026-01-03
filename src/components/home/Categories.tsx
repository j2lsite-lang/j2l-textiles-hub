import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, HardHat, Gift, Briefcase, Umbrella, Flame } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/utils';

const categories = [
  {
    icon: Shirt,
    name: 'T-shirts & Polos',
    description: 'Coton, polyester, bio',
    query: 't-shirt',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: HardHat,
    name: 'Vêtements de travail',
    description: 'Vestes, pantalons, blouses',
    query: 'travail',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Gift,
    name: 'Objets publicitaires',
    description: 'Goodies et accessoires',
    query: 'objet',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Briefcase,
    name: 'Bagagerie',
    description: 'Sacs, sacoches, valises',
    query: 'sac',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Umbrella,
    name: 'Pluie & Vent',
    description: 'Parapluies, coupe-vent',
    query: 'parapluie',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Flame,
    name: 'Haute visibilité',
    description: 'Vêtements normés',
    query: 'visibilite',
    color: 'bg-orange-50 text-orange-600',
  },
];

export function Categories() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-page">
        <SectionHeader
          eyebrow="Catégories"
          title="Explorez notre gamme"
          description="Des milliers de produits textiles et objets promotionnels à personnaliser"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/catalogue?q=${category.query}`}
              className="group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="surface-elevated rounded-xl p-6 text-center hover-lift h-full flex flex-col items-center justify-center">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', category.color)}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.description}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
