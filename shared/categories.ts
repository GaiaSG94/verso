export const CATEGORIES = [
  'Habillement',
  'Contenant',
  'Numérique',
  'Électroménager',
  'Mobilier',
  'Autre',
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export const ETATS = ['neuf', 'usé', 'abîmé'] as const;
export type Etat = (typeof ETATS)[number];
