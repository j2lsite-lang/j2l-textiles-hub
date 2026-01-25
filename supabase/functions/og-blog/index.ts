import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  console.log("og-blog function called:", req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    
    console.log("Processing blog slug:", slug);
    
    if (!slug) {
      console.error("Missing slug parameter");
      return new Response("Missing slug parameter", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published article by slug
    const { data: article, error } = await supabase
      .from("blog_articles")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !article) {
      console.error("Article not found:", slug, error);
      return new Response("Article not found", { status: 404 });
    }

    console.log("Article found:", article.title);

    // Build absolute image URL
    const getAbsoluteUrl = (img: string | null): string => {
      if (!img || img.trim() === "") return "https://j2ltextiles.fr/og-image.jpg";
      if (img.startsWith("http://") || img.startsWith("https://")) return img;
      const cleanPath = img.startsWith("/") ? img : `/${img}`;
      return `https://j2ltextiles.fr${cleanPath}`;
    };

    const ogImageUrl = getAbsoluteUrl(article.cover_image);
    console.log("OG image URL:", ogImageUrl);

    // Build canonical URL
    const canonicalUrl = `https://j2ltextiles.fr/blog/${slug}`;

    // Title and description with fallbacks
    const title = (article.meta_title || article.title || "Article").slice(0, 60);
    const fullTitle = `${title} | J2L Textiles`;
    
    const rawDesc = article.meta_description || article.excerpt || "";
    const description = rawDesc.length > 155
      ? `${rawDesc.slice(0, 152).trim()}...`
      : rawDesc.length > 0
        ? rawDesc
        : "Découvrez nos articles sur la personnalisation textile professionnelle. Conseils, guides et actualités.";

    // Published date for article schema
    const publishedAt = article.published_at || article.created_at;
    const updatedAt = article.updated_at;

    // JSON-LD Article schema
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: description,
      image: ogImageUrl,
      url: canonicalUrl,
      datePublished: publishedAt,
      dateModified: updatedAt,
      author: {
        "@type": "Person",
        name: article.author_name || "J2L Textiles",
      },
      publisher: {
        "@type": "Organization",
        name: "J2L Textiles",
        url: "https://j2ltextiles.fr",
        logo: {
          "@type": "ImageObject",
          url: "https://j2ltextiles.fr/og-image.jpg",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };

    // Generate HTML with all meta tags in static <head>
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="title" content="${escapeHtml(fullTitle)}">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(article.title)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:site_name" content="J2L Textiles">
  <meta property="og:locale" content="fr_FR">
  
  <!-- Article specific OG tags -->
  <meta property="article:published_time" content="${publishedAt}">
  <meta property="article:modified_time" content="${updatedAt}">
  <meta property="article:author" content="${escapeHtml(article.author_name || "J2L Textiles")}">
  ${article.tags && article.tags.length > 0 
    ? article.tags.map((tag: string) => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join("\n  ")
    : ""}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(article.title)}">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>
  
  <!-- Redirect to SPA after meta tags are read by crawlers -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
  <p>Redirection vers <a href="${canonicalUrl}">${escapeHtml(article.title)}</a>...</p>
</body>
</html>`;

    console.log("Returning HTML with OG tags for blog article");

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating OG page for blog:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
