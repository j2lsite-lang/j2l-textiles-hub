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

// Config
const PAGE_SIZE = 100; // Keep reasonable to avoid timeouts
const UPSERT_BATCH_SIZE = 200;
const POLL_INTERVAL_MS = 5_000;
const MAX_WAIT_MS = 2 * 60_000;
const MIN_READY_SIZE_BYTES = 100 * 1024;

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

async function toptexGet(url: string, token: string): Promise<{ status: number; text: string }> {
  const apiKey = envTrim("TOPTEX_API_KEY");

  const tryFetch = (headers: Record<string, string>) =>
    fetch(url, {
      headers: {
        "x-api-key": apiKey,
        ...headers,
      },
    });

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

  return { status: r.status, text: txt };
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
  return {
    sku: p.reference || p.sku || "",
    name: p.designation || p.name || "",
    brand: p.marque || p.brand || "",
    category: p.famille || p.category || "",
    description: p.description || "",
    composition: p.composition || "",
    weight: p.poids || p.weight || "",
    price_ht: p.prix_ht != null ? Number(p.prix_ht) : (p.price_ht != null ? Number(p.price_ht) : null),
    images: (p.images || []).map((i: any) => (typeof i === "string" ? i : i?.url || "")),
    colors: (p.couleurs || p.colors || []).map((c: any) => ({
      name: typeof c === "string" ? c : (c.nom || c.name || c),
      code: c.code || "",
    })),
    sizes: p.tailles || p.sizes || [],
    variants: p.declinaisons || p.variants || [],
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
    
    // Step 2: PAGINATION MODE
    if (usePagination) {
      console.log(`[CATSYNC] 📄 Starting PAGINATION mode (page_size=${PAGE_SIZE})`);
      
      await upd("syncing", { error_message: "Fallback pagination - Démarrage..." });
      
      let page = 1;
      let total = 0;
      let batch: any[] = [];
      
      while (true) {
        const pageUrl = `${TOPTEX}/v3/products/all?usage_right=b2b_uniquement&display_prices=1&page_number=${page}&page_size=${PAGE_SIZE}`;
        console.log(`[CATSYNC] Pagination page ${page}: ${pageUrl}`);
        
        const { status: pageStatus, text: pageText } = await toptexGet(pageUrl, token);
        console.log(`[CATSYNC] Page ${page}: status=${pageStatus}, len=${pageText.length}`);
        
        if (pageStatus !== 200) {
          throw new Error(`Pagination page ${page}: HTTP ${pageStatus}`);
        }
        
        const pageParsed = parseProductsResponse(pageText);
        
        // If TopTex returns a link even without result_in_file, that's weird but skip it
        if (pageParsed.kind === "link") {
          console.log(`[CATSYNC] Page ${page} returned a link, skipping to next page`);
          page++;
          continue;
        }
        
        if (pageParsed.kind !== "items" || !pageParsed.items) {
          console.log(`[CATSYNC] Page ${page}: no items (kind=${pageParsed.kind}), stopping.`);
          break;
        }
        
        const items = pageParsed.items;
        if (items.length === 0) {
          console.log(`[CATSYNC] Page ${page}: empty, stopping.`);
          break;
        }
        
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
          
          await supabase.from("sync_status").update({
            products_count: total,
            error_message: `Fallback pagination - Page ${page} - ${total} produits importés`,
          }).eq("id", jobId);
          
          console.log(`[CATSYNC] Imported batch, total=${total}`);
        }
        
        // Stop if last page
        if (items.length < PAGE_SIZE) {
          console.log(`[CATSYNC] Page ${page}: ${items.length} < ${PAGE_SIZE}, last page.`);
          break;
        }
        
        page++;
        await new Promise(r => setTimeout(r, 100)); // Small delay between pages
      }
      
      // Flush remaining batch
      if (batch.length > 0) {
        await upsertBatch(batch);
        total += batch.length;
        console.log(`[CATSYNC] Final batch flushed, total=${total}`);
      }
      
      await supabase.from("sync_status").update({
        status: "completed",
        products_count: total,
        completed_at: new Date().toISOString(),
        finished_in_ms: Date.now() - start,
        error_message: `Import terminé : ${total} produits (${page} pages)`,
      }).eq("id", jobId);
      
      console.log(`✅ [CATSYNC] Completed via pagination: ${total} products, ${page} pages, ${(Date.now() - start) / 1000}s`);
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
