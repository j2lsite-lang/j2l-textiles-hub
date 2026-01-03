import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { COMPANY_INFO } from '@/lib/company-info';

export default function Confidentialite() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Politique de confidentialité" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray prose-headings:font-display prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-accent">
            <p className="text-sm text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2>1. Introduction</h2>
            <p>
              La société <strong>{COMPANY_INFO.legalName}</strong>, éditrice du site {COMPANY_INFO.name}, 
              s'engage à protéger la vie privée des utilisateurs de son site internet. La présente 
              politique de confidentialité a pour objet de vous informer sur la manière dont nous 
              collectons, utilisons et protégeons vos données personnelles, conformément au Règlement 
              Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés ».
            </p>

            <h2>2. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est :
            </p>
            <p>
              <strong>{COMPANY_INFO.legalName}</strong><br />
              {COMPANY_INFO.fullAddress}<br />
              Téléphone : {COMPANY_INFO.phone}<br />
              Email : {COMPANY_INFO.email}<br />
              SIRET : {COMPANY_INFO.siret}
            </p>

            <h2>3. Données personnelles collectées</h2>
            <p>
              Nous collectons les données personnelles suivantes :
            </p>

            <h3>3.1 Données d'identification</h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Nom de l'entreprise (le cas échéant)</li>
              <li>Adresse postale (pour les livraisons)</li>
            </ul>

            <h3>3.2 Données de commande</h3>
            <ul>
              <li>Produits sélectionnés et quantités</li>
              <li>Fichiers transmis (logos, maquettes)</li>
              <li>Historique des demandes de devis</li>
            </ul>

            <h3>3.3 Données techniques</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur et système d'exploitation</li>
              <li>Pages visitées et durée de navigation</li>
              <li>Données de cookies (voir section dédiée)</li>
            </ul>

            <h2>4. Finalités du traitement</h2>
            <p>Vos données personnelles sont collectées pour les finalités suivantes :</p>
            <ul>
              <li><strong>Gestion des demandes de devis :</strong> traitement de vos demandes, établissement de devis personnalisés, suivi des commandes</li>
              <li><strong>Relation client :</strong> réponse à vos questions, service après-vente, communication commerciale (avec votre consentement)</li>
              <li><strong>Amélioration des services :</strong> analyse statistique de l'utilisation du site, personnalisation de l'expérience utilisateur</li>
              <li><strong>Obligations légales :</strong> facturation, comptabilité, réponse aux demandes des autorités</li>
            </ul>

            <h2>5. Base légale du traitement</h2>
            <p>Le traitement de vos données personnelles repose sur :</p>
            <ul>
              <li><strong>Votre consentement :</strong> pour l'envoi de communications commerciales et le dépôt de certains cookies</li>
              <li><strong>L'exécution de mesures précontractuelles :</strong> pour le traitement de vos demandes de devis</li>
              <li><strong>L'exécution d'un contrat :</strong> pour la gestion de vos commandes</li>
              <li><strong>Nos intérêts légitimes :</strong> pour l'amélioration de nos services et la sécurité du site</li>
              <li><strong>Nos obligations légales :</strong> pour la conservation des données comptables</li>
            </ul>

            <h2>6. Destinataires des données</h2>
            <p>Vos données personnelles peuvent être communiquées aux destinataires suivants :</p>
            <ul>
              <li>Les membres de l'équipe {COMPANY_INFO.name} habilités à les traiter (service commercial, production, comptabilité)</li>
              <li>Nos sous-traitants techniques : hébergeur du site, prestataires informatiques</li>
              <li>Nos partenaires logistiques : transporteurs pour la livraison des commandes</li>
              <li>Les autorités compétentes : en cas d'obligation légale</li>
            </ul>
            <p>
              Vos données ne sont jamais vendues à des tiers et ne sont pas transférées hors de l'Union européenne.
            </p>

            <h2>7. Durée de conservation</h2>
            <p>Nous conservons vos données personnelles pendant les durées suivantes :</p>
            <ul>
              <li><strong>Données clients :</strong> pendant la durée de la relation commerciale, puis 3 ans à compter de la dernière commande</li>
              <li><strong>Données de prospection :</strong> 3 ans à compter du dernier contact</li>
              <li><strong>Données comptables :</strong> 10 ans conformément aux obligations légales</li>
              <li><strong>Données de connexion :</strong> 1 an maximum</li>
              <li><strong>Fichiers clients (logos) :</strong> durée du projet, puis suppression ou archivage selon votre demande</li>
            </ul>

            <h2>8. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
              <li><strong>Droit de rectification :</strong> faire corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données dans certains cas</li>
              <li><strong>Droit à la limitation :</strong> demander la suspension du traitement dans certains cas</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et les transférer à un autre responsable</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière</li>
              <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment pour les traitements basés sur celui-ci</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous :
            </p>
            <ul>
              <li>Par téléphone : <a href={`tel:${COMPANY_INFO.phoneLink}`}>{COMPANY_INFO.phone}</a></li>
              <li>Par email : <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a></li>
              <li>Par courrier : {COMPANY_INFO.fullAddress}</li>
            </ul>
            <p>
              Nous nous engageons à répondre à votre demande dans un délai d'un mois.
            </p>

            <h2>9. Cookies</h2>
            <p>
              Notre site utilise des cookies pour fonctionner correctement et améliorer votre expérience.
            </p>

            <h3>9.1 Cookies strictement nécessaires</h3>
            <p>
              Ces cookies sont indispensables au fonctionnement du site (authentification, sécurité, 
              panier de devis). Ils ne peuvent pas être désactivés.
            </p>

            <h3>9.2 Cookies de mesure d'audience</h3>
            <p>
              Ces cookies nous permettent de mesurer l'audience du site et d'analyser son utilisation 
              pour l'améliorer. Ils sont déposés uniquement avec votre consentement.
            </p>

            <h3>9.3 Gestion des cookies</h3>
            <p>
              Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. Voici les 
              liens vers les instructions des principaux navigateurs :
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h2>10. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
              protéger vos données personnelles contre la destruction accidentelle ou illicite, la 
              perte, l'altération, la divulgation ou l'accès non autorisé.
            </p>
            <p>
              Ces mesures comprennent notamment :
            </p>
            <ul>
              <li>Chiffrement des communications (HTTPS)</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Sauvegardes régulières</li>
              <li>Formation du personnel à la protection des données</li>
            </ul>

            <h2>11. Modifications de la politique</h2>
            <p>
              Nous nous réservons le droit de modifier la présente politique de confidentialité à tout 
              moment. La date de dernière mise à jour sera toujours indiquée en haut de cette page. 
              Nous vous encourageons à consulter régulièrement cette page.
            </p>

            <h2>12. Réclamation</h2>
            <p>
              Si vous estimez que le traitement de vos données personnelles constitue une violation de 
              la réglementation, vous avez le droit d'introduire une réclamation auprès de la CNIL :
            </p>
            <p>
              <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong><br />
              3 Place de Fontenoy, TSA 80715<br />
              75334 Paris Cedex 07<br />
              Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>

            <h2>13. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données 
              personnelles, contactez-nous :
            </p>
            <p>
              {COMPANY_INFO.legalName}<br />
              {COMPANY_INFO.fullAddress}<br />
              Téléphone : <a href={`tel:${COMPANY_INFO.phoneLink}`}>{COMPANY_INFO.phone}</a><br />
              Email : <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
