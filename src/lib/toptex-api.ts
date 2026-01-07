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
  if (sku.startsWith('MOCK-') || useDemoMode) {
    const product = getMockProduct(sku);
    if (product) {
      return product as Product;
    }
  }

  try {
    const response = await supabase.functions.invoke('toptex-api', {
      body: { action: 'product', sku },
    });

    if (response.error || response.data?.error) {
      console.warn('TopTex API unavailable for product');
      const demoProduct = getMockProduct(sku);
      if (demoProduct) return demoProduct as Product;
      throw new Error('Produit non trouvé');
    }

    return response.data as Product;
  } catch (error) {
    console.warn('TopTex API error for product:', error);
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
  // If demo mode, return mock attributes
  if (useDemoMode) {
    return {
      categories: mockCategories,
      brands: mockBrands,
      colors: [
        { name: "Blanc", code: "#FFFFFF" },
        { name: "Noir", code: "#000000" },
        { name: "Marine", code: "#1e3a5f" },
        { name: "Gris", code: "#6b7280" },
        { name: "Rouge", code: "#dc2626" },
        { name: "Bleu", code: "#1d4ed8" },
        { name: "Vert", code: "#16a34a" },
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    };
  }

  try {
    const response = await supabase.functions.invoke('toptex-api', {
      body: { action: 'attributes' },
    });

    if (response.error || response.data?.error) {
      useDemoMode = true;
      return fetchAttributes(); // Recursive call will use demo mode
    }

    return response.data;
  } catch (error) {
    console.warn('TopTex API error for attributes:', error);
    useDemoMode = true;
    return fetchAttributes();
  }
}
