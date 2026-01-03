import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Loader2, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Mock products for demo (will be replaced by TopTex API)
const mockProducts = [
  {
    sku: 'STTU755',
    name: 'T-shirt Creator unisexe',
    brand: 'Stanley/Stella',
    category: 'T-shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['Blanc', 'Noir', 'Marine', 'Gris'],
    priceRange: '8-12€',
  },
  {
    sku: 'STPM563',
    name: 'Polo Dedicator homme',
    brand: 'Stanley/Stella',
    category: 'Polos',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
    colors: ['Blanc', 'Noir', 'Navy'],
    priceRange: '18-25€',
  },
  {
    sku: 'STSU811',
    name: 'Sweat Changer unisexe',
    brand: 'Stanley/Stella',
    category: 'Sweats',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    colors: ['Noir', 'Gris chiné', 'Bordeaux'],
    priceRange: '28-38€',
  },
  {
    sku: 'JN831',
    name: 'Softshell homme',
    brand: 'James & Nicholson',
    category: 'Vestes',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    colors: ['Noir', 'Marine', 'Anthracite'],
    priceRange: '45-60€',
  },
  {
    sku: 'KP011',
    name: 'Casquette Orlando',
    brand: 'K-Up',
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    colors: ['Noir', 'Blanc', 'Rouge', 'Bleu'],
    priceRange: '5-8€',
  },
  {
    sku: 'KI0104',
    name: 'Sac shopping',
    brand: 'Kimood',
    category: 'Bagagerie',
    image: 'https://images.unsplash.com/photo-1597633125097-5a9ae3a47c84?w=400&h=400&fit=crop',
    colors: ['Naturel', 'Noir', 'Marine'],
    priceRange: '3-6€',
  },
  {
    sku: 'B&C123',
    name: 'Polo ID.001',
    brand: 'B&C',
    category: 'Polos',
    image: 'https://images.unsplash.com/photo-1625910513413-5fc5c3ebe11e?w=400&h=400&fit=crop',
    colors: ['Blanc', 'Noir', 'Royal', 'Rouge'],
    priceRange: '12-18€',
  },
  {
    sku: 'GI18000',
    name: 'Sweat capuche Heavy Blend',
    brand: 'Gildan',
    category: 'Sweats',
    image: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=400&fit=crop',
    colors: ['Noir', 'Gris', 'Marine', 'Bordeaux'],
    priceRange: '15-22€',
  },
];

const categories = ['Tous', 'T-shirts', 'Polos', 'Sweats', 'Vestes', 'Accessoires', 'Bagagerie'];
const brands = ['Toutes', 'Stanley/Stella', 'James & Nicholson', 'B&C', 'Gildan', 'K-Up', 'Kimood'];

function ProductCard({ product }: { product: typeof mockProducts[0] }) {
  return (
    <Link to={`/produit/${product.sku}`} className="group">
      <div className="surface-elevated rounded-xl overflow-hidden hover-lift">
        <div className="aspect-square bg-secondary/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">{product.priceRange}</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{
                    backgroundColor:
                      color === 'Blanc' ? '#fff' :
                      color === 'Noir' ? '#000' :
                      color === 'Marine' || color === 'Navy' ? '#1e3a5f' :
                      color === 'Gris' || color === 'Gris chiné' ? '#9ca3af' :
                      color === 'Rouge' ? '#dc2626' :
                      color === 'Bleu' || color === 'Royal' ? '#2563eb' :
                      color === 'Bordeaux' ? '#7f1d1d' :
                      color === 'Anthracite' ? '#374151' :
                      color === 'Naturel' ? '#fef3c7' :
                      '#e5e7eb',
                  }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
}: {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Catégorie</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Marque</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedBrand === brand
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedBrand, setSelectedBrand] = useState('Toutes');
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'Toutes' || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tous');
    setSelectedBrand('Toutes');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Tous' || selectedBrand !== 'Toutes';

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos produits textiles"
            description="Explorez notre sélection de vêtements et accessoires personnalisables"
          />

          {/* Search & Filter Bar */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un produit, une marque, une référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </form>

            <div className="flex gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      setSelectedCategory={(v) => {
                        setSelectedCategory(v);
                        setIsFilterOpen(false);
                      }}
                      selectedBrand={selectedBrand}
                      setSelectedBrand={(v) => {
                        setSelectedBrand(v);
                        setIsFilterOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'Tous' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Tous')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBrand !== 'Toutes' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedBrand}
                  <button onClick={() => setSelectedBrand('Toutes')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="mt-8 flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Effacer les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.sku} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
