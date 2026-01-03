import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { COMPANY_INFO, HOSTING_INFO } from '@/lib/company-info';

export default function MentionsLegales() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Mentions légales" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray prose-headings:font-display prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-accent">
            <p className="text-sm text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2>1. Éditeur du site</h2>
            <p>
              Le site <strong>{COMPANY_INFO.name}</strong> est édité par :
            </p>
            <p>
              <strong>{COMPANY_INFO.legalName}</strong><br />
              Adresse : {COMPANY_INFO.fullAddress}<br />
              Téléphone : <a href={`tel:${COMPANY_INFO.phoneLink}`}>{COMPANY_INFO.phone}</a><br />
              Email : <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
            </p>
            <p>
              SIRET : {COMPANY_INFO.siret}<br />
              TVA Intracommunautaire : {COMPANY_INFO.tva}
            </p>
            <p>
              Directeur de la publication : Le gérant de {COMPANY_INFO.legalName}
            </p>

            <h2>2. Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <p>
              <strong>{HOSTING_INFO.name}</strong><br />
              Raison sociale : {HOSTING_INFO.company}<br />
              Adresse : {HOSTING_INFO.address}<br />
              Site web : <a href={HOSTING_INFO.website} target="_blank" rel="noopener noreferrer">{HOSTING_INFO.website}</a>
            </p>

            <h2>3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments constituant ce site (textes, images, graphismes, logo, icônes, 
              sons, logiciels, etc.) sont la propriété exclusive de {COMPANY_INFO.legalName} ou de 
              ses partenaires. Ces éléments sont protégés par les lois françaises et internationales 
              relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de tout ou 
              partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite 
              sans l'autorisation écrite préalable de {COMPANY_INFO.legalName}.
            </p>
            <p>
              Toute exploitation non autorisée du site ou de son contenu sera considérée comme 
              constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles 
              L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>

            <h2>4. Limitation de responsabilité</h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est 
              périodiquement mis à jour, mais peut toutefois contenir des inexactitudes, des omissions 
              ou des lacunes. Si vous constatez une erreur ou ce qui peut être un dysfonctionnement, 
              merci de bien vouloir le signaler par email à l'adresse {COMPANY_INFO.email}.
            </p>
            <p>
              {COMPANY_INFO.legalName} n'est en aucun cas responsable de l'utilisation faite de ces 
              informations, et de tout préjudice direct ou indirect pouvant en découler.
            </p>

            <h2>5. Liens hypertextes</h2>
            <p>
              Le site peut contenir des liens hypertextes vers d'autres sites internet ou d'autres 
              ressources disponibles sur Internet. {COMPANY_INFO.legalName} ne dispose d'aucun moyen 
              pour contrôler ces sites connexes et ne répond pas de leur contenu.
            </p>
            <p>
              La mise en place de liens hypertextes vers le site {COMPANY_INFO.name} nécessite une 
              autorisation préalable écrite de {COMPANY_INFO.legalName}.
            </p>

            <h2>6. Données personnelles</h2>
            <p>
              Les informations personnelles collectées sur ce site font l'objet d'un traitement 
              informatique destiné à la gestion des demandes de devis, de contact et au suivi de 
              la relation client.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez de droits 
              concernant vos données personnelles.
            </p>
            <p>
              Pour plus d'informations sur le traitement de vos données, consultez notre{' '}
              <a href="/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>7. Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur. Les cookies sont 
              de petits fichiers texte stockés sur votre ordinateur. Ils nous permettent d'analyser 
              le trafic et de mémoriser vos préférences.
            </p>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies ou être alerté lors 
              de leur envoi. Cependant, certaines parties du site pourraient ne pas fonctionner 
              correctement sans cookies.
            </p>

            <h2>8. Droit applicable et juridiction compétente</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige et 
              après tentative de recherche d'une solution amiable, compétence expresse est attribuée 
              aux tribunaux compétents de Épinal, nonobstant pluralité de défendeurs ou appel en garantie.
            </p>

            <h2>9. Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales ou au site, vous pouvez 
              nous contacter :
            </p>
            <ul>
              <li>Par téléphone : <a href={`tel:${COMPANY_INFO.phoneLink}`}>{COMPANY_INFO.phone}</a></li>
              <li>Par email : <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a></li>
              <li>Par courrier : {COMPANY_INFO.fullAddress}</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}
