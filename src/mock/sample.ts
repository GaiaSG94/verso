import type { Detection, ImpactView } from '@/types';

export const sampleDetection: Detection = {
  objet: 'Cotton T-shirt',
  categorie: 'Clothing',
  matiere_principale: 'Cotton',
  poids_estime_g: 180,
  confiance: 0.92,
  etat_apparent: 'worn',
  origine: 'sample',
};

export const sampleImpact: ImpactView = {
  grade: 'C',
  comparaison: 'Compared to other clothing',
  impact: {
    co2e_kg: 6.43,
    eau_l: 12750,
    matiere_kg: 0.18,
    fin_de_vie: 'Textile reuse or recycling first',
    lifecycle: [
      { key: 'matiere', label: 'Material', kgCo2e: 1.7 },
      { key: 'fabrication', label: 'Manufacturing', kgCo2e: 3.3 },
      { key: 'usage', label: 'Use', kgCo2e: 0.98 },
      { key: 'transport', label: 'Transport', kgCo2e: 0.2 },
      { key: 'fin-de-vie', label: 'End of life', kgCo2e: 0.25 },
    ],
    source_co2e: 'Impact CO₂ (ADEME) · Cotton T-shirt',
    source_eau: 'Nos Gestes Climat / Ecobalyse (ADEME) · 12.75 m³',
    source_fin_de_vie: 'ADEME · textile sector, reuse then recycling',
    source_url: 'https://impactco2.fr/outils/habillement/tshirtencoton',
  },
  alternatives: [
    {
      nom: 'Polyester T-shirt',
      description: 'Same use, different material',
      co2e_kg: 6.21,
      source: 'Impact CO₂ (ADEME) · Polyester T-shirt',
    },
    {
      nom: 'Keep it 2 years longer',
      description: 'Lifespan assumption 5 → 7 years',
      co2e_kg: 4.59,
      source: 'Calculation: 6.43 × 5/7, 5-year lifespan (Impact CO₂ ADEME)',
    },
    {
      nom: 'Second-hand T-shirt',
      description: 'Manufacturing not reallocated',
      co2e_kg: 0.98,
      source: 'Impact CO₂ (ADEME) · Use stage; avoided CO₂e rule (README)',
    },
  ],
  meilleurChoix: {
    nom: 'Second-hand T-shirt',
    description:
      'The best choice is the one you keep: extending its lifespan avoids manufacturing a new one.',
    co2e_kg: 0.98,
    source: 'Impact CO₂ (ADEME) · Use stage; avoided CO₂e rule (README)',
  },
  gain_pct: 85,
};
