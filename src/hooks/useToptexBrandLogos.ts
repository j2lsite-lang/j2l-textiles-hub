import { useMemo } from 'react';

// Mapping complet des marques TopTex vers leurs logos officiels sur cdn.toptex.com
// Basé sur les URLs récupérées de https://www.toptex.fr/marques

const TOPTEX_BRAND_LOGOS: Record<string, string> = {
  // B
  'B&C': 'https://cdn.toptex.com/logos/B&C_LOGO_24.jpg?w=480',
  'BagBase': 'https://cdn.toptex.com/logos/BAGBASE_LOGO.jpg?w=480',
  'BagBase®': 'https://cdn.toptex.com/logos/BAGBASE_LOGO.jpg?w=480',
  'Beechfield': 'https://cdn.toptex.com/logos/BEECHFIELD_LOGO.jpg?w=480',
  'Beechfield®': 'https://cdn.toptex.com/logos/BEECHFIELD_LOGO.jpg?w=480',
  'BELLA+CANVAS': 'https://cdn.toptex.com/logos/BELLACANVAS_LOGO.jpg?w=480',
  'BROOK TAVERNER': 'https://cdn.toptex.com/logos/BROOKTAVERNER_LOGO.jpg?w=480',
  'BUFF': 'https://cdn.toptex.com/logos/BUFF_LOGO.jpg?w=480',
  'BUFF®': 'https://cdn.toptex.com/logos/BUFF_LOGO.jpg?w=480',
  // C
  'Carhartt': 'https://cdn.toptex.com/logos/CARHARTT_LOGO.jpg?w=480',
  'Cat': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'Cat®': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'CG International': 'https://cdn.toptex.com/logos/CGINTERNATIONAL_LOGO.jpg?w=480',
  'Cherokee': 'https://cdn.toptex.com/logos/CHEROKEE_MEDICAL_LOGO.jpg?w=480',
  'Crocs': 'https://cdn.toptex.com/logos/CROCS_LOGO.jpg?w=480',
  // D
  'Dickies': 'https://cdn.toptex.com/logos/DICKIES_LOGO.jpg?w=480',
  'Dickies Medical': 'https://cdn.toptex.com/logos/DICKIES_MEDICAL_LOGO.jpg?w=480',
  // E
  'Estex': 'https://cdn.toptex.com/logos/ESTEX_LOGO.jpg?w=480',
  // F
  'FLEXFIT': 'https://cdn.toptex.com/logos/FLEXFIT_LOGO.jpg?w=480',
  'Front Row': 'https://cdn.toptex.com/logos/FRONTROW_LOGO.jpg?w=480',
  'Fruit of the Loom': 'https://cdn.toptex.com/logos/FRUITOFTHELOOM_LOGO.jpg?w=480',
  // G
  'Gildan': 'https://cdn.toptex.com/logos/GILDAN_LOGO.jpg?w=480',
  // H
  'Henbury': 'https://cdn.toptex.com/logos/HENBURY_LOGO.jpg?w=480',
  // I
  'iDeal Basic Brand': 'https://cdn.toptex.com/logos/IDEAL_LOGO.jpg?w=480',
  // J
  'JSP': 'https://cdn.toptex.com/logos/JSP_LOGO.jpg?w=480',
  // K
  'K-up': 'https://cdn.toptex.com/logos/K-UP_LOGO.jpg?w=480',
  'K-Up': 'https://cdn.toptex.com/logos/K-UP_LOGO.jpg?w=480',
  'Kariban': 'https://cdn.toptex.com/logos/KARIBAN_LOGO.jpg?w=480',
  'Kariban Premium': 'https://cdn.toptex.com/logos/KARIBAN_LOGO.jpg?w=480',
  'Kimood': 'https://cdn.toptex.com/logos/KIMOOD_LOGO.jpg?w=480',
  // L
  'Larkwood': 'https://cdn.toptex.com/logos/LARKWOOD_LOGO.jpg?w=480',
  'Lee': 'https://cdn.toptex.com/logos/LEE_LOGO.jpg?w=480',
  // M
  'Mumbles': 'https://cdn.toptex.com/logos/MUMBLES_LOGO.jpg?w=480',
  // N
  'NAPAPIJRI': 'https://cdn.toptex.com/logos/NAPAPIJRI_LOGO.jpg?w=480',
  'Native Spirit': 'https://cdn.toptex.com/logos/NATIVESPIRIT-logo-gris-cmjn-cmjn-fond-transparent.jpg?w=480',
  // O
  'Onna': 'https://cdn.toptex.com/logos/ONNA_logo.jpg?w=480',
  // P
  'Premier': 'https://cdn.toptex.com/logos/PREMIER_LOGO.jpg?w=480',
  'PROACT': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'PROACT®': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'Proact': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'Puma Workwear': 'https://cdn.toptex.com/logos/PUMA_WORKWEAR_LOGO.jpg?w=480',
  // Q
  'Quadra': 'https://cdn.toptex.com/logos/QUADRA_LOGO.jpg?w=480',
  // R
  'Result': 'https://cdn.toptex.com/logos/RESULT_LOGO.jpg?w=480',
  'Russell': 'https://cdn.toptex.com/logos/RUSSELL_LOGO.jpg?w=480',
  'RYWAN': 'https://cdn.toptex.com/logos/RYWAN_LOGO.jpg?w=480',
  // S
  'Safejawz': 'https://cdn.toptex.com/logos/SAFEJAWZ_LOGO.jpg?w=480',
  'SF Clothing': 'https://cdn.toptex.com/logos/SF_LOGO.jpg?w=480',
  'Shelto': 'https://cdn.toptex.com/logos/SHELTO_LOGO.jpg?w=480',
  'Spasso': 'https://cdn.toptex.com/logos/SPASSO_LOGO_PRINCIPAL.jpg?w=480',
  'Spiro': 'https://cdn.toptex.com/logos/SPIRO_LOGO.jpg?w=480',
  'SPLASHMACS': 'https://cdn.toptex.com/logos/SPLASHMACS_LOGO.jpg?w=480',
  // T
  'TIGER GRIP': 'https://cdn.toptex.com/logos/TIGERGRIP_LOGO.jpg?w=480',
  'Timberland': 'https://cdn.toptex.com/logos/TIMBERLAND_LOGO.jpg?w=480',
  'Tombo': 'https://cdn.toptex.com/logos/TOMBO_LOGO.jpg?w=480',
  'Towel City': 'https://cdn.toptex.com/logos/TOWELCITY_LOGO.jpg?w=480',
  // U
  'U-Power': 'https://cdn.toptex.com/logos/UPOWER_LOGO.jpg?w=480',
  // W
  'Westford Mill': 'https://cdn.toptex.com/logos/WESTFORDMILL_LOGO.jpg?w=480',
  'WK. Designed To Work': 'https://cdn.toptex.com/logos/WK-2_LOGO.jpg?w=480',
  'WRANGLER': 'https://cdn.toptex.com/logos/WRANGLER_LOGO.jpg?w=480',
};

export function normalizeBrandKey(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[®™]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
}

export function useToptexBrandLogos(): { data: Record<string, string> } {
  // Use useMemo to maintain hook consistency
  const data = useMemo(() => {
    const map: Record<string, string> = { ...TOPTEX_BRAND_LOGOS };
    for (const [name, url] of Object.entries(TOPTEX_BRAND_LOGOS)) {
      map[normalizeBrandKey(name)] = url;
    }
    return map;
  }, []);
  
  return { data };
}
