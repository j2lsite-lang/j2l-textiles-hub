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

// Timeouts and limits
const S3_LINK_EXPIRY_MINUTES = 12; // S3 links expire ~15 min, use 12 for safety margin
const S3_POLL_INTERVAL_MS = 20000; // Poll every 20 seconds
const S3_MAX_POLL_ATTEMPTS = 30; // Max ~10 min of polling
const MAX_S3_RETRIES = 3; // Max times to request new S3 link
const BATCH_SIZE = 100;

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
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
  
  console.log("[Sync] ✅ Authenticated");
  return token;
}

// ============================================================================
// REQUEST NEW S3 CATALOG LINK
// ============================================================================
async function requestCatalogGeneration(token: string): Promise<{ link: string; eta: Date }> {
  console.log("[Sync] Requesting catalog generation...");
  
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
    throw new Error(`No S3 link in TopTex response. Keys: ${Object.keys(data).join(", ")}`);
  }

  // Parse ETA
  let eta = new Date();
  if (data.estimated_time_of_arrival) {
    eta = new Date(data.estimated_time_of_arrival);
  } else {
    // Default: assume 5 minutes
    eta = new Date(Date.now() + 5 * 60 * 1000);
  }
  
  console.log(`[Sync] ✅ Got S3 link, ETA: ${eta.toISOString()}`);
  return { link: data.link, eta };
}

// ============================================================================
// S3 FILE POLLING WITH STABILITY CHECK
// ============================================================================
async function waitForS3File(url: string, eta: Date, startTime: number): Promise<{ ready: boolean; expired: boolean }> {
  // Wait until ETA - 30s before starting to poll
  const now = Date.now();
  const waitUntilPoll = Math.max(0, eta.getTime() - now - 30000);
  
  if (waitUntilPoll > 0) {
    console.log(`[Sync] Waiting ${Math.round(waitUntilPoll/1000)}s until ETA...`);
    await new Promise(resolve => setTimeout(resolve, waitUntilPoll));
  }
  
  let lastSize = 0;
  let stableSizeCount = 0;
  
  for (let attempt = 0; attempt < S3_MAX_POLL_ATTEMPTS; attempt++) {
    // Check if S3 link has expired
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed > S3_LINK_EXPIRY_MINUTES) {
      console.log(`[Sync] S3 link expired after ${elapsed.toFixed(1)} minutes`);
      return { ready: false, expired: true };
    }
    
    try {
      const headResponse = await fetch(url, { method: "HEAD" });
      
      if (headResponse.status === 403 || headResponse.status === 404) {
        console.log(`[Sync] Poll ${attempt + 1}: File not ready (${headResponse.status})`);
        await new Promise(resolve => setTimeout(resolve, S3_POLL_INTERVAL_MS));
        continue;
      }
      
      if (headResponse.ok) {
        const size = parseInt(headResponse.headers.get("content-length") || "0", 10);
        
        if (size > 1000) {
          // Check size stability
          if (size === lastSize) {
            stableSizeCount++;
            if (stableSizeCount >= 2) {
              console.log(`[Sync] ✅ File ready and stable: ${(size / 1024 / 1024).toFixed(2)} MB`);
              return { ready: true, expired: false };
            }
          } else {
            stableSizeCount = 0;
            lastSize = size;
          }
          console.log(`[Sync] Poll ${attempt + 1}: Size=${size}, stability=${stableSizeCount}/2`);
        } else {
          console.log(`[Sync] Poll ${attempt + 1}: File too small (${size} bytes)`);
          stableSizeCount = 0;
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.log(`[Sync] Poll ${attempt + 1} error: ${errMsg}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, S3_POLL_INTERVAL_MS));
  }
  
  console.log("[Sync] Max poll attempts reached");
  return { ready: false, expired: false };
}

// ============================================================================
// DOWNLOAD S3 FILE
// ============================================================================
async function downloadCatalog(url: string): Promise<any[]> {
  console.log("[Sync] Downloading catalog from S3...");
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  
  const rawText = await response.text();
  console.log(`[Sync] Downloaded ${(rawText.length / 1024 / 1024).toFixed(2)} MB`);
  
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse error: ${errMsg}`);
  }
  
  if (Array.isArray(data)) {
    console.log(`[Sync] ✅ Parsed ${data.length} products`);
    return data;
  } else if (data?.products && Array.isArray(data.products)) {
    console.log(`[Sync] ✅ Parsed ${data.products.length} products (from .products)`);
    return data.products;
  }
  
  console.log(`[Sync] Unexpected format. Keys: ${Object.keys(data).join(", ")}`);
  return [];
}

// ============================================================================
// PRODUCT NORMALIZATION
// ============================================================================
function normalizeProduct(product: any) {
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (typeof img === "string") images.push(img);
      else if (img?.url) images.push(img.url);
      else if (img?.original) images.push(img.original);
    });
  }
  if (product.image) images.push(product.image);
  if (product.visuel) images.push(product.visuel);

  const colors: Array<{ name: string; code: string }> = [];
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach((c: any) => {
      if (typeof c === "string") colors.push({ name: c, code: "" });
      else if (c?.name || c?.nom) colors.push({ name: c.name || c.nom, code: c.code || c.hex || "" });
    });
  }
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      if (d.couleur && !colors.find(c => c.name === d.couleur)) {
        colors.push({ name: d.couleur, code: d.code_couleur || "" });
      }
    });
  }

  const sizes: string[] = [];
  if (product.sizes && Array.isArray(product.sizes)) {
    sizes.push(...product.sizes.map((s: any) => typeof s === "string" ? s : s.name || ""));
  }
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      if (d.taille && !sizes.includes(d.taille)) sizes.push(d.taille);
    });
  }

  const variants: any[] = [];
  if (product.declinaisons && Array.isArray(product.declinaisons)) {
    product.declinaisons.forEach((d: any) => {
      variants.push({
        sku: d.reference || d.sku || "",
        color: d.couleur || "",
        size: d.taille || "",
        stock: d.stock ?? null,
        price: d.prix_ht ?? null,
      });
    });
  }

  return {
    sku: product.reference || product.sku || product.id || "",
    name: product.designation || product.name || product.titre || "",
    brand: product.marque || product.brand || "",
    category: product.famille || product.category || "",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.poids || product.weight || "",
    images,
    colors,
    sizes,
    variants,
    price_ht: product.prix_ht ?? product.price ?? null,
    stock: product.stock ?? product.quantite ?? null,
    raw_data: product,
  };
}

// ============================================================================
// DATABASE UPSERT IN BATCHES
// ============================================================================
async function upsertProducts(products: any[], jobId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  let successCount = 0;
  
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const normalized = batch.map(normalizeProduct).filter(p => p.sku);
    
    if (normalized.length === 0) continue;
    
    const { error } = await supabase
      .from("products")
      .upsert(
        normalized.map(p => ({
          ...p,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "sku" }
      );
    
    if (error) {
      console.error(`[Sync] Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
    } else {
      successCount += normalized.length;
    }
    
    // Update progress
    if ((i / BATCH_SIZE) % 5 === 0) {
      await supabase.from("sync_status").update({ products_count: successCount }).eq("id", jobId);
      console.log(`[Sync] Progress: ${successCount}/${products.length}`);
    }
  }
  
  return successCount;
}

// ============================================================================
// ACQUIRE LOCK - ONLY ONE ACTIVE JOB
// ============================================================================
async function acquireSyncLock(): Promise<{ acquired: boolean; jobId?: string; existingJob?: any }> {
  const supabase = getSupabaseAdmin();
  
  // Expire stale jobs (older than S3_LINK_EXPIRY_MINUTES)
  const expiryThreshold = new Date(Date.now() - S3_LINK_EXPIRY_MINUTES * 60 * 1000).toISOString();
  
  await supabase.from("sync_status").update({
    status: "expired",
    error_message: "Job auto-expired - S3 link timeout",
    completed_at: new Date().toISOString()
  }).in("status", ["started", "authenticating", "requesting_catalog", "generating", "waiting_for_file", "downloading", "syncing", "processing", "pending"])
    .lt("started_at", expiryThreshold);
  
  // Check for active jobs
  const { data: activeJobs } = await supabase
    .from("sync_status")
    .select("*")
    .in("status", ["started", "authenticating", "requesting_catalog", "generating", "waiting_for_file", "downloading", "syncing", "processing", "pending"])
    .order("started_at", { ascending: false })
    .limit(1);
  
  if (activeJobs && activeJobs.length > 0) {
    const job = activeJobs[0];
    const jobAge = (Date.now() - new Date(job.started_at).getTime()) / 60000;
    
    // Double-check: expire if too old
    if (jobAge > S3_LINK_EXPIRY_MINUTES) {
      await supabase.from("sync_status").update({
        status: "expired",
        error_message: "Job expired - exceeded time limit",
        completed_at: new Date().toISOString()
      }).eq("id", job.id);
      console.log(`[Sync] Expired stale job ${job.id}`);
    } else {
      console.log(`[Sync] Active job exists: ${job.id} (${job.status}, ${jobAge.toFixed(1)} min)`);
      return { acquired: false, existingJob: job };
    }
  }
  
  // Create new job
  const { data: newJob, error } = await supabase
    .from("sync_status")
    .insert({
      sync_type: "catalog",
      status: "started",
      started_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error || !newJob) {
    console.error("[Sync] Failed to create job:", error?.message);
    return { acquired: false };
  }
  
  console.log(`[Sync] Created job: ${newJob.id}`);
  return { acquired: true, jobId: newJob.id };
}

// ============================================================================
// MAIN SYNC WITH AUTO-RECOVERY
// ============================================================================
async function runSync(jobId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  let s3RetryCount = 0;
  
  const updateStatus = async (status: string, extra?: any) => {
    await supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);
  };
  
  try {
    // Step 1: Authenticate
    await updateStatus("authenticating");
    const token = await authenticate();
    
    // Retry loop for S3 link expiry
    while (s3RetryCount < MAX_S3_RETRIES) {
      const linkStartTime = Date.now();
      
      try {
        // Step 2: Request new S3 link
        await updateStatus("requesting_catalog", { 
          error_message: s3RetryCount > 0 ? `Retry ${s3RetryCount}: requesting new S3 link` : null 
        });
        const { link, eta } = await requestCatalogGeneration(token);
        
        await supabase.from("sync_status").update({ s3_link: link }).eq("id", jobId);
        
        // Step 3: Wait and poll for file readiness
        await updateStatus("waiting_for_file", { error_message: `ETA: ${eta.toISOString()}` });
        const { ready, expired } = await waitForS3File(link, eta, linkStartTime);
        
        if (expired) {
          s3RetryCount++;
          console.log(`[Sync] S3 link expired, requesting new one (attempt ${s3RetryCount}/${MAX_S3_RETRIES})`);
          continue; // Get new link
        }
        
        if (!ready) {
          s3RetryCount++;
          console.log(`[Sync] File not ready, requesting new link (attempt ${s3RetryCount}/${MAX_S3_RETRIES})`);
          continue;
        }
        
        // Step 4: Download
        await updateStatus("downloading");
        const products = await downloadCatalog(link);
        
        if (products.length === 0) {
          throw new Error("No products in catalog");
        }
        
        // Step 5: Process and upsert
        await updateStatus("syncing", { products_count: 0 });
        const count = await upsertProducts(products, jobId);
        
        // Success!
        await supabase.from("sync_status").update({
          status: "completed",
          products_count: count,
          completed_at: new Date().toISOString(),
          error_message: null
        }).eq("id", jobId);
        
        console.log(`[Sync] ✅ Completed: ${count} products`);
        return;
        
      } catch (innerError: unknown) {
        // Check if recoverable (S3 expired)
        const msg = innerError instanceof Error ? innerError.message : String(innerError);
        if (msg.includes("403") || msg.includes("expired") || msg.includes("not accessible")) {
          s3RetryCount++;
          console.log(`[Sync] Recoverable error, retry ${s3RetryCount}: ${msg}`);
          if (s3RetryCount >= MAX_S3_RETRIES) throw new Error(msg);
          continue;
        }
        throw innerError instanceof Error ? innerError : new Error(msg);
      }
    }
    
    throw new Error(`Max S3 retries (${MAX_S3_RETRIES}) reached`);
    
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Sync] ❌ Fatal error:", errMsg);
    
    await supabase.from("sync_status").update({
      status: "failed",
      error_message: errMsg,
      completed_at: new Date().toISOString()
    }).eq("id", jobId);
  }
}

// Handle shutdown
addEventListener("beforeunload", (ev: Event) => {
  console.log(`[Sync] Shutdown: ${(ev as any).detail?.reason || "unknown"}`);
});

// ============================================================================
// HTTP HANDLER
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseAdmin();

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "status";

    // STATUS
    if (action === "status") {
      const { data: jobs } = await supabase
        .from("sync_status")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(5);
      
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      
      return new Response(JSON.stringify({
        success: true,
        product_count: count || 0,
        recent_syncs: jobs || [],
        last_sync: jobs?.[0] || null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // START
    if (action === "start") {
      const { acquired, jobId, existingJob } = await acquireSyncLock();
      
      if (!acquired) {
        return new Response(JSON.stringify({
          success: false,
          message: "Sync already in progress",
          existing_job: existingJob
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      (globalThis as any).EdgeRuntime?.waitUntil?.(runSync(jobId!)) || runSync(jobId!);
      
      return new Response(JSON.stringify({
        success: true,
        message: "Sync started",
        job_id: jobId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // FORCE RESTART
    if (action === "force-restart") {
      // Expire all active
      await supabase.from("sync_status").update({
        status: "expired",
        error_message: "Force restarted",
        completed_at: new Date().toISOString()
      }).in("status", ["started", "authenticating", "requesting_catalog", "generating", "waiting_for_file", "downloading", "syncing", "processing", "pending"]);
      
      const { acquired, jobId } = await acquireSyncLock();
      
      if (!acquired || !jobId) {
        return new Response(JSON.stringify({
          success: false,
          message: "Failed to start after force restart"
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      (globalThis as any).EdgeRuntime?.waitUntil?.(runSync(jobId)) || runSync(jobId);
      
      return new Response(JSON.stringify({
        success: true,
        message: "Force restarted",
        job_id: jobId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: "Unknown action. Use: status, start, force-restart"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Sync] Error:", errMsg);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
