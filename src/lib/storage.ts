import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ScanEntry } from '@/types';

const KEY = '@verso/journal:v1';

function isEntry(value: unknown): value is ScanEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<ScanEntry>;
  return typeof entry.id === 'string' && typeof entry.objet === 'string' && typeof entry.date === 'string';
}

export async function loadEntries(): Promise<ScanEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: ScanEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    return;
  }
}
