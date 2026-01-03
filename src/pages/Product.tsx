import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Minus, ShoppingBag, Ruler, Check, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock product data (will come from TopTex API)
const mockProduct = {
  sku: 'STTU755',
  name: 'T-shirt Creator unisexe',
  brand: 'Stanley/Stella',
  category: 'T-shirts',
  description: 'Le T-shirt Creator est un incontournable. Coupe unisexe moderne, coton biologique certifié GOTS, et une qualité de fabrication irréprochable. Idéal pour la personnalisation grâce à sa surface lisse.',
  composition: '100% coton biologique',
  weight: '180 g/m²',
  certification: 'GOTS, OEKO-TEX, Fair Wear',
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
  priceRanges: [
    { min: 1, max: 24, price: '12,50 €' },
    { min: 25, max: 49, price: '10,80 €' },
    { min: 50, max: 99, price: '9,20 €' },
    { min: 100, max: null, price: 'Sur devis' },
  ],
  sizeGuide: {
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
  },
};

export default function Product() {
  const { sku } = useParams();
  const { addItem } = useQuoteCart();
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(25);

  const handleAddToQuote = () => {
    if (!selectedSize) {
      toast({
        title: 'Sélectionnez une taille',
        description: 'Veuillez choisir une taille avant d\'ajouter au devis.',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      sku: mockProduct.sku,
      name: mockProduct.name,
      brand: mockProduct.brand,
      image: mockProduct.images[0],
      color: selectedColor.name,
      colorCode: selectedColor.code,
      size: selectedSize,
      quantity,
    });

    toast({
      title: 'Ajouté au devis',
      description: `${quantity}x ${mockProduct.name} (${selectedColor.name}, ${selectedSize})`,
    });
  };

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

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/50">
                <img
                  src={mockProduct.images[selectedImage]}
                  alt={mockProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                {mockProduct.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{mockProduct.brand}</p>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                  {mockProduct.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  Réf: {mockProduct.sku}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {mockProduct.description}
              </p>

              {/* Price Ranges */}
              <div className="surface-elevated rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Tarifs indicatifs (HT)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mockProduct.priceRanges.map((range, i) => (
                    <div key={i} className="text-center p-2 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">
                        {range.max ? `${range.min}-${range.max}` : `${range.min}+`} pcs
                      </p>
                      <p className="font-semibold text-primary">{range.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-semibold mb-3">
                  Couleur : <span className="font-normal text-muted-foreground">{selectedColor.name}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mockProduct.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedColor.name === color.name
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-muted-foreground'
                      )}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    >
                      {selectedColor.name === color.name && (
                        <Check
                          className={cn(
                            'h-5 w-5',
                            color.code === '#ffffff' || color.code === '#fef3c7'
                              ? 'text-foreground'
                              : 'text-white'
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
                              {mockProduct.sizeGuide.headers.map((h) => (
                                <th key={h} className="text-left py-2 px-3 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockProduct.sizeGuide.rows.map((row, i) => (
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
                  {mockProduct.sizes.map((size) => (
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

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button size="lg" className="flex-1" onClick={handleAddToQuote}>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ajouter au devis
                </Button>
                <Link to="/devis" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    Voir mon devis
                  </Button>
                </Link>
              </div>

              {/* Specs */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold">Caractéristiques</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Composition</dt>
                  <dd className="font-medium">{mockProduct.composition}</dd>
                  <dt className="text-muted-foreground">Grammage</dt>
                  <dd className="font-medium">{mockProduct.weight}</dd>
                  <dt className="text-muted-foreground">Certifications</dt>
                  <dd className="font-medium">{mockProduct.certification}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
