import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const CONTACT_INFO = {
  address: '[ADRESSE]',
  phone: '[TEL]',
  email: '[EMAIL]',
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-page section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-display font-bold">
                J2L<span className="text-accent">Textiles</span>
              </span>
            </Link>
            <p className="text-sm text-background/70 leading-relaxed">
              Spécialiste du textile personnalisé pour les professionnels. 
              Vêtements de travail, objets promotionnels et plus encore.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/catalogue" className="text-background/70 hover:text-accent transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/personnalisation" className="text-background/70 hover:text-accent transition-colors">
                  Personnalisation
                </Link>
              </li>
              <li>
                <Link to="/devis" className="text-background/70 hover:text-accent transition-colors">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-background/70 hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span className="text-background/70">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-background/70 hover:text-accent transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-background/70 hover:text-accent transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/mentions-legales" className="text-background/70 hover:text-accent transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-background/70 hover:text-accent transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-background/70 hover:text-accent transition-colors">
                  Conditions générales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/50">
            <p>© {new Date().getFullYear()} J2LTextiles. Tous droits réservés.</p>
            <p>
              Une marque de{' '}
              <span className="text-background/70">J2L Publicité</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
