import { supabase } from '@/integrations/supabase/client';
import { getMockCatalog, getMockProduct, mockCategories, mockBrands } from './mock-products';

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  composition?: string;
  weight?: string;
  images: string[];
  colors: Array<{ name: string; code: string }>;
  sizes: string[];
  variants?: Array<{
    sku: string;
    color: string;
    size: string;
    stock?: number;
    price?: number;
  }>;
  priceHT?: number | null;
  price?: number;
  stock?: number | null;
  isDemo?: boolean;
}

export interface CatalogResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isDemo?: boolean;
  pending?: boolean;
  eta?: string;
  message?: string;
}

export interface CatalogFilters {
  query?: string;
  category?: string;
  brand?: string;
  family?: string;
  subfamily?: string;
  page?: number;
  limit?: number;
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CatalogResponse> {
  const { query, category, brand, family, subfamily, page = 1, limit = 24 } = filters;

  try {
    // First, try to fetch from local database (synced products)
    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`);
    }
    if (category && category !== 'Tous') {
      // Check if it's a smart sub-category (based on product name)
      const smartCategories: Record<string, string[]> = {
        'T-shirts': ['t-shirt', 'tee-shirt', 'tee shirt', 't shirt'],
        'Polos': ['polo'],
        'Sweats': ['sweat', 'hoodie', 'capuche'],
        'Vestes': ['veste', 'jacket', 'softshell', 'parka', 'blouson', 'doudoune', 'manteau'],
        'Chemises': ['chemise', 'blouse', 'shirt'],
        'Pantalons': ['pantalon', 'jean', 'jogging', 'short', 'bermuda'],
        'Casquettes': ['casquette', 'cap', 'bonnet', 'chapeau', 'bob', 'bandana'],
        'Sacs': ['sac', 'bag', 'backpack', 'cabas', 'besace', 'pochette', 'trousse'],
        'Serviettes': ['serviette', 'towel', 'drap', 'peignoir'],
        'Tabliers': ['tablier', 'apron'],
        'Gilets': ['gilet', 'bodywarmer', 'débardeur'],
        'Accessoires': ['parapluie', 'cravate', 'foulard', 'écharpe', 'gant', 'ceinture'],
      };
      
      const keywords = smartCategories[category];
      if (keywords) {
        // Search in product name for any of the keywords
        const orConditions = keywords.map(k => `name.ilike.%${k}%`).join(',');
        dbQuery = dbQuery.or(orConditions);
      } else {
        // Standard category filter
        dbQuery = dbQuery.ilike('category', `%${category}%`);
      }
    }
    if (brand && brand !== 'Toutes') {
      dbQuery = dbQuery.ilike('brand', `%${brand}%`);
    }
    // Family filter
    if (family) {
      dbQuery = dbQuery.ilike('category', `%${family}%`);
    }
    // Subfamily filter
    if (subfamily) {
      dbQuery = dbQuery.ilike('category', `%${subfamily}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dbQuery = dbQuery.range(from, to).order('name');

    const { data: products, count, error } = await dbQuery;

    if (error) {
      console.warn('Database query failed:', error);
      return getDemoCatalog(filters);
    }

    // If we have products in the database, use them
    if (products && products.length > 0) {
      const total = count || products.length;
      return {
        products: products.map(p => ({
          sku: p.sku,
          name: p.name,
          brand: p.brand || '',
          category: p.category || '',
          description: p.description || '',
          composition: p.composition || '',
          weight: p.weight || '',
          images: (p.images as string[]) || [],
          colors: (p.colors as Array<{ name: string; code: string }>) || [],
          sizes: (p.sizes as string[]) || [],
          variants: (p.variants as any[]) || [],
          priceHT: p.price_ht ? Number(p.price_ht) : null,
          stock: p.stock,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        isDemo: false,
      };
    }

    // No products in DB, use demo mode
    console.info('No products in database, using demo mode');
    return getDemoCatalog(filters);

  } catch (error) {
    console.warn('Error fetching catalog:', error);
    return getDemoCatalog(filters);
  }
}

function getDemoCatalog(filters: CatalogFilters): CatalogResponse {
  const result = getMockCatalog({
    query: filters.query,
    category: filters.category,
    brand: filters.brand,
    page: filters.page || 1,
    limit: filters.limit || 24,
  });

  return {
    products: result.products as Product[],
    pagination: {
      page: result.page,
      limit: filters.limit || 24,
      total: result.total,
      totalPages: result.totalPages,
    },
    isDemo: true,
  };
}

export async function fetchProduct(sku: string): Promise<Product> {
  // Check if it's a demo product
  if (sku.startsWith('MOCK-')) {
    const product = getMockProduct(sku);
    if (product) {
      return product as Product;
    }
  }

  try {
    // First try to get from database
    const { data: dbProduct, error: dbError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (dbProduct && !dbError) {
      return {
        sku: dbProduct.sku,
        name: dbProduct.name,
        brand: dbProduct.brand || '',
        category: dbProduct.category || '',
        description: dbProduct.description || '',
        composition: dbProduct.composition || '',
        weight: dbProduct.weight || '',
        images: (dbProduct.images as string[]) || [],
        colors: (dbProduct.colors as Array<{ name: string; code: string }>) || [],
        sizes: (dbProduct.sizes as string[]) || [],
        variants: (dbProduct.variants as any[]) || [],
        priceHT: dbProduct.price_ht ? Number(dbProduct.price_ht) : null,
        stock: dbProduct.stock,
      };
    }

    // Fallback to mock product
    const demoProduct = getMockProduct(sku);
    if (demoProduct) return demoProduct as Product;
    throw new Error('Produit non trouvé');
  } catch (error) {
    console.warn('Error fetching product:', error);
    const demoProduct = getMockProduct(sku);
    if (demoProduct) return demoProduct as Product;
    throw new Error('Produit non trouvé');
  }
}

// Sous-catégories intelligentes basées sur le nom du produit
const productTypeKeywords: Record<string, string[]> = {
  'T-shirts': ['t-shirt', 'tee-shirt', 'tee shirt', 't shirt'],
  'Polos': ['polo'],
  'Sweats': ['sweat', 'hoodie', 'capuche'],
  'Vestes': ['veste', 'jacket', 'softshell', 'parka', 'blouson', 'doudoune', 'manteau'],
  'Chemises': ['chemise', 'blouse', 'shirt'],
  'Pantalons': ['pantalon', 'jean', 'jogging', 'short', 'bermuda'],
  'Casquettes': ['casquette', 'cap', 'bonnet', 'chapeau', 'bob', 'bandana'],
  'Sacs': ['sac', 'bag', 'backpack', 'cabas', 'besace', 'pochette', 'trousse'],
  'Serviettes': ['serviette', 'towel', 'drap', 'peignoir'],
  'Tabliers': ['tablier', 'apron'],
  'Gilets': ['gilet', 'bodywarmer', 'débardeur'],
  'Accessoires': ['parapluie', 'cravate', 'foulard', 'écharpe', 'gant', 'ceinture'],
};

function detectProductType(productName: string): string | null {
  const nameLower = productName.toLowerCase();
  for (const [category, keywords] of Object.entries(productTypeKeywords)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return category;
      }
    }
  }
  return null;
}

type ProductColumn = 'brand' | 'category';

async function fetchUniqueColumnValues(column: ProductColumn, batchSize = 1000): Promise<string[]> {
  const values = new Set<string>();
  let from = 0;
  const MAX_ROWS = 50_000; // garde-fou

  while (from < MAX_ROWS) {
    const to = from + batchSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select(column)
      .not(column, 'is', null)
      .range(from, to);

    if (error) throw error;

    const rows = (data as any[]) || [];
    if (rows.length === 0) break;

    for (const row of rows) {
      const v = row?.[column];
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (trimmed) values.add(trimmed);
      }
    }

    if (rows.length < batchSize) break;
    from += batchSize;
  }

  return Array.from(values);
}

export async function fetchAttributes(): Promise<{
  categories: string[];
  brands: string[];
  colors: Array<{ name: string; code: string }>;
  sizes: string[];
}> {
  try {
    // 1) Compute smart category counts in DB (no 1000-row limit issue)
    const preferredOrder = [
      'T-shirts',
      'Polos',
      'Sweats',
      'Vestes',
      'Chemises',
      'Pantalons',
      'Gilets',
      'Sacs',
      'Casquettes',
      'Accessoires',
      'Serviettes',
      'Tabliers',
    ];

    const smartCounts = await Promise.all(
      Object.entries(productTypeKeywords).map(async ([smartCat, keywords]) => {
        const orConditions = keywords.map((k) => `name.ilike.%${k}%`).join(',');
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .or(orConditions);
        return [smartCat, count ?? 0] as const;
      })
    );

    const orderedSubCategories = smartCounts
      .filter(([_, count]) => count >= 5)
      .sort((a, b) => {
        const ia = preferredOrder.indexOf(a[0]);
        const ib = preferredOrder.indexOf(b[0]);
        const pa = ia === -1 ? 999 : ia;
        const pb = ib === -1 ? 999 : ib;
        if (pa !== pb) return pa - pb;
        return b[1] - a[1];
      })
      .map(([name]) => name);

    // 2) Get remaining "main" categories (TopTex hierarchy: often 'Vêtements')
    // IMPORTANT: on pagine pour éviter la limite implicite de 1000 lignes.
    const allCategories = await fetchUniqueColumnValues('category');

    const remainingCategories = allCategories
      .filter((cat) => !['Vêtements', 'Produits'].includes(cat))
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    const categories = [
      ...orderedSubCategories,
      ...remainingCategories.filter((c) => !orderedSubCategories.includes(c)),
    ];

    // 3) Brands (paginées) + sampled colors
    const [allBrands, colorsResult] = await Promise.all([
      fetchUniqueColumnValues('brand'),
      supabase.from('products').select('colors').not('colors', 'is', null).limit(500),
    ]);

    const brands = allBrands.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    const colorsMap = new Map<string, string>();
    if (colorsResult.data) {
      colorsResult.data.forEach((p) => {
        if (p.colors && Array.isArray(p.colors)) {
          (p.colors as Array<{ name: string; code: string }>).forEach((c) => {
            if (c.name && !colorsMap.has(c.name)) {
              colorsMap.set(c.name, c.code || '');
            }
          });
        }
      });
    }
    const colors = Array.from(colorsMap.entries()).map(([name, code]) => ({ name, code }));

    return {
      categories: categories.length > 0 ? categories : mockCategories,
      brands: brands.length > 0 ? brands : mockBrands,
      colors:
        colors.length > 0
          ? colors
          : [
              { name: 'Blanc', code: '#FFFFFF' },
              { name: 'Noir', code: '#000000' },
              { name: 'Marine', code: '#1e3a5f' },
            ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    };
  } catch (error) {
    console.warn('Error fetching attributes:', error);
    return {
      categories: mockCategories,
      brands: mockBrands,
      colors: [
        { name: 'Blanc', code: '#FFFFFF' },
        { name: 'Noir', code: '#000000' },
        { name: 'Marine', code: '#1e3a5f' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    };
  }
}

// Function to trigger manual sync
export async function triggerCatalogSync(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await supabase.functions.invoke('sync-catalog', {
      body: {},
    });

    if (response.error) {
      return { success: false, message: response.error.message };
    }

    return { 
      success: response.data?.success || false, 
      message: response.data?.success 
        ? `${response.data.products_synced} produits synchronisés` 
        : response.data?.error || 'Erreur inconnue'
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erreur de synchronisation' 
    };
  }
}

// Get sync status
export async function getSyncStatus(): Promise<{
  lastSync: string | null;
  status: string;
  productsCount: number;
}> {
  try {
    const { data } = await supabase
      .from('sync_status')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    return {
      lastSync: data?.completed_at || data?.started_at || null,
      status: data?.status || 'never',
      productsCount: data?.products_count || 0,
    };
  } catch {
    return {
      lastSync: null,
      status: 'never',
      productsCount: 0,
    };
  }
}
