# Verso

Application mobile (Expo / React Native + TypeScript) qui reconnaît un objet à partir de la caméra et affiche son impact environnemental : note A–E, CO₂e, eau, matière, fin de vie, bons gestes et alternatives. Interface en français.

> Toutes les valeurs affichées sont des **estimations moyennes issues de sources publiques**. Aucun chiffre d'impact ne provient du modèle de vision.

## Stack et choix

| Brique | Choix | Raison |
| --- | --- | --- |
| App | Expo SDK 58, React Native 0.88, TypeScript | Compatible Expo Go, une seule base de code Android/iOS |
| Navigation | Expo Router (`src/app/`) | Recommandé par Expo, routage fichier, deep links |
| Caméra / codes-barres | `expo-camera` (`CameraView`) | Module inclus dans Expo Go, scan EAN/UPC intégré |
| Polices | Space Grotesk, Inter, JetBrains Mono | Charte graphique demandée |
| Journal | AsyncStorage | Stockage local, pas de compte utilisateur en v1 |
| Backend | Cloudflare Worker (Web APIs standards) | Garde la clé API hors de l'app et du dépôt |
| Vision | `claude-sonnet-5-5` via Messages API | Vision + réponse JSON contrainte, modèle configurable côté serveur |

## Lancement

```bash
# App
npm install
npm start            # puis ouvrir dans Expo Go

# Backend (dans un second terminal)
cd worker
npm install
npx wrangler dev     # http://localhost:8787
```

Sur un téléphone physique, remplacer `localhost` par l'IP LAN de la machine dans `EXPO_PUBLIC_VERSO_API_URL`.

Déploiement du backend :

```bash
cd worker
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Vérifications :

```bash
npm run typecheck          # app
cd worker && npm run typecheck
npx expo export --platform ios
```

## Variables d'environnement (noms uniquement)

| Nom | Où | Usage |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Worker uniquement (`wrangler secret put`) | Appel à l'API Claude. **Jamais dans l'app, jamais commitée.** |
| `ANTHROPIC_MODEL` | Worker (`wrangler.toml`) | Identifiant du modèle de vision |
| `ALLOWED_ORIGIN` | Worker (optionnel) | Origine CORS autorisée |
| `EXPO_PUBLIC_VERSO_API_URL` | App (variable publique Expo) | URL du backend, sans secret |

Le fichier `.env.example` contient une **valeur fictive**. Le vrai `.env` est ignoré par Git. Ne jamais lire, afficher ou copier sa valeur.

## Fonctionnement

1. `POST /recognize` reçoit la photo en base64. Le Worker envoie l'image à Claude avec un prompt qui **interdit tout chiffre d'impact** et impose un JSON strict : `objet`, `categorie`, `matière_principale`, `poids_estime_g`, `confiance`, `etat_apparent`. La réponse est validée et bornée côté serveur.
2. Si `confiance < 0,6`, l'app affiche « Ce n'est pas ça ? » en premier et propose une correction.
3. L'app résout la fiche depuis `src/data/impacts.json` (aucune valeur du modèle). Chaque valeur porte un `source_co2e`, `source_eau` et/ou `source_fin_de_vie`, affichés sous les chiffres via « Estimation moyenne · source : … ».
4. Le mode Code-barres interroge Open Products Facts puis Open Food Facts ; si le produit n'est pas pertinent, l'app revient à la photo.

### Priorité des sources

1. **Impact CO₂ (ADEME)** — `impactco2.fr` (`equivalents.csv` et fiches objets) pour le CO₂e et le détail du cycle de vie du T-shirt.
2. **ADEME Base Carbone / Base Empreinte** — verre d'emballage, fiche 24267 (0,809 kgCO₂e/kg).
3. **Ecobalyse (ADEME) via Nos Gestes Climat** — empreinte eau du T-shirt en coton (12,75 m³) ; douche de référence (6 min × 12 L/min).
4. **Gerbens-Leenes, Hoekstra & Bosman (2018)**, *Science of the Total Environment* — facteurs d'eau matière (acier 2 350 L/kg, verre 1 300 L/kg).
5. **Fiche produit éco-conception** (Bouteille isotherme 350 mL, 90 % acier recyclé) — 1,309 kgCO₂e pour la gourde, source explicitement nommée dans la fiche.

Quand une donnée n'est pas publiée dans ces sources, le champ vaut `null` et l'app affiche « Donnée non disponible » plutôt qu'une estimation inventée. Quand la répartition par phase n'est pas publiée, la barre affiche un unique segment « Non détaillé ».

## Méthode de notation A–E

La note est **relative à la catégorie** de l'objet dans `src/data/impacts.json`.

1. On collecte les `co2e_kg` de tous les objets de la même catégorie.
2. On trie la liste par ordre croissant (du plus faible impact au plus élevé).
3. On calcule les quintiles `q20`, `q40`, `q60`, `q80` par interpolation linéaire.
4. On compare l'objet aux seuils :

| Note | Condition | Libellé |
| --- | --- | --- |
| A | `co2e <= q20` | Impact très faible |
| B | `q20 < co2e <= q40` | Impact faible |
| C | `q40 < co2e <= q60` | Impact modéré |
| D | `q60 < co2e <= q80` | Impact élevé |
| E | `co2e > q80` | Impact très élevé |

La lettre est **toujours écrite** et jamais signalée par la couleur seule. Exemple : dans la catégorie Habillement (19 références), les seuils sont 12,77 / 18,84 / 28,54 / 54,17 kgCO₂e ; un T-shirt en coton (6,43 kg) est noté A. Un objet réutilisable peut être mal noté « par unité » : sa fabrication est plus lourde, mais elle s'amortit sur de nombreuses utilisations.

## CO₂e évité

Règle unique : `CO₂e évité = CO₂e d'un achat neuf équivalent × taux du geste`.

| Geste | Taux |
| --- | --- |
| Garder l'objet plus longtemps | 30 % |
| Donner ou revendre | 85 % |
| Déposer au bon point de collecte | 60 % |
| Acheter d'occasion | 85 % |
| Jeter n'importe où | 0 % |

Ces taux sont des **hypothèses pédagogiques documentées** (`src/lib/avoided.ts`), pas des mesures. Le journal additionne ces montants pour le mois affiché et fournit les équivalences km/douches.

## Facteurs d'équivalence

Tous regroupés dans `src/constants/equivalences.ts` :

- Voiture : **0,1932 kgCO₂e/km** — ADEME, facteur moyen 193,2 gCO₂e/km/véhicule.
- Douche : **72 L** — Nos Gestes Climat (ADEME), 6 min × 12 L/min.

## Charte graphique

Fond papier `#F4F2EC`, cartes `#FFFFFF`, encre `#15201B`, secondaire `#56605A`, citron `#C6F05E` (toujours avec texte encre). Notes : A `#1E6B52`, B `#3F7F4C`, C `#E3B341`, D `#E58A3A`, E `#B5432C`. Barre du cycle de vie : `#15201B`, `#4F6B5D`, `#93A89C`, `#C9D3CC`, `#E3B341`. Alerte : fond `#F7E3DD`, titre `#8A2E1C`. Icônes au trait (Lucide), aucun emoji, aucun dégradé. Boutons pilule 52 px, zones tactiles ≥ 44 px, `accessibilityLabel` sur les boutons icône.

La structure des cinq écrans (Scanner, Résultat, Tri, Alternatives, Journal) et la barre d'onglets reprennent les artboards validés dans le chat Claude de référence (`Main`, `Resultat`, `Tri`, `Alternatives`, `Journal`). Seules les valeurs chiffrées diffèrent : elles sont remplacées par les données sourcées décrites plus haut, et la note est calculée par quintiles.

## Arborescence

```
src/app/          cinq écrans (scanner, impact, fin-de-vie, alternatives, journal)
src/components/   composants partagés (cartes, notes, navigation, mini-carte)
src/data/         référentiel d'impact sourcé (impacts.json)
src/lib/          note, impact, équivalences, API, codes-barres, stockage
src/constants/    configuration et facteurs d'équivalence
worker/           backend Cloudflare Worker (clé API côté serveur)
shared/           catégories partagées app/backend
```

## Limites connues

- La reconnaissance dépend du backend : sans lui, le scan photo affiche un message d'erreur ; la fiche de démonstration reste disponible au démarrage.
- La mini-carte est un schéma (pas de fond cartographique réel) ; le bouton Itinéraire ouvre un itinéraire dans l'application de cartographie du téléphone.
- Le journal est local à l'appareil : le désinstaller supprime l'historique.
- Le modèle de vision peut se tromper : la confiance et la correction manuelle permettent de reprendre la main.
