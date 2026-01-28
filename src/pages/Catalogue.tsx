import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, X, Loader2, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCatalog, useAttributes } from '@/hooks/useTopTex';
import { Product } from '@/lib/toptex-api';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SyncProgressBar } from '@/components/admin/SyncProgressBar';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { normalizeBrandKey, useToptexBrandLogos } from '@/hooks/useToptexBrandLogos';
import { getUniversSEO } from '@/lib/univers-seo-content';
import { ShareButtons } from '@/components/share/ShareButtons';

// Fallback mock products when API is unavailable
const mockProducts = [
  {
    sku: 'STTU755',
    name: 'T-shirt Creator unisexe',
    brand: 'Stanley/Stella',
    category: 'T-shirts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    colors: [{ name: 'Blanc', code: '#ffffff' }, { name: 'Noir', code: '#000000' }, { name: 'Marine', code: '#1e3a5f' }],
    sizes: ['S', 'M', 'L', 'XL'],
    priceHT: 8.50,
  },
  {
    sku: 'STPM563',
    name: 'Polo Dedicator homme',
    brand: 'Stanley/Stella',
    category: 'Polos',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
    colors: [{ name: 'Blanc', code: '#ffffff' }, { name: 'Noir', code: '#000000' }],
    sizes: ['S', 'M', 'L', 'XL'],
    priceHT: 18.00,
  },
  {
    sku: 'STSU811',
    name: 'Sweat Changer unisexe',
    brand: 'Stanley/Stella',
    category: 'Sweats',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'],
    colors: [{ name: 'Noir', code: '#000000' }, { name: 'Gris chiné', code: '#9ca3af' }],
    sizes: ['S', 'M', 'L', 'XL'],
    priceHT: 28.00,
  },
  {
    sku: 'JN831',
    name: 'Softshell homme',
    brand: 'James & Nicholson',
    category: 'Vestes',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'],
    colors: [{ name: 'Noir', code: '#000000' }, { name: 'Marine', code: '#1e3a5f' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    priceHT: 45.00,
  },
  {
    sku: 'KP011',
    name: 'Casquette Orlando',
    brand: 'K-Up',
    category: 'Accessoires',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'],
    colors: [{ name: 'Noir', code: '#000000' }, { name: 'Blanc', code: '#ffffff' }],
    sizes: ['Unique'],
    priceHT: 5.50,
  },
  {
    sku: 'KI0104',
    name: 'Sac shopping',
    brand: 'Kimood',
    category: 'Bagagerie',
    images: ['https://images.unsplash.com/photo-1597633125097-5a9ae3a47c84?w=400&h=400&fit=crop'],
    colors: [{ name: 'Naturel', code: '#fef3c7' }, { name: 'Noir', code: '#000000' }],
    sizes: ['Unique'],
    priceHT: 3.50,
  },
  {
    sku: 'BC123',
    name: 'Polo ID.001',
    brand: 'B&C',
    category: 'Polos',
    images: ['https://images.unsplash.com/photo-1625910513413-5fc5c3ebe11e?w=400&h=400&fit=crop'],
    colors: [{ name: 'Blanc', code: '#ffffff' }, { name: 'Noir', code: '#000000' }, { name: 'Royal', code: '#2563eb' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    priceHT: 12.00,
  },
  {
    sku: 'GI18000',
    name: 'Sweat capuche Heavy Blend',
    brand: 'Gildan',
    category: 'Sweats',
    images: ['https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=400&fit=crop'],
    colors: [{ name: 'Noir', code: '#000000' }, { name: 'Gris', code: '#9ca3af' }, { name: 'Marine', code: '#1e3a5f' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    priceHT: 15.00,
  },
];

// Default values - will be replaced by dynamic values from useAttributes hook
const defaultCategories = ['Tous', 'T-shirts', 'Polos', 'Sweats', 'Vestes', 'Accessoires', 'Bagagerie'];
const defaultBrands = ['Toutes', 'Stanley/Stella', 'James & Nicholson', 'B&C', 'Gildan', 'K-Up', 'Kimood'];

function getColorStyle(colorName: string, colorCode?: string): string {
  if (colorCode && colorCode.startsWith('#')) return colorCode;
  
  const colorMap: Record<string, string> = {
    'blanc': '#ffffff',
    'white': '#ffffff',
    'noir': '#000000',
    'black': '#000000',
    'marine': '#1e3a5f',
    'navy': '#1e3a5f',
    'gris': '#9ca3af',
    'gris chiné': '#9ca3af',
    'grey': '#9ca3af',
    'gray': '#9ca3af',
    'rouge': '#dc2626',
    'red': '#dc2626',
    'bleu': '#2563eb',
    'blue': '#2563eb',
    'royal': '#2563eb',
    'bordeaux': '#7f1d1d',
    'anthracite': '#374151',
    'naturel': '#fef3c7',
    'natural': '#fef3c7',
    'beige': '#fef3c7',
  };
  
  return colorMap[colorName.toLowerCase()] || '#e5e7eb';
}

interface DisplayProduct {
  sku: string;
  name: string;
  brand: string;
  category: string;
  images: string[];
  colors: Array<{ name: string; code?: string }>;
  priceHT?: number | null;
  price?: number;
}

// Note: Les logos locaux ne sont plus utilisés - on utilise maintenant useToptexBrandLogos
// qui contient les URLs officielles des logos TopTex

// Liste vide - on utilise désormais remoteBrandLogos exclusivement
const brandLogos: Record<string, string> = {};

import { getProductUrl } from '@/lib/product-utils';

function ProductCard({ product }: { product: DisplayProduct }) {
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
  const displayColors = product.colors?.slice(0, 4) || [];
  
  return (
    <Link to={getProductUrl(product.sku, product.name)} className="group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Image sur fond blanc */}
        <div className="aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
            }}
          />
        </div>
        {/* Infos produit */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs font-medium text-primary mb-1">{product.brand}</p>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-primary">
              {product.priceHT ? `${(Math.round(product.priceHT * 10) / 10).toFixed(2).replace('.', ',')} € HT` : 'Sur devis'}
            </span>
            <div className="flex gap-1">
              {displayColors.map((color, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getColorStyle(color.name, color.code) }}
                  title={color.name}
                />
              ))}
              {(product.colors?.length || 0) > 4 && (
                <span className="text-xs text-muted-foreground ml-1">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BrandCard({ brand }: { brand: string }) {
  const logoUrl = brandLogos[brand];
  // Get initials for fallback (max 2 chars)
  const initials = brand.split(/[\s-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center h-24 hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={brand} 
          className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
          <span className="text-lg font-bold text-primary">{initials}</span>
        </div>
      )}
      <span className={cn("text-xs font-medium text-gray-600 text-center line-clamp-1", logoUrl && "hidden")}>{brand}</span>
    </div>
  );
}

// Générer un slug à partir du nom de catégorie
function categoryToSlug(category: string): string {
  if (category === 'Tous') return '';
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer caractères spéciaux par -
    .replace(/(^-|-$)/g, '');        // Supprimer - au début/fin
}

function FilterSidebar({
  selectedCategory,
  onCategoryClick,
  selectedBrand,
  setSelectedBrand,
  selectedWorld,
  setSelectedWorld,
  categories,
  brands,
  worlds,
  currentSlug,
  currentWorldSlug,
}: {
  selectedCategory: string;
  onCategoryClick: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  selectedWorld: string;
  setSelectedWorld: (v: string) => void;
  categories: string[];
  brands: string[];
  worlds: string[];
  currentSlug?: string;
  currentWorldSlug?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Univers Filter - TopTex worlds like Workwear, Sport, etc. */}
      {worlds.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Univers</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <Link
              to="/catalogue"
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                !currentWorldSlug && selectedWorld === 'Tous'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              Tous les univers
            </Link>
            {worlds.map((world) => {
              const slug = worldToSlug(world);
              const isActive = currentWorldSlug === slug || selectedWorld === world;
              
              return (
                <Link
                  key={world}
                  to={`/univers/${slug}`}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {world}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Catégorie</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((cat) => {
            const slug = categoryToSlug(cat);
            const isActive = cat === 'Tous' 
              ? (!currentSlug && selectedCategory === 'Tous')
              : (currentSlug === slug || selectedCategory === cat);
            
            return (
              <Link
                key={cat}
                to={cat === 'Tous' ? '/catalogue' : `/catalogue/${slug}`}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Marque</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedBrand === brand
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Alphabet pour le filtre
const alphabet = ['Tous', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

// Mapping slug → catégorie exacte pour le filtre (pas pour la recherche textuelle)
const categorySlugToCategory: Record<string, string> = {
  't-shirts': 'T-shirts',
  'polos': 'Polos',
  'sweats': 'Sweats',
  'vestes': 'Vestes',
  'chemises': 'Chemises',
  'pantalons': 'Pantalons',
  'casquettes': 'Casquettes',
  'sacs': 'Sacs',
  'serviettes': 'Serviettes',
  'tabliers': 'Tabliers',
  'gilets': 'Gilets',
  'accessoires': 'Accessoires',
  'bonnets': 'Bonnets',
  'bermudas': 'Bermudas',
  'debardeurs': 'Débardeurs',
  'robes': 'Robes',
  'jupes': 'Jupes',
  'pyjamas': 'Pyjamas',
  'chaussettes': 'Chaussettes',
  'chaussures': 'Chaussures',
  'parapluies': 'Parapluies',
  'bagagerie': 'Bagagerie',
  'linge-de-maison': 'Linge de maison',
  'headwear-accessoires': 'Headwear & Accessoires',
};

// Mapping slug → univers TopTex pour URLs SEO (basé sur les vrais noms en base)
const worldSlugMap: Record<string, string> = {
  'workwear': 'Workwear',
  'sport': 'Sport',
  'chr': 'CHR Métiers de bouche',
  'epi': 'EPI',
  'mode-retail': 'Mode Retail',
  'accueil': 'Accueil',
  'sante-beaute': 'Santé Beauté Hygiène',
  'industrie': 'Industrie Sécurité BTP',
  'logistique': 'Distribution Logistique',
  'jardinerie': 'Jardinerie Bricolage',
  'artisanat': 'Artisanat Commerce',
  'merchandising': 'Médias Merchandising',
  'schoolwear': 'Schoolwear',
  'tourisme': 'Tourisme Culture',
  'evenementiel': 'Promotion Évènementiel',
  'noel': 'Noël',
  'plage': 'Shopping Plage',
  'sport-loisirs': 'Sport Loisirs',
  'souvenir': 'Souvenir Licences',
  'ecole': 'Ecole Université',
};

// Reverse mapping: world name → slug
const worldToSlug = (world: string): string => {
  // Check if already in the map as a value
  const entry = Object.entries(worldSlugMap).find(([_, v]) => v === world);
  if (entry) return entry[0];
  
  // Create slug from name
  return world
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function Catalogue() {
  const { category: categorySlug, world: worldSlug } = useParams<{ category?: string; world?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Convertir slug URL en catégorie (utilise le filtre category, pas la recherche textuelle)
  const slugCategoryName = categorySlug ? (categorySlugToCategory[categorySlug] || null) : null;
  
  // Convertir slug URL en univers (world)
  const slugWorldTerm = worldSlug ? (worldSlugMap[worldSlug] || worldSlug) : '';
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  // Si on a un slug de catégorie valide, l'utiliser comme selectedCategory
  const [selectedCategory, setSelectedCategory] = useState(
    slugCategoryName || searchParams.get('cat') || 'Tous'
  );
  const [selectedBrand, setSelectedBrand] = useState('Toutes');
  const [selectedWorld, setSelectedWorld] = useState(slugWorldTerm || 'Tous');
  const [selectedLetter, setSelectedLetter] = useState('Tous');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncTotalInfo, setSyncTotalInfo] = useState<{ pages: number; products: number } | null>(null);
  const { toast } = useToast();

  // Synchroniser avec le slug d'URL si présent (catégorie)
  useEffect(() => {
    if (categorySlug) {
      const catName = categorySlugToCategory[categorySlug];
      if (catName && catName !== selectedCategory) {
        setSelectedCategory(catName);
        setPage(1);
      }
    } else if (!categorySlug && selectedCategory !== 'Tous' && !searchParams.get('cat')) {
      // Reset to 'Tous' when navigating to /catalogue without slug
      setSelectedCategory('Tous');
    }
  }, [categorySlug]);

  // Synchroniser avec le slug d'URL si présent (univers)
  useEffect(() => {
    if (worldSlug) {
      const world = worldSlugMap[worldSlug] || worldSlug;
      if (world !== selectedWorld) {
        setSelectedWorld(world);
        setPage(1);
      }
    } else if (!worldSlug && selectedWorld !== 'Tous' && !slugWorldTerm) {
      // Reset world if navigating away from /univers/
      // Only reset if we're not on an univers page
    }
  }, [worldSlug]);

  // Redirection des anciennes URLs ?cat= et ?q= vers les nouvelles URLs propres
  useEffect(() => {
    if (categorySlug) return; // Déjà sur une URL propre
    
    const urlCat = searchParams.get('cat');
    const urlQuery = searchParams.get('q');
    
    // Rediriger ?cat=Vestes vers /catalogue/vestes
    if (urlCat && urlCat !== 'Tous') {
      const slug = urlCat
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      navigate(`/catalogue/${slug}`, { replace: true });
      return;
    }
    
    // Rediriger ?q=t-shirts vers /catalogue/t-shirts si c'est une catégorie connue
    if (urlQuery) {
      const queryLower = urlQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const slugFromQuery = Object.entries(categorySlugToCategory).find(
        ([slug]) => slug === queryLower || queryLower.includes(slug.replace(/-/g, ''))
      )?.[0];
      
      if (slugFromQuery) {
        navigate(`/catalogue/${slugFromQuery}`, { replace: true });
        return;
      }
      // Sinon garder le ?q= pour les recherches libres
      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
        setPage(1);
      }
    }
  }, [searchParams, categorySlug, navigate]);
  const { isAdmin } = useIsAdmin();

  const { data: remoteBrandLogos } = useToptexBrandLogos();

  // Load dynamic categories/brands from DB
  const { data: attributesData } = useAttributes();
  const categories = attributesData?.categories?.length
    ? ['Tous', ...attributesData.categories]
    : defaultCategories;

  // Brands: trim + tri FR + dédoublonnage pour que le filtre A-Z soit fiable
  const rawBrands = attributesData?.brands?.length
    ? attributesData.brands
    : defaultBrands.filter((b) => b !== 'Toutes');

  const brands = [
    'Toutes',
    ...Array.from(
      new Set(rawBrands.map((b) => (typeof b === 'string' ? b.trim() : '')).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  ];

  // Worlds (univers TopTex like Workwear, Sport, etc.)
  const worlds = attributesData?.worlds || [];

  // Avoid spamming resume calls
  const lastAutoResumeAtRef = useRef<number>(0);
  const AUTO_RESUME_COOLDOWN_MS = 10_000; // 10s (sync runs in short chunks server-side)

  // Callback when sync completes
  const handleSyncComplete = () => {
    window.location.reload();
  };

  // Lancer ou reprendre la synchronisation du catalogue
  const handleSync = async (forceRestart = false) => {
    setIsSyncing(true);
    setSyncStatus('Démarrage...');
    
    try {
      // First check status to see if we should resume
      const { data: statusCheck } = await supabase.functions.invoke('catsync', {
        body: { action: 'status' }
      });
      
      let action = 'start';
      if (!forceRestart && statusCheck?.last_sync) {
        const lastSync = statusCheck.last_sync;
        // If there's a stale syncing or paused job, try to resume
        if (lastSync.status === 'syncing' || lastSync.status === 'paused') {
          action = 'resume';
          setSyncStatus(`Reprise depuis page ${(lastSync.last_successful_page || 0) + 1}...`);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('catsync', {
        body: { action: forceRestart ? 'force-restart' : action }
      });
      
      if (error) throw error;
      
      const resumeInfo = data?.resumed 
        ? ` (reprise page ${data.resume_from_page}, ${data.existing_products} produits existants)`
        : '';
      
      toast({
        title: data?.resumed ? "Synchronisation reprise" : "Synchronisation lancée",
        description: `Le catalogue est en cours de mise à jour${resumeInfo}. Cela peut prendre plusieurs minutes.`,
      });
      
      setSyncStatus('En cours...');
      
      // Polling pour suivre la progression
      const pollStatus = async () => {
        const { data: statusData } = await supabase.functions.invoke('catsync', {
          body: { action: 'status' }
        });
        
        if (statusData?.last_sync) {
          const lastSync = statusData.last_sync;
          const status = lastSync.status;
          const count = lastSync.products_count || 0;
          const currentPage = lastSync.current_page || 0;
          const lastSuccessfulPage = lastSync.last_successful_page || 0;
          const retryAttempt = lastSync.page_retry_attempt || 0;
          const errMsg = lastSync.error_message || '';
          
          if (status === 'completed') {
            setSyncStatus(null);
            setIsSyncing(false);

            if (count > 0) {
              toast({
                title: "Synchronisation terminée",
                description: `${count} produits synchronisés avec succès.`,
              });
              // Rafraîchir la page pour voir les nouveaux produits
              window.location.reload();
            } else {
              toast({
                title: "Synchronisation terminée (0 produit)",
                description: "Le job s'est terminé mais aucun produit n'a été importé.",
                variant: "destructive",
              });
            }
          } else if (status === 'failed') {
            setSyncStatus(null);
            setIsSyncing(false);
            toast({
              title: "Erreur de synchronisation",
              description: errMsg || "Une erreur est survenue",
              variant: "destructive",
            });
          } else {
            // Afficher progression - NE PAS auto-resume pendant un sync actif
            const heartbeatAt = lastSync.heartbeat_at ? new Date(lastSync.heartbeat_at).getTime() : 0;
            const secondsSinceHeartbeat = heartbeatAt ? Math.round((Date.now() - heartbeatAt) / 1000) : null;

            // Auto-reprise UNIQUEMENT si paused (pas si syncing - on laisse faire)
            // Cela évite d'interrompre le traitement en cours
            if (status === 'paused') {
              const now = Date.now();
              if (now - lastAutoResumeAtRef.current > AUTO_RESUME_COOLDOWN_MS) {
                lastAutoResumeAtRef.current = now;
                setSyncStatus('Reprise automatique en cours...');
                await supabase.functions.invoke('catsync', { body: { action: 'resume' } });
              }
            }

            // Afficher progression détaillée
            let statusText = `Page ${currentPage}`;
            if (retryAttempt > 0) {
              statusText += ` (tentative ${retryAttempt})`;
            }
            statusText += ` - ${count} produits`;

            if (secondsSinceHeartbeat != null && secondsSinceHeartbeat > 30) {
              statusText += ` (signal ${secondsSinceHeartbeat}s)`;
            }

            if (errMsg && !errMsg.startsWith('Page')) {
              statusText = errMsg;
            }

            setSyncStatus(statusText);
            setTimeout(pollStatus, 3000); // Poll every 3s (not 2s to reduce load)
          }
        } else {
          // No status data, keep polling
          setTimeout(pollStatus, 3000);
        }
      };
      
      setTimeout(pollStatus, 1500);
      
    } catch (error: any) {
      console.error('Sync error:', error);
      setIsSyncing(false);
      setSyncStatus(null);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de lancer la synchronisation",
        variant: "destructive",
      });
    }
  };

  const getBrandInitial = (brand: string) => {
    const cleaned = (brand || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const m = cleaned.match(/[A-Za-z]/);
    return (m?.[0] || '').toUpperCase();
  };

  // Filtrer les marques par lettre
  const filteredBrandsByLetter = brands.filter((b) => {
    if (b === 'Toutes') return true;
    if (selectedLetter === 'Tous') return true;
    return getBrandInitial(b) === selectedLetter;
  });

  // Fetch from TopTex API
  const { data: catalogData, isLoading, error } = useCatalog({
    query: searchQuery,
    category: selectedCategory !== 'Tous' ? selectedCategory : undefined,
    brand: selectedBrand !== 'Toutes' ? selectedBrand : undefined,
    world: selectedWorld !== 'Tous' ? selectedWorld : undefined,
    page,
    limit: 24,
  });

  // Use API data or fallback to mock products
  const products: DisplayProduct[] = catalogData?.products || mockProducts;
  const isUsingMock = !catalogData?.products;

  // Client-side filter for mock products
  const displayProducts = isUsingMock
    ? products.filter((product) => {
        const matchesSearch = !searchQuery || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
        const matchesBrand = selectedBrand === 'Toutes' || product.brand === selectedBrand;

        return matchesSearch && matchesCategory && matchesBrand;
      })
    : products;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Si on est sur une URL avec slug, naviguer vers /catalogue avec query params
    if (categorySlug) {
      navigate(`/catalogue${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
    } else {
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory !== 'Tous') params.cat = selectedCategory;
      setSearchParams(params);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tous');
    setSelectedBrand('Toutes');
    setSelectedWorld('Tous');
    setSelectedLetter('Tous');
    // Retourner à /catalogue sans paramètres
    if (categorySlug) {
      navigate('/catalogue');
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Tous' || selectedBrand !== 'Toutes' || selectedWorld !== 'Tous' || !!categorySlug;

  // Fetch sync total info on mount
  useEffect(() => {
    const fetchSyncInfo = async () => {
      try {
        const { data } = await supabase.functions.invoke('catsync', { body: { action: 'status' } });
        if (data?.last_sync) {
          setSyncTotalInfo({
            pages: data.last_sync.current_page || data.last_sync.estimated_total_pages || 0,
            products: data.product_count_db || data.last_sync.products_count || 0,
          });
        }
      } catch (e) {
        // Ignore
      }
    };
    fetchSyncInfo();
  }, []);

  // Get SEO content for current univers
  const universSEO = worldSlug ? getUniversSEO(worldSlug) : null;

  return (
    <Layout>
      {/* Dynamic SEO meta tags for univers pages */}
      {universSEO && (
        <Helmet>
          <title>{universSEO.metaTitle}</title>
          <meta name="description" content={universSEO.metaDescription} />
          <meta name="keywords" content={universSEO.keywords.join(', ')} />
          <link rel="canonical" href={`https://j2l-impression.fr/univers/${worldSlug}`} />
          <meta property="og:title" content={universSEO.metaTitle} />
          <meta property="og:description" content={universSEO.metaDescription} />
          <meta property="og:url" content={`https://j2l-impression.fr/univers/${worldSlug}`} />
          <meta property="og:type" content="website" />
        </Helmet>
      )}

      <section className="section-padding">
        <div className="container-page">
          {/* Dynamic header based on univers */}
          {universSEO ? (
            <div className="text-center mb-8">
              <span className="inline-block text-sm font-medium text-primary tracking-wider uppercase mb-2">
                Univers
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                {universSEO.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {universSEO.heroDescription}
              </p>
              {/* Share Buttons for Universe */}
              <div className="mt-4 flex justify-center">
                <ShareButtons
                  title={universSEO.title}
                  url={typeof window !== 'undefined' ? window.location.href : `https://j2ltextiles.fr/univers/${worldSlug}`}
                  description={universSEO.metaDescription}
                  variant="compact"
                />
              </div>
            </div>
          ) : (
            <div className="text-center mb-8">
              <SectionHeader
                eyebrow="Catalogue"
                title="Nos produits textiles"
                description="Explorez notre sélection de vêtements et accessoires personnalisables"
              />
              {/* Share Buttons for Catalogue */}
              <div className="mt-4 flex justify-center">
                <ShareButtons
                  title="Catalogue J2L Textiles - Vêtements personnalisables"
                  url={typeof window !== 'undefined' ? window.location.href : 'https://j2ltextiles.fr/catalogue'}
                  description="Découvrez notre catalogue de textiles professionnels personnalisables : t-shirts, polos, sweats, vestes et accessoires."
                  variant="compact"
                />
              </div>
            </div>
          )}

          {/* Admin Progress Bar */}
          {isAdmin && (
            <div className="mt-6">
              <SyncProgressBar onSyncComplete={handleSyncComplete} />
            </div>
          )}

          {/* API Error Notice */}
          {error && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connexion à l'API en cours... Affichage des produits de démonstration.
              </AlertDescription>
            </Alert>
          )}

          {/* Search & Filter Bar */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un produit, une marque, une référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </form>

            <div className="flex gap-2 flex-wrap">
              {/* Bouton Synchroniser - Admin uniquement */}
              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => handleSync()}
                  disabled={isSyncing}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                  {isSyncing ? (syncStatus || 'Sync...') : 'Synchroniser'}
                </Button>
              )}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      onCategoryClick={(v) => {
                        setSelectedCategory(v);
                        setPage(1);
                        setIsFilterOpen(false);
                      }}
                      selectedBrand={selectedBrand}
                      setSelectedBrand={(v) => {
                        setSelectedBrand(v);
                        setPage(1);
                        setIsFilterOpen(false);
                      }}
                      selectedWorld={selectedWorld}
                      setSelectedWorld={(v) => {
                        setSelectedWorld(v);
                        setPage(1);
                        setIsFilterOpen(false);
                      }}
                      categories={categories}
                      brands={brands}
                      worlds={worlds}
                      currentSlug={categorySlug}
                      currentWorldSlug={worldSlug}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {searchQuery}
                  <button onClick={() => { setSearchQuery(''); setPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'Tous' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => { setSelectedCategory('Tous'); setPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBrand !== 'Toutes' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedBrand}
                  <button onClick={() => { setSelectedBrand('Toutes'); setPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedWorld !== 'Tous' && (
                <Badge variant="secondary" className="gap-1">
                  Univers: {selectedWorld}
                  <button onClick={() => { setSelectedWorld('Tous'); setPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="mt-8 flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  onCategoryClick={(v) => { setSelectedCategory(v); setPage(1); }}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={(v) => { setSelectedBrand(v); setPage(1); }}
                  selectedWorld={selectedWorld}
                  setSelectedWorld={(v) => { setSelectedWorld(v); setPage(1); }}
                  categories={categories}
                  brands={brands}
                  worlds={worlds}
                  currentSlug={categorySlug}
                  currentWorldSlug={worldSlug}
                />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Effacer les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {catalogData?.pagination?.total || displayProducts.length} produit{(catalogData?.pagination?.total || displayProducts.length) > 1 ? 's' : ''} trouvé{(catalogData?.pagination?.total || displayProducts.length) > 1 ? 's' : ''}
                    {isUsingMock && ' (démo)'}
                    {syncTotalInfo && !isUsingMock && (
                      <span className="ml-2 text-xs text-muted-foreground/70">
                        (Total catalogue : {syncTotalInfo.products} produits / {syncTotalInfo.pages} pages)
                      </span>
                    )}
                  </p>
                  
                  {/* Grille Produits EN PREMIER */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {displayProducts.map((product) => (
                      <ProductCard key={product.sku} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {catalogData?.pagination && catalogData.pagination.totalPages > 1 && (
                    <div className="mt-10 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Précédent
                      </Button>
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Page {page} sur {catalogData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={page >= catalogData.pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}

                  {/* Internal Links - SEO Maillage */}
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="font-semibold mb-4 text-lg">Livraison dans toute la France</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>Grand Est :</strong>{' '}
                        <Link to="/zones/vosges/epinal" className="text-primary hover:underline">Épinal</Link>{', '}
                        <Link to="/zones/meurthe-et-moselle/nancy" className="text-primary hover:underline">Nancy</Link>{', '}
                        <Link to="/zones/moselle/metz" className="text-primary hover:underline">Metz</Link>{', '}
                        <Link to="/zones/bas-rhin/strasbourg" className="text-primary hover:underline">Strasbourg</Link>{', '}
                        <Link to="/zones/haut-rhin/mulhouse" className="text-primary hover:underline">Mulhouse</Link>{', '}
                        <Link to="/zones/haut-rhin/colmar" className="text-primary hover:underline">Colmar</Link>{', '}
                        <Link to="/zones/marne/reims" className="text-primary hover:underline">Reims</Link>{', '}
                        <Link to="/zones/aube/troyes" className="text-primary hover:underline">Troyes</Link>
                      </p>
                      <p>
                        <strong>Grandes villes :</strong>{' '}
                        <Link to="/zones/paris/paris" className="text-primary hover:underline">Paris</Link>{', '}
                        <Link to="/zones/rhone/lyon" className="text-primary hover:underline">Lyon</Link>{', '}
                        <Link to="/zones/bouches-du-rhone/marseille" className="text-primary hover:underline">Marseille</Link>{', '}
                        <Link to="/zones/haute-garonne/toulouse" className="text-primary hover:underline">Toulouse</Link>{', '}
                        <Link to="/zones/gironde/bordeaux" className="text-primary hover:underline">Bordeaux</Link>{', '}
                        <Link to="/zones/nord/lille" className="text-primary hover:underline">Lille</Link>{', '}
                        <Link to="/zones/loire-atlantique/nantes" className="text-primary hover:underline">Nantes</Link>
                      </p>
                      <p className="pt-2">
                        <Link to="/zones" className="text-primary hover:underline font-medium">Voir toutes nos zones d'intervention →</Link>
                      </p>
                    </div>
                    <div className="mt-6 text-xs text-muted-foreground">
                      Besoin d'enseigne ou signalétique ?{' '}
                      <a 
                        href="https://j2lpublicite.fr" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        J2L Publicité
                      </a>
                      {' '}est notre partenaire spécialisé.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section for Univers pages */}
      {universSEO && (
        <section className="section-padding bg-secondary/30">
          <div className="container-page">
            <div 
              className="prose prose-lg max-w-none text-muted-foreground
                prose-headings:text-foreground prose-headings:font-display
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-0
                prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                prose-p:mb-4 prose-p:leading-relaxed
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: universSEO.seoText }}
            />
            
            {/* Related Univers */}
            {universSEO.relatedUnivers.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Univers associés</h3>
                <div className="flex flex-wrap gap-3">
                  {universSEO.relatedUnivers.map(slug => {
                    const related = getUniversSEO(slug);
                    if (!related) return null;
                    return (
                      <Link
                        key={slug}
                        to={`/univers/${slug}`}
                        className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {related.title.replace('Vêtements ', '').replace('Équipements de ', '').replace("Vêtements d'", '').replace('Textiles ', '')}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <PageSEOFooter variant={universSEO ? 'default' : 'catalogue'} />
    </Layout>
  );
}
