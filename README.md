# Verso

Verso is an English-language mobile app built with Expo and React Native (TypeScript). Point the camera at an object and Verso shows its environmental impact: an A-E grade, CO2e, water use, main material, end-of-life guidance, better choices, and a local journal of your scans and good deeds.

> Every impact figure shown in the app is an average drawn from public, citable sources. No impact number is ever produced by the vision model. Unpublished values are shown as "Data not available" rather than guessed.

## Overview

1. Capture an object with the camera (or scan a barcode).
2. The Cloudflare Worker sends the photo to the InferHub router and receives a strict JSON classification: object, category, main material, estimated weight, confidence, and apparent condition. The prompt explicitly forbids any environmental figures.
3. If confidence is below 0.6, the app asks you to confirm or correct the object first.
4. The app resolves the matching record from `src/data/impacts.json`. Each value carries its own source, displayed under the figure.
5. The result screens show the grade, impact breakdown, sorting/end-of-life advice, alternatives, and CO2e avoided by better choices.
6. Scans and good deeds are stored locally in a journal with km/shower equivalences.

## Stack & rationale

| Component | Choice | Reason |
| --- | --- | --- |
| App | Expo SDK 58, React Native 0.88, TypeScript | Runs in Expo Go; one codebase for Android and iOS |
| Navigation | Expo Router (`src/app/`) | File-based routing, deep links, Expo recommended |
| Camera / barcode | `expo-camera` (`CameraView`) | Bundled with Expo Go; built-in EAN/UPC scanning |
| Fonts | Space Grotesk, Inter, JetBrains Mono | The project's design system |
| Journal | AsyncStorage | Local-only storage, no user account in v1 |
| Backend | Cloudflare Worker (standard Web APIs) | Keeps the API key out of the app and the repository |
| Vision | InferHub router, `combo/cheap`, via OpenAI-compatible `/chat/completions` | Configurable model; the key stays server-side |

## Quick start

```bash
# App
npm install
npm start            # then open in Expo Go 58
```

The app boots with a built-in sample object, so all five screens can be viewed immediately, with no backend and no API key.

For live camera recognition, start the backend in a second terminal:

```bash
cd worker
npm install
npx wrangler dev     # http://localhost:8787
```

Then point the app at it with `EXPO_PUBLIC_VERSO_API_URL` (see Environment variables). On a physical phone, replace `localhost` with your machine's LAN IP; USB Android also works with `adb` and Expo Go.

Production deployment:

```bash
cd worker
npx wrangler secret put INFERHUB_API_KEY
npx wrangler deploy
```

Verification:

```bash
npm run typecheck          # app
npm run lint               # app
cd worker && npm run typecheck
```

Without the backend, camera capture shows an error, but the sample flow and the rest of the app still work.

## Environment variables

Names only. No secret value is ever written to a file or to this README. The values below are the documented public defaults.

| Name | Where | Purpose |
| --- | --- | --- |
| `INFERHUB_BASE_URL` | Worker | Public default: `https://api.inferhub.dev/v1`. A local dev router at `http://127.0.0.1:18100/v1` injects its own key. |
| `INFERHUB_MODEL` | Worker | Public default: `combo/cheap`. |
| `INFERHUB_API_KEY` | Worker only (`wrangler secret put`) | Secret. Server-side only; never in the app, never committed. |
| `EXPO_PUBLIC_VERSO_API_URL` | App (public Expo variable) | Backend URL; public default `http://localhost:8787`. Contains no secret. |

`.env.example` is committed with a deliberately fake placeholder. The real `.env` and `worker/.dev.vars` are ignored by Git. Never read, display, or copy a real key into a chat, a log, or the submission form.

## Data sources

All impact values live in `src/data/impacts.json`, with a `source` field per value. The vision model supplies no numbers.

1. **ADEME Impact CO2** (`impactco2.fr`) — CO2e figures and the cotton T-shirt lifecycle breakdown.
2. **ADEME Base Carbone / Base Empreinte** — glass packaging, record 24267: 0.809 kgCO2e/kg.
3. **Ecobalyse (ADEME) via Nos Gestes Climat** — cotton T-shirt water footprint: 12.75 m3; reference shower: 6 min x 12 L/min.
4. **Gerbens-Leenes, Hoekstra & Bosman (2018)**, *Science of the Total Environment* — material water factors: steel 2,350 L/kg, glass 1,300 L/kg.
5. **Product eco-declaration page** — 350 ml insulated stainless-steel bottle: 1.309 kgCO2e, with the source named explicitly in the record.

When a value is not published in these sources, the field is `null` and the UI shows "Data not available". When a lifecycle breakdown is not published, the bar shows a single "Not detailed" segment.

## Grading method

The grade is **relative to the object's category** in `src/data/impacts.json`:

1. Collect `co2e_kg` for every record in the category.
2. Sort ascending (lowest impact to highest).
3. Compute quintiles `q20`, `q40`, `q60`, `q80` by linear interpolation.
4. Compare the object to the thresholds:

| Grade | Condition | Label |
| --- | --- | --- |
| A | `co2e <= q20` | Very low impact |
| B | `q20 < co2e <= q40` | Low impact |
| C | `q40 < co2e <= q60` | Moderate impact |
| D | `q60 < co2e <= q80` | High impact |
| E | `co2e > q80` | Very high impact |

The grade is **always written as a letter**, never conveyed by color alone. Example: in Clothing (19 references), the thresholds are 12.77 / 18.84 / 28.54 / 54.17 kgCO2e, so a cotton T-shirt (6.43 kg) grades A.

Because grading is per unit and relative, a reusable item can grade poorly: its manufacture is heavier, but the impact is amortized over many uses.

## Avoided CO2 rule

Single rule: `avoided CO2e = CO2e of an equivalent new purchase x action rate`.

| Action | Rate |
| --- | --- |
| Keep the object longer | 30% |
| Give or resell | 85% |
| Drop off at the right collection point | 60% |
| Buy second-hand | 85% |
| Throw away anywhere | 0% |

These rates are **documented educational assumptions** (`src/lib/avoided.ts`), not measurements. The journal sums the avoided amounts for the displayed month and provides km and shower equivalences.

## Equivalences

All factors are centralized in `src/constants/equivalences.ts`:

- Car: **0.1932 kgCO2e/km** — ADEME average, 193.2 gCO2e/km per vehicle.
- Shower: **72 L** — Nos Gestes Climat (ADEME), 6 min x 12 L/min.

## Design system & accessibility

Paper background `#F4F2EC`, white cards `#FFFFFF`, ink `#15201B`, secondary text `#56605A`, lime accent `#C6F05E` (always paired with ink text). Grades: A `#1E6B52`, B `#3F7F4C`, C `#E3B341`, D `#E58A3A`, E `#B5432C`. Lifecycle bar: `#15201B`, `#4F6B5D`, `#93A89C`, `#C9D3CC`, `#E3B341`. Alert: background `#F7E3DD`, title `#8A2E1C`. Thin-line Lucide icons; no emojis, no gradients. Pill buttons are 52 px tall, touch targets are at least 44 px, and icon-only buttons carry an `accessibilityLabel`.

The five screens (Scanner, Result, Sorting, Alternatives, Journal) and the bottom tab bar follow the five design artboards produced earlier in a reference Claude chat (`Main`, `Resultat`, `Tri`, `Alternatives`, `Journal`). Those artboards were an existing design input, not code. Only the figures differ: they are replaced by the sourced data described above, and the grade is computed by quintiles.

## Architecture / tree

```
src/app/          five screens (scanner, impact, end-of-life, alternatives, journal)
src/components/   shared components (cards, grades, navigation, mini-map)
src/data/         sourced impact dataset (impacts.json)
src/lib/          grading, impact resolution, equivalences, API, barcode, storage
src/constants/    configuration and equivalence factors
src/theme.ts      design tokens
src/context/      app state
src/mock/         built-in sample object
worker/           Cloudflare Worker (server-side key only)
shared/           categories shared by app and backend
```

`POST /recognize` receives a base64 photo. The Worker calls `${INFERHUB_BASE_URL}/chat/completions` with `INFERHUB_MODEL`, validates and bounds the response server-side, and returns only the detection payload. Barcode mode queries Open Products Facts and then Open Food Facts, and falls back to photo capture when no usable product is found.

## Known limitations

- Recognition requires the backend. Without it, camera capture reports an error; the built-in sample flow remains available.
- The mini-map is a schematic drawn with views, not a real map background. The Directions button opens the phone's mapping app.
- The journal is device-local: uninstalling the app deletes its history.
- The vision model can misidentify an object. Confidence scoring and manual correction let you override it.
- Grades are relative within a category, so they do not express absolute impact.

## Submission compliance

1. **Deadline.** The submitter must check the published hackathon deadline and submit before it. This repository does not claim any date, because no deadline was provided; no date is invented here.

   ```
   [ ] Confirm published deadline: ____
   [ ] Submit before it
   ```

2. **Work completed during the event vs pre-existing.**
   - **NEW work built for this project:** the Verso app code, the five screens, the theme/design system, the sourced impact dataset, quintile grading, the local journal, the InferHub backend, and this README/CREDITS documentation.
   - **PRE-EXISTING foundations:** the Expo blank TypeScript template (`create-expo-app` SDK 58), React Native, the libraries listed in `package.json`, the ADEME and other public datasets, the font files from `@expo-google-fonts`, and the five design artboards produced earlier in a Claude chat (`Main`, `Resultat`, `Tri`, `Alternatives`, `Journal`) that the UI follows. The artboards were an existing design input, not code.

3. **Credits.** See `CREDITS.md` for the full list of external libraries, datasets, assets, and AI-assisted work. The main ones are the ADEME Impact CO2 and Base Carbone/Base Empreinte datasets, Ecobalyse/Nos Gestes Climat, Gerbens-Leenes et al. (2018), the InferHub vision router, the Expo and React Native toolchain, and the `@expo-google-fonts` and Lucide icon packages.

4. **Permission to use materials.** All fonts are distributed under the SIL Open Font License via `@expo-google-fonts`. Lucide icons and the npm packages are used under their own open licenses. Impact values are public ADEME/Ecobalyse/Impact CO2 data. No third-party photos or copyrighted media are bundled: the "map" is a schematic drawn with views, and object thumbnails are vector icons.

5. **Secrets.** There are no passwords, API keys, or private data in the repository. Only `.env.example`, containing a fake placeholder, is committed; real keys live in environment variables and Wrangler secrets. A secret scan was run and found no real credentials. Never paste a real key into the submission form.

6. **Demo accessibility + setup.** Judges can run `npm install`, then `npm start`, and open the app in Expo Go 58. The app boots with a built-in sample object, so all five screens are viewable without any backend or key. For live camera recognition, start the backend (`cd worker && npm install && npx wrangler dev`; in production, `npx wrangler secret put INFERHUB_API_KEY && npx wrangler deploy`) and set `EXPO_PUBLIC_VERSO_API_URL`. USB Android works with `adb` and Expo Go. Without the backend, camera capture shows an error, but the sample flow still works.
