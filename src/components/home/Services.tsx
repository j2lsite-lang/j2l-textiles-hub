import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Layers, 
  Droplets, 
  Scissors,
  Flame,
  Clock,
  Eye,
  Truck,
  Award
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { TrustBadge } from '@/components/ui/premium-icon';

const services = [
  {
    icon: Layers,
    title: 'Sérigraphie',
    description: 'Idéale pour les grandes quantités. Couleurs vives et durables, parfaites pour les textiles unis.',
    swatch: 'bg-blue-500',
  },
  {
    icon: Droplets,
    title: 'Impression DTG',
    description: 'Photo-réaliste et multi-couleurs. Convient aux petites et moyennes séries avec des designs complexes.',
    swatch: 'bg-purple-500',
  },
  {
    icon: Scissors,
    title: 'Broderie',
    description: 'Aspect premium et durable. Parfaite pour les logos d\'entreprise sur polos et vestes.',
    swatch: 'bg-amber-500',
  },
  {
    icon: Flame,
    title: 'Flocage & Flex',
    description: 'Rendu mat ou brillant. Idéal pour les noms, numéros et petits textes personnalisés.',
    swatch: 'bg-green-500',
  },
];

const guarantees = [
  { icon: Clock, title: 'Devis en 24h', description: 'Réponse rapide garantie' },
  { icon: Eye, title: 'BAT avant prod', description: 'Validation visuelle offerte' },
  { icon: Truck, title: 'Livraison express', description: 'Partout en France' },
  { icon: Award, title: 'Qualité pro', description: 'Satisfaction garantie' },
];

export function Services() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <SectionHeader
              eyebrow="Personnalisation"
              title="Des techniques adaptées à vos besoins"
              description="Nous maîtrisons toutes les techniques de marquage pour sublimer vos textiles et objets publicitaires."
              align="left"
            />

            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {services.map((service, index) => (
                <div 
                  key={service.title} 
                  className="group p-5 rounded-2xl border border-border hover:border-accent/30 hover:shadow-soft transition-all animate-slide-up bg-background"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with swatch indicator */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <service.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" strokeWidth={1.5} />
                      </div>
                      {/* Color swatch */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md ${service.swatch} border-2 border-background shadow-sm`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base mb-1">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/personnalisation">
                <Button variant="outline" className="group border-2 font-semibold">
                  En savoir plus sur nos techniques
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/10 rounded-3xl blur-2xl" />
            <div className="relative surface-elevated p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl accent-gradient flex items-center justify-center shadow-lg">
                  <Droplets className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Votre logo, notre savoir-faire
                </h3>
                <p className="text-base text-muted-foreground">
                  Conseils gratuits pour choisir la meilleure technique
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {guarantees.map((guarantee) => (
                  <TrustBadge 
                    key={guarantee.title} 
                    icon={guarantee.icon} 
                    title={guarantee.title}
                    description={guarantee.description}
                    className="p-3 bg-secondary/50 rounded-xl"
                  />
                ))}
              </div>

              <Link to="/devis" className="block mt-8">
                <Button className="w-full accent-gradient text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all group">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
