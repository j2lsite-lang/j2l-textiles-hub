import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { COMPANY_INFO } from '@/lib/company-info';
import { sendEmail } from '@/lib/emailjs';

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendEmail({
        nom: formData.name,
        email: formData.email,
        telephone: formData.phone,
        message: `Sujet: ${formData.subject}\n\n${formData.message}`,
        page: 'Page Contact',
      });

      setIsSubmitted(true);

      toast({
        title: 'Message envoyé !',
        description: 'Nous vous répondrons dans les meilleurs délais.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre message. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-page">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">Message envoyé !</h1>
              <p className="text-muted-foreground mb-8">
                Merci de nous avoir contactés. Notre équipe vous répondra dans les meilleurs délais.
              </p>
              <Button onClick={() => setIsSubmitted(false)} className="accent-gradient text-white">
                Envoyer un autre message
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative container-page">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Parlons de votre projet
            </h1>
            <p className="text-xl text-white/80">
              Une question, un devis, une demande spécifique ? Notre équipe est à votre écoute.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="surface-elevated p-6">
                <h3 className="font-display font-semibold text-lg mb-6">Nos coordonnées</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {COMPANY_INFO.address}<br />
                        {COMPANY_INFO.postalCode} {COMPANY_INFO.city}<br />
                        {COMPANY_INFO.country}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <a
                        href={`tel:${COMPANY_INFO.phoneLink}`}
                        className="text-sm text-accent hover:underline font-semibold mt-1 block"
                      >
                        {COMPANY_INFO.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a
                        href={`mailto:${COMPANY_INFO.email}`}
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {COMPANY_INFO.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Horaires</p>
                      <p className="text-sm text-muted-foreground mt-1">{COMPANY_INFO.hours}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="surface-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="font-semibold">Réponse rapide</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nous nous engageons à vous répondre sous <strong className="text-foreground">24h ouvrées</strong>. 
                  Pour les urgences, privilégiez l'appel téléphonique.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="surface-elevated p-8">
                <h2 className="text-2xl font-display font-bold mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="03 XX XX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        required
                        placeholder="Objet de votre message"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="Décrivez votre projet ou posez votre question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="accent-gradient text-white font-semibold h-14 px-8 shadow-accent hover:shadow-lg transition-all group"
                  >
                    {isSubmitting ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Envoyer le message
                        <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
