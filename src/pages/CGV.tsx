import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/section-header';
import { COMPANY_INFO } from '@/lib/company-info';
import { PageSEOFooter } from '@/components/seo/PageSEOFooter';

export default function CGV() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader title="Conditions Générales de Vente" />

          <div className="mt-12 max-w-3xl mx-auto prose prose-gray prose-headings:font-display prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-accent">
            <p className="text-sm text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2>Article 1 - Objet et champ d'application</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des relations 
              commerciales entre <strong>{COMPANY_INFO.legalName}</strong>, exploitant la marque 
              {COMPANY_INFO.name} (ci-après « le Vendeur »), et tout client professionnel ou particulier 
              (ci-après « le Client ») passant commande de produits textiles personnalisés et/ou 
              d'objets promotionnels.
            </p>
            <p>
              Toute commande implique l'acceptation sans réserve des présentes CGV.
            </p>

            <h2>Article 2 - Identification du vendeur</h2>
            <p>
              <strong>{COMPANY_INFO.legalName}</strong><br />
              Adresse : {COMPANY_INFO.fullAddress}<br />
              Téléphone : {COMPANY_INFO.phone}<br />
              Email : {COMPANY_INFO.email}<br />
              SIRET : {COMPANY_INFO.siret}<br />
              TVA intracommunautaire : {COMPANY_INFO.tva}
            </p>

            <h2>Article 3 - Produits et services</h2>
            <p>
              {COMPANY_INFO.name} propose des textiles et objets promotionnels personnalisables, 
              fournis par différents fabricants et distributeurs partenaires. Les produits présentés 
              sur le site sont décrits avec la plus grande exactitude possible. Toutefois, des 
              différences mineures de couleur peuvent exister entre les visuels et le produit réel.
            </p>
            <p>
              La disponibilité des produits est donnée à titre indicatif et peut évoluer en fonction 
              des stocks de nos fournisseurs.
            </p>

            <h2>Article 4 - Prix</h2>
            <p>
              Les prix indiqués sur le site sont des <strong>prix indicatifs hors taxes (HT)</strong>. 
              Le prix définitif est celui figurant sur le devis établi par le Vendeur et accepté par 
              le Client.
            </p>
            <p>
              Les prix comprennent :
            </p>
            <ul>
              <li>Le produit textile ou objet selon les caractéristiques choisies</li>
              <li>La personnalisation selon les spécifications convenues (technique, nombre de couleurs, emplacement)</li>
            </ul>
            <p>
              Les frais de livraison, les frais de création graphique et les options supplémentaires 
              sont facturés en sus et détaillés dans le devis.
            </p>

            <h2>Article 5 - Devis et commande</h2>

            <h3>5.1 Demande de devis</h3>
            <p>
              Toute demande de devis est gratuite et sans engagement. Les devis sont valables 30 jours 
              à compter de leur date d'émission, sauf mention contraire.
            </p>

            <h3>5.2 Validation de la commande</h3>
            <p>
              La commande est considérée comme ferme et définitive après :
            </p>
            <ol>
              <li>Acceptation du devis par le Client (signature ou accord écrit)</li>
              <li>Validation du BAT (Bon À Tirer) par le Client</li>
              <li>Réception de l'acompte convenu (le cas échéant)</li>
            </ol>

            <h3>5.3 Bon À Tirer (BAT)</h3>
            <p>
              Avant production, un BAT est envoyé au Client pour validation. Ce document représente 
              la maquette du marquage tel qu'il sera réalisé. Le Client dispose de 48h pour valider 
              ou demander des modifications. La validation du BAT engage la responsabilité du Client 
              sur le contenu, l'orthographe et le rendu de la personnalisation.
            </p>

            <h2>Article 6 - Fichiers et éléments graphiques</h2>
            <p>
              Le Client s'engage à fournir des fichiers conformes aux exigences techniques :
            </p>
            <ul>
              <li><strong>Format vectoriel recommandé :</strong> AI, EPS, PDF, SVG</li>
              <li><strong>Images haute résolution :</strong> minimum 300 DPI à taille réelle</li>
            </ul>
            <p>
              En cas de fichiers non conformes, le Vendeur pourra proposer une adaptation ou une 
              vectorisation moyennant un supplément.
            </p>
            <p>
              <strong>Propriété intellectuelle :</strong> Le Client garantit être propriétaire ou 
              disposer des droits nécessaires sur tous les éléments graphiques transmis (logos, 
              images, textes). Le Client dégage le Vendeur de toute responsabilité en cas de litige 
              relatif aux droits de propriété intellectuelle.
            </p>

            <h2>Article 7 - Paiement</h2>

            <h3>7.1 Modes de paiement</h3>
            <p>Le Vendeur accepte les modes de paiement suivants :</p>
            <ul>
              <li>Virement bancaire</li>
              <li>Chèque</li>
              <li>Carte bancaire (selon conditions)</li>
            </ul>

            <h3>7.2 Conditions de paiement</h3>
            <ul>
              <li><strong>Nouveaux clients :</strong> Acompte de 50% à la commande, solde avant expédition</li>
              <li><strong>Clients réguliers :</strong> Conditions à définir selon l'historique commercial</li>
              <li><strong>Professionnels :</strong> Paiement à 30 jours fin de mois possible après accord</li>
            </ul>

            <h3>7.3 Retard de paiement</h3>
            <p>
              Tout retard de paiement entraîne de plein droit l'application d'intérêts de retard au 
              taux prévu par la loi, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
            </p>

            <h2>Article 8 - Délais de fabrication et de livraison</h2>

            <h3>8.1 Délais de fabrication</h3>
            <p>
              Les délais de fabrication sont indiqués à titre indicatif et courent à compter de :
            </p>
            <ul>
              <li>La validation du BAT</li>
              <li>La réception des fichiers conformes</li>
              <li>La réception de l'acompte (si applicable)</li>
            </ul>
            <p>
              Les délais standards sont de 2 à 3 semaines selon les produits et techniques de marquage. 
              Des délais express peuvent être proposés moyennant un supplément.
            </p>

            <h3>8.2 Livraison</h3>
            <p>
              Les produits sont livrés à l'adresse indiquée par le Client. Les frais de port sont 
              calculés en fonction du poids et de la destination.
            </p>
            <p>
              Le Vendeur ne pourra être tenu responsable des retards de livraison dus à des 
              circonstances indépendantes de sa volonté (grève, intempéries, rupture de stock 
              fournisseur, etc.).
            </p>

            <h3>8.3 Réception</h3>
            <p>
              Le Client doit vérifier l'état des colis à réception et émettre des réserves précises 
              auprès du transporteur en cas d'anomalie visible. Toute réclamation doit être signalée 
              au Vendeur dans un délai de 48 heures suivant la réception.
            </p>

            <h2>Article 9 - Réclamations et retours</h2>

            <h3>9.1 Non-conformité</h3>
            <p>
              En cas de défaut de fabrication ou de non-conformité par rapport au BAT validé, le 
              Client doit en informer le Vendeur par écrit dans un délai de 48 heures après réception. 
              Après vérification, le Vendeur procédera au remplacement des produits défectueux.
            </p>

            <h3>9.2 Produits personnalisés</h3>
            <p>
              <strong>Les produits personnalisés conformes au BAT validé ne peuvent faire l'objet 
              d'aucun retour, échange ou remboursement.</strong> Cette exclusion s'applique également 
              aux erreurs d'orthographe ou de contenu validées par le Client sur le BAT.
            </p>

            <h2>Article 10 - Tolérance et rendu</h2>
            <p>
              Les techniques de personnalisation impliquent des tolérances industrielles :
            </p>
            <ul>
              <li><strong>Quantités :</strong> Tolérance de +/- 5% sur les quantités livrées</li>
              <li><strong>Couleurs :</strong> Des variations mineures peuvent exister entre les couleurs affichées à l'écran et le rendu final</li>
              <li><strong>Positionnement :</strong> Tolérance de +/- 5mm sur le placement du marquage</li>
            </ul>

            <h2>Article 11 - Force majeure</h2>
            <p>
              Le Vendeur ne saurait être tenu responsable de l'inexécution totale ou partielle de ses 
              obligations en cas de force majeure, telle que définie par la jurisprudence française, 
              incluant notamment : catastrophes naturelles, grèves, pandémies, conflits armés, 
              restrictions gouvernementales.
            </p>

            <h2>Article 12 - Données personnelles</h2>
            <p>
              Les données personnelles collectées font l'objet d'un traitement conforme à notre{' '}
              <a href="/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>Article 13 - Droit applicable et litiges</h2>
            <p>
              Les présentes CGV sont régies par le droit français. En cas de litige, une solution 
              amiable sera recherchée avant toute action judiciaire. À défaut d'accord amiable, 
              les tribunaux compétents du ressort d'Épinal seront seuls compétents pour tout 
              litige relatif à l'interprétation ou l'exécution des présentes CGV.
            </p>

            <h2>Article 14 - Acceptation des CGV</h2>
            <p>
              Le Client déclare avoir pris connaissance des présentes Conditions Générales de Vente 
              et les accepter sans réserve. L'acceptation du devis vaut acceptation des présentes CGV.
            </p>

            <hr />

            <p className="text-sm text-muted-foreground">
              Pour toute question concernant ces conditions, contactez-nous :<br />
              Téléphone : <a href={`tel:${COMPANY_INFO.phoneLink}`}>{COMPANY_INFO.phone}</a><br />
              Email : <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
            </p>
          </div>
        </div>
      </section>

      <PageSEOFooter variant="default" />
    </Layout>
  );
}
