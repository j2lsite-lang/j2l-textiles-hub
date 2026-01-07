import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration
const TOPTEX_BASE_URL = "https://api.toptex.io";
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY")!;
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME")!;
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Timeouts
const S3_LINK_EXPIRY_MINUTES = 12; // Hard stop: job > 12 min
const S3_ETA_MARGIN_MS = 2 * 60 * 1000; // 403 after ETA + 2 min => treat as expired
const S3_POLL_INTERVAL_MS = 20000; // Poll every 20 seconds
const S3_MIN_SIZE_MB = 50; // Min 50MB to consider file potentially ready
const S3_TARGET_SIZE_MB = 130; // Expected ~130MB
const S3_MIN_SIZE_BYTES = S3_MIN_SIZE_MB * 1024 * 1024;
const S3_TARGET_SIZE_BYTES = S3_TARGET_SIZE_MB * 1024 * 1024;
const BATCH_SIZE = 100;
const ADVISORY_LOCK_ID = 12345; // Unique lock ID for catalog sync

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// ============================================================================
// 1. LOCK TRANSACTIONNEL - Advisory Lock via DB
// ============================================================================
async function tryAcquireAdvisoryLock(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  // Try to acquire advisory lock (non-blocking)
  const { data, error } = await supabase.rpc('pg_try_advisory_lock', { key: ADVISORY_LOCK_ID });
  
  if (error) {
    // Fallback: check sync_status table
    console.log("[Sync] Advisory lock RPC failed, using table-based lock");
    return await tryTableBasedLock();
  }
  
  return data === true;
}

async function releaseAdvisoryLock(): Promise<void> {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.rpc('pg_advisory_unlock', { key: ADVISORY_LOCK_ID });
  } catch {
    // Ignore - lock will be released when connection closes
  }
}

async function tryTableBasedLock(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  // First, auto-expire stale jobs
  await expireStaleJobs();
  
  // Check for active jobs
  const { data: activeJobs } = await supabase
    .from("sync_status")
    .select("id, status, started_at, s3_link")
    .in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"])
    .order("started_at", { ascending: false })
    .limit(1);
  
  if (activeJobs && activeJobs.length > 0) {
    const job = activeJobs[0];
    const ageMinutes = (Date.now() - new Date(job.started_at).getTime()) / 60000;
    
    // If job is too old, it's stale
    if (ageMinutes > S3_LINK_EXPIRY_MINUTES) {
      await supabase.from("sync_status").update({
        status: "expired",
        error_message: "Auto-expired: exceeded time limit",
        completed_at: new Date().toISOString()
      }).eq("id", job.id);
      console.log(`[Sync] Auto-expired stale job ${job.id.slice(0, 8)}...`);
    } else {
      console.log(`[Sync] Active job exists: ${job.id.slice(0, 8)}... (${job.status}, ${ageMinutes.toFixed(1)} min)`);
      return false;
    }
  }
  
  return true;
}

async function expireStaleJobs(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const threshold = new Date(Date.now() - S3_LINK_EXPIRY_MINUTES * 60 * 1000).toISOString();
  
  await supabase.from("sync_status").update({
    status: "expired",
    error_message: "Auto-expired: S3 link timeout",
    completed_at: new Date().toISOString()
  }).in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"])
    .lt("started_at", threshold);
}

// ============================================================================
// TOPTEX AUTHENTICATION
// ============================================================================
async function authenticate(): Promise<string> {
  console.log("[Sync] Authenticating...");
  
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.token || data.jeton;
  
  if (!token) {
    throw new Error("No token in auth response");
  }
  
  console.log("[Sync] ✅ Authenticated");
  return token;
}

// ============================================================================
// (OPTIONNEL) VALIDATION ENDPOINT ATTRIBUTES
// - Corrige l'appel /v3/attributes : pas de result_in_file
// - Endpoint attendu: /v3/attributes?attributes=brand,family,subfamily
// ============================================================================
async function validateAttributesEndpoint(token: string): Promise<void> {
  const params = new URLSearchParams({ attributes: "brand,family,subfamily" });

  const response = await fetch(`${TOPTEX_BASE_URL}/v3/attributes?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": TOPTEX_API_KEY,
      "x-toptex-authorization": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Attributes request failed: ${response.status}`);
  }

  // Ne pas stocker: simple validation + debug
  try {
    const data = await response.json();
    const count = Array.isArray(data) ? data.length : (data?.data?.length ?? null);
    console.log(`[Sync] ✅ Attributes OK${count != null ? ` (${count})` : ""}`);
  } catch {
    console.log("[Sync] ✅ Attributes OK (non-JSON)");
  }
}

// ============================================================================
// 2. REQUEST S3 CATALOG LINK
// ============================================================================
async function requestCatalogGeneration(token: string): Promise<{ link: string; eta: Date }> {
  console.log("[Sync] Requesting catalog generation...");
  
  const params = new URLSearchParams({
    usage_right: "b2b_b2c",
    display_prices: "1",
    result_in_file: "1"
  });

  const response = await fetch(`${TOPTEX_BASE_URL}/v3/products/all?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": TOPTEX_API_KEY,
      "x-toptex-authorization": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.link) {
    throw new Error("No S3 link in response");
  }

  const eta = data.estimated_time_of_arrival 
    ? new Date(data.estimated_time_of_arrival)
    : new Date(Date.now() + 5 * 60 * 1000);
  
  console.log(`[Sync] ✅ Got S3 link, ETA: ${eta.toISOString()}`);
  return { link: data.link, eta };
}

// ============================================================================
// 3. S3 POLLING - HEAD every 20s, stable Content-Length on 2 checks
// ============================================================================
async function pollS3File(
  url: string,
  eta: Date,
  startTime: number,
  updateProgress: (msg: string) => Promise<void>,
  updateMetrics: (metrics: { s3_poll_count?: number; s3_content_length?: number | null }) => Promise<void>
): Promise<{ ready: boolean; expired: boolean; size: number }> {
  // Wait until ETA - 30s before polling
  const waitMs = Math.max(0, eta.getTime() - Date.now() - 30000);
  if (waitMs > 0) {
    console.log(`[Sync] Waiting ${Math.round(waitMs / 1000)}s until ETA...`);
    await updateProgress(`Attente ETA: ${Math.round(waitMs / 1000)}s`);
    await new Promise((r) => setTimeout(r, waitMs));
  }

  const etaDeadlineMs = eta.getTime() + S3_ETA_MARGIN_MS;

  let lastSize = 0;
  let stableCount = 0;
  let pollCount = 0;

  // Stable means "same content-length on 2 consecutive HEADs"
  const stableNeeded = 1;

  while (true) {
    pollCount++;

    // Hard stop: job too old
    const elapsedMin = (Date.now() - startTime) / 60000;
    if (elapsedMin > S3_LINK_EXPIRY_MINUTES) {
      console.log(`[Sync] S3 polling expired after ${elapsedMin.toFixed(1)} min`);
      return { ready: false, expired: true, size: 0 };
    }

    try {
      const headRes = await fetch(url, { method: "HEAD" });

      if (headRes.status === 403) {
        // 403 can mean "not ready" OR "expired". We decide by ETA+marge.
        await updateMetrics({ s3_poll_count: pollCount, s3_content_length: null });

        if (Date.now() > etaDeadlineMs) {
          console.log(`[Sync] Poll #${pollCount}: 403 after ETA+marge => expired`);
          await updateProgress(`Lien expiré (403 après ETA+marge) - poll #${pollCount}`);
          return { ready: false, expired: true, size: 0 };
        }

        console.log(`[Sync] Poll #${pollCount}: 403 (avant ETA+marge) => retry`);
        await updateProgress(`Fichier non prêt (403) - poll #${pollCount}`);
      } else if (headRes.status === 404) {
        await updateMetrics({ s3_poll_count: pollCount, s3_content_length: null });
        console.log(`[Sync] Poll #${pollCount}: not ready (404)`);
        await updateProgress(`Fichier non prêt (404) - poll #${pollCount}`);
      } else if (headRes.ok) {
        const size = parseInt(headRes.headers.get("content-length") || "0", 10) || 0;
        await updateMetrics({ s3_poll_count: pollCount, s3_content_length: size });

        const sizeMb = (size / 1024 / 1024).toFixed(1);

        // Track stability
        if (size > 0 && size === lastSize) stableCount++;
        else {
          stableCount = 0;
          lastSize = size;
        }

        // Ready rule:
        // - Prefer expected size (~130MB) + stable
        // - Or >=50MB + stable
        const stableOk = stableCount >= stableNeeded;

        if (size >= S3_TARGET_SIZE_BYTES && stableOk) {
          console.log(`[Sync] ✅ File ready (target): ${sizeMb}MB`);
          await updateProgress(`Prêt: ${sizeMb}MB (target) - poll #${pollCount}`);
          return { ready: true, expired: false, size };
        }

        if (size >= S3_MIN_SIZE_BYTES && stableOk) {
          console.log(`[Sync] ✅ File ready (min): ${sizeMb}MB`);
          await updateProgress(`Prêt: ${sizeMb}MB - poll #${pollCount}`);
          return { ready: true, expired: false, size };
        }

        console.log(`[Sync] Poll #${pollCount}: ${sizeMb}MB (stable=${stableCount}/${stableNeeded})`);
        await updateProgress(`Vérification: ${sizeMb}MB - poll #${pollCount}`);
      } else {
        await updateMetrics({ s3_poll_count: pollCount, s3_content_length: null });
        console.log(`[Sync] Poll #${pollCount}: unexpected status ${headRes.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[Sync] Poll #${pollCount} error: ${msg}`);
      await updateMetrics({ s3_poll_count: pollCount });
    }

    await new Promise((r) => setTimeout(r, S3_POLL_INTERVAL_MS));
  }
}

// ============================================================================
// 4. DOWNLOAD + STREAMING JSON PARSE
// ============================================================================
async function downloadAndParseCatalog(
  url: string,
  updateProgress: (msg: string) => Promise<void>
): Promise<any[]> {
  console.log("[Sync] Downloading catalog...");
  await updateProgress("Téléchargement en cours...");
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  
  // For large files, we stream the response
  const text = await response.text();
  const sizeMB = (text.length / 1024 / 1024).toFixed(2);
  console.log(`[Sync] Downloaded ${sizeMB} MB`);
  await updateProgress(`Téléchargé: ${sizeMB} MB`);
  
  // Parse JSON
  console.log("[Sync] Parsing JSON...");
  await updateProgress("Parsing JSON...");
  
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse failed: ${msg}`);
  }
  
  const products = Array.isArray(data) ? data : (data?.products || []);
  console.log(`[Sync] ✅ Parsed ${products.length} products`);
  
  return products;
}

// ============================================================================
// PRODUCT NORMALIZATION
// ============================================================================
function normalizeProduct(p: any): any {
  const images: string[] = [];
  if (Array.isArray(p.images)) {
    p.images.forEach((img: any) => {
      if (typeof img === "string") images.push(img);
      else if (img?.url) images.push(img.url);
      else if (img?.original) images.push(img.original);
    });
  }
  if (p.image) images.push(p.image);
  if (p.visuel) images.push(p.visuel);

  const colors: Array<{ name: string; code: string }> = [];
  const rawColors = p.couleurs || p.colors || [];
  if (Array.isArray(rawColors)) {
    rawColors.forEach((c: any) => {
      colors.push({
        name: typeof c === "string" ? c : (c.nom || c.name || ""),
        code: typeof c === "string" ? "" : (c.code || c.hex || ""),
      });
    });
  }
  if (Array.isArray(p.declinaisons)) {
    p.declinaisons.forEach((d: any) => {
      if (d.couleur && !colors.find(c => c.name === d.couleur)) {
        colors.push({ name: d.couleur, code: d.code_couleur || "" });
      }
    });
  }

  const sizes: string[] = [];
  const rawSizes = p.tailles || p.sizes || [];
  if (Array.isArray(rawSizes)) {
    rawSizes.forEach((s: any) => sizes.push(typeof s === "string" ? s : (s.nom || s.name || "")));
  }
  if (Array.isArray(p.declinaisons)) {
    p.declinaisons.forEach((d: any) => {
      if (d.taille && !sizes.includes(d.taille)) sizes.push(d.taille);
    });
  }

  const variants: any[] = [];
  const rawVariants = p.variantes || p.variants || p.declinaisons || [];
  if (Array.isArray(rawVariants)) {
    rawVariants.forEach((v: any) => {
      variants.push({
        sku: v.reference || v.sku || "",
        color: v.couleur || v.color || "",
        size: v.taille || v.size || "",
        stock: v.stock ?? null,
        price: v.prixHT || v.prix_ht || v.prix || null,
      });
    });
  }

  return {
    sku: p.reference || p.sku || p.id || "",
    name: p.designation || p.name || p.titre || "",
    brand: p.marque || p.brand || "",
    category: p.famille || p.category || "",
    description: p.description || p.descriptif || "",
    composition: p.composition || p.matiere || "",
    weight: p.grammage || p.poids || p.weight || "",
    images,
    colors,
    sizes,
    variants,
    price_ht: p.prixHT || p.prix_ht || p.prix || null,
    stock: p.stock ?? null,
    raw_data: p,
  };
}

// ============================================================================
// 5. DATABASE UPSERT IN BATCHES
// ============================================================================
async function upsertProductsBatch(
  products: any[], 
  jobId: string,
  updateProgress: (count: number) => Promise<void>
): Promise<number> {
  const supabase = getSupabaseAdmin();
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`[Sync] Upserting ${products.length} products in batches of ${BATCH_SIZE}...`);
  
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const normalized = batch
      .map(normalizeProduct)
      .filter(p => p.sku && p.sku.length > 0);
    
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
      errorCount += batch.length;
      console.log(`[Sync] Batch ${Math.floor(i/BATCH_SIZE)+1} error: ${error.message}`);
    } else {
      successCount += normalized.length;
    }
    
    // Update progress every 5 batches
    if ((i / BATCH_SIZE) % 5 === 0 || i + BATCH_SIZE >= products.length) {
      await updateProgress(successCount);
      console.log(`[Sync] Progress: ${successCount}/${products.length} (${errorCount} errors)`);
    }
  }
  
  console.log(`[Sync] ✅ Upserted ${successCount} products (${errorCount} errors)`);
  return successCount;
}

// ============================================================================
// MAIN SYNC PROCESS WITH AUTO-RECOVERY
// ============================================================================
async function runSyncProcess(jobId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  let retryCount = 0;
  const maxRetries = 3;
  
  const updateStatus = async (status: string, extra: any = {}) => {
    await supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);
  };
  
  const updateProgress = async (msg: string) => {
    await supabase.from("sync_status").update({ error_message: msg }).eq("id", jobId);
  };
  
  try {
    // Step 1: Authenticate
    await updateStatus("authenticating");
    const token = await authenticate();
    
    // Retry loop for S3 link expiry (auto-recovery)
    while (retryCount < maxRetries) {
      const linkStartTime = Date.now();
      
      try {
        // Step 2: Request new S3 link
        await updateStatus("requesting_catalog", {
          error_message: retryCount > 0 ? `Retry ${retryCount}: nouveau lien S3` : null
        });
        const { link, eta } = await requestCatalogGeneration(token);
        
        // Save link to job
        await supabase.from("sync_status").update({ s3_link: link }).eq("id", jobId);
        
        // Step 3: Wait and poll for file
        await updateStatus("waiting_for_file", { error_message: `ETA: ${eta.toISOString()}` });
        const { ready, expired, size } = await pollS3File(link, eta, linkStartTime, updateProgress);
        
        // Auto-recovery: if expired, get new link
        if (expired) {
          retryCount++;
          console.log(`[Sync] Link expired, retrying (${retryCount}/${maxRetries})`);
          continue;
        }
        
        if (!ready) {
          retryCount++;
          console.log(`[Sync] File not ready, retrying (${retryCount}/${maxRetries})`);
          continue;
        }
        
        // Step 4: Download and parse
        await updateStatus("downloading");
        const products = await downloadAndParseCatalog(link, updateProgress);
        
        if (products.length === 0) {
          throw new Error("Aucun produit dans le catalogue");
        }
        
        // Step 5: Upsert to database
        await updateStatus("syncing", { products_count: 0, error_message: "Import en cours..." });
        const count = await upsertProductsBatch(products, jobId, async (c) => {
          await supabase.from("sync_status").update({ products_count: c }).eq("id", jobId);
        });
        
        // Success!
        await supabase.from("sync_status").update({
          status: "completed",
          products_count: count,
          completed_at: new Date().toISOString(),
          error_message: null
        }).eq("id", jobId);
        
        console.log(`[Sync] ✅ COMPLETED: ${count} products`);
        return;
        
      } catch (innerErr: unknown) {
        const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
        
        // Check if recoverable
        if (msg.includes("403") || msg.includes("expired") || msg.includes("timeout")) {
          retryCount++;
          console.log(`[Sync] Recoverable error, retry ${retryCount}: ${msg}`);
          if (retryCount >= maxRetries) throw new Error(msg);
          continue;
        }
        
        throw innerErr instanceof Error ? innerErr : new Error(msg);
      }
    }
    
    throw new Error(`Max retries (${maxRetries}) atteint`);
    
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Sync] ❌ FAILED:", msg);
    
    await supabase.from("sync_status").update({
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString()
    }).eq("id", jobId);
    
  } finally {
    await releaseAdvisoryLock();
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

    // ========== GET /sync-status ==========
    if (action === "status") {
      const { data: jobs } = await supabase
        .from("sync_status")
        .select("id, status, started_at, completed_at, products_count, error_message, s3_link")
        .order("started_at", { ascending: false })
        .limit(5);
      
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      
      const lastJob = jobs?.[0] || null;
      
      return jsonResponse({
        success: true,
        status: lastJob?.status || "never_synced",
        product_count: productCount || 0,
        last_sync: lastJob ? {
          id: lastJob.id,
          status: lastJob.status,
          started_at: lastJob.started_at,
          completed_at: lastJob.completed_at,
          products_count: lastJob.products_count,
          progress: lastJob.error_message,
        } : null,
        recent_syncs: jobs?.map(j => ({
          id: j.id,
          status: j.status,
          started_at: j.started_at,
          products_count: j.products_count,
        })) || []
      });
    }

    // ========== POST /start - Start sync ==========
    if (action === "start") {
      // Try to acquire lock
      const lockAcquired = await tryAcquireAdvisoryLock();
      
      if (!lockAcquired) {
        // Return existing active job
        const { data: activeJob } = await supabase
          .from("sync_status")
          .select("*")
          .in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"])
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        return jsonResponse({
          success: false,
          message: "Sync already in progress",
          existing_job: activeJob ? {
            id: activeJob.id,
            status: activeJob.status,
            started_at: activeJob.started_at,
            progress: activeJob.error_message,
          } : null
        }, 409);
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
        await releaseAdvisoryLock();
        return jsonResponse({ success: false, message: "Failed to create job" }, 500);
      }
      
      // Start background sync
      const runtime = (globalThis as any).EdgeRuntime;
      if (runtime?.waitUntil) {
        runtime.waitUntil(runSyncProcess(newJob.id));
      } else {
        runSyncProcess(newJob.id); // Fire and forget
      }
      
      return jsonResponse({
        success: true,
        message: "Sync started",
        job_id: newJob.id
      });
    }

    // ========== POST /force-restart ==========
    if (action === "force-restart") {
      // Expire all active jobs
      await supabase.from("sync_status").update({
        status: "expired",
        error_message: "Force restart",
        completed_at: new Date().toISOString()
      }).in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"]);
      
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
        return jsonResponse({ success: false, message: "Failed to create job" }, 500);
      }
      
      // Start background sync
      const runtime = (globalThis as any).EdgeRuntime;
      if (runtime?.waitUntil) {
        runtime.waitUntil(runSyncProcess(newJob.id));
      } else {
        runSyncProcess(newJob.id);
      }
      
      return jsonResponse({
        success: true,
        message: "Force restarted",
        job_id: newJob.id
      });
    }

    return jsonResponse({
      success: false,
      message: "Unknown action. Use: status, start, force-restart"
    }, 400);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Sync] Error:", msg);
    return jsonResponse({ success: false, error: msg }, 500);
  }
});
