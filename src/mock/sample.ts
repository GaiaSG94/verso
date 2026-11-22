import type { Detection, ImpactView } from '@/types';

export const sampleDetection: Detection = {
  objet: 'T-shirt en coton',
  categorie: 'Habillement',
  matiere_principale: 'Coton',
  poids_estime_g: 180,
  confiance: 0.92,
  etat_apparent: 'usé',
  origine: 'exemple',
};

export const sampleImpact: ImpactView = {
  grade: 'C',
  comparaison: 'Comparé aux autres vêtements',
  impact: {
    co2e_kg: 6.43,
    eau_l: 12750,
    matiere_kg: 0.18,
    fin_de_vie: 'Réemploi ou recyclage textile en priorité',
    lifecycle: [
      { key: 'matiere', label: 'Matière', kgCo2e: 1.7 },
      { key: 'fabrication', label: 'Fabrication', kgCo2e: 3.3 },
      { key: 'usage', label: 'Usage', kgCo2e: 0.98 },
      { key: 'transport', label: 'Transport', kgCo2e: 0.2 },
      { key: 'fin-de-vie', label: 'Fin de vie', kgCo2e: 0.25 },
    ],
    source_co2e: 'Impact CO₂ (ADEME) · T-shirt en coton',
    source_eau: 'Nos Gestes Climat / Ecobalyse (ADEME) · 12,75 m³',
    source_fin_de_vie: 'ADEME · filière textile, réemploi puis recyclage',
    source_url: 'https://impactco2.fr/outils/habillement/tshirtencoton',
  },
  alternatives: [
    {
      nom: 'T-shirt en polyester',
      description: 'Même usage, matière différente',
      co2e_kg: 6.21,
      source: 'Impact CO₂ (ADEME) · T-shirt en polyester',
    },
    {
      nom: 'Le garder 2 ans de plus',
      description: 'Hypothèse durée de vie 5 → 7 ans',
      co2e_kg: 4.59,
      source: 'Calcul : 6,43 × 5/7, durée de vie 5 ans (Impact CO₂ ADEME)',
    },
    {
      nom: 'T-shirt de seconde main',
      description: 'Fabrication non réattribuée',
      co2e_kg: 0.98,
      source: 'Impact CO₂ (ADEME) · poste Usage ; règle CO₂e évité (README)',
    },
  ],
  meilleurChoix: {
    nom: 'T-shirt de seconde main',
    description:
      'Le meilleur choix reste celui que vous gardez : allonger la durée de vie évite la fabrication d’un neuf.',
    co2e_kg: 0.98,
    source: 'Impact CO₂ (ADEME) · poste Usage ; règle CO₂e évité (README)',
  },
  gain_pct: 85,
};
