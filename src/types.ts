export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
export type EtatApparent = 'new' | 'worn' | 'damaged';
export type ScanMode = 'object' | 'barcode' | 'label';

export interface Detection {
  objet: string;
  categorie: string;
  matiere_principale: string;
  poids_estime_g: number;
  confiance: number;
  etat_apparent: EtatApparent;
  origine: 'sample' | 'photo' | 'barcode' | 'correction';
  code_barres?: string;
}

export interface LifecycleStage {
  key: 'matiere' | 'fabrication' | 'usage' | 'transport' | 'fin-de-vie';
  label: string;
  kgCo2e: number;
}

export interface ImpactRecord {
  co2e_kg: number;
  eau_l: number | null;
  matiere_kg: number;
  fin_de_vie: string;
  lifecycle: LifecycleStage[];
  source_co2e: string;
  source_eau: string;
  source_fin_de_vie: string;
  source_url: string;
}

export interface Alternative {
  nom: string;
  description: string;
  co2e_kg: number;
  source: string;
}

export interface ImpactView {
  grade: Grade;
  impact: ImpactRecord;
  alternatives: Alternative[];
  meilleurChoix: Alternative;
  gain_pct: number;
  comparaison: string;
}

export interface ScanEntry {
  id: string;
  date: string;
  objet: string;
  categorie: string;
  grade: Grade;
  co2e_kg: number;
  action: string;
  bonGeste: boolean;
  co2eEviteKg: number;
}
