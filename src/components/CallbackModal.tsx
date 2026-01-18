import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CallbackModalProps {
  productRef?: string;
  productName?: string;
}

export function CallbackModal({ productRef, productName }: CallbackModalProps = {}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir votre nom et téléphone.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productInfo = productRef ? `\n\nProduit concerné: ${productRef}${productName ? ` - ${productName}` : ''}` : '';
      
      const { error } = await supabase.functions.invoke('send-quote', {
        body: {
          nom: formData.name,
          email: 'rappel@j2lpublicite.fr', // Email placeholder pour les rappels
          telephone: formData.phone,
          message: `Demande de rappel téléphonique${productInfo}`,
          product_ref: productRef || '',
          product_name: productName || '',
          page: productRef ? `Fiche produit ${productRef}` : 'Bouton Être rappelé',
        },
      });

      if (error) throw new Error(error.message);

      toast({
        title: 'Demande envoyée !',
        description: 'Nous vous rappellerons dans les plus brefs délais.',
      });

      setFormData({ name: '', phone: '' });
      setOpen(false);
    } catch (error) {
      console.error('Erreur envoi:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 font-medium"
        >
          <Phone className="h-4 w-4 text-accent" />
          <span className="hidden sm:inline">Rappelez-moi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            Demande de rappel
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="callback-name">Votre nom *</Label>
            <Input
              id="callback-name"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback-phone">Votre téléphone *</Label>
            <Input
              id="callback-phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full accent-gradient text-white font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Demander un rappel'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Nous vous rappellerons dans les plus brefs délais aux heures d'ouverture.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
