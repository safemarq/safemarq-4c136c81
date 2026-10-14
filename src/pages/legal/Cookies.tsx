import LegalLayout from './LegalLayout';

const Cookies = () => (
  <LegalLayout
    title="Cookies et stockage local"
    description="Ce que SafeMarq garde dans votre navigateur, et pourquoi. Aucun cookie publicitaire, aucune mesure d’audience."
    updated="2026-10-14"
  >
    <p>
      SafeMarq n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Le site garde seulement, dans votre navigateur, ce qui est nécessaire
      à son fonctionnement et à vos choix.
    </p>

    <h2>Ce que le site garde dans votre navigateur</h2>
    <ul>
      <li>
        <strong>Votre session</strong>, pour rester connecté.
      </li>
      <li>
        <strong>Vos favoris</strong>, tant que vous n’avez pas de compte.
      </li>
      <li>
        <strong>Vos préférences</strong> : langue, thème clair ou sombre, dernière localité recherchée.
      </li>
      <li>
        <strong>Votre réponse au bandeau</strong> sur la mesure d’audience.
      </li>
      <li>Deux repères d’affichage : un conseil déjà vu, l’animation d’accueil déjà jouée.</li>
    </ul>
    <p>
      Ces éléments sont strictement nécessaires au service ou retiennent des choix que vous avez faits : ils ne demandent pas de consentement. Vous pouvez
      les effacer à tout moment dans les réglages de votre navigateur.
    </p>

    <h2>Mesure d’audience</h2>
    <p>
      SafeMarq n’utilise aujourd’hui aucun outil de mesure d’audience. Si nous en ajoutons un, il ne sera activé qu’avec votre accord, donné ou refusé
      dans le bandeau, et refuser ne changera rien au fonctionnement du site.
    </p>

    <h2>Contenus d’autres services</h2>
    <ul>
      <li>Les photos d’illustration (Unsplash) et les fonds de carte (CARTO, OpenStreetMap) sont chargés depuis leurs serveurs, qui reçoivent votre adresse IP, comme pour toute image en ligne.</li>
      <li>Le lien « Itinéraire » ouvre Google Maps dans un nouvel onglet.</li>
      <li>Les vidéos que certains garages ajoutent à leur fiche sont lues depuis YouTube en mode de confidentialité renforcée (youtube-nocookie.com) ou depuis Vimeo.</li>
    </ul>

    <h2>Géolocalisation</h2>
    <p>
      Votre position n’est utilisée qu’avec votre accord, donné dans le navigateur, pour chercher « près de chez moi ». Elle ne quitte pas votre appareil :
      seule la localité la plus proche est retenue.
    </p>
  </LegalLayout>
);

export default Cookies;
