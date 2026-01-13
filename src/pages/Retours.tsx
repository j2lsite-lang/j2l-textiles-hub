import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { COMPANY_INFO } from '@/lib/company-info';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';

export default function Retours() {
  return (
    <Layout>
      <Helmet>
        <title>Retours & Échanges | {COMPANY_INFO.name}</title>
        <meta
          name="description"
          content="Politique de retours et d'échanges de J2L Textiles. Conditions, délais et procédure pour retourner ou échanger vos articles."
        />
      </Helmet>

      <div className="section-padding bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-page max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <SectionHeader
            eyebrow="Service client"
            title="Retours & Échanges"
            description="Notre politique pour vous accompagner après votre achat"
          />

          <div className="mt-12 space-y-10">
            {/* Conditions */}
            <section className="bg-white rounded-2xl p-8 shadow-soft border">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Conditions de retour</h2>
                  <p className="text-muted-foreground">
                    Les retours sont acceptés sous les conditions suivantes :
                  </p>
                </div>
              </div>
              <ul className="space-y-3 ml-16">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Article non personnalisé (sans marquage, broderie ou impression)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Article dans son emballage d'origine, non porté et non lavé</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Étiquettes d'origine encore attachées</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Les articles personnalisés ne peuvent pas être retournés sauf défaut de fabrication</span>
                </li>
              </ul>
            </section>

            {/* Délais */}
            <section className="bg-white rounded-2xl p-8 shadow-soft border">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Délais</h2>
                  <p className="text-muted-foreground">
                    Vous disposez de <strong className="text-foreground">14 jours ouvrés</strong> à compter de la réception de votre commande pour effectuer une demande de retour.
                  </p>
                </div>
              </div>
              <div className="ml-16 bg-secondary/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Le remboursement sera effectué sous 7 jours ouvrés après réception et vérification de l'article retourné, via le même moyen de paiement utilisé lors de la commande.
                </p>
              </div>
            </section>

            {/* Procédure */}
            <section className="bg-white rounded-2xl p-8 shadow-soft border">
              <h2 className="text-xl font-bold text-foreground mb-6">Procédure de retour</h2>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Contactez-nous</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Envoyez un email à <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">{COMPANY_INFO.email}</a> ou appelez-nous au <a href={`tel:${COMPANY_INFO.phoneLink}`} className="text-primary hover:underline">{COMPANY_INFO.phone}</a> avec votre numéro de commande et le motif du retour.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Recevez l'autorisation</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Nous vous enverrons un bon de retour avec l'adresse d'expédition dans les 24h.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Expédiez l'article</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Emballez soigneusement l'article et expédiez-le avec le bon de retour inclus. Les frais de retour sont à votre charge sauf en cas de défaut ou d'erreur de notre part.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shrink-0">✓</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Remboursement</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Une fois l'article reçu et vérifié, le remboursement est effectué sous 7 jours ouvrés.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 rounded-2xl p-8 border border-primary/20 text-center">
              <h2 className="text-xl font-bold text-foreground mb-4">Une question ?</h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe est disponible pour vous aider du lundi au vendredi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <a href={`mailto:${COMPANY_INFO.email}`} className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {COMPANY_INFO.email}
                  </a>
                </Button>
                <Button asChild>
                  <a href={`tel:${COMPANY_INFO.phoneLink}`} className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {COMPANY_INFO.phone}
                  </a>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <PageSEOFooter variant="retours" />
    </Layout>
  );
}
