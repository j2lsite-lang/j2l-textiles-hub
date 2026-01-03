import { Link } from 'react-router-dom';
import { ArrowRight, Send, Upload, Clock, Eye, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/company-info';
import { LucideIcon } from 'lucide-react';

interface BenefitItem {
  icon: LucideIcon;
  label: string;
}

const benefits: BenefitItem[] = [
  { icon: Clock, label: 'Devis en 24h' },
  { icon: Eye, label: 'BAT offert' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: Award, label: 'Qualité pro' },
];

export function CTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-40" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-page relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
            <Send className="h-4 w-4 text-accent" strokeWidth={1.75} />
            Commencez maintenant
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Prêt à personnaliser vos textiles ?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Obtenez un devis gratuit en quelques clics. Notre équipe vous répond sous 24h avec des conseils personnalisés.
          </p>

          {/* Premium trust badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10">
            {benefits.map((benefit) => (
              <div key={benefit.label} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <benefit.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                </div>
                <span className="text-base font-semibold">{benefit.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button 
                size="lg" 
                className="accent-gradient text-white font-semibold h-14 px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group text-base"
              >
                <Send className="mr-2 h-5 w-5" strokeWidth={1.75} />
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Button>
            </Link>
            <Link to="/personnalisation">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold h-14 px-8 transition-all text-base"
              >
                <Upload className="mr-2 h-5 w-5" strokeWidth={1.75} />
                Envoyer mon logo
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-base text-white/70">
            Ou appelez-nous directement au{' '}
            <a href={`tel:${COMPANY_INFO.phoneLink}`} className="text-accent hover:underline font-semibold">
              {COMPANY_INFO.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
