-- Launch guides, in French (the other languages fall back to them).
-- Facts checked in October 2026; each article lists its sources.
-- Admins edit them in /admin afterwards: "do nothing" on conflict, so running
-- this again never overwrites an edited article.
insert into public.posts (slug, locale, title, excerpt, body, category, cover_photo, cover_alt, cover_credit, status, published_at)
values
(
  'pneus-hiver-belgique', 'fr', $guide$Pneus hiver : ce que dit la loi en Belgique et chez nos voisins$guide$,
  $guide$En Belgique, rien ne vous oblige à monter des pneus hiver. Mais dès que vous passez la frontière, l’Allemagne, le Luxembourg et la France ont leurs propres règles. L’essentiel à savoir avant de rouler cet hiver.$guide$,
  $guide$En Belgique, aucun texte n’impose les pneus hiver, et aucun ne les interdit : vous pouvez rouler toute l’année en pneus été, quatre saisons ou hiver. Les règles qui comptent sont celles de nos voisins, et elles s’appliquent aussi aux voitures immatriculées chez nous. Voici l’essentiel pour l’hiver 2026-2027.

## Ce que prévoit le code de la route belge

Trois règles encadrent la saison froide sur nos routes :

- **Un indice de vitesse plus bas est toléré.** Du 1er octobre au 30 avril, des pneus hiver peuvent avoir un indice de vitesse inférieur à celui prévu pour la voiture. Un autocollant rappelant la vitesse maximale de ces pneus doit alors être placé dans le champ de vision du conducteur.
- **Les pneus à clous sont autorisés du 1er novembre au 31 mars**, sur les véhicules de 3,5 tonnes maximum et à vitesse réduite : un disque « 60 » doit être apposé à l’arrière.
- **Les chaînes ne sont permises que sur une route entièrement couverte de neige ou de glace.**

## Allemagne, Luxembourg, France : ce qui vous attend

| Pays | Quand | Pneus acceptés | Sanction |
|---|---|---|---|
| Allemagne | Dès qu’il y a neige, verglas, gadoue ou givre, sans période fixe | Symbole alpin uniquement, depuis le 1er octobre 2024 | De 60 à 120 € pour le conducteur, 75 € pour le détenteur qui prête sa voiture |
| Luxembourg | Dès que la route est hivernale : verglas, neige tassée, gadoue, plaques de glace ou de givre | Pneus hiver ou toutes saisons marqués M+S, M.S, M&S ou symbole alpin, sur toutes les roues | Avertissement taxé de 74 € |
| France | Du 1er novembre au 31 mars, dans les communes de montagne désignées par les préfets | Symbole alpin, ou chaînes ou chaussettes à neige dans le coffre | Amende et immobilisation possibles |

Le Luxembourg applique sa règle à tous les conducteurs, quelle que soit la plaque. Le marquage qui vous met en règle dans les quatre pays est le **symbole alpin** : une montagne à trois pics avec un flocon, parfois appelé 3PMSF. Le seul marquage M+S ne suffit plus en Allemagne ni en France. Si vous passez souvent la frontière, vers l’Eifel, le Grand-Duché ou les Alpes, choisissez des pneus qui le portent.

## Hiver, quatre saisons ou été ?

- **Pneus hiver** : gomme plus tendre et nombreuses lamelles, conçus pour le froid, la neige et la pluie froide. Le bon choix si vous roulez beaucoup, tôt le matin, en Ardenne ou à l’étranger.
- **Pneus quatre saisons** : un compromis qui évite deux changements par an. S’ils portent le symbole alpin, ils comptent comme pneus hiver en Allemagne, au Luxembourg et en France. Pour des trajets surtout urbains, beaucoup d’automobilistes belges s’en contentent.
- **Pneus été** : légaux toute l’année chez nous, mais leur gomme durcit par temps froid et l’adhérence baisse.

Le repère le plus souvent cité est 7 °C : en dessous, un pneu hiver accroche mieux qu’un pneu été. Les Allemands résument la saison par « O bis O », d’octobre à Pâques.

## Sculptures : le minimum légal et le seuil conseillé

En Belgique, la profondeur minimale des sculptures est de 1,6 mm, repérable aux témoins d’usure au fond des rainures. Sur neige, un pneu hiver perd vite son efficacité en s’usant : Touring conseille de ne pas descendre sous 3,5 mm, l’ADAC allemand sous 4 mm.

La date de fabrication est gravée sur le flanc : quatre chiffres, la semaine puis l’année. « 4123 » signifie 41e semaine de 2023.

## Avant le premier froid

- Contrôlez l’usure et la date de fabrication de vos pneus hiver.
- Vérifiez la pression à froid : elle baisse quand la température chute.
- Si vos pneus hiver ont leurs propres jantes, le garage échange simplement les roues : c’est plus rapide et moins cher que de démonter les pneus.
- Pas de place pour les stocker ? Beaucoup de garages proposent un hôtel de pneus : ils gardent votre jeu hors saison et le remontent au rendez-vous suivant.
- Prenez rendez-vous tôt : les agendas se remplissent vite aux premières gelées.

## Trouver un garage pour le changement

Sur SafeMarq, la recherche [Pneus](/recherche?metier=pneus) classe les spécialistes autour de chez vous selon leur score de confiance. La page [Équipement des ateliers](/outillage) montre quels garages ont déclaré leurs machines, démonte-pneus et équilibreuses comprises.

## Sources

- [Guichet.lu, pneus hiver obligatoires en cas de conditions hivernales](https://guichet.public.lu/fr/citoyens/transport/transports-individuels/vehicule-motorise/controle-technique-pneumatiques/pneus-hiver.html)
- [Centre européen des consommateurs, pneus hiver en Allemagne](https://www.cec-zev.eu/thematiques/vehicules/pneus-hiver-en-allemagne/)
- [Test-Achats, pneus hiver à l’étranger (novembre 2025)](https://www.test-achats.be/mobilite/pneus/news/reglementation-pneus-hiver-europe)
- [Les Frontaliers, pneus hiver 2026 au Luxembourg et chez ses voisins (octobre 2026)](https://www.lesfrontaliers.lu/mobilite/pneus-hiver-2026-ce-qui-change-au-luxembourg-et-chez-ses-voisins/)
- [Heuver, législation sur les pneus hiver et les chaînes en Europe (hiver 2024)](https://images.heuver.com/Non-Products/Whitepapers/2024/Wetgeving-winterbanden_FR.pdf)
- [BRF, conseils pour les pneus hiver (octobre 2022, en allemand)](https://1.brf.be/ratgeber/1120352)
$guide$,
  'conseil', 'photo-1632823471565-1ecf94f8799a', $guide$Mécanicien en train de monter un pneu sur une jante$guide$, 'Deniz Demirci / Unsplash',
  'published', now() - interval '10 minutes'
),
(
  'choisir-son-garage', 'fr', $guide$Choisir un garage de confiance : la méthode$guide$,
  $guide$Note Google, nombre d’avis, spécialité, devis écrit, historique Car-Pass : ce qui distingue un garage fiable, les signaux qui doivent vous alerter, et que faire en cas de désaccord.$guide$,
  $guide$La crainte la plus répandue face à un garage est simple : payer trop cher, ou pour des travaux inutiles. La confiance, pourtant, se vérifie avant de laisser ses clés. Voici comment comparer les garages, et comment réagir si quelque chose se passe mal.

## Lisez les avis, et leur nombre

Une note de 4,9 sur huit avis ne vaut pas un 4,6 sur quatre cents. C’est pourquoi le score SafeMarq combine les deux : 60 % pour la note Google, 40 % pour le nombre d’avis, sur une échelle qui progresse vite au début puis plafonne à 500 avis. Aucun garage ne peut payer pour monter dans le classement. [La méthode complète](/about) explique le calcul.

Au-delà du chiffre, lisez les avis récents, et surtout les réponses du garage aux avis négatifs : c’est là que l’on voit comment il traite un client mécontent. Sur SafeMarq, un avis laissé avec sa facture porte la mention « facture vérifiée » une fois la facture contrôlée.

## Choisissez un garage qui connaît votre voiture

- **La concession officielle** dispose des outils et des formations de la marque. Le réseau de la marque effectue les réparations sous garantie et les rappels du constructeur.
- **Le spécialiste indépendant** travaille surtout sur quelques marques et en connaît les points faibles.
- **Le garage généraliste** convient à l’entretien courant de la plupart des voitures.

Pour une voiture sous garantie, l’entretien courant peut se faire hors du réseau de la marque : notre guide sur [le prix d’un entretien](/blog/prix-entretien-voiture-belgique) explique à quelles conditions. Les pages [Garages par marque](/marques) distinguent les concessions officielles des spécialistes qui déclarent entretenir la marque.

## Regardez l’équipement

Un diagnostic fiable demande un outil à jour, une géométrie précise demande un banc adapté. Les garages peuvent déclarer leur matériel sur SafeMarq : la page [Équipement des ateliers](/outillage) les classe par marque d’outillage.

## Exigez un devis écrit, et lisez-le

Un bon devis indique la voiture et son kilométrage, le nombre d’heures et le taux horaire pour chaque opération, la référence et le prix de chaque pièce, et un total TVA comprise. Demandez au garage de vous appeler avant tout travail qui n’y figure pas, et de vous rendre les pièces remplacées. Notre guide sur [le prix d’un entretien](/blog/prix-entretien-voiture-belgique) détaille chaque ligne.

## Gardez une trace de chaque intervention

Depuis le 1er janvier 2024, les garages qui travaillent sur une voiture ou une camionnette transmettent à Car-Pass le kilométrage et la description des travaux. Cet historique est consultable par le QR code du Car-Pass au moment de la revente. Conservez aussi vos factures détaillées : elles prouvent que le plan d’entretien du constructeur a été suivi. Tout est expliqué dans notre guide du [Car-Pass](/blog/car-pass-acheter-occasion).

## Les signaux qui doivent vous alerter

- Pas de devis écrit, ou un devis sans détail des heures et des pièces.
- Une pression pour décider tout de suite, sans vous montrer la pièce ni expliquer le défaut.
- Des travaux faits sans votre accord.
- Le refus de rendre les pièces remplacées.
- Un paiement en liquide sans facture.

## En cas de désaccord

1. Écrivez au garage, par e-mail ou par lettre recommandée : décrivez le problème et ce que vous demandez.
2. Gardez toutes les preuves : devis, facture, photos, échanges.
3. Si rien ne bouge, le [Service de médiation pour le consommateur](https://mediationconsommateur.be) vous oriente vers l’organe de règlement compétent.

Pour un litige lié à l’achat d’une voiture ou d’une moto chez un professionnel, la Commission de conciliation Automoto peut intervenir, après une tentative d’accord directe avec le vendeur. Le dossier coûte 80 € TVA comprise, non remboursables. Si la conciliation échoue, la voie judiciaire reste ouverte.

## Sources

- [SPF Economie, conciliation Automoto](https://economie.fgov.be/en/themes/online/belmed-online-mediation/alternative-dispute-resolution/continue/alternative-settlement-options/conciliation/automoto-conciliation)
- [Car-Pass, historique d’entretien (en anglais)](https://www.car-pass.be/en/private-individuals/i-want-to-buy-a-used-vehicle/what-is-on-the-car-pass-and-what-should-you-pay-attention-to/maintenance-history)
$guide$,
  'conseil', 'photo-1619642751034-765dfdf7c58e', $guide$Main tenant une clé dans un compartiment moteur éclairé$guide$, 'Christian Buehner / Unsplash',
  'published', now() - interval '20 minutes'
),
(
  'prix-entretien-voiture-belgique', 'fr', $guide$Combien coûte l’entretien d’une voiture en Belgique ?$guide$,
  $guide$Petite révision, grande révision, courroie de distribution : les ordres de grandeur publiés en 2026, ce qui fait varier la facture, et comment lire un devis pour payer le juste prix, chez le concessionnaire comme chez un indépendant.$guide$,
  $guide$Il n’existe pas de tarif officiel de l’entretien en Belgique : chaque garage fixe son taux horaire et le prix de ses pièces, et chaque constructeur impose son plan d’entretien. Il existe en revanche des ordres de grandeur, et surtout une méthode pour lire un devis.

## Ce que contient un entretien

- **La petite révision**, ou entretien intermédiaire : vidange de l’huile moteur, filtre à huile et joint du bouchon de vidange, mise à niveau des liquides, contrôle des freins, des pneus, de l’éclairage et de la suspension, remise à zéro de l’indicateur d’entretien.
- **La grande révision** : la même chose, plus le filtre à air, le filtre d’habitacle, et selon le moteur le filtre à carburant (diesel) ou les bougies (essence). Le liquide de frein est remplacé quand son échéance est atteinte.
- **La courroie de distribution** : une intervention à part, à l’échéance en kilomètres ou en années fixée par le constructeur. Certains moteurs ont une chaîne, sans remplacement programmé.

Le carnet ou l’application du constructeur indique ce qui est dû, et quand. C’est ce plan que le garage doit suivre, quel qu’il soit.

## Les ordres de grandeur

Ce sont des fourchettes publiées en ligne, pas des tarifs officiels :

| Intervention | Fourchette | Source |
|---|---|---|
| Petite révision | 150 à 300 € | VoitureBelgique, février 2026 |
| Grande révision, sans distribution | 300 à 600 € | VoitureBelgique, février 2026 |
| Révision générale, pièces et main-d’œuvre comprises | 150 à 250 € | iDGARAGES, garages partenaires |
| Courroie de distribution | 500 à 1 200 € | VoitureBelgique, février 2026 |

Une petite citadine se situe en général dans le bas de ces fourchettes, un grand SUV ou une berline puissante dans le haut.

## Ce qui fait varier la facture

- **Le temps facturé.** La main-d’œuvre, c’est un nombre d’heures multiplié par le taux horaire du garage. Demandez combien d’heures sont comptées pour chaque opération.
- **Les pièces.** Pièces d’origine ou de qualité équivalente : l’écart de prix peut être important. Demandez les références.
- **L’huile.** Le constructeur impose une norme d’huile, pas seulement une viscosité. Vérifiez que la facture mentionne bien celle de votre carnet.
- **La voiture.** Un diesel avec filtre à particules peut coûter plus cher à entretenir ; une électrique a moins de pièces d’usure.
- **Le garage.** Concession, indépendant ou chaîne d’entretien rapide : les taux horaires diffèrent, comme les forfaits proposés.

## Concession ou indépendant : la garantie n’en dépend pas

Dans une enquête publiée en 2020, Test-Achats observait que 77 % des Belges faisaient entretenir leur voiture chez un concessionnaire de la marque : 94 % pendant les deux premières années, encore 65 % pour une voiture de 7 à 10 ans. Beaucoup craignent de perdre la garantie.

Les règles européennes de concurrence pour l’après-vente automobile, prolongées jusqu’au 31 mai 2028, ne permettent pas au constructeur de subordonner sa garantie à un entretien dans son réseau, ni à l’usage de pièces d’origine pour les travaux qu’elle ne couvre pas. En pratique, il vous faut un garage qui respecte le plan d’entretien du constructeur, et des factures détaillées que vous conservez. Les réparations prises en charge par la garantie, elles, se font dans le réseau de la marque.

## Lire un devis

- Il est écrit, daté, et identifie la voiture : plaque et kilométrage.
- Chaque ligne de main-d’œuvre indique un nombre d’heures et le taux horaire.
- Chaque pièce a une référence, une quantité et un prix unitaire.
- Les frais divers sont chiffrés, pas noyés dans le total.
- Le total est indiqué TVA comprise (21 %).
- Il précise, ou vous faites ajouter, que tout travail non prévu vous sera proposé avant d’être fait.

À la remise de la voiture, comparez la facture au devis ligne par ligne, et demandez à récupérer les pièces remplacées.

## Comparer sans y passer la journée

Demandez deux ou trois devis pour la même intervention, sur la même base : mêmes pièces, même kilométrage. Sur SafeMarq, la recherche [Entretien](/recherche?metier=entretien) classe les garages autour de chez vous par score de confiance, et les pages [Garages par marque](/marques) listent concessions et spécialistes. Les garages qui acceptent les demandes en ligne affichent un bouton « Demander un devis » sur leur fiche.

## Sources

- [Test-Achats, entretien de votre voiture : satisfaction et coûts (janvier 2020)](https://www.test-achats.be/mobilite/autos/dossier/satisfaction-frais-entretien-voiture)
- [VoitureBelgique, révision voiture en Belgique : que comprend-elle et quel prix ? (février 2026)](https://www.voiturebelgique.com/revision-voiture-belgique-comprend-prix/)
- [iDGARAGES, prix d’une révision en Belgique](https://www.idgarages.com/fr-be/prestations/revision-vidange)
- [Cuatrecasas, prolongation du règlement d’exemption automobile jusqu’en 2028 (en anglais)](https://www.cuatrecasas.com/en/global/art/eu-commission-prolongs-motor-vehicle-block-exemption-regulation)
- [Journal de l’Automobile, entretien hors réseau et garantie (2014)](https://journalauto.com/services/entretien-hors-reseau-fini-la-perte-de-garantie/)
$guide$,
  'guide', 'photo-1771340012319-0b4fca008b54', $guide$Mécanicien penché dans le compartiment moteur ouvert d’une voiture$guide$, 'Dextar Studio / Unsplash',
  'published', now() - interval '30 minutes'
),
(
  'controle-technique-2026-regions', 'fr', $guide$Contrôle technique 2026 : fréquence, prix et documents, région par région$guide$,
  $guide$Depuis le 1er septembre 2026, la Flandre ne contrôle plus les voitures que tous les deux ans. La Wallonie et Bruxelles gardent un contrôle annuel, avec des exceptions. Les règles, les tarifs 2026 et la façon de préparer la visite.$guide$,
  $guide$En Belgique, le contrôle technique relève des Régions : la Flandre, la Wallonie et Bruxelles fixent chacune la fréquence et les tarifs. Une voiture neuve passe son premier contrôle quatre ans après sa première immatriculation. Ensuite, tout dépend de la Région où elle est immatriculée.

## Tous les combien ?

| Région | Fréquence pour une voiture particulière |
|---|---|
| Flandre | Tous les deux ans pour toutes les voitures, depuis le 1er septembre 2026, à condition de vous présenter avec un certificat encore valable |
| Wallonie | Chaque année. Tous les deux ans pour une voiture de 8 ans et 110 000 km maximum, bien entretenue, si le contrôle ne relève que des défauts administratifs mineurs |
| Bruxelles | Chaque année. Tous les deux ans pour une voiture de moins de 6 ans et de moins de 100 000 km, présentée à temps, qui obtient un certificat vert sans remarque |

## Ce qui a changé en Flandre le 1er septembre 2026

- Le contrôle tous les deux ans s’applique désormais à toutes les voitures, anciennes comprises.
- Après une carte rouge, vous avez deux mois pour réparer, au lieu de quinze jours.
- La preuve d’assurance n’est plus demandée au contrôle.
- Le certificat temporaire de trois mois pour défauts mineurs disparaît.
- Le montage d’un crochet d’attelage ne demande plus de passage au contrôle.

La Flandre prévoit aussi de supprimer le contrôle obligatoire avant la revente d’une voiture déjà immatriculée en Belgique. La mesure n’est pas encore adoptée : en attendant, ce contrôle reste obligatoire.

## Les tarifs 2026

| | Wallonie | Bruxelles et Flandre |
|---|---|---|
| Contrôle périodique | 59,60 € | 40,90 €, plus 5,20 € (essence) ou 15,60 € (diesel) pour le contrôle des émissions |
| Recontrôle | 16,50 € | 16,40 € |
| Contrôle avant revente | 89,40 € | 74,40 € |
| Retard de plus de six mois | 59,60 € de supplément | 37,20 € de supplément |

Le supplément de retard augmente par paliers : à Bruxelles et en Flandre, il commence à 10,40 € pour un retard de moins d’un mois ; en Wallonie, à 10,60 €. Les tarifs sont indexés chaque 1er janvier.

## Les documents à emporter

- Le certificat d’immatriculation.
- Le certificat de conformité, si la voiture en a besoin.
- La carte d’assurance, papier ou électronique, sauf en Flandre où elle n’est plus demandée.
- Le certificat du contrôle précédent.

À Bruxelles, le rendez-vous est obligatoire. Présentez une voiture vide et propre.

## Le résultat : certificat vert ou rouge

Un certificat vert indique que la voiture est en ordre jusqu’à la date de validité inscrite. Un certificat rouge signale des défauts à réparer avant un recontrôle : quinze jours en Wallonie et à Bruxelles, deux mois en Flandre. En cas de défaut dangereux, la voiture peut être interdite à la circulation.

## Préparer la visite pour éviter le recontrôle

Avant le rendez-vous, vérifiez vous-même les pneus, tous les feux, les essuie-glaces, les ceintures et les portières. Faites contrôler tout témoin allumé au tableau de bord. Un garage peut faire un pré-contrôle et réparer ce qui doit l’être, avant la visite ou après une carte rouge : la recherche [Contrôle technique](/recherche?metier=controle-technique) liste ceux qui préparent la visite et la contre-visite.

## Vendre une voiture d’occasion

Pour vendre une voiture déjà immatriculée en Belgique, le contrôle avant revente reste obligatoire dans les trois Régions, et vous devez remettre un Car-Pass à l’acheteur. Notre guide du [Car-Pass](/blog/car-pass-acheter-occasion) explique comment le lire.

## Sources

- [Vlaanderen.be, un contrôle technique plus simple et moins fréquent dès septembre 2026 (en néerlandais)](https://www.vlaanderen.be/mobiliteit-en-openbare-werken/auto-en-motor/technische-keuring-van-voertuigen/technische-keuring-wordt-eenvoudiger-en-minder-frequent-vanaf-september-2026)
- [Vlaanderen.be, tarifs du contrôle technique (en néerlandais)](https://www.vlaanderen.be/mobiliteit-en-openbare-werken/auto-en-motor/technische-keuring-van-voertuigen/tarieven)
- [Wallonie.be, allongement du délai pour les véhicules de maximum 8 ans (avril 2024)](https://www.wallonie.be/fr/actualites/controle-technique-allongement-du-delai-pour-les-vehicules-de-maximum-8-ans)
- [be.brussels, le contrôle technique](https://be.brussels/fr/transport-mobilite/permis-de-conduire-et-immatriculation/controle-technique)
- [Selectra, prix du contrôle technique en 2026](https://selectra.be/fr/assurance/auto/prix-controle-technique)
$guide$,
  'guide', 'photo-1700727448575-6f1680cd7d75', $guide$Technicien avec une liste de contrôle dans un atelier$guide$, 'TruckRun / Unsplash',
  'published', now() - interval '40 minutes'
),
(
  'car-pass-acheter-occasion', 'fr', $guide$Car-Pass : comment le lire avant d’acheter une voiture d’occasion$guide$,
  $guide$Le Car-Pass retrace le kilométrage d’une voiture et, depuis 2024, l’historique d’entretien déclaré par les garages. Ce qu’il contient, comment vérifier qu’il est authentique, et vos droits si le vendeur ne vous le remet pas.$guide$,
  $guide$Quand vous achetez une voiture d’occasion en Belgique, le vendeur, particulier ou professionnel, doit vous remettre un Car-Pass. Seule exception : l’acheteur est lui-même un garage ou un négociant. Ce document officiel est votre meilleure protection contre la fraude au compteur, à condition de savoir le lire.

## Ce que contient un Car-Pass

- **Les relevés du compteur**, avec leur date, depuis la première immatriculation.
- **L’identité de la voiture** : marque, modèle et numéro de châssis.
- **Deux dates** : la première immatriculation en Belgique et la première mise en circulation. Si elles diffèrent, la voiture a sans doute roulé à l’étranger, et l’historique de cette période est plus maigre.
- **La norme Euro**, qui détermine l’accès aux zones de basses émissions.
- **Les émissions de CO₂**, qui comptent pour la fiscalité de la voiture, avec la méthode de mesure (NEDC ou WLTP).
- **Le contrôle après accident**, si la voiture a eu un accident grave et doit encore y passer.
- **Les rappels du constructeur restés ouverts.**
- **L’état de santé de la batterie** des voitures électriques et hybrides rechargeables, si le vendeur l’a fait ajouter.
- **La date de validité** du document : deux mois après sa délivrance.

## Le lire en cinq minutes

- Les relevés doivent augmenter régulièrement. Une baisse, ou plusieurs années sans relevé, mérite une explication.
- Comparez le dernier relevé au compteur de la voiture : l’écart doit correspondre aux kilomètres parcourus depuis.
- Vérifiez que le numéro de châssis est le même sur le Car-Pass, sur la voiture et sur le certificat d’immatriculation.
- Si un contrôle après accident est mentionné, demandez la preuve qu’il a été passé.
- S’il reste des rappels ouverts, demandez au vendeur de les faire effectuer, ou faites-les faire par un atelier de la marque.

## L’historique d’entretien, désormais visible

Depuis le 1er janvier 2024, les garages qui travaillent sur une voiture ou une camionnette doivent transmettre à Car-Pass le kilométrage et la description des travaux. Cet historique n’est pas imprimé : scannez le QR code du Car-Pass pour le consulter. Vous verrez si la voiture a été entretenue à temps, et si des pièces importantes ou coûteuses ont été remplacées.

## Vérifier qu’il est authentique

Le document est imprimé sur un papier spécial, avec encre fluorescente et hologramme. Scannez son QR code, ou saisissez son numéro d’identification sur le site de Car-Pass : les données affichées doivent correspondre au papier. Sinon, le document est peut-être faux ou périmé.

## Où l’obtenir, et pour combien

Le Car-Pass est délivré automatiquement lors du contrôle technique avant revente. On peut aussi l’obtenir au guichet de n’importe quel centre de contrôle, sans rendez-vous, avec la voiture. Il coûte 11,10 € TVA comprise, et il est gratuit s’il compte moins de quatre relevés.

## Si le vendeur ne vous le remet pas

La loi permet à l’acheteur particulier de faire annuler la vente, et le prix doit alors lui être remboursé. N’achetez donc jamais sans Car-Pass, même pour aller vite.

## Avant de signer, faites inspecter la voiture

Le Car-Pass ne dit rien de l’état mécanique. Avant d’acheter, faites examiner la voiture par un garage qui ne travaille pas pour le vendeur : lecture des codes défaut, freins, pneus, fuites, carrosserie. La recherche [Diagnostic électronique](/recherche?metier=diagnostic) classe les garages équipés autour de chez vous. Pour le contrôle avant revente, voir notre guide du [contrôle technique 2026](/blog/controle-technique-2026-regions).

## Sources

- [Car-Pass, qu’est-ce qu’un Car-Pass ? (en anglais)](https://www.car-pass.be/en/about-car-pass/what-is-a-car-pass)
- [Car-Pass, ce que contient le Car-Pass (en anglais)](https://www.car-pass.be/en/private-individuals/i-want-to-buy-a-used-vehicle/what-is-on-the-car-pass-and-what-should-you-pay-attention-to)
- [Car-Pass, historique d’entretien (en anglais)](https://www.car-pass.be/en/private-individuals/i-want-to-buy-a-used-vehicle/what-is-on-the-car-pass-and-what-should-you-pay-attention-to/maintenance-history)
- [Car-Pass, prix du Car-Pass (en anglais)](https://www.car-pass.be/en/faq/hoeveel-kost-een-car-pass)
- [Car-Pass, je n’ai pas reçu de Car-Pass (en anglais)](https://www.car-pass.be/en/private-individuals/i-bought-a-used-vehicle/i-have-not-received-a-car-pass)
$guide$,
  'guide', 'photo-1727893119356-1702fe921cf9', $guide$SUV rouge sur un pont élévateur dans un atelier lumineux, un mécanicien sous le capot$guide$, 'Mehmet Talha Onuk / Unsplash',
  'published', now() - interval '50 minutes'
)
on conflict (locale, slug) do nothing;
