import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomBar } from '@/components/Navigation';
import { Card } from '@/components/ui';
import { kmVoiture } from '@/constants/equivalences';
import { useApp } from '@/context/AppContext';
import { dateFr, kg, moisFr, nombre } from '@/lib/format';
import { colors, font, radius, space } from '@/theme';
import type { ScanEntry } from '@/types';

function weeklyTotals(entries: ScanEntry[], month: Date): number[] {
  const buckets = [0, 0, 0, 0];
  for (const entry of entries) {
    const date = new Date(entry.date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      continue;
    }
    const index = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
    buckets[index] += entry.co2eEviteKg;
  }
  return buckets;
}

export default function JournalScreen() {
  const { entries } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);
  const month = new Date();
  month.setMonth(month.getMonth() + monthOffset);

  const monthly = entries.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  });
  const avoided = monthly.reduce((sum, item) => sum + item.co2eEviteKg, 0);
  const goodDeeds = monthly.filter((item) => item.bonGeste).length;
  const weekly = weeklyTotals(monthly, month);
  const currentWeek = Math.min(Math.floor((new Date().getDate() - 1) / 7), 3);
  const maxWeek = Math.max(...weekly, 0.1);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Journal</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change month"
            onPress={() => setMonthOffset((value) => value + 1)}
            style={styles.monthSelector}
          >
            <Text style={styles.monthText}>{moisFr(month.toISOString())}</Text>
            <ChevronDown size={14} color={colors.ink} strokeWidth={2} />
          </Pressable>
        </View>

        <Card dark style={styles.hero}>
          <Text style={styles.heroLabel}>CO₂e avoided this month</Text>
          <View style={styles.heroFigure}>
            <Text style={styles.heroValue}>{kg(avoided, 1)}</Text>
            <Text style={styles.heroUnit}>kg</Text>
          </View>
          <Text style={styles.heroEquivalent}>
            ≈ {nombre(kmVoiture(avoided))} km by car not travelled
          </Text>
          <View style={styles.weekChart}>
            {weekly.map((value, index) => {
              const active = monthOffset === 0 && index === currentWeek;
              return (
                <View key={index} style={styles.weekColumn}>
                  <View
                    accessible
                    accessibilityLabel={`Week ${index + 1}: ${kg(value)} kilograms avoided`}
                    style={[
                      styles.weekBar,
                      { height: Math.max((value / maxWeek) * 66, 8) },
                      active ? styles.weekBarCurrent : styles.weekBarPast,
                    ]}
                  />
                  <Text style={[styles.weekLabel, active && styles.weekLabelCurrent]}>W{index + 1}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.counters}>
          <Card style={styles.counter}>
            <Text style={styles.counterValue}>{nombre(entries.length)}</Text>
            <Text style={styles.counterLabel}>objects scanned</Text>
          </Card>
          <Card style={styles.counter}>
            <Text style={styles.counterValue}>{nombre(goodDeeds)}</Text>
            <Text style={styles.counterLabel}>good deeds</Text>
          </Card>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Recent scans</Text>
        <Card style={styles.scanList}>
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.scanRow, index === entries.length - 1 && styles.scanRowLast]}
            >
              <View
                style={[styles.gradeDot, { backgroundColor: colors.grade[entry.grade].background }]}
              >
                <Text style={[styles.gradeLetter, { color: colors.grade[entry.grade].text }]}>
                  {entry.grade}
                </Text>
              </View>
              <View style={styles.entryBody}>
                <Text style={styles.entryName}>{entry.objet}</Text>
                <Text style={styles.entryAction}>
                  {entry.action} · {dateFr(entry.date)}
                </Text>
              </View>
              {entry.bonGeste ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Good deed</Text>
                </View>
              ) : null}
            </View>
          ))}
        </Card>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  title: { fontFamily: font.title, fontSize: 28, color: colors.ink },
  monthSelector: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: { fontFamily: font.medium, fontSize: 13, color: colors.ink, textTransform: 'capitalize' },
  hero: { borderRadius: radius.bigCard, gap: space.sm },
  heroLabel: { fontFamily: font.body, fontSize: 13, color: colors.softText },
  heroFigure: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  heroValue: { fontFamily: font.mono, fontSize: 44, color: colors.lime, letterSpacing: -1 },
  heroUnit: { fontFamily: font.semibold, fontSize: 18, color: colors.paper },
  heroEquivalent: { fontFamily: font.body, fontSize: 13, color: colors.softText },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 92, marginTop: space.md },
  weekColumn: { flex: 1, height: '100%', alignItems: 'stretch', justifyContent: 'flex-end', gap: 6 },
  weekBar: { borderRadius: 6, minHeight: 8 },
  weekBarPast: { backgroundColor: colors.lifecycle[1] },
  weekBarCurrent: { backgroundColor: colors.lime },
  weekLabel: { fontFamily: font.body, fontSize: 11, color: colors.softText, textAlign: 'center' },
  weekLabelCurrent: { fontFamily: font.semibold, color: colors.paper },
  counters: { flexDirection: 'row', gap: 10, marginTop: space.md },
  counter: { flex: 1, gap: 2 },
  counterValue: { fontFamily: font.mono, fontSize: 22, color: colors.ink },
  counterLabel: { fontFamily: font.body, fontSize: 12, color: colors.secondary },
  spacer: { height: space.lg },
  sectionTitle: { fontFamily: font.subtitle, fontSize: 16, color: colors.ink, marginBottom: space.md },
  scanList: { paddingHorizontal: space.md, paddingVertical: 0, overflow: 'hidden' },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9E0',
  },
  scanRowLast: { borderBottomWidth: 0 },
  gradeDot: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  gradeLetter: { fontFamily: font.title, fontSize: 15 },
  entryBody: { flex: 1 },
  entryName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  entryAction: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: 1 },
  badge: { backgroundColor: colors.lime, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontFamily: font.semibold, fontSize: 11, color: colors.ink },
});
