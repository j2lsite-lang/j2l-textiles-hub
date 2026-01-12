import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Minus, ShoppingCart, Ruler, Check, Info, Loader2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProduct } from '@/hooks/useTopTex';
import { ProductShareButtons } from '@/components/product/ProductShareButtons';
import { extractSkuFromSlug, generateProductSlug } from '@/lib/product-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Fallback mock product
const mockProduct = {
  sku: 'STTU755',
  name: 'T-shirt Creator unisexe',
  brand: 'Stanley/Stella',
  category: 'T-shirts',
  description: 'Le T-shirt Creator est un incontournable. Coupe unisexe moderne, coton biologique certifié GOTS, et une qualité de fabrication irréprochable. Idéal pour la personnalisation grâce à sa surface lisse.',
  composition: '100% coton biologique',
  weight: '180 g/m²',
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
  ],
  colors: [
    { name: 'Blanc', code: '#ffffff' },
    { name: 'Noir', code: '#000000' },
    { name: 'Marine', code: '#1e3a5f' },
    { name: 'Gris chiné', code: '#9ca3af' },
    { name: 'Rouge', code: '#dc2626' },
    { name: 'Bleu royal', code: '#2563eb' },
  ],
  sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  variants: [],
  priceHT: 8.50,
  stock: null,
};

function formatPriceEUR(price: number): string {
  return `${(Math.round(price * 10) / 10).toFixed(2).replace('.', ',')} €`;
}

const sizeGuide = {
  headers: ['Taille', 'Largeur (cm)', 'Longueur (cm)'],
  rows: [
    ['XXS', '46', '66'],
    ['XS', '48', '68'],
    ['S', '50', '70'],
    ['M', '52', '72'],
    ['L', '55', '74'],
    ['XL', '58', '76'],
    ['XXL', '61', '78'],
    ['3XL', '64', '80'],
  ],
};

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
    'gris chiné': '#9ca3af',
    'rouge': '#dc2626',
    'red': '#dc2626',
    'bleu': '#2563eb',
    'bleu royal': '#2563eb',
    'royal': '#2563eb',
    'bordeaux': '#7f1d1d',
    'anthracite': '#374151',
  };
  
  return colorMap[colorName.toLowerCase()] || '#e5e7eb';
}

export default function Product() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Extraire le SKU du slug (ex: "k623-polo-homme" -> "K623")
  const sku = slug ? extractSkuFromSlug(slug) : undefined;
  
  // Fetch from API
  const { data: apiProduct, isLoading, error } = useProduct(sku);
  
  // Use API data or fallback
  const product = apiProduct || mockProduct;
  const isUsingMock = !apiProduct;
  
  // Rediriger vers l'URL SEO-friendly si on a juste le SKU
  useEffect(() => {
    if (apiProduct && slug) {
      const expectedSlug = generateProductSlug(apiProduct.sku, apiProduct.name);
      // Si le slug actuel est juste le SKU (ancien format), rediriger vers le nouveau
      if (slug.toLowerCase() === apiProduct.sku.toLowerCase() && expectedSlug !== slug.toLowerCase()) {
        navigate(`/produit/${expectedSlug}`, { replace: true });
      }
    }
  }, [apiProduct, slug, navigate]);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<{ name: string; code?: string; images?: string[] } | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Get full product URL for sharing
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${location.pathname}` 
    : '';

  // Set default color when product loads
  useEffect(() => {
    if (product.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product, selectedColor]);

  // Reset image index when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Sélectionnez une taille',
        description: 'Veuillez choisir une taille avant d\'ajouter au panier.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: 'Sélectionnez une couleur',
        description: 'Veuillez choisir une couleur avant d\'ajouter au panier.',
        variant: 'destructive',
      });
      return;
    }

    const priceHT = product.priceHT || 0;

    addItem({
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      image: product.images?.[0] || '',
      color: selectedColor.name,
      colorCode: selectedColor.code,
      size: selectedSize,
      quantity,
      priceHT,
    });

    toast({
      title: 'Ajouté au panier',
      description: `${quantity}x ${product.name} (${selectedColor.name}, ${selectedSize})`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Build carousel images: lifestyle (product.images) + packshots of selected color
  const lifestyleImages = product.images?.length > 0 ? product.images : [];
  const colorPackshots = selectedColor?.images || [];
  
  // Combine: lifestyle first, then color-specific packshots (avoid duplicates)
  const allCarouselImages = [...lifestyleImages];
  for (const ps of colorPackshots) {
    if (!allCarouselImages.includes(ps)) {
      allCarouselImages.push(ps);
    }
  }
  
  const displayImages = allCarouselImages.length > 0 
    ? allCarouselImages 
    : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'];

  const displayColors = product.colors?.length > 0 ? product.colors : mockProduct.colors;
  const displaySizes = product.sizes?.length > 0 ? product.sizes : mockProduct.sizes;
  const priceHT = product.priceHT || 0;
  const priceTTC = priceHT * 1.2;

  // Scrollable thumbnail strip for many images
  const showScrollableThumbs = displayImages.length > 5;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/catalogue"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au catalogue
            </Link>
          </div>

          {/* API Notice */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Affichage des données de démonstration. L'API sera connectée prochainement.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Carousel */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
                <img
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  width={800}
                  height={800}
                  loading={selectedImage === 0 ? 'eager' : 'lazy'}
                  fetchPriority={selectedImage === 0 ? 'high' : 'auto'}
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop';
                  }}
                />
              </div>

              {/* Thumbnail strip */}
              {displayImages.length > 1 && (
                <div className={cn(
                  "flex gap-2",
                  showScrollableThumbs && "overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300"
                )}>
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white',
                        selectedImage === i 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-gray-200 hover:border-primary/50'
                      )}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-contain p-1"
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image count indicator */}
              {displayImages.length > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                  {selectedImage + 1} / {displayImages.length} images
                  {selectedColor && ` • ${selectedColor.name}`}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  Réf: {product.sku}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Produit textile de qualité professionnelle, idéal pour la personnalisation. Contactez-nous pour plus de détails.'}
              </p>


              {/* Color Selection */}
              <div>
                <h3 className="font-semibold mb-3">
                  Couleur : <span className="font-normal text-muted-foreground">{selectedColor?.name || 'Sélectionnez'}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedColor?.name === color.name
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-muted-foreground'
                      )}
                      style={{ backgroundColor: getColorStyle(color.name, color.code) }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <Check
                          className={cn(
                            'h-5 w-5',
                            getColorStyle(color.name, color.code) === '#ffffff' ? 'text-foreground' : 'text-white'
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Taille</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="text-muted-foreground p-0 h-auto">
                        <Ruler className="h-4 w-4 mr-1" />
                        Guide des tailles
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guide des tailles</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {sizeGuide.headers.map((h) => (
                                <th key={h} className="text-left py-2 px-3 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizeGuide.rows.map((row, i) => (
                              <tr key={i} className="border-b last:border-0">
                                {row.map((cell, j) => (
                                  <td key={j} className="py-2 px-3 text-muted-foreground">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displaySizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[48px] h-10 px-3 rounded-lg border text-sm font-medium transition-colors',
                        selectedSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-foreground hover:border-primary'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Quantité</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Display */}
              <div className="surface-elevated rounded-xl p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPriceEUR(priceHT)} HT
                  </span>
                  <span className="text-lg text-muted-foreground">
                    / {formatPriceEUR(priceTTC)} TTC
                  </span>
                </div>
                {quantity > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {formatPriceEUR(priceHT * quantity)} HT ({formatPriceEUR(priceTTC * quantity)} TTC)
                  </p>
                )}
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ En stock • Livraison gratuite
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button size="lg" className="flex-1 accent-gradient text-white" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>
                <Link to="/panier" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    Voir le panier
                  </Button>
                </Link>
              </div>

              {/* Share Buttons */}
              <div className="border-t pt-6">
                <ProductShareButtons
                  productName={product.name}
                  productUrl={productUrl}
                  productImage={product.images?.[0]}
                />
              </div>

              {/* Specs */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold">Caractéristiques</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {product.composition && (
                    <>
                      <dt className="text-muted-foreground">Composition</dt>
                      <dd className="font-medium">{product.composition}</dd>
                    </>
                  )}
                  {product.weight && (
                    <>
                      <dt className="text-muted-foreground">Grammage</dt>
                      <dd className="font-medium">{product.weight}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Catégorie</dt>
                  <dd className="font-medium">{product.category || 'Textile'}</dd>
                </dl>
              </div>

              {/* Internal Links - SEO Maillage */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Nos services de personnalisation</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    to="/personnalisation" 
                    className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Broderie
                  </Link>
                  <Link 
                    to="/personnalisation" 
                    className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Sérigraphie
                  </Link>
                  <Link 
                    to="/personnalisation" 
                    className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Flocage
                  </Link>
                  <Link 
                    to="/personnalisation" 
                    className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Impression DTG
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>Livraison dans tout le Grand Est : </span>
                  <Link to="/zones/vosges/epinal" className="text-primary hover:underline">Épinal</Link>
                  {', '}
                  <Link to="/zones/meurthe-et-moselle/nancy" className="text-primary hover:underline">Nancy</Link>
                  {', '}
                  <Link to="/zones/moselle/metz" className="text-primary hover:underline">Metz</Link>
                  {', '}
                  <Link to="/zones/bas-rhin/strasbourg" className="text-primary hover:underline">Strasbourg</Link>
                  {', '}
                  <Link to="/zones/haut-rhin/mulhouse" className="text-primary hover:underline">Mulhouse</Link>
                  {' et '}
                  <Link to="/zones" className="text-primary hover:underline">toute la France</Link>
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  Un projet de communication visuelle ? Découvrez aussi{' '}
                  <a 
                    href="https://j2lpublicite.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    J2L Publicité
                  </a>
                  {' '}pour l'enseigne et la signalétique.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
