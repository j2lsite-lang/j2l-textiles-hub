import { Link } from 'react-router-dom';
import { 
  Layers, 
  Droplets, 
  Scissors, 
  Flame,
  CheckCircle, 
  ArrowRight, 
  Upload,
  FileCode,
  Image,
  Maximize,
  Sparkles,
  PenTool
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { FileFormatBadge } from '@/components/ui/premium-icon';
import { cn } from '@/lib/utils';

const techniques = [
  {
    icon: Layers,
    name: 'Sérigraphie',
    description: 'Technique d\'impression par transfert d\'encre à travers un écran de soie. Idéale pour les grandes quantités et les designs avec peu de couleurs.',
    pros: ['Économique en grandes quantités', 'Couleurs vives et durables', 'Excellent rendu sur coton'],
    cons: ['Minimum 20 pièces', 'Limité en nombre de couleurs', 'Pas de dégradés'],
    ideal: 'T-shirts, sweats, sacs en grandes séries',
    swatch: 'bg-blue-500',
  },
  {
    icon: Droplets,
    name: 'Impression numérique',
    description: 'Impression directe sur textile (DTG) permettant des designs photo-réalistes avec des millions de couleurs.',
    pros: ['Détails et dégradés parfaits', 'Idéal petites quantités', 'Photos et designs complexes'],
    cons: ['Coût plus élevé', 'Moins durable au lavage', 'Meilleur sur textile clair'],
    ideal: 'Designs détaillés, photos, petites séries',
    swatch: 'bg-purple-500',
  },
  {
    icon: Scissors,
    name: 'Broderie',
    description: 'Personnalisation haut de gamme par fil brodé. Aspect premium et durabilité exceptionnelle.',
    pros: ['Aspect professionnel', 'Très durable', 'Relief et texture'],
    cons: ['Coût par pièce plus élevé', 'Designs simplifiés', 'Pas de dégradés'],
    ideal: 'Polos, vestes, casquettes, uniformes',
    swatch: 'bg-amber-500',
  },
  {
    icon: Flame,
    name: 'Flocage & Flex',
    description: 'Découpe de matière thermocollée et appliquée par presse à chaud. Rendu mat ou brillant au choix.',
    pros: ['Noms et numéros faciles', 'Durable', 'Finition mate ou brillante'],
    cons: ['Limité aux aplats', 'Pas de détails fins', 'Toucher "plastique"'],
    ideal: 'Équipes sportives, noms personnalisés',
    swatch: 'bg-green-500',
  },
];

const fileFormats = [
  { format: 'AI', recommended: true },
  { format: 'EPS', recommended: true },
  { format: 'PDF', recommended: true },
  { format: 'SVG', recommended: true },
  { format: 'PNG', recommended: false },
  { format: 'JPG', recommended: false },
];

const fileGuidelines = [
  {
    icon: FileCode,
    title: 'Formats vectoriels',
    description: 'Qualité optimale, redimensionnable sans perte. C\'est le format idéal.',
    extensions: ['AI', 'EPS', 'PDF', 'SVG'],
    recommended: true,
  },
  {
    icon: Image,
    title: 'Images haute résolution',
    description: 'Minimum 300 DPI à la taille d\'impression finale.',
    extensions: ['PNG', 'JPG', 'TIFF'],
    recommended: false,
  },
  {
    icon: Maximize,
    title: 'Taille minimale',
    description: '1000 × 1000 pixels minimum pour un rendu optimal.',
    extensions: [],
    recommended: false,
  },
];

export default function Personnalisation() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative container-page">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Personnalisation sur-mesure
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              Donnez vie à votre identité visuelle avec nos techniques de marquage professionnelles.
              Conseils gratuits pour choisir la solution adaptée à vos besoins.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/devis">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Demander un devis
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Techniques */}
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Techniques"
            title="Nos méthodes de personnalisation"
            description="Chaque technique a ses avantages. Découvrez celle qui correspond le mieux à votre projet."
          />

          <div className="mt-12 space-y-8">
            {techniques.map((technique, index) => (
              <div
                key={technique.name}
                className={cn(
                  'surface-elevated rounded-2xl p-6 md:p-8',
                  index % 2 === 1 && 'lg:flex-row-reverse'
                )}
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    {/* Premium icon with swatch */}
                    <div className="relative inline-block mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center">
                        <technique.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md ${technique.swatch} border-2 border-background shadow-sm`} />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-3">{technique.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{technique.description}</p>
                    <p className="mt-4 text-sm">
                      <span className="font-medium">Idéal pour :</span>{' '}
                      <span className="text-muted-foreground">{technique.ideal}</span>
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" strokeWidth={1.75} />
                        Avantages
                      </h4>
                      <ul className="space-y-2">
                        {technique.pros.map((pro) => (
                          <li key={pro} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-600 mb-3">À considérer</h4>
                      <ul className="space-y-2">
                        {technique.cons.map((con) => (
                          <li key={con} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* File Guidelines - Premium Studio Look */}
      <section className="section-padding bg-secondary/30">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeader
                eyebrow="Fichiers"
                title="Préparer votre logo"
                description="Pour une personnalisation réussie, envoyez-nous votre logo dans un format adapté."
                align="left"
              />

              {/* Format badges */}
              <div className="mt-6 mb-8">
                <p className="text-sm font-medium text-muted-foreground mb-3">Formats acceptés</p>
                <div className="flex flex-wrap gap-2">
                  {fileFormats.map((f) => (
                    <FileFormatBadge key={f.format} format={f.format} recommended={f.recommended} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {fileGuidelines.map((guide) => (
                  <div key={guide.title} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                      <guide.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/devis">
                  <Button className="group accent-gradient text-white font-semibold shadow-lg">
                    <Upload className="h-4 w-4 mr-2" strokeWidth={1.75} />
                    Envoyer mon logo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Vectorization offer card */}
            <div className="relative">
              <div className="surface-elevated p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <PenTool className="h-8 w-8 text-accent" strokeWidth={1.5} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Service pro
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  Pas de fichier HD ?
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                  Notre équipe peut vectoriser votre logo pour un rendu parfait. Service rapide et professionnel.
                </p>
                <Link to="/contact">
                  <Button variant="outline" className="font-semibold border-2">
                    Demander une vectorisation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Besoin de conseils ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Notre équipe vous accompagne dans le choix de la technique adaptée à votre projet. Échangeons ensemble !
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="font-semibold accent-gradient text-white shadow-lg">
                  Nous contacter
                </Button>
              </Link>
              <Link to="/faq">
                <Button size="lg" variant="outline" className="font-semibold border-2">
                  Consulter la FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
