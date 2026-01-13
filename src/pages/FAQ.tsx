import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';

const faqCategories = [
  {
    title: 'Commande & Devis',
    questions: [
      {
        q: 'Comment demander un devis ?',
        a: 'Parcourez notre catalogue, sélectionnez vos produits avec les couleurs et tailles souhaitées, puis remplissez le formulaire de devis. Notre équipe vous répond sous 24h avec une offre personnalisée.',
      },
      {
        q: 'Quelles sont les quantités minimales de commande ?',
        a: 'Les quantités minimales varient selon la technique de personnalisation. Sérigraphie : minimum 20 pièces. Broderie et impression numérique : dès 1 pièce. Flocage : minimum 5 pièces.',
      },
      {
        q: 'Les prix affichés sont-ils HT ou TTC ?',
        a: 'Tous nos prix affichés sont HT (Hors Taxes). La TVA sera ajoutée lors de l\'établissement du devis final.',
      },
      {
        q: 'Proposez-vous des échantillons ?',
        a: 'Oui, nous pouvons vous envoyer des échantillons de tissus gratuitement. Pour un prototype avec votre personnalisation, des frais techniques s\'appliquent. Contactez-nous pour plus d\'informations.',
      },
      {
        q: 'Comment modifier ou annuler ma commande ?',
        a: 'Contactez-nous au plus vite par téléphone ou email. Les modifications sont possibles jusqu\'à la validation du BAT. Après lancement de production, l\'annulation peut entraîner des frais.',
      },
    ],
  },
  {
    title: 'Personnalisation',
    questions: [
      {
        q: 'Quelles techniques de personnalisation proposez-vous ?',
        a: 'Nous proposons la sérigraphie, l\'impression numérique (DTG), la broderie, le flocage et le transfert flex. Chaque technique a ses avantages selon le type de produit et le rendu souhaité.',
      },
      {
        q: 'Quel format de fichier pour mon logo ?',
        a: 'Idéalement, envoyez votre logo en format vectoriel (AI, EPS, PDF, SVG). Si vous n\'avez que des images, fournissez-les en haute résolution (minimum 300 DPI, PNG ou JPG).',
      },
      {
        q: 'Pouvez-vous vectoriser mon logo ?',
        a: 'Oui, notre équipe graphique peut vectoriser votre logo moyennant un supplément. Le tarif dépend de la complexité du design. Demandez un devis pour ce service.',
      },
      {
        q: 'Qu\'est-ce qu\'un BAT ?',
        a: 'Le BAT (Bon À Tirer) est une simulation visuelle de votre produit personnalisé. Vous devez le valider avant la production pour confirmer le placement, les couleurs et le rendu du marquage.',
      },
      {
        q: 'Où peut-on placer le marquage ?',
        a: 'Les emplacements classiques sont : poitrine (gauche ou droite), dos (haut ou plein dos), manche, col. Les zones personnalisables dépendent du produit. Consultez-nous pour des emplacements spécifiques.',
      },
    ],
  },
  {
    title: 'Livraison & Délais',
    questions: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Les délais standards sont de 2 à 3 semaines après validation du BAT. Pour les commandes urgentes, contactez-nous pour étudier les possibilités (supplément express applicable).',
      },
      {
        q: 'Livrez-vous partout en France ?',
        a: 'Oui, nous livrons dans toute la France métropolitaine, les DOM-TOM et à l\'international. Les frais de port sont calculés selon le poids et la destination.',
      },
      {
        q: 'Puis-je suivre ma commande ?',
        a: 'Oui, dès l\'expédition, vous recevez un email avec le numéro de suivi. Vous pouvez suivre votre colis sur le site du transporteur.',
      },
      {
        q: 'Le retrait sur place est-il possible ?',
        a: 'Oui, vous pouvez retirer votre commande dans nos locaux sur rendez-vous. Choisissez cette option lors de votre demande de devis.',
      },
    ],
  },
  {
    title: 'Produits & Qualité',
    questions: [
      {
        q: 'D\'où proviennent vos produits ?',
        a: 'Nous travaillons avec les plus grandes marques textiles européennes : Stanley/Stella, B&C, Fruit of the Loom, Gildan, James & Nicholson, etc. via notre partenaire grossiste TopTex.',
      },
      {
        q: 'Proposez-vous des textiles bio ou éco-responsables ?',
        a: 'Oui, nous avons une large gamme de textiles en coton biologique certifié GOTS, polyester recyclé, et articles labellisés OEKO-TEX, Fair Wear, etc.',
      },
      {
        q: 'Comment entretenir les textiles personnalisés ?',
        a: 'Lavage à 30-40°C, à l\'envers, sans javel. Séchage à basse température recommandé. Les instructions spécifiques dépendent de la technique de marquage utilisée.',
      },
      {
        q: 'Quelle est la durabilité du marquage ?',
        a: 'La broderie offre la meilleure durabilité. La sérigraphie et le flocage résistent à plus de 50 lavages. L\'impression numérique a une durée de vie légèrement inférieure mais reste excellente.',
      },
    ],
  },
  {
    title: 'Paiement',
    questions: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons le virement bancaire, le chèque, et les paiements par carte bancaire. Pour les professionnels, le paiement à 30 jours peut être accordé sous conditions.',
      },
      {
        q: 'Un acompte est-il demandé ?',
        a: 'Oui, un acompte de 50% est généralement demandé à la commande pour les nouvelles créations. Le solde est à régler avant expédition ou à réception selon les conditions.',
      },
      {
        q: 'Faites-vous des remises pour les grandes quantités ?',
        a: 'Oui, nos tarifs sont dégressifs. Plus la quantité commandée est importante, plus le prix unitaire diminue. Demandez un devis pour connaître les tarifs adaptés à votre volume.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions fréquentes"
            description="Retrouvez les réponses aux questions les plus courantes sur nos services"
          />

          <div className="mt-12 max-w-4xl mx-auto space-y-10">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${catIndex}-${index}`}
                      className="surface-elevated rounded-xl px-6 border-0"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="surface-elevated rounded-2xl p-8 max-w-2xl mx-auto">
              <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-display font-semibold mb-3">
                Vous n'avez pas trouvé votre réponse ?
              </h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe est disponible pour répondre à toutes vos questions.
              </p>
              <Link to="/contact">
                <Button size="lg">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageSEOFooter variant="faq" />
    </Layout>
  );
}
