export const AVOIDED_RATES = {
  garder: 0.3,
  donner: 0.85,
  deposer: 0.6,
  secondeMain: 0.85,
  eviter: 0,
} as const;

export type AvoidedAction = keyof typeof AVOIDED_RATES;

export const AVOIDED_RULE =
  'Avoided CO₂e = CO₂e of an equivalent new purchase × action rate ' +
  '(keeping 30%, giving/reselling 85%, collection 60%, second-hand 85%, avoiding 0%). ' +
  'These rates are documented educational assumptions, not measurements.';

export function avoidedCo2e(co2eNeuf: number, action: AvoidedAction): number {
  return Math.round(co2eNeuf * AVOIDED_RATES[action] * 100) / 100;
}
