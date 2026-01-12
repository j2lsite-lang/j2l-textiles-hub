import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
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
    .replace(/"/g, "&quot;")
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products from database - only those with valid data
    const { data: products, error } = await supabase
      .from("products")
      .select("id, sku, name, description, brand, price_ht, images, stock, category")
      .not("images", "is", null)
      .not("price_ht", "is", null)
      .not("sku", "is", null)
      .not("name", "is", null)
      .limit(5000);

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    // Filter out products with empty/invalid data
    const validProducts = (products || []).filter((product) => {
      const images = Array.isArray(product.images) ? product.images : [];
      return (
        product.sku &&
        product.name &&
        product.price_ht &&
        images.length > 0 &&
        images[0]
      );
    });

    console.log(`Generating merchant feed with ${validProducts.length} valid products out of ${products?.length || 0} fetched`);

    // Generate XML items
    const items = validProducts.map((product) => {
      const images = Array.isArray(product.images) ? product.images : [];
      const mainImage = escapeXml(images[0]);
      const additionalImages = images.slice(1, 10);
      
      // Calculate price with margin (add 20% for retail display)
      const price = product.price_ht ? (parseFloat(product.price_ht) * 1.2).toFixed(2) : "0.00";
      
      // Availability based on stock
      const availability = product.stock === null || product.stock > 0 ? "in_stock" : "out_of_stock";

      const additionalImagesXml = additionalImages
        .filter((img: string) => img && img.trim())
        .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("");

      return `<item>` +
        `<g:id>${escapeXml(product.sku)}</g:id>` +
        `<g:title>${escapeXml(product.name?.substring(0, 150))}</g:title>` +
        `<g:description>${escapeXml(product.description?.substring(0, 5000) || product.name)}</g:description>` +
        `<g:link>${SITE_URL}/produit/${escapeXml(product.sku)}</g:link>` +
        `<g:image_link>${mainImage}</g:image_link>` +
        additionalImagesXml +
        `<g:availability>${availability}</g:availability>` +
        `<g:price>${price} EUR</g:price>` +
        `<g:brand>${escapeXml(product.brand || SHOP_NAME)}</g:brand>` +
        `<g:condition>new</g:condition>` +
        `<g:google_product_category>${getGoogleCategory(product.category)}</g:google_product_category>` +
        `<g:product_type>${escapeXml(product.category || "Vêtements")}</g:product_type>` +
        `<g:identifier_exists>false</g:identifier_exists>` +
        `<g:mpn>${escapeXml(product.sku)}</g:mpn>` +
        `<g:shipping>` +
          `<g:country>FR</g:country>` +
          `<g:service>Standard</g:service>` +
          `<g:price>0.00 EUR</g:price>` +
        `</g:shipping>` +
      `</item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
      `<channel>` +
      `<title>${SHOP_NAME} - Catalogue Produits</title>` +
      `<link>${SITE_URL}</link>` +
      `<description>Vêtements professionnels personnalisables - ${SHOP_NAME}</description>` +
      items +
      `</channel>` +
      `</rss>`;

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
