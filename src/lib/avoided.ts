export const AVOIDED_RATES = {
  garder: 0.3,
  donner: 0.85,
  deposer: 0.6,
  secondeMain: 0.85,
  eviter: 0,
} as const;

export type AvoidedAction = keyof typeof AVOIDED_RATES;

export const AVOIDED_RULE =
  'CO₂e évité = CO₂e d’un achat neuf équivalent × taux du geste ' +
  '(garder 30 %, donner/revendre 85 %, collecte 60 %, seconde main 85 %, à éviter 0 %). ' +
  'Ces taux sont des hypothèses pédagogiques documentées, pas des mesures.';

export function avoidedCo2e(co2eNeuf: number, action: AvoidedAction): number {
  return Math.round(co2eNeuf * AVOIDED_RATES[action] * 100) / 100;
}
