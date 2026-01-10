import { useState } from 'react';
import { Facebook, Linkedin, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Custom icons for Pinterest and X (Twitter)
const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.217-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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
}

export function ProductShareButtons({
  productName,
  productUrl,
  productImage,
}: ProductShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName);
  const encodedImage = productImage ? encodeURIComponent(productImage) : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Découvrez ce produit : ${productUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="gap-2"
          title="Partager sur Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Facebook</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="gap-2"
          title="Partager sur LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">LinkedIn</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('pinterest')}
          className="gap-2"
          title="Partager sur Pinterest"
        >
          <PinterestIcon />
          <span className="sr-only sm:not-sr-only">Pinterest</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="gap-2"
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
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only sm:not-sr-only">{copied ? 'Copié !' : 'Copier'}</span>
        </Button>
      </div>
    </div>
  );
}
