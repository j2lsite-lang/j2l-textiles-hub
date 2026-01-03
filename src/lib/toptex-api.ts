import { supabase } from '@/integrations/supabase/client';

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  composition: string;
  weight: string;
  images: string[];
  colors: Array<{ name: string; code: string }>;
  sizes: string[];
  variants: Array<{
    sku: string;
    color: string;
    size: string;
    stock?: number;
    price?: number;
  }>;
  priceHT: number | null;
  stock: number | null;
}

export interface CatalogResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CatalogFilters {
  query?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CatalogResponse> {
  // Invoke via POST (invoke doesn't support query params directly)
  const response = await supabase.functions.invoke('toptex-api', {
    body: { ...filters, action: 'catalog' },
  });

  if (response.error) {
    console.error('Error fetching catalog:', response.error);
    throw new Error(response.error.message || 'Erreur lors du chargement du catalogue');
  }

  return response.data as CatalogResponse;
}

export async function fetchProduct(sku: string): Promise<Product> {
  const response = await supabase.functions.invoke('toptex-api', {
    body: { action: 'product', sku },
  });

  if (response.error) {
    console.error('Error fetching product:', response.error);
    throw new Error(response.error.message || 'Erreur lors du chargement du produit');
  }

  return response.data as Product;
}

export async function fetchAttributes(): Promise<{
  categories: string[];
  brands: string[];
  colors: Array<{ name: string; code: string }>;
  sizes: string[];
}> {
  const response = await supabase.functions.invoke('toptex-api', {
    body: { action: 'attributes' },
  });

  if (response.error) {
    console.error('Error fetching attributes:', response.error);
    throw new Error(response.error.message || 'Erreur lors du chargement des attributs');
  }

  return response.data;
}
