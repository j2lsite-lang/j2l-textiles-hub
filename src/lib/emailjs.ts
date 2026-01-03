import emailjs from '@emailjs/browser';

// Configuration EmailJS
const SERVICE_ID = 'service_j2l_devis';
const TEMPLATE_ID = 'template_8lhh6ym';
const PUBLIC_KEY = 'cZVFagbJEdc5bF6E_';

// Variables du template EmailJS:
// nom, email, telephone, message, product_ref, product_name, product_brand, quantity, variant, page

export interface EmailJSParams {
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

export async function sendEmail(params: EmailJSParams): Promise<void> {
  console.log('Tentative envoi email avec params:', {
    service: SERVICE_ID,
    template: TEMPLATE_ID,
    params
  });
  
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        nom: params.nom,
        email: params.email,
        telephone: params.telephone || '',
        message: params.message || '',
        product_ref: params.product_ref || '',
        product_name: params.product_name || '',
        product_brand: params.product_brand || '',
        quantity: params.quantity || '',
        variant: params.variant || '',
        page: params.page || window.location.href,
      },
      PUBLIC_KEY
    );
    
    console.log('Email envoyé avec succès:', response);
  } catch (error: any) {
    console.error('Erreur EmailJS détaillée:', {
      error,
      message: error?.message,
      text: error?.text,
      status: error?.status
    });
    throw new Error(`Erreur EmailJS: ${error?.text || error?.message || 'Erreur inconnue'}`);
  }
}
