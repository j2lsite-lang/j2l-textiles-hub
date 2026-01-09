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
const PAGE_SIZE = 30; // Small page size to avoid 504 timeouts
const UPSERT_BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 5_000;
const MAX_WAIT_MS = 2 * 60_000;
const MIN_READY_SIZE_BYTES = 100 * 1024;
const MAX_RETRIES = 10; // More retries with longer backoff
const LONG_PAUSE_SECONDS = 60; // Long pause after multiple failures on same page

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
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s, 64s... capped at 60s
          const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
          console.log(`[CATSYNC] HTTP ${r.status} on attempt ${attempt}/${retries}, retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
      }

      return { status: r.status, text: txt };
    } catch (fetchError: any) {
      // Network errors - retry with backoff
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
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
 * Quick probe of S3 file. Returns immediately with result:
 * - { ready: true, size } if file is large enough
 * - { ready: false, reason, fallback: true } if file is empty/tiny (should fallback to pagination)
 * - { ready: false, reason, fallback: false } if still generating (can retry)
 */
async function probeS3File(link: string): Promise<{ ready: boolean; size: number; reason: string; fallback: boolean; content?: string }> {
  try {
    const probe = await fetch(link, {
      method: "GET",
      headers: { Range: "bytes=0-2047" },
    });

    const ok = probe.ok || probe.status === 206 || probe.status === 416;
    const cr = probe.headers.get("content-range") || "";
    const m = cr.match(/\/(\d+)$/);
    const sizeFromCR = m ? parseInt(m[1], 10) : 0;
    const sizeFromCL = parseInt(probe.headers.get("content-length") || "0", 10);
    const size = Math.max(sizeFromCR, sizeFromCL);

    let content = "";
    try {
      content = await probe.text();
    } catch {}

    console.log(`[CATSYNC] S3 probe: status=${probe.status}, size=${size}, content='${content.slice(0, 100)}'`);

    if (!ok) {
      return { ready: false, size: 0, reason: `HTTP ${probe.status}`, fallback: false };
    }

    // File is ready and large enough
    if (size >= MIN_READY_SIZE_BYTES) {
      return { ready: true, size, reason: "OK", fallback: false, content };
    }

    // File is tiny - IMMEDIATE FALLBACK
    if (size <= 10) {
      const trimmed = content.trim();
      if (trimmed === "[]" || trimmed === "" || trimmed === "OK" || trimmed === "ok") {
        console.log(`[CATSYNC] ⚠️ File is empty/placeholder (${size} bytes, content='${trimmed}'). IMMEDIATE FALLBACK.`);
        return { ready: false, size, reason: `Fichier vide (${trimmed || "empty"})`, fallback: true, content };
      }
    }

    // File exists but is small - might still be generating
    return { ready: false, size, reason: `Fichier en cours (${size} bytes)`, fallback: false, content };

  } catch (e: any) {
    console.log(`[CATSYNC] S3 probe error: ${e?.message || e}`);
    return { ready: false, size: 0, reason: e?.message || "Probe error", fallback: false };
  }
}


// Parse JSON array stream and upsert progressively
async function streamParseAndUpsert(response: Response, jobId: string): Promise<number> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  let totalCount = 0;
  let batch: any[] = [];

  let inArray = false;
  let depth = 0;
  let objectBuffer = "";
  let objectStart = false;

  console.log("[CATSYNC] Streaming parse start...");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let i = 0;
    while (i < buffer.length) {
      const ch = buffer[i];

      if (!inArray && ch === "[") {
        inArray = true;
        i++;
        continue;
      }

      if (inArray) {
        if (ch === "{") {
          if (depth === 0) objectStart = true;
          depth++;
          objectBuffer += ch;
        } else if (ch === "}") {
          depth--;
          objectBuffer += ch;

          if (depth === 0 && objectStart) {
            try {
              const p = JSON.parse(objectBuffer);
              const n = normalize(p);
              if (n.sku) batch.push({ ...n, synced_at: new Date().toISOString() });

              if (batch.length >= UPSERT_BATCH_SIZE) {
                await upsertBatch(batch);
                totalCount += batch.length;
                batch = [];

                if (totalCount % 500 === 0) {
                  await supabase.from("sync_status").update({
                    products_count: totalCount,
                    error_message: `${totalCount} produits synchronisés...`,
                  }).eq("id", jobId);
                }
              }
            } catch {
              // ignore malformed object
            }

            objectBuffer = "";
            objectStart = false;
          }
        } else if (depth > 0) {
          objectBuffer += ch;
        }
      }

      i++;
    }

    buffer = buffer.slice(i);
  }

  if (batch.length) {
    await upsertBatch(batch);
    totalCount += batch.length;
  }

  console.log(`[CATSYNC] Streaming parse done: total=${totalCount}`);
  return totalCount;
}

/**
 * Request a new export file from TopTex API.
 * Returns the S3 link and ETA.
 */
async function requestGenerateExport(token: string, jobId: string): Promise<{ link: string; eta?: string }> {
  const url = `${TOPTEX}/v3/products/all?usage_right=b2b_uniquement&display_prices=1&result_in_file=1`;
  
  console.log(`[CATSYNC] Requesting generate export: ${url}`);
  
  const { status, text } = await toptexGet(url, token);
  
  console.log(`[CATSYNC] Generate export response: status=${status}, len=${text.length}, body=${text.slice(0, 500)}`);
  
  await supabase.from("sync_status").update({
    error_message: `Generate export: HTTP ${status} - ${text.slice(0, 200)}`,
  }).eq("id", jobId);
  
  if (status !== 200) {
    throw new Error(`Generate export failed: HTTP ${status} - ${text.slice(0, 300)}`);
  }
  
  const parsed = parseProductsResponse(text);
  
  if (parsed.kind === "link") {
    console.log(`[CATSYNC] Got S3 link: ${parsed.link.slice(0, 100)}... ETA: ${parsed.eta || "?"}`);
    return { link: parsed.link, eta: parsed.eta };
  }
  
  if (parsed.kind === "items" && parsed.items.length > 0) {
    // TopTex returned items directly instead of a link - unexpected but handle it
    throw new Error("TopTex returned items directly instead of file link");
  }
  
  throw new Error(`Generate export: unexpected response kind=${parsed.kind}`);
}

/**
 * Main sync function - simplified logic:
 * 1. Try to get file export
 * 2. Probe S3 once - if empty/tiny, IMMEDIATELY fallback to pagination
 * 3. Pagination: loop pages until empty
 */
async function syncCatalog(jobId: string) {
  const upd = (status: string, extra: any = {}) =>
    supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);

  const start = Date.now();

  try {
    await upd("authenticating");
    const token = await auth();

    // Step 1: Request file export to check if TopTex gives us a file or items directly
    await upd("syncing", { error_message: "Demande export TopTex..." });
    
    const firstUrl = `${TOPTEX}/v3/products/all?usage_right=b2b_uniquement&display_prices=1&result_in_file=1`;
    console.log(`[CATSYNC] Requesting export: ${firstUrl}`);
    
    const { status: firstStatus, text: firstText } = await toptexGet(firstUrl, token);
    console.log(`[CATSYNC] Export response: status=${firstStatus}, len=${firstText.length}`);
    
    if (firstStatus !== 200) {
      throw new Error(`TopTex export request: HTTP ${firstStatus}`);
    }
    
    const firstParsed = parseProductsResponse(firstText);
    let usePagination = false;
    
    if (firstParsed.kind === "link") {
      // TopTex gave us a file link - probe it ONCE
      console.log(`[CATSYNC] Got S3 link, probing: ${firstParsed.link.slice(0, 80)}...`);
      
      await upd("waiting_for_file", { 
        s3_link: firstParsed.link,
        error_message: "Vérification du fichier S3..." 
      });
      
      // Wait a moment for file to be created
      await new Promise(r => setTimeout(r, 3000));
      
      const probe = await probeS3File(firstParsed.link);
      
      await supabase.from("sync_status").update({
        s3_poll_count: 1,
        s3_content_length: probe.size,
        error_message: `Probe: ${probe.reason}`,
      }).eq("id", jobId);
      
      if (probe.fallback) {
        // File is empty - IMMEDIATE FALLBACK
        console.log(`[CATSYNC] ⚠️ S3 file empty (${probe.reason}). Switching to pagination mode.`);
        usePagination = true;
      } else if (probe.ready) {
        // File is ready - download and import
        console.log(`[CATSYNC] File ready (${probe.size} bytes), downloading...`);
        await upd("downloading", { error_message: "Téléchargement du fichier..." });
        
        const resp = await fetch(firstParsed.link);
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        
        await upd("syncing", { error_message: "Import en streaming..." });
        const count = await streamParseAndUpsert(resp, jobId);
        
        await supabase.from("sync_status").update({
          status: "completed",
          products_count: count,
          completed_at: new Date().toISOString(),
          finished_in_ms: Date.now() - start,
          error_message: `Import terminé : ${count} produits`,
        }).eq("id", jobId);
        
        console.log(`✅ [CATSYNC] Completed via file: ${count} products in ${(Date.now() - start) / 1000}s`);
        return;
      } else {
        // File not ready but not empty - might be generating, try pagination anyway
        console.log(`[CATSYNC] File not ready (${probe.reason}). Switching to pagination.`);
        usePagination = true;
      }
    } else if (firstParsed.kind === "items" && firstParsed.items && firstParsed.items.length > 0) {
      // TopTex returned items directly - use pagination
      console.log(`[CATSYNC] TopTex returned items directly. Using pagination.`);
      usePagination = true;
    } else {
      // Unknown or empty response - try pagination
      console.log(`[CATSYNC] Unknown response kind: ${firstParsed.kind}. Trying pagination.`);
      usePagination = true;
    }
    
    // Step 2: PAGINATION MODE - iterate through ALL pages until empty
    // NEVER SKIP PAGES - retry indefinitely with pauses to ensure complete import
    if (usePagination) {
      console.log(`[CATSYNC] 📄 Starting PAGINATION mode (page_size=${PAGE_SIZE})`);
      
      await upd("syncing", { error_message: "Pagination - Démarrage..." });
      
      let page = 1;
      let total = 0;
      let batch: any[] = [];
      let pageRetries = 0;
      let longPauseCount = 0;
      let emptyPagesInRow = 0;
      const MAX_EMPTY_PAGES = 3; // Stop after 3 consecutive empty pages
      const MAX_RETRIES_BEFORE_PAUSE = 10; // After 10 failures, take a long pause
      const MAX_LONG_PAUSES = 5; // After 5 long pauses on same page, something is very wrong
      
      // PAGINATION LOOP - NEVER SKIP PAGES
      while (true) {
        const pageUrl = `${TOPTEX}/v3/products/all?usage_right=b2b_uniquement&page_number=${page}&page_size=${PAGE_SIZE}`;
        console.log(`[CATSYNC] 📖 Page ${page}: fetching... (retries=${pageRetries}, longPauses=${longPauseCount})`);
        
        const { status: pageStatus, text: pageText } = await toptexGet(pageUrl, token);
        console.log(`[CATSYNC] Page ${page}: status=${pageStatus}, len=${pageText.length}`);
        
        // Handle errors - NEVER SKIP, always retry
        if (pageStatus !== 200) {
          pageRetries++;
          console.log(`[CATSYNC] ⚠️ Page ${page} error (retry ${pageRetries}): HTTP ${pageStatus}`);
          
          // Update status with retry info
          await supabase.from("sync_status").update({
            error_message: `Page ${page} - Erreur HTTP ${pageStatus} - Tentative ${pageRetries} - ${total} produits`,
          }).eq("id", jobId);
          
          if (pageRetries >= MAX_RETRIES_BEFORE_PAUSE) {
            longPauseCount++;
            
            if (longPauseCount > MAX_LONG_PAUSES) {
              // After 5 long pauses (50+ retries), there's a serious issue
              // Save state and stop - user can restart from this page
              console.log(`[CATSYNC] ❌ Page ${page}: ${longPauseCount} long pauses (${pageRetries * longPauseCount}+ retries). Stopping to avoid infinite loop.`);
              
              await supabase.from("sync_status").update({
                status: "failed",
                error_message: `Échec page ${page} après ${longPauseCount} pauses longues. ${total} produits importés. Relancez pour reprendre.`,
                products_count: total,
                completed_at: new Date().toISOString(),
                finished_in_ms: Date.now() - start,
              }).eq("id", jobId);
              
              return; // Exit completely
            }
            
            // Take a long pause (60s) then reset retry counter and try again
            console.log(`[CATSYNC] ⏸️ Page ${page}: ${pageRetries} échecs. Pause longue ${LONG_PAUSE_SECONDS}s (pause #${longPauseCount})...`);
            
            await supabase.from("sync_status").update({
              error_message: `Page ${page} - Pause ${LONG_PAUSE_SECONDS}s après ${pageRetries} échecs (pause #${longPauseCount}) - ${total} produits`,
            }).eq("id", jobId);
            
            await new Promise(r => setTimeout(r, LONG_PAUSE_SECONDS * 1000));
            pageRetries = 0; // Reset retry counter after long pause
            continue; // Retry same page
          }
          
          // Short exponential backoff: 2s, 4s, 8s, 16s, 32s... capped at 30s
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
        
        // Update progress after each page
        await supabase.from("sync_status").update({
          products_count: total + batch.length,
          error_message: `Pagination - Page ${page} - ${total + batch.length} produits importés`,
        }).eq("id", jobId);
        
        // Stop if last page (partial page)
        if (items.length < PAGE_SIZE) {
          console.log(`[CATSYNC] Page ${page}: ${items.length} < ${PAGE_SIZE}, last page reached.`);
          break;
        }
        
        page++;
        await new Promise(r => setTimeout(r, 200)); // Small delay between pages
      }
      
      // Flush remaining batch
      if (batch.length > 0) {
        await upsertBatch(batch);
        total += batch.length;
        console.log(`[CATSYNC] ✓ Final batch flushed, total=${total}`);
      }
      
      const summary = `Import terminé : ${total} produits (${page} pages)`;
      
      await supabase.from("sync_status").update({
        status: "completed",
        products_count: total,
        completed_at: new Date().toISOString(),
        finished_in_ms: Date.now() - start,
        error_message: summary,
      }).eq("id", jobId);
      
      console.log(`✅ [CATSYNC] Completed: ${total} products, ${page} pages, ${(Date.now() - start) / 1000}s`);
    }
    
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
  if (!action && req.method === "POST") {
    try {
      const body = await req.json();
      action = body?.action;
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

  if (action === "start" || action === "force-restart") {
    if (action === "force-restart") {
      await supabase.from("sync_status").update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
      }).in("status", [
        "started",
        "authenticating",
        "requesting_catalog",
        "waiting_for_file",
        "downloading",
        "syncing",
      ]);
    }

    const { data: job } = await supabase
      .from("sync_status")
      .insert({ sync_type: "catalog_auto", status: "started" })
      .select()
      .single();

    if (!job) {
      return new Response(JSON.stringify({ error: "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(syncCatalog(job.id));

    return new Response(
      JSON.stringify({ success: true, job_id: job.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
