import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

const Terms = () => (
  <LegalLayout title="Conditions d’utilisation" description="Les règles d’utilisation de SafeMarq, pour les particuliers et les garages." updated="2026-10-14">
    <h2>1. Objet</h2>
    <p>
      SafeMarq est un comparateur de garages automobiles en Belgique. Il permet de consulter des fiches de garages et leur classement, de publier des avis
      et d’envoyer des demandes de devis aux garages qui gèrent leur fiche.
    </p>

    <h2>2. Accès au service</h2>
    <p>
      La consultation est gratuite et sans compte. Les favoris fonctionnent aussi sans compte, sur votre appareil. Publier un avis, envoyer une demande de
      devis, retrouver ses favoris sur plusieurs appareils et gérer une fiche de garage demandent un compte.
    </p>

    <h2>3. Compte</h2>
    <ul>
      <li>Vous vous engagez à fournir des informations exactes.</li>
      <li>Vos identifiants sont personnels.</li>
      <li>SafeMarq peut suspendre un compte en cas d’usage frauduleux ou contraire à ces conditions.</li>
    </ul>

    <h2>4. Classement</h2>
    <p>
      Le classement repose sur le score SafeMarq, calculé à partir de la note et du nombre d’avis de la fiche Google de chaque garage, selon la méthode
      publiée sur la page <Link to="/about">Méthode</Link>. Aucun garage ne peut payer pour améliorer sa place.
    </p>

    <h2>5. Avis</h2>
    <p>
      Un avis doit être sincère et reposer sur une expérience réelle. SafeMarq peut demander une facture pour l’attester. Un garage ne peut pas noter son
      propre établissement. Les contenus diffamatoires, injurieux, publicitaires ou sans rapport avec le garage sont retirés.
    </p>

    <h2>6. Demandes de devis</h2>
    <p>
      Une demande de devis est transmise au seul garage choisi, avec vos coordonnées. SafeMarq n’est pas partie au contrat que vous concluez ensuite avec le
      garage.
    </p>

    <h2>7. Espace pro</h2>
    <p>
      Un garage peut revendiquer sa fiche depuis un compte professionnel. SafeMarq vérifie à la main chaque entreprise, notamment son numéro BCE et ses
      coordonnées, avant de lui confier la gestion d’une fiche. Les informations de confiance (note, nombre d’avis, nom, adresse) restent gérées par
      SafeMarq.
    </p>

    <h2>8. Responsabilité</h2>
    <p>
      SafeMarq fournit une information aussi exacte que possible, sans pouvoir en garantir l’exhaustivité. Les prestations sont réalisées par les garages,
      sous leur seule responsabilité.
    </p>

    <h2>9. Propriété intellectuelle</h2>
    <p>La marque, le design, les textes et le code de SafeMarq sont protégés par le droit d’auteur et le droit des marques.</p>

    <h2>10. Modification des conditions</h2>
    <p>SafeMarq peut modifier ces conditions. Les changements importants vous sont annoncés avant de s’appliquer.</p>

    <h2>11. Droit applicable</h2>
    <p>
      Ces conditions sont régies par le droit belge. Les litiges relèvent des tribunaux de Namur, sous réserve des règles impératives qui permettent aux
      consommateurs de saisir le tribunal de leur domicile.
    </p>
  </LegalLayout>
);

export default Terms;
