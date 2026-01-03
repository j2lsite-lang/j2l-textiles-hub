import { Link } from 'react-router-dom';
import { Printer, Palette, PenTool, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Printer,
    title: 'Sérigraphie',
    description: 'Idéale pour les grandes quantités. Couleurs vives et durables, parfaites pour les textiles unis.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Palette,
    title: 'Impression numérique',
    description: 'Photo-réaliste et multi-couleurs. Convient aux petites et moyennes séries avec des designs complexes.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: PenTool,
    title: 'Broderie',
    description: 'Aspect premium et durable. Parfaite pour les logos d\'entreprise sur polos et vestes.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: FileText,
    title: 'Flocage & Flex',
    description: 'Rendu mat ou brillant. Idéal pour les noms, numéros et petits textes personnalisés.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
];

const guarantees = [
  'Devis gratuit en 24h',
  'Conseils personnalisés',
  'Qualité professionnelle',
  'Livraison rapide',
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
                  className="group p-5 rounded-2xl border border-border hover:border-accent/30 hover:shadow-soft transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${service.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <service.icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/personnalisation">
                <Button variant="outline" className="group border-2 font-semibold">
                  En savoir plus sur nos techniques
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/10 rounded-3xl blur-2xl" />
            <div className="relative surface-elevated p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl accent-gradient flex items-center justify-center shadow-accent">
                  <Palette className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Votre logo, notre savoir-faire
                </h3>
                <p className="text-muted-foreground">
                  Conseils gratuits pour choisir la meilleure technique
                </p>
              </div>

              <div className="space-y-3">
                {guarantees.map((guarantee) => (
                  <div key={guarantee} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm font-medium">{guarantee}</span>
                  </div>
                ))}
              </div>

              <Link to="/devis" className="block mt-8">
                <Button className="w-full accent-gradient text-white font-semibold h-12 shadow-accent hover:shadow-lg transition-all group">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
