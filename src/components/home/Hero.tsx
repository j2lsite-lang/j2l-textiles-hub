import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Truck, BadgeCheck, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Palette, label: 'Personnalisation sur-mesure' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: BadgeCheck, label: 'Qualité professionnelle' },
];

const stats = [
  { value: '5000+', label: 'Produits' },
  { value: '24h', label: 'Devis gratuit' },
  { value: '100%', label: 'Satisfaction' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-40" />
      </div>
      
      <div className="relative container-page">
        <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium animate-fade-in">
                <Zap className="h-4 w-4 text-accent" />
                Fournisseur textile professionnel
                <Star className="h-3 w-3 text-accent fill-accent" />
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] animate-slide-up">
                Textiles personnalisés pour{' '}
                <span className="relative">
                  <span className="text-accent">votre entreprise</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/30" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Vêtements de travail, objets promotionnels, accessoires... 
                Découvrez notre catalogue et personnalisez vos textiles avec votre logo.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/catalogue">
                  <Button 
                    size="lg" 
                    className="font-semibold accent-gradient text-white border-0 shadow-accent hover:shadow-lg hover:-translate-y-1 transition-all h-14 px-8 text-base group"
                  >
                    Parcourir le catalogue
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/devis">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-semibold border-2 border-white/30 text-white hover:bg-white hover:text-primary hover:border-white h-14 px-8 text-base transition-all"
                  >
                    Demander un devis
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-6 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-2 text-white/80">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="absolute inset-0 accent-gradient rounded-3xl blur-2xl opacity-30 scale-95" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    {stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="text-4xl font-display font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-white/60">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-white/70 text-sm text-center">
                      Rejoignez plus de <strong className="text-white">500 entreprises</strong> qui nous font confiance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(210, 20%, 98%)"/>
        </svg>
      </div>
    </section>
  );
}
