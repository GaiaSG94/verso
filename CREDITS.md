# Credits

## External libraries and frameworks

This app is built with the following open-source packages. They are used under their respective open-source licenses (mostly MIT/ISC; fonts under the SIL Open Font License). For exact license terms, see each package's LICENSE file.

- Expo SDK 58 and the Expo modules (`expo-camera`, `expo-font`, `expo-linking`, `expo-router`, `expo-sharing`, `expo-status-bar`) - https://expo.dev and https://docs.expo.dev
- React Native 0.88 - https://reactnative.dev
- React 19 - https://react.dev
- `react-native-safe-area-context` - https://github.com/th3rdwave/react-native-safe-area-context
- `@react-native-async-storage/async-storage` - https://github.com/react-native-async-storage/async-storage
- `react-native-svg` - https://github.com/software-mansion/react-native-svg
- `lucide-react-native` - https://github.com/lucide-icons/lucide
- `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono` - https://fonts.google.com
- TypeScript - https://www.typescriptlang.org
- ESLint and `eslint-config-expo` - https://eslint.org
- Wrangler (Cloudflare Workers CLI) - https://developers.cloudflare.com/workers/wrangler/

## Datasets and references

Impact values shown in the app are estimates derived from public reference datasets, not measurements. Each value is displayed with a source field naming its origin.

- ADEME Impact CO2, open-data `equivalents.csv` dataset - https://impactco2.fr
- ADEME Base Carbone / Base Empreinte, glass packaging record 24267 - https://base-empreinte.ademe.fr
- Ecobalyse, accessed via Nos Gestes Climat - https://ecobalyse.beta.gouv.fr and https://nosgestesclimat.fr
- Gerbens-Leenes, Hoekstra & Bosman (2018), *Science of the Total Environment* - journal and year cited as the reference for the water-footprint figure.
- Product eco-declaration for a 350 ml insulated bottle - https://publiciteparlimage.fr - used only for the bottle (gourde) CO2e figure, with the source named in the app.

All figures are indicative estimates intended for comparison and education; they are not laboratory measurements.

## Assets

- Fonts: Space Grotesk, Inter and JetBrains Mono, distributed through `@expo-google-fonts` under the SIL Open Font License.
- Icons: Lucide line icons, used under the ISC license (https://github.com/lucide-icons/lucide).
- The mini-map and object placeholders are original vector shapes drawn in code; no third-party images are used.
- The app icon is derived from the Expo template.

## AI-assisted work

- The five design artboards (Scanner, Resultat, Tri, Alternatives, Journal) were produced earlier in a Claude chat and used as a design reference.
- The implementation and user-facing copy were generated with opencode using its cheap model router.
- Object recognition is performed at runtime by an AI model via InferHub (`combo/cheap`). The model returns only structured object-identification JSON (object name, category, main material, estimated weight, confidence, apparent condition) and never returns any impact numbers.
- No AI output is presented as a measurement. Environmental impact values come solely from the reference datasets listed above.

## Permissions

All included material is public, open-licensed, or original to this project. No copyrighted photos, private data, or secrets are committed to this repository.
