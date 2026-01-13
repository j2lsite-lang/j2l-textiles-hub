import { Link, useParams } from 'react-router-dom';
import { frenchDepartments } from '@/lib/french-locations';

interface PageSEOFooterProps {
  variant?: 'catalogue' | 'personnalisation' | 'contact' | 'devis' | 'faq' | 'product' | 'livraison' | 'retours' | 'cgv' | 'mentions' | 'confidentialite' | 'panier' | 'checkout' | 'zones' | 'zone-department' | 'zone-city' | 'default';
  productName?: string;
  productBrand?: string;
  departmentName?: string;
  cityName?: string;
}

// Données pour varier les textes selon les contextes
const TEXTILE_TYPES = [
  { name: 't-shirts', label: 'T-shirts personnalisés', path: '/catalogue/t-shirts' },
  { name: 'polos', label: 'Polos brodés', path: '/catalogue/polos' },
  { name: 'sweats', label: 'Sweats et hoodies', path: '/catalogue/sweats' },
  { name: 'vestes', label: 'Vestes et softshells', path: '/catalogue/vestes' },
];

const TECHNIQUES = [
  { name: 'broderie', label: 'Broderie haute qualité' },
  { name: 'serigraphie', label: 'Sérigraphie grand volume' },
  { name: 'dtg', label: 'Impression numérique DTG' },
  { name: 'flocage', label: 'Flocage flex et vinyle' },
];

const CLIENT_TYPES = [
  'entreprises',
  'associations',
  'clubs sportifs',
  'collectivités',
  'événements',
  'commerces',
];

export function PageSEOFooter({ 
  variant = 'default', 
  productName,
  productBrand,
  departmentName,
  cityName,
}: PageSEOFooterProps) {
  const params = useParams();

  // Récupérer les infos de département depuis l'URL si pas fourni
  const getDepartmentFromUrl = () => {
    const deptSlug = params.department;
    if (deptSlug) {
      return frenchDepartments.find(d => d.slug === deptSlug);
    }
    return null;
  };

  const department = getDepartmentFromUrl();
  const deptName = departmentName || department?.name;
  const deptCode = department?.code;

  // Générer des variations de texte basées sur un hash simple
  const getVariation = (seed: string, options: string[]): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return options[Math.abs(hash) % options.length];
  };

  const renderCatalogueContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Plus de 3 000 textiles professionnels à personnaliser
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Parcourez notre <strong className="text-foreground">catalogue textile B2B</strong> regroupant 
        les meilleures marques européennes. Du <Link to="/catalogue?category=T-shirts" className="text-primary hover:underline">t-shirt promotionnel</Link> au{' '}
        <Link to="/catalogue?category=Vestes" className="text-primary hover:underline">softshell technique</Link>, 
        chaque produit est sélectionné pour sa qualité, sa durabilité et son aptitude au marquage.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Filtrez par catégorie, marque ou budget
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Utilisez nos filtres pour trouver rapidement le textile adapté : {' '}
        <Link to="/catalogue?category=Polos" className="text-primary hover:underline">polos d'accueil</Link>, {' '}
        <Link to="/catalogue?category=Sweats" className="text-primary hover:underline">hoodies associatifs</Link>, {' '}
        <Link to="/catalogue?category=Vêtements+de+travail" className="text-primary hover:underline">vêtements de travail normés</Link>. 
        Nos conseillers sont disponibles pour vous orienter vers les références les plus adaptées à votre secteur d'activité.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Marques disponibles : Stanley/Stella, Kariban, Fruit of the Loom, Gildan, B&C, Result, Proact. 
        Tous certifiés <strong className="text-foreground">OEKO-TEX Standard 100</strong>.
      </p>
    </>
  );

  const renderPersonnalisationContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        4 techniques de marquage pour sublimer votre identité
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Chaque projet mérite la technique de <strong className="text-foreground">personnalisation textile</strong> appropriée. 
        La <strong>broderie</strong> apporte prestige et longévité aux polos et vestes corporate. 
        La <strong>sérigraphie</strong> offre des tarifs imbattables pour les grandes séries de t-shirts événementiels.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Impression numérique et flocage : la liberté créative
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        L'<strong>impression DTG</strong> (Direct to Garment) reproduit vos visuels en quadrichromie 
        avec des dégradés parfaits, idéal pour les designs complexes ou les petites quantités. 
        Le <strong>flocage flex</strong> garantit des couleurs vives et une excellente tenue au lavage, 
        privilégié pour les maillots sportifs et les numéros de joueur.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        <Link to="/devis" className="text-primary hover:underline">Demandez un devis personnalisé</Link> : 
        nous analysons votre logo et vous recommandons la technique optimale selon le support, 
        la quantité et votre budget.
      </p>
    </>
  );

  const renderContactContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Une équipe réactive basée dans les Vosges
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Depuis <strong className="text-foreground">Vagney (88120)</strong>, nous accompagnons 
        les professionnels de toute la France dans leurs projets textiles. Notre connaissance 
        du terrain vosgien nous permet des interventions rapides sur le Grand Est : 
        <Link to="/zones/vosges" className="text-primary hover:underline mx-1">Épinal</Link>, 
        <Link to="/zones/meurthe-et-moselle" className="text-primary hover:underline mx-1">Nancy</Link>, 
        <Link to="/zones/moselle" className="text-primary hover:underline mx-1">Metz</Link>, 
        <Link to="/zones/bas-rhin" className="text-primary hover:underline mx-1">Strasbourg</Link>.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Conseil gratuit et accompagnement projet
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Vous hésitez entre plusieurs techniques de marquage ? Vous ne savez pas quelle grammage choisir ? 
        Contactez-nous par téléphone ou email : nous vous guidons vers la solution la plus adaptée 
        à votre activité, que vous soyez une PME, une association ou une collectivité.
      </p>
    </>
  );

  const renderDevisContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Votre devis textile en moins de 24 heures
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Remplissez notre formulaire avec vos besoins : quantités, coloris souhaités, zones de marquage. 
        Notre équipe établit un <strong className="text-foreground">chiffrage détaillé</strong> incluant 
        les textiles, la personnalisation et la livraison. Les prix sont dégressifs : 
        plus vous commandez, plus le coût unitaire diminue.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Pas de minimum de commande pour la broderie
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Contrairement à de nombreux fournisseurs, nous acceptons les <strong>commandes dès 1 pièce</strong> en broderie. 
        Pour la sérigraphie, un minimum de 20 exemplaires permet d'amortir les coûts de calage. 
        L'impression DTG est disponible sans minimum.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Besoin d'un BAT (Bon à Tirer) ? Nous vous envoyons une simulation visuelle 
        avant production pour validation. <Link to="/faq" className="text-primary hover:underline">Consultez notre FAQ</Link> pour 
        plus de détails sur notre processus de commande.
      </p>
    </>
  );

  const renderFAQContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Réponses à vos questions sur le textile personnalisé
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Délais de fabrication, formats de fichiers acceptés, entretien des textiles marqués : 
        cette FAQ regroupe les interrogations les plus courantes de nos clients professionnels. 
        Si vous ne trouvez pas votre réponse, notre équipe reste joignable par{' '}
        <Link to="/contact" className="text-primary hover:underline">téléphone et email</Link>.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Quelle technique choisir selon mon projet ?
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        <strong>Broderie</strong> : logo corporate sur polo, veste → rendu premium, durabilité maximale. 
        <strong className="ml-2">Sérigraphie</strong> : t-shirts événementiels en grande quantité → coût optimisé. 
        <strong className="ml-2">DTG</strong> : visuel photo-réaliste → qualité d'impression, petites séries. 
        <strong className="ml-2">Flocage</strong> : maillots sportifs → couleurs vives, personnalisation par nom/numéro.
      </p>
    </>
  );

  const renderProductContent = () => {
    const name = productName || 'ce textile';
    const brand = productBrand || 'notre catalogue';
    
    return (
      <>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Personnalisez {name} avec votre identité visuelle
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Ce produit {brand !== 'notre catalogue' ? `de la marque ${brand}` : ''} est disponible 
          pour toutes nos techniques de <Link to="/personnalisation" className="text-primary hover:underline">marquage</Link> : 
          broderie, sérigraphie, DTG, flocage. Selon la matière et votre projet, 
          nous vous conseillerons la solution la plus adaptée.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <Link to="/devis" className="text-primary hover:underline">Obtenez un devis</Link> en 
          ajoutant vos quantités et en nous envoyant votre logo. Réponse sous 24h ouvrées.
        </p>
      </>
    );
  };

  const renderLivraisonContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Livraison textile professionnelle sur toute la France
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Nous expédions vos commandes depuis notre atelier des <strong className="text-foreground">Vosges</strong>. 
        Délais standards : 5 à 10 jours ouvrés après validation du BAT. Des options express 
        sont disponibles pour les projets urgents. La livraison est offerte à partir de 500€ HT.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Suivi de commande et points relais
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Chaque expédition est trackée. Vous recevez un numéro de suivi par email dès l'envoi. 
        Livraison possible en entreprise, point relais, ou sur site événementiel. 
        <Link to="/contact" className="text-primary hover:underline ml-1">Contactez-nous</Link> pour 
        discuter de contraintes logistiques particulières.
      </p>
    </>
  );

  const renderRetoursContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Politique de retour et échange textile
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Les textiles <strong className="text-foreground">non personnalisés</strong> peuvent être retournés 
        sous 14 jours dans leur emballage d'origine. Les articles marqués (brodés, imprimés) 
        sont fabriqués sur mesure et ne peuvent être repris sauf défaut de production.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Garantie qualité sur le marquage
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Nous garantissons la qualité de nos marquages : en cas de broderie décousue, 
        d'impression qui s'efface anormalement ou de défaut visible, nous procédons 
        au remplacement ou au remboursement. <Link to="/cgv" className="text-primary hover:underline">Voir nos CGV</Link>.
      </p>
    </>
  );

  const renderCGVContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Conditions commerciales pour les professionnels
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Ces conditions générales de vente encadrent toutes les transactions B2B 
        avec <Link to="/" className="text-primary hover:underline">J2L Textiles</Link>. 
        Elles détaillent les modalités de commande, paiement, livraison et garantie 
        applicables aux textiles personnalisés.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Pour toute question sur nos CGV, <Link to="/contact" className="text-primary hover:underline">contactez notre service client</Link>.
      </p>
    </>
  );

  const renderMentionsContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Informations légales J2L Textiles
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Cette page regroupe les mentions légales obligatoires : éditeur du site, 
        hébergement, propriété intellectuelle. Pour les questions de protection des données, 
        consultez notre <Link to="/confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
      </p>
    </>
  );

  const renderConfidentialiteContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Protection de vos données personnelles
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Nous collectons uniquement les données nécessaires au traitement de vos commandes 
        et demandes de devis. Vos informations ne sont jamais vendues à des tiers. 
        Vous disposez d'un droit d'accès, de rectification et de suppression.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Pour exercer vos droits : <Link to="/contact" className="text-primary hover:underline">contactez-nous</Link>.
      </p>
    </>
  );

  const renderPanierContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Finalisez votre sélection textile
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Votre panier vous permet de regrouper les références qui vous intéressent. 
        Pour les textiles personnalisés, <Link to="/devis" className="text-primary hover:underline">demandez un devis</Link> : 
        nous calculerons le tarif exact incluant le marquage selon vos quantités.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Besoin de conseil ? <Link to="/contact" className="text-primary hover:underline">Notre équipe</Link> est 
        disponible pour vous aider dans votre sélection.
      </p>
    </>
  );

  const renderCheckoutContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Paiement sécurisé par carte bancaire
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Vos transactions sont protégées par le protocole SSL et traitées par Stripe, 
        leader mondial du paiement en ligne. Vos coordonnées bancaires ne sont jamais 
        stockées sur nos serveurs.
      </p>
    </>
  );

  const renderZonesListContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        Fournisseur textile pour tous les départements français
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Depuis notre atelier des Vosges, nous livrons <strong className="text-foreground">partout en France métropolitaine</strong> : 
        entreprises, associations, clubs sportifs, collectivités. Que vous soyez à 
        <Link to="/zones/paris" className="text-primary hover:underline mx-1">Paris</Link>, 
        <Link to="/zones/rhone" className="text-primary hover:underline mx-1">Lyon</Link>, 
        <Link to="/zones/bouches-du-rhone" className="text-primary hover:underline mx-1">Marseille</Link> ou 
        <Link to="/zones/haute-garonne" className="text-primary hover:underline mx-1">Toulouse</Link>, 
        nous assurons la livraison de vos textiles personnalisés.
      </p>
      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
        Proximité et réactivité dans le Grand Est
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Notre implantation à Vagney (88) nous permet une réactivité particulière 
        sur les <Link to="/zones/vosges" className="text-primary hover:underline">Vosges</Link>, 
        l'<Link to="/zones/meurthe-et-moselle" className="text-primary hover:underline">Alsace</Link>, 
        la <Link to="/zones/moselle" className="text-primary hover:underline">Lorraine</Link>. 
        Rencontres possibles sur site pour les projets importants.
      </p>
    </>
  );

  const renderZoneDepartmentContent = () => {
    if (!deptName) return renderDefaultContent();
    
    // Varier le contenu selon le département
    const intro = getVariation(deptName, [
      `Vous recherchez un fournisseur de textiles personnalisés dans le ${deptName} ? J2L Textiles accompagne les professionnels de votre département depuis plus de 10 ans.`,
      `Professionnels du ${deptName}, optez pour un partenaire textile de confiance. Nous livrons vêtements brodés et imprimés sur tout le département.`,
      `Basée dans les Vosges, notre équipe intervient régulièrement dans le ${deptName} pour équiper entreprises, associations et clubs sportifs.`,
    ]);

    const technique = getVariation(deptName + 'tech', [
      `broderie premium`,
      `sérigraphie grands volumes`,
      `impression numérique haute définition`,
    ]);

    const clients = getVariation(deptName + 'clients', [
      `PME, artisans et commerçants`,
      `associations, clubs sportifs et événements`,
      `collectivités, écoles et mairies`,
    ]);

    // Obtenir les villes du département pour créer des liens internes
    const deptData = frenchDepartments.find(d => d.name === deptName);
    const cities = deptData?.cities?.slice(0, 4) || [];

    return (
      <>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">
          Textiles personnalisés pour les professionnels du {deptName} {deptCode ? `(${deptCode})` : ''}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {intro}
        </p>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
          Notre expertise : {technique}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nous proposons toutes les techniques de <Link to="/personnalisation" className="text-primary hover:underline">marquage textile</Link> : 
          broderie, sérigraphie, impression DTG, flocage. Nos {clients} du {deptName} nous 
          font confiance pour leurs <Link to="/catalogue" className="text-primary hover:underline">vêtements d'entreprise</Link>, 
          tenues sportives et textiles événementiels.
        </p>
        {cities.length > 0 && (
          <p className="text-muted-foreground leading-relaxed">
            Nous intervenons notamment à{' '}
            {cities.map((city, index) => (
              <span key={city.slug}>
                <Link 
                  to={`/zones/${deptData?.slug}/${city.slug}`} 
                  className="text-primary hover:underline"
                >
                  {city.name}
                </Link>
                {index < cities.length - 2 ? ', ' : index === cities.length - 2 ? ' et ' : ''}
              </span>
            ))}
            . <Link to="/devis" className="text-primary hover:underline">Demandez votre devis gratuit</Link>.
          </p>
        )}
      </>
    );
  };

  const renderZoneCityContent = () => {
    const city = cityName || 'votre ville';
    const dept = deptName || 'votre département';
    
    const intro = getVariation(city + dept, [
      `Professionnels à ${city} et environs, simplifiez l'équipement textile de vos équipes avec J2L Textiles. Devis gratuit, livraison sur site.`,
      `Votre fournisseur de vêtements personnalisés dessert ${city} (${dept}). T-shirts, polos, vestes : tout est brodable ou imprimable.`,
      `À ${city}, faites confiance à J2L Textiles pour vos textiles marqués. Plus de 3 000 références, 4 techniques de personnalisation.`,
    ]);

    const useCase = getVariation(city + 'use', [
      `Idéal pour les entreprises de ${city} souhaitant uniformiser leurs équipes avec des vêtements brodés au nom de la société.`,
      `Associations et clubs sportifs de ${city} : équipez vos membres avec des tenues personnalisées aux couleurs de votre structure.`,
      `Commerçants et artisans à ${city} : démarquez-vous avec des polos et t-shirts imprimés de votre logo et slogan.`,
    ]);

    return (
      <>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">
          Vêtements personnalisés à {city} ({dept})
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {intro}
        </p>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
          Solutions textiles adaptées à votre activité
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {useCase}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Découvrez notre <Link to="/catalogue" className="text-primary hover:underline">catalogue complet</Link> ou{' '}
          <Link to="/contact" className="text-primary hover:underline">contactez-nous</Link> pour 
          un conseil personnalisé. Livraison gratuite à {city} à partir de 500€ HT.
        </p>
      </>
    );
  };

  const renderDefaultContent = () => (
    <>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">
        J2L Textiles : l'expertise textile depuis les Vosges
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Spécialiste de la fourniture et <Link to="/personnalisation" className="text-primary hover:underline">personnalisation de textiles</Link> pour 
        les professionnels, J2L Textiles propose un <Link to="/catalogue" className="text-primary hover:underline">catalogue de 3 000+ références</Link> : 
        t-shirts, polos, sweats, vestes, accessoires. Broderie, sérigraphie, DTG, flocage : 
        nous maîtrisons toutes les techniques de marquage.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        <Link to="/devis" className="text-primary hover:underline">Demandez un devis gratuit</Link> ou{' '}
        <Link to="/contact" className="text-primary hover:underline">contactez notre équipe</Link> pour 
        discuter de votre projet textile.
      </p>
    </>
  );

  const contentMap: Record<string, () => JSX.Element> = {
    catalogue: renderCatalogueContent,
    personnalisation: renderPersonnalisationContent,
    contact: renderContactContent,
    devis: renderDevisContent,
    faq: renderFAQContent,
    product: renderProductContent,
    livraison: renderLivraisonContent,
    retours: renderRetoursContent,
    cgv: renderCGVContent,
    mentions: renderMentionsContent,
    confidentialite: renderConfidentialiteContent,
    panier: renderPanierContent,
    checkout: renderCheckoutContent,
    zones: renderZonesListContent,
    'zone-department': renderZoneDepartmentContent,
    'zone-city': renderZoneCityContent,
    default: renderDefaultContent,
  };

  // Sélectionner les liens de zone à afficher selon la page actuelle
  const getZoneLinks = () => {
    // Si on est sur une page de département, afficher d'autres départements de la même région
    if (variant === 'zone-department' && department) {
      const sameDepts = frenchDepartments.filter(d => d.region === department.region && d.slug !== department.slug).slice(0, 3);
      return [
        ...sameDepts.map(d => ({ path: `/zones/${d.slug}`, label: `${d.name} (${d.code})` })),
        { path: '/zones', label: 'Tous les départements →' },
      ];
    }
    
    // Défaut : départements principaux
    return [
      { path: '/zones/vosges', label: 'Vosges (88)' },
      { path: '/zones/meurthe-et-moselle', label: 'Meurthe-et-Moselle (54)' },
      { path: '/zones/moselle', label: 'Moselle (57)' },
      { path: '/zones', label: 'Toutes les zones →' },
    ];
  };

  return (
    <section className="py-12 bg-muted/30 border-t border-border/50">
      <div className="container-page">
        <div className="max-w-4xl mx-auto">
          {/* SEO Content - Unique per variant */}
          <div className="prose prose-sm max-w-none mb-8">
            {(contentMap[variant] || contentMap.default)()}
          </div>

          {/* Internal Links Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Catalogue</h4>
              <ul className="space-y-1 text-sm">
                {TEXTILE_TYPES.map(t => (
                  <li key={t.name}>
                    <Link to={t.path} className="text-muted-foreground hover:text-primary transition-colors">
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Personnalisation</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">Techniques de marquage</Link></li>
                {TECHNIQUES.slice(0, 3).map(t => (
                  <li key={t.name}>
                    <Link to="/personnalisation" className="text-muted-foreground hover:text-primary transition-colors">
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Zones d'intervention</h4>
              <ul className="space-y-1 text-sm">
                {getZoneLinks().map(z => (
                  <li key={z.path}>
                    <Link to={z.path} className="text-muted-foreground hover:text-primary transition-colors">
                      {z.label}
                    </Link>
                  </li>
                ))}
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
