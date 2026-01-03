import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPTEX_API_URL = "https://api.toptex.io";

// Secrets (server-side only)
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY");
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME");
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD");

// Token cache (in-memory)
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

// Data cache (in-memory)
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function safePreview(value: string | undefined | null, keep = 4) {
  if (!value) return "NOT_SET";
  return value.length <= keep ? "***" : `${value.slice(0, keep)}***`;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
    throw new Error(
      `TOPTEX_CONFIG_MISSING: api_key=${!!TOPTEX_API_KEY}, username=${!!TOPTEX_USERNAME}, password=${!!TOPTEX_PASSWORD}`
    );
  }

  // Per TopTex Swagger (screenshot): POST /v3/authenticate + x-api-key + { username, password }
  const authUrl = `${TOPTEX_API_URL}/v3/authenticate`;

  console.log(
    `TopTex auth attempt: url=${authUrl}, username=${safePreview(TOPTEX_USERNAME, 3)}, apiKey=${safePreview(
      TOPTEX_API_KEY,
      6
    )}`
  );

  const resp = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": TOPTEX_API_KEY,
    },
    body: JSON.stringify({ username: TOPTEX_USERNAME, password: TOPTEX_PASSWORD }),
  });

  const text = await resp.text();

  if (!resp.ok) {
    // Swagger shows 403 "Interdit" (API key / permissions) and 403 "Identifiants incorrects".
    throw new Error(`TOPTEX_AUTH_FAILED: ${resp.status} - ${text}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`TOPTEX_AUTH_BAD_RESPONSE: ${text.slice(0, 200)}`);
  }

  // Swagger model indicates "jeton".
  const token =
    data.token || data.jeton || data.access_token || data.accessToken || data.jwt || data.id_token;

  if (!token || typeof token !== "string") {
    throw new Error(`TOPTEX_AUTH_NO_TOKEN: keys=${Object.keys(data).join(",")}`);
  }

  cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL };
  return token;
}

async function fetchFromTopTex(endpoint: string, method: string = "GET", retryCount = 0): Promise<any> {
  const cacheKey = `toptex_${endpoint}`;
  const cached = dataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const token = await getToken(retryCount > 0);

  const resp = await fetch(`${TOPTEX_API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": TOPTEX_API_KEY ?? "",
      Accept: "application/json",
    },
  });

  if (resp.ok) {
    const data = await resp.json();
    dataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  if ((resp.status === 401 || resp.status === 403) && retryCount === 0) {
    cachedToken = null;
    return fetchFromTopTex(endpoint, method, retryCount + 1);
  }

  const text = await resp.text();
  throw new Error(`TOPTEX_API_ERROR: ${resp.status} - ${text}`);
}

// Product normalization helpers
function normalizeProduct(product: any): any {
  return {
    sku: product.reference || product.sku || product.id || product.code,
    name: product.designation || product.name || product.titre || product.libelle,
    brand: product.marque || product.brand || "N/A",
    category: product.categorie || product.category || "Non classé",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.grammage || product.poids || "",
    images: extractImages(product),
    colors: extractColors(product),
    sizes: extractSizes(product),
    variants: extractVariants(product),
    priceHT: product.prixHT || product.prix || null,
    stock: product.stock || null,
  };
}

function extractImages(product: any): string[] {
  if (product.images && Array.isArray(product.images)) {
    return product.images.map((img: any) => (typeof img === "string" ? img : img.url || img.src));
  }
  if (product.image) return [product.image];
  if (product.photo) return [product.photo];
  if (product.visuel) return [product.visuel];
  return [];
}

function extractColors(product: any): Array<{ name: string; code: string }> {
  if (product.couleurs && Array.isArray(product.couleurs)) {
    return product.couleurs.map((c: any) => ({
      name: typeof c === "string" ? c : c.nom || c.name || c.libelle,
      code: typeof c === "string" ? "" : c.code || c.hexa || c.hex || "",
    }));
  }
  if (product.colors && Array.isArray(product.colors)) {
    return product.colors.map((c: any) => ({
      name: typeof c === "string" ? c : c.name || c.label,
      code: typeof c === "string" ? "" : c.code || c.hex || "",
    }));
  }
  return [];
}

function extractSizes(product: any): string[] {
  if (product.tailles && Array.isArray(product.tailles)) {
    return product.tailles.map((t: any) => (typeof t === "string" ? t : t.nom || t.name || t.libelle));
  }
  if (product.sizes && Array.isArray(product.sizes)) {
    return product.sizes.map((s: any) => (typeof s === "string" ? s : s.name || s.label));
  }
  return [];
}

function extractVariants(product: any): any[] {
  if (product.variantes && Array.isArray(product.variantes)) {
    return product.variantes.map((v: any) => ({
      sku: v.reference || v.sku,
      color: v.couleur || v.color,
      size: v.taille || v.size,
      stock: v.stock,
      price: v.prixHT || v.prix,
    }));
  }
  if (product.variants && Array.isArray(product.variants)) return product.variants;
  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TOPTEX_API_KEY || !TOPTEX_USERNAME || !TOPTEX_PASSWORD) {
      return new Response(
        JSON.stringify({
          error: "TOPTEX_CONFIG_MISSING",
          message: "Configuration TopTex incomplète.",
          needsSetup: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        // ignore
      }
    }

    const url = new URL(req.url);
    const action = body.action || url.searchParams.get("action") || "catalog";
    const query = body.query || url.searchParams.get("query") || "";
    const page = parseInt(body.page || url.searchParams.get("page") || "1");
    const limit = parseInt(body.limit || url.searchParams.get("limit") || "24");
    const sku = body.sku || url.searchParams.get("sku");
    const category = body.category || url.searchParams.get("category");
    const brand = body.brand || url.searchParams.get("brand");

    console.log(`TopTex request: action=${action}, page=${page}, limit=${limit}`);

    let result: any;

    switch (action) {
      case "product": {
        if (!sku) throw new Error("SKU is required for product action");
        const data = await fetchFromTopTex(`/v3/produits/${sku}`);
        result = normalizeProduct(data);
        break;
      }

      case "attributes": {
        result = await fetchFromTopTex("/v3/attributs");
        break;
      }

      case "search":
      case "catalog":
      default: {
        const params = new URLSearchParams();
        if (query) params.append("recherche", query);
        if (category && category !== "Tous") params.append("categorie", category);
        if (brand && brand !== "Toutes") params.append("marque", brand);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const endpoint = `/v3/produits?${params.toString()}`;
        const data = await fetchFromTopTex(endpoint);

        let products: any[] = [];
        let total = 0;

        if (Array.isArray(data)) {
          products = data;
          total = data.length;
        } else if (data.produits) {
          products = data.produits;
          total = data.total || data.produits.length;
        } else if (data.items) {
          products = data.items;
          total = data.total || data.items.length;
        } else if (data.results) {
          products = data.results;
          total = data.total || data.results.length;
        }

        result = {
          products: products.map(normalizeProduct),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    const isAuthError = message.includes("TOPTEX_AUTH") || message.includes("401") || message.includes("403");

    let userMessage = "Une erreur est survenue lors de la récupération des produits.";
    let errorCode = "TOPTEX_ERROR";
    let statusCode = 500;

    if (message.includes("TOPTEX_CONFIG_MISSING")) {
      userMessage = "Configuration TopTex incomplète.";
      errorCode = "TOPTEX_CONFIG_MISSING";
      statusCode = 503;
    } else if (isAuthError) {
      // Distinguish common Swagger cases
      if (message.includes("Identifiants") || message.toLowerCase().includes("incorrect")) {
        userMessage = "Identifiants TopTex incorrects.";
      } else if (message.includes("Interdit") || message.toLowerCase().includes("forbidden")) {
        userMessage = "Accès API TopTex refusé (clé API / droits).";
      } else {
        userMessage = "Échec de l'authentification TopTex.";
      }
      errorCode = "TOPTEX_AUTH_FAILED";
      statusCode = 401;
    }

    console.error("Error in toptex-api:", message);

    return new Response(
      JSON.stringify({ error: errorCode, message: userMessage, details: message, isAuthError }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
