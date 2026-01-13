import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  sku: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  priceHT: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    address: string;
    addressComplement?: string;
    postalCode: string;
    city: string;
    phone: string;
  };
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      throw new Error("Stripe configuration missing");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const { items, customer, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    console.log("Creating checkout session for", items.length, "items");
    console.log("Customer:", customer.email);

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => {
      // Price in cents (Stripe uses smallest currency unit)
      const priceInCents = Math.round(item.priceHT * 100);
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.name} - ${item.color} / ${item.size}`,
            description: `${item.brand} • Réf: ${item.sku}`,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    });

    // Calculate total HT and quantity for shipping
    const totalQuantity = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalHT = items.reduce((sum: number, item: CartItem) => sum + (item.priceHT * item.quantity), 0);
    
    // Shipping calculation: FREE if >= 150€ HT, otherwise 5€ base + 0.50€ per additional item
    const FREE_SHIPPING_THRESHOLD = 150; // 150€ HT
    const baseShipping = 500; // 5€ in cents
    const perItemExtra = 50; // 0.50€ in cents
    
    let shippingAmount: number;
    let shippingLabel: string;
    
    if (totalHT >= FREE_SHIPPING_THRESHOLD) {
      shippingAmount = 0;
      shippingLabel = "Livraison gratuite";
    } else {
      shippingAmount = baseShipping + Math.max(0, totalQuantity - 1) * perItemExtra;
      shippingLabel = "Livraison standard";
    }
    
    console.log("Shipping calculation:", { totalHT, totalQuantity, shippingAmount: shippingAmount / 100 + "€", freeShipping: totalHT >= FREE_SHIPPING_THRESHOLD });

    // Create shipping options
    const shippingOptions = [
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: {
            amount: shippingAmount,
            currency: "eur",
          },
          display_name: shippingLabel,
          delivery_estimate: {
            minimum: {
              unit: "business_day" as const,
              value: 3,
            },
            maximum: {
              unit: "business_day" as const,
              value: 7,
            },
          },
        },
      },
    ];

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      shipping_options: shippingOptions,
      customer_email: customer.email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_company: customer.company || "",
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_address_complement: customer.addressComplement || "",
        customer_postal_code: customer.postalCode,
        customer_city: customer.city,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: "fr",
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
