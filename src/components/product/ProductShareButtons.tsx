import { useState } from 'react';
import { Facebook, Linkedin, Mail, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Custom icons
const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.217-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ProductShareButtonsProps {
  productName: string;
  productUrl: string;
  productImage?: string;
  productDescription?: string;
}

export function ProductShareButtons({
  productName,
  productUrl,
  productImage,
  productDescription,
}: ProductShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Use canonical domain
  const canonicalUrl = productUrl.replace(/^https?:\/\/[^/]+/, 'https://j2ltextiles.fr');
  
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(productName);
  const encodedImage = productImage ? encodeURIComponent(productImage) : '';
  const encodedDescription = encodeURIComponent(productDescription || `Découvrez ${productName} sur J2LTextiles`);

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Découvrez ce produit : ${canonicalUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      toast({
        title: 'Lien copié !',
        description: 'Le lien a été copié dans le presse-papiers.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: productName,
        text: productDescription || `Découvrez ${productName} sur J2LTextiles`,
        url: canonicalUrl,
      });
    } catch (err) {
      // User cancelled or error - silently ignore
      if ((err as Error).name !== 'AbortError') {
        console.log('Share failed:', err);
      }
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === 'email') {
      window.location.href = shareLinks[platform];
    } else {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Partager ce produit</h3>
      <div className="flex flex-wrap gap-2">
        {/* Native Share (mobile/desktop with support) */}
        {canUseWebShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
            title="Partager (Instagram, SMS, etc.)"
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Partager</span>
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="gap-2 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30"
          title="Partager sur Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Facebook</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="gap-2 hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
          title="Partager sur WhatsApp"
        >
          <WhatsAppIcon />
          <span className="sr-only sm:not-sr-only">WhatsApp</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('pinterest')}
          className="gap-2 hover:bg-[#E60023]/10 hover:border-[#E60023]/30"
          title="Partager sur Pinterest"
        >
          <PinterestIcon />
          <span className="sr-only sm:not-sr-only">Pinterest</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="gap-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30"
          title="Partager sur LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">LinkedIn</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="gap-2 hover:bg-foreground/10"
          title="Partager sur X (Twitter)"
        >
          <XIcon />
          <span className="sr-only sm:not-sr-only">X</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          className="gap-2"
          title="Envoyer par email"
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Email</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
          title="Copier le lien"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only sm:not-sr-only">{copied ? 'Copié !' : 'Copier'}</span>
        </Button>
      </div>
      
      {canUseWebShare && (
        <p className="text-xs text-muted-foreground">
          💡 Utilisez "Partager" pour Instagram, Messenger, SMS et plus encore.
        </p>
      )}
    </div>
  );
}
