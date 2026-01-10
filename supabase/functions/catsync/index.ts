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

// If no heartbeat for too long, consider the job dead and allow resume.
// Keep this fairly low so the UI can recover quickly if the runtime kills the task.
const MAX_IDLE_MS = 120_000; // 2 minutes

// Avoid platform CPU/runtime limits by slicing work into short chunks.
// The UI will auto-resume when the job goes into "paused".
const TIME_SLICE_MS = 25_000;

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

/**
 * Token manager to handle auto-refresh on 401/403
 */
class TokenManager {
  private token: string = "";
  private refreshCount: number = 0;
  private maxRefreshes: number = 5; // Max re-auths per sync session
  
  async getToken(forceRefresh = false): Promise<string> {
    if (!this.token || forceRefresh) {
      if (this.refreshCount >= this.maxRefreshes) {
        throw new Error(`Max token refreshes (${this.maxRefreshes}) exceeded - possible auth issue`);
      }
      console.log(`[CATSYNC] 🔑 ${forceRefresh ? "Re-authenticating" : "Authenticating"} (refresh #${this.refreshCount + 1})...`);
      this.token = await auth();
      this.refreshCount++;
    }
    return this.token;
  }
  
  invalidate() {
    console.log("[CATSYNC] 🔄 Token invalidated, will refresh on next request");
    this.token = "";
  }
}

// Global token manager for the sync session
let tokenManager: TokenManager;

async function toptexGet(
  url: string, 
  retries = MAX_RETRIES
): Promise<{ status: number; text: string }> {
  const apiKey = envTrim("TOPTEX_API_KEY");

  const tryFetch = async (tokenValue: string, headerStyle: "x-toptex" | "x-toptex-bearer" | "auth-bearer") => {
    const headers: Record<string, string> = { "x-api-key": apiKey };
    
    if (headerStyle === "x-toptex") {
      headers["x-toptex-authorization"] = tokenValue;
    } else if (headerStyle === "x-toptex-bearer") {
      headers["x-toptex-authorization"] = `Bearer ${tokenValue}`;
    } else {
      headers["Authorization"] = `Bearer ${tokenValue}`;
    }
    
    return fetch(url, { headers });
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const token = await tokenManager.getToken();
      
      // Try different auth header styles
      let r = await tryFetch(token, "x-toptex");
      let txt = await r.text();

      // If 401/403 with first style, try other styles
      if (r.status === 401 || r.status === 403) {
        r = await tryFetch(token, "x-toptex-bearer");
        txt = await r.text();

        if (r.status === 401 || r.status === 403) {
          r = await tryFetch(token, "auth-bearer");
          txt = await r.text();
        }
      }

      // If still 401/403 after all header styles, token is likely expired
      // Refresh token and retry
      if (r.status === 401 || r.status === 403) {
        console.log(`[CATSYNC] ⚠️ HTTP ${r.status} - Token expired, refreshing... (attempt ${attempt}/${retries})`);
        tokenManager.invalidate();
        
        // Get fresh token and retry immediately
        const newToken = await tokenManager.getToken(true);
        
        // Try all header styles with new token
        r = await tryFetch(newToken, "x-toptex");
        txt = await r.text();
        
        if (r.status === 401 || r.status === 403) {
          r = await tryFetch(newToken, "x-toptex-bearer");
          txt = await r.text();
        }
        
        if (r.status === 401 || r.status === 403) {
          r = await tryFetch(newToken, "auth-bearer");
          txt = await r.text();
        }
        
        // If still failing after refresh, continue retry loop
        if (r.status === 401 || r.status === 403) {
          if (attempt < retries) {
            const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
            console.log(`[CATSYNC] Still HTTP ${r.status} after token refresh, retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
            continue;
          }
        }
      }

      // Retry on timeout/server errors with exponential backoff
      if (r.status === 504 || r.status === 502 || r.status === 503 || r.status === 500) {
        if (attempt < retries) {
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

// Coefficient de marge à appliquer sur le prix d'achat
const PRICE_COEFFICIENT = 1.5;

/**
 * Parse price from TopTex format like "38,52 €" or "12.50" to number
 */
function parsePrice(priceStr: string | number | null | undefined): number | null {
  if (priceStr == null) return null;
  if (typeof priceStr === "number") return priceStr;
  
  // Remove currency symbols and whitespace
  const cleaned = String(priceStr).replace(/[€$\s]/g, "").trim();
  if (!cleaned) return null;
  
  // Handle European format (comma as decimal separator)
  const normalized = cleaned.replace(",", ".");
  const num = parseFloat(normalized);
  
  return isNaN(num) ? null : num;
}

/**
 * Extract the MINIMUM price from product data across all colors/sizes
 * This gives the "à partir de" price
 */
function extractMinPrice(p: any): number | null {
  let minPrice: number | null = null;
  
  // Find minimum publicUnitPrice across ALL colors and sizes
  if (Array.isArray(p.colors)) {
    for (const color of p.colors) {
      if (Array.isArray(color.sizes)) {
        for (const size of color.sizes) {
          const price = parsePrice(size.publicUnitPrice);
          if (price !== null && price > 0) {
            if (minPrice === null || price < minPrice) {
              minPrice = price;
            }
          }
        }
      }
    }
  }
  
  // Fallback: try direct price fields
  if (minPrice === null) {
    const directPrice = parsePrice(p.publicUnitPrice || p.price || p.prix);
    if (directPrice !== null && directPrice > 0) {
      minPrice = directPrice;
    }
  }
  
  return minPrice;
}

/**
 * Round price to nearest 0.10€
 */
function roundToTenCents(price: number): number {
  return Math.round(price * 10) / 10;
}

/**
 * Image priority scoring - higher = better quality/relevance
 * For TopTex products, prioritize LIFESTYLE/MODEL images as main image
 * (like TopTex shows on their product pages)
 * Then FACE/FRONT packshots as fallback
 */
const IMAGE_PRIORITY: Record<string, number> = {
  "LIFESTYLE": 100,   // Best: lifestyle photo with model (like TopTex main display)
  "MODEL": 100,       // Model wearing the product
  "MANNEQUIN": 95,    // Mannequin display
  "AMBIANCE": 90,     // Ambiance/context shots
  "FACE": 80,         // Front packshot (fallback if no lifestyle)
  "FRONT": 80,
  "FACE SIDE": 70,
  "SIDE": 60,
  "BACK": 50,
  "DETAIL": 40,
  "ZOOM": 30,
};

function getImagePriority(key: string): number {
  const upperKey = key.toUpperCase();
  // Exact match first
  if (IMAGE_PRIORITY[upperKey] !== undefined) {
    return IMAGE_PRIORITY[upperKey];
  }
  // Partial match
  for (const [pattern, score] of Object.entries(IMAGE_PRIORITY)) {
    if (upperKey.includes(pattern)) return score;
  }
  return 10; // Default low priority
}

/**
 * Extract best images from product with priority:
 * 1. FACE/FRONT packshots first (main product image like TopTex shows)
 * 2. Use CDN packshot URLs (url_packshot) which are the actual product images
 * 3. Keep images organized by color for variants
 */
function extractImages(p: any): { mainImages: string[]; colorImages: Record<string, string[]> } {
  const allImages: Array<{ url: string; priority: number; colorName: string }> = [];
  const colorImages: Record<string, string[]> = {};
  
  if (Array.isArray(p.colors)) {
    for (const c of p.colors) {
      const colorName = c.colors?.fr || c.colors?.en || c.name || "default";
      colorImages[colorName] = [];
      
      if (c.packshots && typeof c.packshots === "object") {
        // Sort packshot keys by priority - FACE first
        const sortedKeys = Object.keys(c.packshots).sort((a, b) => 
          getImagePriority(b) - getImagePriority(a)
        );
        
        for (const key of sortedKeys) {
          const ps = c.packshots[key];
          // PRIORITÉ: url_packshot du CDN TopTex (images packshot réelles du produit)
          // Fallback sur url media server seulement si url_packshot n'existe pas
          const url = ps?.url_packshot || ps?.url;
          if (url) {
            allImages.push({ url, priority: getImagePriority(key), colorName });
            colorImages[colorName].push(url);
          }
        }
      }
    }
  }
  
  // Sort all images by priority (FACE first) and dedupe
  allImages.sort((a, b) => b.priority - a.priority);
  const seen = new Set<string>();
  const mainImages: string[] = [];
  for (const img of allImages) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      mainImages.push(img.url);
    }
    if (mainImages.length >= 15) break;
  }
  
  return { mainImages, colorImages };
}

function normalize(p: any): any {
  // TopTex uses catalogReference as SKU, designation for name in multiple languages
  const sku = p.catalogReference || p.reference || p.sku || "";
  const designation = p.designation || {};
  const name = typeof designation === "string" ? designation : (designation.fr || designation.en || p.name || sku);
  
  // Extract images with priority (lifestyle/model first)
  const { mainImages, colorImages } = extractImages(p);
  
  // Extract colors with hex codes and their images
  const colors = (p.colors || []).map((c: any) => {
    const colorName = c.colors?.fr || c.colors?.en || c.name || "";
    const hexCode = c.colorsHexa?.[0] ? `#${c.colorsHexa[0]}` : "";
    return { 
      name: colorName, 
      code: hexCode,
      images: colorImages[colorName] || []
    };
  });
  
  // Extract sizes from all color variants
  const sizesSet = new Set<string>();
  if (Array.isArray(p.colors)) {
    for (const c of p.colors) {
      if (Array.isArray(c.sizes)) {
        for (const s of c.sizes) {
          if (s.size) sizesSet.add(s.size);
        }
      }
    }
  }
  
  // Extract minimum price, round to 0.10€, then apply coefficient ×1.5
  const rawMinPrice = extractMinPrice(p);
  // Round raw price to nearest 0.10€, then apply coefficient
  const priceHT = rawMinPrice !== null 
    ? roundToTenCents(roundToTenCents(rawMinPrice) * PRICE_COEFFICIENT) 
    : null;
  
  // Extract family/subfamily/world for proper filtering
  const familyFr = p.family?.fr || p.famille || "";
  const subFamilyFr = p.sub_family?.fr || p.subFamily?.fr || p.subfamily?.fr || "";
  const worldFr = p.world?.fr || "";
  
  return {
    sku,
    name,
    brand: p.brand || p.marque || "",
    category: familyFr || p.category || "",
    family_fr: familyFr,
    sub_family_fr: subFamilyFr,
    world_fr: worldFr,
    description: typeof p.description === "object" ? (p.description?.fr || p.description?.en || "") : (p.description || ""),
    composition: typeof p.composition === "object" ? (p.composition?.fr || p.composition?.en || "") : (p.composition || ""),
    weight: p.averageWeight || p.poids || p.weight || "",
    price_ht: priceHT,
    images: mainImages,
    colors,
    sizes: Array.from(sizesSet),
    variants: [],
    raw_data: p,
  };
}

async function upsertBatch(rows: any[]) {
  if (!rows.length) return;
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "sku" });
  if (error) {
    // Handle error properly even if message is undefined
    const errMsg = error.message || error.details || error.hint || JSON.stringify(error) || 'Unknown upsert error';
    throw new Error(`DB upsert: ${errMsg}`);
  }
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
 * Return the latest job (most recent started_at)
 */
async function getLatestJob() {
  const { data } = await supabase
    .from("sync_status")
    .select("id, status, heartbeat_at, last_successful_page, products_count, current_page")
    .order("started_at", { ascending: false })
    .limit(1);

  return data?.[0] ?? null;
}

function isJobStale(heartbeatAtIso: string | null | undefined) {
  if (!heartbeatAtIso) return true;
  const heartbeat = new Date(heartbeatAtIso).getTime();
  const now = Date.now();
  return now - heartbeat > MAX_IDLE_MS;
}

/**
 * Decide how/if we can resume a job.
 */
async function getResumeDecision(): Promise<
  | { kind: "resume"; id: string; startPage: number; productsCount: number; reason: string }
  | { kind: "active"; id: string; status: string; heartbeatAt: string | null }
  | { kind: "none" }
> {
  const job = await getLatestJob();
  if (!job) return { kind: "none" };

  const productsCount = job.products_count || 0;
  const startPage = (job.current_page || 0) > 0
    ? job.current_page
    : (job.last_successful_page || 0) + 1;

  if (job.status === "paused") {
    return {
      kind: "resume",
      id: job.id,
      startPage,
      productsCount,
      reason: "paused",
    };
  }

  if (job.status === "syncing") {
    if (isJobStale(job.heartbeat_at)) {
      console.log(
        `[CATSYNC] Found stale job ${job.id} - resuming from page ${startPage} (products=${productsCount})`,
      );
      return {
        kind: "resume",
        id: job.id,
        startPage,
        productsCount,
        reason: "stale",
      };
    }

    return {
      kind: "active",
      id: job.id,
      status: job.status,
      heartbeatAt: job.heartbeat_at,
    };
  }

  // Other non-terminal states mean something is already running
  if (["started", "authenticating", "requesting_catalog", "waiting_for_file", "downloading"].includes(job.status)) {
    return {
      kind: "active",
      id: job.id,
      status: job.status,
      heartbeatAt: job.heartbeat_at,
    };
  }

  return { kind: "none" };
}

/**
 * Main sync function with auto-resume capability
 */
async function syncCatalog(jobId: string, startPage: number = 1, startTotal: number = 0) {
  const upd = (status: string, extra: any = {}) =>
    supabase.from("sync_status").update({ status, ...extra }).eq("id", jobId);

  const start = Date.now();

  // TopTex usually has about 10,000+ products at 20 per page = ~500+ pages
  // We'll update this estimate as we go
  const INITIAL_ESTIMATED_PAGES = 500;
  let estimatedTotalPages = INITIAL_ESTIMATED_PAGES;

  try {
    // Initialize token manager for this sync session
    tokenManager = new TokenManager();
    
    await upd("authenticating");
    // Pre-authenticate to validate credentials
    await tokenManager.getToken();

    console.log(`[CATSYNC] 📄 Starting PAGINATION mode from page ${startPage} (already have ${startTotal} products)`);
    
    await upd("syncing", { 
      error_message: `Pagination - Démarrage page ${startPage}...`,
      current_page: startPage,
      last_successful_page: startPage > 1 ? startPage - 1 : 0,
      products_count: startTotal,
      estimated_total_pages: estimatedTotalPages,
    });
    
    let page = startPage;
    let total = startTotal;
    let batch: any[] = [];
    let pageRetries = 0;
    let longPauseCount = 0;
    let emptyPagesInRow = 0;
    const MAX_EMPTY_PAGES = 5; // Stop after 5 consecutive empty pages (increased for safety)
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
      
      // Use b2b_b2c for maximum product access
      const pageUrl = `${TOPTEX}/v3/products/all?usage_right=b2b_b2c&page_number=${page}&page_size=${PAGE_SIZE}`;
      console.log(`[CATSYNC] 📖 Page ${page}: fetching... (retries=${pageRetries}, longPauses=${longPauseCount}, total=${total})`);
      
      const { status: pageStatus, text: pageText } = await toptexGet(pageUrl);
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
      
      // Dynamically update estimated total pages based on current progress
      // TopTex catalog is ~10,000+ products, estimate grows if we're past initial estimate
      if (page >= estimatedTotalPages - 10) {
        estimatedTotalPages = page + 100; // Add buffer
        await supabase.from("sync_status").update({
          estimated_total_pages: estimatedTotalPages
        }).eq("id", jobId);
      }
      
      // Mark page as successful
      await markPageSuccess(jobId, page, total + batch.length);
      lastHeartbeat = Date.now();

      // Time-slice to avoid CPU/runtime limits: persist progress and let the UI resume.
      if (Date.now() - start > TIME_SLICE_MS) {
        // Flush any remaining batch so we don't redo work on resume
        if (batch.length > 0) {
          await upsertBatch(batch);
          total += batch.length;
          batch = [];
        }

        const nextPage = page + 1;
        await supabase.from("sync_status").update({
          status: "paused",
          heartbeat_at: new Date().toISOString(),
          current_page: nextPage,
          last_successful_page: page,
          products_count: total,
          page_retry_attempt: 0,
          error_message: `Pause auto (sécurité) — reprise page ${nextPage} — ${total} produits`,
        }).eq("id", jobId);

        console.log(`[CATSYNC] ⏸️ Time-slice reached, pausing at next page ${nextPage} (total=${total})`);
        return;
      }

      // Stop if last page (partial page)
      if (items.length < PAGE_SIZE) {
        console.log(`[CATSYNC] Page ${page}: ${items.length} < ${PAGE_SIZE}, last page reached.`);
        // Set final estimated pages to actual
        estimatedTotalPages = page;
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
      estimated_total_pages: page, // Final actual page count
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

    const last = jobs?.[0] ?? null;
    const stale = last?.status === "syncing" ? isJobStale(last.heartbeat_at) : false;

    let recommended_action: "resume" | null = null;
    if (last?.status === "paused") recommended_action = "resume";
    else if (stale) recommended_action = "resume";

    return new Response(
      JSON.stringify({
        status: last?.status || "never",
        product_count_db: count,
        last_sync: last,
        is_stale: stale,
        recommended_action,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (action === "start" || action === "force-restart" || action === "resume") {
    // ✅ Robust behavior:
    // - "resume" resumes if possible
    // - "start" behaves like "resume if possible", otherwise creates a fresh job
    // - ONLY "force-restart" cancels existing jobs

    if (action !== "force-restart") {
      const decision = await getResumeDecision();

      if (decision.kind === "active") {
        return new Response(
          JSON.stringify({
            success: true,
            already_running: true,
            job_id: decision.id,
            status: decision.status,
            heartbeat_at: decision.heartbeatAt,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (decision.kind === "resume") {
        console.log(
          `[CATSYNC] Resuming job ${decision.id} from page ${decision.startPage} (reason=${decision.reason}, requested=${action})`,
        );

        ((globalThis as any).EdgeRuntime?.waitUntil || ((p: any) => p))(
          syncCatalog(decision.id, decision.startPage, decision.productsCount),
        );

        return new Response(
          JSON.stringify({
            success: true,
            job_id: decision.id,
            resumed: true,
            resume_from_page: decision.startPage,
            existing_products: decision.productsCount,
            reason: decision.reason,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // decision.kind === "none" -> create new job below
    }

    if (action === "force-restart") {
      // Cancel any existing running jobs
      await supabase
        .from("sync_status")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
          error_message: "Annulé - nouveau job démarré",
        })
        .in("status", [
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
      syncCatalog(job.id, startPage, 0),
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
