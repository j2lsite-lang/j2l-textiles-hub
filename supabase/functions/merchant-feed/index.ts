import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://j2ltextiles.fr";
const SHOP_NAME = "J2LTextiles";

/**
 * MERCHANT FEED DISABLED
 * 
 * This feed has been intentionally disabled because J2LTextiles operates 
 * on a B2B quote-request model (demande de devis), NOT direct e-commerce purchase.
 * 
 * Google Merchant Center / Google Shopping requires:
 * - Working checkout/cart functionality
 * - Fixed prices (not "price on request")
 * - Direct purchase capability
 * 
 * Since our business model is quote-based:
 * - Customers request quotes for personalized products
 * - Prices depend on quantity, customization, and marking type
 * - No direct online checkout
 * 
 * Using a Shopping feed for a quote-only site will result in:
 * - Account suspension for "Misrepresentation"
 * - Policy violations for "Missing checkout"
 * 
 * ALTERNATIVES FOR VISIBILITY:
 * 1. Google Business Profile (local SEO)
 * 2. Google Ads (Search campaigns, not Shopping)
 * 3. Organic SEO with proper landing pages
 * 
 * If you want to re-enable this feed, the business model must change
 * to support direct online purchases with fixed pricing.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Return an empty but valid RSS feed with explanation
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${SHOP_NAME} - Flux désactivé</title>
  <link>${SITE_URL}</link>
  <description>
    Ce flux Google Merchant Center est désactivé.
    J2LTextiles fonctionne sur un modèle de demande de devis (B2B).
    Les produits personnalisés ne peuvent pas être vendus via Google Shopping
    car les prix dépendent de la quantité et du type de marquage.
    Pour plus d'informations: ${SITE_URL}/contact
  </description>
  <!-- 
    FEED DISABLED - QUOTE-BASED BUSINESS MODEL
    
    Google Shopping requires direct checkout functionality.
    This site operates on a quote-request model for personalized products.
    
    Submitting products to Google Shopping without checkout capability
    will result in account suspension for policy violations.
    
    Contact: ${SITE_URL}/contact
    CGV: ${SITE_URL}/cgv
    Livraison: ${SITE_URL}/livraison
  -->
</channel>
</rss>`;

  console.log("Merchant feed accessed - returning disabled feed (quote-based business model)");

  return new Response(xml, {
    status: 200,
    headers: corsHeaders,
  });
});
