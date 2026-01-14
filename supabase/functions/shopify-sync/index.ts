import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_STORE = "ef0w7z-1n.myshopify.com";
const SHOPIFY_API_VERSION = "2024-01";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!shopifyAccessToken) {
      throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { offset = 0, limit = 10 } = await req.json();

    // Fetch products from Supabase
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const results = [];

    for (const product of products || []) {
      try {
        // Get first image
        const images = Array.isArray(product.images) ? product.images : [];
        const firstImage = images[0] || null;

        // Get colors for variants
        const colors = Array.isArray(product.colors) ? product.colors : [];
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];

        // Build Shopify product
        const shopifyProduct: any = {
          product: {
            title: product.name,
            body_html: product.description || "",
            vendor: product.brand || "J2L Textiles",
            product_type: product.category || "Vêtements",
            tags: [product.brand, product.category, product.sku].filter(Boolean).join(", "),
            variants: [],
            images: [],
          },
        };

        // Add main images
        if (firstImage) {
          shopifyProduct.product.images.push({ src: firstImage });
        }

        // Create variants from sizes and colors
        if (sizes.length > 0 && colors.length > 0) {
          shopifyProduct.product.options = [
            { name: "Taille", values: sizes },
            { name: "Couleur", values: colors.slice(0, 3).map((c: any) => c.name) },
          ];

          // Create variants (limited to avoid too many)
          for (const size of sizes.slice(0, 5)) {
            for (const color of colors.slice(0, 3)) {
              shopifyProduct.product.variants.push({
                option1: size,
                option2: color.name,
                price: ((product.price_ht || 10) * 1.2).toFixed(2), // TTC
                sku: `${product.sku}-${size}-${color.name}`.substring(0, 50),
                inventory_management: null,
              });
            }
          }
        } else if (sizes.length > 0) {
          shopifyProduct.product.options = [{ name: "Taille", values: sizes }];
          for (const size of sizes) {
            shopifyProduct.product.variants.push({
              option1: size,
              price: ((product.price_ht || 10) * 1.2).toFixed(2),
              sku: `${product.sku}-${size}`.substring(0, 50),
            });
          }
        } else {
          shopifyProduct.product.variants.push({
            price: ((product.price_ht || 10) * 1.2).toFixed(2),
            sku: product.sku,
          });
        }

        // Create product in Shopify
        const response = await fetch(
          `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": shopifyAccessToken,
            },
            body: JSON.stringify(shopifyProduct),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to create ${product.sku}:`, errorText);
          results.push({ sku: product.sku, success: false, error: errorText });
        } else {
          const data = await response.json();
          console.log(`Created ${product.sku}: ${data.product.id}`);
          results.push({ sku: product.sku, success: true, shopifyId: data.product.id });
        }

        // Rate limiting - Shopify allows 2 requests per second
        await new Promise((resolve) => setTimeout(resolve, 350));
      } catch (err) {
        console.error(`Error processing ${product.sku}:`, err);
        results.push({ sku: product.sku, success: false, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        offset,
        nextOffset: offset + limit,
        totalProducts: 2958,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
