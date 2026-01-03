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
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500',
  },
  {
    icon: HardHat,
    name: 'Vêtements de travail',
    description: 'Vestes, pantalons, blouses',
    query: 'travail',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500',
  },
  {
    icon: Gift,
    name: 'Objets publicitaires',
    description: 'Goodies et accessoires',
    query: 'objet',
    gradient: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-500',
  },
  {
    icon: Briefcase,
    name: 'Bagagerie',
    description: 'Sacs, sacoches, valises',
    query: 'sac',
    gradient: 'from-purple-500 to-violet-500',
    iconBg: 'bg-purple-500',
  },
  {
    icon: Umbrella,
    name: 'Pluie & Vent',
    description: 'Parapluies, coupe-vent',
    query: 'parapluie',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500',
  },
  {
    icon: Flame,
    name: 'Haute visibilité',
    description: 'Vêtements normés',
    query: 'visibilite',
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-500',
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
                {/* Gradient background on hover */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  category.gradient
                )} />
                
                <div className="relative z-10">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-300',
                    category.iconBg,
                    'group-hover:bg-white/20 group-hover:scale-110'
                  )}>
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-white transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">
                    {category.description}
                  </p>
                  <ArrowRight className="h-4 w-4 mx-auto mt-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-white transition-all transform group-hover:translate-x-0 -translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
