import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const TOPTEX = "https://api.toptex.io";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

// Configuration
const BATCH_SIZE = 100; // Produits par upsert batch
const MAX_WAIT_TIME = 600000; // 10 minutes max d'attente pour le fichier S3
const POLL_INTERVAL = 30000; // 30 secondes entre chaque vérification

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

async function requestCatalogLink(token: string): Promise<{ link: string; eta: string }> {
  console.log("[CATSYNC] Requesting catalog link...");
  const r = await fetch(`${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=1`, { 
    headers: { 
      "x-api-key": Deno.env.get("TOPTEX_API_KEY")!, 
      "x-toptex-authorization": token 
    } 
  });
  if (!r.ok) {
    const txt = await r.text();
    console.error(`[CATSYNC] Link request failed: ${r.status} - ${txt}`);
    throw new Error(`Link: ${r.status}`);
  }
  const data = await r.json();
  console.log(`[CATSYNC] Catalog link received, ETA: ${data.estimated_time_of_arrival}`);
  return { 
    link: data.link, 
    eta: data.estimated_time_of_arrival || "unknown" 
  };
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

// Parse le JSON en streaming pour éviter de tout charger en mémoire
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
    
    // Parse caractère par caractère pour extraire les objets JSON
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
            // On a un objet complet
            try {
              const product = JSON.parse(objectBuffer);
              const normalized = normalize(product);
              if (normalized.sku) {
                batch.push({ ...normalized, synced_at: new Date().toISOString() });
              }
              
              // Upsert par batch
              if (batch.length >= BATCH_SIZE) {
                const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
                if (error) {
                  console.error(`[CATSYNC] Upsert error:`, error.message);
                } else {
                  totalCount += batch.length;
                  // Mettre à jour le statut périodiquement
                  if (totalCount % 1000 === 0) {
                    console.log(`[CATSYNC] Progress: ${totalCount} products`);
                    await supabase.from("sync_status").update({ 
                      error_message: `${totalCount} produits synchronisés...`,
                      products_count: totalCount
                    }).eq("id", jobId);
                  }
                }
                batch = [];
              }
            } catch (e) {
              // Ignore les erreurs de parsing - objet mal formé
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
    
    // Garder le reste du buffer
    buffer = buffer.slice(i);
  }
  
  // Upsert le dernier batch
  if (batch.length > 0) {
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "sku" });
    if (!error) {
      totalCount += batch.length;
    }
  }
  
  console.log(`[CATSYNC] Stream parsing complete: ${totalCount} products`);
  return totalCount;
}

async function syncJob(jobId: string) {
  const upd = (s: string, e: any = {}) => supabase.from("sync_status").update({ status: s, ...e }).eq("id", jobId);
  const start = Date.now();
  
  try {
    // 1. Authentification
    await upd("authenticating");
    const token = await auth();
    
    // 2. Demander le lien du catalogue
    await upd("requesting_catalog");
    const { link, eta } = await requestCatalogLink(token);
    await supabase.from("sync_status").update({ s3_link: link, eta }).eq("id", jobId);
    
    // 3. Attendre que le fichier soit prêt (polling)
    await upd("waiting_for_file", { error_message: `ETA: ${eta}` });
    
    let fileReady = false;
    let pollCount = 0;
    const maxPolls = Math.ceil(MAX_WAIT_TIME / POLL_INTERVAL);
    
    while (!fileReady && pollCount < maxPolls) {
      pollCount++;
      console.log(`[CATSYNC] Polling S3 file (attempt ${pollCount})...`);
      
      // Attendre avant de vérifier
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
      
      try {
        const headResponse = await fetch(link, { method: "HEAD" });
        
        if (headResponse.ok) {
          const contentLength = parseInt(headResponse.headers.get("content-length") || "0");
          console.log(`[CATSYNC] S3 file available, size: ${contentLength} bytes`);
          
          // Vérifier que le fichier fait au moins 1MB (pas vide)
          if (contentLength > 1024 * 1024) {
            await supabase.from("sync_status").update({ 
              s3_content_length: contentLength,
              s3_poll_count: pollCount
            }).eq("id", jobId);
            fileReady = true;
          } else {
            console.log(`[CATSYNC] File too small (${contentLength}), waiting...`);
            await supabase.from("sync_status").update({ 
              s3_poll_count: pollCount,
              error_message: `Fichier en cours de génération (${pollCount}/${maxPolls})...`
            }).eq("id", jobId);
          }
        } else if (headResponse.status === 403) {
          console.log(`[CATSYNC] S3 link expired (403)`);
          throw new Error("S3 link expired");
        }
      } catch (e: any) {
        if (e.message === "S3 link expired") throw e;
        console.log(`[CATSYNC] Poll error: ${e.message}`);
      }
    }
    
    if (!fileReady) {
      throw new Error(`File not ready after ${maxPolls} polls`);
    }
    
    // 4. Télécharger et parser en streaming
    await upd("downloading");
    console.log("[CATSYNC] Starting download with streaming...");
    
    const response = await fetch(link);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    await supabase.from("sync_status").update({ 
      download_bytes: parseInt(response.headers.get("content-length") || "0")
    }).eq("id", jobId);
    
    // 5. Parser et upserter en streaming
    await upd("syncing", { error_message: "Parsing en streaming..." });
    const totalCount = await streamParseAndUpsert(response, jobId);
    
    // 6. Terminé
    await supabase.from("sync_status").update({ 
      status: "completed", 
      products_count: totalCount, 
      completed_at: new Date().toISOString(), 
      finished_in_ms: Date.now() - start, 
      error_message: null
    }).eq("id", jobId);
    
    console.log(`✅ [CATSYNC] Completed: ${totalCount} products in ${Date.now() - start}ms`);
    
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
      sync_method: "streaming"
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
      sync_type: "catalog_streaming", 
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
      sync_method: "streaming"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  return new Response(JSON.stringify({ error: "Unknown action" }), { 
    status: 400, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});
