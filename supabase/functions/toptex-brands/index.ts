// Backend function: fetch official brand logos from TopTex brand page
// Public endpoint (no secrets). Used by the catalogue brands grid.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function decodeHtml(input: string): string {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function normalizeLogoUrl(url: string): string {
  const cleaned = decodeHtml(url).trim();
  // Prefer a larger size when the site uses ?w=...
  try {
    const u = new URL(cleaned);
    if (u.searchParams.has('w')) u.searchParams.set('w', '480');
    return u.toString();
  } catch {
    return cleaned;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch('https://www.toptex.fr/marques', {
      headers: {
        // Some sites deliver different HTML without a UA
        'User-Agent': 'Mozilla/5.0 (compatible; LovableBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch brands page: ${res.status}` }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await res.text();

    // Try to parse <img alt="Brand" src="...cdn.toptex.com/logos/...">
    const items: Array<{ name: string; logoUrl: string }> = [];

    const imgRegex = /<img[^>]+?(?:alt|title)=\"([^\"]+?)\"[^>]+?(?:src|data-src)=\"([^\"]*cdn\.toptex\.com\/logos\/[^\"]+?)\"[^>]*>/gi;
    for (const match of html.matchAll(imgRegex)) {
      const name = decodeHtml(match[1]).trim();
      const logoUrl = normalizeLogoUrl(match[2]);
      if (name && logoUrl) items.push({ name, logoUrl });
    }

    // Fallback: sometimes logos appear without alt; collect URLs anyway
    const urlRegex = /(https:\/\/cdn\.toptex\.com\/logos\/[A-Za-z0-9%._\-]+\.(?:png|jpg|jpeg|svg))(\?[^\"'\s<]*)?/gi;
    for (const match of html.matchAll(urlRegex)) {
      const url = normalizeLogoUrl(`${match[1]}${match[2] || ''}`);
      if (!items.some((i) => i.logoUrl === url)) {
        items.push({ name: '', logoUrl: url });
      }
    }

    // De-duplicate by brand name (keep first), and keep nameless URLs as extras
    const byName = new Map<string, string>();
    const extras: string[] = [];

    for (const it of items) {
      if (it.name) {
        if (!byName.has(it.name)) byName.set(it.name, it.logoUrl);
      } else {
        extras.push(it.logoUrl);
      }
    }

    const brands = Array.from(byName.entries()).map(([name, logoUrl]) => ({ name, logoUrl }));

    return new Response(
      JSON.stringify({ brands, extras, fetchedAt: new Date().toISOString() }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // cache at the edge + browser to keep it snappy
          'Cache-Control': 'public, max-age=21600',
        },
      }
    );
  } catch (e) {
    console.error('toptex-brands error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
