import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/hooks/useTopTex';
import { frenchDepartments, getDepartmentBySlug, getCityBySlug } from '@/lib/french-locations';
import { seoIntents, getIntentBySlug } from '@/lib/seo-intents';
import { COMPANY_INFO } from '@/lib/company-info';
import { getProductUrl } from '@/lib/product-utils';
import { Loader2, MapPin, Phone, Mail, ArrowRight, ChevronRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';

function getColorStyle(colorName: string, colorCode?: string): string {
  if (colorCode && colorCode.startsWith('#')) return colorCode;
  const colorMap: Record<string, string> = {
    'blanc': '#ffffff', 'white': '#ffffff', 'noir': '#000000', 'black': '#000000',
    'marine': '#1e3a5f', 'navy': '#1e3a5f', 'gris': '#9ca3af', 'rouge': '#dc2626', 'bleu': '#2563eb',
  };
  return colorMap[colorName.toLowerCase()] || '#e5e7eb';
}

// FAQ data generator
function generateFAQ(location: string, intent: string, intentData: any) {
  return [
    {
      question: `Où commander des ${intentData.pluralName.toLowerCase()} à ${location} ?`,
      answer: `${COMPANY_INFO.name} livre des ${intentData.pluralName.toLowerCase()} personnalisés à ${location} et dans toute la France. Livraison rapide sous 5-10 jours ouvrés après validation.`,
    },
    {
      question: `Quel est le délai pour des ${intentData.pluralName.toLowerCase()} brodés ?`,
      answer: `Le délai standard pour la broderie est de 5 à 10 jours ouvrés après validation de votre BAT. Nous proposons aussi un service express sur demande.`,
    },
    {
      question: `Quelles techniques de personnalisation pour ${location} ?`,
      answer: `Nous proposons la broderie (qualité premium), la sérigraphie (grandes quantités), le flocage (flex) et l'impression DTG (petites séries avec couleurs).`,
    },
    {
      question: `Y a-t-il un minimum de commande pour ${location} ?`,
      answer: `Le minimum varie selon la technique : 1 pièce pour la broderie, 10 pièces recommandées pour la sérigraphie. Devis gratuit sans engagement.`,
    },
  ];
}

export default function LocalSEOPage() {
  const { citySlug, departmentSlug, intent } = useParams<{ 
    citySlug?: string; 
    departmentSlug?: string; 
    intent: string;
  }>();

  const intentData = intent ? getIntentBySlug(intent) : undefined;
  
  // Determine location context
  let locationName = '';
  let locationType: 'city' | 'department' = 'department';
  let departmentData: any = null;
  let cityData: any = null;
  let departmentCode = '';

  if (citySlug) {
    // City page: /villes/{citySlug}/{intent}
    // Find city in all departments
    for (const dept of frenchDepartments) {
      const city = dept.cities.find(c => c.slug === citySlug);
      if (city) {
        cityData = city;
        departmentData = dept;
        locationName = city.name;
        departmentCode = dept.code;
        locationType = 'city';
        break;
      }
    }
  } else if (departmentSlug) {
    // Department page: /departements/{departmentSlug}-{code}/{intent}
    // Parse slug like "vosges-88" or "rhone-69"
    const match = departmentSlug.match(/^(.+)-(\d{2,3}|2[AB])$/i);
    if (match) {
      const [, deptSlug, code] = match;
      departmentData = frenchDepartments.find(d => 
        d.slug === deptSlug || d.code === code
      );
    } else {
      departmentData = getDepartmentBySlug(departmentSlug);
    }
    
    if (departmentData) {
      locationName = departmentData.name;
      departmentCode = departmentData.code;
      locationType = 'department';
    }
  }

  // Fetch products with intent search term
  const { data: catalogData, isLoading } = useCatalog({
    query: intentData?.searchTerm || '',
    limit: 8,
  });

  const products = catalogData?.products || [];
  const hasProducts = products.length > 0;

  // If no valid location or intent, show 404-like page
  if (!intentData || !locationName) {
    return (
      <Layout>
        <Helmet>
          <title>Page non trouvée | {COMPANY_INFO.name}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <section className="section-padding">
          <div className="container-page text-center py-20">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Page non trouvée</h1>
            <p className="text-muted-foreground mb-8">Cette page de localisation n'existe pas.</p>
            <Link to="/catalogue">
              <Button>Voir le catalogue</Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const pageTitle = `${intentData.pluralName} à ${locationName} (${departmentCode})`;
  const metaDescription = `Commandez vos ${intentData.pluralName.toLowerCase()} à ${locationName}. ${COMPANY_INFO.name} : broderie, sérigraphie, flocage. Livraison rapide, devis gratuit.`;
  const canonicalUrl = citySlug 
    ? `https://j2ltextiles.fr/villes/${citySlug}/${intent}`
    : `https://j2ltextiles.fr/departements/${departmentSlug}/${intent}`;

  const faqData = generateFAQ(locationName, intent!, intentData);

  // JSON-LD FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqData.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  // JSON-LD LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': COMPANY_INFO.name,
    'description': `Personnalisation textile à ${locationName}`,
    'telephone': COMPANY_INFO.phone,
    'email': COMPANY_INFO.email,
    'areaServed': {
      '@type': 'City',
      'name': locationName,
    },
  };

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle} | {COMPANY_INFO.name}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${intentData.searchTerm} ${locationName}, ${intentData.pluralName.toLowerCase()} ${locationName}, personnalisation textile ${locationName}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={hasProducts ? 'index, follow' : 'noindex, follow'} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container-page">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            {locationType === 'city' ? (
              <>
                <Link to="/villes" className="hover:text-primary">Villes</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{locationName}</span>
              </>
            ) : (
              <>
                <Link to="/zones" className="hover:text-primary">Départements</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{locationName}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{intentData.pluralName}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {intentData.pluralName}<br />à {locationName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Vous cherchez des {intentData.pluralName.toLowerCase()} à {locationName} ({departmentCode}) ? 
            {COMPANY_INFO.name} personnalise vos {intentData.description} avec broderie, sérigraphie ou flocage.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding">
        <div className="container-page">
          <h2 className="text-2xl font-bold mb-6">
            Nos {intentData.pluralName.toLowerCase()} disponibles
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Aucun produit disponible pour cette recherche.</p>
              <Link to="/catalogue">
                <Button variant="outline">Voir tout le catalogue</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => {
                  const image = product.images?.[0] || '/placeholder.svg';
                  const displayColors = product.colors?.slice(0, 3) || [];

                  return (
                    <Link 
                      key={product.sku} 
                      to={getProductUrl(product.sku, product.name)} 
                      className="group"
                    >
                      <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                        <div className="aspect-square bg-white p-3 flex items-center justify-center">
                          <img
                            src={image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 border-t border-border">
                          <p className="text-xs text-primary font-medium mb-1">{product.brand}</p>
                          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-primary">
                              {product.priceHT ? `${product.priceHT.toFixed(2).replace('.', ',')} €` : 'Devis'}
                            </span>
                            <div className="flex gap-0.5">
                              {displayColors.map((c, i) => (
                                <span
                                  key={i}
                                  className="w-3 h-3 rounded-full border border-border"
                                  style={{ backgroundColor: getColorStyle(c.name, c.code) }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link to={`/catalogue?q=${encodeURIComponent(intentData.searchTerm)}`}>
                  <Button className="gap-2">
                    Voir tous les {intentData.pluralName.toLowerCase()}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted/30 py-12">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Personnalisation à {locationName}</h2>
              <ul className="space-y-3">
                {['Broderie haute qualité', 'Sérigraphie grandes quantités', 'Flocage flex/vinyle', 'Impression DTG numérique'].map((service) => (
                  <li key={service} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Livraison à {locationName}</h2>
              <ul className="space-y-3">
                {[
                  'Livraison sous 5-10 jours ouvrés',
                  'Expédition dans toute la France',
                  'Suivi de commande en ligne',
                  'Devis gratuit sous 24h',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-page">
          <h2 className="text-2xl font-bold mb-8">Questions fréquentes</h2>
          <div className="space-y-4 max-w-3xl">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-border rounded-lg p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin de {intentData.pluralName.toLowerCase()} à {locationName} ?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Demandez votre devis gratuit en quelques clics. Réponse sous 24h !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" variant="secondary" className="gap-2">
                Demander un devis gratuit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalogue">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Voir le catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Other intents for this location */}
      <section className="section-padding">
        <div className="container-page">
          <h2 className="text-xl font-bold mb-6">Autres produits à {locationName}</h2>
          <div className="flex flex-wrap gap-2">
            {seoIntents.filter(i => i.slug !== intent).slice(0, 10).map((otherIntent) => (
              <Link
                key={otherIntent.slug}
                to={citySlug 
                  ? `/villes/${citySlug}/${otherIntent.slug}`
                  : `/departements/${departmentSlug}/${otherIntent.slug}`
                }
                className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {otherIntent.pluralName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageSEOFooter variant="zones" />
    </Layout>
  );
}
