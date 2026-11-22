import { colors } from '@/theme';

export const equivalences = {
  voiture: {
    kgCo2eParKm: 0.1932,
    source: 'ADEME — facteur moyen voiture 193,2 g CO₂e/km/véhicule (docs.datagir.ademe.fr)',
  },
  douche: {
    litres: 72,
    source: 'Nos Gestes Climat (ADEME) — douche 6 min × 12 L/min',
  },
} as const;

export function kmVoiture(co2eKg: number): number {
  return co2eKg / equivalences.voiture.kgCo2eParKm;
}

export function nombreDouches(eauL: number): number {
  return eauL / equivalences.douche.litres;
}

export const lifecycleColors = colors.lifecycle;
