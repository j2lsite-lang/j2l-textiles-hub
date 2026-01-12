import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Truck, ShieldCheck } from 'lucide-react';
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
  const { items, totals, clear } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
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
      // Generate order number
      const orderNum = `J2L-${Date.now().toString(36).toUpperCase()}`;
      
      // Prepare order details for email
      const productDetails = items.map(item => 
        `${item.name} (Réf: ${item.sku}) - ${item.color} / ${item.size} - Qté: ${item.quantity} - ${formatPrice(item.priceHT * item.quantity)} HT`
      ).join('\n');

      const fullMessage = `
NOUVELLE COMMANDE: ${orderNum}

Client:
${formData.firstName} ${formData.lastName}
${formData.company ? `Entreprise: ${formData.company}` : ''}
${formData.email}
${formData.phone}

Adresse de livraison:
${formData.address}
${formData.addressComplement ? formData.addressComplement : ''}
${formData.postalCode} ${formData.city}

--- PRODUITS ---
${productDetails}

--- TOTAUX ---
Sous-total HT: ${formatPrice(totals.totalHT)}
TVA (20%): ${formatPrice(totals.totalTTC - totals.totalHT)}
Total TTC: ${formatPrice(totals.totalTTC)}
Livraison: Gratuite
      `.trim();

      const { error } = await supabase.functions.invoke('send-quote', {
        body: {
          nom: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          telephone: formData.phone,
          message: fullMessage,
          product_ref: orderNum,
          product_name: `Commande ${items.length} article(s)`,
          product_brand: 'J2LTextiles',
          quantity: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
          variant: 'Commande en ligne',
          page: 'Checkout',
        },
      });

      if (error) throw new Error(error.message);

      setOrderNumber(orderNum);
      setIsCompleted(true);
      clear();
      
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter votre commande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-page">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">
                Commande confirmée !
              </h1>
              <p className="text-muted-foreground mb-2">
                Merci pour votre commande. Un email de confirmation vous a été envoyé.
              </p>
              <p className="font-semibold text-lg mb-8">
                N° de commande : <span className="text-primary">{orderNumber}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/catalogue">
                  <Button className="w-full sm:w-auto">
                    Continuer mes achats
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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
            eyebrow="Checkout"
            title="Finaliser la commande"
            description="Renseignez vos informations de livraison"
          />

          <div className="mt-12 grid lg:grid-cols-3 gap-8">
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

                {/* Payment info notice */}
                <div className="surface-elevated rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement
                  </h2>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Le paiement s'effectue à la livraison ou par virement bancaire. 
                      Vous recevrez les instructions par email après confirmation de votre commande.
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full accent-gradient text-white font-semibold" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
                </Button>
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
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total TTC</span>
                      <span className="text-primary">{formatPrice(totals.totalTTC)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Livraison gratuite en France</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Paiement 100% sécurisé</span>
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
