#!/usr/bin/env node
/**
 * Prerender Script - Generates static HTML for SEO
 * Reads sitemap.xml, fetches product data, generates HTML with meta tags
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Supabase client for fetching product data
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ozbzhqmnvbbsnkbsnuja.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YnpocW1udmJic25rYnNudWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzA4OTAsImV4cCI6MjA4MzAwNjg5MH0.yvPGGvi2lt4N2C1aC6IgxMJbwuF1DGxwPgESOQkjs_E';
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://j2ltextiles.fr';
const COMPANY_NAME = 'J2L Textiles';

/**
 * Parse sitemap.xml and extract URLs
 */
function parseSitemap() {
  const sitemapPath = join(PUBLIC_DIR, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.warn('⚠️  sitemap.xml not found, using dist/sitemap.xml');
    const distSitemapPath = join(DIST_DIR, 'sitemap.xml');
    if (!existsSync(distSitemapPath)) {
      console.error('❌ No sitemap.xml found');
      return [];
    }
    return extractUrlsFromSitemap(readFileSync(distSitemapPath, 'utf-8'));
  }
  return extractUrlsFromSitemap(readFileSync(sitemapPath, 'utf-8'));
}

function extractUrlsFromSitemap(xml) {
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Extract SKU from product URL
 */
function extractSkuFromUrl(url) {
  const match = url.match(/\/produit\/([^/?#]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch product data from Supabase
 */
async function fetchProduct(sku) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();
    
    if (error) {
      console.warn(`⚠️  Product ${sku} not found:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`❌ Error fetching product ${sku}:`, err.message);
    return null;
  }
}

/**
 * Generate HTML head with SEO meta tags for a product
 */
function generateProductHtml(product, url) {
  const priceHT = product.price_ht || 0;
  const priceTTC = Math.round(priceHT * 1.2 * 100) / 100;
  
  const title = `${product.name} ${product.brand ? `- ${product.brand}` : ''} | ${COMPANY_NAME}`.slice(0, 60);
  
  const rawDesc = product.description || '';
  const description = rawDesc.length > 130
    ? `${rawDesc.slice(0, 130).trim()}...`
    : rawDesc.length > 0
      ? rawDesc
      : `${product.name} personnalisable par ${product.brand || 'marque premium'}. Broderie, sérigraphie, flocage. Livraison France. Devis gratuit.`;

  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images.length > 0 && images[0] 
    ? (images[0].startsWith('http') ? images[0] : `${SITE_URL}${images[0].startsWith('/') ? '' : '/'}${images[0]}`)
    : `${SITE_URL}/og-image.jpg`;

  const canonical = url;

  // JSON-LD Product
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Textile professionnel personnalisable`,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'TopTex',
    },
    image: images.length > 0 ? images.slice(0, 10).map(img => 
      img.startsWith('http') ? img : `${SITE_URL}${img.startsWith('/') ? '' : '/'}${img}`
    ) : [primaryImage],
    category: product.category || 'Vêtements',
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'EUR',
      price: priceTTC.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: COMPANY_NAME,
        url: SITE_URL,
      },
    },
  };

  // JSON-LD Breadcrumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${SITE_URL}/catalogue` },
      { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="${COMPANY_NAME}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${primaryImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${COMPANY_NAME}">
  <meta property="og:locale" content="fr_FR">
  <meta property="product:price:amount" content="${priceTTC.toFixed(2)}">
  <meta property="product:price:currency" content="EUR">
  <meta property="product:availability" content="in stock">
  ${product.brand ? `<meta property="product:brand" content="${escapeHtml(product.brand)}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${primaryImage}">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>
  
  <!-- Redirect to SPA for interactive experience -->
  <script>
    if (!/bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(navigator.userAgent)) {
      window.location.replace('${canonical}');
    }
  </script>
</head>
<body>
  <noscript>
    <h1>${escapeHtml(product.name)}</h1>
    <p>${escapeHtml(description)}</p>
    <p>Prix: ${priceTTC.toFixed(2)} € TTC</p>
    ${product.brand ? `<p>Marque: ${escapeHtml(product.brand)}</p>` : ''}
    <a href="${SITE_URL}/catalogue">Voir le catalogue</a>
  </noscript>
</body>
</html>`;
}

/**
 * Generate generic page HTML
 */
function generateGenericHtml(url, title, description) {
  const canonical = url;
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow">
  
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${SITE_URL}/og-image.jpg">
  <meta property="og:site_name" content="${COMPANY_NAME}">
  <meta property="og:locale" content="fr_FR">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  
  <script>
    if (!/bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(navigator.userAgent)) {
      window.location.replace('${canonical}');
    }
  </script>
</head>
<body>
  <noscript>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <a href="${SITE_URL}">Accueil J2L Textiles</a>
  </noscript>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get path from URL for file writing
 */
function getPathFromUrl(url) {
  const urlObj = new URL(url);
  let path = urlObj.pathname;
  
  // Remove trailing slash
  if (path.endsWith('/') && path !== '/') {
    path = path.slice(0, -1);
  }
  
  // Root path
  if (path === '/' || path === '') {
    return 'index.html';
  }
  
  // Return path with index.html
  return `${path}/index.html`;
}

/**
 * Page metadata for known routes
 */
const PAGE_METADATA = {
  '/': { title: 'J2L Textiles - Vêtements personnalisés professionnels', description: 'Spécialiste en vêtements personnalisés et textile publicitaire. Broderie, sérigraphie, flocage pour professionnels.' },
  '/catalogue': { title: 'Catalogue textile professionnel | J2L Textiles', description: 'Découvrez notre catalogue complet de vêtements personnalisables : polos, t-shirts, vestes, accessoires. Plus de 2900 références.' },
  '/contact': { title: 'Contact | J2L Textiles', description: 'Contactez J2L Textiles pour vos projets de personnalisation textile. Devis gratuit sous 24h.' },
  '/devis': { title: 'Demande de devis | J2L Textiles', description: 'Demandez un devis personnalisé pour vos vêtements professionnels. Réponse rapide garantie.' },
  '/personnalisation': { title: 'Techniques de personnalisation | J2L Textiles', description: 'Broderie, sérigraphie, flocage, impression DTG. Découvrez nos techniques de marquage textile.' },
  '/marques': { title: 'Nos marques | J2L Textiles', description: 'Découvrez les marques partenaires J2L Textiles : Kariban, Fruit of the Loom, Gildan, Stanley Stella...' },
  '/blog': { title: 'Blog | J2L Textiles', description: 'Conseils et actualités sur la personnalisation textile, les tendances mode professionnelle.' },
  '/faq': { title: 'FAQ | J2L Textiles', description: 'Questions fréquentes sur nos services de personnalisation textile.' },
  '/livraison': { title: 'Livraison | J2L Textiles', description: 'Informations sur nos délais et modes de livraison en France.' },
  '/cgv': { title: 'CGV | J2L Textiles', description: 'Conditions générales de vente J2L Textiles.' },
  '/mentions-legales': { title: 'Mentions légales | J2L Textiles', description: 'Mentions légales et informations sur la société J2L Textiles.' },
  '/confidentialite': { title: 'Politique de confidentialité | J2L Textiles', description: 'Notre politique de protection des données personnelles.' },
};

/**
 * Main prerender function
 */
async function prerender() {
  console.log('🚀 Starting prerender...\n');
  
  const urls = parseSitemap();
  console.log(`📄 Found ${urls.length} URLs in sitemap\n`);
  
  if (urls.length === 0) {
    console.log('⚠️  No URLs to prerender');
    return;
  }
  
  let productCount = 0;
  let pageCount = 0;
  let errorCount = 0;
  
  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filePath = join(DIST_DIR, getPathFromUrl(url));
      
      // Ensure directory exists
      const fileDir = dirname(filePath);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      
      let html;
      
      // Check if it's a product page
      const sku = extractSkuFromUrl(url);
      if (sku) {
        const product = await fetchProduct(sku);
        if (product) {
          html = generateProductHtml(product, url);
          productCount++;
        } else {
          // Skip products not found
          errorCount++;
          continue;
        }
      } else {
        // Generic page
        const meta = PAGE_METADATA[pathname] || {
          title: `${pathname.replace(/\//g, ' ').trim() || 'Page'} | ${COMPANY_NAME}`,
          description: `${COMPANY_NAME} - Vêtements personnalisés professionnels`
        };
        html = generateGenericHtml(url, meta.title, meta.description);
        pageCount++;
      }
      
      writeFileSync(filePath, html, 'utf-8');
      console.log(`✅ ${pathname}`);
      
    } catch (err) {
      console.error(`❌ Error processing ${url}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Prerender complete!`);
  console.log(`   📦 Products: ${productCount}`);
  console.log(`   📄 Pages: ${pageCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

// Run
prerender().catch(console.error);
