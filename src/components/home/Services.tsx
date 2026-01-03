import { Link } from 'react-router-dom';
import { Printer, Palette, PenTool, FileText, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Printer,
    title: 'Sérigraphie',
    description: 'Idéale pour les grandes quantités. Couleurs vives et durables, parfaites pour les textiles unis.',
  },
  {
    icon: Palette,
    title: 'Impression numérique',
    description: 'Photo-réaliste et multi-couleurs. Convient aux petites et moyennes séries avec des designs complexes.',
  },
  {
    icon: PenTool,
    title: 'Broderie',
    description: 'Aspect premium et durable. Parfaite pour les logos d\'entreprise sur polos et vestes.',
  },
  {
    icon: FileText,
    title: 'Flocage & Flex',
    description: 'Rendu mat ou brillant. Idéal pour les noms, numéros et petits textes personnalisés.',
  },
];

export function Services() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <SectionHeader
              eyebrow="Personnalisation"
              title="Des techniques adaptées à vos besoins"
              description="Nous maîtrisons toutes les techniques de marquage pour sublimer vos textiles et objets publicitaires."
              align="left"
            />

            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {services.map((service) => (
                <div key={service.title} className="group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <service.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{service.title}</h3>
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
                <Button variant="outline" className="group">
                  En savoir plus
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Palette className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                  Votre logo, notre savoir-faire
                </h3>
                <p className="text-muted-foreground">
                  Conseils gratuits pour choisir la meilleure technique
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
