import { useQuery } from '@tanstack/react-query';
import { fetchCatalog, fetchProduct, fetchAttributes, CatalogFilters, Product, CatalogResponse } from '@/lib/toptex-api';

export function useCatalog(filters: CatalogFilters = {}) {
  return useQuery<CatalogResponse>({
    queryKey: ['catalog', filters],
    queryFn: () => fetchCatalog(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useProduct(sku: string | undefined) {
  return useQuery<Product>({
    queryKey: ['product', sku],
    queryFn: () => fetchProduct(sku!),
    enabled: !!sku,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

export function useAttributes() {
  return useQuery({
    queryKey: ['attributes'],
    queryFn: fetchAttributes,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}
