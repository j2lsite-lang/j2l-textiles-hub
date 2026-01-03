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

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate HMAC-SHA256 signature
async function generateSignature(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return arrayBufferToBase64(signature);
}

// Create Authorization header with HMAC signature
async function createAuthHeader(method: string, path: string, date: string): Promise<string> {
  if (!TOPTEX_API_KEY) {
    throw new Error('TOPTEX_API_KEY is not configured');
  }

  // The string to sign typically includes method, path and date
  const stringToSign = `${method.toLowerCase()} ${path}\ndate: ${date}`;
  const signature = await generateSignature(TOPTEX_API_KEY, stringToSign);
  
  // TopTex expects the Signature format
  return `Signature keyId="${TOPTEX_API_KEY}",algorithm="hmac-sha256",headers="date",signature="${signature}"`;
}

async function fetchFromTopTex(endpoint: string, method: string = 'GET'): Promise<any> {
  const cacheKey = `toptex_${endpoint}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${endpoint}`);
    return cached.data;
  }

  console.log(`Fetching from TopTex: ${endpoint}`);
  
  const date = new Date().toUTCString();
  const authHeader = await createAuthHeader(method, endpoint, date);
  
  console.log('Request date:', date);
  console.log('Auth header created');

  const response = await fetch(`${TOPTEX_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': authHeader,
      'Date': date,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`TopTex API error for ${endpoint}:`, response.status, errorText);
    throw new Error(`TopTex API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

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
    if (!TOPTEX_API_KEY) {
      console.error('TOPTEX_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration manquante',
          message: 'La clé API TopTex n\'est pas configurée.',
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
    
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Authentication');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: isAuthError 
          ? 'Échec de l\'authentification TopTex. Vérifiez que votre clé API est valide.'
          : 'Une erreur est survenue lors de la récupération des produits.',
        isAuthError,
      }),
      {
        status: isAuthError ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
