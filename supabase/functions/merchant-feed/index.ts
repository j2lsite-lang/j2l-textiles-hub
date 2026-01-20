import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
};

const SITE_URL = "https://j2ltextiles.fr";
const SHOP_NAME = "J2LTextiles";

// Escape XML special characters and remove invalid XML characters
function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
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

// Determine age_group from product name (kids vs adult)
function extractAgeGroup(name: string | null): string {
  if (!name) return "adult";
  const nameLower = name.toLowerCase();

  // Kids keywords
  if (
    nameLower.includes("enfant") ||
    nameLower.includes("enfants") ||
    nameLower.includes("kid") ||
    nameLower.includes("kids") ||
    nameLower.includes("child") ||
    nameLower.includes("children") ||
    nameLower.includes("junior") ||
    nameLower.includes("bébé") ||
    nameLower.includes("bebe") ||
    nameLower.includes("baby") ||
    nameLower.includes("infant") ||
    nameLower.includes("toddler") ||
    /\d+\s*[/-]\s*\d+\s*ans/i.test(name) || // 4-6 ans, 8/10 ans
    /\d+\s*ans/i.test(name) // 6 ans
  ) {
    return "kids";
  }

  return "adult";
}

// Determine gender from product name - IMPROVED LOGIC
function extractGender(name: string | null): string {
  if (!name) return "unisex";
  const nameLower = name.toLowerCase();

  // Women keywords - check FIRST for female-specific items
  const femaleKeywords = [
    "femme", "woman", "women", "fille", "girl", "lady", "ladies",
    "robe", "jupe", "legging femme", "blouse"
  ];
  
  for (const keyword of femaleKeywords) {
    if (nameLower.includes(keyword)) {
      return "female";
    }
  }

  // Men keywords
  const maleKeywords = [
    "homme", "man", "men", "garçon", "boy", "garcon"
  ];
  
  for (const keyword of maleKeywords) {
    if (nameLower.includes(keyword)) {
      return "male";
    }
  }

  return "unisex";
}

// Extract all colors from colors array
function extractColors(colors: unknown): Array<{ name: string; code: string }> {
  if (!colors || !Array.isArray(colors) || colors.length === 0) return [];
  return colors.filter((c): c is { name: string; code: string } => 
    typeof c === "object" && c !== null && "name" in c && typeof (c as any).name === "string"
  );
}

// Extract all sizes from sizes array
function extractSizes(sizes: unknown): string[] {
  if (!sizes || !Array.isArray(sizes) || sizes.length === 0) return [];
  return sizes.filter((s): s is string => typeof s === "string" && s.trim() !== "");
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

function pickImages(images: unknown): { main: string; additional: string[] } {
  const raw = normalizeImageUrls(images);
  const filtered = raw.filter(isAllowedImageUrl);

  const base = (filtered.length ? filtered : raw)
    .filter((u) => u.startsWith("http"));

  const unique = Array.from(new Set(base));
  unique.sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));

  const main = unique[0] || "";
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

// Generate a unique variant ID
function generateVariantId(sku: string, color: string, size: string): string {
  const colorSlug = color.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10);
  const sizeSlug = size.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10);
  return `${sku}_${colorSlug}_${sizeSlug}`;
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

    console.log(`Processing ${validProducts.length} valid products for variants`);

    // Generate XML items - CREATE VARIANTS for each color/size combination
    const items: string[] = [];
    let variantCount = 0;

    for (const product of validProducts) {
      const { main, additional } = pickImages(product.images);
      const mainImage = escapeXml(main);

      // Calculate price with margin (add 20% for retail display)
      const price = product.price_ht
        ? (parseFloat(String(product.price_ht)) * 1.2).toFixed(2)
        : "0.00";

      // Availability - always in_stock for B2B (products are made to order)
      const availability = "in_stock";

      // Extract gender and age_group from name
      const gender = extractGender(product.name);
      const ageGroup = extractAgeGroup(product.name);

      const additionalImagesXml = additional
        .filter((img: string) => img && img.trim())
        .map((img: string) =>
          `\n<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
        )
        .join("");

      const colors = extractColors(product.colors);
      const sizes = extractSizes(product.sizes);

      // If we have colors AND sizes, create variants for each combination
      if (colors.length > 0 && sizes.length > 0) {
        for (const color of colors) {
          for (const size of sizes) {
            const variantId = generateVariantId(product.sku, color.name, size);
            const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}?color=${encodeURIComponent(color.name)}&size=${encodeURIComponent(size)}`;

            items.push(
              `<item>` +
              `<g:id>${escapeXml(variantId)}</g:id>` +
              `<g:item_group_id>${escapeXml(product.sku)}</g:item_group_id>` +
              `<g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>` +
              `<g:description>${escapeXml(buildDescription(product))}</g:description>` +
              `<g:link>${escapeXml(productUrl)}</g:link>` +
              `<g:image_link>${mainImage}</g:image_link>` +
              additionalImagesXml +
              `<g:availability>${availability}</g:availability>` +
              `<g:price>${price} EUR</g:price>` +
              `<g:brand>${escapeXml(product.brand || SHOP_NAME)}</g:brand>` +
              `<g:condition>new</g:condition>` +
              `<g:color>${escapeXml(color.name)}</g:color>` +
              `<g:size>${escapeXml(size)}</g:size>` +
              `<g:gender>${gender}</g:gender>` +
              `<g:age_group>${ageGroup}</g:age_group>` +
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
            variantCount++;
          }
        }
      } 
      // If only colors, create one variant per color
      else if (colors.length > 0) {
        for (const color of colors) {
          const variantId = generateVariantId(product.sku, color.name, "");
          const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}?color=${encodeURIComponent(color.name)}`;

          items.push(
            `<item>` +
            `<g:id>${escapeXml(variantId)}</g:id>` +
            `<g:item_group_id>${escapeXml(product.sku)}</g:item_group_id>` +
            `<g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>` +
            `<g:description>${escapeXml(buildDescription(product))}</g:description>` +
            `<g:link>${escapeXml(productUrl)}</g:link>` +
            `<g:image_link>${mainImage}</g:image_link>` +
            additionalImagesXml +
            `<g:availability>${availability}</g:availability>` +
            `<g:price>${price} EUR</g:price>` +
            `<g:brand>${escapeXml(product.brand || SHOP_NAME)}</g:brand>` +
            `<g:condition>new</g:condition>` +
            `<g:color>${escapeXml(color.name)}</g:color>` +
            `<g:gender>${gender}</g:gender>` +
            `<g:age_group>${ageGroup}</g:age_group>` +
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
          variantCount++;
        }
      }
      // If only sizes, create one variant per size
      else if (sizes.length > 0) {
        for (const size of sizes) {
          const variantId = generateVariantId(product.sku, "", size);
          const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}?size=${encodeURIComponent(size)}`;

          items.push(
            `<item>` +
            `<g:id>${escapeXml(variantId)}</g:id>` +
            `<g:item_group_id>${escapeXml(product.sku)}</g:item_group_id>` +
            `<g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>` +
            `<g:description>${escapeXml(buildDescription(product))}</g:description>` +
            `<g:link>${escapeXml(productUrl)}</g:link>` +
            `<g:image_link>${mainImage}</g:image_link>` +
            additionalImagesXml +
            `<g:availability>${availability}</g:availability>` +
            `<g:price>${price} EUR</g:price>` +
            `<g:brand>${escapeXml(product.brand || SHOP_NAME)}</g:brand>` +
            `<g:condition>new</g:condition>` +
            `<g:size>${escapeXml(size)}</g:size>` +
            `<g:gender>${gender}</g:gender>` +
            `<g:age_group>${ageGroup}</g:age_group>` +
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
          variantCount++;
        }
      }
      // Fallback: no colors or sizes, create single item
      else {
        const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}`;

        items.push(
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
          `<g:gender>${gender}</g:gender>` +
          `<g:age_group>${ageGroup}</g:age_group>` +
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
        variantCount++;
      }
    }

    console.log(`Generated ${variantCount} variant items from ${validProducts.length} products`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
      `<channel>` +
      `<title>${SHOP_NAME} - Catalogue Produits</title>` +
      `<link>${SITE_URL}</link>` +
      `<description>Vêtements professionnels personnalisables - ${SHOP_NAME}</description>` +
      items.join("\n") +
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
