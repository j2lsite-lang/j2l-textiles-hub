// Mock products for demo mode when TopTex API is unavailable

export interface MockProduct {
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  colors: { name: string; code: string }[];
  sizes: string[];
}

export const mockProducts: MockProduct[] = [
  {
    sku: "MOCK-TS001",
    name: "T-Shirt Premium Coton Bio",
    brand: "Stanley Stella",
    category: "T-shirts",
    description: "T-shirt 100% coton biologique, coupe moderne, idéal pour la personnalisation broderie ou sérigraphie.",
    price: 8.50,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
    colors: [
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Noir", code: "#000000" },
      { name: "Marine", code: "#1e3a5f" },
      { name: "Gris chiné", code: "#9ca3af" },
      { name: "Rouge", code: "#dc2626" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    sku: "MOCK-PL001",
    name: "Polo Performance Respirant",
    brand: "Kariban",
    category: "Polos",
    description: "Polo technique avec tissu respirant, parfait pour les équipes sportives et entreprises.",
    price: 14.90,
    images: ["https://images.unsplash.com/photo-1625910513413-5fc40e13632d?w=400"],
    colors: [
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Noir", code: "#000000" },
      { name: "Bleu royal", code: "#1d4ed8" },
      { name: "Vert", code: "#16a34a" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    sku: "MOCK-SW001",
    name: "Sweat à Capuche Classic",
    brand: "Fruit of the Loom",
    category: "Sweats",
    description: "Sweat à capuche confortable avec poche kangourou, idéal pour associations et clubs.",
    price: 18.50,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Gris foncé", code: "#374151" },
      { name: "Marine", code: "#1e3a5f" },
      { name: "Bordeaux", code: "#7f1d1d" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    sku: "MOCK-VT001",
    name: "Veste Softshell Pro",
    brand: "Result",
    category: "Vestes",
    description: "Veste softshell 3 couches, coupe-vent et déperlante. Parfaite pour le travail en extérieur.",
    price: 42.00,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Marine", code: "#1e3a5f" },
      { name: "Gris", code: "#6b7280" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    sku: "MOCK-WW001",
    name: "Pantalon de Travail Multipoches",
    brand: "Kariban",
    category: "Workwear",
    description: "Pantalon robuste avec multiples poches, genouillères renforcées. Idéal artisans et BTP.",
    price: 32.00,
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Gris", code: "#6b7280" },
      { name: "Beige", code: "#d4a574" },
    ],
    sizes: ["38", "40", "42", "44", "46", "48", "50", "52"],
  },
  {
    sku: "MOCK-CP001",
    name: "Casquette Baseball 6 Panneaux",
    brand: "Beechfield",
    category: "Accessoires",
    description: "Casquette classique avec fermeture ajustable, idéale pour broderie logo.",
    price: 4.50,
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Marine", code: "#1e3a5f" },
      { name: "Rouge", code: "#dc2626" },
      { name: "Vert", code: "#16a34a" },
    ],
    sizes: ["Taille unique"],
  },
  {
    sku: "MOCK-BG001",
    name: "Sac Shopping Coton",
    brand: "Westford Mill",
    category: "Sacs",
    description: "Tote bag en coton naturel, parfait pour événements et goodies écologiques.",
    price: 2.80,
    images: ["https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=400"],
    colors: [
      { name: "Naturel", code: "#f5f5dc" },
      { name: "Noir", code: "#000000" },
      { name: "Marine", code: "#1e3a5f" },
    ],
    sizes: ["Taille unique"],
  },
  {
    sku: "MOCK-TB001",
    name: "Tablier de Cuisine Pro",
    brand: "Premier",
    category: "Restauration",
    description: "Tablier professionnel avec poches, idéal pour restaurants et traiteurs.",
    price: 12.00,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Bordeaux", code: "#7f1d1d" },
      { name: "Vert bouteille", code: "#14532d" },
    ],
    sizes: ["Taille unique"],
  },
  {
    sku: "MOCK-HV001",
    name: "Gilet Haute Visibilité",
    brand: "Yoko",
    category: "Sécurité",
    description: "Gilet de sécurité classe 2, bandes réfléchissantes, conforme EN ISO 20471.",
    price: 6.50,
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
    colors: [
      { name: "Jaune fluo", code: "#facc15" },
      { name: "Orange fluo", code: "#f97316" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    sku: "MOCK-TS002",
    name: "T-Shirt Femme Ajusté",
    brand: "Gildan",
    category: "T-shirts",
    description: "T-shirt femme coupe cintrée, 100% coton ringspun, doux et confortable.",
    price: 5.90,
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400"],
    colors: [
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Noir", code: "#000000" },
      { name: "Rose", code: "#ec4899" },
      { name: "Turquoise", code: "#06b6d4" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    sku: "MOCK-FL001",
    name: "Polaire Zippée",
    brand: "Result",
    category: "Polaires",
    description: "Polaire légère avec zip complet, poches zippées, anti-boulochage.",
    price: 22.00,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"],
    colors: [
      { name: "Noir", code: "#000000" },
      { name: "Marine", code: "#1e3a5f" },
      { name: "Rouge", code: "#dc2626" },
      { name: "Gris", code: "#6b7280" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    sku: "MOCK-CH001",
    name: "Chemise Oxford Manches Longues",
    brand: "Russell Collection",
    category: "Chemises",
    description: "Chemise Oxford classique, col boutonné, idéale pour tenues corporate.",
    price: 24.00,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"],
    colors: [
      { name: "Blanc", code: "#FFFFFF" },
      { name: "Bleu ciel", code: "#7dd3fc" },
      { name: "Gris clair", code: "#d1d5db" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];

export const mockCategories = [
  "Tous",
  "T-shirts",
  "Polos",
  "Sweats",
  "Vestes",
  "Workwear",
  "Accessoires",
  "Sacs",
  "Restauration",
  "Sécurité",
  "Polaires",
  "Chemises",
];

export const mockBrands = [
  "Toutes",
  "Stanley Stella",
  "Kariban",
  "Fruit of the Loom",
  "Result",
  "Beechfield",
  "Westford Mill",
  "Premier",
  "Yoko",
  "Gildan",
  "Russell Collection",
];

export function getMockCatalog(filters: {
  query?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockProducts];

  // Filter by search query
  if (filters.query) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Filter by category
  if (filters.category && filters.category !== "Tous") {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  // Filter by brand
  if (filters.brand && filters.brand !== "Toutes") {
    filtered = filtered.filter((p) => p.brand === filters.brand);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    products: filtered.slice(start, end).map((p) => ({
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      price: p.price,
      images: p.images,
      colors: p.colors,
      sizes: p.sizes,
    })),
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
    isDemo: true,
  };
}

export function getMockProduct(sku: string) {
  const product = mockProducts.find((p) => p.sku === sku);
  if (!product) return null;
  return { ...product, isDemo: true };
}
