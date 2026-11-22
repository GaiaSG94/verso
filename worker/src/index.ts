import { CATEGORIES, ETATS } from '../../shared/categories';

interface Env {
  INFERHUB_BASE_URL?: string;
  INFERHUB_MODEL?: string;
  INFERHUB_API_KEY?: string;
}

interface DetectionPayload {
  objet: string;
  categorie: string;
  matiere_principale: string;
  poids_estime_g: number;
  confiance: number;
  etat_apparent: string;
}

const DEFAULT_BASE_URL = 'https://api.inferhub.dev/v1';
const DEFAULT_MODEL = 'combo/cheap';

const CATEGORY_LIST: readonly string[] = Array.isArray(CATEGORIES) ? CATEGORIES : ['Other'];
const ETAT_LIST: readonly string[] = Array.isArray(ETATS) ? ETATS : ['new', 'worn', 'damaged'];
const FALLBACK_CATEGORY: string = CATEGORY_LIST[CATEGORY_LIST.length - 1] ?? 'Other';
const FALLBACK_ETAT: string = ETAT_LIST[1] ?? 'worn';

const SYSTEM_PROMPT = `You are an object classifier for the Verso mobile app.
Analyze ONLY the provided image. Respond with a single strict JSON object, with no surrounding text and no Markdown fences.
Exact schema:
{"objet": string, "categorie": string, "matiere_principale": string, "poids_estime_g": number, "confiance": number, "etat_apparent": "${ETAT_LIST.join('"|"')}"}
Rules:
- "categorie" must be one of the values in the shared category list: ${CATEGORY_LIST.join(', ')}.
- "objet": a short name in English, for example "Cotton T-shirt", "Stainless steel bottle", "Glass jar".
- "matiere_principale": the main material, e.g. cotton, polyester, stainless steel, glass, plastic, aluminium, wood, etc.
- "poids_estime_g": estimated weight in grams, a positive number.
- "confiance": a number between 0 and 1.
- "etat_apparent": one of ${ETAT_LIST.join(', ')}.
- Do NOT provide any environmental impact figures (no CO₂, water, or score): those values come from an external reference database.
- If the image is blurry or you cannot identify the object, set "confiance" below 0.6.`;

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, fallback: string, max: number): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback;
}

function toDetection(raw: unknown): DetectionPayload {
  const data = isRecord(raw) ? raw : {};
  const categorie = text(data.categorie, FALLBACK_CATEGORY, 40);
  const etat = text(data.etat_apparent, FALLBACK_ETAT, 12);
  return {
    objet: text(data.objet, 'Unidentified object', 80),
    categorie: CATEGORY_LIST.includes(categorie) ? categorie : FALLBACK_CATEGORY,
    matiere_principale: text(data.matiere_principale, 'unknown', 50),
    poids_estime_g: boundedNumber(data.poids_estime_g, 100, 1, 100000),
    confiance: boundedNumber(data.confiance, 0, 0, 1),
    etat_apparent: ETAT_LIST.includes(etat) ? etat : FALLBACK_ETAT,
  };
}

function extractJson(content: unknown): DetectionPayload {
  const raw = typeof content === 'string' ? content : JSON.stringify(content ?? '');
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const parsed: unknown = JSON.parse(cleaned);
  return toDetection(parsed);
}

async function callInferHub(image: string, mediaType: string, env: Env): Promise<DetectionPayload> {
  const base = (env.INFERHUB_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (env.INFERHUB_API_KEY) headers.Authorization = `Bearer ${env.INFERHUB_API_KEY}`;

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: env.INFERHUB_MODEL ?? DEFAULT_MODEL,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this object and respond only with the requested JSON.' },
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${image}` },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`vision_provider_${response.status}`);
  const payload: unknown = await response.json();
  const choices = isRecord(payload) ? payload.choices : [];
  const first = Array.isArray(choices) && isRecord(choices[0]) ? choices[0] : {};
  const message = isRecord(first.message) ? first.message : {};
  return extractJson(message.content);
}

async function recognize(request: Request, env: Env): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!isRecord(body) || typeof body.image !== 'string' || !body.image) {
    return json({ error: 'missing_image' }, 400);
  }
  const mediaType = body.mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
  try {
    return json({ detection: await callInferHub(body.image, mediaType, env) });
  } catch {
    return json({ error: 'recognition_failed' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/health') return json({ ok: true });
    if (request.method === 'POST' && path === '/recognize') return recognize(request, env);
    return json({ error: 'not_found' }, 404);
  },
};
