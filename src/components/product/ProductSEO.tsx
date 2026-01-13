import { Helmet } from 'react-helmet-async';
import { COMPANY_INFO } from '@/lib/company-info';

interface ProductSEOProps {
  product: {
    sku: string;
    name: string;
    brand?: string | null;
    description?: string | null;
    priceHT?: number | null;
    category?: string | null;
    images?: string[] | null;
    colors?: Array<{ name: string; code?: string }> | null;
  };
  canonicalUrl: string;
  selectedColor?: { name: string } | null;
}

export function ProductSEO({ product, canonicalUrl, selectedColor }: ProductSEOProps) {
  const priceHT = product.priceHT || 0;
  const priceTTC = Math.round(priceHT * 1.2 * 100) / 100;
  
  // SEO Title: optimized for Merchant Center (max 150 chars)
  const title = `${product.name} ${product.brand ? `- ${product.brand}` : ''} | ${COMPANY_INFO.name}`.slice(0, 60);
  
  // Meta description (max 160 chars) - avoid trailing ellipsis if description is short
  const rawDesc = product.description || '';
  const description = rawDesc.length > 130
    ? `${rawDesc.slice(0, 130).trim()}...`
    : rawDesc.length > 0
      ? rawDesc
      : `${product.name} personnalisable par ${product.brand || 'marque premium'}. Broderie, sérigraphie, flocage. Livraison France. Devis gratuit.`;
  
  // Primary image (first product image or placeholder) - ensure absolute URL
  // Images can be: full URL, relative path, or empty
  const getAbsoluteImageUrl = (img: string | undefined): string => {
    if (!img || img.trim() === '') return 'https://j2ltextiles.fr/og-image.jpg';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    // Relative path - prefix with domain
    const cleanPath = img.startsWith('/') ? img : `/${img}`;
    return `https://j2ltextiles.fr${cleanPath}`;
  };
  
  const primaryImage = getAbsoluteImageUrl(product.images?.[0]);
  
  // Get all images as absolute URLs for JSON-LD (max 10)
  const absoluteImages = (product.images || [])
    .slice(0, 10)
    .map(img => getAbsoluteImageUrl(img as string))
    .filter(url => url !== 'https://j2ltextiles.fr/og-image.jpg' || (product.images || []).length === 0);
  
  // Canonical URL with domain - ensure absolute path
  const cleanPath = canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`;
  const canonical = `https://j2ltextiles.fr${cleanPath}`;
  
  // Availability based on stock (assume in stock for now)
  const availability = 'https://schema.org/InStock';
  
  // Color list for meta
  const colorNames = product.colors?.map(c => c.name).join(', ') || '';
  
  // JSON-LD Product structured data for Merchant Center
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
    image: absoluteImages.length > 0 ? absoluteImages : [primaryImage],
    category: product.category || 'Vêtements',
    color: selectedColor?.name || colorNames.split(',')[0]?.trim() || undefined,
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'EUR',
      price: priceTTC.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: COMPANY_INFO.name,
        url: 'https://j2ltextiles.fr',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'FR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'd',
          },
        },
      },
    },
    aggregateRating: undefined, // Add when reviews are implemented
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://j2ltextiles.fr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catalogue',
        item: 'https://j2ltextiles.fr/catalogue',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: canonical,
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={primaryImage} />
      <meta property="og:image:width" content="800" />
      <meta property="og:image:height" content="800" />
      <meta property="og:site_name" content={COMPANY_INFO.name} />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Product specific OG tags */}
      <meta property="product:price:amount" content={priceTTC.toFixed(2)} />
      <meta property="product:price:currency" content="EUR" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />
      <meta property="product:retailer_item_id" content={product.sku} />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      {product.category && <meta property="product:category" content={product.category} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={primaryImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={COMPANY_INFO.name} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
    </Helmet>
  );
}
