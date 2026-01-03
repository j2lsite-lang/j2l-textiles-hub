import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

// Import product images
import tshirtImg from '@/assets/categories/tshirt.png';
import workwearImg from '@/assets/categories/workwear.png';
import goodiesImg from '@/assets/categories/goodies.png';
import bagImg from '@/assets/categories/bag.png';
import umbrellaImg from '@/assets/categories/umbrella.png';
import safetyImg from '@/assets/categories/safety.png';

const categories = [
  {
    image: tshirtImg,
    name: 'T-shirts & Polos',
    description: 'Coton, polyester, bio',
    query: 't-shirt',
  },
  {
    image: workwearImg,
    name: 'Vêtements de travail',
    description: 'Vestes, pantalons, blouses',
    query: 'travail',
  },
  {
    image: goodiesImg,
    name: 'Objets publicitaires',
    description: 'Goodies et accessoires',
    query: 'objet',
  },
  {
    image: bagImg,
    name: 'Bagagerie',
    description: 'Sacs, sacoches, valises',
    query: 'sac',
  },
  {
    image: umbrellaImg,
    name: 'Pluie & Vent',
    description: 'Parapluies, coupe-vent',
    query: 'parapluie',
  },
  {
    image: safetyImg,
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
              <div className="bg-white rounded-2xl overflow-hidden text-center hover-lift h-full flex flex-col border border-border/50 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                {/* Product image */}
                <div className="aspect-square bg-gradient-to-br from-secondary/50 to-muted/30 p-4 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-all text-xs font-medium">
                    <span>Voir</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
