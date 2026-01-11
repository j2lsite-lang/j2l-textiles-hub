import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Palette, Truck, BadgeCheck, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBgDesktop from '@/assets/hero-bg-optimized.jpg';
import heroBgMobile from '@/assets/hero-mobile.webp';

const features = [
  { icon: Palette, label: 'Personnalisation sur-mesure' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: BadgeCheck, label: 'Qualité professionnelle' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Helmet>
        {/* Preload mobile hero image for LCP optimization */}
        <link 
          rel="preload" 
          as="image" 
          href={heroBgMobile} 
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link 
          rel="preload" 
          as="image" 
          href={heroBgDesktop} 
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      </Helmet>
      
      {/* Background with responsive images */}
      <div className="absolute inset-0">
        {/* Mobile image */}
        <picture>
          <source 
            media="(max-width: 767px)" 
            srcSet={heroBgMobile}
            type="image/webp"
          />
          <source 
            media="(min-width: 768px)" 
            srcSet={heroBgDesktop}
            type="image/jpeg"
          />
          <img 
            src={heroBgMobile}
            alt="Textiles personnalisés pour entreprises" 
            className="w-full h-full object-cover"
            style={{ objectPosition: '75% center' }}
            fetchPriority="high"
            decoding="sync"
            width={800}
            height={600}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
      </div>
      
      {/* Decorative elements - simplified for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container-page">
        <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center py-16 lg:py-24">
          <div className="max-w-xl lg:max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-base font-medium mb-8">
              <Zap className="h-4 w-4 text-accent" />
              Fournisseur textile professionnel
              <Star className="h-3 w-3 text-accent fill-accent" />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-[1.1] mb-6">
              Textiles personnalisés pour{' '}
              <span className="relative inline-block">
                <span className="text-accent">votre entreprise</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg mb-8">
              Vêtements de travail, accessoires textiles personnalisés... 
              Découvrez notre catalogue et personnalisez vos textiles avec votre logo.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
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
                  className="font-semibold bg-white text-primary hover:bg-white/90 h-14 px-8 text-base transition-all shadow-lg"
                >
                  Demander un devis
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-base font-semibold">{feature.label}</span>
                </div>
              ))}
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
