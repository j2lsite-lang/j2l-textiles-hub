import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function PaymentCancelled() {
  return (
    <Layout>
      <section className="section-padding min-h-[60vh] flex items-center">
        <div className="container-page">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-orange-100 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-orange-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Paiement annulé
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Votre paiement a été annulé. Votre panier a été conservé et vous pouvez réessayer à tout moment.
            </p>

            <div className="surface-elevated rounded-xl p-6 mb-8">
              <p className="text-sm text-muted-foreground">
                Si vous avez rencontré un problème technique ou si vous avez des questions, 
                n'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/panier">
                <Button className="w-full sm:w-auto accent-gradient text-white">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Retour au panier
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
