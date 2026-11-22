import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomBar } from '@/components/Navigation';
import { Card, SectionTitle } from '@/components/ui';
import { kmVoiture } from '@/constants/equivalences';
import { useApp } from '@/context/AppContext';
import { dateFr, kg, moisFr, nombre } from '@/lib/format';
import { colors, font, radius, space } from '@/theme';

const weekly = [2.1, 3.4, 1.2, 4.8];

export default function JournalScreen() {
  const { entries } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);
  const month = new Date();
  month.setMonth(month.getMonth() + monthOffset);
  const monthIso = month.toISOString();

  const avoided = entries.reduce((sum, item) => sum + item.co2eEviteKg, 0);
  const goodDeeds = entries.filter((item) => item.bonGeste).length;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Journal</Text>
          <View style={styles.monthSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois précédent"
              onPress={() => setMonthOffset((v) => v - 1)}
              style={styles.monthArrow}
            >
              <ChevronLeft size={16} color={colors.ink} strokeWidth={2} />
            </Pressable>
            <Text style={styles.monthText}>{moisFr(monthIso)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois suivant"
              onPress={() => setMonthOffset((v) => v + 1)}
              style={styles.monthArrow}
            >
              <ChevronRight size={16} color={colors.ink} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <Card dark style={styles.hero}>
          <Text style={styles.heroLabel}>CO₂e évité ce mois-ci</Text>
          <Text style={styles.heroValue}>{kg(avoided)} kg</Text>
          <Text style={styles.heroEquivalent}>≈ {nombre(kmVoiture(avoided))} km en voiture</Text>
          <View style={styles.weekChart}>
            {weekly.map((value, index) => (
              <View key={index} style={styles.weekColumn}>
                <View
                  accessible
                  accessibilityLabel={`Semaine ${index + 1} : ${kg(value)} kilogrammes évités`}
                  style={[
                    styles.weekBar,
                    { height: 14 + value * 8 },
                    index === weekly.length - 1 && styles.weekBarCurrent,
                  ]}
                />
              </View>
            ))}
          </View>
          <Text style={styles.weekLegend}>S1 · S2 · S3 · S4 (en cours)</Text>
        </Card>

        <View style={styles.counters}>
          <Card style={styles.counter}>
            <Text style={styles.counterValue}>{nombre(entries.length)}</Text>
            <Text style={styles.counterLabel}>Objets scannés</Text>
          </Card>
          <Card style={styles.counter}>
            <Text style={styles.counterValue}>{nombre(goodDeeds)}</Text>
            <Text style={styles.counterLabel}>Bons gestes</Text>
          </Card>
        </View>

        <View style={styles.spacer} />
        <SectionTitle>Derniers scans</SectionTitle>
        {entries.map((entry) => (
          <Card key={entry.id} style={styles.entry}>
            <View style={[styles.gradeDot, { backgroundColor: colors.grade[entry.grade].background }]}>
              <Text style={[styles.gradeLetter, { color: colors.grade[entry.grade].text }]}>
                {entry.grade}
              </Text>
            </View>
            <View style={styles.entryBody}>
              <Text style={styles.entryName}>{entry.objet}</Text>
              <Text style={styles.entryAction}>{entry.action}</Text>
              <Text style={styles.entryDate}>{dateFr(entry.date)} · {entry.categorie}</Text>
            </View>
            {entry.bonGeste ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Bon geste</Text>
              </View>
            ) : null}
          </Card>
        ))}
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg, gap: space.sm },
  title: { fontFamily: font.title, fontSize: 26, color: colors.ink },
  monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 4, paddingVertical: 2 },
  monthArrow: { width: 30, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontFamily: font.medium, fontSize: 11, color: colors.ink, textTransform: 'capitalize', minWidth: 88, textAlign: 'center' },
  hero: { padding: space.xl },
  heroLabel: { fontFamily: font.medium, fontSize: 12, color: '#C6D0C9' },
  heroValue: { fontFamily: font.mono, fontSize: 40, color: colors.lime, marginTop: space.sm },
  heroEquivalent: { fontFamily: font.body, fontSize: 12, color: '#C6D0C9', marginTop: space.sm },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, height: 70, marginTop: space.lg },
  weekColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  weekBar: { width: '70%', maxWidth: 26, backgroundColor: colors.lifecycle[3], borderRadius: 6 },
  weekBarCurrent: { backgroundColor: colors.lime },
  weekLegend: { fontFamily: font.body, fontSize: 10, color: '#C6D0C9', marginTop: space.sm, textAlign: 'center' },
  counters: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  counter: { flex: 1, alignItems: 'center' },
  counterValue: { fontFamily: font.mono, fontSize: 26, color: colors.ink },
  counterLabel: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: 4 },
  spacer: { height: space.lg },
  entry: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  gradeDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  gradeLetter: { fontFamily: font.title, fontSize: 16 },
  entryBody: { flex: 1 },
  entryName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  entryAction: { fontFamily: font.body, fontSize: 11, color: colors.secondary, marginTop: 2 },
  entryDate: { fontFamily: font.body, fontSize: 10, color: colors.secondary, marginTop: 2, textTransform: 'capitalize' },
  badge: { backgroundColor: colors.lime, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 4 },
  badgeText: { fontFamily: font.semibold, fontSize: 10, color: colors.ink },
});
