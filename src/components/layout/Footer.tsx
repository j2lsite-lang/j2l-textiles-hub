import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/company-info';
import logoJ2L from '@/assets/logo-j2l.png';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Top CTA Section */}
      <div className="border-b border-white/10">
        <div className="container-page py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">
                Prêt à personnaliser vos textiles ?
              </h3>
              <p className="text-white/70">
                Devis gratuit en 24h • Sans engagement
              </p>
            </div>
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 px-8 py-4 accent-gradient text-white font-semibold rounded-xl shadow-accent hover:shadow-lg transition-all hover:-translate-y-0.5 group"
            >
              Demander un devis
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img 
                src={logoJ2L} 
                alt="J2L Textiles" 
                className="h-12 w-auto object-contain brightness-0 invert"
                width={160}
                height={48}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Spécialiste du textile personnalisé pour les professionnels.
              Vêtements de travail, objets promotionnels et bien plus.
            </p>
            <p className="text-xs text-white/50">
              Une marque de <strong className="text-white/70">{COMPANY_INFO.legalName}</strong>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-lg">Navigation</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/catalogue', label: 'Catalogue produits' },
                { href: '/personnalisation', label: 'Personnalisation' },
                { href: '/devis', label: 'Demander un devis' },
                { href: '/faq', label: 'Questions fréquentes' },
                { href: '/contact', label: 'Nous contacter' },
                { href: '/zones', label: 'Nos zones d\'intervention' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-white/70 hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-lg">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <span className="text-white/70 leading-relaxed">{COMPANY_INFO.fullAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <a 
                  href={`tel:${COMPANY_INFO.phoneLink}`} 
                  className="text-white/70 hover:text-accent transition-colors font-medium"
                >
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <a 
                  href={`mailto:${COMPANY_INFO.email}`} 
                  className="text-white/70 hover:text-accent transition-colors"
                >
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <span className="text-white/70">{COMPANY_INFO.hours}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-lg">Informations</h4>
            <ul className="space-y-3 text-sm mb-6">
              {[
                { href: '/mentions-legales', label: 'Mentions légales' },
                { href: '/confidentialite', label: 'Politique de confidentialité' },
                { href: '/cgv', label: 'Conditions générales' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-white/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="text-xs text-white/50 space-y-1">
              <p>SIRET : {COMPANY_INFO.siret}</p>
              <p>TVA : {COMPANY_INFO.tva}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} {COMPANY_INFO.name}. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a 
                  href={COMPANY_INFO.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href={COMPANY_INFO.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href={COMPANY_INFO.social.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <span>Réalisation :</span>
              <a 
                href="https://j2lpublicite.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white/70 transition-colors"
              >
                <img 
                  src={logoJ2L} 
                  alt="J2L Publicité" 
                  className="h-5 w-auto brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                  width={100}
                  height={20}
                  loading="lazy"
                  decoding="async"
                />
                <span className="font-medium">j2lpublicite.fr</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
