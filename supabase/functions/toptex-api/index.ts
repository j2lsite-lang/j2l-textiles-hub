import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TopTex API URLs - try multiple possibilities
const TOPTEX_API_URLS = [
  'https://api.toptex.fr',
  'https://www.toptex.fr/api',
  'https://api.toptex.io',
  'https://toptex.fr/api',
];

// Read secrets from environment
const TOPTEX_API_KEY = Deno.env.get('TOPTEX_API_KEY');
const TOPTEX_USERNAME = Deno.env.get('TOPTEX_USERNAME');
const TOPTEX_PASSWORD = Deno.env.get('TOPTEX_PASSWORD');

// Token cache (in-memory)
let cachedToken: { token: string; expiresAt: number; baseUrl: string } | null = null;
const TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

// Data cache (in-memory)
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Get OIDC token from TopTex API
 * Tries multiple API URLs and authentication approaches
 */
async function getToken(forceRefresh = false): Promise<{ token: string; baseUrl: string }> {
  // Return cached token if valid
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached token');
    return { token: cachedToken.token, baseUrl: cachedToken.baseUrl };
  }

  console.log('Requesting new OIDC token from TopTex');
  console.log(`Username: ${TOPTEX_USERNAME ? TOPTEX_USERNAME.substring(0, 3) + '***' : 'NOT SET'}`);
  console.log(`Password: ${TOPTEX_PASSWORD ? '****' : 'NOT SET'}`);
  console.log(`API Key: ${TOPTEX_API_KEY ? TOPTEX_API_KEY.substring(0, 4) + '***' : 'NOT SET'}`);

  if (!TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
    throw new Error('TOPTEX_CONFIG_MISSING: USERNAME ou PASSWORD non configuré');
  }

  // Authentication endpoints to try
  const authEndpoints = [
    '/v3/authentifier',
    '/api/v3/authentifier',
    '/v3/auth',
    '/v3/login',
    '/auth/token',
    '/oauth/token',
    '/api/auth',
  ];

  // Authentication body formats
  const getAuthBodies = () => [
    // Format 1: Standard login
    { login: TOPTEX_USERNAME, password: TOPTEX_PASSWORD },
    // Format 2: Username/password
    { username: TOPTEX_USERNAME, password: TOPTEX_PASSWORD },
    // Format 3: Email/password
    { email: TOPTEX_USERNAME, password: TOPTEX_PASSWORD },
    // Format 4: With API key
    { username: TOPTEX_USERNAME, password: TOPTEX_PASSWORD, api_key: TOPTEX_API_KEY },
    // Format 5: OAuth style
    { grant_type: 'password', username: TOPTEX_USERNAME, password: TOPTEX_PASSWORD },
  ];

  // Header combinations
  const getHeaders = (): Record<string, string>[] => {
    const base: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const configs: Record<string, string>[] = [base];
    
    if (TOPTEX_API_KEY) {
      configs.push({ ...base, 'x-api-key': TOPTEX_API_KEY });
      configs.push({ ...base, 'Authorization': `Bearer ${TOPTEX_API_KEY}` });
      configs.push({ ...base, 'Authorization': `ApiKey ${TOPTEX_API_KEY}` });
    }
    
    return configs;
  };

  let lastError: Error | null = null;
  let attemptCount = 0;

  // Try each base URL
  for (const baseUrl of TOPTEX_API_URLS) {
    // Try each auth endpoint
    for (const endpoint of authEndpoints) {
      // Try each header combination (limit to first 2 for speed)
      for (const headers of getHeaders().slice(0, 2)) {
        // Try each body format (limit to first 3 for speed)
        for (const body of getAuthBodies().slice(0, 3)) {
          attemptCount++;
          const url = `${baseUrl}${endpoint}`;
          
          try {
            console.log(`[${attemptCount}] Trying: ${url}`);
            
            const response = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
            });

            const statusCode = response.status;
            
            if (response.ok) {
              const data = await response.json();
              console.log(`✓ Success at ${url}, response keys:`, Object.keys(data));
              
              const token = data.token || data.access_token || data.accessToken || data.jwt;
              
              if (token) {
                cachedToken = {
                  token,
                  expiresAt: Date.now() + TOKEN_TTL,
                  baseUrl,
                };
                console.log(`✓ Token obtained from ${url}`);
                return { token, baseUrl };
              } else {
                console.log(`Response OK but no token found in:`, JSON.stringify(data).substring(0, 200));
              }
            } else if (statusCode !== 404 && statusCode !== 403) {
              // Log non-404/403 errors (they might give hints)
              const errorText = await response.text();
              console.log(`[${attemptCount}] ${statusCode} at ${url}: ${errorText.substring(0, 100)}`);
              lastError = new Error(`TOPTEX_AUTH_FAILED: ${statusCode} at ${url}`);
            }
          } catch (error) {
            // Network errors - skip silently for 404s
            if (error instanceof Error && !error.message.includes('404')) {
              console.log(`[${attemptCount}] Network error at ${url}:`, error.message.substring(0, 50));
            }
          }
        }
      }
    }
  }

  // If all attempts failed, throw with helpful message
  throw lastError || new Error(
    `TOPTEX_AUTH_FAILED: Impossible de s'authentifier auprès de TopTex après ${attemptCount} tentatives. ` +
    'Vérifiez que vos identifiants sont corrects et que vous avez accès à l\'API TopTex.'
  );
}

/**
 * Fetch data from TopTex API with Bearer token
 */
async function fetchFromTopTex(endpoint: string, method: string = 'GET', retryCount = 0): Promise<any> {
  const cacheKey = `toptex_${endpoint}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${endpoint}`);
    return cached.data;
  }

  console.log(`Fetching from TopTex: ${endpoint}`);

  const { token, baseUrl } = await getToken();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  const statusCode = response.status;
  console.log(`API response for ${endpoint}: ${statusCode}`);

  if (response.ok) {
    const data = await response.json();
    dataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // Handle 401/403 - token might be expired
  if ((statusCode === 401 || statusCode === 403) && retryCount === 0) {
    console.log(`Got ${statusCode}, refreshing token and retrying`);
    cachedToken = null;
    return fetchFromTopTex(endpoint, method, retryCount + 1);
  }

  const errorText = await response.text();
  throw new Error(`TOPTEX_API_ERROR: ${statusCode} - ${errorText}`);
}

// Product normalization helpers
function normalizeProduct(product: any): any {
  return {
    sku: product.reference || product.sku || product.id || product.code,
    name: product.designation || product.name || product.titre || product.libelle,
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
  if (product.visuel) return [product.visuel];
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
    if (!TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
      console.error('TopTex configuration incomplete');
      return new Response(
        JSON.stringify({ 
          error: 'TOPTEX_CONFIG_MISSING',
          message: 'Configuration TopTex incomplète. Veuillez configurer TOPTEX_USERNAME et TOPTEX_PASSWORD.',
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
        } else if (data.data) {
          products = data.data;
          total = data.total || data.data.length;
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
    
    const isAuthError = errorMessage.includes('AUTH_FAILED') || 
                        errorMessage.includes('401') || 
                        errorMessage.includes('403');
    const isConfigError = errorMessage.includes('CONFIG_MISSING');
    
    let userMessage = 'Une erreur est survenue lors de la récupération des produits.';
    let errorCode = 'TOPTEX_ERROR';
    let statusCode = 500;

    if (isConfigError) {
      userMessage = 'Configuration TopTex incomplète. Contactez l\'administrateur.';
      errorCode = 'TOPTEX_CONFIG_MISSING';
      statusCode = 503;
    } else if (isAuthError) {
      userMessage = 'Échec de l\'authentification TopTex. Vérifiez vos identifiants ou contactez TopTex pour obtenir l\'accès API.';
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
