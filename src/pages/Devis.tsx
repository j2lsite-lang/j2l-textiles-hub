import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Send, Upload, FileUp, X, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuoteCart } from '@/hooks/useQuoteCart';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuoteFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  deadline: string;
  delivery: string;
  message: string;
}

export default function Devis() {
  const { items, updateItem, removeItem, clear } = useQuoteCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    deadline: '',
    delivery: '',
    message: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des produits avant de soumettre votre demande.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les infos produits pour l'email
      const productDetails = items.map(item => {
        let line = `${item.name} (Réf: ${item.sku}) - ${item.color} / ${item.size} - Qté: ${item.quantity}`;
        if (item.markingType && item.markingType !== 'Sans marquage') {
          line += `\n  → Marquage: ${item.markingType} - Emplacement: ${item.markingLocation || 'Non précisé'}`;
          if (item.markingNotes) {
            line += `\n  → Notes: ${item.markingNotes}`;
          }
        } else if (item.markingType === 'Sans marquage') {
          line += `\n  → Sans marquage`;
        }
        return line;
      }).join('\n\n');
      
      const firstItem = items[0];
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Construire le message complet
      const fullMessage = `
Délai souhaité: ${formData.deadline || 'Non précisé'}
Livraison: ${formData.delivery || 'Non précisé'}
Entreprise: ${formData.company || 'Non précisé'}

Message: ${formData.message || 'Aucun message'}

--- PRODUITS ---
${productDetails}
      `.trim();

      const { data, error } = await supabase.functions.invoke('send-quote', {
        body: {
          nom: formData.name,
          email: formData.email,
          telephone: formData.phone,
          message: fullMessage,
          product_ref: items.length === 1 ? firstItem.sku : `${items.length} produits`,
          product_name: items.length === 1 ? firstItem.name : items.map(i => i.name).join(', '),
          product_brand: items.length === 1 ? firstItem.brand : items.map(i => i.brand).filter((v, i, a) => a.indexOf(v) === i).join(', '),
          quantity: totalQty.toString(),
          variant: items.length === 1 ? `${firstItem.color} / ${firstItem.size}` : 'Voir détails',
          page: 'Demande de devis',
        },
      });

      if (error) throw new Error(error.message);

      toast({
        title: 'Demande envoyée !',
        description: 'Nous vous répondrons sous 24h ouvrées.',
      });

      setIsSubmitted(true);
      clear();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isSubmitted) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-page">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">
                Demande envoyée !
              </h1>
              <p className="text-muted-foreground mb-8">
                Merci pour votre demande de devis. Notre équipe l'examine et vous répondra sous 24h ouvrées.
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

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Devis"
            title="Votre demande de devis"
            description="Récapitulatif de vos produits et formulaire de contact"
          />

          <div className="mt-12 grid lg:grid-cols-5 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Produits sélectionnés
                {items.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalQuantity} article{totalQuantity > 1 ? 's' : ''})
                  </span>
                )}
              </h2>

              {items.length === 0 ? (
                <div className="surface-elevated rounded-xl p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/50 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          width={80}
                          height={80}
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
                        {item.markingType && (
                          <div className="mt-2 text-xs space-y-0.5">
                            {item.markingType === 'Sans marquage' ? (
                              <p className="text-muted-foreground">Sans marquage</p>
                            ) : (
                              <>
                                <p className="text-primary font-medium">
                                  {item.markingType} • {item.markingLocation}
                                </p>
                                {item.markingNotes && (
                                  <p className="text-muted-foreground italic">
                                    {item.markingNotes}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}
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

            {/* Quote Form */}
            <div className="lg:col-span-2">
              <div className="surface-elevated rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Vos coordonnées</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Délai souhaité</Label>
                      <Select
                        value={formData.deadline}
                        onValueChange={(value) => setFormData({ ...formData, deadline: value })}
                      >
                        <SelectTrigger id="deadline">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (&lt; 1 semaine)</SelectItem>
                          <SelectItem value="normal">Normal (2-3 semaines)</SelectItem>
                          <SelectItem value="flexible">Flexible (&gt; 3 semaines)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery">Livraison</Label>
                      <Select
                        value={formData.delivery}
                        onValueChange={(value) => setFormData({ ...formData, delivery: value })}
                      >
                        <SelectTrigger id="delivery">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Retrait sur place</SelectItem>
                          <SelectItem value="delivery">Livraison</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Précisions</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      placeholder="Détails sur la personnalisation, emplacement du marquage..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Fichiers (logo, maquette...)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".ai,.eps,.pdf,.svg,.png,.jpg,.jpeg,.tiff"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Cliquez ou glissez vos fichiers
                        </span>
                        <span className="text-xs text-muted-foreground">
                          AI, EPS, PDF, SVG, PNG, JPG
                        </span>
                      </label>
                    </div>
                    {files.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {files.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFile(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || items.length === 0}
                  >
                    {isSubmitting ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer ma demande
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    En soumettant ce formulaire, vous acceptez notre{' '}
                    <Link to="/confidentialite" className="underline">
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
