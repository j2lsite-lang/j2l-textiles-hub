import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  phone: string;
}

export default function Checkout() {
  const { items, totals } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    addressComplement: '',
    postalCode: '',
    city: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des produits avant de passer commande.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare items for Stripe
      const cartItems = items.map(item => ({
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        image: item.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        priceHT: item.priceHT,
      }));

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cartItems,
          customer: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company || undefined,
            address: formData.address,
            addressComplement: formData.addressComplement || undefined,
            postalCode: formData.postalCode,
            city: formData.city,
            phone: formData.phone,
          },
          successUrl: `${window.location.origin}/paiement-succes?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/paiement-annule`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erreur de paiement',
        description: 'Impossible de créer la session de paiement. Veuillez réessayer.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-page">
            <div className="max-w-lg mx-auto text-center">
              <h1 className="text-3xl font-display font-bold mb-4">
                Votre panier est vide
              </h1>
              <p className="text-muted-foreground mb-8">
                Ajoutez des produits à votre panier avant de passer commande.
              </p>
              <Link to="/catalogue">
                <Button>Voir le catalogue</Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Paiement sécurisé"
            title="Finaliser la commande"
            description="Paiement 100% sécurisé par Stripe"
          />

          <div className="mt-8 mb-6">
            <Link to="/panier" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au panier
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact */}
                <div className="surface-elevated rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Contact</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="surface-elevated rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise (optionnel)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressComplement">Complément d'adresse</Label>
                      <Input
                        id="addressComplement"
                        placeholder="Bâtiment, étage, code..."
                        value={formData.addressComplement}
                        onChange={(e) => setFormData({ ...formData, addressComplement: e.target.value })}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="surface-elevated rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement sécurisé
                  </h2>
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 flex items-start gap-4">
                    <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Paiement 100% sécurisé par Stripe</p>
                      <p className="text-sm text-muted-foreground">
                        Vous serez redirigé vers la page de paiement sécurisée Stripe pour finaliser votre commande.
                        Nous acceptons les cartes Visa, Mastercard, American Express.
                      </p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const FREE_SHIPPING_THRESHOLD = 150;
                  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                  const shippingCost = totals.totalHT >= FREE_SHIPPING_THRESHOLD 
                    ? 0 
                    : 5 + Math.max(0, totalQuantity - 1) * 0.5;
                  const finalTotal = totals.totalTTC + shippingCost;
                  return (
                    <Button 
                      type="submit" 
                      className="w-full accent-gradient text-white font-semibold" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Redirection vers Stripe...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Payer {formatPrice(finalTotal)} TTC
                        </>
                      )}
                    </Button>
                  );
                })()}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="surface-elevated rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.sku}-${item.color}-${item.size}`} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/50 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.color} / {item.size}</p>
                        <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.priceHT * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  {(() => {
                    const FREE_SHIPPING_THRESHOLD = 150;
                    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                    const shippingCost = totals.totalHT >= FREE_SHIPPING_THRESHOLD 
                      ? 0 
                      : 5 + Math.max(0, totalQuantity - 1) * 0.5;
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sous-total HT</span>
                          <span>{formatPrice(totals.totalHT)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">TVA (20%)</span>
                          <span>{formatPrice(totals.totalTTC - totals.totalHT)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Livraison</span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600 font-medium">Gratuite</span>
                          ) : (
                            <span>{formatPrice(shippingCost)}</span>
                          )}
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total TTC</span>
                            <span className="text-primary">{formatPrice(totals.totalTTC + shippingCost)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Trust badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Gratuite dès 150€ HT</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>Visa, Mastercard, Amex</span>
                  </div>
                </div>

                {/* Alternative - Devis */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Besoin de personnalisation ?
                  </p>
                  <Link to="/devis">
                    <Button variant="outline" size="sm" className="w-full">
                      Demander un devis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
