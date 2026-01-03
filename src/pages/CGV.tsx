import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';

export default function CGV() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Conditions Générales de Vente" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : [DATE]
            </p>

            <h2>Article 1 - Objet</h2>
            <p>
              Les présentes conditions générales de vente régissent les relations contractuelles 
              entre J2LTextiles, marque de J2L Publicité (ci-après « le Vendeur »), et tout 
              professionnel ou particulier (ci-après « le Client ») passant commande de produits 
              textiles et/ou objets promotionnels personnalisés.
            </p>

            <h2>Article 2 - Prix</h2>
            <p>
              Les prix indiqués sur le site sont des prix indicatifs hors taxes (HT). Le prix 
              définitif est celui figurant sur le devis établi par le Vendeur et accepté par le Client.
            </p>
            <p>
              Les prix comprennent le produit textile ou objet et la personnalisation selon les 
              spécifications convenues. Les frais de livraison sont indiqués séparément.
            </p>

            <h2>Article 3 - Commande</h2>
            <p>
              Toute commande implique l'acceptation préalable des présentes conditions générales 
              de vente. La commande est validée après :
            </p>
            <ul>
              <li>Acceptation du devis par le Client</li>
              <li>Validation du BAT (Bon À Tirer) par le Client</li>
              <li>Réception de l'acompte convenu</li>
            </ul>

            <h2>Article 4 - Paiement</h2>
            <p>
              Un acompte de 50% est demandé à la commande pour les nouvelles créations. Le solde 
              est payable avant expédition ou à réception selon les conditions convenues.
            </p>
            <p>
              Moyens de paiement acceptés : virement bancaire, chèque, carte bancaire.
            </p>

            <h2>Article 5 - Délais de livraison</h2>
            <p>
              Les délais de livraison sont indiqués à titre indicatif. Ils courent à compter de 
              la validation du BAT et de la réception de l'acompte. Le délai standard est de 2 
              à 3 semaines.
            </p>
            <p>
              Le Vendeur ne pourra être tenu responsable des retards de livraison dus à des 
              événements indépendants de sa volonté (force majeure, grève, etc.).
            </p>

            <h2>Article 6 - Livraison</h2>
            <p>
              Les produits sont livrés à l'adresse indiquée par le Client. Le Client doit vérifier 
              l'état des colis à réception et émettre des réserves auprès du transporteur si 
              nécessaire.
            </p>

            <h2>Article 7 - Réclamations</h2>
            <p>
              Toute réclamation concernant un défaut de conformité ou un vice apparent doit être 
              formulée par écrit dans un délai de 48 heures suivant la réception des produits.
            </p>
            <p>
              Les produits personnalisés conformes au BAT validé ne peuvent faire l'objet d'un 
              retour ou échange.
            </p>

            <h2>Article 8 - Propriété intellectuelle</h2>
            <p>
              Le Client garantit être propriétaire des droits de reproduction des logos, marques 
              et visuels qu'il transmet pour personnalisation. Le Client s'engage à indemniser 
              le Vendeur de toute réclamation de tiers relative aux droits de propriété intellectuelle.
            </p>

            <h2>Article 9 - Responsabilité</h2>
            <p>
              Le Vendeur n'est pas responsable des différences mineures de couleur entre l'écran 
              et le produit final. Le rendu des couleurs peut varier selon les supports et 
              techniques de marquage.
            </p>

            <h2>Article 10 - Force majeure</h2>
            <p>
              Le Vendeur ne saurait être tenu responsable de l'inexécution de ses obligations en 
              cas de force majeure telle que définie par la jurisprudence française.
            </p>

            <h2>Article 11 - Données personnelles</h2>
            <p>
              Les données personnelles collectées font l'objet d'un traitement conforme à notre 
              <a href="/confidentialite" className="text-primary hover:underline"> Politique de confidentialité</a>.
            </p>

            <h2>Article 12 - Droit applicable et litiges</h2>
            <p>
              Les présentes conditions sont régies par le droit français. En cas de litige, une 
              solution amiable sera recherchée avant toute action judiciaire. À défaut, les 
              tribunaux compétents seront ceux du ressort du siège social du Vendeur.
            </p>

            <h2>Article 13 - Acceptation</h2>
            <p>
              Le Client déclare avoir pris connaissance des présentes conditions générales de 
              vente et les accepter sans réserve.
            </p>

            <h2>Contact</h2>
            <p>
              J2LTextiles - J2L Publicité<br />
              [ADRESSE]<br />
              Email : [EMAIL]<br />
              Téléphone : [TEL]
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
