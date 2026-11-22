import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GradeBadge } from '@/components/Grade';
import { ScreenHeader } from '@/components/Navigation';
import { Button, Card, SectionTitle, SourceNote } from '@/components/ui';
import { avoidedCo2e } from '@/lib/avoided';
import { kg, nombre } from '@/lib/format';
import { gradeFor } from '@/lib/grade';
import { useApp } from '@/context/AppContext';
import { colors, font, radius, space } from '@/theme';
import type { Alternative } from '@/types';

const barColors = ['#E58A3A', '#E3B341', '#3F7F4C', '#1E6B52'];

export default function AlternativesScreen() {
  const { detection, impact, reset, recordGoodDeed } = useApp();
  if (!detection || !impact) return null;

  const current = impact.impact.co2e_kg;
  const rows = [
    { nom: detection.objet, co2e_kg: current, actuel: true },
    ...impact.alternatives.map((item) => ({ ...item, actuel: false })),
  ];
  const max = Math.max(...rows.map((row) => row.co2e_kg), 0.01);

  const choose = () => {
    recordGoodDeed(
      `Alternative : ${impact.meilleurChoix.nom}`,
      avoidedCo2e(current, 'secondeMain'),
    );
    router.push('/fin-de-vie');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Alternatives" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Même usage, moins d’impact</Text>
          <Text style={styles.subtitle}>Carbone pour un objet équivalent.</Text>
        </View>

        <Card style={styles.compareCard}>
          {rows.map((row, index) => (
            <BarRow key={`${row.nom}-${index}`} row={row} max={max} color={barColors[Math.min(index, 3)]} />
          ))}
          <SourceNote text="Sources : Impact CO₂ (ADEME) et règles documentées dans le README." />
        </Card>

        <View style={styles.spacer} />
        <Card dark style={styles.bestCard}>
          <View style={styles.bestHead}>
            <GradeBadge grade="A" size={44} outlined />
            <View style={styles.bestHeadText}>
              <Text style={styles.bestEyebrow}>Meilleur choix</Text>
              <Text style={styles.bestName}>{impact.meilleurChoix.nom}</Text>
            </View>
            <Text style={styles.bestGain}>−{nombre(impact.gain_pct)} %</Text>
          </View>
          <Text style={styles.bestDescription}>{impact.meilleurChoix.description}</Text>
          <SourceNote text={impact.meilleurChoix.source} />
          <Button
            label="Trouver près de moi"
            variant="lime"
            onPress={choose}
            accessibilityLabel="Choisir cette alternative et trouver un point près de moi"
          />
        </Card>

        <View style={styles.spacer} />
        <SectionTitle>Autres options</SectionTitle>
        {impact.alternatives
          .filter((item) => item.nom !== impact.meilleurChoix.nom)
          .map((item) => (
            <CompactRow key={item.nom} item={item} categorie={detection.categorie} current={current} />
          ))}

        <View style={styles.spacer} />
        <Button
          label="Scanner un autre objet"
          variant="outline"
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
  color,
}: {
  row: { nom: string; co2e_kg: number; actuel: boolean };
  max: number;
  color: string;
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
            { width: `${Math.max((row.co2e_kg / max) * 100, 3)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function CompactRow({
  item,
  categorie,
  current,
}: {
  item: Alternative;
  categorie: string;
  current: number;
}) {
  const gain = Math.round(((current - item.co2e_kg) / current) * 100);
  return (
    <Card style={styles.compact}>
      <GradeBadge grade={gradeFor(item.co2e_kg, categorie)} size={36} />
      <View style={styles.compactBody}>
        <Text style={styles.compactName}>{item.nom}</Text>
        <Text style={styles.compactSource}>{item.description}</Text>
      </View>
      <Text style={styles.compactGain}>−{nombre(gain)} %</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  titleBlock: { gap: 4, marginBottom: space.md },
  title: { fontFamily: font.title, fontSize: 26, color: colors.ink, lineHeight: 30 },
  subtitle: { fontFamily: font.body, fontSize: 14, color: colors.secondary },
  compareCard: { borderRadius: radius.bigCard, gap: space.md },
  barRow: { gap: 6 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  barLabel: { fontFamily: font.body, fontSize: 13, color: colors.ink, flex: 1 },
  barLabelCurrent: { fontFamily: font.semibold },
  barValue: { fontFamily: font.mono, fontSize: 13, color: colors.ink },
  barTrack: { height: 12, backgroundColor: colors.track, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: 12, borderRadius: 6 },
  bestCard: { borderRadius: radius.bigCard, gap: space.md },
  bestHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bestHeadText: { flex: 1 },
  bestEyebrow: { fontFamily: font.semibold, fontSize: 11, color: colors.lime, letterSpacing: 1, textTransform: 'uppercase' },
  bestName: { fontFamily: font.subtitle, fontSize: 18, color: colors.card, marginTop: 2 },
  bestGain: { fontFamily: font.mono, fontSize: 18, color: colors.lime },
  bestDescription: { fontFamily: font.body, fontSize: 13, color: '#C9D1CC' },
  compact: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: 10 },
  compactBody: { flex: 1 },
  compactName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  compactSource: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: 2 },
  compactGain: { fontFamily: font.mono, fontSize: 14, color: colors.ink },
  spacer: { height: space.xl },
});
