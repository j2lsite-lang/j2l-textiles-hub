import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { COMPANY_INFO } from '@/lib/company-info';
import { Truck, Clock, MapPin, Package, Euro, Phone, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';

export default function Livraison() {
  return (
    <Layout>
      <Helmet>
        <title>Livraison - Délais et Frais | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content="Informations sur la livraison : délais, frais, zones desservies. Livraison en France métropolitaine sous 2-4 semaines après validation du BAT." 
        />
      </Helmet>

      <div className="container-page py-16">
        <SectionHeader 
          title="Livraison" 
          description="Délais, frais et modalités de livraison"
        />

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Important : Vente sur devis uniquement</h3>
                <p className="text-muted-foreground">
                  J2LTextiles est un fournisseur B2B. Tous nos produits sont vendus <strong>sur devis personnalisé</strong>, 
                  incluant la personnalisation (marquage, broderie, etc.). Les délais et frais de livraison sont 
                  communiqués dans chaque devis en fonction de la commande.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Delivery Zones */}
          <section className="bg-card rounded-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Zones de livraison</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <strong>France métropolitaine</strong>
                  <p className="text-muted-foreground text-sm">Livraison disponible sur tout le territoire</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <strong>Belgique, Luxembourg, Suisse</strong>
                  <p className="text-muted-foreground text-sm">Livraison possible sur devis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <strong>DOM-TOM et international</strong>
                  <p className="text-muted-foreground text-sm">Nous contacter pour étudier votre demande</p>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Times */}
          <section className="bg-card rounded-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Délais de livraison</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Les délais indiqués sont donnés à titre indicatif et peuvent varier selon les produits, 
              les quantités commandées et la complexité du marquage.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-5">
                <h3 className="font-semibold mb-2">Produits personnalisés</h3>
                <p className="text-2xl font-bold text-primary mb-2">2 à 4 semaines</p>
                <p className="text-sm text-muted-foreground">
                  Après validation du BAT (Bon À Tirer) et réception du paiement selon conditions
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-5">
                <h3 className="font-semibold mb-2">Produits vierges (stock)</h3>
                <p className="text-2xl font-bold text-primary mb-2">3 à 7 jours</p>
                <p className="text-sm text-muted-foreground">
                  Sous réserve de disponibilité chez notre fournisseur
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> Les délais débutent après validation du BAT et des conditions de paiement. 
                Tout retard dans la validation repousse d'autant la date de livraison estimée.
              </p>
            </div>
          </section>

          {/* Shipping Costs */}
          <section className="bg-card rounded-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Frais de livraison</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Les frais de livraison sont calculés en fonction du poids, du volume et de la destination. 
                Ils sont systématiquement indiqués dans votre devis personnalisé.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <strong>Livraison standard</strong>
                    <p className="text-sm text-muted-foreground">Transporteur professionnel, suivi inclus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <strong>Franco de port possible</strong>
                    <p className="text-sm text-muted-foreground">Pour les commandes importantes, sur devis</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground italic">
                Pour les commandes express ou les livraisons en point relais, nous contacter.
              </p>
            </div>
          </section>

          {/* Reception */}
          <section className="bg-card rounded-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Réception de votre commande</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Vérification à la livraison</h3>
                <p className="text-muted-foreground">
                  À réception, vérifiez l'état des colis et le nombre de pièces. En cas de dommage ou de 
                  manquant, émettez des <strong>réserves écrites détaillées</strong> sur le bon de livraison 
                  du transporteur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Signalement des problèmes</h3>
                <p className="text-muted-foreground">
                  Tout défaut ou non-conformité doit être signalé par email dans les <strong>48 heures</strong> 
                  suivant la réception, avec photos à l'appui.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📦 Un email de confirmation avec numéro de suivi vous sera envoyé dès l'expédition de votre commande.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border p-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Des questions sur la livraison ?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions 
              concernant les délais, les frais ou les modalités de livraison.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={`tel:${COMPANY_INFO.phoneLink}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {COMPANY_INFO.phone}
              </a>
              <a 
                href={`mailto:${COMPANY_INFO.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {COMPANY_INFO.email}
              </a>
            </div>

            <div className="mt-6">
              <Link 
                to="/contact"
                className="text-accent hover:underline"
              >
                Ou utilisez notre formulaire de contact →
              </Link>
            </div>
          </section>

          {/* Related Links */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              to="/retours" 
              className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors text-center"
            >
              <strong>Retours & Échanges</strong>
              <p className="text-sm text-muted-foreground">Politique de retour</p>
            </Link>
            <Link 
              to="/cgv" 
              className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors text-center"
            >
              <strong>CGV</strong>
              <p className="text-sm text-muted-foreground">Conditions générales</p>
            </Link>
            <Link 
              to="/devis" 
              className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors text-center"
            >
              <strong>Demander un devis</strong>
              <p className="text-sm text-muted-foreground">Gratuit et sans engagement</p>
            </Link>
          </div>
        </div>
      </div>

      <PageSEOFooter variant="default" />
    </Layout>
  );
}
