import { CATEGORIES, ETATS } from '../../shared/categories';

interface Env {
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string;
  ALLOWED_ORIGIN?: string;
}

interface DetectionPayload {
  objet: string;
  categorie: string;
  matiere_principale: string;
  poids_estime_g: number;
  confiance: number;
  etat_apparent: string;
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2026-10-21';

const SYSTEM_PROMPT = `Tu es un classificateur d'objets pour l'application mobile Verso.
Analyse UNIQUEMENT l'image fournie. Réponds avec un objet JSON strict, sans texte autour et sans balises Markdown.
Schéma exact :
{"objet": string, "categorie": string, "matiere_principale": string, "poids_estime_g": number, "confiance": number, "etat_apparent": "neuf"|"usé"|"abîmé"}
Règles :
- "categorie" doit être l'une de ces valeurs : ${CATEGORIES.join(', ')}.
- "objet" : nom court en français, par exemple "T-shirt en coton", "Gourde en inox", "Bocal en verre".
- "matiere_principale" : coton, polyester, acier inoxydable, verre, plastique, aluminium, bois, etc.
- "poids_estime_g" : estimation en grammes, nombre positif.
- "confiance" : nombre entre 0 et 1.
- "etat_apparent" : neuf, usé ou abîmé.
- Ne donne AUCUN chiffre d'impact environnemental (ni CO₂, ni eau, ni note) : ces valeurs viennent d'une base de référence externe.
- Si l'image est floue ou si tu ne peux pas identifier l'objet, mets "confiance" en dessous de 0,6.`;

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };
}

function json(body: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(env) },
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
  const categorie = text(data.categorie, 'Autre', 40);
  const etat = text(data.etat_apparent, 'usé', 12);
  return {
    objet: text(data.objet, 'Objet non identifié', 80),
    categorie: (CATEGORIES as readonly string[]).includes(categorie) ? categorie : 'Autre',
    matiere_principale: text(data.matiere_principale, 'inconnue', 50),
    poids_estime_g: boundedNumber(data.poids_estime_g, 100, 1, 100000),
    confiance: boundedNumber(data.confiance, 0, 0, 1),
    etat_apparent: (ETATS as readonly string[]).includes(etat) ? etat : 'usé',
  };
}

function extractJson(content: unknown): DetectionPayload {
  const blocks = Array.isArray(content) ? content : [];
  const textBlock = blocks
    .filter((block) => isRecord(block) && block.type === 'text')
    .map((block) => String((block as Record<string, unknown>).text ?? ''))
    .join('\n');
  const cleaned = textBlock.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const parsed: unknown = JSON.parse(cleaned);
  return toDetection(parsed);
}

async function callClaude(image: string, mediaType: string, env: Env): Promise<DetectionPayload> {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'Identifie cet objet et réponds uniquement avec le JSON demandé.' },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`vision_provider_${response.status}`);
  const payload: unknown = await response.json();
  return extractJson(isRecord(payload) ? payload.content : []);
}

async function recognize(request: Request, env: Env): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, env, 400);
  }
  if (!isRecord(body) || typeof body.image !== 'string' || !body.image) {
    return json({ error: 'missing_image' }, env, 400);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'server_key_missing' }, env, 503);
  }
  const mediaType = body.mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
  try {
    const detection = await callClaude(body.image, mediaType, env);
    return json({ detection }, env);
  } catch {
    return json({ error: 'recognition_failed' }, env, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/health') return json({ ok: true }, env);
    if (request.method === 'POST' && path === '/recognize') return recognize(request, env);
    return json({ error: 'not_found' }, env, 404);
  },
};
