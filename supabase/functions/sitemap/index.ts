import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://j2ltextiles.fr";

// Génère un slug SEO-friendly pour les produits
function generateProductSlug(sku: string, name?: string | null): string {
  const skuLower = sku.toLowerCase();
  if (!name) return skuLower;
  
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  
  return `${skuLower}-${nameSlug}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all product SKUs and names for SEO URLs (no limit - get all products)
    const { data: products, error } = await supabase
      .from("products")
      .select("sku, name, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    console.log(`Found ${products?.length || 0} products for sitemap`);

    // Build XML with all product URLs
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add all product pages with SEO-friendly URLs
    for (const product of products || []) {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const productSlug = generateProductSlug(product.sku, product.name);
      xml += `  <url>
    <loc>${SITE_URL}/produit/${encodeURIComponent(productSlug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${products?.length || 0} product URLs`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>`,
      { status: 500, headers: corsHeaders }
    );
  }
});
