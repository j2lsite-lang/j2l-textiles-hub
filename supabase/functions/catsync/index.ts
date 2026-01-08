import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const TOPTEX = "https://api.toptex.io";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

// Configuration pagination
const PAGE_SIZE = 500; // Nombre de produits par page (ajustable)
const MAX_PAGES = 1000; // Sécurité pour éviter boucle infinie

async function auth(): Promise<string> {
  console.log("[CATSYNC] Authenticating...");
  const r = await fetch(`${TOPTEX}/v3/authenticate`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", "x-api-key": Deno.env.get("TOPTEX_API_KEY")! }, 
    body: JSON.stringify({ username: Deno.env.get("TOPTEX_USERNAME")!, password: Deno.env.get("TOPTEX_PASSWORD")! }) 
  });
  if (!r.ok) {
    const txt = await r.text();
    console.error(`[CATSYNC] Auth failed: ${r.status} - ${txt}`);
    throw new Error(`Auth: ${r.status}`);
  }
  const d = await r.json();
  console.log("[CATSYNC] Auth successful");
  return d.token || d.jeton;
}

// Nouvelle fonction: récupérer une page de produits (sans fichier S3)
async function fetchProductsPage(token: string, pageNumber: number): Promise<{ products: any[]; hasMore: boolean; totalCount?: number }> {
  const url = `${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=0&page_number=${pageNumber}&page_size=${PAGE_SIZE}`;
  console.log(`[CATSYNC] Fetching page ${pageNumber} (size=${PAGE_SIZE})...`);
  
  const r = await fetch(url, { 
    headers: { 
      "x-api-key": Deno.env.get("TOPTEX_API_KEY")!, 
      "x-toptex-authorization": token 
    } 
  });
  
  if (!r.ok) {
    const txt = await r.text();
    console.error(`[CATSYNC] Page ${pageNumber} failed: ${r.status} - ${txt}`);
    throw new Error(`Page ${pageNumber}: ${r.status}`);
  }
  
  const data = await r.json();
  
  // L'API peut retourner différents formats
  let products: any[] = [];
  if (Array.isArray(data)) {
    products = data;
  } else if (data?.products && Array.isArray(data.products)) {
    products = data.products;
  } else if (data?.data && Array.isArray(data.data)) {
    products = data.data;
  }
  
  const hasMore = products.length >= PAGE_SIZE;
  console.log(`[CATSYNC] Page ${pageNumber}: ${products.length} products, hasMore=${hasMore}`);
  
  return { products, hasMore, totalCount: data?.total_count || data?.totalCount };
}

function normalize(p: any): any {
  return { 
    sku: p.reference || p.sku || "", 
    name: p.designation || p.name || "", 
    brand: p.marque || p.brand || "", 
    category: p.famille || p.category || "", 
    description: p.description || "", 
    images: (p.images || []).map((i: any) => typeof i === "string" ? i : i?.url || ""), 
    colors: (p.couleurs || []).map((c: any) => ({ name: c.nom || c, code: c.code || "" })), 
    sizes: p.tailles || [], 
    raw_data: p 
  };
}

async function syncJob(jobId: string) {
  const upd = (s: string, e: any = {}) => supabase.from("sync_status").update({ status: s, ...e }).eq("id", jobId);
  const start = Date.now();
  
  try {
    await upd("authenticating");
    const token = await auth();
    
    await upd("syncing", { error_message: "Pagination en cours..." });
    
    let totalCount = 0;
    let pageNumber = 1;
    let hasMore = true;
    
    while (hasMore && pageNumber <= MAX_PAGES) {
      // Mettre à jour le statut avec la page actuelle
      await supabase.from("sync_status").update({ 
        s3_poll_count: pageNumber,
        error_message: `Page ${pageNumber}... (${totalCount} produits)`
      }).eq("id", jobId);
      
      // Récupérer la page
      const result = await fetchProductsPage(token, pageNumber);
      
      if (result.products.length === 0) {
        console.log(`[CATSYNC] Page ${pageNumber} empty, stopping`);
        break;
      }
      
      // Normaliser et insérer les produits par batch
      const batch = result.products.map(normalize).filter((p: any) => p.sku);
      
      if (batch.length > 0) {
        const { error } = await supabase.from("products").upsert(
          batch.map((p: any) => ({ ...p, synced_at: new Date().toISOString() })), 
          { onConflict: "sku" }
        );
        
        if (error) {
          console.error(`[CATSYNC] Upsert error page ${pageNumber}:`, error);
        } else {
          totalCount += batch.length;
        }
      }
      
      hasMore = result.hasMore;
      pageNumber++;
      
      // Petite pause entre les pages pour ne pas surcharger l'API
      if (hasMore) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    // Sync terminée
    await supabase.from("sync_status").update({ 
      status: "completed", 
      products_count: totalCount, 
      completed_at: new Date().toISOString(), 
      finished_in_ms: Date.now() - start, 
      error_message: null,
      s3_poll_count: pageNumber - 1
    }).eq("id", jobId);
    
    console.log(`✅ [CATSYNC] Completed: ${totalCount} products in ${pageNumber - 1} pages`);
    
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
      sync_method: "pagination",
      page_size: PAGE_SIZE
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
      sync_type: "catalog_paginated", 
      status: "started" 
    }).select().single();
    
    if (!job) {
      return new Response(JSON.stringify({ error: "Failed to create job" }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Lancer en background
    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(syncJob(job.id));
    
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: job.id,
      sync_method: "pagination",
      page_size: PAGE_SIZE
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  return new Response(JSON.stringify({ error: "Unknown action" }), { 
    status: 400, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});
