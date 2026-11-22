export interface ProductInfo {
  nom: string;
  categorie: string;
  matiere_principale: string;
  poids_estime_g: number;
  code: string;
  source: string;
}

export async function lookupBarcode(_code: string): Promise<ProductInfo | null> {
  return null;
}
