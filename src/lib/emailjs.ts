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
  // Nettoyer et limiter les données pour éviter les erreurs
  const cleanedParams = {
    nom: (params.nom || '').slice(0, 200),
    email: (params.email || '').slice(0, 100),
    telephone: (params.telephone || '').slice(0, 20),
    message: (params.message || '').slice(0, 5000), // Limiter la taille du message
    product_ref: (params.product_ref || '').slice(0, 200),
    product_name: (params.product_name || '').slice(0, 500),
    product_brand: (params.product_brand || '').slice(0, 200),
    quantity: (params.quantity || '').slice(0, 50),
    variant: (params.variant || '').slice(0, 200),
    page: (params.page || window.location.href).slice(0, 200),
  };

  console.log('Tentative envoi email avec params:', {
    service: SERVICE_ID,
    template: TEMPLATE_ID,
    params: cleanedParams
  });
  
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      cleanedParams,
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
    
    // Message d'erreur plus explicite
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    if (error?.status === 422) {
      errorMessage = 'Données invalides - vérifiez vos informations';
    } else if (error?.status === 401 || error?.status === 403) {
      errorMessage = 'Erreur de configuration EmailJS';
    } else if (error?.text) {
      errorMessage = error.text;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}
