import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface PageSEOFooterProps {
  variant?: 'catalogue' | 'personnalisation' | 'contact' | 'devis' | 'faq' | 'product' | 'default';
}

export function PageSEOFooter({ variant = 'default' }: PageSEOFooterProps) {
  const renderCatalogueContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Catalogue textile professionnel pour entreprises et associations
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Notre <strong className="text-foreground">catalogue textile</strong> regroupe plus de <strong className="text-foreground">3 000 références</strong> de 
        vêtements professionnels personnalisables. Que vous cherchiez des{' '}
        <Link to="/catalogue/t-shirts" className="text-primary hover:underline">t-shirts publicitaires</Link>,{' '}
        <Link to="/catalogue/polos" className="text-primary hover:underline">polos corporate</Link>,{' '}
        <Link to="/catalogue/sweats" className="text-primary hover:underline">sweats personnalisés</Link> ou des{' '}
        <Link to="/catalogue/vestes" className="text-primary hover:underline">vestes de travail</Link>, 
        nous avons la solution adaptée à votre projet.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Des marques de qualité pour vos textiles personnalisés
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Nous travaillons exclusivement avec des marques reconnues :{' '}
        <a href="https://www.stanley-stella.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Stanley/Stella <ExternalLink className="h-3 w-3 inline" />
        </a>,{' '}
        <a href="https://www.fruitoftheloom.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Fruit of the Loom <ExternalLink className="h-3 w-3 inline" />
        </a>,{' '}
        <a href="https://www.gildan.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Gildan <ExternalLink className="h-3 w-3 inline" />
        </a>,{' '}
        <a href="https://www.kariban.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Kariban <ExternalLink className="h-3 w-3 inline" />
        </a>,{' '}
        <a href="https://www.jamesandnicholson.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          James & Nicholson <ExternalLink className="h-3 w-3 inline" />
        </a>. 
        Tous nos textiles sont certifiés{' '}
        <a href="https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          OEKO-TEX Standard 100 <ExternalLink className="h-3 w-3 inline" />
        </a>.
      </p>
    </>
  );

  const renderPersonnalisationContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Personnalisation textile professionnelle en France
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Expert en <strong className="text-foreground">marquage textile</strong> depuis plus de 10 ans, 
        <Link to="/" className="text-primary hover:underline mx-1">J2L Textiles</Link> 
        propose des techniques de <Link to="/personnalisation" className="text-primary hover:underline">personnalisation</Link> adaptées 
        à tous les projets : broderie haut de gamme, sérigraphie grand volume, impression DTG, flocage sportif.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Pourquoi choisir la broderie pour vos vêtements professionnels ?
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        La <strong className="text-foreground">broderie</strong> est la technique de marquage la plus durable et élégante. 
        Idéale pour les <Link to="/catalogue/polos" className="text-primary hover:underline">polos d'entreprise</Link>, 
        les <Link to="/catalogue/vestes" className="text-primary hover:underline">vestes corporate</Link> et les casquettes, 
        elle offre un rendu premium qui résiste à des centaines de lavages.
      </p>
    </>
  );

  const renderContactContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Contactez votre fournisseur textile dans les Vosges
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Basée à <strong className="text-foreground">Vagney dans les Vosges (88)</strong>, notre équipe 
        accompagne les entreprises, associations et collectivités de toute la France. Nous intervenons 
        principalement dans le Grand Est :{' '}
        <Link to="/zones/vosges" className="text-primary hover:underline">Vosges</Link>,{' '}
        <Link to="/zones/meurthe-et-moselle" className="text-primary hover:underline">Meurthe-et-Moselle</Link>,{' '}
        <Link to="/zones/moselle" className="text-primary hover:underline">Moselle</Link>,{' '}
        <Link to="/zones/bas-rhin" className="text-primary hover:underline">Bas-Rhin</Link>,{' '}
        <Link to="/zones/haut-rhin" className="text-primary hover:underline">Haut-Rhin</Link>.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Un conseil personnalisé pour votre projet textile
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Vous avez un projet de <Link to="/catalogue/t-shirts" className="text-primary hover:underline">t-shirts personnalisés</Link> ou de{' '}
        <Link to="/catalogue/vetements-travail" className="text-primary hover:underline">vêtements de travail</Link> ? 
        Notre équipe vous conseille sur le choix des textiles, les{' '}
        <Link to="/personnalisation" className="text-primary hover:underline">techniques de marquage</Link> et 
        les quantités adaptées à votre budget.
      </p>
    </>
  );

  const renderDevisContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Devis gratuit pour vos vêtements personnalisés
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Obtenez un <strong className="text-foreground">devis gratuit sous 24h</strong> pour votre commande de 
        textiles personnalisés. Que ce soit pour des{' '}
        <Link to="/catalogue/t-shirts" className="text-primary hover:underline">t-shirts d'équipe</Link>, des{' '}
        <Link to="/catalogue/polos" className="text-primary hover:underline">polos brodés</Link>, ou des{' '}
        <Link to="/catalogue/vetements-travail" className="text-primary hover:underline">tenues de travail complètes</Link>, 
        notre équipe établit une offre sur mesure.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Tarifs dégressifs selon les quantités
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Plus vous commandez, plus le <strong className="text-foreground">prix unitaire diminue</strong>. 
        La <Link to="/personnalisation" className="text-primary hover:underline">personnalisation par broderie</Link> est 
        disponible dès 1 pièce, la <Link to="/personnalisation" className="text-primary hover:underline">sérigraphie</Link> à partir de 20 pièces.
        <Link to="/faq" className="text-primary hover:underline ml-1">Consultez notre FAQ</Link> pour plus d'informations.
      </p>
    </>
  );

  const renderFAQContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Tout savoir sur la personnalisation textile
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Vous avez des questions sur les <Link to="/personnalisation" className="text-primary hover:underline">techniques de marquage</Link>, 
        les délais de livraison ou les formats de fichiers ? Notre FAQ répond aux interrogations les plus fréquentes 
        sur la <strong className="text-foreground">personnalisation de vêtements professionnels</strong>.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Des experts à votre écoute
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Si vous ne trouvez pas la réponse à votre question,{' '}
        <Link to="/contact" className="text-primary hover:underline">contactez notre équipe</Link>. 
        Nous vous accompagnons dans le choix de vos{' '}
        <Link to="/catalogue" className="text-primary hover:underline">textiles</Link> et de la technique adaptée.
        <Link to="/devis" className="text-primary hover:underline ml-1">Demandez un devis gratuit</Link>.
      </p>
    </>
  );

  const renderProductContent = () => (
    <>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Personnalisez ce produit avec votre logo
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Ce textile est disponible pour la <Link to="/personnalisation" className="text-primary hover:underline">personnalisation</Link> : 
        broderie, sérigraphie, impression DTG, flocage. 
        <Link to="/devis" className="text-primary hover:underline ml-1">Demandez un devis gratuit</Link> pour connaître 
        les tarifs adaptés à votre quantité.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Découvrez également notre <Link to="/catalogue" className="text-primary hover:underline">catalogue complet</Link> :{' '}
        <Link to="/catalogue/t-shirts" className="text-primary hover:underline">t-shirts</Link>,{' '}
        <Link to="/catalogue/polos" className="text-primary hover:underline">polos</Link>,{' '}
        <Link to="/catalogue/sweats" className="text-primary hover:underline">sweats</Link>,{' '}
        <Link to="/catalogue/vestes" className="text-primary hover:underline">vestes</Link>.
      </p>
    </>
  );

  const renderDefaultContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        J2L Textiles - Votre partenaire textile professionnel
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        <Link to="/" className="text-primary hover:underline">J2L Textiles</Link> est spécialisé dans la fourniture 
        et la <Link to="/personnalisation" className="text-primary hover:underline">personnalisation de textiles</Link> pour 
        les professionnels. Découvrez notre{' '}
        <Link to="/catalogue" className="text-primary hover:underline">catalogue de plus de 3 000 références</Link>.
      </p>
    </>
  );

  const contentMap = {
    catalogue: renderCatalogueContent,
    personnalisation: renderPersonnalisationContent,
    contact: renderContactContent,
    devis: renderDevisContent,
    faq: renderFAQContent,
    product: renderProductContent,
    default: renderDefaultContent,
  };

  return (
    <section className="py-12 bg-muted/30 border-t border-border/50">
      <div className="container-page">
        <div className="max-w-4xl mx-auto">
          {/* SEO Content */}
          <div className="prose prose-sm max-w-none mb-8">
            {contentMap[variant]()}
          </div>

          {/* Internal Links Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Catalogue</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/catalogue/t-shirts" className="text-muted-foreground hover:text-primary transition-colors">T-shirts personnalisés</Link></li>
                <li><Link to="/catalogue/polos" className="text-muted-foreground hover:text-primary transition-colors">Polos brodés</Link></li>
                <li><Link to="/catalogue/sweats" className="text-muted-foreground hover:text-primary transition-colors">Sweats et hoodies</Link></li>
                <li><Link to="/catalogue/vestes" className="text-muted-foreground hover:text-primary transition-colors">Vestes et softshells</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Personnalisation</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">Techniques de marquage</Link></li>
                <li><Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">Broderie textile</Link></li>
                <li><Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">Sérigraphie</Link></li>
                <li><Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">Impression DTG</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Zones d'intervention</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/zones/vosges" className="text-muted-foreground hover:text-primary transition-colors">Vosges (88)</Link></li>
                <li><Link to="/zones/meurthe-et-moselle" className="text-muted-foreground hover:text-primary transition-colors">Meurthe-et-Moselle</Link></li>
                <li><Link to="/zones/moselle" className="text-muted-foreground hover:text-primary transition-colors">Moselle</Link></li>
                <li><Link to="/zones" className="text-muted-foreground hover:text-primary transition-colors">Toutes les zones →</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Services</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/devis" className="text-muted-foreground hover:text-primary transition-colors">Demander un devis</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Nous contacter</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/livraison" className="text-muted-foreground hover:text-primary transition-colors">Livraison</Link></li>
              </ul>
            </div>
          </div>

          {/* External Links */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Marques partenaires :{' '}
              <a href="https://www.stanley-stella.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Stanley/Stella</a> •{' '}
              <a href="https://www.fruitoftheloom.eu" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Fruit of the Loom</a> •{' '}
              <a href="https://www.gildan.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Gildan</a> •{' '}
              <a href="https://www.kariban.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Kariban</a> •{' '}
              <a href="https://www.result-clothing.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Result</a> •{' '}
              Certifications :{' '}
              <a href="https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100" target="_blank" rel="noopener noreferrer" className="hover:text-primary">OEKO-TEX</a> •{' '}
              <a href="https://global-standard.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GOTS</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
