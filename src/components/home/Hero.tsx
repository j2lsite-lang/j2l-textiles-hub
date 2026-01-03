import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Truck, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Palette, label: 'Personnalisation sur-mesure' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: BadgeCheck, label: 'Qualité professionnelle' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
      
      <div className="relative container-page">
        <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Fournisseur textile professionnel
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6 animate-slide-up">
              Textiles personnalisés pour{' '}
              <span className="text-accent">votre entreprise</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Vêtements de travail, objets promotionnels, accessoires... 
              Découvrez notre catalogue et personnalisez vos textiles avec votre logo.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/catalogue">
                <Button size="lg" variant="secondary" className="font-semibold group">
                  Parcourir le catalogue
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/devis">
                <Button size="lg" variant="outline" className="font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Demander un devis
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 text-white/70">
                  <feature.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
