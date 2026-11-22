import { API_URL } from '@/constants/config';
import type { Detection } from '@/types';

interface RawDetection {
  objet?: unknown;
  categorie?: unknown;
  matiere_principale?: unknown;
  poids_estime_g?: unknown;
  confiance?: unknown;
  etat_apparent?: unknown;
}

function clean(raw: RawDetection): Detection {
  const etat = raw.etat_apparent;
  return {
    objet: String(raw.objet ?? 'Unidentified object').slice(0, 80),
    categorie: String(raw.categorie ?? 'Other').slice(0, 40),
    matiere_principale: String(raw.matiere_principale ?? 'unknown').slice(0, 50),
    poids_estime_g: Number(raw.poids_estime_g) || 100,
    confiance: Math.min(Math.max(Number(raw.confiance) || 0, 0), 1),
    etat_apparent:
      etat === 'new' || etat === 'worn' || etat === 'damaged' ? etat : 'worn',
    origine: 'photo',
  };
}

export async function recognizeImage(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<Detection> {
  const response = await fetch(`${API_URL}/recognize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image: base64, mediaType }),
  });
  if (!response.ok) throw new Error(`recognition_${response.status}`);
  const payload: unknown = await response.json();
  if (typeof payload !== 'object' || payload === null) throw new Error('bad_response');
  const detection = (payload as { detection?: RawDetection }).detection;
  if (!detection) throw new Error('bad_response');
  return clean(detection);
}
