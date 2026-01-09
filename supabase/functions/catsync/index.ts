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
const PAGE_SIZE = 100;
const UPSERT_BATCH_SIZE = 200;
const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 15 * 60_000; // 15 minutes max (TopTex peut être long)
const MIN_READY_SIZE_BYTES = 100 * 1024; // 100KB

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

async function waitForS3File(link: string, jobId: string): Promise<{ size: number; polls: number }> {
  const maxPolls = Math.ceil(MAX_WAIT_MS / POLL_INTERVAL_MS);

  for (let poll = 1; poll <= maxPolls; poll++) {
    console.log(`[CATSYNC] Polling S3 (${poll}/${maxPolls})...`);

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    try {
      const head = await fetch(link, { method: "HEAD" });
      if (head.ok) {
        const size = parseInt(head.headers.get("content-length") || "0");
        console.log(`[CATSYNC] S3 HEAD OK, size=${size}`);

        await supabase.from("sync_status").update({
          s3_poll_count: poll,
          s3_content_length: size,
          error_message: `Fichier prêt (${Math.round(size / 1024)} KB)`,
        }).eq("id", jobId);

        if (size >= MIN_READY_SIZE_BYTES) return { size, polls: poll };
      } else {
        await supabase.from("sync_status").update({
          s3_poll_count: poll,
          error_message: `Génération en cours (${head.status}) (${poll}/${maxPolls})...`,
        }).eq("id", jobId);
      }
    } catch (e: any) {
      console.log(`[CATSYNC] Poll error: ${e?.message || e}`);
    }
  }

  throw new Error(`Fichier S3 non prêt après ${maxPolls} tentatives`);
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

async function syncCatalog(jobId: string) {
  const upd = (status: string, extra: any = {}) =>
    supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);

  const start = Date.now();

  try {
    await upd("authenticating");
    const token = await auth();

    // Try pagination first
    await upd("syncing", { error_message: "Récupération des produits..." });

    let page = 1;
    let total = 0;
    let batch: any[] = [];

    while (true) {
      const url = `${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=0&page_number=${page}&page_size=${PAGE_SIZE}`;
      console.log(`[CATSYNC] Fetch page ${page}: ${url}`);

      const { status, text } = await toptexGet(url, token);
      console.log(`[CATSYNC] Page ${page} response: status=${status}, len=${text.length}, preview=${text.slice(0, 500)}`);
      
      if (status !== 200) {
        console.error(`[CATSYNC] Page fetch failed: ${status} - ${text.slice(0, 400)}`);
        throw new Error(`TopTex products: ${status}`);
      }

      const parsed = parseProductsResponse(text);
      console.log(`[CATSYNC] Parsed kind: ${parsed.kind}`);

      if (parsed.kind === "link") {
        // Fallback to S3 stream
        await supabase.from("sync_status").update({
          status: "waiting_for_file",
          s3_link: parsed.link,
          eta: parsed.eta || null,
          error_message: `TopTex fournit un fichier (ETA: ${parsed.eta || "?"})...`,
        }).eq("id", jobId);

        await waitForS3File(parsed.link, jobId);

        await upd("downloading", { error_message: "Téléchargement du fichier..." });
        const resp = await fetch(parsed.link);
        if (!resp.ok) throw new Error(`Download: ${resp.status}`);

        await upd("syncing", { error_message: "Import en streaming..." });
        const count = await streamParseAndUpsert(resp, jobId);
        total = count;
        break;
      }

      if (parsed.kind === "unknown") {
        console.error(`[CATSYNC] Unknown response: ${parsed.rawPreview}`);
        throw new Error("TopTex: réponse inconnue");
      }

      // items
      const items = parsed.items || [];
      if (items.length === 0) {
        console.log(`[CATSYNC] No items on page ${page}, stop.`);
        break;
      }

      for (const p of items) {
        const n = normalize(p);
        if (n.sku) batch.push({ ...n, synced_at: new Date().toISOString() });
      }

      if (batch.length >= UPSERT_BATCH_SIZE) {
        await upsertBatch(batch);
        total += batch.length;
        batch = [];

        await supabase.from("sync_status").update({
          products_count: total,
          error_message: `Page ${page} - ${total} produits...`,
        }).eq("id", jobId);
      }

      // stop condition
      if (items.length < PAGE_SIZE) {
        console.log(`[CATSYNC] Page ${page} smaller than page_size (${items.length}), stop.`);
        break;
      }

      page++;
      // small delay
      await new Promise((r) => setTimeout(r, 150));
    }

    if (batch.length) {
      await upsertBatch(batch);
      total += batch.length;
    }

    await supabase.from("sync_status").update({
      status: "completed",
      products_count: total,
      completed_at: new Date().toISOString(),
      finished_in_ms: Date.now() - start,
      error_message: null,
    }).eq("id", jobId);

    console.log(`✅ [CATSYNC] Completed: ${total} products in ${(Date.now() - start) / 1000}s`);
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
