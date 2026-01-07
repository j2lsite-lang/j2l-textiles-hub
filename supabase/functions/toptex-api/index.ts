import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPTEX_BASE_URL = Deno.env.get("TOPTEX_BASE_URL") || "https://api.toptex.io";
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY");
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME");
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD");

// Token cache (in-memory, server-side only)
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL = 25 * 60 * 1000; // 25 minutes (conservative, refresh before expiry)

// Data cache
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ============================================================================
// UTILITY: Mask secrets for logging
// ============================================================================
function safePreview(value: string | undefined | null, keep = 4): string {
  if (!value) return "NOT_SET";
  if (value.length <= keep) return "***";
  return `${value.slice(0, keep)}***`;
}

function logConfig(): void {
  console.log("[TopTex Config Check]");
  console.log(`  BASE_URL: ${TOPTEX_BASE_URL}`);
  console.log(`  API_KEY: ${safePreview(TOPTEX_API_KEY, 6)}`);
  console.log(`  USERNAME: ${safePreview(TOPTEX_USERNAME, 4)}`);
  console.log(`  PASSWORD: ${TOPTEX_PASSWORD ? "****SET****" : "NOT_SET"}`);
}

// ============================================================================
// AUTHENTICATION: POST /v3/authenticate
// ============================================================================
async function authenticate(forceRefresh = false): Promise<string> {
  // Return cached token if valid
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log("[TopTex Auth] Using cached token");
    return cachedToken.token;
  }

  // Validate config
  if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
    logConfig();
    throw new Error("TOPTEX_CONFIG_MISSING: Missing API_KEY, USERNAME, or PASSWORD");
  }

  const authUrl = `${TOPTEX_BASE_URL}/v3/authenticate`;
  
  console.log(`[TopTex Auth] Authenticating...`);
  console.log(`  URL: ${authUrl}`);
  console.log(`  Username: ${safePreview(TOPTEX_USERNAME, 4)}`);
  console.log(`  API Key: ${safePreview(TOPTEX_API_KEY, 6)}`);

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": TOPTEX_API_KEY,
      },
      body: JSON.stringify({
        username: TOPTEX_USERNAME,
        password: TOPTEX_PASSWORD,
      }),
    });

    const responseText = await response.text();
    console.log(`[TopTex Auth] Response status: ${response.status}`);
    console.log(`[TopTex Auth] Response body preview: ${responseText.slice(0, 300)}`);

    if (!response.ok) {
      // Detailed 403 diagnostics
      if (response.status === 403) {
        console.error("[TopTex Auth] ❌ 403 FORBIDDEN - Checklist:");
        console.error("  1. Vérifiez que votre abonnement 'Subscribe' est activé sur TopTex");
        console.error("  2. Vérifiez que la clé API est valide et active");
        console.error("  3. Endpoint correct: POST /v3/authenticate (pas /v3/authentifier)");
        console.error("  4. Vérifiez username/password");
        console.error(`  Response body: ${responseText.slice(0, 500)}`);
      }
      throw new Error(`TOPTEX_AUTH_FAILED: ${response.status} - ${responseText.slice(0, 200)}`);
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`TOPTEX_AUTH_PARSE_ERROR: Invalid JSON response`);
    }

    // Check if response contains an error (TopTex may return 200 with error body)
    if (data.errorType || data.errorMessage || data.error) {
      const errMsg = data.errorMessage || data.error || data.errorType || "Unknown error";
      console.error(`[TopTex Auth] ❌ API returned error in body: ${errMsg}`);
      console.error("[TopTex Auth] Checklist:");
      console.error("  1. Vérifiez que votre abonnement 'Subscribe' est activé sur TopTex");
      console.error("  2. Vérifiez que la clé API est correcte");
      console.error("  3. Vérifiez username/password");
      throw new Error(`TOPTEX_AUTH_FAILED: ${errMsg}`);
    }

    // TopTex may return token in different fields
    const tokenCandidate =
      data.token ||
      data.jeton ||
      data.access_token ||
      data.accessToken ||
      data.jwt ||
      data.id_token ||
      data.data?.token ||
      data.data?.jeton;

    if (!tokenCandidate || typeof tokenCandidate !== "string") {
      console.error(
        `[TopTex Auth] Token not found in response. Keys: ${Object.keys(data).join(", ")}`
      );
      console.error(`[TopTex Auth] Full response: ${JSON.stringify(data).slice(0, 500)}`);
      throw new Error(
        `TOPTEX_AUTH_NO_TOKEN: Response keys: ${Object.keys(data).join(", ")}`
      );
    }

    // Ensure no leading/trailing whitespace/newlines and no surrounding quotes
    const token = tokenCandidate.trim().replace(/^"+|"+$/g, "");

    if (!token) {
      throw new Error("TOPTEX_AUTH_NO_TOKEN: Token was empty after sanitization");
    }

    console.log(
      `[TopTex Auth] ✅ Authenticated successfully. Token: ${safePreview(token, 8)} (len=${token.length})`
    );

    cachedToken = {
      token,
      expiresAt: Date.now() + TOKEN_TTL,
    };

    return token;
  } catch (error) {
    console.error(`[TopTex Auth] Error:`, error);
    throw error;
  }
}

// ============================================================================
// API REQUEST: Generic TopTex API call with retry on 401/403
// ============================================================================
async function request(
  method: string,
  path: string,
  options: { body?: any; retryCount?: number } = {}
): Promise<any> {
  const { body, retryCount = 0 } = options;
  
  // Check cache for GET requests
  const cacheKey = `${method}:${path}`;
  if (method === "GET") {
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[TopTex API] Cache hit: ${path}`);
      return cached.data;
    }
  }

  const token = (await authenticate(retryCount > 0)).trim().replace(/^"+|"+$/g, "");
  const url = `${TOPTEX_BASE_URL}${path}`;

  console.log(`[TopTex API] ${method} ${path}`);

  // TopTex support guidance: use x-api-key + x-toptex-authorization (JWT)
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "x-api-key": TOPTEX_API_KEY!,
    "x-toptex-authorization": token,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  console.log(
    `[TopTex API] Outgoing headers: Accept=${headers["Accept"]}; x-api-key=${safePreview(headers["x-api-key"], 6)}; x-toptex-authorization=${safePreview(headers["x-toptex-authorization"], 10)}; Content-Type=${headers["Content-Type"] ?? "none"}`
  );

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();

  if (response.ok) {
    let data: any;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }
    
    // Cache successful GET responses
    if (method === "GET") {
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    console.log(`[TopTex API] ✅ ${method} ${path} - Success`);
    return data;
  }

  // Retry once on 401/403 (token expired or invalid)
  if ((response.status === 401 || response.status === 403) && retryCount === 0) {
    console.log(`[TopTex API] Got ${response.status}, refreshing token and retrying...`);
    cachedToken = null;
    return request(method, path, { body, retryCount: retryCount + 1 });
  }

  console.error(`[TopTex API] ❌ ${method} ${path} - ${response.status}: ${responseText.slice(0, 300)}`);
  throw new Error(`TOPTEX_API_ERROR: ${response.status} - ${responseText.slice(0, 200)}`);
}

// ============================================================================
// TOPTEX CLIENT METHODS
// ============================================================================
async function getAttributes(attributType: string = "brand,family,subfamily"): Promise<any> {
  // TopTex correct endpoint: /v3/attributes?attributes=brand,family,subfamily
  const params = new URLSearchParams();
  params.append("attributes", attributType);
  return request("GET", `/v3/attributes?${params.toString()}`);
}

async function getAllProducts(options: {
  query?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
  noFile?: boolean; // Test mode: get products without S3 file
} = {}): Promise<any> {
  const { query, category, brand, page = 1, limit = 24, noFile = false } = options;
  
  // TopTex endpoint: /v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=1
  // result_in_file=1 generates an async S3 file that needs time to be ready
  const params = new URLSearchParams();
  params.append("usage_right", "b2b_b2c");
  params.append("display_prices", "1");
  params.append("result_in_file", noFile ? "0" : "1"); // 0 = direct response, 1 = async file
  params.append("page_size", limit.toString());
  params.append("page_number", page.toString());
  
  if (query) params.append("search", query);
  if (category && category !== "Tous") params.append("family", category);
  if (brand && brand !== "Toutes") params.append("brand", brand);
  
  // If noFile mode, return direct response without S3 handling
  if (noFile) {
    console.log(`[TopTex API] Testing direct mode (result_in_file=0)...`);
    const data = await request("GET", `/v3/products/all?${params.toString()}`);
    console.log(`[TopTex API] Direct response keys: ${Object.keys(data || {}).join(", ")}`);
    console.log(`[TopTex API] Direct response: ${JSON.stringify(data).slice(0, 500)}`);
    return data;
  }

  const data = await request("GET", `/v3/products/all?${params.toString()}`);
  
  // TopTex returns a link to an S3 file with estimated_time_of_arrival
  if (data?.link && typeof data.link === "string") {
    console.log(`[TopTex API] Response contains S3 link`);
    console.log(`[TopTex API] S3 link: ${data.link.slice(0, 100)}...`);
    
    // Check estimated_time_of_arrival - the file won't be ready until this time
    if (data.estimated_time_of_arrival) {
      const eta = new Date(data.estimated_time_of_arrival);
      const now = new Date();
      const waitMs = eta.getTime() - now.getTime();
      
      console.log(`[TopTex API] File ETA: ${data.estimated_time_of_arrival}`);
      console.log(`[TopTex API] Current time: ${now.toISOString()}`);
      console.log(`[TopTex API] Wait time needed: ${waitMs}ms`);
      
      // If wait time is more than 10 seconds, return a special response
      // The file generation is async and takes 2-3 minutes
      if (waitMs > 10000) {
        console.log(`[TopTex API] File not ready yet, ETA too long (${Math.round(waitMs/1000)}s)`);
        return { 
          pending: true, 
          eta: data.estimated_time_of_arrival,
          waitSeconds: Math.round(waitMs / 1000),
          link: data.link
        };
      }
      
      if (waitMs > 0) {
        // Wait for the file to be ready (max 10 seconds)
        const actualWait = Math.min(waitMs + 2000, 10000);
        console.log(`[TopTex API] Waiting ${actualWait}ms for file to be ready...`);
        await new Promise(resolve => setTimeout(resolve, actualWait));
      }
    }
    
    // Retry fetching the S3 file with exponential backoff
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[TopTex API] Fetching S3 file (attempt ${attempt}/${maxRetries})...`);
        const fileResponse = await fetch(data.link);
        
        if (!fileResponse.ok) {
          console.error(`[TopTex API] S3 file not ready: ${fileResponse.status}`);
          if (attempt < maxRetries) {
            const retryWait = attempt * 5000; // 5s, 10s, 15s
            console.log(`[TopTex API] Retrying in ${retryWait}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryWait));
            continue;
          }
          throw new Error(`Failed to fetch product file: ${fileResponse.status}`);
        }
        
        const fileData = await fileResponse.json();
        console.log(`[TopTex API] S3 file fetched, type: ${typeof fileData}, isArray: ${Array.isArray(fileData)}`);
        
        if (Array.isArray(fileData)) {
          console.log(`[TopTex API] S3 file contains ${fileData.length} products`);
          if (fileData.length === 0 && attempt < maxRetries) {
            // Empty array might mean file not ready yet
            const retryWait = attempt * 5000;
            console.log(`[TopTex API] Empty array, retrying in ${retryWait}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryWait));
            continue;
          }
          return fileData;
        } else if (fileData?.products) {
          console.log(`[TopTex API] S3 file contains ${fileData.products.length} products`);
          return fileData.products;
        } else {
          console.log(`[TopTex API] S3 file keys: ${Object.keys(fileData || {}).join(", ")}`);
          return fileData;
        }
      } catch (err) {
        console.error(`[TopTex API] Error fetching S3 file (attempt ${attempt}):`, err);
        if (attempt === maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, attempt * 5000));
      }
    }
  }
  
  return data;
}

async function getProduct(sku: string): Promise<any> {
  return request("GET", `/v3/products/${encodeURIComponent(sku)}`);
}

async function healthCheck(): Promise<{ status: string; diagnostics: any }> {
  const diagnostics: any = {
    config: {
      baseUrl: TOPTEX_BASE_URL,
      apiKeySet: !!TOPTEX_API_KEY,
      usernameSet: !!TOPTEX_USERNAME,
      passwordSet: !!TOPTEX_PASSWORD,
    },
    auth: { success: false, error: null },
    attributes: { success: false, error: null },
  };

  try {
    await authenticate(true);
    diagnostics.auth.success = true;
  } catch (error) {
    diagnostics.auth.error = error instanceof Error ? error.message : String(error);
  }

  if (diagnostics.auth.success) {
    try {
      const attrs = await getAttributes("brand,family,subfamily");
      diagnostics.attributes.success = true;
      diagnostics.attributes.count = Array.isArray(attrs) ? attrs.length : "N/A";
    } catch (error) {
      diagnostics.attributes.error = error instanceof Error ? error.message : String(error);
    }
  }

  const status = diagnostics.auth.success && diagnostics.attributes.success ? "OK" : "KO";
  return { status, diagnostics };
}

// ============================================================================
// PRODUCT NORMALIZATION HELPERS
// ============================================================================
function normalizeProduct(product: any): any {
  return {
    sku: product.reference || product.sku || product.id || product.code || "",
    name: product.designation || product.name || product.titre || product.libelle || "",
    brand: product.marque || product.brand || "N/A",
    category: product.categorie || product.category || "Non classé",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.grammage || product.poids || "",
    images: extractImages(product),
    colors: extractColors(product),
    sizes: extractSizes(product),
    variants: extractVariants(product),
    priceHT: product.prixHT || product.prix || null,
    stock: product.stock ?? null,
  };
}

function extractImages(product: any): string[] {
  if (product.images && Array.isArray(product.images)) {
    return product.images.map((img: any) => 
      typeof img === "string" ? img : img.url || img.src || img.lien || ""
    ).filter(Boolean);
  }
  if (product.image) return [product.image];
  if (product.photo) return [product.photo];
  if (product.visuel) return [product.visuel];
  return [];
}

function extractColors(product: any): Array<{ name: string; code: string }> {
  const colors = product.couleurs || product.colors;
  if (colors && Array.isArray(colors)) {
    return colors.map((c: any) => ({
      name: typeof c === "string" ? c : c.nom || c.name || c.libelle || "",
      code: typeof c === "string" ? "" : c.code || c.hexa || c.hex || "",
    }));
  }
  return [];
}

function extractSizes(product: any): string[] {
  const sizes = product.tailles || product.sizes;
  if (sizes && Array.isArray(sizes)) {
    return sizes.map((t: any) => 
      typeof t === "string" ? t : t.nom || t.name || t.libelle || ""
    );
  }
  return [];
}

function extractVariants(product: any): any[] {
  const variants = product.variantes || product.variants;
  if (variants && Array.isArray(variants)) {
    return variants.map((v: any) => ({
      sku: v.reference || v.sku || "",
      color: v.couleur || v.color || "",
      size: v.taille || v.size || "",
      stock: v.stock ?? null,
      price: v.prixHT || v.prix || null,
    }));
  }
  return [];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Config check
    if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
      logConfig();
      return new Response(
        JSON.stringify({
          error: "TOPTEX_CONFIG_MISSING",
          message: "Configuration TopTex incomplète. Vérifiez les secrets.",
          needsSetup: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        // empty body is OK
      }
    }

    const url = new URL(req.url);
    const action = body.action || url.searchParams.get("action") || "catalog";
    const query = body.query || url.searchParams.get("query") || "";
    const page = parseInt(body.page || url.searchParams.get("page") || "1", 10);
    const limit = parseInt(body.limit || url.searchParams.get("limit") || "24", 10);
    const sku = body.sku || url.searchParams.get("sku");
    const category = body.category || url.searchParams.get("category");
    const brand = body.brand || url.searchParams.get("brand");

    console.log(`[TopTex Handler] action=${action}, page=${page}, limit=${limit}, query=${query || "none"}`);

    let result: any;

    switch (action) {
      // ========== HEALTH CHECK ==========
      case "health": {
        const health = await healthCheck();
        result = health;
        break;
      }

      // ========== SINGLE PRODUCT ==========
      case "product": {
        if (!sku) {
          throw new Error("SKU is required for product action");
        }
        const productData = await getProduct(sku);
        result = normalizeProduct(productData);
        break;
      }

      // ========== ATTRIBUTES ==========
      case "attributes": {
        const attributType = body.attributType || url.searchParams.get("attributType") || "marques";
        result = await getAttributes(attributType);
        break;
      }

      // ========== TEST DIRECT (no S3 file) ==========
      case "test-direct": {
        console.log(`[TopTex Handler] Testing direct mode (result_in_file=0)...`);
        const data = await getAllProducts({ query, category, brand, page, limit, noFile: true });
        result = {
          testMode: "result_in_file=0",
          rawResponse: data,
          rawResponseType: typeof data,
          rawResponseKeys: data ? Object.keys(data) : [],
          rawResponsePreview: JSON.stringify(data).slice(0, 1000),
        };
        break;
      }

      // ========== CATALOG / SEARCH ==========
      case "search":
      case "catalog":
      default: {
        const data = await getAllProducts({ query, category, brand, page, limit });

        // Check if TopTex returned a "pending" response (file not ready yet)
        if (data?.pending === true) {
          console.log(`[TopTex Catalog] File generation pending, ETA: ${data.eta}`);
          result = {
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            pending: true,
            eta: data.eta,
            waitSeconds: data.waitSeconds,
            message: `Le catalogue est en cours de génération. Temps estimé: ${data.waitSeconds} secondes.`
          };
          break;
        }

        // Log raw response structure for debugging
        console.log(`[TopTex Catalog] Raw response type: ${typeof data}`);
        console.log(`[TopTex Catalog] Raw response keys: ${data ? Object.keys(data).join(", ") : "null"}`);
        console.log(`[TopTex Catalog] Raw response preview: ${JSON.stringify(data).slice(0, 500)}`);

        let products: any[] = [];
        let total = 0;

        // Handle various TopTex response formats
        if (Array.isArray(data)) {
          products = data;
          total = data.length;
        } else if (data?.products && Array.isArray(data.products)) {
          products = data.products;
          total = data.total_count || data.total || data.count || products.length;
        } else if (data?.produits && Array.isArray(data.produits)) {
          products = data.produits;
          total = data.total || data.nombreTotal || products.length;
        } else if (data?.items && Array.isArray(data.items)) {
          products = data.items;
          total = data.total || data.total_count || products.length;
        } else if (data?.results && Array.isArray(data.results)) {
          products = data.results;
          total = data.total || products.length;
        } else if (data?.data && Array.isArray(data.data)) {
          products = data.data;
          total = data.total || products.length;
        } else if (data?.content && Array.isArray(data.content)) {
          // Spring/Java style pagination
          products = data.content;
          total = data.totalElements || data.total || products.length;
        } else {
          // Maybe the data itself is a product list at root level with numeric keys
          const possibleProducts = Object.values(data || {}).filter(
            (v: any) => v && typeof v === "object" && (v.reference || v.sku || v.designation || v.name)
          );
          if (possibleProducts.length > 0) {
            products = possibleProducts as any[];
            total = products.length;
          }
        }

        console.log(`[TopTex Catalog] Parsed ${products.length} products, total=${total}`);

        result = {
          products: products.map(normalizeProduct),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[TopTex Handler] Error:", message);

    const isAuthError = 
      message.includes("TOPTEX_AUTH") || 
      message.includes("401") || 
      message.includes("403");

    const isConfigError = message.includes("TOPTEX_CONFIG_MISSING");

    let userMessage = "Une erreur est survenue lors de la récupération des produits.";
    let errorCode = "TOPTEX_ERROR";
    let statusCode = 500;

    if (isConfigError) {
      userMessage = "Configuration TopTex incomplète.";
      errorCode = "TOPTEX_CONFIG_MISSING";
      statusCode = 503;
    } else if (isAuthError) {
      if (message.includes("Identifiants") || message.toLowerCase().includes("incorrect")) {
        userMessage = "Identifiants TopTex incorrects (username/password).";
      } else if (message.includes("Interdit") || message.toLowerCase().includes("forbidden") || message.includes("403")) {
        userMessage = "Accès API TopTex refusé. Vérifiez: abonnement Subscribe actif, clé API valide, droits API.";
      } else {
        userMessage = "Échec de l'authentification TopTex.";
      }
      errorCode = "TOPTEX_AUTH_FAILED";
      statusCode = 401;
    }

    return new Response(
      JSON.stringify({ 
        error: errorCode, 
        message: userMessage, 
        details: message,
        isAuthError 
      }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
