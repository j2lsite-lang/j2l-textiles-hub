import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';

export default function Confidentialite() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Politique de confidentialité" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : [DATE]
            </p>

            <h2>Introduction</h2>
            <p>
              J2LTextiles, marque de J2L Publicité, s'engage à protéger la vie privée des 
              utilisateurs de son site internet. Cette politique de confidentialité décrit 
              comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>

            <h2>Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li>Données d'identification : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Données professionnelles : nom de l'entreprise, fonction</li>
              <li>Données de navigation : cookies, adresse IP, pages visitées</li>
              <li>Données de commande : produits sélectionnés, fichiers transmis (logos)</li>
            </ul>

            <h2>Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Répondre à vos demandes de devis et de contact</li>
              <li>Traiter et suivre vos commandes</li>
              <li>Vous envoyer des informations commerciales (avec votre consentement)</li>
              <li>Améliorer nos services et notre site internet</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2>Base légale du traitement</h2>
            <p>
              Le traitement de vos données repose sur :
            </p>
            <ul>
              <li>L'exécution d'un contrat ou de mesures précontractuelles</li>
              <li>Votre consentement pour les communications marketing</li>
              <li>Nos intérêts légitimes pour l'amélioration de nos services</li>
              <li>Nos obligations légales</li>
            </ul>

            <h2>Destinataires des données</h2>
            <p>
              Vos données peuvent être transmises à :
            </p>
            <ul>
              <li>Nos équipes internes (commercial, production, logistique)</li>
              <li>Nos sous-traitants techniques (hébergeur, transporteurs)</li>
              <li>Nos partenaires avec votre consentement explicite</li>
            </ul>

            <h2>Durée de conservation</h2>
            <p>
              Nous conservons vos données pendant la durée nécessaire à la finalité du traitement :
            </p>
            <ul>
              <li>Données clients : durée de la relation commerciale + 3 ans</li>
              <li>Données prospects : 3 ans à compter du dernier contact</li>
              <li>Données comptables : 10 ans</li>
            </ul>

            <h2>Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (« droit à l'oubli »)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
              <li>Droit de retirer votre consentement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : [EMAIL]
            </p>

            <h2>Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
              pour protéger vos données contre tout accès non autorisé, altération, divulgation 
              ou destruction.
            </p>

            <h2>Cookies</h2>
            <p>
              Notre site utilise des cookies pour améliorer votre expérience de navigation. 
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines 
              fonctionnalités du site pourraient ne plus être disponibles.
            </p>

            <h2>Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout 
              moment. Les modifications seront publiées sur cette page avec une date de mise à jour.
            </p>

            <h2>Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité :<br />
              J2LTextiles - J2L Publicité<br />
              [ADRESSE]<br />
              Email : [EMAIL]<br />
              Téléphone : [TEL]
            </p>

            <p>
              Vous pouvez également adresser une réclamation à la CNIL : 
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.cnil.fr
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
