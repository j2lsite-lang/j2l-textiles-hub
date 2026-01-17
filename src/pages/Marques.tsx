import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/section-header';
import { useAttributes } from '@/hooks/useTopTex';
import { useToptexBrandLogos, normalizeBrandKey } from '@/hooks/useToptexBrandLogos';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';
import { Loader2 } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/company-info';

function brandToSlug(brand: string): string {
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Marques() {
  const { data: attributesData, isLoading } = useAttributes();
  const { data: remoteBrandLogos } = useToptexBrandLogos();

  const brands = attributesData?.brands || [];

  // Group brands by first letter
  const brandsByLetter: Record<string, string[]> = {};
  brands.forEach((brand) => {
    const letter = brand.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!brandsByLetter[letter]) {
      brandsByLetter[letter] = [];
    }
    brandsByLetter[letter].push(brand);
  });

  const sortedLetters = Object.keys(brandsByLetter).sort((a, b) => a.localeCompare(b, 'fr'));

  return (
    <Layout>
      <Helmet>
        <title>Nos marques de textiles personnalisables | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content={`Découvrez toutes les marques de textiles disponibles chez ${COMPANY_INFO.name} : Stanley/Stella, Kariban, B&C, Fruit of the Loom, Gildan et plus de 50 marques partenaires.`}
        />
        <link rel="canonical" href="https://j2ltextiles.fr/marques" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos marques partenaires"
            description="Plus de 50 marques de textiles personnalisables pour tous vos projets"
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-12 space-y-12">
              {/* Alphabet navigation */}
              <div className="flex flex-wrap justify-center gap-2">
                {sortedLetters.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary text-foreground font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {letter}
                  </a>
                ))}
              </div>

              {/* Brands grid by letter */}
              {sortedLetters.map((letter) => (
                <div key={letter} id={`letter-${letter}`}>
                  <h2 className="text-2xl font-bold mb-6 border-b pb-2">{letter}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {brandsByLetter[letter].sort((a, b) => a.localeCompare(b, 'fr')).map((brand) => {
                      const slug = brandToSlug(brand);
                      const logo = remoteBrandLogos?.[brand] || remoteBrandLogos?.[normalizeBrandKey(brand)];

                      return (
                        <Link
                          key={brand}
                          to={`/marques/${slug}`}
                          className="bg-white rounded-lg border border-border p-4 flex flex-col items-center justify-center h-28 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                        >
                          {logo ? (
                            <img
                              src={logo}
                              alt={`Logo ${brand}`}
                              className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
                                fallback?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span 
                            data-fallback 
                            className={`text-sm font-bold text-center text-muted-foreground group-hover:text-primary transition-colors ${logo ? 'hidden' : ''}`}
                          >
                            {brand}
                          </span>
                          {logo && (
                            <span className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {brand}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Stats */}
              <div className="bg-secondary/50 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">{brands.length}</p>
                <p className="text-muted-foreground">marques disponibles</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <PageSEOFooter variant="catalogue" />
    </Layout>
  );
}
