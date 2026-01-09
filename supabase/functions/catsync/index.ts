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

// Config - optimized for reliability
const PAGE_SIZE = 20; // Smaller page size to avoid 504 timeouts
const UPSERT_BATCH_SIZE = 50;
const MAX_RETRIES = 15; // More retries for robustness
const LONG_PAUSE_SECONDS = 60; // Long pause after multiple failures
const HEARTBEAT_INTERVAL_MS = 10_000; // Update heartbeat every 10s
const MAX_IDLE_MS = 5 * 60_000; // Consider job stale if no heartbeat for 5min

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
    console.error(`[CATSYNC] Auth failed: ${r.status} - ${txt.slice(0, 500)}`);
    throw new Error(`Auth: ${r.status} - ${txt.slice(0, 200)}`);
  }

  let d: any;
  try {
    d = JSON.parse(txt);
  } catch {
    throw new Error("Auth: invalid JSON response");
  }

  const token = (d?.token ?? d?.jeton ?? d?.access_token ?? d?.accessToken ?? "").trim();
  if (!token) throw new Error("Auth: missing token in response");

  console.log(`[CATSYNC] Auth OK (token_len=${token.length})`);
  return token;
}

async function toptexGet(url: string, token: string, retries = MAX_RETRIES): Promise<{ status: number; text: string }> {
  const apiKey = envTrim("TOPTEX_API_KEY");

  const tryFetch = (headers: Record<string, string>) =>
    fetch(url, {
      headers: {
        "x-api-key": apiKey,
        ...headers,
      },
    });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 1) header "x-toptex-authorization": token
      let r = await tryFetch({ "x-toptex-authorization": token });
      let txt = await r.text();

      // 2) retries with Bearer forms if unauthorized
      if (!r.ok && (r.status === 401 || r.status === 403)) {
        r = await tryFetch({ "x-toptex-authorization": `Bearer ${token}` });
        txt = await r.text();

        if (!r.ok && (r.status === 401 || r.status === 403)) {
          r = await tryFetch({ Authorization: `Bearer ${token}` });
          txt = await r.text();
        }
      }

      // Retry on timeout/server errors with exponential backoff
      if (r.status === 504 || r.status === 502 || r.status === 503 || r.status === 500) {
        if (attempt < retries) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s, 60s (capped)
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 60000);
          console.log(`[CATSYNC] HTTP ${r.status} on attempt ${attempt}/${retries}, retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
      }

      return { status: r.status, text: txt };
    } catch (fetchError: any) {
      // Network errors - retry with backoff
      if (attempt < retries) {
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 60000);
        console.log(`[CATSYNC] Network error on attempt ${attempt}/${retries}: ${fetchError?.message}, retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      return { status: 0, text: `Network error: ${fetchError?.message}` };
    }
  }

  return { status: 504, text: `Max retries (${retries}) exceeded` };
}

type PageResponse =
  | { kind: "items"; items: any[]; meta?: Record<string, any> }
  | { kind: "link"; link: string; eta?: string }
  | { kind: "unknown"; rawPreview: string };

function parseProductsResponse(txt: string): PageResponse {
  let data: any;
  try {
    data = JSON.parse(txt);
  } catch {
    return { kind: "unknown", rawPreview: txt.slice(0, 500) };
  }

  if (data && typeof data === "object" && typeof data.link === "string") {
    return {
      kind: "link",
      link: data.link,
      eta: data.estimated_time_of_arrival || data.eta,
    };
  }

  if (Array.isArray(data)) return { kind: "items", items: data };

  const items = data?.items || data?.products || data?.results || data?.data;
  if (Array.isArray(items)) return { kind: "items", items, meta: data };

  return { kind: "unknown", rawPreview: JSON.stringify(data).slice(0, 500) };
}

function normalize(p: any): any {
  // TopTex uses catalogReference as SKU, designation for name in multiple languages
  const sku = p.catalogReference || p.reference || p.sku || "";
  const designation = p.designation || {};
  const name = typeof designation === "string" ? designation : (designation.fr || designation.en || p.name || sku);
  
  // Extract first image from colors packshots
  const images: string[] = [];
  if (Array.isArray(p.colors)) {
    for (const c of p.colors) {
      if (c.packshots) {
        for (const key of Object.keys(c.packshots)) {
          const ps = c.packshots[key];
          if (ps?.url_packshot) images.push(ps.url_packshot);
          else if (ps?.url) images.push(ps.url);
        }
      }
    }
  }
  
  // Extract colors with hex codes
  const colors = (p.colors || []).map((c: any) => {
    const colorName = c.colors?.fr || c.colors?.en || c.name || "";
    const hexCode = c.colorsHexa?.[0] ? `#${c.colorsHexa[0]}` : "";
    return { name: colorName, code: hexCode };
  });
  
  return {
    sku,
    name,
    brand: p.brand || p.marque || "",
    category: p.family?.fr || p.family?.en || p.famille || p.category || "",
    description: typeof p.description === "object" ? (p.description?.fr || p.description?.en || "") : (p.description || ""),
    composition: typeof p.composition === "object" ? (p.composition?.fr || p.composition?.en || "") : (p.composition || ""),
    weight: p.averageWeight || p.poids || p.weight || "",
    price_ht: null, // Not available without display_prices
    images: images.slice(0, 10),
    colors,
    sizes: [],
    variants: [],
    raw_data: p,
  };
}

async function upsertBatch(rows: any[]) {
  if (!rows.length) return;
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "sku" });
  if (error) throw new Error(`DB upsert: ${error.message}`);
}

/**
 * Update heartbeat and progress - called frequently to show the job is still alive
 */
async function updateHeartbeat(jobId: string, page: number, total: number, message: string, retryAttempt = 0) {
  await supabase.from("sync_status").update({
    heartbeat_at: new Date().toISOString(),
    current_page: page,
    products_count: total,
    page_retry_attempt: retryAttempt,
    error_message: message,
  }).eq("id", jobId);
}

/**
 * Mark a page as successfully completed
 */
async function markPageSuccess(jobId: string, page: number, total: number) {
  await supabase.from("sync_status").update({
    heartbeat_at: new Date().toISOString(),
    current_page: page + 1, // Next page to fetch
    last_successful_page: page,
    products_count: total,
    page_retry_attempt: 0,
    error_message: `Page ${page} OK - ${total} produits`,
  }).eq("id", jobId);
}

/**
 * Check if there's an existing syncing job that might have stalled
 * If so, resume from where it left off
 */
async function findResumableJob(): Promise<{ id: string; lastSuccessfulPage: number; productsCount: number } | null> {
  const { data: jobs } = await supabase
    .from("sync_status")
    .select("id, status, heartbeat_at, last_successful_page, products_count, current_page")
    .eq("status", "syncing")
    .order("started_at", { ascending: false })
    .limit(1);

  if (!jobs || jobs.length === 0) return null;

  const job = jobs[0];
  const heartbeat = new Date(job.heartbeat_at).getTime();
  const now = Date.now();

  // Job is stale if no heartbeat for MAX_IDLE_MS
  if (now - heartbeat > MAX_IDLE_MS) {
    console.log(`[CATSYNC] Found stale job ${job.id} - last heartbeat ${Math.round((now - heartbeat) / 1000)}s ago`);
    console.log(`[CATSYNC] Resuming from page ${job.last_successful_page + 1} with ${job.products_count} products`);
    return {
      id: job.id,
      lastSuccessfulPage: job.last_successful_page || 0,
      productsCount: job.products_count || 0,
    };
  }

  // Job is still running
  console.log(`[CATSYNC] Job ${job.id} is still active (heartbeat ${Math.round((now - heartbeat) / 1000)}s ago)`);
  return null;
}

/**
 * Main sync function with auto-resume capability
 */
async function syncCatalog(jobId: string, startPage: number = 1, startTotal: number = 0) {
  const upd = (status: string, extra: any = {}) =>
    supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);

  const start = Date.now();

  try {
    await upd("authenticating");
    const token = await auth();

    console.log(`[CATSYNC] 📄 Starting PAGINATION mode from page ${startPage} (already have ${startTotal} products)`);
    
    await upd("syncing", { 
      error_message: `Pagination - Démarrage page ${startPage}...`,
      current_page: startPage,
      last_successful_page: startPage > 1 ? startPage - 1 : 0,
      products_count: startTotal,
    });
    
    let page = startPage;
    let total = startTotal;
    let batch: any[] = [];
    let pageRetries = 0;
    let longPauseCount = 0;
    let emptyPagesInRow = 0;
    const MAX_EMPTY_PAGES = 3; // Stop after 3 consecutive empty pages
    const MAX_RETRIES_BEFORE_PAUSE = 10; // After 10 failures, take a long pause
    const MAX_LONG_PAUSES = 10; // More pauses before giving up
    
    let lastHeartbeat = Date.now();
    
    // PAGINATION LOOP - NEVER SKIP PAGES
    while (true) {
      // Update heartbeat regularly
      if (Date.now() - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
        await updateHeartbeat(jobId, page, total + batch.length, `Page ${page} - ${total + batch.length} produits`, pageRetries);
        lastHeartbeat = Date.now();
      }
      
      const pageUrl = `${TOPTEX}/v3/products/all?usage_right=b2b_uniquement&page_number=${page}&page_size=${PAGE_SIZE}`;
      console.log(`[CATSYNC] 📖 Page ${page}: fetching... (retries=${pageRetries}, longPauses=${longPauseCount}, total=${total})`);
      
      const { status: pageStatus, text: pageText } = await toptexGet(pageUrl, token);
      console.log(`[CATSYNC] Page ${page}: status=${pageStatus}, len=${pageText.length}`);
      
      // Handle errors - NEVER SKIP, always retry
      if (pageStatus !== 200) {
        pageRetries++;
        console.log(`[CATSYNC] ⚠️ Page ${page} error (retry ${pageRetries}): HTTP ${pageStatus}`);
        
        // Update status with retry info
        await updateHeartbeat(jobId, page, total + batch.length, `Page ${page} - Erreur HTTP ${pageStatus} - Tentative ${pageRetries}/${MAX_RETRIES_BEFORE_PAUSE}`, pageRetries);
        
        if (pageRetries >= MAX_RETRIES_BEFORE_PAUSE) {
          longPauseCount++;
          
          if (longPauseCount > MAX_LONG_PAUSES) {
            // After many long pauses, there's a serious issue
            // Save state properly so we can resume later
            console.log(`[CATSYNC] ⏸️ Page ${page}: ${longPauseCount} long pauses. Saving state for later resume.`);
            
            // Flush any remaining batch before saving state
            if (batch.length > 0) {
              await upsertBatch(batch);
              total += batch.length;
              batch = [];
            }
            
            await supabase.from("sync_status").update({
              status: "paused",
              error_message: `Pause page ${page} après ${longPauseCount} tentatives. ${total} produits. Relancez pour reprendre.`,
              products_count: total,
              current_page: page,
              last_successful_page: page - 1,
              heartbeat_at: new Date().toISOString(),
            }).eq("id", jobId);
            
            return; // Exit - can be resumed later
          }
          
          // Take a long pause (60s) then reset retry counter and try again
          console.log(`[CATSYNC] ⏸️ Page ${page}: ${pageRetries} échecs. Pause longue ${LONG_PAUSE_SECONDS}s (pause #${longPauseCount})...`);
          
          await supabase.from("sync_status").update({
            error_message: `Page ${page} - Pause ${LONG_PAUSE_SECONDS}s (#${longPauseCount}/${MAX_LONG_PAUSES}) - ${total + batch.length} produits`,
            heartbeat_at: new Date().toISOString(),
          }).eq("id", jobId);
          
          await new Promise(r => setTimeout(r, LONG_PAUSE_SECONDS * 1000));
          pageRetries = 0; // Reset retry counter after long pause
          lastHeartbeat = Date.now();
          continue; // Retry same page
        }
        
        // Short exponential backoff: 2s, 4s, 8s, 16s, 30s (capped)
        const delay = Math.min(2000 * Math.pow(2, pageRetries - 1), 30000);
        console.log(`[CATSYNC] Retrying page ${page} in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue; // Retry same page
      }
      
      // Success - reset all error counters
      pageRetries = 0;
      longPauseCount = 0;
      
      const pageParsed = parseProductsResponse(pageText);
      
      // If TopTex returns a link, skip to next page
      if (pageParsed.kind === "link") {
        console.log(`[CATSYNC] Page ${page} returned a link, skipping to next page`);
        await markPageSuccess(jobId, page, total + batch.length);
        page++;
        continue;
      }
      
      if (pageParsed.kind !== "items" || !pageParsed.items) {
        console.log(`[CATSYNC] Page ${page}: no items (kind=${pageParsed.kind})`);
        emptyPagesInRow++;
        if (emptyPagesInRow >= MAX_EMPTY_PAGES) {
          console.log(`[CATSYNC] ${MAX_EMPTY_PAGES} empty pages in a row, stopping.`);
          break;
        }
        await markPageSuccess(jobId, page, total + batch.length);
        page++;
        continue;
      }
      
      const items = pageParsed.items;
      if (items.length === 0) {
        console.log(`[CATSYNC] Page ${page}: empty array`);
        emptyPagesInRow++;
        if (emptyPagesInRow >= MAX_EMPTY_PAGES) {
          console.log(`[CATSYNC] ${MAX_EMPTY_PAGES} empty pages in a row, stopping.`);
          break;
        }
        await markPageSuccess(jobId, page, total + batch.length);
        page++;
        continue;
      }
      
      // Reset empty counter on success
      emptyPagesInRow = 0;
      
      // Normalize and batch
      for (const p of items) {
        const n = normalize(p);
        if (n.sku) batch.push({ ...n, synced_at: new Date().toISOString() });
      }
      
      // Upsert when batch is full
      if (batch.length >= UPSERT_BATCH_SIZE) {
        await upsertBatch(batch);
        total += batch.length;
        batch = [];
        console.log(`[CATSYNC] ✓ Imported batch, total=${total}`);
      }
      
      // Mark page as successful
      await markPageSuccess(jobId, page, total + batch.length);
      lastHeartbeat = Date.now();
      
      // Stop if last page (partial page)
      if (items.length < PAGE_SIZE) {
        console.log(`[CATSYNC] Page ${page}: ${items.length} < ${PAGE_SIZE}, last page reached.`);
        break;
      }
      
      page++;
      await new Promise(r => setTimeout(r, 300)); // Small delay between pages
    }
    
    // Flush remaining batch
    if (batch.length > 0) {
      await upsertBatch(batch);
      total += batch.length;
      console.log(`[CATSYNC] ✓ Final batch flushed, total=${total}`);
    }
    
    const summary = `✅ Import terminé : ${total} produits (${page} pages)`;
    
    await supabase.from("sync_status").update({
      status: "completed",
      products_count: total,
      completed_at: new Date().toISOString(),
      finished_in_ms: Date.now() - start,
      error_message: summary,
      current_page: page,
      last_successful_page: page,
    }).eq("id", jobId);
    
    console.log(`✅ [CATSYNC] Completed: ${total} products, ${page} pages, ${(Date.now() - start) / 1000}s`);
    
  } catch (e: any) {
    console.error("[CATSYNC] Error:", e);
    await supabase.from("sync_status").update({
      status: "failed",
      error_message: e?.message || String(e),
      completed_at: new Date().toISOString(),
      finished_in_ms: Date.now() - start,
    }).eq("id", jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let action = new URL(req.url).searchParams.get("action");
  let resumeFromPage: number | undefined;
  
  if (!action && req.method === "POST") {
    try {
      const body = await req.json();
      action = body?.action;
      resumeFromPage = body?.resume_from_page;
    } catch {
      // ignore
    }
  }
  action = action || "status";

  if (action === "status") {
    const { data: jobs } = await supabase
      .from("sync_status")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5);

    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    return new Response(
      JSON.stringify({
        status: jobs?.[0]?.status || "never",
        product_count_db: count,
        last_sync: jobs?.[0],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (action === "start" || action === "force-restart" || action === "resume") {
    // Check for resumable stale job first
    const resumable = await findResumableJob();
    
    if (action === "resume" && resumable) {
      // Resume the stale job
      console.log(`[CATSYNC] Resuming job ${resumable.id} from page ${resumable.lastSuccessfulPage + 1}`);
      
      ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(
        syncCatalog(resumable.id, resumable.lastSuccessfulPage + 1, resumable.productsCount)
      );
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          job_id: resumable.id, 
          resumed: true,
          resume_from_page: resumable.lastSuccessfulPage + 1,
          existing_products: resumable.productsCount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    
    if (action === "force-restart" || action === "start") {
      // Cancel any existing running jobs
      await supabase.from("sync_status").update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
        error_message: "Annulé - nouveau job démarré",
      }).in("status", [
        "started",
        "authenticating",
        "requesting_catalog",
        "waiting_for_file",
        "downloading",
        "syncing",
        "paused",
      ]);
    }

    // Create new job - optionally start from a specific page
    const startPage = resumeFromPage || 1;
    
    const { data: job } = await supabase
      .from("sync_status")
      .insert({ 
        sync_type: "catalog_auto", 
        status: "started",
        current_page: startPage,
        last_successful_page: startPage > 1 ? startPage - 1 : 0,
        products_count: 0,
      })
      .select()
      .single();

    if (!job) {
      return new Response(JSON.stringify({ error: "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(
      syncCatalog(job.id, startPage, 0)
    );

    return new Response(
      JSON.stringify({ success: true, job_id: job.id, start_page: startPage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
