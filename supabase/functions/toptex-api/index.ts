import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPTEX_BASE_URL = Deno.env.get("TOPTEX_BASE_URL") || "https://api.toptex.io";
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY");
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME");
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL = 25 * 60 * 1000;

// ============================================================================
// UTILITY
// ============================================================================
function safePreview(value: string | undefined | null, keep = 4): string {
  if (!value) return "NOT_SET";
  if (value.length <= keep) return "***";
  return `${value.slice(0, keep)}***`;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
async function authenticate(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
    throw new Error("TOPTEX_CONFIG_MISSING");
  }

  console.log(`[TopTex Auth] Authenticating...`);

  const response = await fetch(`${TOPTEX_BASE_URL}/v3/authenticate`, {
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

  if (!response.ok) {
    throw new Error(`TOPTEX_AUTH_FAILED: ${response.status}`);
  }

  const data = JSON.parse(responseText);
  const token = data.token || data.jeton;

  if (!token) {
    throw new Error(`TOPTEX_AUTH_NO_TOKEN`);
  }

  console.log(`[TopTex Auth] ✅ Authenticated`);
  cachedToken = { token: token.trim(), expiresAt: Date.now() + TOKEN_TTL };
  return cachedToken.token;
}

// ============================================================================
// API REQUEST
// ============================================================================
async function request(method: string, path: string, options: { body?: any; retryCount?: number } = {}): Promise<any> {
  const { body, retryCount = 0 } = options;
  const token = await authenticate(retryCount > 0);
  const url = `${TOPTEX_BASE_URL}${path}`;

  console.log(`[TopTex API] ${method} ${path}`);

  const headers: Record<string, string> = {
    "Accept": "application/json",
    "x-api-key": TOPTEX_API_KEY!,
    "x-toptex-authorization": token,
  };

  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();

  if (response.ok) {
    return responseText ? JSON.parse(responseText) : {};
  }

  if ((response.status === 401 || response.status === 403) && retryCount === 0) {
    cachedToken = null;
    return request(method, path, { body, retryCount: 1 });
  }

  throw new Error(`TOPTEX_API_ERROR: ${response.status}`);
}

// ============================================================================
// TOPTEX CLIENT METHODS
// ============================================================================
async function getAttributes(attributType: string = "brand,family,subfamily"): Promise<any> {
  return request("GET", `/v3/attributes?attributes=${encodeURIComponent(attributType)}`);
}

async function getProductFromApi(sku: string): Promise<any> {
  return request("GET", `/v3/products/${encodeURIComponent(sku)}`);
}

// ============================================================================
// PRODUCT NORMALIZATION
// ============================================================================
function normalizeProduct(product: any): any {
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (typeof img === "string") images.push(img);
      else if (img?.url) images.push(img.url);
      else if (img?.src) images.push(img.src);
    });
  }
  if (product.image) images.push(product.image);
  if (product.visuel) images.push(product.visuel);

  const colors: Array<{ name: string; code: string }> = [];
  const rawColors = product.couleurs || product.colors;
  if (rawColors && Array.isArray(rawColors)) {
    rawColors.forEach((c: any) => {
      colors.push({
        name: typeof c === "string" ? c : c.nom || c.name || "",
        code: typeof c === "string" ? "" : c.code || c.hex || c.hexa || "",
      });
    });
  }

  const sizes: string[] = [];
  const rawSizes = product.tailles || product.sizes;
  if (rawSizes && Array.isArray(rawSizes)) {
    rawSizes.forEach((s: any) => {
      sizes.push(typeof s === "string" ? s : s.nom || s.name || "");
    });
  }

  const variants: any[] = [];
  const rawVariants = product.variantes || product.variants || product.declinaisons;
  if (rawVariants && Array.isArray(rawVariants)) {
    rawVariants.forEach((v: any) => {
      variants.push({
        sku: v.reference || v.sku || "",
        color: v.couleur || v.color || "",
        size: v.taille || v.size || "",
        stock: v.stock ?? null,
        price: v.prixHT || v.prix || null,
      });
    });
  }

  return {
    sku: product.reference || product.sku || product.id || product.code || "",
    name: product.designation || product.name || product.titre || product.libelle || "",
    brand: product.marque || product.brand || "",
    category: product.famille || product.category || product.categorie || "",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.grammage || product.poids || product.weight || "",
    images,
    colors,
    sizes,
    variants,
    priceHT: product.prixHT || product.prix || product.price_ht || null,
    stock: product.stock ?? null,
  };
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================
async function getProductsFromDatabase(supabase: any, options: {
  query?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: any[]; total: number }> {
  const { query, category, brand, page = 1, limit = 24 } = options;
  const offset = (page - 1) * limit;

  let queryBuilder = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`);
  }
  if (category && category !== "Tous") {
    queryBuilder = queryBuilder.eq("category", category);
  }
  if (brand && brand !== "Toutes") {
    queryBuilder = queryBuilder.eq("brand", brand);
  }

  const { data, count, error } = await queryBuilder
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[DB] Query error:", error);
    throw error;
  }

  return {
    products: data || [],
    total: count || 0,
  };
}

async function getSyncStatus(supabase: any): Promise<any> {
  const { data } = await supabase
    .from("sync_status")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return data;
}

async function getAttributesFromDatabase(supabase: any): Promise<{
  categories: string[];
  brands: string[];
}> {
  const { data: products } = await supabase
    .from("products")
    .select("category, brand");

  const categories = new Set<string>();
  const brands = new Set<string>();

  (products || []).forEach((p: any) => {
    if (p.category) categories.add(p.category);
    if (p.brand) brands.add(p.brand);
  });

  return {
    categories: Array.from(categories).sort(),
    brands: Array.from(brands).sort(),
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================
async function healthCheck(supabase: any): Promise<{ status: string; diagnostics: any }> {
  const diagnostics: any = {
    config: {
      apiKeySet: !!TOPTEX_API_KEY,
      usernameSet: !!TOPTEX_USERNAME,
      passwordSet: !!TOPTEX_PASSWORD,
    },
    auth: { success: false },
    database: { success: false, count: 0 },
    lastSync: null,
  };

  try {
    await authenticate(true);
    diagnostics.auth.success = true;
  } catch (error) {
    diagnostics.auth.error = error instanceof Error ? error.message : String(error);
  }

  try {
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
    diagnostics.database.success = true;
    diagnostics.database.count = count || 0;
  } catch (error) {
    diagnostics.database.error = error instanceof Error ? error.message : String(error);
  }

  try {
    diagnostics.lastSync = await getSyncStatus(supabase);
  } catch { /* ignore */ }

  return { status: diagnostics.auth.success && diagnostics.database.success ? "OK" : "KO", diagnostics };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Parse request
    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { /* empty */ }
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
        result = await healthCheck(supabase);
        break;
      }

      // ========== SINGLE PRODUCT ==========
      case "product": {
        if (!sku) {
          throw new Error("SKU is required for product action");
        }
        
        // First try database
        const { data: dbProduct } = await supabase
          .from("products")
          .select("*")
          .eq("sku", sku)
          .maybeSingle();
        
        if (dbProduct) {
          result = {
            ...dbProduct,
            source: "database",
          };
        } else {
          // Fallback to API
          const apiProduct = await getProductFromApi(sku);
          result = {
            ...normalizeProduct(apiProduct),
            source: "api",
          };
        }
        break;
      }

      // ========== ATTRIBUTES ==========
      case "attributes": {
        // First try database
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
        
        if ((count || 0) > 0) {
          const attrs = await getAttributesFromDatabase(supabase);
          result = {
            ...attrs,
            source: "database",
            productsCount: count,
          };
        } else {
          // Fallback to API
          const apiAttrs = await getAttributes("brand,family,subfamily");
          result = {
            raw: apiAttrs,
            source: "api",
          };
        }
        break;
      }

      // ========== SYNC STATUS ==========
      case "sync-status": {
        const syncStatus = await getSyncStatus(supabase);
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
        
        result = {
          lastSync: syncStatus,
          productsInDb: count || 0,
          needsSync: (count || 0) === 0,
        };
        break;
      }

      // ========== CATALOG (from database) ==========
      case "search":
      case "catalog":
      default: {
        // Check if we have products in database
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
        
        if ((count || 0) === 0) {
          // No products in DB, check sync status
          const syncStatus = await getSyncStatus(supabase);
          
          result = {
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            needsSync: true,
            syncStatus: syncStatus?.status || "never_synced",
            message: "La base de données est vide. Lancez une synchronisation pour importer les produits TopTex.",
          };
        } else {
          // Get products from database
          const { products, total } = await getProductsFromDatabase(supabase, {
            query,
            category,
            brand,
            page,
            limit,
          });

          result = {
            products,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit) || 1,
            },
            source: "database",
          };
        }
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[TopTex Handler] Error:", message);

    return new Response(
      JSON.stringify({
        error: "TOPTEX_ERROR",
        message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
