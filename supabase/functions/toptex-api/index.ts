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
  console.log('API Key present:', !!TOPTEX_API_KEY);
  console.log('API Key length:', TOPTEX_API_KEY?.length || 0);

  // Try different authentication formats that TopTex might expect
  // Format 1: api_key in body (common format)
  let response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      api_key: TOPTEX_API_KEY,
    }),
  });

  // If format 1 fails, try format 2: apiKey in body
  if (!response.ok) {
    console.log('Format api_key failed, trying apiKey...');
    response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        apiKey: TOPTEX_API_KEY,
      }),
    });
  }

  // If format 2 fails, try format 3: key in header
  if (!response.ok) {
    console.log('Format apiKey failed, trying X-API-Key header...');
    response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': TOPTEX_API_KEY || '',
      },
      body: JSON.stringify({}),
    });
  }

  // If format 3 fails, try format 4: Authorization header with API key
  if (!response.ok) {
    console.log('Format X-API-Key header failed, trying Authorization header...');
    response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOPTEX_API_KEY}`,
      },
      body: JSON.stringify({}),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Auth error:', response.status, errorText);
    console.error('All authentication formats failed');
    throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Auth response keys:', Object.keys(data));
  
  const token = data.token || data.accessToken || data.access_token || data.jwt || data;
  
  if (typeof token === 'string') {
    cache.set(cacheKey, { data: token, timestamp: Date.now() });
    console.log('Token obtained successfully');
    return token;
  }
  
  throw new Error('No valid token in response');
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
      'Accept': 'application/json',
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
    // Check if API key is configured
    if (!TOPTEX_API_KEY) {
      console.error('TOPTEX_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration manquante',
          message: 'La clé API TopTex n\'est pas configurée. Veuillez ajouter TOPTEX_API_KEY dans les secrets.',
          needsSetup: true,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body if present
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        // No body or invalid JSON
      }
    }

    const url = new URL(req.url);
    const action = body.action || url.searchParams.get('action') || 'catalog';
    const query = body.query || url.searchParams.get('query') || '';
    const page = parseInt(body.page || url.searchParams.get('page') || '1');
    const limit = parseInt(body.limit || url.searchParams.get('limit') || '24');
    const sku = body.sku || url.searchParams.get('sku');
    const category = body.category || url.searchParams.get('category');
    const brand = body.brand || url.searchParams.get('brand');

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
    
    // Check if it's an auth error
    const isAuthError = errorMessage.includes('Authentication failed');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: isAuthError 
          ? 'Échec de l\'authentification TopTex. Vérifiez que votre clé API est valide.'
          : 'Une erreur est survenue lors de la récupération des produits. Veuillez réessayer.',
        isAuthError,
      }),
      {
        status: isAuthError ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
