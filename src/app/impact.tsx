import { Droplets, Package, Recycle, Shirt } from 'lucide-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { GradeBadge, GradeScale } from '@/components/Grade';
import { ScreenHeader } from '@/components/Navigation';
import { Button, Card, SectionTitle, SourceNote } from '@/components/ui';
import { kmVoiture, nombreDouches } from '@/constants/equivalences';
import { useApp } from '@/context/AppContext';
import { kg, nombre } from '@/lib/format';
import { colors, font, gradeLabels, radius, space } from '@/theme';

export default function ImpactScreen() {
  const { detection, impact } = useApp();
  if (!detection || !impact) return null;
  const { co2e_kg, eau_l, matiere_kg } = impact.impact;

  const share = () =>
    Share.share({
      message: `${detection.objet}: ${kg(co2e_kg)} kg CO₂e, grade ${impact.grade}. ADEME estimates via Verso.`,
    });

  return (
    <View style={styles.root}>
      <ScreenHeader title="Environmental impact" share onShare={share} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.hero}>
          <View style={styles.thumb}>
            <Shirt size={34} color={colors.ink} strokeWidth={1.8} />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroName}>{detection.objet}</Text>
            <Text style={styles.heroMeta}>
              {detection.categorie} · {detection.matiere_principale} · {detection.poids_estime_g} g
            </Text>
          </View>
        </Card>

        <Card dark style={styles.gradeCard}>
          <View style={styles.gradeRow}>
            <GradeBadge grade={impact.grade} size={60} />
            <View style={styles.gradeCopy}>
              <Text style={styles.gradeTitle}>{gradeLabels[impact.grade]}</Text>
              <Text style={styles.gradeSubtitle}>{impact.comparaison}</Text>
            </View>
          </View>
          <GradeScale current={impact.grade} />
        </Card>

        <SectionTitle>In numbers</SectionTitle>
        <View style={styles.grid}>
          <MetricCard
            icon={<Shirt size={18} color={colors.ink} />}
            label="Carbon"
            value={`${kg(co2e_kg)} kg`}
            unit="CO₂e"
            detail={`≈ ${nombre(kmVoiture(co2e_kg))} km by car`}
          />
          <MetricCard
            icon={<Droplets size={18} color={colors.ink} />}
            label="Water"
            value={eau_l === null ? '—' : nombre(eau_l)}
            unit={eau_l === null ? '' : 'L'}
            detail={eau_l === null ? 'Data unavailable' : `≈ ${nombre(nombreDouches(eau_l))} showers`}
          />
          <MetricCard
            icon={<Package size={18} color={colors.ink} />}
            label="Material"
            value={detection.matiere_principale}
            unit=""
            detail={`${nombre(matiere_kg * 1000)} g estimated`}
            textValue
          />
          <MetricCard
            icon={<Recycle size={18} color={colors.ink} />}
            label="End of life"
            value="Textile collection point"
            unit=""
            detail={impact.impact.fin_de_vie}
            textValue
          />
        </View>
        <SourceNote text={`${impact.impact.source_co2e} ; ${impact.impact.source_eau}`} />

        <View style={styles.spacer} />
        <SectionTitle>Where does the carbon go?</SectionTitle>
        <Card>
          <LifecycleBar stages={impact.impact.lifecycle} total={co2e_kg} />
        </Card>
        <SourceNote text={impact.impact.source_co2e} />

        <View style={styles.spacer} />
        <View style={styles.actionsRow}>
          <View style={styles.actionHalf}>
            <Button
              label="How to dispose of it"
              variant="outline"
              onPress={() => router.push('/fin-de-vie')}
              accessibilityLabel="See how to dispose of this object"
            />
          </View>
          <View style={styles.actionHalf}>
            <Button label="Alternatives" onPress={() => router.push('/alternatives')} />
          </View>
        </View>
        <Text style={styles.footerSource}>
          Average estimate · source: {impact.impact.source_co2e}
        </Text>
      </ScrollView>
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  detail,
  textValue = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  detail: string;
  textValue?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricHead}>
        {icon}
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, textValue && styles.metricValueText]}>
        {value} <Text style={styles.metricUnit}>{unit}</Text>
      </Text>
      <Text style={styles.metricDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

function LifecycleBar({
  stages,
  total,
}: {
  stages: { key: string; label: string; kgCo2e: number }[];
  total: number;
}) {
  return (
    <View>
      <View style={styles.bar}>
        {stages.map((stage, index) => (
          <View
            key={stage.key}
            accessible
            accessibilityLabel={`${stage.label}: ${kg(stage.kgCo2e)} kg CO₂e`}
            style={{
              width: `${(stage.kgCo2e / total) * 100}%`,
              height: 22,
              backgroundColor: colors.lifecycle[index],
            }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {stages.map((stage, index) => (
          <View key={stage.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.lifecycle[index] }]} />
            <Text style={styles.legendText}>{stage.label}</Text>
            <Text style={styles.legendValue}>
              {nombre(Math.round((stage.kgCo2e / total) * 100))} %
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  thumb: { width: 62, height: 62, borderRadius: radius.card, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1 },
  heroName: { fontFamily: font.title, fontSize: 19, color: colors.ink },
  heroMeta: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: 4 },
  gradeCard: { marginTop: space.md, borderRadius: radius.bigCard },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  gradeCopy: { flex: 1 },
  gradeTitle: { fontFamily: font.subtitle, fontSize: 20, color: colors.card },
  gradeSubtitle: { fontFamily: font.body, fontSize: 13, color: colors.softText, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  metric: { width: '47%', backgroundColor: colors.card, borderRadius: radius.card, padding: space.md, minHeight: 132 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  metricLabel: { fontFamily: font.semibold, fontSize: 12, color: colors.secondary },
  metricValue: { fontFamily: font.mono, fontSize: 21, color: colors.ink, marginTop: space.md },
  metricValueText: { fontFamily: font.subtitle, fontSize: 18 },
  metricUnit: { fontFamily: font.body, fontSize: 12, color: colors.secondary },
  metricDetail: { fontFamily: font.body, fontSize: 11, color: colors.secondary, marginTop: space.sm },
  bar: { flexDirection: 'row', height: 22, borderRadius: 11, overflow: 'hidden' },
  legend: { marginTop: space.md, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  legendRow: { width: '31%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontFamily: font.body, fontSize: 12, color: '#39433D', flex: 1 },
  legendValue: { fontFamily: font.mono, fontSize: 12, color: '#39433D' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionHalf: { flex: 1 },
  footerSource: { fontFamily: font.body, fontSize: 12, color: colors.secondary, textAlign: 'center', marginTop: space.md },
  spacer: { height: space.xl },
});
