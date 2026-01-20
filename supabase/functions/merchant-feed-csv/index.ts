import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/csv; charset=utf-8",
  "Content-Disposition": "attachment; filename=products.csv",
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
};

const SITE_URL = "https://j2ltextiles.fr";
const SHOP_NAME = "J2LTextiles";

// Escape CSV special characters
function escapeCsv(text: string | null | undefined): string {
  if (!text) return "";
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\r?\n/g, " ")
    .trim();
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (cleaned.includes(",") || cleaned.includes('"') || cleaned.includes("\n")) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

function normalizeImageUrls(images: unknown): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images
    .map((v) => (typeof v === "string" ? v : String(v)))
    .map((v) => v.trim())
    .filter(Boolean);
}

function isAllowedImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return /\.(jpe?g|png)(\?.*)?$/i.test(u.pathname + u.search);
  } catch {
    return false;
  }
}

function scoreImageUrl(url: string): number {
  let score = 0;
  if (url.includes("/pictures/")) score += 50;
  if (/\.(jpe?g)(\?.*)?$/i.test(url)) score += 20;
  if (url.includes("/packshots/")) score -= 10;
  return score;
}

function pickMainImage(images: unknown): string {
  const raw = normalizeImageUrls(images);
  const filtered = raw.filter(isAllowedImageUrl);

  const base = (filtered.length ? filtered : raw)
    .filter((u) => u.startsWith("http"));

  const unique = Array.from(new Set(base));
  unique.sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));

  return unique[0] || "";
}

function buildDescription(product: {
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
}): string {
  const raw = (product.description || "").trim();

  const brandPart = product.brand ? `de la marque ${product.brand}` : "";
  const categoryPart = product.category ? `(${product.category})` : "";

  const fallback = `${product.name}${brandPart ? ` ${brandPart}` : ""}${categoryPart ? ` ${categoryPart}` : ""}. Personnalisation possible (broderie, sérigraphie, flocage, impression DTG).`;

  let desc = raw || fallback;
  if (desc.length < 120) desc = `${desc} ${fallback}`;

  return desc.substring(0, 5000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = performance.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ALL products using pagination
    const allProducts: Array<{
      id: string;
      sku: string;
      name: string;
      description: string | null;
      brand: string | null;
      price_ht: number | null;
      images: unknown;
      stock: number | null;
      category: string | null;
    }> = [];

    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from("products")
        .select(
          "id, sku, name, description, brand, price_ht, images, stock, category",
        )
        .not("images", "is", null)
        .not("price_ht", "is", null)
        .not("sku", "is", null)
        .not("name", "is", null)
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error("Error fetching products batch:", error);
        throw error;
      }

      if (batch && batch.length > 0) {
        allProducts.push(...batch);
        offset += pageSize;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allProducts.length} products total`);

    // Filter out products with empty/invalid data
    const validProducts = allProducts.filter((product) => {
      if (!product.sku || !product.name) return false;
      if (product.price_ht === null || Number.isNaN(product.price_ht)) return false;
      const mainImage = pickMainImage(product.images);
      return Boolean(mainImage);
    });

    console.log(`Processing ${validProducts.length} valid products`);

    // CSV Header
    const csvHeader = "id,title,description,link,image_link,price,availability,brand,condition";
    
    // Generate CSV rows
    const csvRows: string[] = [csvHeader];

    for (const product of validProducts) {
      const mainImage = pickMainImage(product.images);

      // Calculate price with margin (add 20% for retail display)
      const price = product.price_ht
        ? `${(parseFloat(String(product.price_ht)) * 1.2).toFixed(2)} EUR`
        : "0.00 EUR";

      // Availability - always in_stock for B2B
      const availability = "en stock";

      const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}`;

      const row = [
        escapeCsv(product.sku),
        escapeCsv(product.name?.substring(0, 150)),
        escapeCsv(buildDescription(product)),
        escapeCsv(productUrl),
        escapeCsv(mainImage),
        escapeCsv(price),
        escapeCsv(availability),
        escapeCsv(product.brand || SHOP_NAME),
        escapeCsv("nouveau"),
      ].join(",");

      csvRows.push(row);
    }

    console.log(`Generated ${csvRows.length - 1} CSV rows`);

    const csv = csvRows.join("\n");

    const ms = Math.round(performance.now() - t0);
    console.log(`merchant-feed-csv generated in ${ms}ms`);

    return new Response(csv, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Merchant feed CSV error:", error);
    
    return new Response("Erreur lors de la génération du flux CSV", {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
});
