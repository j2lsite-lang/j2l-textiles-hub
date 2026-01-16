import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  // Avoid any intermediary caching so Google always fetches fresh content
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
};

const SITE_URL = "https://j2ltextiles.fr";
const SHOP_NAME = "J2LTextiles";

// Escape XML special characters and remove invalid XML characters
function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  // Remove invalid XML 1.0 characters (control chars except tab, newline, carriage return)
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\r?\n/g, " ")
    .trim();
  return cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Map French categories to Google product categories
function getGoogleCategory(category: string | null): string {
  const categoryMap: Record<string, string> = {
    "Vêtements": "Apparel &amp; Accessories &gt; Clothing",
    "T-shirts": "Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops",
    "Polos": "Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops &gt; Polos",
    "Sweats": "Apparel &amp; Accessories &gt; Clothing &gt; Activewear &gt; Sweatshirts",
    "Vestes": "Apparel &amp; Accessories &gt; Clothing &gt; Outerwear &gt; Coats &amp; Jackets",
    "Pantalons": "Apparel &amp; Accessories &gt; Clothing &gt; Pants",
    "Accessoires": "Apparel &amp; Accessories &gt; Clothing Accessories",
    "Sacs": "Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases",
  };
  return categoryMap[category || ""] || "Apparel &amp; Accessories &gt; Clothing";
}

// Extract primary color from colors array
function extractColor(colors: unknown): string {
  if (!colors || !Array.isArray(colors) || colors.length === 0) return "";
  const firstColor = colors[0];
  if (typeof firstColor === "object" && firstColor !== null && "name" in firstColor) {
    return escapeXml(String((firstColor as any).name));
  }
  return "";
}

// Determine gender from product name
function extractGender(name: string | null): string {
  if (!name) return "unisex";
  const nameLower = name.toLowerCase();

  // Women keywords
  if (
    nameLower.includes("femme") ||
    nameLower.includes("woman") ||
    nameLower.includes("women") ||
    nameLower.includes("fille") ||
    nameLower.includes("girl") ||
    nameLower.includes("lady") ||
    nameLower.includes("ladies")
  ) {
    return "female";
  }

  // Men keywords
  if (
    nameLower.includes("homme") ||
    nameLower.includes("man") ||
    nameLower.includes("men") ||
    nameLower.includes("garçon") ||
    nameLower.includes("boy") ||
    nameLower.includes("garcon")
  ) {
    return "male";
  }

  return "unisex";
}

// Extract primary size from sizes array
function extractSize(sizes: unknown): string {
  if (!sizes || !Array.isArray(sizes) || sizes.length === 0) return "";
  const first = sizes[0];
  if (first === null || first === undefined) return "";
  return escapeXml(String(first));
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
    // Prefer stable formats for Merchant Center
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

function pickImages(images: unknown): { main: string; additional: string[] } {
  const raw = normalizeImageUrls(images);
  const filtered = raw.filter(isAllowedImageUrl);

  const base = (filtered.length ? filtered : raw)
    .filter((u) => u.startsWith("http"));

  const unique = Array.from(new Set(base));
  unique.sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));

  const main = unique[0] || "";
  // Keep the feed size reasonable and avoid additional_image_link parsing issues
  const additional = unique.slice(1, 6);
  return { main, additional };
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

    // Fetch ALL products using pagination (Supabase has 1000 row default limit)
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
      colors: Array<{ name: string; code: string }> | null;
      sizes: string[] | null;
    }> = [];

    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from("products")
        .select(
          "id, sku, name, description, brand, price_ht, images, stock, category, colors, sizes",
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
      const { main } = pickImages(product.images);
      return Boolean(main);
    });

    console.log(
      `Generating merchant feed with ${validProducts.length} valid products`,
    );

    // Generate XML items
    const items = validProducts
      .map((product) => {
        const { main, additional } = pickImages(product.images);
        const mainImage = escapeXml(main);

        // Calculate price with margin (add 20% for retail display)
        const price = product.price_ht
          ? (parseFloat(String(product.price_ht)) * 1.2).toFixed(2)
          : "0.00";

        // Availability based on stock
        const availability = product.stock === null || product.stock > 0
          ? "in_stock"
          : "out_of_stock";

        // Extract optional attributes
        const color = extractColor(product.colors);
        const gender = extractGender(product.name);
        const size = extractSize(product.sizes);

        const additionalImagesXml = additional
          .filter((img: string) => img && img.trim())
          .map((img: string) =>
            `\n<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
          )
          .join("");

        // Build optional XML blocks only if value exists
        const colorXml = color ? `<g:color>${color}</g:color>` : "";
        const sizeXml = size ? `<g:size>${size}</g:size>` : "";

        const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}`;

        return (
          `<item>` +
          `<g:id>${escapeXml(product.sku)}</g:id>` +
          `<g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>` +
          `<g:description>${escapeXml(buildDescription(product))}</g:description>` +
          `<g:link>${escapeXml(productUrl)}</g:link>` +
          `<g:image_link>${mainImage}</g:image_link>` +
          additionalImagesXml +
          `<g:availability>${availability}</g:availability>` +
          `<g:price>${price} EUR</g:price>` +
          `<g:brand>${escapeXml(product.brand || SHOP_NAME)}</g:brand>` +
          `<g:condition>new</g:condition>` +
          colorXml +
          sizeXml +
          `<g:gender>${gender}</g:gender>` +
          `<g:age_group>adult</g:age_group>` +
          `<g:google_product_category>${getGoogleCategory(product.category)}</g:google_product_category>` +
          `<g:product_type>${escapeXml(product.category || "Vêtements")}</g:product_type>` +
          `<g:identifier_exists>false</g:identifier_exists>` +
          `<g:mpn>${escapeXml(product.sku)}</g:mpn>` +
          `<g:shipping>` +
          `<g:country>FR</g:country>` +
          `<g:service>Standard</g:service>` +
          `<g:price>0.00 EUR</g:price>` +
          `</g:shipping>` +
          `</item>`
        );
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
      `<channel>` +
      `<title>${SHOP_NAME} - Catalogue Produits</title>` +
      `<link>${SITE_URL}</link>` +
      `<description>Vêtements professionnels personnalisables - ${SHOP_NAME}</description>` +
      items +
      `</channel>` +
      `</rss>`;

    const ms = Math.round(performance.now() - t0);
    console.log(`merchant-feed generated in ${ms}ms`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Merchant feed error:", error);
    
    // Return empty but valid feed on error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
      `<channel>` +
      `<title>${SHOP_NAME}</title>` +
      `<link>${SITE_URL}</link>` +
      `<description>Erreur lors de la génération du flux</description>` +
      `</channel>` +
      `</rss>`;

    return new Response(errorXml, {
      status: 200,
      headers: corsHeaders,
    });
  }
});
