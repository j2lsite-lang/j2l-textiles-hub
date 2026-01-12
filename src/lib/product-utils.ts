/**
 * Génère un slug SEO-friendly à partir du SKU et du nom du produit
 * Exemple: "K623", "Polo Homme Kariban" -> "k623-polo-homme-kariban"
 */
export function generateProductSlug(sku: string, name?: string): string {
  const skuLower = sku.toLowerCase();
  
  if (!name) return skuLower;
  
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '')    // Garder uniquement lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-')            // Remplacer espaces par tirets
    .replace(/-+/g, '-')             // Éviter les tirets multiples
    .slice(0, 60);                   // Limiter la longueur
  
  return `${skuLower}-${nameSlug}`;
}

/**
 * Extrait le SKU d'un slug de produit
 * Le SKU est toujours la première partie avant le premier tiret (ou le slug entier)
 * Exemple: "k623-polo-homme" -> "K623"
 */
export function extractSkuFromSlug(slug: string): string {
  // Le SKU peut contenir des chiffres et des lettres, mais pas de tirets dans la plupart des cas
  // Pattern: commence par lettres optionnelles + chiffres + lettres optionnelles
  const match = slug.match(/^([a-zA-Z]*\d+[a-zA-Z]*)/i);
  if (match) {
    return match[1].toUpperCase();
  }
  
  // Fallback: prendre la première partie avant le tiret
  const firstPart = slug.split('-')[0];
  return firstPart.toUpperCase();
}

/**
 * Génère l'URL complète d'un produit
 */
export function getProductUrl(sku: string, name?: string): string {
  return `/produit/${generateProductSlug(sku, name)}`;
}
