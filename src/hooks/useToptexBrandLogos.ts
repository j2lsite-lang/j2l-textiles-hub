import { useMemo } from 'react';

// Local brand logos (fast + consistent) — fallback to TopTex CDN for the rest
import bcLogo from '@/assets/brands/bc-collection.svg';
import gildanLogo from '@/assets/brands/gildan.svg';
import fruitLogo from '@/assets/brands/fruit-of-the-loom.svg';
import jnLogo from '@/assets/brands/james-nicholson.svg';
import kupLogo from '@/assets/brands/k-up.svg';
import karibanLogo from '@/assets/brands/kariban.svg';
import kimoodLogo from '@/assets/brands/kimood.svg';
import promodoroLogo from '@/assets/brands/promodoro.svg';
import resultLogo from '@/assets/brands/result.svg';
import solsLogo from '@/assets/brands/sol-s.svg';
import stanleyLogo from '@/assets/brands/stanley-stella.svg';

import bagbaseLogo from '@/assets/brands/bagbase.jpg';
import nativeSpiritLogo from '@/assets/brands/native-spirit.jpg';
import proactLogo from '@/assets/brands/proact.jpg';
import russellLogo from '@/assets/brands/russell.jpg';

// Mapping complet des marques TopTex vers leurs logos officiels sur cdn.toptex.com
// + overrides locaux quand on les a en repo (plus propre, plus rapide)

const TOPTEX_BRAND_LOGOS: Record<string, string> = {
  // A
  'adidas': 'https://cdn.toptex.com/logos/ADIDAS_LOGO.jpg?w=480',
  'Adidas': 'https://cdn.toptex.com/logos/ADIDAS_LOGO.jpg?w=480',
  'ALEXANDRA': 'https://cdn.toptex.com/logos/ALEXANDRA_LOGO.jpg?w=480',
  'Alexandra': 'https://cdn.toptex.com/logos/ALEXANDRA_LOGO.jpg?w=480',
  'American Apparel': 'https://cdn.toptex.com/logos/AMERICANAPPAREL_LOGO.jpg?w=480',
  'ATLANTIS': 'https://cdn.toptex.com/logos/ATLANTIS_LOGO.jpg?w=480',
  'Atlantis': 'https://cdn.toptex.com/logos/ATLANTIS_LOGO.jpg?w=480',
  // B
  'B&C': 'https://cdn.toptex.com/logos/B&C_LOGO_24.jpg?w=480',
  'B&C Collection': 'https://cdn.toptex.com/logos/B&C_LOGO_24.jpg?w=480',
  'BagBase': 'https://cdn.toptex.com/logos/BAGBASE_LOGO.jpg?w=480',
  'BagBase®': 'https://cdn.toptex.com/logos/BAGBASE_LOGO.jpg?w=480',
  'Beechfield': 'https://cdn.toptex.com/logos/BEECHFIELD_LOGO.jpg?w=480',
  'Beechfield®': 'https://cdn.toptex.com/logos/BEECHFIELD_LOGO.jpg?w=480',
  'BELLA+CANVAS': 'https://cdn.toptex.com/logos/BELLACANVAS_LOGO.jpg?w=480',
  'Bella+Canvas': 'https://cdn.toptex.com/logos/BELLACANVAS_LOGO.jpg?w=480',
  'BROOK TAVERNER': 'https://cdn.toptex.com/logos/BROOKTAVERNER_LOGO.jpg?w=480',
  'Brook Taverner': 'https://cdn.toptex.com/logos/BROOKTAVERNER_LOGO.jpg?w=480',
  'BUFF': 'https://cdn.toptex.com/logos/BUFF_LOGO.jpg?w=480',
  'BUFF®': 'https://cdn.toptex.com/logos/BUFF_LOGO.jpg?w=480',
  // C
  'Carhartt': 'https://cdn.toptex.com/logos/CARHARTT_LOGO.jpg?w=480',
  'CARHARTT': 'https://cdn.toptex.com/logos/CARHARTT_LOGO.jpg?w=480',
  'Cat': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'Cat®': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'CAT': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'Caterpillar': 'https://cdn.toptex.com/logos/CATERPILLAR_LOGO.jpg?w=480',
  'CG International': 'https://cdn.toptex.com/logos/CGINTERNATIONAL_LOGO.jpg?w=480',
  'Cherokee': 'https://cdn.toptex.com/logos/CHEROKEE_MEDICAL_LOGO.jpg?w=480',
  'CHEROKEE': 'https://cdn.toptex.com/logos/CHEROKEE_MEDICAL_LOGO.jpg?w=480',
  'Clique': 'https://cdn.toptex.com/logos/CLIQUE_LOGO.jpg?w=480',
  'CLIQUE': 'https://cdn.toptex.com/logos/CLIQUE_LOGO.jpg?w=480',
  'Continental': 'https://cdn.toptex.com/logos/CONTINENTAL_LOGO.jpg?w=480',
  'Crocs': 'https://cdn.toptex.com/logos/CROCS_LOGO.jpg?w=480',
  'CROCS': 'https://cdn.toptex.com/logos/CROCS_LOGO.jpg?w=480',
  // D
  'Dickies': 'https://cdn.toptex.com/logos/DICKIES_LOGO.jpg?w=480',
  'DICKIES': 'https://cdn.toptex.com/logos/DICKIES_LOGO.jpg?w=480',
  'Dickies Medical': 'https://cdn.toptex.com/logos/DICKIES_MEDICAL_LOGO.jpg?w=480',
  'Dunderdon': 'https://cdn.toptex.com/logos/DUNDERDON_LOGO.jpg?w=480',
  'DUNDERDON': 'https://cdn.toptex.com/logos/DUNDERDON_LOGO.jpg?w=480',
  // E
  'Estex': 'https://cdn.toptex.com/logos/ESTEX_LOGO.jpg?w=480',
  'ESTEX': 'https://cdn.toptex.com/logos/ESTEX_LOGO.jpg?w=480',
  // F
  'FLEXFIT': 'https://cdn.toptex.com/logos/FLEXFIT_LOGO.jpg?w=480',
  'Flexfit': 'https://cdn.toptex.com/logos/FLEXFIT_LOGO.jpg?w=480',
  'Front Row': 'https://cdn.toptex.com/logos/FRONTROW_LOGO.jpg?w=480',
  'FRONT ROW': 'https://cdn.toptex.com/logos/FRONTROW_LOGO.jpg?w=480',
  'Fruit of the Loom': 'https://cdn.toptex.com/logos/FRUITOFTHELOOM_LOGO.jpg?w=480',
  'FRUIT OF THE LOOM': 'https://cdn.toptex.com/logos/FRUITOFTHELOOM_LOGO.jpg?w=480',
  // G
  'Gildan': 'https://cdn.toptex.com/logos/GILDAN_LOGO.jpg?w=480',
  'GILDAN': 'https://cdn.toptex.com/logos/GILDAN_LOGO.jpg?w=480',
  // H
  'Hanes': 'https://cdn.toptex.com/logos/HANES_LOGO.jpg?w=480',
  'HANES': 'https://cdn.toptex.com/logos/HANES_LOGO.jpg?w=480',
  'Henbury': 'https://cdn.toptex.com/logos/HENBURY_LOGO.jpg?w=480',
  'HENBURY': 'https://cdn.toptex.com/logos/HENBURY_LOGO.jpg?w=480',
  // I
  'iDeal Basic Brand': 'https://cdn.toptex.com/logos/IDEAL_LOGO.jpg?w=480',
  'ID': 'https://cdn.toptex.com/logos/IDEAL_LOGO.jpg?w=480',
  // J
  'James & Nicholson': 'https://cdn.toptex.com/logos/JAMESNICHOLSON_LOGO.jpg?w=480',
  'JAMES & NICHOLSON': 'https://cdn.toptex.com/logos/JAMESNICHOLSON_LOGO.jpg?w=480',
  'James&Nicholson': 'https://cdn.toptex.com/logos/JAMESNICHOLSON_LOGO.jpg?w=480',
  'JSP': 'https://cdn.toptex.com/logos/JSP_LOGO.jpg?w=480',
  'Just Hoods': 'https://cdn.toptex.com/logos/JUSTHOODS_LOGO.jpg?w=480',
  'JUST HOODS': 'https://cdn.toptex.com/logos/JUSTHOODS_LOGO.jpg?w=480',
  // K
  'K-up': 'https://cdn.toptex.com/logos/K-UP_LOGO.jpg?w=480',
  'K-Up': 'https://cdn.toptex.com/logos/K-UP_LOGO.jpg?w=480',
  'K-UP': 'https://cdn.toptex.com/logos/K-UP_LOGO.jpg?w=480',
  'Kariban': 'https://cdn.toptex.com/logos/KARIBAN_LOGO.jpg?w=480',
  'KARIBAN': 'https://cdn.toptex.com/logos/KARIBAN_LOGO.jpg?w=480',
  'Kariban Premium': 'https://cdn.toptex.com/logos/KARIBAN_LOGO.jpg?w=480',
  'Kimood': 'https://cdn.toptex.com/logos/KIMOOD_LOGO.jpg?w=480',
  'KIMOOD': 'https://cdn.toptex.com/logos/KIMOOD_LOGO.jpg?w=480',
  'Kustom Kit': 'https://cdn.toptex.com/logos/KUSTOMKIT_LOGO.jpg?w=480',
  'KUSTOM KIT': 'https://cdn.toptex.com/logos/KUSTOMKIT_LOGO.jpg?w=480',
  // L
  'L.Brador': 'https://cdn.toptex.com/logos/LBRADOR_LOGO.jpg?w=480',
  'Larkwood': 'https://cdn.toptex.com/logos/LARKWOOD_LOGO.jpg?w=480',
  'LARKWOOD': 'https://cdn.toptex.com/logos/LARKWOOD_LOGO.jpg?w=480',
  'Lee': 'https://cdn.toptex.com/logos/LEE_LOGO.jpg?w=480',
  'LEE': 'https://cdn.toptex.com/logos/LEE_LOGO.jpg?w=480',
  // M
  'Mantis': 'https://cdn.toptex.com/logos/MANTIS_LOGO.jpg?w=480',
  'MANTIS': 'https://cdn.toptex.com/logos/MANTIS_LOGO.jpg?w=480',
  'Myrtle Beach': 'https://cdn.toptex.com/logos/MYRTLEBEACH_LOGO.jpg?w=480',
  'MYRTLE BEACH': 'https://cdn.toptex.com/logos/MYRTLEBEACH_LOGO.jpg?w=480',
  'Mumbles': 'https://cdn.toptex.com/logos/MUMBLES_LOGO.jpg?w=480',
  // N
  'NAPAPIJRI': 'https://cdn.toptex.com/logos/NAPAPIJRI_LOGO.jpg?w=480',
  'Napapijri': 'https://cdn.toptex.com/logos/NAPAPIJRI_LOGO.jpg?w=480',
  'Native Spirit': 'https://cdn.toptex.com/logos/NATIVESPIRIT-logo-gris-cmjn-cmjn-fond-transparent.jpg?w=480',
  'NATIVE SPIRIT': 'https://cdn.toptex.com/logos/NATIVESPIRIT-logo-gris-cmjn-cmjn-fond-transparent.jpg?w=480',
  'New Balance': 'https://cdn.toptex.com/logos/NEWBALANCE_LOGO.jpg?w=480',
  'NEW BALANCE': 'https://cdn.toptex.com/logos/NEWBALANCE_LOGO.jpg?w=480',
  // O
  'Onna': 'https://cdn.toptex.com/logos/ONNA_logo.jpg?w=480',
  'ONNA': 'https://cdn.toptex.com/logos/ONNA_logo.jpg?w=480',
  // P
  'PAYPER': 'https://cdn.toptex.com/logos/PAYPER_LOGO.jpg?w=480',
  'Payper': 'https://cdn.toptex.com/logos/PAYPER_LOGO.jpg?w=480',
  'Premier': 'https://cdn.toptex.com/logos/PREMIER_LOGO.jpg?w=480',
  'PREMIER': 'https://cdn.toptex.com/logos/PREMIER_LOGO.jpg?w=480',
  'PROACT': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'PROACT®': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'Proact': 'https://cdn.toptex.com/logos/PROACT_LOGO.jpg?w=480',
  'Promodoro': 'https://cdn.toptex.com/logos/PROMODORO_LOGO.jpg?w=480',
  'PROMODORO': 'https://cdn.toptex.com/logos/PROMODORO_LOGO.jpg?w=480',
  'Puma': 'https://cdn.toptex.com/logos/PUMA_LOGO.jpg?w=480',
  'PUMA': 'https://cdn.toptex.com/logos/PUMA_LOGO.jpg?w=480',
  'Puma Workwear': 'https://cdn.toptex.com/logos/PUMA_WORKWEAR_LOGO.jpg?w=480',
  // Q
  'Quadra': 'https://cdn.toptex.com/logos/QUADRA_LOGO.jpg?w=480',
  'QUADRA': 'https://cdn.toptex.com/logos/QUADRA_LOGO.jpg?w=480',
  // R
  'Regatta': 'https://cdn.toptex.com/logos/REGATTA_LOGO.jpg?w=480',
  'REGATTA': 'https://cdn.toptex.com/logos/REGATTA_LOGO.jpg?w=480',
  'Regatta Professional': 'https://cdn.toptex.com/logos/REGATTAPROFESSIONAL_LOGO.jpg?w=480',
  'Result': 'https://cdn.toptex.com/logos/RESULT_LOGO.jpg?w=480',
  'RESULT': 'https://cdn.toptex.com/logos/RESULT_LOGO.jpg?w=480',
  'Russell': 'https://cdn.toptex.com/logos/RUSSELL_LOGO.jpg?w=480',
  'RUSSELL': 'https://cdn.toptex.com/logos/RUSSELL_LOGO.jpg?w=480',
  'RYWAN': 'https://cdn.toptex.com/logos/RYWAN_LOGO.jpg?w=480',
  'Rywan': 'https://cdn.toptex.com/logos/RYWAN_LOGO.jpg?w=480',
  // S
  'Safejawz': 'https://cdn.toptex.com/logos/SAFEJAWZ_LOGO.jpg?w=480',
  'SF': 'https://cdn.toptex.com/logos/SF_LOGO.jpg?w=480',
  'SF Clothing': 'https://cdn.toptex.com/logos/SF_LOGO.jpg?w=480',
  'Shelto': 'https://cdn.toptex.com/logos/SHELTO_LOGO.jpg?w=480',
  'SHELTO': 'https://cdn.toptex.com/logos/SHELTO_LOGO.jpg?w=480',
  'SOL\'S': 'https://cdn.toptex.com/logos/SOLS_LOGO.jpg?w=480',
  'Sol\'s': 'https://cdn.toptex.com/logos/SOLS_LOGO.jpg?w=480',
  'SOLS': 'https://cdn.toptex.com/logos/SOLS_LOGO.jpg?w=480',
  'Sols': 'https://cdn.toptex.com/logos/SOLS_LOGO.jpg?w=480',
  'Spasso': 'https://cdn.toptex.com/logos/SPASSO_LOGO_PRINCIPAL.jpg?w=480',
  'SPASSO': 'https://cdn.toptex.com/logos/SPASSO_LOGO_PRINCIPAL.jpg?w=480',
  'Spiro': 'https://cdn.toptex.com/logos/SPIRO_LOGO.jpg?w=480',
  'SPIRO': 'https://cdn.toptex.com/logos/SPIRO_LOGO.jpg?w=480',
  'SPLASHMACS': 'https://cdn.toptex.com/logos/SPLASHMACS_LOGO.jpg?w=480',
  'Stanley Stella': 'https://cdn.toptex.com/logos/STANLEYSTELLA_LOGO.jpg?w=480',
  'STANLEY STELLA': 'https://cdn.toptex.com/logos/STANLEYSTELLA_LOGO.jpg?w=480',
  'Stanley/Stella': 'https://cdn.toptex.com/logos/STANLEYSTELLA_LOGO.jpg?w=480',
  // T
  'TIGER GRIP': 'https://cdn.toptex.com/logos/TIGERGRIP_LOGO.jpg?w=480',
  'Tiger Grip': 'https://cdn.toptex.com/logos/TIGERGRIP_LOGO.jpg?w=480',
  'Timberland': 'https://cdn.toptex.com/logos/TIMBERLAND_LOGO.jpg?w=480',
  'TIMBERLAND': 'https://cdn.toptex.com/logos/TIMBERLAND_LOGO.jpg?w=480',
  'Tombo': 'https://cdn.toptex.com/logos/TOMBO_LOGO.jpg?w=480',
  'TOMBO': 'https://cdn.toptex.com/logos/TOMBO_LOGO.jpg?w=480',
  'Towel City': 'https://cdn.toptex.com/logos/TOWELCITY_LOGO.jpg?w=480',
  'TOWEL CITY': 'https://cdn.toptex.com/logos/TOWELCITY_LOGO.jpg?w=480',
  // U
  'U-Power': 'https://cdn.toptex.com/logos/UPOWER_LOGO.jpg?w=480',
  'U-POWER': 'https://cdn.toptex.com/logos/UPOWER_LOGO.jpg?w=480',
  'UNDER ARMOUR': 'https://cdn.toptex.com/logos/UNDERARMOUR_LOGO.jpg?w=480',
  'Under Armour': 'https://cdn.toptex.com/logos/UNDERARMOUR_LOGO.jpg?w=480',
  // V
  'VELILLA': 'https://cdn.toptex.com/logos/VELILLA_LOGO.jpg?w=480',
  'Velilla': 'https://cdn.toptex.com/logos/VELILLA_LOGO.jpg?w=480',
  // W
  'Westford Mill': 'https://cdn.toptex.com/logos/WESTFORDMILL_LOGO.jpg?w=480',
  'WESTFORD MILL': 'https://cdn.toptex.com/logos/WESTFORDMILL_LOGO.jpg?w=480',
  'WK. Designed To Work': 'https://cdn.toptex.com/logos/WK-2_LOGO.jpg?w=480',
  'WK': 'https://cdn.toptex.com/logos/WK-2_LOGO.jpg?w=480',
  'WRANGLER': 'https://cdn.toptex.com/logos/WRANGLER_LOGO.jpg?w=480',
  'Wrangler': 'https://cdn.toptex.com/logos/WRANGLER_LOGO.jpg?w=480',
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
    const LOCAL_BRAND_LOGOS: Record<string, string> = {
      "B\u0026C": bcLogo,
      "B\u0026C Collection": bcLogo,
      "Gildan": gildanLogo,
      "Fruit of the Loom": fruitLogo,
      "James \u0026 Nicholson": jnLogo,
      "K-up": kupLogo,
      "K-Up": kupLogo,
      "Kariban": karibanLogo,
      "Kimood": kimoodLogo,
      "Promodoro": promodoroLogo,
      "Result": resultLogo,
      "SOL'S": solsLogo,
      "Sol's": solsLogo,
      "Sols": solsLogo,
      "Stanley Stella": stanleyLogo,
      "Stanley/Stella": stanleyLogo,
      "BagBase": bagbaseLogo,
      "Native Spirit": nativeSpiritLogo,
      "Proact": proactLogo,
      "Russell": russellLogo,
    };

    // Remote first, local overrides last
    const merged: Record<string, string> = { ...TOPTEX_BRAND_LOGOS, ...LOCAL_BRAND_LOGOS };

    const map: Record<string, string> = {};
    for (const [name, url] of Object.entries(merged)) {
      map[name] = url;
      map[normalizeBrandKey(name)] = url;
    }
    return map;
  }, []);

  return { data };
}
