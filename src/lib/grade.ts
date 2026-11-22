import source from '@/data/impacts.json';
import type { Grade } from '@/types';

export interface ImpactEntry {
  cle: string;
  nom: string;
  mots_cles: string[];
  categorie: string;
  matiere_principale: string;
  poids_g: number;
  co2e_kg: number;
  eau_l: number | null;
  source_co2e: string;
  source_eau: string | null;
  source_url: string;
  fin_de_vie: string;
  source_fin_de_vie: string;
  cycle: {
    matiere: number;
    fabrication: number;
    usage: number;
    transport: number;
    fin_de_vie: number;
  } | null;
  source_cycle: string | null;
}

export const entrees = source.entrees as unknown as ImpactEntry[];

export function entreesDeCategorie(categorie: string): ImpactEntry[] {
  const found = entrees.filter((entry) => entry.categorie === categorie);
  return found.length > 0 ? found : entrees;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function gradeFor(co2eKg: number, categorie: string): Grade {
  const values = entreesDeCategorie(categorie)
    .map((entry) => entry.co2e_kg)
    .sort((a, b) => a - b);
  const thresholds = [0.2, 0.4, 0.6, 0.8].map((p) => percentile(values, p));
  const index = thresholds.findIndex((threshold) => co2eKg <= threshold);
  return (['A', 'B', 'C', 'D', 'E'] as Grade[])[index === -1 ? 4 : index];
}
