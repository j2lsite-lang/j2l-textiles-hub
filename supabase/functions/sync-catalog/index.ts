import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TopTex API configuration
const TOPTEX_BASE_URL = "https://api.toptex.io";
const TOPTEX_API_KEY = Deno.env.get("TOPTEX_API_KEY");
const TOPTEX_USERNAME = Deno.env.get("TOPTEX_USERNAME");
const TOPTEX_PASSWORD = Deno.env.get("TOPTEX_PASSWORD");

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

let authToken: string | null = null;

async function authenticate(): Promise<string> {
  console.log("[Sync] Authenticating with TopTex...");
  
  const response = await fetch(`${TOPTEX_BASE_URL}/v3/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TOPTEX_API_KEY!,
    },
    body: JSON.stringify({
      username: TOPTEX_USERNAME,
      password: TOPTEX_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  authToken = data.token;
  console.log("[Sync] Authentication successful");
  return authToken!;
}

async function startCatalogGeneration(): Promise<{ link: string; eta: string }> {
  if (!authToken) await authenticate();

  console.log("[Sync] Starting catalog generation...");
  
  const params = new URLSearchParams();
  params.append("usage_right", "b2b_b2c");
  params.append("display_prices", "1");
  params.append("result_in_file", "1");
  params.append("page_size", "10000"); // Get all products

  const response = await fetch(`${TOPTEX_BASE_URL}/v3/products/all?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": TOPTEX_API_KEY!,
      "x-toptex-authorization": authToken!,
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.link) {
    throw new Error("No S3 link in response");
  }

  console.log(`[Sync] Catalog generation started, ETA: ${data.estimated_time_of_arrival}`);
  
  return {
    link: data.link,
    eta: data.estimated_time_of_arrival,
  };
}

async function fetchS3File(link: string, maxRetries = 10): Promise<any[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Sync] Fetching S3 file (attempt ${attempt}/${maxRetries})...`);
    
    try {
      const response = await fetch(link);
      
      if (!response.ok) {
        console.log(`[Sync] S3 file not ready: ${response.status}`);
        if (attempt < maxRetries) {
          const waitTime = Math.min(attempt * 30000, 180000); // 30s, 60s, 90s... max 3min
          console.log(`[Sync] Waiting ${waitTime / 1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`S3 file not available after ${maxRetries} attempts`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        if (data.length === 0 && attempt < maxRetries) {
          console.log("[Sync] Empty array, file might not be ready...");
          await new Promise(resolve => setTimeout(resolve, 30000));
          continue;
        }
        console.log(`[Sync] Got ${data.length} products from S3`);
        return data;
      } else if (data?.products) {
        console.log(`[Sync] Got ${data.products.length} products from S3`);
        return data.products;
      }
      
      return [];
    } catch (err) {
      console.error(`[Sync] Error fetching S3:`, err);
      if (attempt === maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  return [];
}

function normalizeProduct(product: any) {
  const images: string[] = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        if (typeof img === "string") images.push(img);
        else if (img?.url) images.push(img.url);
        else if (img?.original) images.push(img.original);
      });
    }
  }
  if (product.image) images.push(product.image);
  if (product.imageUrl) images.push(product.imageUrl);

  const colors: Array<{ name: string; code: string }> = [];
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach((c: any) => {
      if (typeof c === "string") colors.push({ name: c, code: "#000000" });
      else if (c?.name) colors.push({ name: c.name, code: c.code || c.hex || "#000000" });
    });
  }
  if (product.declinaisons) {
    product.declinaisons.forEach((d: any) => {
      if (d.couleur && !colors.find(c => c.name === d.couleur)) {
        colors.push({ name: d.couleur, code: d.code_couleur || "#000000" });
      }
    });
  }

  const sizes: string[] = [];
  if (product.sizes && Array.isArray(product.sizes)) {
    sizes.push(...product.sizes);
  }
  if (product.declinaisons) {
    product.declinaisons.forEach((d: any) => {
      if (d.taille && !sizes.includes(d.taille)) sizes.push(d.taille);
    });
  }

  const variants: any[] = [];
  if (product.declinaisons) {
    product.declinaisons.forEach((d: any) => {
      variants.push({
        sku: d.reference || d.sku || `${product.reference || product.sku}-${d.couleur}-${d.taille}`,
        color: d.couleur || "",
        size: d.taille || "",
        stock: d.stock ?? d.quantite ?? null,
        price: d.prix_ht ?? d.price ?? null,
      });
    });
  }

  return {
    sku: product.reference || product.sku || product.id || "",
    name: product.designation || product.name || product.titre || "",
    brand: product.marque || product.brand || "",
    category: product.famille || product.category || product.famille_produit || "",
    description: product.description || product.descriptif || "",
    composition: product.composition || product.matiere || "",
    weight: product.poids || product.weight || "",
    images,
    colors,
    sizes,
    variants,
    price_ht: product.prix_ht ?? product.price ?? product.prix ?? null,
    stock: product.stock ?? product.quantite ?? null,
    raw_data: product,
  };
}

async function syncProducts(supabase: any, products: any[], syncId: string) {
  console.log(`[Sync] Syncing ${products.length} products to database...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const normalizedBatch = batch.map(normalizeProduct).filter(p => p.sku);
    
    if (normalizedBatch.length === 0) continue;
    
    const { error } = await supabase
      .from("products")
      .upsert(
        normalizedBatch.map(p => ({
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          category: p.category,
          description: p.description,
          composition: p.composition,
          weight: p.weight,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          variants: p.variants,
          price_ht: p.price_ht,
          stock: p.stock,
          raw_data: p.raw_data,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "sku" }
      );

    if (error) {
      console.error(`[Sync] Batch error:`, error);
      errorCount += batch.length;
    } else {
      successCount += normalizedBatch.length;
    }
    
    // Update progress
    await supabase
      .from("sync_status")
      .update({ products_count: successCount })
      .eq("id", syncId);
    
    console.log(`[Sync] Progress: ${successCount}/${products.length}`);
  }
  
  return { successCount, errorCount };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("[Sync] Starting catalog sync...");

    // Create sync status record
    const { data: syncRecord, error: syncError } = await supabase
      .from("sync_status")
      .insert({
        sync_type: "catalog",
        status: "started",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (syncError) {
      console.error("[Sync] Failed to create sync record:", syncError);
    }

    const syncId = syncRecord?.id;

    // Step 1: Start catalog generation
    const { link, eta } = await startCatalogGeneration();
    
    // Update sync status with S3 link
    if (syncId) {
      await supabase
        .from("sync_status")
        .update({ s3_link: link, status: "waiting_for_file" })
        .eq("id", syncId);
    }

    // Step 2: Wait for ETA then fetch the file
    const etaDate = new Date(eta);
    const now = new Date();
    const waitMs = etaDate.getTime() - now.getTime();
    
    if (waitMs > 0) {
      console.log(`[Sync] Waiting ${Math.round(waitMs / 1000)}s for file to be ready...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(waitMs + 5000, 300000))); // Max 5 min wait
    }

    // Step 3: Fetch the S3 file
    const products = await fetchS3File(link);
    
    if (products.length === 0) {
      const errorMsg = "No products received from TopTex";
      console.error(`[Sync] ${errorMsg}`);
      
      if (syncId) {
        await supabase
          .from("sync_status")
          .update({ 
            status: "failed", 
            error_message: errorMsg,
            completed_at: new Date().toISOString()
          })
          .eq("id", syncId);
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Step 4: Sync to database
    if (syncId) {
      await supabase
        .from("sync_status")
        .update({ status: "syncing" })
        .eq("id", syncId);
    }
    
    const { successCount, errorCount } = await syncProducts(supabase, products, syncId);

    // Step 5: Complete
    if (syncId) {
      await supabase
        .from("sync_status")
        .update({ 
          status: "completed",
          products_count: successCount,
          completed_at: new Date().toISOString()
        })
        .eq("id", syncId);
    }

    console.log(`[Sync] Completed: ${successCount} products synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products_synced: successCount,
        errors: errorCount,
        sync_id: syncId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Sync] Fatal error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
