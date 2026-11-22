export const CATEGORIES = [
  'Clothing',
  'Container',
  'Digital',
  'Appliances',
  'Furniture',
  'Other',
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export const ETATS = ['new', 'worn', 'damaged'] as const;
export type Etat = (typeof ETATS)[number];
