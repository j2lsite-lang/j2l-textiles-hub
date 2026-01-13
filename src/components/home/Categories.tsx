import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

// Import optimized WebP images
import poloImg from '@/assets/categories/polo-lifestyle.webp';
import workwearImg from '@/assets/categories/workwear-lifestyle.webp';
import gastroImg from '@/assets/categories/gastro-lifestyle.webp';
import sportImg from '@/assets/categories/sport-lifestyle.webp';
import corporateImg from '@/assets/categories/corporate-lifestyle.webp';
import hivisImg from '@/assets/categories/hivis-lifestyle.webp';

const categories = [
  {
    image: poloImg,
    name: 'Polos & T-shirts',
    slug: 't-shirts',
  },
  {
    image: gastroImg,
    name: 'Gastro & Hôtellerie',
    slug: 'cuisine-hotellerie',
  },
  {
    image: corporateImg,
    name: 'Corporate',
    slug: 'chemises-corporate',
  },
  {
    image: sportImg,
    name: 'Sport & Loisirs',
    slug: 'sport-loisirs',
  },
  {
    image: workwearImg,
    name: 'EPI & Chantier',
    slug: 'vetements-travail',
  },
  {
    image: hivisImg,
    name: 'Haute visibilité',
    slug: 'haute-visibilite',
  },
];

export function Categories() {
  return (
    <section className="section-padding section-gray" aria-labelledby="categories-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="Catégories"
          title="Explorez notre gamme de textiles professionnels"
          description="Des vêtements de travail et textiles personnalisés pour tous les secteurs d'activité : restauration, BTP, corporate, sport et bien plus."
          id="categories-title"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/catalogue/${category.slug}`}
              className="group"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                {/* Background image - WebP optimized */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding={index < 3 ? "sync" : "async"}
                  width={512}
                  height={672}
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
