import { Link } from 'react-router-dom';
import { ArrowRight, Send, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/company-info';

const benefits = [
  'Devis gratuit en 24h',
  'Sans engagement',
  'Conseils personnalisés',
  'Livraison rapide',
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
            <Send className="h-4 w-4 text-accent" />
            Commencez maintenant
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Prêt à personnaliser vos textiles ?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Obtenez un devis gratuit en quelques clics. Notre équipe vous répond sous 24h avec des conseils personnalisés.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                {benefit}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button 
                size="lg" 
                className="accent-gradient text-white font-semibold h-14 px-8 shadow-accent hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <Send className="mr-2 h-5 w-5" />
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/personnalisation">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-primary font-semibold h-14 px-8 transition-all"
              >
                <Upload className="mr-2 h-5 w-5" />
                Envoyer mon logo
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/50">
            Ou appelez-nous directement au{' '}
            <a href={`tel:${COMPANY_INFO.phoneLink}`} className="text-accent hover:underline font-medium">
              {COMPANY_INFO.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
