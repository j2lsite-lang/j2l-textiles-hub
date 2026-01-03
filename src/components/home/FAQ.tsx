import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'Quelles sont les quantités minimales de commande ?',
    answer: 'Les quantités minimales varient selon les techniques de personnalisation. Pour la sérigraphie, comptez minimum 20 pièces. Pour l\'impression numérique et la broderie, nous acceptons dès 1 pièce.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais standards sont de 2 à 3 semaines après validation du BAT (Bon À Tirer). Pour les commandes urgentes, contactez-nous pour étudier les possibilités de livraison express.',
  },
  {
    question: 'Comment envoyer mon logo pour la personnalisation ?',
    answer: 'Envoyez votre logo en format vectoriel (AI, EPS, PDF) pour un rendu optimal. Les fichiers HD en PNG ou JPEG sont également acceptés. Vous pouvez les joindre à votre demande de devis.',
  },
  {
    question: 'Proposez-vous des échantillons ?',
    answer: 'Oui, nous pouvons vous envoyer des échantillons de tissus et réaliser un prototype de personnalisation. Contactez-nous pour connaître les conditions.',
  },
];

export function FAQ() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-page">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Retrouvez les réponses aux questions les plus courantes"
        />

        <div className="max-w-3xl mx-auto mt-12">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="surface-elevated rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-10">
            <Link to="/faq">
              <Button variant="outline" className="group">
                Voir toutes les questions
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
