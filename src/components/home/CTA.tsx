import { Link } from 'react-router-dom';
import { ArrowRight, Send, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="section-padding bg-foreground text-background">
      <div className="container-page">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Prêt à personnaliser vos textiles ?
          </h2>
          <p className="text-lg text-background/70 mb-10 max-w-2xl mx-auto">
            Obtenez un devis gratuit en quelques clics. Notre équipe vous répond sous 24h avec des conseils personnalisés.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Demander un devis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/personnalisation">
              <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 font-semibold w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Envoyer mon logo
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-background/50">
            Devis gratuit • Sans engagement • Réponse sous 24h
          </p>
        </div>
      </div>
    </section>
  );
}
