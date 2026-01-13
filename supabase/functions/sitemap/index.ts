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

    // Fetch all product SKUs and names for SEO URLs
    // NOTE: PostgREST defaults to max 1000 rows per request, so we paginate.
    const PAGE_SIZE = 1000;
    const products: Array<{ sku: string; name: string | null; updated_at: string | null }> = [];

    let lastSku: string | null = null;

    for (;;) {
      let query = supabase
        .from("products")
        .select("sku, name, updated_at")
        .order("sku", { ascending: true })
        .limit(PAGE_SIZE);

      if (lastSku) query = query.gt("sku", lastSku);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      if (!data || data.length === 0) break;

      products.push(...data);
      lastSku = data[data.length - 1].sku;

      if (data.length < PAGE_SIZE) break;
    }

    console.log(`Found ${products.length} products for sitemap`);

    const today = new Date().toISOString().split('T')[0];

    // Build XML with all URLs (static pages + products)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pages principales -->
  <url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/catalogue</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/personnalisation</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/devis</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/faq</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${SITE_URL}/contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <!-- Catégories -->
  <url><loc>${SITE_URL}/catalogue/t-shirts</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/polos</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/sweats</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/vestes</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/chemises-corporate</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/cuisine-hotellerie</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/sport-loisirs</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/vetements-travail</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/haute-visibilite</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/accessoires</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/catalogue/bagagerie</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <!-- Pages légales -->
  <url><loc>${SITE_URL}/mentions-legales</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${SITE_URL}/confidentialite</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${SITE_URL}/cgv</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${SITE_URL}/retours</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${SITE_URL}/livraison</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <!-- Zones -->
  <url><loc>${SITE_URL}/zones</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
`;

    // Add all product pages with SEO-friendly URLs
    for (const product of products || []) {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : today;
      const productSlug = generateProductSlug(product.sku, product.name);
      xml += `  <url><loc>${SITE_URL}/produit/${encodeURIComponent(productSlug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
`;
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${23 + (products?.length || 0)} URLs (23 static + ${products?.length || 0} products)`);

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
