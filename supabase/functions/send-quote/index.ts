import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  nom: string;
  email: string;
  telephone?: string;
  message?: string;
  product_ref?: string;
  product_name?: string;
  product_brand?: string;
  quantity?: string;
  variant?: string;
  page?: string;
}

async function sendEmailJS(
  serviceId: string,
  templateId: string,
  privateKey: string,
  params: Record<string, string>
): Promise<Response> {
  console.log(`Sending email with template ${templateId}`);
  
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: privateKey,
      template_params: params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`EmailJS error (${response.status}): ${errorText}`);
    throw new Error(`EmailJS error: ${errorText}`);
  }

  console.log(`Email sent successfully with template ${templateId}`);
  return response;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const templateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');
    const autoResponseTemplateId = Deno.env.get('EMAILJS_AUTORESPONSE_TEMPLATE_ID');

    if (!serviceId || !templateId || !privateKey) {
      console.error('Missing EmailJS configuration');
      throw new Error('Configuration EmailJS manquante');
    }

    const body: QuoteRequest = await req.json();
    console.log('Received quote request:', { 
      nom: body.nom, 
      email: body.email,
      product_ref: body.product_ref 
    });

    // Validate required fields
    if (!body.nom || !body.email) {
      throw new Error('Nom et email sont requis');
    }

    // Clean and prepare params
    const cleanParams = {
      nom: (body.nom || '').slice(0, 200),
      email: (body.email || '').slice(0, 100),
      telephone: (body.telephone || '').slice(0, 20),
      message: (body.message || '').slice(0, 5000),
      product_ref: (body.product_ref || '').slice(0, 200),
      product_name: (body.product_name || '').slice(0, 500),
      product_brand: (body.product_brand || '').slice(0, 200),
      quantity: (body.quantity || '').slice(0, 50),
      variant: (body.variant || '').slice(0, 200),
      page: (body.page || '').slice(0, 200),
      to_email: 'contact@j2lpublicite.fr',
    };

    // 1. Send internal notification to company
    console.log('Sending internal notification to contact@j2lpublicite.fr');
    await sendEmailJS(serviceId, templateId, privateKey, cleanParams);

    // 2. Send auto-response to user (if template configured)
    if (autoResponseTemplateId) {
      console.log(`Sending auto-response to ${body.email}`);
      const autoResponseParams = {
        ...cleanParams,
        to_email: body.email,
        reply_to: 'contact@j2lpublicite.fr',
      };
      
      try {
        await sendEmailJS(serviceId, autoResponseTemplateId, privateKey, autoResponseParams);
      } catch (autoError) {
        // Log but don't fail if auto-response fails
        console.error('Auto-response failed:', autoError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Emails envoyés avec succès' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-quote function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
