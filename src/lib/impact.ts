import { CATEGORIES } from '../../shared/categories';
import { AVOIDED_RATES, avoidedCo2e } from '@/lib/avoided';
import { entrees, entreesDeCategorie, gradeFor, type ImpactEntry } from '@/lib/grade';
import { kg } from '@/lib/format';
import type { Alternative, Detection, ImpactRecord, ImpactView, LifecycleStage } from '@/types';

function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function score(entry: ImpactEntry, detection: Detection): number {
  const objet = norm(detection.objet);
  const name = norm(entry.nom);
  let total = 0;
  if (objet.includes(name) || name.includes(objet)) total += 10;
  for (const keyword of entry.mots_cles) {
    if (objet.includes(norm(keyword))) total += 3;
  }
  if (norm(detection.matiere_principale).includes(norm(entry.matiere_principale))) total += 2;
  if (detection.categorie === entry.categorie) total += 1;
  return total;
}

export function findEntry(detection: Detection): ImpactEntry {
  const ranked = entrees
    .map((entry) => ({ entry, points: score(entry, detection) }))
    .sort((a, b) => b.points - a.points);
  if (ranked[0] && ranked[0].points > 0) return ranked[0].entry;
  const sameCategory = entreesDeCategorie(detection.categorie);
  return sameCategory[0] ?? entrees[0];
}

function lifecycle(entry: ImpactEntry): LifecycleStage[] {
  if (!entry.cycle) {
    return [{ key: 'matiere', label: 'Non détaillé', kgCo2e: entry.co2e_kg }];
  }
  const labels: Record<string, string> = {
    matiere: 'Matière',
    fabrication: 'Fabrication',
    usage: 'Usage',
    transport: 'Transport',
    fin_de_vie: 'Fin de vie',
  };
  return (Object.keys(entry.cycle) as (keyof typeof entry.cycle)[]).map((key) => ({
    key: key === 'fin_de_vie' ? 'fin-de-vie' : key,
    label: labels[key],
    kgCo2e: entry.cycle![key],
  }));
}

function impactRecord(entry: ImpactEntry): ImpactRecord {
  return {
    co2e_kg: entry.co2e_kg,
    eau_l: entry.eau_l,
    matiere_kg: entry.poids_g / 1000,
    fin_de_vie: entry.fin_de_vie,
    lifecycle: lifecycle(entry),
    source_co2e: entry.source_co2e,
    source_eau: entry.source_eau ?? 'Donnée non publiée dans nos sources',
    source_fin_de_vie: entry.source_fin_de_vie,
    source_url: entry.source_url,
  };
}

function builtInAlternatives(current: ImpactEntry): Alternative[] {
  const valeur = current.co2e_kg;
  return [
    {
      nom: 'Le garder plus longtemps',
      description: 'Prolonger la durée de vie évite un achat neuf',
      co2e_kg: Math.round(valeur * (1 - AVOIDED_RATES.garder) * 100) / 100,
      source: 'Règle CO₂e évité documentée dans le README (taux 30 %)',
    },
    {
      nom: 'Acheter d’occasion',
      description: 'Fabrication non réattribuée à ce geste',
      co2e_kg: Math.round(valeur * (1 - AVOIDED_RATES.secondeMain) * 100) / 100,
      source: 'Règle CO₂e évité documentée dans le README (taux 85 %)',
    },
  ];
}

function sourcedAlternatives(current: ImpactEntry): Alternative[] {
  return entreesDeCategorie(current.categorie)
    .filter((entry) => entry.cle !== current.cle && entry.co2e_kg < current.co2e_kg)
    .sort((a, b) => a.co2e_kg - b.co2e_kg)
    .slice(0, 2)
    .map((entry) => ({
      nom: entry.nom,
      description: `Même catégorie · ${kg(entry.co2e_kg)} kg CO₂e`,
      co2e_kg: entry.co2e_kg,
      source: entry.source_co2e,
    }));
}

export function resolveImpact(detection: Detection): ImpactView {
  const entry = findEntry(detection);
  const alternatives = [
    ...builtInAlternatives(entry),
    ...sourcedAlternatives(entry),
  ];
  const meilleurChoix = alternatives.reduce((best, item) =>
    item.co2e_kg < best.co2e_kg ? item : best,
  );
  const gain = Math.round(((entry.co2e_kg - meilleurChoix.co2e_kg) / entry.co2e_kg) * 100);
  const categorie = CATEGORIES.includes(detection.categorie as (typeof CATEGORIES)[number])
    ? detection.categorie
    : entry.categorie;
  return {
    grade: gradeFor(entry.co2e_kg, entry.categorie),
    impact: impactRecord(entry),
    alternatives,
    meilleurChoix,
    gain_pct: gain,
    comparaison: `Comparé aux autres ${categorie.toLowerCase()}`,
  };
}

export function actionAvoided(action: string, co2eNeuf: number): number {
  if (action.includes('garder')) return avoidedCo2e(co2eNeuf, 'garder');
  if (action.includes('donner') || action.includes('revendre')) return avoidedCo2e(co2eNeuf, 'donner');
  if (action.includes('déposer') || action.includes('collecte')) return avoidedCo2e(co2eNeuf, 'deposer');
  return 0;
}
