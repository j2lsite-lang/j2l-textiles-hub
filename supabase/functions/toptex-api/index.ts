import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================
async function getProductsFromDB(supabase: any, options: {
  query?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: any[]; total: number }> {
  const { query, category, brand, page = 1, limit = 24 } = options;
  const offset = (page - 1) * limit;

  let qb = supabase.from("products").select("*", { count: "exact" });

  if (query) {
    qb = qb.or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`);
  }
  if (category && category !== "Tous") {
    qb = qb.eq("category", category);
  }
  if (brand && brand !== "Toutes") {
    qb = qb.eq("brand", brand);
  }

  const { data, count, error } = await qb
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { products: data || [], total: count || 0 };
}

async function getAttributesFromDB(supabase: any): Promise<{
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

async function getSyncStatus(supabase: any): Promise<any> {
  const { data } = await supabase
    .from("sync_status")
    .select("id, status, started_at, completed_at, products_count, error_message")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return data;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabase();

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

    console.log(`[API] action=${action}, page=${page}, query=${query || "none"}`);

    // ========== GET /catalog - Database only ==========
    if (action === "catalog" || action === "search") {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      
      if ((count || 0) === 0) {
        const syncStatus = await getSyncStatus(supabase);
        return jsonResponse({
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          needsSync: true,
          syncStatus: syncStatus?.status || "never_synced",
          message: "Base de données vide. Lancez une synchronisation.",
        });
      }

      const { products, total } = await getProductsFromDB(supabase, {
        query, category, brand, page, limit
      });

      return jsonResponse({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        source: "database",
      });
    }

    // ========== GET /product/:sku - Database only ==========
    if (action === "product") {
      if (!sku) {
        return jsonResponse({ error: "SKU required" }, 400);
      }
      
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("sku", sku)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!product) {
        return jsonResponse({ error: "Product not found" }, 404);
      }

      return jsonResponse({ ...product, source: "database" });
    }

    // ========== GET /attributes - Database only ==========
    if (action === "attributes") {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      
      if ((count || 0) === 0) {
        return jsonResponse({
          categories: [],
          brands: [],
          productsCount: 0,
          needsSync: true,
        });
      }

      const attrs = await getAttributesFromDB(supabase);
      return jsonResponse({
        ...attrs,
        productsCount: count,
        source: "database",
      });
    }

    // ========== GET /sync-status ==========
    if (action === "sync-status") {
      const syncStatus = await getSyncStatus(supabase);
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      
      return jsonResponse({
        status: syncStatus?.status || "never_synced",
        lastSync: syncStatus,
        productsInDb: count || 0,
        needsSync: (count || 0) === 0,
      });
    }

    // ========== GET /health ==========
    if (action === "health") {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      const syncStatus = await getSyncStatus(supabase);
      
      return jsonResponse({
        status: "OK",
        productsInDb: count || 0,
        lastSync: syncStatus ? {
          status: syncStatus.status,
          started_at: syncStatus.started_at,
          products_count: syncStatus.products_count,
        } : null,
      });
    }

    // ========== GET /test - Direct TopTex API test ==========
    if (action === "test") {
      // Use same base URL and credentials as catsync
      const TOPTEX_BASE = "https://api.toptex.io";
      const TOPTEX_KEY = (Deno.env.get("TOPTEX_API_KEY") || "").trim();
      const TOPTEX_USER = (Deno.env.get("TOPTEX_USERNAME") || "").trim();
      const TOPTEX_PASS = (Deno.env.get("TOPTEX_PASSWORD") || "").trim();

      if (!TOPTEX_KEY || !TOPTEX_USER || !TOPTEX_PASS) {
        return jsonResponse({ 
          error: "Missing TopTex credentials",
          has_key: !!TOPTEX_KEY,
          has_user: !!TOPTEX_USER,
          has_pass: !!TOPTEX_PASS
        }, 500);
      }

      // Step 1: Authenticate using /v3/authenticate (same as catsync)
      const authUrl = `${TOPTEX_BASE}/v3/authenticate`;
      console.log(`[TEST] Auth: POST ${authUrl}`);
      
      const authRes = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": TOPTEX_KEY },
        body: JSON.stringify({ username: TOPTEX_USER, password: TOPTEX_PASS }),
      });
      const authText = await authRes.text();
      console.log(`[TEST] Auth response: status=${authRes.status}, body=${authText.slice(0, 300)}`);

      if (!authRes.ok) {
        return jsonResponse({
          step: "auth",
          status: authRes.status,
          error: authText.slice(0, 500)
        }, authRes.status);
      }

      let token = "";
      try {
        const authJson = JSON.parse(authText);
        token = authJson.token || authJson.jeton || authJson.access_token || "";
      } catch {
        return jsonResponse({ step: "auth", error: "Cannot parse auth response", body: authText.slice(0, 300) }, 500);
      }

      if (!token) {
        return jsonResponse({ step: "auth", error: "No token in response", body: authText.slice(0, 300) }, 500);
      }

      console.log(`[TEST] Auth OK, token_len=${token.length}`);

      // Step 2: Call /v2/products/all with usage_right=b2b_uniquement
      // Try multiple auth header formats
      const testUrl = `${TOPTEX_BASE}/v2/products/all?usage_right=b2b_uniquement&page_number=1&page_size=40`;
      console.log(`[TEST] Products: GET ${testUrl}`);

      // Try x-toptex-authorization first
      let prodRes = await fetch(testUrl, {
        method: "GET",
        headers: {
          "x-api-key": TOPTEX_KEY,
          "x-toptex-authorization": token,
          "Accept": "application/json",
        },
      });
      let prodText = await prodRes.text();
      console.log(`[TEST] Products (x-toptex-authorization): status=${prodRes.status}, body=${prodText.slice(0, 200)}`);

      // If 401/403, try Authorization: Bearer
      if (prodRes.status === 401 || prodRes.status === 403) {
        console.log(`[TEST] Retrying with Authorization: Bearer`);
        prodRes = await fetch(testUrl, {
          method: "GET",
          headers: {
            "x-api-key": TOPTEX_KEY,
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
        prodText = await prodRes.text();
        console.log(`[TEST] Products (Bearer): status=${prodRes.status}, body=${prodText.slice(0, 200)}`);
      }

      // If still 401/403, try /v3/products/all
      if (prodRes.status === 401 || prodRes.status === 403) {
        const testUrlV3 = `${TOPTEX_BASE}/v3/products/all?usage_right=b2b_uniquement&page_number=1&page_size=40`;
        console.log(`[TEST] Trying /v3: GET ${testUrlV3}`);
        prodRes = await fetch(testUrlV3, {
          method: "GET",
          headers: {
            "x-api-key": TOPTEX_KEY,
            "x-toptex-authorization": token,
            "Accept": "application/json",
          },
        });
        prodText = await prodRes.text();
        console.log(`[TEST] Products (v3): status=${prodRes.status}, body=${prodText.slice(0, 200)}`);
      }
      console.log(`[TEST] Products response: status=${prodRes.status}, len=${prodText.length}, body=${prodText.slice(0, 500)}`);

      let prodData: any = null;
      try {
        prodData = JSON.parse(prodText);
      } catch {
        prodData = { raw: prodText.slice(0, 1000) };
      }

      const productCount = Array.isArray(prodData) ? prodData.length : 
                           Array.isArray(prodData?.items) ? prodData.items.length :
                           Array.isArray(prodData?.products) ? prodData.products.length : 0;

      return jsonResponse({
        step: "products",
        status: prodRes.status,
        productCount,
        sample: Array.isArray(prodData) ? prodData.slice(0, 2) : 
                Array.isArray(prodData?.items) ? prodData.items.slice(0, 2) :
                Array.isArray(prodData?.products) ? prodData.products.slice(0, 2) :
                prodData,
        url: testUrl
      });
    }

    return jsonResponse({ error: "Unknown action" }, 400);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API] Error:", msg);
    return jsonResponse({ error: msg }, 500);
  }
});
