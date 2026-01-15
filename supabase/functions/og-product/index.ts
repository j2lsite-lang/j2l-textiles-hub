import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract possible SKU candidates from slug.
// Supported formats:
// - "product-name-SKU" (SKU at the end)
// - "SKU-product-name" (SKU at the beginning)
// - "product-name" where the first token is the SKU (e.g. "pa5000-bandeau-de-sport")
function extractSkuCandidates(slug: string): string[] {
  const parts = slug.split("-").filter(Boolean);

  const candidates = [
    slug,
    parts[0],
    parts[parts.length - 1],
    ...parts,
  ]
    .filter(Boolean)
    .map((s) => s.trim())
    // Only keep values that look like SKUs (usually contain at least one digit)
    .filter((s) => /\d/.test(s) && s.length >= 3 && s.length <= 24)
    .map((s) => s.toUpperCase());

  // Deduplicate while preserving order
  return [...new Set(candidates)];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  console.log("og-product function called:", req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    
    console.log("Processing slug:", slug);
    
    if (!slug) {
      console.error("Missing slug parameter");
      return new Response("Missing slug parameter", { status: 400 });
    }

    const skuCandidates = extractSkuCandidates(slug);
    console.log("SKU candidates:", skuCandidates);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch product from database (try multiple SKU candidates extracted from the slug)
    const { data: products, error } = await supabase
      .from("products")
      .select("sku, name, brand, description, price_ht, category, images, colors")
      .in("sku", skuCandidates)
      .limit(1);

    const product = products?.[0] ?? null;

    if (error || !product) {
      console.error("Product not found:", slug, skuCandidates, error);
      return new Response("Product not found", { status: 404 });
    }

    console.log("Product found:", product.name);

    // Parse images - prefer image #2 (index 1) if available, otherwise first image
    const images = Array.isArray(product.images) ? product.images : [];
    const getAbsoluteUrl = (img: string): string => {
      if (!img || img.trim() === "") return "https://j2ltextiles.fr/og-image.jpg";
      if (img.startsWith("http://") || img.startsWith("https://")) return img;
      const cleanPath = img.startsWith("/") ? img : `/${img}`;
      return `https://j2ltextiles.fr${cleanPath}`;
    };
    
    // Use image #2 if available (better product shot), otherwise first
    const primaryImage = images.length > 1 
      ? getAbsoluteUrl(images[1] as string)
      : getAbsoluteUrl(images[0] as string);
    
    console.log("Primary image URL:", primaryImage);

    // Calculate TTC price
    const priceHT = product.price_ht || 0;
    const priceTTC = Math.round(priceHT * 1.2 * 100) / 100;

    // Build canonical URL (clean, no tracking params)
    const canonicalUrl = `https://j2ltextiles.fr/produit/${slug}`;

    // Title and description
    const title = `${product.name}${product.brand ? ` - ${product.brand}` : ""} | J2L Textiles`.slice(0, 60);
    const rawDesc = product.description || "";
    const description = rawDesc.length > 130
      ? `${rawDesc.slice(0, 130).trim()}...`
      : rawDesc.length > 0
        ? rawDesc
        : `${product.name} personnalisable par ${product.brand || "marque premium"}. Broderie, sérigraphie, flocage. Livraison France. Devis gratuit.`;

    // JSON-LD Product schema (Pinterest Rich Pins)
    const productJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || `${product.name} - Textile professionnel personnalisable`,
      sku: product.sku,
      mpn: product.sku,
      brand: {
        "@type": "Brand",
        name: product.brand || "TopTex",
      },
      image: images.slice(0, 10).map((img: string) => getAbsoluteUrl(img)),
      category: product.category || "Vêtements",
    };

    // Add offers only if pricing is available
    if (typeof priceHT === "number" && priceHT > 0) {
      productJsonLd.offers = {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "EUR",
        price: priceTTC.toFixed(2),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "J2L Textiles",
          url: "https://j2ltextiles.fr",
        },
      };
    }

    // Generate HTML with all meta tags
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph / Facebook / Instagram / WhatsApp / LinkedIn -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${primaryImage}">
  <meta property="og:image:secure_url" content="${primaryImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.name)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:site_name" content="J2L Textiles">
  <meta property="og:locale" content="fr_FR">
  
  <!-- Product specific OG tags -->
  <meta property="product:price:amount" content="${priceTTC.toFixed(2)}">
  <meta property="product:price:currency" content="EUR">
  <meta property="product:availability" content="in stock">
  <meta property="product:condition" content="new">
  <meta property="product:retailer_item_id" content="${escapeHtml(product.sku)}">
  ${product.brand ? `<meta property="product:brand" content="${escapeHtml(product.brand)}">` : ""}
  ${product.category ? `<meta property="product:category" content="${escapeHtml(product.category)}">` : ""}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${primaryImage}">
  
  <!-- Pinterest Rich Pins -->
  <meta name="pinterest-rich-pin" content="true">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>
  
  <!-- Redirect to SPA after meta tags are read -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
  <p>Redirection vers <a href="${canonicalUrl}">${escapeHtml(product.name)}</a>...</p>
</body>
</html>`;

    console.log("Returning HTML with OG tags");

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating OG page:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
