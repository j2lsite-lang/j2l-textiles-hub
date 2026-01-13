import { Helmet } from 'react-helmet-async';
import { COMPANY_INFO } from '@/lib/company-info';

export function HomeSEO() {
  const title = 'J2L Textiles - Vêtements personnalisés professionnels';
  const description = 'J2L Textiles - Spécialiste en vêtements personnalisés et textile publicitaire. Broderie, sérigraphie, flocage pour professionnels.';
  const canonical = 'https://j2ltextiles.fr/';
  const image = 'https://j2ltextiles.fr/og-image.jpg';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY_INFO.name,
    url: 'https://j2ltextiles.fr',
    logo: 'https://j2ltextiles.fr/og-image.jpg',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY_INFO.phone,
      contactType: 'customer service',
      areaServed: 'FR',
      availableLanguage: 'French',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address,
      addressLocality: COMPANY_INFO.city,
      postalCode: COMPANY_INFO.postalCode,
      addressCountry: 'FR',
    },
    sameAs: [],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: COMPANY_INFO.name,
    url: 'https://j2ltextiles.fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://j2ltextiles.fr/catalogue?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={COMPANY_INFO.name} />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={COMPANY_INFO.name} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </script>
    </Helmet>
  );
}
