export function nombre(value: number, digits = 0): string {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return rounded.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function kg(value: number, digits = 2): string {
  return nombre(value, digits);
}

export function dateFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export function moisFr(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
}
