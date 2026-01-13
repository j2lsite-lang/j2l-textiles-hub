// Contenu SEO pour les pages Univers (comme TopTex)
export interface UniversSEOContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  seoText: string;
  keywords: string[];
  relatedUnivers: string[];
}

export const universSEOContent: Record<string, UniversSEOContent> = {
  'workwear': {
    title: 'Vêtements de Travail Workwear',
    metaTitle: 'Vêtements Workwear Professionnels à Personnaliser | J2L Impression',
    metaDescription: 'Découvrez notre gamme workwear : vêtements de travail robustes et confortables. Pantalons, vestes, t-shirts professionnels personnalisables par broderie ou sérigraphie.',
    heroDescription: 'Équipez vos équipes avec des vêtements de travail alliant robustesse, confort et style. Notre sélection workwear répond aux exigences des professionnels les plus exigeants.',
    seoText: `<h2>Vêtements Workwear : Qualité Professionnelle pour Tous les Métiers</h2>
<p>Notre gamme <strong>workwear</strong> rassemble les meilleures marques de vêtements de travail professionnels. Conçus pour résister aux conditions les plus difficiles, nos textiles allient <strong>durabilité</strong>, <strong>confort</strong> et <strong>praticité</strong>.</p>

<h3>Une Large Sélection de Vêtements de Travail</h3>
<p>Découvrez notre catalogue complet de vêtements professionnels : <strong>pantalons de travail</strong> multi-poches, <strong>vestes</strong> résistantes, <strong>t-shirts</strong> techniques, <strong>polos</strong> d'entreprise et <strong>sweats</strong> chauds. Chaque pièce est sélectionnée pour sa qualité de fabrication et sa capacité à supporter un usage intensif.</p>

<h3>Personnalisation Professionnelle</h3>
<p>Renforcez l'identité de votre entreprise avec nos techniques de marquage adaptées aux vêtements de travail. La <strong>broderie</strong> offre une finition premium durable, tandis que la <strong>sérigraphie</strong> permet des visuels grands formats à coûts optimisés.</p>

<p>Marques disponibles : Kariban, Result, B&C, James & Nicholson, SOL'S. Tous nos produits répondent aux normes européennes de qualité.</p>`,
    keywords: ['vêtements de travail', 'workwear', 'pantalons professionnels', 'vestes de travail', 'tenues entreprise'],
    relatedUnivers: ['epi', 'industrie', 'chr'],
  },

  'sport': {
    title: 'Vêtements de Sport Personnalisables',
    metaTitle: 'Textiles Sport & Performance | Maillots, Shorts, Survêtements | J2L',
    metaDescription: 'Équipez vos équipes sportives avec nos vêtements techniques : maillots, shorts, survêtements personnalisés. Sublimation, flocage numéros et logos.',
    heroDescription: 'Textiles techniques pour sportifs et clubs. Équipez vos athlètes avec des vêtements performants aux couleurs de votre équipe.',
    seoText: `<h2>Textiles Sport : Performance et Style pour Vos Équipes</h2>
<p>Notre univers <strong>Sport</strong> propose une gamme complète de vêtements techniques conçus pour la performance. Des <strong>maillots respirants</strong> aux <strong>survêtements</strong> confortables, trouvez l'équipement idéal pour vos équipes.</p>

<h3>Vêtements Techniques pour Tous les Sports</h3>
<p>Que vous équipiez un <strong>club de football</strong>, une <strong>association sportive</strong> ou une <strong>équipe corporate</strong>, notre catalogue répond à tous vos besoins : <strong>maillots</strong> évacuant la transpiration, <strong>shorts</strong> légers, <strong>vestes</strong> coupe-vent, <strong>leggings</strong> confortables.</p>

<h3>Personnalisation Sportive</h3>
<p>Donnez vie à vos couleurs avec nos techniques de marquage spécialisées : <strong>sublimation</strong> pour des designs all-over, <strong>flocage</strong> pour noms et numéros, <strong>transfert</strong> pour logos détaillés. Chaque technique est optimisée pour résister aux lavages répétés.</p>

<p>Marques sport : Proact, Kariban Sport, Just Cool, SPIRO. Tissus techniques certifiés et éco-responsables.</p>`,
    keywords: ['vêtements sport', 'maillots personnalisés', 'équipement sportif', 'clubs', 'survêtements'],
    relatedUnivers: ['schoolwear', 'evenementiel', 'mode-retail'],
  },

  'chr': {
    title: 'Vêtements CHR - Hôtellerie Restauration',
    metaTitle: 'Vêtements Restauration & Hôtellerie | Tabliers, Vestes Chef | J2L',
    metaDescription: 'Équipez vos équipes CHR : vestes de cuisine, tabliers, pantalons restauration. Vêtements professionnels personnalisables pour hôtels et restaurants.',
    heroDescription: 'Solutions textiles pour les métiers de bouche et de l\'accueil. Qualité, hygiène et style pour vos équipes CHR.',
    seoText: `<h2>Vêtements CHR : Excellence pour l'Hôtellerie-Restauration</h2>
<p>L'univers <strong>CHR</strong> (Café, Hôtel, Restaurant) propose des vêtements conçus pour les exigences des métiers de bouche. Hygiène, confort et esthétique se conjuguent pour équiper vos équipes.</p>

<h3>Équipement Complet pour la Restauration</h3>
<p><strong>Vestes de cuisine</strong> respirantes, <strong>tabliers</strong> résistants, <strong>pantalons</strong> confortables, <strong>calots</strong> et <strong>toques</strong> : notre gamme couvre tous les postes de votre établissement. Du chef étoilé au personnel de salle, chaque métier trouve son équipement.</p>

<h3>Personnalisation Adaptée au Secteur</h3>
<p>Brodez le <strong>nom de votre restaurant</strong> sur les vestes de cuisine, personnalisez vos <strong>tabliers</strong> avec votre logo. Nos techniques résistent aux lavages intensifs et aux conditions de travail exigeantes du secteur CHR.</p>

<p>Marques spécialisées : Robur, Lafont, Manelli, Portwest. Tissus certifiés contact alimentaire et normés.</p>`,
    keywords: ['vêtements restauration', 'CHR', 'veste cuisine', 'tabliers brodés', 'hôtellerie'],
    relatedUnivers: ['workwear', 'accueil', 'sante-beaute'],
  },

  'epi': {
    title: 'Équipements de Protection Individuelle',
    metaTitle: 'EPI - Vêtements de Protection Personnalisables | J2L Impression',
    metaDescription: 'EPI normés et personnalisables : gilets haute visibilité, vêtements ignifugés, chaussures de sécurité. Protection et image de marque réunies.',
    heroDescription: 'Protégez vos équipes avec des EPI conformes aux normes européennes. Sécurité et personnalisation ne sont plus incompatibles.',
    seoText: `<h2>EPI : Protection et Personnalisation en Toute Sécurité</h2>
<p>Notre gamme <strong>EPI</strong> (Équipements de Protection Individuelle) allie sécurité et identité visuelle. Tous nos produits sont certifiés selon les normes européennes en vigueur.</p>

<h3>Une Large Gamme de Protections</h3>
<p><strong>Gilets haute visibilité</strong> EN ISO 20471, <strong>vêtements ignifugés</strong> EN 11612, <strong>chaussures de sécurité</strong> S1/S3, <strong>casques</strong> et <strong>lunettes</strong> de protection : équipez vos collaborateurs selon les risques de votre activité.</p>

<h3>Personnalisation Compatible Normes</h3>
<p>Nos experts vous conseillent sur les zones personnalisables sans altérer les propriétés de protection. <strong>Sérigraphie réfléchissante</strong>, <strong>transfert</strong> compatible haute température, <strong>broderie</strong> sur zones autorisées : valorisez votre marque en toute conformité.</p>

<p>Marques EPI : Portwest, Result Safe-Guard, Yoko, Korntex. Certifications CE et normes EN à jour.</p>`,
    keywords: ['EPI', 'équipements protection', 'haute visibilité', 'sécurité', 'normes EN'],
    relatedUnivers: ['industrie', 'workwear', 'logistique'],
  },

  'mode-retail': {
    title: 'Mode Retail & Tendance',
    metaTitle: 'Textiles Mode Retail Personnalisables | T-shirts Tendance | J2L',
    metaDescription: 'Textiles mode retail pour boutiques et marques : t-shirts tendance, sweats urbains, accessoires mode. Créez votre collection personnalisée.',
    heroDescription: 'Tendances actuelles et qualité premium pour vos collections retail. Des basiques intemporels aux pièces statement.',
    seoText: `<h2>Mode Retail : Textiles Tendance pour Vos Collections</h2>
<p>L'univers <strong>Mode Retail</strong> propose des textiles dans l'air du temps pour créer vos propres collections. Des <strong>basiques</strong> aux pièces <strong>fashion</strong>, trouvez les supports parfaits pour votre marque.</p>

<h3>Des Textiles Fashion pour Tous les Styles</h3>
<p><strong>T-shirts</strong> oversize, <strong>sweats</strong> à capuche streetwear, <strong>vestes</strong> bomber, <strong>accessoires</strong> tendance : notre sélection suit les tendances tout en garantissant une qualité durable. Cotons bio, coupes modernes, finitions soignées.</p>

<h3>Personnalisation Créative</h3>
<p>Libérez votre créativité avec nos techniques de marquage : <strong>DTG</strong> pour impressions photo-réalistes, <strong>sérigraphie</strong> effets spéciaux, <strong>broderie</strong> vintage. Créez des pièces uniques qui se démarquent.</p>

<p>Marques retail : Stanley/Stella, Continental, Mantis, Sol's. Collections éco-responsables et certifiées.</p>`,
    keywords: ['mode retail', 't-shirts tendance', 'sweats streetwear', 'collection personnalisée', 'fashion'],
    relatedUnivers: ['sport', 'evenementiel', 'schoolwear'],
  },

  'industrie': {
    title: 'Vêtements Industrie & BTP',
    metaTitle: 'Vêtements Industrie BTP Sécurité | Tenues de Travail | J2L',
    metaDescription: 'Équipez vos équipes industrie et BTP : vêtements résistants, EPI, tenues complètes. Robustesse et personnalisation pour tous les chantiers.',
    heroDescription: 'Solutions textiles robustes pour l\'industrie et le BTP. Résistance maximale pour les environnements les plus exigeants.',
    seoText: `<h2>Industrie & BTP : Robustesse pour les Métiers Exigeants</h2>
<p>L'univers <strong>Industrie Sécurité BTP</strong> rassemble des vêtements conçus pour les environnements de travail les plus difficiles. Résistance, durabilité et sécurité sont au cœur de notre sélection.</p>

<h3>Équipement Complet pour le Chantier</h3>
<p><strong>Pantalons</strong> multi-poches renforcés, <strong>vestes</strong> techniques imperméables, <strong>parkas</strong> grand froid, <strong>combinaisons</strong> de travail : chaque pièce est pensée pour les contraintes du terrain. Genouillères intégrées, poches outils, renforts Cordura.</p>

<h3>Personnalisation Durable</h3>
<p>Nos techniques de marquage résistent aux conditions industrielles : <strong>broderie</strong> haute densité, <strong>transfert</strong> renforcé, <strong>sérigraphie</strong> épaisse. Votre logo reste visible malgré l'usure quotidienne.</p>

<p>Marques industrie : Blaklader, Portwest, Dickies, Lafont. Tissus techniques et renforcés.</p>`,
    keywords: ['vêtements industrie', 'BTP', 'chantier', 'vêtements résistants', 'tenue de travail'],
    relatedUnivers: ['workwear', 'epi', 'logistique'],
  },

  'logistique': {
    title: 'Vêtements Distribution & Logistique',
    metaTitle: 'Vêtements Logistique Distribution | Tenues Entrepôt | J2L',
    metaDescription: 'Habillez vos équipes logistique et distribution : vêtements confortables et pratiques pour entrepôts, livreurs et préparateurs de commandes.',
    heroDescription: 'Textiles adaptés aux métiers de la logistique. Confort, praticité et visibilité pour vos équipes en mouvement.',
    seoText: `<h2>Distribution & Logistique : Équipez Vos Équipes Terrain</h2>
<p>L'univers <strong>Distribution Logistique</strong> propose des vêtements adaptés aux métiers du transport, de l'entreposage et de la livraison. Confort de mouvement et praticité guident notre sélection.</p>

<h3>Vêtements pour Tous les Postes</h3>
<p><strong>Polos</strong> respirants pour livreurs, <strong>vestes</strong> légères pour préparateurs, <strong>gilets</strong> haute visibilité pour caristes, <strong>parkas</strong> imperméables pour quais : équipez chaque poste selon ses besoins spécifiques.</p>

<h3>Identification Claire des Équipes</h3>
<p>Dans les environnements logistiques, l'identification rapide est essentielle. Personnalisez vos vêtements avec des <strong>logos visibles</strong>, des <strong>couleurs par service</strong> ou des <strong>noms brodés</strong> pour fluidifier l'organisation.</p>

<p>Marques logistique : Kariban, Result, Portwest, Regatta. Vêtements fonctionnels et résistants aux lavages.</p>`,
    keywords: ['logistique', 'distribution', 'entrepôt', 'livreur', 'transport'],
    relatedUnivers: ['workwear', 'industrie', 'jardinerie'],
  },

  'jardinerie': {
    title: 'Vêtements Jardinerie & Bricolage',
    metaTitle: 'Vêtements Jardinerie Bricolage | Tenues Espaces Verts | J2L',
    metaDescription: 'Équipez vos équipes jardinerie et bricolage : vêtements résistants et pratiques pour espaces verts, pépinières et magasins de bricolage.',
    heroDescription: 'Textiles adaptés aux métiers verts et du bricolage. Résistance aux conditions extérieures et praticité au quotidien.',
    seoText: `<h2>Jardinerie & Bricolage : Vêtements pour Métiers Verts</h2>
<p>L'univers <strong>Jardinerie Bricolage</strong> rassemble des vêtements conçus pour les métiers des espaces verts, de l'horticulture et du bricolage. Résistance à l'humidité, aux frottements et confort de travail sont essentiels.</p>

<h3>Équipement Complet pour l'Extérieur</h3>
<p><strong>Pantalons</strong> renforcés aux genoux, <strong>vestes</strong> imperméables respirantes, <strong>tabliers</strong> de jardinier, <strong>polos</strong> confortables : chaque pièce répond aux contraintes du travail en extérieur. Protection soleil, poches pratiques, matières résistantes.</p>

<h3>Personnalisation Visible en Magasin</h3>
<p>En jardinerie comme en GSB, l'identification du personnel améliore l'expérience client. <strong>Brodez</strong> votre logo et les prénoms pour une approche personnalisée et professionnelle.</p>

<p>Marques jardinage : Result, Regatta, Kariban, Portwest. Vêtements outdoor techniques et durables.</p>`,
    keywords: ['jardinerie', 'bricolage', 'espaces verts', 'pépinière', 'GSB'],
    relatedUnivers: ['workwear', 'logistique', 'industrie'],
  },

  'sante-beaute': {
    title: 'Vêtements Santé & Médical',
    metaTitle: 'Vêtements Médicaux Personnalisés | Blouses, Tuniques Santé | J2L',
    metaDescription: 'Équipez vos équipes médicales : blouses, tuniques, pantalons médicaux. Textiles hygiéniques personnalisables pour hôpitaux, cliniques et cabinets.',
    heroDescription: 'Solutions textiles pour le secteur santé. Hygiène, confort et professionnalisme pour vos équipes soignantes.',
    seoText: `<h2>Santé & Médical : Textiles pour Professionnels de Santé</h2>
<p>L'univers <strong>Santé Beauté Hygiène</strong> propose des vêtements adaptés aux exigences du secteur médical et paramédical. Hygiène irréprochable, confort longue durée et esthétique professionnelle.</p>

<h3>Gamme Complète pour le Secteur Santé</h3>
<p><strong>Blouses</strong> médicales, <strong>tuniques</strong> infirmières, <strong>pantalons</strong> confortables, <strong>sabots</strong> et <strong>chaussures</strong> professionnelles : équipez tous vos services. Tissus lavables à haute température, coupe ergonomique, coloris variés.</p>

<h3>Personnalisation Adaptée au Médical</h3>
<p>Identifiez vos équipes et services avec une <strong>broderie</strong> discrète : nom, fonction, service. Nos fils résistent aux lavages industriels et aux désinfections fréquentes.</p>

<p>Marques médical : Cherokee, Dickies Medical, Exner, Leiber. Textiles certifiés et antimicrobiens.</p>`,
    keywords: ['vêtements médicaux', 'blouses', 'tuniques santé', 'hôpital', 'paramédical'],
    relatedUnivers: ['chr', 'accueil', 'artisanat'],
  },

  'accueil': {
    title: 'Vêtements d\'Accueil & Réception',
    metaTitle: 'Vêtements Accueil Réception | Tenues Hôtesses | J2L Impression',
    metaDescription: 'Habillez vos équipes d\'accueil avec élégance : tenues hôtesses, vêtements réception, uniformes événementiels. Personnalisation broderie premium.',
    heroDescription: 'Élégance et professionnalisme pour vos équipes en contact client. Première impression réussie garantie.',
    seoText: `<h2>Accueil & Réception : L'Art de la Première Impression</h2>
<p>L'univers <strong>Accueil</strong> propose des vêtements élégants pour tous les métiers en contact avec la clientèle. Une tenue soignée projette professionnalisme et confiance dès le premier regard.</p>

<h3>Tenues pour Tous les Métiers d'Accueil</h3>
<p><strong>Chemisiers</strong> et <strong>chemises</strong> élégants, <strong>vestes</strong> structurées, <strong>jupes</strong> et <strong>pantalons</strong> assortis, <strong>écharpes</strong> et <strong>foulards</strong> : composez des tenues harmonieuses pour vos équipes. Hôtesses, réceptionnistes, concierges : chaque fonction trouve son style.</p>

<h3>Personnalisation Raffinée</h3>
<p>La <strong>broderie</strong> discrète sur le cœur ou le col apporte une touche d'élégance. Choisissez des <strong>coloris</strong> en harmonie avec votre charte graphique pour une identité visuelle cohérente.</p>

<p>Marques accueil : Premier, Brook Taverner, Henbury, Kustom Kit. Coupes élégantes et finitions haut de gamme.</p>`,
    keywords: ['vêtements accueil', 'tenues hôtesses', 'réception', 'uniformes', 'élégance'],
    relatedUnivers: ['chr', 'evenementiel', 'tourisme'],
  },

  'schoolwear': {
    title: 'Vêtements Scolaires Schoolwear',
    metaTitle: 'Vêtements Scolaires Personnalisés | Uniformes École | J2L',
    metaDescription: 'Uniformes scolaires et vêtements école personnalisés : polos, sweats, vestes aux couleurs de votre établissement. Qualité et durabilité.',
    heroDescription: 'Solutions textiles pour établissements scolaires. Uniformes durables et personnalisés pour créer une identité commune.',
    seoText: `<h2>Schoolwear : Uniformes Scolaires de Qualité</h2>
<p>L'univers <strong>Schoolwear</strong> propose des vêtements adaptés aux établissements scolaires. Des uniformes de qualité renforcent le sentiment d'appartenance et simplifient le quotidien des familles.</p>

<h3>Gamme Complète pour Écoles</h3>
<p><strong>Polos</strong> confortables, <strong>pulls</strong> chauds, <strong>sweats</strong> à capuche, <strong>vestes</strong> polaires : équipez vos élèves pour toutes les saisons. Tissus résistants aux lavages fréquents, coupes adaptées aux enfants et adolescents.</p>

<h3>Personnalisation Durable</h3>
<p>La <strong>broderie</strong> du logo de l'établissement garantit une identification pérenne. Ajoutez les prénoms des élèves pour éviter les échanges involontaires.</p>

<p>Marques schoolwear : Fruit of the Loom, Gildan, AWDis, B&C. Rapport qualité-prix optimisé pour les volumes.</p>`,
    keywords: ['uniformes scolaires', 'schoolwear', 'vêtements école', 'établissements', 'éducation'],
    relatedUnivers: ['sport', 'mode-retail', 'evenementiel'],
  },

  'evenementiel': {
    title: 'Vêtements Événementiels',
    metaTitle: 'Vêtements Événementiels Personnalisés | Textiles Promotion | J2L',
    metaDescription: 'Textiles promotionnels pour vos événements : t-shirts publicitaires, goodies, vêtements staff. Personnalisation express et grands volumes.',
    heroDescription: 'Équipez vos événements avec des textiles marquants. Visibilité maximale pour vos opérations promotionnelles.',
    seoText: `<h2>Événementiel : Textiles Impact pour Vos Opérations</h2>
<p>L'univers <strong>Promotion Événementiel</strong> propose des textiles conçus pour marquer les esprits lors de vos événements. Visibilité, originalité et volumes sont au rendez-vous.</p>

<h3>Supports Promotionnels Variés</h3>
<p><strong>T-shirts</strong> publicitaires, <strong>casquettes</strong> personnalisées, <strong>sacs</strong> shopping, <strong>vêtements staff</strong> : équipez participants et équipes. Prix optimisés pour les grands volumes, délais express disponibles.</p>

<h3>Personnalisation Impactante</h3>
<p>La <strong>sérigraphie</strong> reste la technique reine pour l'événementiel : coûts optimisés en volume, couleurs vives, solidité assurée. Pour les petites séries, le <strong>DTG</strong> offre une liberté créative totale.</p>

<p>Textiles événement : Fruit of the Loom, Gildan, Sol's, Neutral. Basiques économiques et éco-responsables.</p>`,
    keywords: ['événementiel', 'textiles promotionnels', 'publicité', 'goodies', 'opérations'],
    relatedUnivers: ['mode-retail', 'sport', 'schoolwear'],
  },

  'artisanat': {
    title: 'Vêtements Artisanat & Commerce',
    metaTitle: 'Vêtements Artisans Commerçants | Tabliers, Tenues Boutique | J2L',
    metaDescription: 'Équipez artisans et commerçants : tabliers, vêtements boutique, tenues métiers. Personnalisation pour boulangeries, boucheries, commerces.',
    heroDescription: 'Solutions textiles pour artisans et commerçants. Valorisez vos savoir-faire avec des tenues professionnelles sur-mesure.',
    seoText: `<h2>Artisanat & Commerce : Vêtements pour Métiers de Passion</h2>
<p>L'univers <strong>Artisanat Commerce</strong> propose des vêtements adaptés aux métiers de bouche, aux artisans et aux commerçants. Valorisez votre savoir-faire avec des tenues professionnelles à votre image.</p>

<h3>Équipement pour Chaque Métier</h3>
<p><strong>Tabliers</strong> de boucher, <strong>vestes</strong> de boulanger, <strong>polos</strong> de vendeur, <strong>gilets</strong> de caviste : chaque métier trouve son équipement adapté. Tissus résistants, coupes pratiques, entretien facile.</p>

<h3>Personnalisation Artisanale</h3>
<p>Brodez le <strong>nom de votre enseigne</strong>, votre <strong>logo</strong> ou un <strong>motif</strong> représentatif de votre métier. L'artisanat mérite une personnalisation soignée qui reflète la qualité de votre travail.</p>

<p>Marques artisanat : Lafont, Premier, Result, Kariban. Vêtements durables et professionnels.</p>`,
    keywords: ['artisanat', 'commerce', 'tabliers professionnels', 'boulangerie', 'boucherie'],
    relatedUnivers: ['chr', 'workwear', 'accueil'],
  },

  'tourisme': {
    title: 'Vêtements Tourisme & Culture',
    metaTitle: 'Vêtements Tourisme Culture | Tenues Guides, Musées | J2L',
    metaDescription: 'Équipez vos équipes tourisme et culture : tenues guides, vêtements musées, uniformes sites touristiques. Personnalisation élégante.',
    heroDescription: 'Textiles pour professionnels du tourisme et de la culture. Accueillez vos visiteurs avec style et professionnalisme.',
    seoText: `<h2>Tourisme & Culture : Vêtements pour l'Accueil des Visiteurs</h2>
<p>L'univers <strong>Tourisme Culture</strong> propose des vêtements adaptés aux sites touristiques, musées et offices de tourisme. Professionnalisme et convivialité pour accueillir vos visiteurs.</p>

<h3>Tenues pour Sites et Institutions</h3>
<p><strong>Polos</strong> confortables pour guides, <strong>vestes</strong> élégantes pour personnel d'accueil, <strong>parkas</strong> pour visites extérieures : équipez vos équipes pour toutes les situations. Identification claire pour orienter les visiteurs.</p>

<h3>Personnalisation Institutionnelle</h3>
<p>Brodez le <strong>logo de votre institution</strong>, le <strong>nom du site</strong> ou des <strong>pictogrammes</strong> d'orientation. Une signalétique textile cohérente améliore l'expérience visiteur.</p>

<p>Marques tourisme : Kariban, Result, Henbury, Regatta. Vêtements polyvalents et représentatifs.</p>`,
    keywords: ['tourisme', 'culture', 'musées', 'sites touristiques', 'guides'],
    relatedUnivers: ['accueil', 'evenementiel', 'merchandising'],
  },
};

// Helper pour obtenir le contenu SEO d'un univers
export const getUniversSEO = (worldSlug: string): UniversSEOContent | null => {
  return universSEOContent[worldSlug] || null;
};

// Helper pour obtenir tous les slugs d'univers
export const getAllUniversSlugs = (): string[] => {
  return Object.keys(universSEOContent);
};
