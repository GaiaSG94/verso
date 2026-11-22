export interface ProductInfo {
  nom: string;
  categorie: string;
  matiere_principale: string;
  poids_estime_g: number;
  code: string;
  source: string;
}

const BASE_URLS = [
  'https://world.openproductsfacts.org/api/v2/product/',
  'https://world.openfoodfacts.org/api/v2/product/',
];

async function fetchProduct(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Verso/1.0 (contact: verso-app)' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null) return null;
    const data = payload as { status?: number; product?: unknown };
    if (data.status !== 1 || typeof data.product !== 'object' || data.product === null) return null;
    return data.product as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function mapProduct(product: Record<string, unknown>, code: string): ProductInfo | null {
  const nom = String(product.product_name ?? product.generic_name ?? '').trim();
  if (!nom) return null;
  const text = nom.toLowerCase();
  const quantite = Number(product.product_quantity) || 500;
  const source = 'Open Food Facts / Open Products Facts';

  if (text.includes('eau') || text.includes('water') || text.includes('boisson')) {
    return {
      nom,
      categorie: 'Container',
      matiere_principale: 'PET plastic',
      poids_estime_g: Math.round(quantite * 1.05),
      code,
      source,
    };
  }
  if (text.includes('verre') || text.includes('bocal') || text.includes('jar')) {
    return {
      nom,
      categorie: 'Container',
      matiere_principale: 'Glass',
      poids_estime_g: 350,
      code,
      source,
    };
  }
  return null;
}

export async function lookupBarcode(code: string): Promise<ProductInfo | null> {
  if (!/^\d{8,14}$/.test(code)) return null;
  for (const base of BASE_URLS) {
    const product = await fetchProduct(`${base}${encodeURIComponent(code)}`);
    if (!product) continue;
    const mapped = mapProduct(product, code);
    if (mapped) return mapped;
  }
  return null;
}
