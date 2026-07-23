## Objectif

Recentrer SafeMarq sur la question « Meilleurs [métier] à [ville] ». On livre en 3 étapes comme demandé : (1) `ScoreSeal` — déjà en place, on l'exploite tel quel ; (2) page de classement `/[metier]/[ville]` ; (3) refonte du Hero d'accueil métier + ville. Les grilles ville/métier et pages villes/métiers viennent ensuite.

## État des données (important)

La base actuelle **n'a pas** de table `trades`, ni de colonne `city`, ni de vue `garage_trade_ratings`. La table `garages` a `address`, `specialty`, `type`, `rating`, `reviews_count`. On ne crée **pas** de nouvelles tables dans cette itération : on définit les 13 métiers en TypeScript statique et on dérive la ville depuis `address` (regex + normalisation). Le mapping métier ⇄ garage se fait via `specialty` / `description` (heuristique par mots-clés). Dès que la table `garages` sera peuplée, les pages afficheront le classement ; en attendant, un état vide propre est affiché.

## Étape 1 — Fondations

- `src/lib/trades.ts` : constantes des 13 métiers `{ slug, label, labelPlural, keywords[] }` (entretien, mecanique, carrosserie, pneus, depannage, detailing, preparation-perf, pare-brise, electricite, climatisation, diagnostic, controle-technique, pieces).
- `src/lib/cities.ts` : liste de villes belges principales + `slugifyCity()`, `cityFromAddress()`.
- `src/lib/ranking.ts` : `matchTrade(garage, tradeSlug)` (recherche mots-clés dans specialty/description/badges) et `rankGarages(list)` par score SafeMarq desc.

## Étape 2 — Page classement `/:trade/:city`

- Route ajoutée dans `src/App.tsx` **au-dessus** de la catch-all : `/:trade/:city` → `TradeCity`.
- `src/pages/TradeCity.tsx` :
  - Valide `trade` (∈ 13 slugs) et `city` (slug connu). Sinon → `NotFound`.
  - Fil d'ariane · titre éditorial · sous-titre avec compteur.
  - Barre de re-filtrage compacte (2 selects métier/ville, submit → navigate).
  - Liste classée : `RankedGarageRow` avec rang #1..N ; le #1 a bordure amber + badge « Meilleur choix à {ville} ».
  - Chaque ligne : rang, `ScoreSeal` compact, nom, note + `reviews_count`, ville, extrait `quote`, CTA « Demander un devis » (lien fiche).
  - État vide dédié si aucun match.
  - Bloc SEO bas de page : intro éditoriale + FAQ (3 questions génériques paramétrées).
  - `<Seo>` titre/description dynamiques + JSON-LD `ItemList`.

- `src/components/safemarq/RankedGarageRow.tsx` : composant réutilisable, animation `whileInView` + hover spring.
- `src/components/safemarq/TradeCityFilterBar.tsx` : re-filtrage inline.

## Étape 3 — Hero métier + ville

- Refonte `src/components/safemarq/SafemarqHero.tsx` :
  - 2 champs côte à côte : select métier (13 options) + input ville avec `<datalist>` (villes belges connues).
  - Titre éditorial fort : « Les meilleurs garages de Belgique, notés par ceux qui y sont allés. »
  - Compteur animé (déjà `AnimatedNumber`).
  - Bouton « Voir le classement » → `navigate(/{tradeSlug}/{citySlug})`.
  - Chips de recherches populaires réelles → mêmes routes.
  - Trust signals conservés. Score Seal du côté droit conservé.

## Hors périmètre pour cette itération

Pages `/ville/:city` et `/metier/:trade`, grilles CityGrid/TradeGrid, migration SQL (`trades`, `garage_trades`, colonne `city`), refonte des sections `PriceTruth`/`RegionsBlock`. À traiter dans la prochaine étape une fois les 3 briques validées.

## Détails techniques

- Score SafeMarq déjà exposé par `calculateSAFEMARQScore(rating, reviews_count)` dans `useGarages.ts`. On l'utilise pour trier.
- Aucune modification DB, aucune régression sur les routes existantes (la nouvelle route `/:trade/:city` est très spécifique, mais elle risque de capturer d'anciennes URLs à 2 segments — on liste explicitement les slugs valides dans le composant et on retombe sur `NotFound` sinon, avant même le rendu, pour éviter toute collision).
- Animations : `EASE`, `fadeUp`, `staggerParent` déjà dans `src/components/safemarq/motion.ts`. `prefers-reduced-motion` respecté via `useReducedMotion` (déjà utilisé).
- Accessibilité : `aria-label` sur rang, focus rings shadcn conservés, `sr-only` sur labels des selects.

## Validation

- `tsgo` doit passer.
- Navigation manuelle : `/carrosserie/namur` charge, montre l'état vide propre ; le hero soumet vers la bonne URL ; les chips naviguent.
