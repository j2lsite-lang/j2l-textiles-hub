import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOPTEX_API_URL = 'https://api.toptex.io';

// Read secrets from environment
const TOPTEX_API_KEY = Deno.env.get('TOPTEX_API_KEY');
const TOPTEX_USERNAME = Deno.env.get('TOPTEX_USERNAME');
const TOPTEX_PASSWORD = Deno.env.get('TOPTEX_PASSWORD');

// Token cache (in-memory)
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

// Data cache (in-memory)
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Get OIDC token from TopTex API
 * Tries 'api_key' header first, falls back to 'x-api-key' if 403
 */
async function getToken(forceRefresh = false): Promise<string> {
  // Return cached token if valid
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached token');
    return cachedToken.token;
  }

  console.log('Requesting new OIDC token from TopTex');

  if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
    throw new Error('TOPTEX_CONFIG_MISSING: API_KEY, USERNAME ou PASSWORD non configuré');
  }

  // Try with 'api_key' header first
  const apiKeyHeaders = ['api_key', 'x-api-key'];
  let lastError: Error | null = null;

  for (const headerName of apiKeyHeaders) {
    try {
      console.log(`Trying authentication with header: ${headerName}`);
      
      const response = await fetch(`${TOPTEX_API_URL}/v3/authentifier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [headerName]: TOPTEX_API_KEY,
        },
        body: JSON.stringify({
          username: TOPTEX_USERNAME,
          password: TOPTEX_PASSWORD,
        }),
      });

      const statusCode = response.status;
      console.log(`Auth response status: ${statusCode} (header: ${headerName})`);

      if (response.ok) {
        const data = await response.json();
        
        if (!data.token) {
          throw new Error('TOPTEX_AUTH_NO_TOKEN: Response OK but no token in response');
        }

        // Cache the token
        cachedToken = {
          token: data.token,
          expiresAt: Date.now() + TOKEN_TTL,
        };

        console.log('Token obtained and cached successfully');
        return data.token;
      }

      // If 403, try next header
      if (statusCode === 403) {
        const errorText = await response.text();
        console.log(`Got 403 with ${headerName}, trying next header. Response: ${errorText.substring(0, 200)}`);
        lastError = new Error(`TOPTEX_AUTH_FAILED: ${statusCode} - ${errorText}`);
        continue;
      }

      // Other errors - throw immediately
      const errorText = await response.text();
      throw new Error(`TOPTEX_AUTH_FAILED: ${statusCode} - ${errorText}`);

    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TOPTEX_')) {
        lastError = error;
        if (!error.message.includes('403')) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  // If we get here, all headers failed
  throw lastError || new Error('TOPTEX_AUTH_FAILED: All authentication attempts failed');
}

/**
 * Fetch data from TopTex API with Bearer token
 * Retries once on 401/403 with token refresh
 */
async function fetchFromTopTex(endpoint: string, method: string = 'GET', retryCount = 0): Promise<any> {
  const cacheKey = `toptex_${endpoint}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${endpoint}`);
    return cached.data;
  }

  console.log(`Fetching from TopTex: ${endpoint}`);

  const token = await getToken();

  // Determine which API key header to use (try api_key first)
  const apiKeyHeaders = ['api_key', 'x-api-key'];
  let lastError: Error | null = null;

  for (const headerName of apiKeyHeaders) {
    try {
      const response = await fetch(`${TOPTEX_API_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          [headerName]: TOPTEX_API_KEY!,
        },
      });

      const statusCode = response.status;
      console.log(`API response for ${endpoint}: ${statusCode} (header: ${headerName})`);

      if (response.ok) {
        const data = await response.json();
        dataCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }

      // Handle 401/403 - token might be expired
      if ((statusCode === 401 || statusCode === 403) && retryCount === 0) {
        const errorText = await response.text();
        console.log(`Got ${statusCode} on ${endpoint}, refreshing token and retrying. Error: ${errorText.substring(0, 200)}`);
        
        // Force token refresh and retry once
        cachedToken = null;
        return fetchFromTopTex(endpoint, method, retryCount + 1);
      }

      // If 403 with this header, try next
      if (statusCode === 403) {
        const errorText = await response.text();
        console.log(`Got 403 with ${headerName} header, trying next. Error: ${errorText.substring(0, 200)}`);
        lastError = new Error(`TOPTEX_API_ERROR: ${statusCode} - ${errorText}`);
        continue;
      }

      // Other errors
      const errorText = await response.text();
      throw new Error(`TOPTEX_API_ERROR: ${statusCode} - ${errorText}`);

    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TOPTEX_')) {
        lastError = error;
        if (!error.message.includes('403')) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('TOPTEX_API_ERROR: Request failed with all header variants');
}

// Product normalization helpers
function normalizeProduct(product: any): any {
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
  if (product.image) return [product.image];
  if (product.photo) return [product.photo];
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check configuration
    if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
      console.error('TopTex configuration incomplete');
      return new Response(
        JSON.stringify({ 
          error: 'TOPTEX_CONFIG_MISSING',
          message: 'Configuration TopTex incomplète. Contactez l\'administrateur.',
          needsSetup: true,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    let result: any;

    switch (action) {
      case 'product': {
        if (!sku) {
          throw new Error('SKU is required for product action');
        }
        const data = await fetchFromTopTex(`/v3/produits/${sku}`);
        result = normalizeProduct(data);
        break;
      }

      case 'attributes': {
        const data = await fetchFromTopTex('/v3/attributs');
        result = data;
        break;
      }

      case 'search':
      case 'catalog':
      default: {
        const params = new URLSearchParams();
        if (query) params.append('recherche', query);
        if (category && category !== 'Tous') params.append('categorie', category);
        if (brand && brand !== 'Toutes') params.append('marque', brand);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const endpoint = `/v3/produits${params.toString() ? `?${params.toString()}` : ''}`;
        const data = await fetchFromTopTex(endpoint);

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
    
    // Determine error type
    const isAuthError = errorMessage.includes('AUTH_FAILED') || 
                        errorMessage.includes('401') || 
                        errorMessage.includes('403');
    const isConfigError = errorMessage.includes('CONFIG_MISSING');
    
    // Build user-friendly message
    let userMessage = 'Une erreur est survenue lors de la récupération des produits.';
    let errorCode = 'TOPTEX_ERROR';
    let statusCode = 500;

    if (isConfigError) {
      userMessage = 'Configuration TopTex incomplète. Contactez l\'administrateur.';
      errorCode = 'TOPTEX_CONFIG_MISSING';
      statusCode = 503;
    } else if (isAuthError) {
      userMessage = 'Échec de l\'authentification TopTex. Vérifiez vos identifiants.';
      errorCode = 'TOPTEX_AUTH_FAILED';
      statusCode = 401;
    }

    return new Response(
      JSON.stringify({ 
        error: errorCode,
        message: userMessage,
        details: errorMessage,
        isAuthError,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
