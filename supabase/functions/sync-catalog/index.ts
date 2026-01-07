import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TopTex API configuration
const TOPTEX_BASE_URL = "https://api.toptex.io";
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY");
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME");
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD");

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ============================================================================
// UTILITY: Safe logging
// ============================================================================
function safePreview(value: string | undefined | null, keep = 4): string {
  if (!value) return "NOT_SET";
  if (value.length <= keep) return "***";
  return `${value.slice(0, keep)}***`;
}

// ============================================================================
// TOPTEX AUTHENTICATION
// ============================================================================
async function authenticate(): Promise<string> {
  console.log("[Sync] Authenticating with TopTex...");
  
  const response = await fetch(`${TOPTEX_BASE_URL}/v3/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": TOPTEX_API_KEY!,
    },
    body: JSON.stringify({
      username: TOPTEX_USERNAME,
      password: TOPTEX_PASSWORD,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Authentication failed: ${response.status} - ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  const token = data.token || data.jeton;
  
  if (!token) {
    throw new Error(`No token in response. Keys: ${Object.keys(data).join(", ")}`);
  }
  
  console.log(`[Sync] ✅ Authenticated. Token: ${safePreview(token, 8)}`);
  return token;
}

// ============================================================================
// TOPTEX CATALOG REQUEST
// ============================================================================
async function startCatalogGeneration(token: string): Promise<{ link: string; eta: string }> {
  console.log("[Sync] Requesting catalog generation...");
  
  // Exact endpoint from TopTex documentation
  const params = new URLSearchParams();
  params.append("usage_right", "b2b_b2c");
  params.append("display_prices", "1");
  params.append("result_in_file", "1");

  const response = await fetch(`${TOPTEX_BASE_URL}/v3/products/all?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": TOPTEX_API_KEY!,
      "x-toptex-authorization": token,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Catalog request failed: ${response.status} - ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  
  if (!data.link) {
    console.error("[Sync] Response keys:", Object.keys(data).join(", "));
    throw new Error("No S3 link in TopTex response");
  }

  console.log(`[Sync] ✅ Catalog generation started`);
  console.log(`[Sync] S3 link: ${data.link.slice(0, 80)}...`);
  console.log(`[Sync] ETA: ${data.estimated_time_of_arrival}`);
  
  return {
    link: data.link,
    eta: data.estimated_time_of_arrival,
  };
}

// ============================================================================
// S3 FILE DOWNLOAD WITH RETRY
// ============================================================================
async function fetchS3FileWithRetry(
  link: string, 
  updateStatus: (status: string, message?: string) => Promise<void>
): Promise<any[]> {
  const maxRetries = 10;
  const baseWait = 30000; // 30 seconds between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Sync] Fetching S3 file (attempt ${attempt}/${maxRetries})...`);
    await updateStatus("downloading", `Attempt ${attempt}/${maxRetries}`);
    
    try {
      // First check with HEAD request
      const headResponse = await fetch(link, { method: "HEAD" });
      const contentLength = headResponse.headers.get("content-length");
      const contentType = headResponse.headers.get("content-type");
      
      console.log(`[Sync] HEAD status: ${headResponse.status}, size: ${contentLength}, type: ${contentType}`);
      
      if (!headResponse.ok) {
        console.log(`[Sync] File not ready (${headResponse.status}), waiting...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, baseWait));
          continue;
        }
        throw new Error(`S3 file not accessible after ${maxRetries} attempts`);
      }
      
      const size = parseInt(contentLength || "0", 10);
      if (size === 0 && attempt < maxRetries) {
        console.log("[Sync] File is empty (0 bytes), waiting...");
        await new Promise(resolve => setTimeout(resolve, baseWait));
        continue;
      }
      
      console.log(`[Sync] File ready: ${(size / 1024 / 1024).toFixed(2)} MB`);
      
      // Download the file
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error(`Failed to download S3 file: ${response.status}`);
      }
      
      const rawText = await response.text();
      console.log(`[Sync] Downloaded ${rawText.length} characters`);
      console.log(`[Sync] First 200 chars: ${rawText.slice(0, 200)}`);
      
      // Parse JSON
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error(`[Sync] JSON parse error: ${parseErr}`);
        throw new Error(`Failed to parse S3 file as JSON`);
      }
      
      // Extract products array
      if (Array.isArray(data)) {
        if (data.length === 0 && attempt < maxRetries) {
          console.log("[Sync] Empty array, file might not be complete...");
          await new Promise(resolve => setTimeout(resolve, baseWait));
          continue;
        }
        console.log(`[Sync] ✅ Got ${data.length} products`);
        return data;
      } else if (data?.products && Array.isArray(data.products)) {
        console.log(`[Sync] ✅ Got ${data.products.length} products (in .products)`);
        return data.products;
      } else {
        console.log(`[Sync] Unexpected response format. Keys: ${Object.keys(data).join(", ")}`);
        return [];
      }
      
    } catch (err) {
      console.error(`[Sync] Error on attempt ${attempt}:`, err);
      if (attempt === maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, baseWait));
    }
  }
  
  return [];
}

// ============================================================================
// PRODUCT NORMALIZATION
// ============================================================================
function normalizeProduct(product: any) {
  // Extract images
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (typeof img === "string") images.push(img);
      else if (img?.url) images.push(img.url);
      else if (img?.original) images.push(img.original);
      else if (img?.src) images.push(img.src);
    });
  }
  if (product.image && typeof product.image === "string") images.push(product.image);
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.visuel) images.push(product.visuel);

  // Extract colors
  const colors: Array<{ name: string; code: string }> = [];
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach((c: any) => {
      if (typeof c === "string") colors.push({ name: c, code: "" });
      else if (c?.name || c?.nom) colors.push({ name: c.name || c.nom, code: c.code || c.hex || c.hexa || "" });
    });
  }
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      if (d.couleur && !colors.find(c => c.name === d.couleur)) {
        colors.push({ name: d.couleur, code: d.code_couleur || "" });
      }
    });
  }

  // Extract sizes
  const sizes: string[] = [];
  if (product.sizes && Array.isArray(product.sizes)) {
    sizes.push(...product.sizes.map((s: any) => typeof s === "string" ? s : s.name || s.nom || ""));
  }
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      if (d.taille && !sizes.includes(d.taille)) sizes.push(d.taille);
    });
  }

  // Extract variants
  const variants: any[] = [];
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      variants.push({
        sku: d.reference || d.sku || "",
        color: d.couleur || "",
        size: d.taille || "",
        stock: d.stock ?? d.quantite ?? null,
        price: d.prix_ht ?? d.price ?? null,
      });
    });
  }

  return {
    sku: product.reference || product.sku || product.id || product.code || "",
    name: product.designation || product.name || product.titre || product.libelle || "",
    brand: product.marque || product.brand || "",
    category: product.famille || product.category || product.famille_produit || "",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.poids || product.weight || product.grammage || "",
    images,
    colors,
    sizes,
    variants,
    price_ht: product.prix_ht ?? product.price ?? product.prix ?? null,
    stock: product.stock ?? product.quantite ?? null,
    raw_data: product,
  };
}

// ============================================================================
// DATABASE SYNC
// ============================================================================
async function syncProductsToDatabase(
  supabase: any, 
  products: any[], 
  syncId: string,
  updateStatus: (status: string, count?: number) => Promise<void>
): Promise<{ successCount: number; errorCount: number }> {
  console.log(`[Sync] Syncing ${products.length} products to database...`);
  
  let successCount = 0;
  let errorCount = 0;
  const batchSize = 100;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const normalizedBatch = batch
      .map(normalizeProduct)
      .filter(p => p.sku && p.sku.length > 0);
    
    if (normalizedBatch.length === 0) continue;
    
    const { error } = await supabase
      .from("products")
      .upsert(
        normalizedBatch.map(p => ({
          sku: p.sku,
          name: p.name || "Sans nom",
          brand: p.brand || null,
          category: p.category || null,
          description: p.description || null,
          composition: p.composition || null,
          weight: p.weight || null,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          variants: p.variants,
          price_ht: p.price_ht,
          stock: p.stock,
          raw_data: p.raw_data,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "sku" }
      );

    if (error) {
      console.error(`[Sync] Batch ${i / batchSize + 1} error:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += normalizedBatch.length;
    }
    
    // Update progress every 5 batches
    if ((i / batchSize) % 5 === 0) {
      await updateStatus("syncing", successCount);
      console.log(`[Sync] Progress: ${successCount}/${products.length} (${Math.round(successCount / products.length * 100)}%)`);
    }
  }
  
  console.log(`[Sync] ✅ Completed: ${successCount} synced, ${errorCount} errors`);
  return { successCount, errorCount };
}

// ============================================================================
// BACKGROUND SYNC TASK
// ============================================================================
async function runSyncTask(syncId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const updateStatus = async (status: string, countOrMessage?: number | string) => {
    const update: any = { status };
    if (typeof countOrMessage === "number") {
      update.products_count = countOrMessage;
    } else if (typeof countOrMessage === "string") {
      update.error_message = countOrMessage;
    }
    await supabase.from("sync_status").update(update).eq("id", syncId);
  };
  
  try {
    console.log(`[Sync] Background task started for sync ${syncId}`);
    
    // Step 1: Authenticate
    await updateStatus("authenticating");
    const token = await authenticate();
    
    // Step 2: Request catalog generation
    await updateStatus("requesting_catalog");
    const { link, eta } = await startCatalogGeneration(token);
    
    // Update with S3 link
    await supabase.from("sync_status").update({ s3_link: link }).eq("id", syncId);
    
    // Step 3: Wait for ETA + 2 minutes margin
    const etaDate = new Date(eta);
    const now = new Date();
    const waitMs = Math.max(0, etaDate.getTime() - now.getTime()) + 120000; // ETA + 2 min margin
    
    console.log(`[Sync] Waiting ${Math.round(waitMs / 1000)}s for file (ETA + 2 min margin)...`);
    await updateStatus("waiting_for_file", `ETA: ${eta}`);
    
    // Wait in chunks to update status
    const chunkSize = 30000;
    let waited = 0;
    while (waited < waitMs) {
      const toWait = Math.min(chunkSize, waitMs - waited);
      await new Promise(resolve => setTimeout(resolve, toWait));
      waited += toWait;
      console.log(`[Sync] Waited ${Math.round(waited / 1000)}s / ${Math.round(waitMs / 1000)}s`);
    }
    
    // Step 4: Download S3 file
    await updateStatus("downloading");
    const products = await fetchS3FileWithRetry(link, updateStatus);
    
    if (products.length === 0) {
      throw new Error("No products received from TopTex S3 file");
    }
    
    console.log(`[Sync] Received ${products.length} products from TopTex`);
    
    // Step 5: Sync to database
    await updateStatus("syncing", 0);
    const { successCount, errorCount } = await syncProductsToDatabase(supabase, products, syncId, updateStatus);
    
    // Step 6: Complete
    await supabase.from("sync_status").update({
      status: "completed",
      products_count: successCount,
      completed_at: new Date().toISOString(),
      error_message: errorCount > 0 ? `${errorCount} errors during sync` : null,
    }).eq("id", syncId);
    
    console.log(`[Sync] ✅ Sync ${syncId} completed: ${successCount} products`);
    
  } catch (error) {
    console.error(`[Sync] ❌ Sync ${syncId} failed:`, error);
    
    await supabase.from("sync_status").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : String(error),
    }).eq("id", syncId);
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Parse request
    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { /* empty */ }
    }
    
    const url = new URL(req.url);
    const action = body.action || url.searchParams.get("action") || "start";

    // ========== GET STATUS ==========
    if (action === "status") {
      const { data: latestSync } = await supabase
        .from("sync_status")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      
      return new Response(
        JSON.stringify({
          latestSync,
          productsInDb: count || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== START SYNC ==========
    console.log("[Sync] Starting new catalog sync...");
    
    // Check if there's already a sync in progress
    const { data: existingSync } = await supabase
      .from("sync_status")
      .select("*")
      .in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"])
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (existingSync) {
      console.log(`[Sync] Sync already in progress: ${existingSync.id} (${existingSync.status})`);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Un sync est déjà en cours",
          sync: existingSync,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }
    
    // Create sync record
    const { data: syncRecord, error: syncError } = await supabase
      .from("sync_status")
      .insert({
        sync_type: "catalog",
        status: "started",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (syncError || !syncRecord) {
      throw new Error(`Failed to create sync record: ${syncError?.message}`);
    }

    console.log(`[Sync] Created sync record: ${syncRecord.id}`);

    // Start background task using EdgeRuntime.waitUntil
    // @ts-ignore - Deno edge runtime specific
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(runSyncTask(syncRecord.id));
      console.log("[Sync] Background task started with EdgeRuntime.waitUntil");
    } else {
      // Fallback: run without waitUntil (will timeout but task continues)
      runSyncTask(syncRecord.id).catch(err => {
        console.error("[Sync] Background task error:", err);
      });
      console.log("[Sync] Background task started (fallback mode)");
    }

    // Return immediately
    return new Response(
      JSON.stringify({
        success: true,
        message: "Sync started in background",
        sync_id: syncRecord.id,
        status: "started",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Sync] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Shutdown handler
addEventListener("beforeunload", (ev: any) => {
  console.log(`[Sync] Function shutdown: ${ev?.detail?.reason || "unknown"}`);
});
