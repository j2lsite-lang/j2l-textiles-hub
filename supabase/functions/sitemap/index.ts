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

// French departments and cities for SEO pages
const frenchZones = [
  { slug: "ain", cities: ["bourg-en-bresse", "oyonnax"] },
  { slug: "aisne", cities: ["saint-quentin", "laon"] },
  { slug: "allier", cities: ["montlucon", "vichy"] },
  { slug: "alpes-de-haute-provence", cities: ["manosque"] },
  { slug: "hautes-alpes", cities: ["gap"] },
  { slug: "alpes-maritimes", cities: ["nice", "cannes", "antibes"] },
  { slug: "ardeche", cities: ["annonay", "aubenas"] },
  { slug: "ardennes", cities: ["charleville-mezieres"] },
  { slug: "ariege", cities: ["pamiers", "foix"] },
  { slug: "aube", cities: ["troyes"] },
  { slug: "aude", cities: ["carcassonne", "narbonne"] },
  { slug: "aveyron", cities: ["rodez", "millau"] },
  { slug: "bouches-du-rhone", cities: ["marseille", "aix-en-provence", "arles"] },
  { slug: "calvados", cities: ["caen", "lisieux"] },
  { slug: "cantal", cities: ["aurillac"] },
  { slug: "charente", cities: ["angouleme", "cognac"] },
  { slug: "charente-maritime", cities: ["la-rochelle", "saintes", "rochefort"] },
  { slug: "cher", cities: ["bourges", "vierzon"] },
  { slug: "correze", cities: ["brive-la-gaillarde", "tulle"] },
  { slug: "cote-d-or", cities: ["dijon", "beaune"] },
  { slug: "cotes-d-armor", cities: ["saint-brieuc", "lannion"] },
  { slug: "creuse", cities: ["gueret"] },
  { slug: "dordogne", cities: ["perigueux", "bergerac"] },
  { slug: "doubs", cities: ["besancon", "montbeliard"] },
  { slug: "drome", cities: ["valence", "montelimar"] },
  { slug: "eure", cities: ["evreux", "vernon"] },
  { slug: "eure-et-loir", cities: ["chartres", "dreux"] },
  { slug: "finistere", cities: ["brest", "quimper"] },
  { slug: "corse-du-sud", cities: ["ajaccio", "porto-vecchio"] },
  { slug: "haute-corse", cities: ["bastia"] },
  { slug: "gard", cities: ["nimes", "ales"] },
  { slug: "haute-garonne", cities: ["toulouse", "colomiers", "muret"] },
  { slug: "gers", cities: ["auch"] },
  { slug: "gironde", cities: ["bordeaux", "merignac", "pessac"] },
  { slug: "herault", cities: ["montpellier", "beziers", "sete"] },
  { slug: "ille-et-vilaine", cities: ["rennes", "saint-malo"] },
  { slug: "indre", cities: ["chateauroux"] },
  { slug: "indre-et-loire", cities: ["tours", "amboise"] },
  { slug: "isere", cities: ["grenoble", "vienne", "bourgoin-jallieu"] },
  { slug: "jura", cities: ["lons-le-saunier", "dole"] },
  { slug: "landes", cities: ["mont-de-marsan", "dax"] },
  { slug: "loir-et-cher", cities: ["blois", "vendome"] },
  { slug: "loire", cities: ["saint-etienne", "roanne"] },
  { slug: "haute-loire", cities: ["le-puy-en-velay"] },
  { slug: "loire-atlantique", cities: ["nantes", "saint-nazaire"] },
  { slug: "loiret", cities: ["orleans", "montargis"] },
  { slug: "lot", cities: ["cahors", "figeac"] },
  { slug: "lot-et-garonne", cities: ["agen", "villeneuve-sur-lot"] },
  { slug: "lozere", cities: ["mende"] },
  { slug: "maine-et-loire", cities: ["angers", "cholet", "saumur"] },
  { slug: "manche", cities: ["cherbourg-en-cotentin", "saint-lo"] },
  { slug: "marne", cities: ["reims", "chalons-en-champagne", "epernay"] },
  { slug: "haute-marne", cities: ["chaumont", "saint-dizier"] },
  { slug: "mayenne", cities: ["laval"] },
  { slug: "meurthe-et-moselle", cities: ["nancy"] },
  { slug: "meuse", cities: ["bar-le-duc", "verdun"] },
  { slug: "morbihan", cities: ["lorient", "vannes"] },
  { slug: "moselle", cities: ["metz", "thionville", "forbach"] },
  { slug: "nievre", cities: ["nevers"] },
  { slug: "nord", cities: ["lille", "roubaix", "tourcoing", "dunkerque", "valenciennes"] },
  { slug: "oise", cities: ["beauvais", "compiegne", "creil"] },
  { slug: "orne", cities: ["alencon", "flers"] },
  { slug: "pas-de-calais", cities: ["calais", "boulogne-sur-mer", "arras", "lens"] },
  { slug: "puy-de-dome", cities: ["clermont-ferrand", "riom"] },
  { slug: "pyrenees-atlantiques", cities: ["pau", "bayonne", "biarritz"] },
  { slug: "hautes-pyrenees", cities: ["tarbes", "lourdes"] },
  { slug: "pyrenees-orientales", cities: ["perpignan"] },
  { slug: "bas-rhin", cities: ["strasbourg", "haguenau"] },
  { slug: "haut-rhin", cities: ["mulhouse", "colmar"] },
  { slug: "rhone", cities: ["lyon", "villeurbanne", "venissieux"] },
  { slug: "haute-saone", cities: ["vesoul"] },
  { slug: "saone-et-loire", cities: ["chalon-sur-saone", "macon"] },
  { slug: "sarthe", cities: ["le-mans"] },
  { slug: "savoie", cities: ["chambery", "aix-les-bains"] },
  { slug: "haute-savoie", cities: ["annecy", "annemasse", "thonon-les-bains"] },
  { slug: "paris", cities: [] },
  { slug: "seine-maritime", cities: ["le-havre", "rouen", "dieppe"] },
  { slug: "seine-et-marne", cities: ["meaux", "melun", "chelles"] },
  { slug: "yvelines", cities: ["versailles", "sartrouville", "mantes-la-jolie"] },
  { slug: "deux-sevres", cities: ["niort"] },
  { slug: "somme", cities: ["amiens", "abbeville"] },
  { slug: "tarn", cities: ["albi", "castres"] },
  { slug: "tarn-et-garonne", cities: ["montauban"] },
  { slug: "var", cities: ["toulon", "frejus", "hyeres"] },
  { slug: "vaucluse", cities: ["avignon", "carpentras", "orange"] },
  { slug: "vendee", cities: ["la-roche-sur-yon", "les-sables-d-olonne"] },
  { slug: "vienne", cities: ["poitiers", "chatellerault"] },
  { slug: "haute-vienne", cities: ["limoges"] },
  { slug: "vosges", cities: ["epinal", "saint-die-des-vosges"] },
  { slug: "yonne", cities: ["auxerre", "sens"] },
  { slug: "territoire-de-belfort", cities: ["belfort"] },
  { slug: "essonne", cities: ["evry-courcouronnes", "corbeil-essonnes", "massy"] },
  { slug: "hauts-de-seine", cities: ["nanterre", "boulogne-billancourt", "colombes"] },
  { slug: "seine-saint-denis", cities: ["saint-denis", "montreuil", "aubervilliers"] },
  { slug: "val-de-marne", cities: ["creteil", "vitry-sur-seine", "champigny-sur-marne"] },
  { slug: "val-d-oise", cities: ["argenteuil", "cergy", "sarcelles"] },
];

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

    // Build XML with all URLs (static pages + products + zones)
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
  <!-- Zones SEO -->
  <url><loc>${SITE_URL}/zones</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
`;

    // Add zone department pages and city pages
    let zoneCount = 1; // for /zones
    for (const dept of frenchZones) {
      xml += `  <url><loc>${SITE_URL}/zones/${dept.slug}</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>\n`;
      zoneCount++;
      for (const city of dept.cities) {
        xml += `  <url><loc>${SITE_URL}/zones/${dept.slug}/${city}</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>\n`;
        zoneCount++;
      }
    }

    // Add all product pages with SEO-friendly URLs
    for (const product of products || []) {
      const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : today;
      const productSlug = generateProductSlug(product.sku, product.name);
      xml += `  <url><loc>${SITE_URL}/produit/${encodeURIComponent(productSlug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
`;
    }

    xml += `</urlset>`;

    const staticPages = 23;
    const totalUrls = staticPages + zoneCount + (products?.length || 0);
    console.log(`Generated sitemap with ${totalUrls} URLs (${staticPages} static + ${zoneCount} zones + ${products?.length || 0} products)`);

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