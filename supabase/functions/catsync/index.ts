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
const BATCH_SIZE = 100;
const MAX_WAIT_TIME = 300000; // 5 minutes max
const POLL_INTERVAL = 10000; // 10 secondes

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
    console.error(`[CATSYNC] Auth failed: ${r.status} - ${txt.slice(0, 500)} (apiKey=${mask(apiKey)})`);
    throw new Error(`Auth: ${r.status} - ${txt.slice(0, 200)}`);
  }

  let d: any;
  try {
    d = JSON.parse(txt);
  } catch {
    throw new Error("Auth: invalid JSON response");
  }

  const token = (d?.token ?? d?.jeton ?? d?.access_token ?? d?.accessToken ?? "").trim();
  if (!token) {
    throw new Error("Auth: missing token in response");
  }

  console.log(`[CATSYNC] Auth successful (token_len=${token.length})`);
  return token;
}

// Demander le catalogue et récupérer le lien S3
async function requestCatalog(token: string): Promise<{ link: string; eta: string }> {
  const apiKey = envTrim("TOPTEX_API_KEY");
  // L'API force result_in_file=1 même si on met 0
  const url = `${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1`;

  console.log(`[CATSYNC] Requesting catalog...`);

  const r = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "x-toptex-authorization": token,
    },
  });

  const txt = await r.text();
  console.log(`[CATSYNC] Catalog response status: ${r.status}, preview: ${txt.slice(0, 300)}`);

  if (!r.ok) {
    throw new Error(`Catalog request failed: ${r.status}`);
  }

  const data = JSON.parse(txt);
  
  if (data.link) {
    console.log(`[CATSYNC] Got S3 link, ETA: ${data.estimated_time_of_arrival}`);
    return { link: data.link, eta: data.estimated_time_of_arrival || "~2min" };
  }
  
  throw new Error("No link in response");
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

// Parse et upsert en streaming
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
  
  console.log("[CATSYNC] Starting stream parsing...");
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    let i = 0;
    while (i < buffer.length) {
      const char = buffer[i];
      
      if (!inArray && char === '[') {
        inArray = true;
        i++;
        continue;
      }
      
      if (inArray) {
        if (char === '{') {
          if (depth === 0) objectStart = true;
          depth++;
          objectBuffer += char;
        } else if (char === '}') {
          depth--;
          objectBuffer += char;
          
          if (depth === 0 && objectStart) {
            try {
              const product = JSON.parse(objectBuffer);
              const normalized = normalize(product);
              if (normalized.sku) {
                batch.push({ ...normalized, synced_at: new Date().toISOString() });
              }
              
              if (batch.length >= BATCH_SIZE) {
                const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
                if (!error) {
                  totalCount += batch.length;
                  if (totalCount % 500 === 0) {
                    console.log(`[CATSYNC] Progress: ${totalCount} products`);
                    await supabase.from("sync_status").update({ 
                      error_message: `${totalCount} produits...`,
                      products_count: totalCount
                    }).eq("id", jobId);
                  }
                }
                batch = [];
              }
            } catch (e) {
              // Skip malformed JSON
            }
            objectBuffer = "";
            objectStart = false;
          }
        } else if (depth > 0) {
          objectBuffer += char;
        }
      }
      i++;
    }
    buffer = buffer.slice(i);
  }
  
  // Last batch
  if (batch.length > 0) {
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
    if (!error) totalCount += batch.length;
  }
  
  console.log(`[CATSYNC] Stream parsing complete: ${totalCount} products`);
  return totalCount;
}

async function syncCatalog(jobId: string) {
  const upd = (s: string, e: any = {}) => supabase.from("sync_status").update({ status: s, ...e }).eq("id", jobId);
  const start = Date.now();
  
  try {
    // 1. Auth
    await upd("authenticating");
    const token = await auth();
    
    // 2. Request catalog link
    await upd("requesting_catalog");
    const { link, eta } = await requestCatalog(token);
    await supabase.from("sync_status").update({ s3_link: link, eta }).eq("id", jobId);
    
    // 3. Wait for S3 file
    await upd("waiting_for_file", { error_message: `Génération du fichier (ETA: ${eta})...` });
    
    let fileReady = false;
    let pollCount = 0;
    const maxPolls = Math.ceil(MAX_WAIT_TIME / POLL_INTERVAL);
    
    while (!fileReady && pollCount < maxPolls) {
      pollCount++;
      console.log(`[CATSYNC] Polling S3 (attempt ${pollCount}/${maxPolls})...`);
      
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
      
      try {
        const head = await fetch(link, { method: "HEAD" });
        
        if (head.ok) {
          const size = parseInt(head.headers.get("content-length") || "0");
          console.log(`[CATSYNC] S3 file ready, size: ${size} bytes`);
          
          if (size > 1024 * 100) { // Au moins 100KB
            await supabase.from("sync_status").update({
              s3_content_length: size,
              s3_poll_count: pollCount,
            }).eq("id", jobId);
            fileReady = true;
          } else {
            console.log(`[CATSYNC] File too small (${size}), waiting...`);
          }
        } else {
          console.log(`[CATSYNC] S3 not ready (status=${head.status})`);
          await supabase.from("sync_status").update({
            s3_poll_count: pollCount,
            error_message: `Génération en cours (${pollCount}/${maxPolls})...`,
          }).eq("id", jobId);
        }
      } catch (e: any) {
        console.log(`[CATSYNC] Poll error: ${e.message}`);
      }
    }
    
    if (!fileReady) {
      throw new Error(`Fichier non prêt après ${maxPolls} tentatives`);
    }
    
    // 4. Download and parse
    await upd("downloading", { error_message: "Téléchargement..." });
    console.log("[CATSYNC] Downloading file...");
    
    const response = await fetch(link);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    await supabase.from("sync_status").update({ 
      download_bytes: parseInt(response.headers.get("content-length") || "0")
    }).eq("id", jobId);
    
    // 5. Stream parse and upsert
    await upd("syncing", { error_message: "Synchronisation en cours..." });
    const totalCount = await streamParseAndUpsert(response, jobId);
    
    // 6. Done
    await supabase.from("sync_status").update({ 
      status: "completed", 
      products_count: totalCount, 
      completed_at: new Date().toISOString(), 
      finished_in_ms: Date.now() - start, 
      error_message: null
    }).eq("id", jobId);
    
    console.log(`✅ [CATSYNC] Completed: ${totalCount} products in ${(Date.now() - start) / 1000}s`);
    
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
      sync_method: "s3_streaming"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  if (action === "start" || action === "force-restart") {
    if (action === "force-restart") {
      await supabase.from("sync_status").update({ 
        status: "cancelled", 
        completed_at: new Date().toISOString() 
      }).in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"]);
    }
    
    const { data: job } = await supabase.from("sync_status").insert({ 
      sync_type: "catalog_s3_streaming", 
      status: "started" 
    }).select().single();
    
    if (!job) {
      return new Response(JSON.stringify({ error: "Failed to create job" }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Background task
    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(syncCatalog(job.id));
    
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: job.id,
      sync_method: "s3_streaming"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  return new Response(JSON.stringify({ error: "Unknown action" }), { 
    status: 400, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});
