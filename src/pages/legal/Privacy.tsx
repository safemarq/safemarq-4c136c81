import LegalLayout from './LegalLayout';

const Privacy = () => (
  <LegalLayout
    title="Politique de confidentialité"
    description="Les données que SafeMarq traite, pourquoi, avec qui elles sont partagées et comment exercer vos droits (RGPD)."
    updated="2026-10-14"
  >
    <p>
      Cette page explique quelles données SafeMarq traite, pourquoi, avec qui elles sont partagées et comment exercer vos droits, conformément au
      Règlement général sur la protection des données (RGPD, règlement UE 2016/679).
    </p>

    <h2>1. Responsable du traitement</h2>
    <p>
      SafeMarq, Namur, Belgique. Contact : <a href="mailto:privacy@safemarq.be">privacy@safemarq.be</a>
    </p>

    <h2>2. Les données que nous traitons</h2>
    <ul>
      <li>
        <strong>Votre compte</strong> : votre adresse email, votre mot de passe, enregistré sous une forme chiffrée qui ne permet pas de le relire, et le
        nom d’affichage si vous en choisissez un. Si vous choisissez « Continuer avec Google », Google nous transmet votre adresse email et votre nom.
      </li>
      <li>
        <strong>Vos favoris</strong> : sans compte, ils restent dans votre navigateur. Quand vous créez un compte, ils y sont copiés puis effacés de
        l’appareil.
      </li>
      <li>
        <strong>Vos demandes de devis</strong> : le garage choisi, le véhicule et la prestation, votre description, la plaque si vous l’indiquez, votre
        adresse email et, si vous les indiquez, votre nom et votre téléphone.
      </li>
      <li>
        <strong>Vos avis</strong> : la note, le texte et la date, publiés sur la fiche du garage avec votre nom d’affichage, ou « Client SafeMarq » si vous
        n’en avez pas choisi. Si vous joignez une facture, elle est rangée dans un espace privé : seul SafeMarq peut la consulter.
      </li>
      <li>
        <strong>Vos véhicules</strong>, si vous les enregistrez : marque, modèle, plaque et kilométrage.
      </li>
      <li>
        <strong>Les comptes professionnels</strong> : nom de l’entreprise, numéro BCE, adresse, téléphone et email professionnels, qui servent à vérifier
        l’entreprise avant de lui confier une fiche.
      </li>
      <li>
        <strong>Les données techniques</strong> : adresse IP et informations du navigateur, nécessaires au fonctionnement et à la sécurité du service.
      </li>
      <li>
        <strong>Votre position</strong>, uniquement si vous l’autorisez dans le navigateur pour chercher « près de chez moi ». Elle ne quitte pas votre
        appareil : elle sert à trouver la localité la plus proche, et seule cette localité est utilisée pour la recherche.
      </li>
    </ul>

    <h2>3. Pourquoi, et sur quelle base</h2>
    <ul>
      <li>Fournir le service, gérer votre compte et transmettre vos demandes de devis : exécution du contrat (nos conditions d’utilisation).</li>
      <li>Vérifier les avis et les comptes professionnels, lutter contre la fraude et sécuriser le service : intérêt légitime.</li>
      <li>Utiliser votre position : consentement, que vous pouvez retirer à tout moment dans les réglages du navigateur.</li>
    </ul>

    <h2>4. Qui reçoit vos données</h2>
    <ul>
      <li>
        <strong>Le garage à qui vous envoyez une demande de devis</strong>, et lui seul, pour qu’il puisse vous répondre.
      </li>
      <li>
        <strong>Nos prestataires techniques</strong> : Supabase, via Lovable Cloud, pour la base de données, les comptes et les fichiers (Union
        européenne) ; l’hébergeur du site ; Google, si vous utilisez la connexion Google.
      </li>
      <li>
        <strong>Les services qui affichent des images</strong> : les photos d’illustration viennent d’Unsplash et les fonds de carte de CARTO, à partir des
        données OpenStreetMap. Votre navigateur leur transmet votre adresse IP pour charger ces images.
      </li>
    </ul>
    <p>
      SafeMarq ne vend aucune donnée. Si un prestataire traite des données hors de l’Union européenne, ce transfert est encadré par des garanties
      appropriées, comme les clauses contractuelles types de la Commission européenne.
    </p>

    <h2>5. Combien de temps</h2>
    <ul>
      <li>Compte, favoris, véhicules et demandes de devis : tant que votre compte existe.</li>
      <li>Avis : tant que le garage est référencé. La facture jointe reste privée et suit l’avis.</li>
      <li>Données techniques : 13 mois au maximum.</li>
    </ul>

    <h2>6. Vos droits</h2>
    <p>
      Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation du traitement, leur portabilité, et vous opposer au
      traitement. Écrivez à <a href="mailto:privacy@safemarq.be">privacy@safemarq.be</a>.
    </p>
    <p>
      Vous pouvez aussi introduire une réclamation auprès de l’
      <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">
        Autorité de protection des données
      </a>
      .
    </p>

    <h2>7. Sécurité</h2>
    <p>
      Mots de passe chiffrés, connexions HTTPS, accès aux données contrôlé ligne par ligne dans la base (Row-Level Security) et politique de sécurité du
      contenu qui interdit au site de charger des scripts extérieurs.
    </p>
  </LegalLayout>
);

export default Privacy;
