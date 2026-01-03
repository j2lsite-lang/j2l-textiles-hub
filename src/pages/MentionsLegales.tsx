import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';

export default function MentionsLegales() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Mentions légales" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray">
            <h2>Éditeur du site</h2>
            <p>
              <strong>J2LTextiles</strong><br />
              Marque de J2L Publicité<br />
              [ADRESSE]<br />
              Téléphone : [TEL]<br />
              Email : [EMAIL]
            </p>

            <p>
              [FORME JURIDIQUE]<br />
              Capital social : [CAPITAL]<br />
              SIRET : [SIRET]<br />
              RCS : [RCS]<br />
              TVA Intracommunautaire : [TVA]
            </p>

            <p>
              Directeur de la publication : [NOM DU DIRECTEUR]
            </p>

            <h2>Hébergement</h2>
            <p>
              Ce site est hébergé par :<br />
              [NOM DE L'HÉBERGEUR]<br />
              [ADRESSE DE L'HÉBERGEUR]<br />
              [TÉLÉPHONE DE L'HÉBERGEUR]
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments de ce site (textes, images, logos, graphismes, etc.) 
              sont la propriété exclusive de J2LTextiles ou de ses partenaires. Toute reproduction, 
              représentation, modification, publication, transmission ou dénaturation, totale ou 
              partielle, du site ou de son contenu, par quelque procédé que ce soit, est interdite.
            </p>

            <h2>Liens hypertextes</h2>
            <p>
              Les liens hypertextes présents sur le site en direction d'autres sites internet 
              ne sauraient engager la responsabilité de J2LTextiles quant au contenu de ces sites.
            </p>

            <h2>Données personnelles</h2>
            <p>
              Les informations recueillies sur ce site font l'objet d'un traitement informatique 
              destiné à la gestion des demandes de devis et de contact. Conformément à la loi 
              « Informatique et Libertés » du 6 janvier 1978 modifiée et au RGPD, vous disposez 
              d'un droit d'accès, de rectification et de suppression des données vous concernant. 
              Pour exercer ce droit, veuillez nous contacter à l'adresse : [EMAIL].
            </p>
            <p>
              Pour plus d'informations, consultez notre{' '}
              <a href="/confidentialite" className="text-primary hover:underline">
                Politique de confidentialité
              </a>.
            </p>

            <h2>Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et mesurer 
              l'audience. En poursuivant votre navigation, vous acceptez l'utilisation de cookies 
              conformément à notre politique de confidentialité.
            </p>

            <h2>Médiation</h2>
            <p>
              Conformément aux dispositions du Code de la consommation concernant le règlement 
              amiable des litiges, le client peut recourir au service de médiation. Le médiateur 
              peut être joint à l'adresse suivante : [COORDONNÉES DU MÉDIATEUR].
            </p>

            <h2>Droit applicable</h2>
            <p>
              Le présent site et ses conditions d'utilisation sont régis par le droit français. 
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
