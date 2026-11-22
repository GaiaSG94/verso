import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { sampleDetection } from '@/mock/sample';
import { kg } from '@/lib/format';
import { resolveImpact } from '@/lib/impact';
import { loadEntries, saveEntries } from '@/lib/storage';
import type { Detection, ImpactView, ScanEntry } from '@/types';

interface AppContextValue {
  detection: Detection | null;
  impact: ImpactView | null;
  entries: ScanEntry[];
  setDetection: (detection: Detection) => void;
  recordScan: (detection: Detection, impact: ImpactView) => void;
  recordGoodDeed: (action: string, co2eEviteKg: number) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const seedImpact = resolveImpact(sampleDetection);

const seedEntry: ScanEntry = {
  id: 'exemple-1',
  date: new Date().toISOString(),
  objet: sampleDetection.objet,
  categorie: sampleDetection.categorie,
  grade: seedImpact.grade,
  co2e_kg: seedImpact.impact.co2e_kg,
  action: 'Demo scan',
  bonGeste: false,
  co2eEviteKg: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [detection, setDetectionState] = useState<Detection | null>(sampleDetection);
  const [impact, setImpact] = useState<ImpactView | null>(seedImpact);
  const [entries, setEntries] = useState<ScanEntry[]>([seedEntry]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadEntries()
      .then((saved) => {
        if (saved.length > 0) setEntries(saved);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void saveEntries(entries);
  }, [entries, hydrated]);

  const setDetection = useCallback((next: Detection) => {
    setDetectionState(next);
    setImpact(resolveImpact(next));
  }, []);

  const recordScan = useCallback((next: Detection, view: ImpactView) => {
    setDetectionState(next);
    setImpact(view);
    setEntries((current) => [
      {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        objet: next.objet,
        categorie: next.categorie,
        grade: view.grade,
        co2e_kg: view.impact.co2e_kg,
        action: `Scan ${kg(view.impact.co2e_kg)} kg CO₂e`,
        bonGeste: false,
        co2eEviteKg: 0,
      },
      ...current,
    ]);
  }, []);

  const recordGoodDeed = useCallback((action: string, co2eEviteKg: number) => {
    setEntries((current) =>
      current.map((entry, index) =>
        index === 0
          ? { ...entry, action, bonGeste: true, co2eEviteKg }
          : entry,
      ),
    );
  }, []);

  const reset = useCallback(() => {
    setDetectionState(null);
    setImpact(null);
  }, []);

  const value = useMemo(
    () => ({ detection, impact, entries, setDetection, recordScan, recordGoodDeed, reset }),
    [detection, impact, entries, setDetection, recordScan, recordGoodDeed, reset],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
