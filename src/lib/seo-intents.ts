// SEO Intents basés sur les catégories réelles du catalogue
// Mapping intent slug → search query + display name

export interface SEOIntent {
  slug: string;
  name: string;
  searchTerm: string;
  pluralName: string;
  description: string;
}

// Intentions basées sur les sub_family_fr réelles de la base
export const seoIntents: SEOIntent[] = [
  { slug: 'polos-personnalises', name: 'Polo personnalisé', searchTerm: 'polo', pluralName: 'Polos personnalisés', description: 'polos brodés et personnalisés pour entreprises et clubs' },
  { slug: 't-shirts-personnalises', name: 'T-shirt personnalisé', searchTerm: 't-shirt', pluralName: 'T-shirts personnalisés', description: 't-shirts imprimés et brodés pour tous vos événements' },
  { slug: 'sweats-personnalises', name: 'Sweat personnalisé', searchTerm: 'sweat', pluralName: 'Sweats personnalisés', description: 'sweats à capuche et sans capuche personnalisés' },
  { slug: 'vestes-personnalisees', name: 'Veste personnalisée', searchTerm: 'veste', pluralName: 'Vestes personnalisées', description: 'vestes et blousons brodés pour professionnels' },
  { slug: 'vetements-travail', name: 'Vêtement de travail', searchTerm: 'travail', pluralName: 'Vêtements de travail', description: 'vêtements professionnels personnalisés' },
  { slug: 'casquettes-personnalisees', name: 'Casquette personnalisée', searchTerm: 'casquette', pluralName: 'Casquettes personnalisées', description: 'casquettes et chapeaux brodés' },
  { slug: 'tabliers-personnalises', name: 'Tablier personnalisé', searchTerm: 'tablier', pluralName: 'Tabliers personnalisés', description: 'tabliers brodés pour restauration et métiers de bouche' },
  { slug: 'chemises-personnalisees', name: 'Chemise personnalisée', searchTerm: 'chemise', pluralName: 'Chemises personnalisées', description: 'chemises corporate brodées' },
  { slug: 'gilets-personnalises', name: 'Gilet personnalisé', searchTerm: 'gilet', pluralName: 'Gilets personnalisés', description: 'gilets et bodywarmers personnalisés' },
  { slug: 'sacs-personnalises', name: 'Sac personnalisé', searchTerm: 'sac', pluralName: 'Sacs personnalisés', description: 'sacs et bagagerie personnalisés' },
  { slug: 'pantalons-personnalises', name: 'Pantalon personnalisé', searchTerm: 'pantalon', pluralName: 'Pantalons personnalisés', description: 'pantalons de travail et professionnels' },
  { slug: 'chaussures-securite', name: 'Chaussure de sécurité', searchTerm: 'chaussure', pluralName: 'Chaussures de sécurité', description: 'chaussures de sécurité professionnelles' },
  { slug: 'vetements-haute-visibilite', name: 'Vêtement haute visibilité', searchTerm: 'visibilité', pluralName: 'Vêtements haute visibilité', description: 'vêtements haute visibilité pour BTP et industrie' },
  { slug: 'bonnets-personnalises', name: 'Bonnet personnalisé', searchTerm: 'bonnet', pluralName: 'Bonnets personnalisés', description: 'bonnets brodés pour hiver' },
  { slug: 'parapluies-personnalises', name: 'Parapluie personnalisé', searchTerm: 'parapluie', pluralName: 'Parapluies personnalisés', description: 'parapluies personnalisés avec logo' },
];

export function getIntentBySlug(slug: string): SEOIntent | undefined {
  return seoIntents.find(i => i.slug === slug);
}

export function getIntentSearchTerm(slug: string): string {
  return getIntentBySlug(slug)?.searchTerm || slug.replace(/-/g, ' ');
}

// Major French cities for SEO - priority cities
export const majorCities = [
  { name: 'Lyon', slug: 'lyon', department: 'Rhône', departmentSlug: 'rhone', code: '69' },
  { name: 'Marseille', slug: 'marseille', department: 'Bouches-du-Rhône', departmentSlug: 'bouches-du-rhone', code: '13' },
  { name: 'Toulouse', slug: 'toulouse', department: 'Haute-Garonne', departmentSlug: 'haute-garonne', code: '31' },
  { name: 'Nice', slug: 'nice', department: 'Alpes-Maritimes', departmentSlug: 'alpes-maritimes', code: '06' },
  { name: 'Nantes', slug: 'nantes', department: 'Loire-Atlantique', departmentSlug: 'loire-atlantique', code: '44' },
  { name: 'Strasbourg', slug: 'strasbourg', department: 'Bas-Rhin', departmentSlug: 'bas-rhin', code: '67' },
  { name: 'Montpellier', slug: 'montpellier', department: 'Hérault', departmentSlug: 'herault', code: '34' },
  { name: 'Bordeaux', slug: 'bordeaux', department: 'Gironde', departmentSlug: 'gironde', code: '33' },
  { name: 'Lille', slug: 'lille', department: 'Nord', departmentSlug: 'nord', code: '59' },
  { name: 'Rennes', slug: 'rennes', department: 'Ille-et-Vilaine', departmentSlug: 'ille-et-vilaine', code: '35' },
  { name: 'Reims', slug: 'reims', department: 'Marne', departmentSlug: 'marne', code: '51' },
  { name: 'Paris', slug: 'paris', department: 'Paris', departmentSlug: 'paris', code: '75' },
  { name: 'Grenoble', slug: 'grenoble', department: 'Isère', departmentSlug: 'isere', code: '38' },
  { name: 'Dijon', slug: 'dijon', department: 'Côte-d\'Or', departmentSlug: 'cote-d-or', code: '21' },
  { name: 'Angers', slug: 'angers', department: 'Maine-et-Loire', departmentSlug: 'maine-et-loire', code: '49' },
  { name: 'Clermont-Ferrand', slug: 'clermont-ferrand', department: 'Puy-de-Dôme', departmentSlug: 'puy-de-dome', code: '63' },
  { name: 'Nancy', slug: 'nancy', department: 'Meurthe-et-Moselle', departmentSlug: 'meurthe-et-moselle', code: '54' },
  { name: 'Metz', slug: 'metz', department: 'Moselle', departmentSlug: 'moselle', code: '57' },
  { name: 'Épinal', slug: 'epinal', department: 'Vosges', departmentSlug: 'vosges', code: '88' },
  { name: 'Tours', slug: 'tours', department: 'Indre-et-Loire', departmentSlug: 'indre-et-loire', code: '37' },
  { name: 'Orléans', slug: 'orleans', department: 'Loiret', departmentSlug: 'loiret', code: '45' },
  { name: 'Rouen', slug: 'rouen', department: 'Seine-Maritime', departmentSlug: 'seine-maritime', code: '76' },
  { name: 'Caen', slug: 'caen', department: 'Calvados', departmentSlug: 'calvados', code: '14' },
  { name: 'Brest', slug: 'brest', department: 'Finistère', departmentSlug: 'finistere', code: '29' },
];

// Major departments for SEO
export const majorDepartments = [
  { name: 'Rhône', slug: 'rhone', code: '69' },
  { name: 'Bouches-du-Rhône', slug: 'bouches-du-rhone', code: '13' },
  { name: 'Nord', slug: 'nord', code: '59' },
  { name: 'Paris', slug: 'paris', code: '75' },
  { name: 'Gironde', slug: 'gironde', code: '33' },
  { name: 'Haute-Garonne', slug: 'haute-garonne', code: '31' },
  { name: 'Bas-Rhin', slug: 'bas-rhin', code: '67' },
  { name: 'Loire-Atlantique', slug: 'loire-atlantique', code: '44' },
  { name: 'Isère', slug: 'isere', code: '38' },
  { name: 'Vosges', slug: 'vosges', code: '88' },
  { name: 'Moselle', slug: 'moselle', code: '57' },
  { name: 'Meurthe-et-Moselle', slug: 'meurthe-et-moselle', code: '54' },
];
