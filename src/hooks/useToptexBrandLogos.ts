import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function normalizeBrandKey(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[®™]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
}

type BrandLogoItem = { name: string; logoUrl: string };

export function useToptexBrandLogos() {
  return useQuery<Record<string, string>>({
    queryKey: ['toptex-brand-logos'],
    staleTime: 6 * 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('toptex-brands', {
        body: {},
      });
      if (error) throw error;

      const items = (data?.brands || []) as BrandLogoItem[];

      // Build a lookup that works with TopTex names *and* normalized keys
      const map: Record<string, string> = {};
      for (const it of items) {
        if (!it?.name || !it?.logoUrl) continue;
        map[it.name] = it.logoUrl;
        map[normalizeBrandKey(it.name)] = it.logoUrl;
      }

      return map;
    },
  });
}
