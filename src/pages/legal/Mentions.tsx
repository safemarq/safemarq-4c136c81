import LegalLayout from './LegalLayout';

const Mentions = () => (
  <LegalLayout title="Mentions légales" description="Mentions légales de SafeMarq." updated="2026-10-14">
    <h2>Éditeur du site</h2>
    <p>
      <strong>SafeMarq</strong><br />
      Plateforme de comparaison de garages automobiles<br />
      Namur, Belgique<br />
      Email : contact@safemarq.be
    </p>

    <h2>Hébergement</h2>
    <p>Le site est hébergé via Lovable Cloud (infrastructure Supabase, Union Européenne).</p>

    <h2>Directeur de la publication</h2>
    <p>Le représentant légal de SafeMarq.</p>

    <h2>Propriété intellectuelle</h2>
    <p>L'ensemble du contenu (textes, graphismes, logos, code) est la propriété exclusive de SafeMarq, sauf mention contraire. Toute reproduction est interdite sans autorisation préalable.</p>

    <h2>Crédits</h2>
    <ul>
      <li>Données cartographiques : © les contributeurs d’OpenStreetMap ; fonds de carte : © CARTO</li>
      <li>Codes postaux : GeoNames (CC BY 4.0)</li>
      <li>Photos d’illustration : Unsplash, avec le crédit de chaque photo d’article</li>
      <li>Icônes : Lucide</li>
    </ul>

    <h2>Contact</h2>
    <p>Pour toute question : <a href="mailto:contact@safemarq.be">contact@safemarq.be</a></p>
  </LegalLayout>
);

export default Mentions;
