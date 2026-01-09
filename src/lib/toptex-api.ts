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
  page?: number;
  limit?: number;
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CatalogResponse> {
  const { query, category, brand, page = 1, limit = 24 } = filters;

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
      dbQuery = dbQuery.ilike('category', `%${category}%`);
    }
    if (brand && brand !== 'Toutes') {
      dbQuery = dbQuery.ilike('brand', `%${brand}%`);
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

export async function fetchAttributes(): Promise<{
  categories: string[];
  brands: string[];
  colors: Array<{ name: string; code: string }>;
  sizes: string[];
}> {
  try {
    // Use DISTINCT queries to avoid fetching all products (Supabase 1000 row limit)
    const [categoriesResult, brandsResult, colorsResult] = await Promise.all([
      supabase.from('products').select('category').not('category', 'is', null),
      supabase.from('products').select('brand').not('brand', 'is', null),
      supabase.from('products').select('colors').not('colors', 'is', null).limit(500),
    ]);

    // Extract unique categories
    const categoriesSet = new Set<string>();
    if (categoriesResult.data) {
      categoriesResult.data.forEach(p => {
        if (p.category) categoriesSet.add(p.category);
      });
    }
    const categories = Array.from(categoriesSet).sort();

    // Extract unique brands
    const brandsSet = new Set<string>();
    if (brandsResult.data) {
      brandsResult.data.forEach(p => {
        if (p.brand) brandsSet.add(p.brand);
      });
    }
    const brands = Array.from(brandsSet).sort();

    // Extract unique colors from sampled products
    const colorsMap = new Map<string, string>();
    if (colorsResult.data) {
      colorsResult.data.forEach(p => {
        if (p.colors && Array.isArray(p.colors)) {
          (p.colors as Array<{ name: string; code: string }>).forEach(c => {
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
      colors: colors.length > 0 ? colors : [
        { name: "Blanc", code: "#FFFFFF" },
        { name: "Noir", code: "#000000" },
        { name: "Marine", code: "#1e3a5f" },
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    };
  } catch (error) {
    console.warn('Error fetching attributes:', error);
    return {
      categories: mockCategories,
      brands: mockBrands,
      colors: [
        { name: "Blanc", code: "#FFFFFF" },
        { name: "Noir", code: "#000000" },
        { name: "Marine", code: "#1e3a5f" },
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
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
