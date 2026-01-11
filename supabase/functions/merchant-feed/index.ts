import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://j2ltextiles.fr";
const SHOP_NAME = "J2LTextiles";
const TVA_RATE = 1.20; // 20% TVA
const PAGE_SIZE = 1000; // Supabase default limit

// Escape XML special characters
function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Clean and truncate description
function cleanDescription(desc: string | null | undefined, maxLength = 5000): string {
  if (!desc) return "";
  // Remove HTML tags
  let clean = desc.replace(/<[^>]*>/g, " ");
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // Truncate if needed
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + "...";
  }
  return escapeXml(clean);
}

// Map category to Google Product Category
function mapToGoogleCategory(category: string | null, familyFr: string | null): string {
  const cat = (category || familyFr || "").toLowerCase();
  
  // Clothing categories
  if (cat.includes("t-shirt") || cat.includes("tee-shirt")) return "Vêtements et accessoires > Vêtements > Hauts > T-shirts";
  if (cat.includes("polo")) return "Vêtements et accessoires > Vêtements > Hauts > Polos";
  if (cat.includes("sweat") || cat.includes("hoodie")) return "Vêtements et accessoires > Vêtements > Hauts > Sweats à capuche et sweat-shirts";
  if (cat.includes("veste") || cat.includes("jacket")) return "Vêtements et accessoires > Vêtements > Vestes et manteaux";
  if (cat.includes("pantalon") || cat.includes("pant")) return "Vêtements et accessoires > Vêtements > Pantalons";
  if (cat.includes("short")) return "Vêtements et accessoires > Vêtements > Shorts";
  if (cat.includes("casquette") || cat.includes("cap") || cat.includes("bonnet")) return "Vêtements et accessoires > Accessoires vestimentaires > Chapeaux";
  if (cat.includes("sac") || cat.includes("bag")) return "Vêtements et accessoires > Sacs et bagages";
  if (cat.includes("tablier") || cat.includes("apron")) return "Vêtements et accessoires > Vêtements > Tabliers";
  if (cat.includes("gilet") || cat.includes("bodywarmer")) return "Vêtements et accessoires > Vêtements > Vestes et manteaux > Gilets";
  if (cat.includes("chemise") || cat.includes("shirt")) return "Vêtements et accessoires > Vêtements > Hauts > Chemises et chemisiers";
  
  // Default to general apparel
  return "Vêtements et accessoires > Vêtements";
}

// Fetch all products with pagination
async function fetchAllProducts(supabase: any) {
  const allProducts: any[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: products, error } = await supabase
      .from("products")
      .select("sku, name, brand, category, family_fr, sub_family_fr, description, images, price_ht, colors, sizes, stock, updated_at")
      .not("price_ht", "is", null)
      .gt("price_ht", 0)
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(`Error fetching products page ${page}:`, error);
      throw error;
    }

    if (products && products.length > 0) {
      allProducts.push(...products);
      console.log(`Fetched page ${page + 1}: ${products.length} products (total: ${allProducts.length})`);
    }

    // If we got less than PAGE_SIZE, we've reached the end
    hasMore = products && products.length === PAGE_SIZE;
    page++;
  }

  return allProducts;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ALL products with pagination
    const products = await fetchAllProducts(supabase);

    console.log(`Generating Merchant Center feed for ${products.length} products`);

    let productsIncluded = 0;

    // Build XML feed
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${SHOP_NAME} - Catalogue Produits</title>
<link>${SITE_URL}</link>
<description>Textiles personnalisables pour professionnels - T-shirts, polos, vestes, sacs et accessoires</description>
`;

    for (const product of products) {
      // Skip products without essential data
      if (!product.name || !product.sku) continue;

      const images = Array.isArray(product.images) ? product.images : [];
      const mainImage = images[0] || "";
      
      // Skip products without images
      if (!mainImage) continue;

      productsIncluded++;

      // Calculate price TTC (with 20% VAT)
      const priceTTC = product.price_ht ? (parseFloat(product.price_ht) * TVA_RATE).toFixed(2) : "0.00";
      
      // Build product URL
      const productUrl = `${SITE_URL}/produit/${encodeURIComponent(product.sku)}`;
      
      // Get availability
      const availability = (product.stock === null || product.stock === undefined || product.stock > 0) 
        ? "in_stock" 
        : "out_of_stock";

      // Get colors for color attribute
      const colors = Array.isArray(product.colors) ? product.colors : [];
      const colorNames = colors
        .map((c: { name?: string }) => c.name || "")
        .filter(Boolean)
        .slice(0, 3)
        .join("/");

      // Get sizes
      const sizes = Array.isArray(product.sizes) ? product.sizes : [];
      const sizeList = sizes.slice(0, 5).join("/");

      // Google product category
      const googleCategory = mapToGoogleCategory(product.category, product.family_fr);

      xml += `<item>
  <g:id>${escapeXml(product.sku)}</g:id>
  <g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>
  <g:description>${cleanDescription(product.description)}</g:description>
  <g:link>${escapeXml(productUrl)}</g:link>
  <g:image_link>${escapeXml(mainImage)}</g:image_link>
`;

      // Add additional images (up to 10 total)
      for (let i = 1; i < Math.min(images.length, 10); i++) {
        xml += `  <g:additional_image_link>${escapeXml(images[i])}</g:additional_image_link>
`;
      }

      xml += `  <g:availability>${availability}</g:availability>
  <g:price>${priceTTC} EUR</g:price>
  <g:brand>${escapeXml(product.brand) || SHOP_NAME}</g:brand>
  <g:condition>new</g:condition>
  <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
  <g:product_type>${escapeXml(product.family_fr || product.category || "Vêtements")}</g:product_type>
`;

      // Optional: MPN (using SKU)
      xml += `  <g:mpn>${escapeXml(product.sku)}</g:mpn>
`;

      // Optional: Color
      if (colorNames) {
        xml += `  <g:color>${escapeXml(colorNames)}</g:color>
`;
      }

      // Optional: Size
      if (sizeList) {
        xml += `  <g:size>${escapeXml(sizeList)}</g:size>
`;
      }

      // Shipping - France
      xml += `  <g:shipping>
    <g:country>FR</g:country>
    <g:service>Standard</g:service>
    <g:price>0 EUR</g:price>
  </g:shipping>
`;

      // Identifier exists (we have MPN)
      xml += `  <g:identifier_exists>true</g:identifier_exists>
`;

      // Return policy - Professional B2B (custom products, no returns)
      xml += `  <g:return_policy_label>no_returns</g:return_policy_label>
`;

      xml += `</item>
`;
    }

    xml += `</channel>
</rss>`;

    console.log(`Generated Merchant Center feed: ${productsIncluded} products included (${products.length - productsIncluded} skipped - no images)`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Merchant feed generation error:", errMsg);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate merchant feed: ${errMsg}</error>`,
      { status: 500, headers: corsHeaders }
    );
  }
});
