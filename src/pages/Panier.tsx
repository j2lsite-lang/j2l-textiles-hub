import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, CreditCard, FileText } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

export default function Panier() {
  const { items, updateItem, removeItem, clear, totals } = useCart();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Panier"
            title="Votre panier"
            description="Récapitulatif de vos articles"
          />

          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Articles
                {items.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalQuantity} article{totalQuantity > 1 ? 's' : ''})
                  </span>
                )}
              </h2>

              {items.length === 0 ? (
                <div className="surface-elevated rounded-xl p-8 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Votre panier est vide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Parcourez notre catalogue pour ajouter des produits
                  </p>
                  <Link to="/catalogue">
                    <Button>Voir le catalogue</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.sku}-${item.color}-${item.size}`}
                      className="surface-elevated rounded-xl p-4 flex gap-4"
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary/50 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brand} • Réf: {item.sku}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: item.colorCode || '#ccc' }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.color} / {item.size}
                          </span>
                        </div>
                        <p className="mt-2 font-semibold text-primary">
                          {formatPrice(item.priceHT)} HT / unité
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.sku, item.color, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItem(item.sku, item.color, item.size, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItem(item.sku, item.color, item.size, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.priceHT * item.quantity)} HT
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button variant="ghost" className="text-muted-foreground" onClick={clear}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Vider le panier
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="surface-elevated rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span>{formatPrice(totals.totalHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Livraison estimée</span>
                    <span>{formatPrice(5 + Math.max(0, totalQuantity - 1) * 0.5)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    5€ + 0,50€/article supplémentaire
                  </p>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total HT</span>
                      <span className="text-primary">{formatPrice(totals.totalHT)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hors TVA et frais de marquage
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/checkout" className="block">
                    <Button 
                      className="w-full accent-gradient text-white font-semibold" 
                      size="lg"
                      disabled={items.length === 0}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payer en ligne
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>
                  
                  <Link to="/devis" className="block">
                    <Button 
                      variant="outline"
                      className="w-full font-semibold" 
                      size="lg"
                      disabled={items.length === 0}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Demander un devis personnalisé
                    </Button>
                  </Link>
                  
                  <Link to="/catalogue" className="block">
                    <Button variant="ghost" className="w-full">
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">💡 Quelle option choisir ?</p>
                  <ul className="space-y-1">
                    <li><strong>Payer en ligne :</strong> Paiement sécurisé par carte, expédition rapide</li>
                    <li><strong>Devis personnalisé :</strong> Pour marquage (broderie, sérigraphie...) ou grandes quantités</li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-secondary/30 rounded-lg text-sm">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Livraison en France métropolitaine</p>
                      <p className="text-muted-foreground">
                        5€ + 0,50€/article • Expédition sous 3-7 jours ouvrés
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
