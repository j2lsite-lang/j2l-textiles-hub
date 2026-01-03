import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPTEX_API_URL = 'https://api.toptex.io';
const TOPTEX_API_KEY = Deno.env.get('TOPTEX_API_KEY');

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getAuthToken(): Promise<string> {
  const cacheKey = 'toptex_token';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached auth token');
    return cached.data;
  }

  console.log('Fetching new auth token from TopTex');
  
  const response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: TOPTEX_API_KEY,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Auth error:', response.status, errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.token || data.accessToken || data;
  
  cache.set(cacheKey, { data: token, timestamp: Date.now() });
  
  return token;
}

async function fetchFromTopTex(endpoint: string, token: string): Promise<any> {
  const cacheKey = `toptex_${endpoint}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${endpoint}`);
    return cached.data;
  }

  console.log(`Fetching from TopTex: ${endpoint}`);
  
  const response = await fetch(`${TOPTEX_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`TopTex API error for ${endpoint}:`, response.status, errorText);
    throw new Error(`TopTex API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

function normalizeProduct(product: any): any {
  // Normalize TopTex product data to our internal format
  return {
    sku: product.reference || product.sku || product.id,
    name: product.designation || product.name || product.titre,
    brand: product.marque || product.brand || 'N/A',
    category: product.categorie || product.category || 'Non classé',
    description: product.description || product.descriptif || '',
    composition: product.composition || product.matiere || '',
    weight: product.grammage || product.poids || '',
    images: extractImages(product),
    colors: extractColors(product),
    sizes: extractSizes(product),
    variants: extractVariants(product),
    priceHT: product.prixHT || product.prix || null,
    stock: product.stock || null,
  };
}

function extractImages(product: any): string[] {
  if (product.images && Array.isArray(product.images)) {
    return product.images.map((img: any) => typeof img === 'string' ? img : img.url || img.src);
  }
  if (product.image) {
    return [product.image];
  }
  if (product.photo) {
    return [product.photo];
  }
  return [];
}

function extractColors(product: any): Array<{ name: string; code: string }> {
  if (product.couleurs && Array.isArray(product.couleurs)) {
    return product.couleurs.map((c: any) => ({
      name: typeof c === 'string' ? c : c.nom || c.name || c.libelle,
      code: typeof c === 'string' ? '' : c.code || c.hexa || c.hex || '',
    }));
  }
  if (product.colors && Array.isArray(product.colors)) {
    return product.colors.map((c: any) => ({
      name: typeof c === 'string' ? c : c.name || c.label,
      code: typeof c === 'string' ? '' : c.code || c.hex || '',
    }));
  }
  return [];
}

function extractSizes(product: any): string[] {
  if (product.tailles && Array.isArray(product.tailles)) {
    return product.tailles.map((t: any) => typeof t === 'string' ? t : t.nom || t.name || t.libelle);
  }
  if (product.sizes && Array.isArray(product.sizes)) {
    return product.sizes.map((s: any) => typeof s === 'string' ? s : s.name || s.label);
  }
  return [];
}

function extractVariants(product: any): any[] {
  if (product.variantes && Array.isArray(product.variantes)) {
    return product.variantes.map((v: any) => ({
      sku: v.reference || v.sku,
      color: v.couleur || v.color,
      size: v.taille || v.size,
      stock: v.stock,
      price: v.prixHT || v.prix,
    }));
  }
  if (product.variants && Array.isArray(product.variants)) {
    return product.variants;
  }
  return [];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TOPTEX_API_KEY) {
      throw new Error('TOPTEX_API_KEY is not configured');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'catalog';
    const query = url.searchParams.get('query') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '24');
    const sku = url.searchParams.get('sku');
    const category = url.searchParams.get('category');
    const brand = url.searchParams.get('brand');

    console.log(`TopTex API request: action=${action}, query=${query}, page=${page}`);

    const token = await getAuthToken();

    let result: any;

    switch (action) {
      case 'product': {
        if (!sku) {
          throw new Error('SKU is required for product action');
        }
        const data = await fetchFromTopTex(`/v3/produits/${sku}`, token);
        result = normalizeProduct(data);
        break;
      }

      case 'attributes': {
        const data = await fetchFromTopTex('/v3/attributs', token);
        result = data;
        break;
      }

      case 'search':
      case 'catalog':
      default: {
        // Build query params for TopTex API
        const params = new URLSearchParams();
        if (query) params.append('recherche', query);
        if (category && category !== 'Tous') params.append('categorie', category);
        if (brand && brand !== 'Toutes') params.append('marque', brand);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const endpoint = `/v3/produits${params.toString() ? `?${params.toString()}` : ''}`;
        const data = await fetchFromTopTex(endpoint, token);

        // Handle different response formats
        let products = [];
        let total = 0;

        if (Array.isArray(data)) {
          products = data;
          total = data.length;
        } else if (data.produits) {
          products = data.produits;
          total = data.total || data.produits.length;
        } else if (data.items) {
          products = data.items;
          total = data.total || data.items.length;
        } else if (data.results) {
          products = data.results;
          total = data.total || data.results.length;
        }

        result = {
          products: products.map(normalizeProduct),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in toptex-api function:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: 'Une erreur est survenue lors de la récupération des produits. Veuillez réessayer.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
