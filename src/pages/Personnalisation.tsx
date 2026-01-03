import { Link } from 'react-router-dom';
import { Printer, Palette, PenTool, FileText, CheckCircle, ArrowRight, Upload, FileImage } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const techniques = [
  {
    icon: Printer,
    name: 'Sérigraphie',
    description: 'Technique d\'impression par transfert d\'encre à travers un écran de soie. Idéale pour les grandes quantités et les designs avec peu de couleurs.',
    pros: ['Économique en grandes quantités', 'Couleurs vives et durables', 'Excellent rendu sur coton'],
    cons: ['Minimum 20 pièces', 'Limité en nombre de couleurs', 'Pas de dégradés'],
    ideal: 'T-shirts, sweats, sacs en grandes séries',
  },
  {
    icon: Palette,
    name: 'Impression numérique',
    description: 'Impression directe sur textile (DTG) permettant des designs photo-réalistes avec des millions de couleurs.',
    pros: ['Détails et dégradés parfaits', 'Idéal petites quantités', 'Photos et designs complexes'],
    cons: ['Coût plus élevé', 'Moins durable au lavage', 'Meilleur sur textile clair'],
    ideal: 'Designs détaillés, photos, petites séries',
  },
  {
    icon: PenTool,
    name: 'Broderie',
    description: 'Personnalisation haut de gamme par fil brodé. Aspect premium et durabilité exceptionnelle.',
    pros: ['Aspect professionnel', 'Très durable', 'Relief et texture'],
    cons: ['Coût par pièce plus élevé', 'Designs simplifiés', 'Pas de dégradés'],
    ideal: 'Polos, vestes, casquettes, uniformes',
  },
  {
    icon: FileText,
    name: 'Flocage & Flex',
    description: 'Découpe de matière thermocollée et appliquée par presse à chaud. Rendu mat ou brillant au choix.',
    pros: ['Noms et numéros faciles', 'Durable', 'Finition mate ou brillante'],
    cons: ['Limité aux aplats', 'Pas de détails fins', 'Toucher "plastique"'],
    ideal: 'Équipes sportives, noms personnalisés',
  },
];

const fileGuidelines = [
  {
    format: 'Vectoriel (recommandé)',
    extensions: '.AI, .EPS, .PDF, .SVG',
    description: 'Qualité optimale, redimensionnable sans perte',
  },
  {
    format: 'Haute résolution',
    extensions: '.PNG, .JPG, .TIFF',
    description: 'Minimum 300 DPI à la taille d\'impression',
  },
  {
    format: 'Taille minimale',
    extensions: 'Logo',
    description: '1000 x 1000 pixels minimum',
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
                <Button size="lg" variant="outline" className="font-semibold border-white/30 text-white hover:bg-white/10">
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
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <technique.icon className="h-7 w-7 text-primary" />
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
                        <CheckCircle className="h-4 w-4" />
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

      {/* File Guidelines */}
      <section className="section-padding bg-secondary/30">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                eyebrow="Fichiers"
                title="Préparer votre logo"
                description="Pour une personnalisation réussie, envoyez-nous votre logo dans un format adapté."
                align="left"
              />

              <div className="mt-8 space-y-4">
                {fileGuidelines.map((guide) => (
                  <div key={guide.format} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border">
                    <FileImage className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="font-semibold">{guide.format}</h4>
                        <span className="text-xs text-muted-foreground font-mono">{guide.extensions}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/devis">
                  <Button className="group">
                    <Upload className="h-4 w-4 mr-2" />
                    Envoyer mon logo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Palette className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">
                    Pas de fichier HD ?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Notre équipe peut vectoriser votre logo moyennant un supplément. Contactez-nous pour en savoir plus.
                  </p>
                </div>
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
                <Button size="lg" className="font-semibold">
                  Nous contacter
                </Button>
              </Link>
              <Link to="/faq">
                <Button size="lg" variant="outline" className="font-semibold">
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
