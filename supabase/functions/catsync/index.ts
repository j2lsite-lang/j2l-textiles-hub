import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const TOPTEX = "https://api.toptex.io";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function auth(): Promise<string> {
  const r = await fetch(`${TOPTEX}/v3/authenticate`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": Deno.env.get("TOPTEX_API_KEY")! }, body: JSON.stringify({ username: Deno.env.get("TOPTEX_USERNAME")!, password: Deno.env.get("TOPTEX_PASSWORD")! }) });
  if (!r.ok) throw new Error(`Auth: ${r.status}`);
  const d = await r.json(); return d.token || d.jeton;
}

async function getLink(token: string): Promise<string> {
  const r = await fetch(`${TOPTEX}/v3/products/all?usage_right=b2b_b2c&display_prices=1&result_in_file=1`, { headers: { "x-api-key": Deno.env.get("TOPTEX_API_KEY")!, "x-toptex-authorization": token } });
  if (!r.ok) throw new Error(`Link: ${r.status}`);
  return (await r.json()).link;
}

function normalize(p: any): any {
  return { sku: p.reference || p.sku || "", name: p.designation || p.name || "", brand: p.marque || p.brand || "", category: p.famille || p.category || "", description: p.description || "", images: (p.images || []).map((i: any) => typeof i === "string" ? i : i?.url || ""), colors: (p.couleurs || []).map((c: any) => ({ name: c.nom || c, code: c.code || "" })), sizes: p.tailles || [], raw_data: p };
}

async function syncJob(jobId: string) {
  const upd = (s: string, e: any = {}) => supabase.from("sync_status").update({ status: s, ...e }).eq("id", jobId);
  const start = Date.now();
  try {
    await upd("authenticating"); const token = await auth();
    for (let lt = 0; lt < 3; lt++) {
      await upd("requesting_catalog"); const link = await getLink(token);
      await supabase.from("sync_status").update({ s3_link: link }).eq("id", jobId);
      await upd("waiting_for_file", { error_message: "Attente 5 min..." }); await new Promise(r => setTimeout(r, 300000));
      for (let dt = 0; dt < 5; dt++) {
        await upd("downloading", { s3_poll_count: dt + 1 }); const res = await fetch(link);
        if (res.status === 403) break; if (!res.ok) { await new Promise(r => setTimeout(r, 60000)); continue; }
        const txt = await res.text(); const sz = txt.length;
        await supabase.from("sync_status").update({ s3_content_length: sz, download_bytes: sz }).eq("id", jobId);
        if (sz < 50 * 1024 * 1024) { await new Promise(r => setTimeout(r, 60000)); continue; }
        await upd("syncing"); const data = JSON.parse(txt); const products = Array.isArray(data) ? data : data?.products || [];
        let count = 0;
        for (let i = 0; i < products.length; i += 100) {
          const batch = products.slice(i, i + 100).map(normalize).filter((p: any) => p.sku);
          if (batch.length) { await supabase.from("products").upsert(batch.map((p: any) => ({ ...p, synced_at: new Date().toISOString() })), { onConflict: "sku" }); count += batch.length; }
        }
        await supabase.from("sync_status").update({ status: "completed", products_count: count, completed_at: new Date().toISOString(), finished_in_ms: Date.now() - start, error_message: null }).eq("id", jobId);
        console.log(`✅ ${count} products`); return;
      }
    }
    throw new Error("Max retries");
  } catch (e: any) { await supabase.from("sync_status").update({ status: "failed", error_message: e.message, completed_at: new Date().toISOString(), finished_in_ms: Date.now() - start }).eq("id", jobId); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const action = new URL(req.url).searchParams.get("action") || "status";
  if (action === "status") {
    const { data: jobs } = await supabase.from("sync_status").select("*").order("started_at", { ascending: false }).limit(5);
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
    return new Response(JSON.stringify({ status: jobs?.[0]?.status || "never", product_count_db: count, last_sync: jobs?.[0] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (action === "start" || action === "force-restart") {
    if (action === "force-restart") await supabase.from("sync_status").update({ status: "expired", completed_at: new Date().toISOString() }).in("status", ["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading", "syncing"]);
    const { data: job } = await supabase.from("sync_status").insert({ sync_type: "catalog", status: "started" }).select().single();
    if (!job) return new Response(JSON.stringify({ error: "Failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(syncJob(job.id));
    return new Response(JSON.stringify({ success: true, job_id: job.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
