import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPTEX = "https://api.toptex.io";

const envTrim = (key: string) => {
  const v = Deno.env.get(key);
  if (v == null) return "";
  return v.trim();
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function authenticate(): Promise<string> {
  const apiKey = envTrim("TOPTEX_API_KEY");
  const username = envTrim("TOPTEX_USERNAME");
  const password = envTrim("TOPTEX_PASSWORD");

  if (!apiKey || !username || !password) {
    throw new Error("Missing TopTex credentials");
  }

  const r = await fetch(`${TOPTEX}/v3/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ username, password }),
  });

  const txt = await r.text();
  if (!r.ok) {
    throw new Error(`Auth failed: ${r.status}`);
  }

  const d = JSON.parse(txt);
  const token = (d?.token ?? d?.jeton ?? d?.access_token ?? "").trim();
  if (!token) throw new Error("Auth: missing token");

  return token;
}

async function fetchToptexAttributes(token: string): Promise<{
  brands: string[];
  families: string[];
  subfamilies: string[];
}> {
  const apiKey = envTrim("TOPTEX_API_KEY");
  
  // Try /v3/attributes endpoint
  const url = `${TOPTEX}/v3/attributes?attributes=brand,family,subfamily`;
  console.log(`[ATTRIBUTES] GET ${url}`);

  const r = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "x-toptex-authorization": token,
      "Accept": "application/json",
    },
  });

  const txt = await r.text();
  console.log(`[ATTRIBUTES] Response: status=${r.status}, len=${txt.length}`);

  if (!r.ok) {
    console.error(`[ATTRIBUTES] Error: ${txt.slice(0, 500)}`);
    throw new Error(`Attributes fetch failed: ${r.status}`);
  }

  const data = JSON.parse(txt);
  
  // Parse response - format may vary
  const brands: string[] = [];
  const families: string[] = [];
  const subfamilies: string[] = [];

  if (Array.isArray(data)) {
    // Could be array of attribute objects
    data.forEach((item: any) => {
      if (item.brand) brands.push(item.brand);
      if (item.family) families.push(item.family);
      if (item.subfamily) subfamilies.push(item.subfamily);
    });
  } else if (typeof data === 'object') {
    // Could be object with brand/family/subfamily arrays
    if (Array.isArray(data.brand)) {
      brands.push(...data.brand);
    } else if (Array.isArray(data.brands)) {
      brands.push(...data.brands);
    }
    if (Array.isArray(data.family)) {
      families.push(...data.family);
    } else if (Array.isArray(data.families)) {
      families.push(...data.families);
    }
    if (Array.isArray(data.subfamily)) {
      subfamilies.push(...data.subfamily);
    } else if (Array.isArray(data.subfamilies)) {
      subfamilies.push(...data.subfamilies);
    }
  }

  // Dedupe and sort
  const uniqueBrands = [...new Set(brands)].filter(Boolean).sort((a, b) => 
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );
  const uniqueFamilies = [...new Set(families)].filter(Boolean).sort((a, b) => 
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );
  const uniqueSubfamilies = [...new Set(subfamilies)].filter(Boolean).sort((a, b) => 
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );

  console.log(`[ATTRIBUTES] Found: ${uniqueBrands.length} brands, ${uniqueFamilies.length} families, ${uniqueSubfamilies.length} subfamilies`);

  return {
    brands: uniqueBrands,
    families: uniqueFamilies,
    subfamilies: uniqueSubfamilies,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[ATTRIBUTES] Starting fetch...");
    
    const token = await authenticate();
    const attributes = await fetchToptexAttributes(token);

    return jsonResponse({
      success: true,
      ...attributes,
      source: "toptex-api",
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ATTRIBUTES] Error:", msg);
    return jsonResponse({ error: msg, success: false }, 500);
  }
});
