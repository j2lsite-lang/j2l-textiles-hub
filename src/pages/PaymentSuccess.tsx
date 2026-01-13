import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { clearCart } from '@/lib/cart';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [hasCleared, setHasCleared] = useState(false);

  useEffect(() => {
    // Clear cart after successful payment
    if (!hasCleared) {
      clearCart();
      setHasCleared(true);
    }
  }, [hasCleared]);

  return (
    <Layout>
      <section className="section-padding min-h-[60vh] flex items-center">
        <div className="container-page">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Paiement réussi !
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Merci pour votre commande. Votre paiement a été traité avec succès.
            </p>

            <div className="surface-elevated rounded-xl p-6 mb-8 text-left space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Confirmation par email</h3>
                  <p className="text-sm text-muted-foreground">
                    Un email de confirmation avec les détails de votre commande vous a été envoyé.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Expédition sous 3-7 jours</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un email avec le suivi de livraison dès l'expédition de votre colis.
                  </p>
                </div>
              </div>
            </div>

            {sessionId && (
              <p className="text-xs text-muted-foreground mb-6">
                Référence de transaction : {sessionId.substring(0, 20)}...
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogue">
                <Button className="w-full sm:w-auto accent-gradient text-white">
                  Continuer mes achats
                  <ArrowRight className="h-4 w-4 ml-2" />
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
