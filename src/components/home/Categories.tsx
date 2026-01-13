import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import optimized WebP images
import poloImg from '@/assets/categories/polo-lifestyle.webp';
import workwearImg from '@/assets/categories/workwear-lifestyle.webp';
import gastroImg from '@/assets/categories/gastro-lifestyle.webp';
import sportImg from '@/assets/categories/sport-lifestyle.webp';
import corporateImg from '@/assets/categories/corporate-lifestyle.webp';
import hivisImg from '@/assets/categories/hivis-lifestyle.webp';

// Catégories avec liens vers les univers TopTex
const categories = [
  {
    image: workwearImg,
    name: 'Workwear',
    description: 'Vêtements de travail professionnels',
    slug: 'workwear',
    type: 'univers',
  },
  {
    image: gastroImg,
    name: 'Hôtellerie & Restauration',
    description: 'Tenues CHR & métiers de bouche',
    slug: 'chr',
    type: 'univers',
  },
  {
    image: corporateImg,
    name: 'Corporate',
    description: 'Tenues professionnelles élégantes',
    slug: 'accueil',
    type: 'univers',
  },
  {
    image: sportImg,
    name: 'Sport & Loisirs',
    description: 'Équipements sportifs personnalisables',
    slug: 'sport',
    type: 'univers',
  },
  {
    image: hivisImg,
    name: 'Haute Visibilité',
    description: 'Vêtements de sécurité EPI',
    slug: 'epi',
    type: 'univers',
  },
  {
    image: poloImg,
    name: 'Mode & Retail',
    description: 'T-shirts, polos et textiles mode',
    slug: 'mode-retail',
    type: 'univers',
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
              to={category.type === 'univers' ? `/univers/${category.slug}` : `/catalogue/${category.slug}`}
              className="group"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-3 hidden md:block">
                    {category.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary font-semibold text-sm uppercase tracking-wide py-3 group-hover:bg-white group-hover:text-primary transition-colors"
                  >
                    Voir les produits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bouton voir tout le catalogue */}
        <div className="mt-10 text-center">
          <Link to="/catalogue">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base"
            >
              Voir tout le catalogue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
