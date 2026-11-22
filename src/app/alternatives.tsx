import { ArrowRight, Leaf } from 'lucide-react-native';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GradeBadge } from '@/components/Grade';
import { ScreenHeader } from '@/components/Navigation';
import { Button, Card, SectionTitle, SourceNote } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { kg, nombre } from '@/lib/format';
import { colors, font, radius, space } from '@/theme';
import type { Alternative } from '@/types';

export default function AlternativesScreen() {
  const { detection, impact, reset } = useApp();
  if (!detection || !impact) return null;

  const current = impact.impact.co2e_kg;
  const rows = [
    { nom: detection.objet, co2e_kg: current, source: impact.impact.source_co2e, actuel: true },
    ...impact.alternatives.map((item) => ({ ...item, actuel: false })),
  ];
  const max = Math.max(...rows.map((row) => row.co2e_kg), 0.01);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Alternatives" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Même usage, moins d’impact</Text>
        <Text style={styles.subtitle}>Comparaison du CO₂e sur le cycle de vie, en kg.</Text>

        <Card>
          {rows.map((row, index) => (
            <BarRow key={`${row.nom}-${index}`} row={row} max={max} />
          ))}
          <SourceNote text="Sources : Impact CO₂ (ADEME) et règles documentées dans le README." />
        </Card>

        <View style={styles.spacer} />
        <SectionTitle>Le meilleur choix</SectionTitle>
        <Card dark style={styles.bestCard}>
          <View style={styles.bestHead}>
            <GradeBadge grade="A" size={56} />
            <View style={styles.bestHeadText}>
              <Text style={styles.bestName}>{impact.meilleurChoix.nom}</Text>
              <Text style={styles.bestGain}>−{nombre(impact.gain_pct)} % de CO₂e</Text>
            </View>
          </View>
          <Text style={styles.bestDescription}>{impact.meilleurChoix.description}</Text>
          <Text style={styles.bestFigure}>
            {kg(impact.meilleurChoix.co2e_kg)} kg CO₂e
          </Text>
          <SourceNote text={impact.meilleurChoix.source} />
          <Button
            label="Trouver près de moi"
            variant="lime"
            onPress={() => router.push('/fin-de-vie')}
            accessibilityLabel="Trouver une option près de chez moi"
          />
        </Card>

        <View style={styles.spacer} />
        <SectionTitle>Autres options</SectionTitle>
        {impact.alternatives
          .filter((item) => item.nom !== impact.meilleurChoix.nom)
          .map((item) => (
            <CompactRow key={item.nom} item={item} />
          ))}

        <View style={styles.spacer} />
        <Button
          label="Scanner un autre objet"
          onPress={() => {
            reset();
            router.push('/');
          }}
          accessibilityLabel="Revenir au scanner pour un nouvel objet"
        />
      </ScrollView>
    </View>
  );
}

function BarRow({
  row,
  max,
}: {
  row: { nom: string; co2e_kg: number; actuel: boolean };
  max: number;
}) {
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelRow}>
        <Text style={[styles.barLabel, row.actuel && styles.barLabelCurrent]}>{row.nom}</Text>
        <Text style={styles.barValue}>{kg(row.co2e_kg)} kg</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          accessible
          accessibilityLabel={`${row.nom} : ${kg(row.co2e_kg)} kilogrammes CO₂e`}
          style={[
            styles.barFill,
            { width: `${Math.max((row.co2e_kg / max) * 100, 3)}%` },
            row.actuel && styles.barFillCurrent,
          ]}
        />
      </View>
    </View>
  );
}

function CompactRow({ item }: { item: Alternative }) {
  return (
    <Card style={styles.compact}>
      <View style={styles.compactIcon}>
        <Leaf size={18} color={colors.ink} strokeWidth={1.8} />
      </View>
      <View style={styles.compactBody}>
        <Text style={styles.compactName}>{item.nom}</Text>
        <Text style={styles.compactSource}>{item.description}</Text>
      </View>
      <View style={styles.compactRight}>
        <Text style={styles.compactValue}>{kg(item.co2e_kg)}</Text>
        <Text style={styles.compactUnit}>kg CO₂e</Text>
        <ArrowRight size={14} color={colors.secondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontFamily: font.title, fontSize: 23, color: colors.ink },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.secondary, marginTop: space.sm, marginBottom: space.xl },
  barRow: { marginBottom: space.lg },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontFamily: font.medium, fontSize: 12, color: colors.secondary, flex: 1 },
  barLabelCurrent: { color: colors.ink, fontFamily: font.semibold },
  barValue: { fontFamily: font.mono, fontSize: 12, color: colors.ink },
  barTrack: { height: 14, backgroundColor: colors.paper, borderRadius: 7, marginTop: space.sm, overflow: 'hidden' },
  barFill: { height: 14, borderRadius: 7, backgroundColor: colors.lifecycle[2] },
  barFillCurrent: { backgroundColor: colors.ink },
  bestCard: { padding: space.xl },
  bestHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bestHeadText: { flex: 1 },
  bestName: { fontFamily: font.title, fontSize: 18, color: colors.card },
  bestGain: { fontFamily: font.mono, fontSize: 16, color: colors.lime, marginTop: 4 },
  bestDescription: { fontFamily: font.body, fontSize: 13, color: '#C6D0C9', marginTop: space.lg },
  bestFigure: { fontFamily: font.mono, fontSize: 22, color: colors.lime, marginTop: space.md },
  compact: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  compactIcon: { width: 38, height: 38, borderRadius: radius.small, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  compactBody: { flex: 1 },
  compactName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  compactSource: { fontFamily: font.body, fontSize: 11, color: colors.secondary, marginTop: 2 },
  compactRight: { alignItems: 'flex-end' },
  compactValue: { fontFamily: font.mono, fontSize: 14, color: colors.ink },
  compactUnit: { fontFamily: font.body, fontSize: 10, color: colors.secondary },
  spacer: { height: space.xl },
});
