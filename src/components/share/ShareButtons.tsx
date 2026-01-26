import { useState } from 'react';
import { Mail, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Vrais logos SVG des réseaux sociaux
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#E60023">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.217-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

export interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  image?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ShareButtons({
  title,
  url,
  description,
  image,
  className = '',
  variant = 'default',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Use canonical domain
  const canonicalUrl = url.replace(/^https?:\/\/[^/]+/, 'https://j2ltextiles.fr');
  
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = image ? encodeURIComponent(image) : '';
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${canonicalUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform];
    if (platform === 'email') {
      window.location.href = link;
    } else {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const buttonClass = variant === 'compact' 
    ? 'h-9 w-9 p-0' 
    : 'gap-2';

  return (
    <div className={`space-y-3 ${className}`}>
      {variant === 'default' && (
        <h3 className="font-semibold text-sm">Partager</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className={`${buttonClass} hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30`}
          title="Partager sur Facebook"
        >
          <FacebookIcon />
          {variant === 'default' && <span className="hidden sm:inline">Facebook</span>}
        </Button>

        {/* X / Twitter */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className={`${buttonClass} hover:bg-foreground/10`}
          title="Partager sur X"
        >
          <XTwitterIcon />
          {variant === 'default' && <span className="hidden sm:inline">X</span>}
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className={`${buttonClass} hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30`}
          title="Partager sur LinkedIn"
        >
          <LinkedInIcon />
          {variant === 'default' && <span className="hidden sm:inline">LinkedIn</span>}
        </Button>

        {/* Pinterest */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('pinterest')}
          className={`${buttonClass} hover:bg-[#E60023]/10 hover:border-[#E60023]/30`}
          title="Partager sur Pinterest"
        >
          <PinterestIcon />
          {variant === 'default' && <span className="hidden sm:inline">Pinterest</span>}
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          className={buttonClass}
          title="Envoyer par email"
        >
          <Mail className="h-4 w-4" />
          {variant === 'default' && <span className="hidden sm:inline">Email</span>}
        </Button>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className={buttonClass}
          title="Copier le lien"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {variant === 'default' && (
            <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
