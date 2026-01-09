import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const TOPTEX = "https://api.toptex.io";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const envTrim = (key: string) => {
  const v = Deno.env.get(key);
  if (v == null) throw new Error(`Missing env: ${key}`);
  const t = v.trim();
  if (!t) throw new Error(`Empty env: ${key}`);
  return t;
};

const mask = (v: string) => {
  const t = (v || "").trim();
  if (!t) return "(empty)";
  if (t.length <= 8) return `${t.slice(0, 2)}…(${t.length})`;
  return `${t.slice(0, 4)}…${t.slice(-4)}(${t.length})`;
};

// Configuration
const PAGE_SIZE = 100; // Produits par page API
const BATCH_SIZE = 100; // Produits par upsert batch

async function auth(): Promise<string> {
  console.log("[CATSYNC] Authenticating...");

  const apiKey = envTrim("TOPTEX_API_KEY");
  const username = envTrim("TOPTEX_USERNAME");
  const password = envTrim("TOPTEX_PASSWORD");

  const r = await fetch(`${TOPTEX}/v3/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ username, password }),
  });

  const txt = await r.text();

  if (!r.ok) {
    console.error(
      `[CATSYNC] Auth failed: ${r.status} - ${txt.slice(0, 500)} (apiKey=${mask(apiKey)})`,
    );
    throw new Error(`Auth: ${r.status} - ${txt.slice(0, 200)}`);
  }

  let d: any;
  try {
    d = JSON.parse(txt);
  } catch {
    console.error(`[CATSYNC] Auth OK but invalid JSON: ${txt.slice(0, 200)}`);
    throw new Error("Auth: invalid JSON response");
  }

  const token = (d?.token ?? d?.jeton ?? d?.access_token ?? d?.accessToken ?? "").trim();
  if (!token) {
    console.error(`[CATSYNC] Auth OK but token missing. Keys: ${Object.keys(d || {}).join(", ")}`);
    throw new Error("Auth: missing token in response");
  }

  console.log(`[CATSYNC] Auth successful (token_len=${token.length})`);
  return token;
}

// Récupérer une page de produits via l'API
async function fetchProductPage(token: string, pageNumber: number): Promise<{ products: any[]; hasMore: boolean }> {
  const apiKey = envTrim("TOPTEX_API_KEY");
  const url = `${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=0&page_number=${pageNumber}&page_size=${PAGE_SIZE}`;

  const r = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "x-toptex-authorization": token,
    },
  });

  if (!r.ok) {
    const txt = await r.text();
    console.error(`[CATSYNC] Page ${pageNumber} failed: ${r.status} - ${txt.slice(0, 300)}`);
    throw new Error(`Page ${pageNumber}: ${r.status}`);
  }

  const data = await r.json();
  
  // L'API peut retourner un tableau directement ou un objet avec une propriété
  const products = Array.isArray(data) ? data : (data.products || data.items || data.data || []);
  const hasMore = products.length >= PAGE_SIZE;
  
  console.log(`[CATSYNC] Page ${pageNumber}: ${products.length} products, hasMore=${hasMore}`);
  return { products, hasMore };
}

function normalize(p: any): any {
  return { 
    sku: p.reference || p.sku || "", 
    name: p.designation || p.name || "", 
    brand: p.marque || p.brand || "", 
    category: p.famille || p.category || "", 
    description: p.description || "", 
    composition: p.composition || "",
    weight: p.poids || p.weight || "",
    price_ht: parseFloat(p.prix_ht || p.price_ht || p.price || 0) || null,
    images: (p.images || []).map((i: any) => typeof i === "string" ? i : i?.url || ""), 
    colors: (p.couleurs || p.colors || []).map((c: any) => ({ 
      name: typeof c === "string" ? c : (c.nom || c.name || c), 
      code: c.code || "" 
    })), 
    sizes: p.tailles || p.sizes || [], 
    variants: p.declinaisons || p.variants || [],
    raw_data: p 
  };
}

async function syncWithPagination(jobId: string) {
  const upd = (s: string, e: any = {}) => supabase.from("sync_status").update({ status: s, ...e }).eq("id", jobId);
  const start = Date.now();
  
  try {
    // 1. Authentification
    await upd("authenticating");
    const token = await auth();
    
    // 2. Synchronisation par pagination
    await upd("syncing", { error_message: "Démarrage de la synchronisation par pagination..." });
    
    let pageNumber = 1;
    let totalCount = 0;
    let hasMore = true;
    let batch: any[] = [];
    
    while (hasMore) {
      console.log(`[CATSYNC] Fetching page ${pageNumber}...`);
      
      const { products, hasMore: more } = await fetchProductPage(token, pageNumber);
      hasMore = more;
      
      if (products.length === 0) {
        console.log(`[CATSYNC] No products on page ${pageNumber}, stopping`);
        break;
      }
      
      // Normaliser les produits
      for (const p of products) {
        const normalized = normalize(p);
        if (normalized.sku) {
          batch.push({ ...normalized, synced_at: new Date().toISOString() });
        }
      }
      
      // Upsert par batch
      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
        if (error) {
          console.error(`[CATSYNC] Upsert error on page ${pageNumber}:`, error.message);
        } else {
          totalCount += batch.length;
          console.log(`[CATSYNC] Upserted ${batch.length} products (total: ${totalCount})`);
        }
        batch = [];
        
        // Mettre à jour le statut
        await supabase.from("sync_status").update({ 
          error_message: `Page ${pageNumber} - ${totalCount} produits synchronisés...`,
          products_count: totalCount
        }).eq("id", jobId);
      }
      
      pageNumber++;
      
      // Petite pause pour ne pas surcharger l'API
      await new Promise(r => setTimeout(r, 200));
    }
    
    // Upsert le dernier batch
    if (batch.length > 0) {
      const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
      if (!error) {
        totalCount += batch.length;
      }
    }
    
    // 3. Terminé
    await supabase.from("sync_status").update({ 
      status: "completed", 
      products_count: totalCount, 
      completed_at: new Date().toISOString(), 
      finished_in_ms: Date.now() - start, 
      error_message: null
    }).eq("id", jobId);
    
    console.log(`✅ [CATSYNC] Completed: ${totalCount} products in ${(Date.now() - start) / 1000}s (${pageNumber - 1} pages)`);
    
  } catch (e: any) {
    console.error(`[CATSYNC] Error:`, e);
    await supabase.from("sync_status").update({ 
      status: "failed", 
      error_message: e.message, 
      completed_at: new Date().toISOString(), 
      finished_in_ms: Date.now() - start 
    }).eq("id", jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  let action = new URL(req.url).searchParams.get("action");
  if (!action && req.method === "POST") {
    try { const body = await req.json(); action = body.action; } catch {}
  }
  action = action || "status";
  
  if (action === "status") {
    const { data: jobs } = await supabase.from("sync_status").select("*").order("started_at", { ascending: false }).limit(5);
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
    return new Response(JSON.stringify({ 
      status: jobs?.[0]?.status || "never", 
      product_count_db: count, 
      last_sync: jobs?.[0],
      sync_method: "pagination"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  if (action === "start" || action === "force-restart") {
    // Annuler les jobs en cours
    if (action === "force-restart") {
      await supabase.from("sync_status").update({ 
        status: "cancelled", 
        completed_at: new Date().toISOString() 
      }).in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"]);
    }
    
    // Créer un nouveau job
    const { data: job } = await supabase.from("sync_status").insert({ 
      sync_type: "catalog_pagination", 
      status: "started" 
    }).select().single();
    
    if (!job) {
      return new Response(JSON.stringify({ error: "Failed to create job" }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Lancer en background
    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(syncWithPagination(job.id));
    
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: job.id,
      sync_method: "pagination"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  return new Response(JSON.stringify({ error: "Unknown action" }), { 
    status: 400, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});
