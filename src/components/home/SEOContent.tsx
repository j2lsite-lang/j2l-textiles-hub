import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SEOContent() {
  return (
    <section className="section-padding bg-background">
      <div className="container-page">
        {/* Main SEO content */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
            J2L Textiles : Votre partenaire en textile personnalisé professionnel
          </h2>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg leading-relaxed mb-6">
              <strong className="text-foreground">J2L Textiles</strong> est votre fournisseur spécialisé en 
              <Link to="/catalogue/t-shirts" className="text-primary hover:underline mx-1">vêtements de travail</Link> 
              et <Link to="/personnalisation" className="text-primary hover:underline">textiles personnalisés</Link> pour 
              les entreprises, associations et collectivités. Basés en France, nous accompagnons depuis plus de 10 ans 
              les professionnels dans leurs projets de communication textile.
            </p>

            {/* Benefits grid */}
            <div className="grid md:grid-cols-2 gap-6 my-10 not-prose">
              <div className="surface-elevated p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Pourquoi choisir J2L Textiles ?
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Plus de <strong className="text-foreground">3 000 références</strong> en stock</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Marquage <Link to="/personnalisation" className="text-primary hover:underline">broderie, sérigraphie, flocage</Link></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Devis gratuit sous 24h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Livraison partout en France</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Conseils personnalisés par des experts</span>
                  </li>
                </ul>
              </div>

              <div className="surface-elevated p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Nos zones d'intervention
                </h3>
                <p className="text-muted-foreground mb-3">
                  Nous livrons dans toute la France métropolitaine et les DOM-TOM :
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Île-de-France', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes'].map((city) => (
                    <Link 
                      key={city}
                      to={`/zones/${city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`}
                      className="text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      {city}
                    </Link>
                  ))}
                  <Link 
                    to="/zones"
                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    Voir toutes les zones →
                  </Link>
                </div>
              </div>
            </div>

            {/* Detailed content */}
            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Des textiles professionnels pour tous les secteurs d'activité
            </h3>
            <p className="mb-4">
              Que vous soyez dans le <strong className="text-foreground">BTP</strong>, la 
              <Link to="/catalogue/cuisine-hotellerie" className="text-primary hover:underline mx-1">restauration et l'hôtellerie</Link>, 
              le <Link to="/catalogue/sport-loisirs" className="text-primary hover:underline">sport</Link>, ou le 
              <Link to="/catalogue/chemises-corporate" className="text-primary hover:underline mx-1">corporate</Link>, 
              nous avons les vêtements adaptés à vos besoins :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <Link to="/catalogue/t-shirts" className="text-primary hover:underline">T-shirts et polos personnalisés</Link> 
                {' '}– Idéaux pour les équipes et événements
              </li>
              <li>
                <Link to="/catalogue/vetements-travail" className="text-primary hover:underline">Vêtements de travail et EPI</Link> 
                {' '}– Sécurité et confort pour vos collaborateurs
              </li>
              <li>
                <Link to="/catalogue/haute-visibilite" className="text-primary hover:underline">Vêtements haute visibilité</Link> 
                {' '}– Conformes aux normes EN ISO 20471
              </li>
              <li>
                <Link to="/catalogue/cuisine-hotellerie" className="text-primary hover:underline">Tenues de cuisine et service</Link> 
                {' '}– Pour les professionnels de la restauration
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Techniques de personnalisation textile
            </h3>
            <p className="mb-4">
              Notre atelier maîtrise l'ensemble des 
              <Link to="/personnalisation" className="text-primary hover:underline mx-1">techniques de marquage textile</Link> 
              pour répondre à tous vos projets :
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Broderie</h4>
                <p className="text-sm">Rendu premium et durable, idéal pour les logos d'entreprise sur polos et vestes.</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Sérigraphie</h4>
                <p className="text-sm">Parfaite pour les grandes quantités avec des couleurs vives et résistantes.</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Impression DTG</h4>
                <p className="text-sm">Pour les designs complexes et les petites séries, qualité photo.</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Flocage & Flex</h4>
                <p className="text-sm">Idéal pour les noms, numéros et personnalisations individuelles.</p>
              </div>
            </div>

            {/* External links for authority */}
            <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Nos engagements qualité
            </h3>
            <p className="mb-4">
              Nous travaillons exclusivement avec des marques reconnues pour leur qualité et leur engagement environnemental :
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <a 
                href="https://www.stanley-stella.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Stanley/Stella <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.fruitoftheloom.eu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Fruit of the Loom <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.gildan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Gildan <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.kariban.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Kariban <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.result-clothing.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                Result <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <p className="mb-6">
              Tous nos textiles sont certifiés 
              <a 
                href="https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline mx-1"
              >
                OEKO-TEX Standard 100 <ExternalLink className="h-3 w-3 inline" />
              </a>
              garantissant l'absence de substances nocives pour la santé.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 mt-10">
            <Link to="/catalogue">
              <Button className="accent-gradient text-white font-semibold group">
                Voir notre catalogue
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/devis">
              <Button variant="outline" className="font-semibold">
                Demander un devis gratuit
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="font-semibold">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
