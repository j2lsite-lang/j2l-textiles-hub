import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { useCatalog, useAttributes } from '@/hooks/useTopTex';
import { useToptexBrandLogos, normalizeBrandKey } from '@/hooks/useToptexBrandLogos';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';
import { Loader2, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/company-info';
import { getProductUrl } from '@/lib/product-utils';
import { cn } from '@/lib/utils';

function slugToBrand(slug: string, brands: string[]): string | undefined {
  const normalize = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return brands.find(b => normalize(b) === slug);
}

function getColorStyle(colorName: string, colorCode?: string): string {
  if (colorCode && colorCode.startsWith('#')) return colorCode;
  const colorMap: Record<string, string> = {
    'blanc': '#ffffff',
    'white': '#ffffff',
    'noir': '#000000',
    'black': '#000000',
    'marine': '#1e3a5f',
    'navy': '#1e3a5f',
    'gris': '#9ca3af',
    'rouge': '#dc2626',
    'bleu': '#2563eb',
  };
  return colorMap[colorName.toLowerCase()] || '#e5e7eb';
}

export default function MarquePage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  
  const { data: attributesData, isLoading: loadingAttributes } = useAttributes();
  const { data: remoteBrandLogos } = useToptexBrandLogos();
  
  const brands = attributesData?.brands || [];
  const brandName = slug ? slugToBrand(slug, brands) : undefined;
  
  const { data: catalogData, isLoading: loadingProducts } = useCatalog({
    brand: brandName,
    page,
    limit: 24,
  });

  const products = catalogData?.products || [];
  const logo = brandName ? (remoteBrandLogos?.[brandName] || remoteBrandLogos?.[normalizeBrandKey(brandName)]) : undefined;

  if (loadingAttributes) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!brandName) {
    return (
      <Layout>
        <Helmet>
          <title>Marque non trouvée | {COMPANY_INFO.name}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <section className="section-padding">
          <div className="container-page text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Marque non trouvée</h1>
            <p className="text-muted-foreground mb-8">Cette marque n'existe pas dans notre catalogue.</p>
            <Link to="/marques">
              <Button>Voir toutes les marques</Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const canonicalUrl = `https://j2ltextiles.fr/marques/${slug}`;
  const totalProducts = catalogData?.pagination?.total || products.length;

  return (
    <Layout>
      <Helmet>
        <title>{brandName} - Textiles personnalisables | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content={`Découvrez tous les produits ${brandName} personnalisables chez ${COMPANY_INFO.name}. ${totalProducts} références disponibles avec broderie, sérigraphie et flocage.`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${brandName} - Textiles personnalisables`} />
        <meta property="og:description" content={`${totalProducts} produits ${brandName} personnalisables`} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <section className="section-padding">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            <span>/</span>
            <Link to="/marques" className="hover:text-primary">Marques</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{brandName}</span>
          </nav>

          {/* Brand Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
            <Link to="/marques" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Toutes les marques
            </Link>
            
            <div className="flex-1 flex items-center gap-6">
              {logo && (
                <div className="bg-white rounded-xl border border-border p-4 shrink-0">
                  <img 
                    src={logo} 
                    alt={`Logo ${brandName}`} 
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{brandName}</h1>
                <p className="text-muted-foreground mt-1">
                  {totalProducts} produit{totalProducts > 1 ? 's' : ''} personnalisable{totalProducts > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Cette marque n'a pas de produits disponibles actuellement.
              </p>
              <Link to="/marques">
                <Button variant="outline">Voir toutes les marques</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => {
                  const image = product.images?.[0] || '/placeholder.svg';
                  const displayColors = product.colors?.slice(0, 4) || [];

                  return (
                    <Link 
                      key={product.sku} 
                      to={getProductUrl(product.sku, product.name)} 
                      className="group"
                    >
                      <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        <div className="aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
                          <img
                            src={image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 border-t border-border">
                          <p className="text-xs font-medium text-primary mb-1">{product.brand}</p>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-primary">
                              {product.priceHT ? `${(Math.round(product.priceHT * 10) / 10).toFixed(2).replace('.', ',')} € HT` : 'Sur devis'}
                            </span>
                            <div className="flex gap-1">
                              {displayColors.map((color, i) => (
                                <span
                                  key={i}
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: getColorStyle(color.name, color.code) }}
                                  title={color.name}
                                />
                              ))}
                              {(product.colors?.length || 0) > 4 && (
                                <span className="text-xs text-muted-foreground ml-1">+{product.colors.length - 4}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {catalogData?.pagination && catalogData.pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} sur {catalogData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= catalogData.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <PageSEOFooter variant="catalogue" />
    </Layout>
  );
}
