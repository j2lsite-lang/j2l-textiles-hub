import { Link } from 'react-router-dom';
import { ArrowRight, Upload, FileCode, Image, Maximize, Sparkles, PenTool } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FileFormatBadge } from '@/components/ui/premium-icon';

// Import technique images
import broderieImg from '@/assets/techniques/broderie.jpg';
import impressionImg from '@/assets/techniques/impression-dtg.jpg';
import serigraphieImg from '@/assets/techniques/serigraphie.jpg';
import flocageImg from '@/assets/techniques/flocage.jpg';

const techniques = [
  {
    image: broderieImg,
    name: 'La broderie',
    description: `Cette technique est réputée pour son aspect haut de gamme et sa qualité exceptionnelle. Aujourd'hui, cette méthode artisanale est modernisée grâce à des machines à broder de pointe qui permettent de personnaliser une multitude de textiles.`,
    details: `Chaque point de broderie apporte un relief qui donne une texture et une profondeur aux motifs créant des designs à la fois captivants et agréables au toucher. Idéale pour apporter une touche d'élégance et de sophistication, la broderie est un choix incontournable pour les polos, vestes et casquettes.`,
  },
  {
    image: impressionImg,
    name: 'Marquage numérique',
    description: `Idéale pour les petites séries et les visuels complexes, le marquage numérique sur textile permet à votre visuel d'être imprimé sans aucune aspérité et avec un maximum de détails.`,
    details: `Nous maîtrisons deux techniques de marquage numérique : l'Impression DTG (Direct to Garment) et le Transfert DTF (Direct to Film). L'impression DTG permet l'impression directe de visuels en quadrichromie sur une variété de vêtements avec une liberté de création quasi illimitée.`,
  },
  {
    image: serigraphieImg,
    name: 'Sérigraphie',
    description: `Technique d'impression par transfert d'encre à travers un écran. C'est la méthode la plus économique pour les grandes quantités et les designs avec peu de couleurs.`,
    details: `Les encres sérigraphiques offrent une excellente tenue au lavage et des couleurs très vives. Idéale pour les commandes importantes de t-shirts, sweats et sacs publicitaires. Minimum recommandé : 20 pièces.`,
  },
  {
    image: flocageImg,
    name: 'Flocage & Flex',
    description: `Découpe de matière thermocollée appliquée par presse à chaud. Cette technique offre un rendu mat ou brillant au choix, parfait pour les noms et numéros.`,
    details: `Le flocage offre un aspect velours très apprécié pour le textile sportif. Le flex permet des finitions brillantes ou mates. Ces techniques sont idéales pour les équipes sportives et les personnalisations individuelles.`,
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
    description: "Qualité optimale, redimensionnable sans perte. C'est le format idéal.",
    extensions: ['AI', 'EPS', 'PDF', 'SVG'],
    recommended: true,
  },
  {
    icon: Image,
    title: 'Images haute résolution',
    description: "Minimum 300 DPI à la taille d'impression finale.",
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
      <section className="py-16 md:py-20 bg-background">
        <div className="container-page text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            <span className="bg-accent text-white px-3 py-1">Des techniques</span> de marquage textile
            <br />pour vos personnalisations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
            Découvrez nos méthodes de personnalisation professionnelles pour donner vie à votre identité visuelle.
          </p>
        </div>
      </section>

      {/* Techniques */}
      <section className="section-padding">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {techniques.map((technique, index) => (
              <div
                key={technique.name}
                className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border/50 hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={technique.image} 
                    alt={technique.name}
                    className="w-full h-full object-cover"
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                    {technique.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {technique.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {technique.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* File Guidelines */}
      <section className="section-padding bg-secondary/30">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">
                Préparer votre logo
              </h2>
              <p className="text-muted-foreground mb-8">
                Pour une personnalisation réussie, envoyez-nous votre logo dans un format adapté.
              </p>

              {/* Format badges */}
              <div className="mb-8">
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
              <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-border/50">
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

      {/* Internal Links - SEO Maillage */}
      <section className="py-10 bg-muted/30">
        <div className="container-page">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-lg">Nous intervenons dans tout le Grand Est</h3>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <Link to="/zones/vosges" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Vosges
              </Link>
              <Link to="/zones/meurthe-et-moselle" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Meurthe-et-Moselle
              </Link>
              <Link to="/zones/moselle" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Moselle
              </Link>
              <Link to="/zones/bas-rhin" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Bas-Rhin
              </Link>
              <Link to="/zones/haut-rhin" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Haut-Rhin
              </Link>
              <Link to="/zones/marne" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Marne
              </Link>
              <Link to="/zones/aube" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Aube
              </Link>
              <Link to="/zones/ardennes" className="px-3 py-1.5 rounded-full bg-background border hover:bg-primary/10 hover:border-primary transition-colors">
                Ardennes
              </Link>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              <Link to="/zones" className="text-primary hover:underline">Voir toutes nos zones d'intervention</Link>
              {' • '}
              <Link to="/catalogue" className="text-primary hover:underline">Parcourir le catalogue</Link>
              {' • '}
              <Link to="/devis" className="text-primary hover:underline">Demander un devis</Link>
            </p>
            <p className="text-xs text-muted-foreground pt-4">
              Pour l'enseigne et la signalétique, découvrez notre partenaire{' '}
              <a 
                href="https://j2lpublicite.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                J2L Publicité
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
