import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://j2ltextiles.fr";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all product SKUs
    const { data: products, error } = await supabase
      .from("products")
      .select("sku, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/catalogue", priority: "0.9", changefreq: "daily" },
      { loc: "/personnalisation", priority: "0.8", changefreq: "monthly" },
      { loc: "/devis", priority: "0.8", changefreq: "monthly" },
      { loc: "/faq", priority: "0.6", changefreq: "monthly" },
      { loc: "/contact", priority: "0.7", changefreq: "monthly" },
      { loc: "/mentions-legales", priority: "0.3", changefreq: "yearly" },
      { loc: "/confidentialite", priority: "0.3", changefreq: "yearly" },
      { loc: "/cgv", priority: "0.3", changefreq: "yearly" },
    ];

    // Location pages - Departments
    const departments = [
      "vosges", "meurthe-et-moselle", "moselle", "bas-rhin", "haut-rhin",
      "meuse", "haute-marne", "haute-saone", "doubs", "marne"
    ];

    // Location pages - Cities
    const cities = [
      { dept: "vosges", city: "epinal" },
      { dept: "vosges", city: "saint-die-des-vosges" },
      { dept: "vosges", city: "gerardmer" },
      { dept: "meurthe-et-moselle", city: "nancy" },
      { dept: "moselle", city: "metz" },
      { dept: "moselle", city: "thionville" },
      { dept: "bas-rhin", city: "strasbourg" },
      { dept: "haut-rhin", city: "mulhouse" },
      { dept: "haut-rhin", city: "colmar" },
      { dept: "marne", city: "reims" },
      { dept: "doubs", city: "besancon" },
      { dept: "meuse", city: "verdun" },
      { dept: "rhone", city: "lyon" },
      { dept: "bouches-du-rhone", city: "marseille" },
      { dept: "haute-garonne", city: "toulouse" },
      { dept: "gironde", city: "bordeaux" },
      { dept: "nord", city: "lille" },
      { dept: "loire-atlantique", city: "nantes" },
      { dept: "herault", city: "montpellier" },
      { dept: "ille-et-vilaine", city: "rennes" },
    ];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add zones page
    xml += `  <url>
    <loc>${SITE_URL}/zones</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add department pages
    for (const dept of departments) {
      xml += `  <url>
    <loc>${SITE_URL}/zones/${dept}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }

    // Add city pages
    for (const { dept, city } of cities) {
      xml += `  <url>
    <loc>${SITE_URL}/zones/${dept}/${city}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }

    // Add all product pages
    for (const product of products || []) {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${SITE_URL}/produit/${encodeURIComponent(product.sku)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    console.log(`Generated sitemap with ${staticPages.length + 1 + departments.length + cities.length + (products?.length || 0)} URLs`);

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
