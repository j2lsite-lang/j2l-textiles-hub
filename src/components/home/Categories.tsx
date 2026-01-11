import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

// Import lifestyle images with people
import poloImg from '@/assets/categories/polo-lifestyle.jpg';
import workwearImg from '@/assets/categories/workwear-lifestyle.jpg';
import gastroImg from '@/assets/categories/gastro-lifestyle.jpg';
import sportImg from '@/assets/categories/sport-lifestyle.jpg';
import corporateImg from '@/assets/categories/corporate-lifestyle.jpg';
import hivisImg from '@/assets/categories/hivis-lifestyle.jpg';

const categories = [
  {
    image: poloImg,
    name: 'Polos & T-shirts',
    query: 't-shirt',
  },
  {
    image: gastroImg,
    name: 'Gastro & Hôtellerie',
    query: 'cuisine',
  },
  {
    image: corporateImg,
    name: 'Corporate',
    query: 'chemise',
  },
  {
    image: sportImg,
    name: 'Sport & Loisirs',
    query: 'sport',
  },
  {
    image: workwearImg,
    name: 'EPI & Chantier',
    query: 'travail',
  },
  {
    image: hivisImg,
    name: 'Haute visibilité',
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
          description="Des textiles professionnels pour tous les secteurs d'activité"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/catalogue?q=${category.query}`}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                {/* Background image */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-3">
                    {category.name}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary font-semibold text-sm uppercase tracking-wide py-3"
                  >
                    Voir le catalogue
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
