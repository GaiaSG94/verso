import { AlertTriangle, Check, Gift, MapPin, Wrench } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CollectionPoint } from '@/components/MiniMap';
import { ScreenHeader } from '@/components/Navigation';
import { Button, Pill } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { kg } from '@/lib/format';
import { actionAvoided } from '@/lib/impact';
import { colors, font, radius, space } from '@/theme';

type Action = { key: string; title: string; detail: string; badge?: string };

const actions: Action[] = [
  {
    key: 'garder',
    title: 'Le garder plus longtemps',
    detail: 'La meilleure option : un objet utilisé longtemps n’a pas besoin d’être remplacé.',
    badge: 'Le mieux',
  },
  {
    key: 'donner',
    title: 'Le donner ou le revendre',
    detail: 'Une seconde vie évite la fabrication d’un objet neuf équivalent.',
  },
  {
    key: 'deposer',
    title: 'Le déposer au bon point de collecte',
    detail: 'La filière textile peut le réemployer ou le recycler.',
  },
  {
    key: 'eviter',
    title: 'À éviter',
    detail: 'Ne pas le jeter à la poubelle classique, ni l’abandonner dans la nature.',
  },
];

export default function EndOfLifeScreen() {
  const { detection, impact, recordGoodDeed } = useApp();
  const [selected, setSelected] = useState<string | null>('deposer');
  const [done, setDone] = useState(false);

  if (!detection || !impact) return null;

  const active = actions.find((item) => item.key === selected);
  const avoided = actionAvoided(active?.title ?? '', impact.impact.co2e_kg);

  const validate = () => {
    if (!active) return;
    recordGoodDeed(active.title, avoided);
    setDone(true);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Fin de vie" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Que faire de ce {detection.objet.toLowerCase()} ?</Text>
        <Text style={styles.subtitle}>
          Du geste le plus utile au moins utile. Chaque choix compte.
        </Text>

        {actions.map((action, index) => (
          <ActionCard
            key={action.key}
            action={action}
            number={index + 1}
            expanded={selected === action.key}
            onPress={() => setSelected(action.key)}
          />
        ))}

        <View style={styles.spacer} />
        <Button
          label={done ? 'Bon geste enregistré ✓' : 'J’ai fait le bon geste'}
          variant="lime"
          onPress={validate}
          accessibilityLabel="Enregistrer le bon geste dans le journal"
        />
        {done ? (
          <Text style={styles.confirmation}>
            +{kg(avoided)} kg CO₂e évités par rapport à un achat neuf.
          </Text>
        ) : null}
        <Button
          label="Voir le journal"
          variant="outline"
          onPress={() => router.push('/journal')}
        />
      </ScrollView>
    </View>
  );
}

function ActionCard({
  action,
  number,
  expanded,
  onPress,
}: {
  action: Action;
  number: number;
  expanded: boolean;
  onPress: () => void;
}) {
  const isBad = action.key === 'eviter';
  return (
    <View
      style={[
        styles.actionCard,
        isBad && styles.actionBad,
        expanded && !isBad && styles.actionSelected,
      ]}
    >
      <View style={styles.actionHead}>
        <View style={[styles.number, isBad && styles.numberBad]}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
        <Text style={[styles.actionTitle, isBad && styles.actionTitleBad]}>{action.title}</Text>
        {action.badge ? <Pill label={action.badge} small /> : null}
      </View>
      <Text style={[styles.actionDetail, isBad && styles.actionDetailBad]}>{action.detail}</Text>
      <View style={styles.actionFoot}>
        {isBad ? (
          <View style={styles.badInline}>
            <AlertTriangle size={16} color={colors.alert.title} strokeWidth={2} />
            <Text style={styles.badInlineText}>À éviter</Text>
          </View>
        ) : (
          <Button
            label={expanded ? 'Sélectionné' : 'Choisir'}
            variant={expanded ? 'lime' : 'outline'}
            onPress={onPress}
            accessibilityLabel={`Choisir : ${action.title}`}
          />
        )}
      </View>
      {expanded && action.key === 'deposer' ? <CollectionPoint /> : null}
      {expanded && action.key !== 'deposer' && !isBad ? (
        <View style={styles.selectedRow}>
          <Check size={16} color={colors.ink} strokeWidth={2.4} />
          <Text style={styles.selectedText}>Geste sélectionné</Text>
        </View>
      ) : null}
      {isBad ? (
        <View style={styles.avoidIcons}>
          <Wrench size={15} color={colors.alert.title} />
          <Gift size={15} color={colors.alert.title} />
          <MapPin size={15} color={colors.alert.title} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontFamily: font.title, fontSize: 23, color: colors.ink },
  subtitle: { fontFamily: font.body, fontSize: 13, color: colors.secondary, marginTop: space.sm, marginBottom: space.xl },
  actionCard: { backgroundColor: colors.card, borderRadius: radius.bigCard, padding: space.lg, marginBottom: space.md },
  actionSelected: { borderWidth: 2, borderColor: colors.ink },
  actionBad: { backgroundColor: colors.alert.background },
  actionHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  number: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  numberBad: { backgroundColor: colors.alert.title },
  numberText: { fontFamily: font.mono, fontSize: 13, color: colors.ink },
  actionTitle: { fontFamily: font.subtitle, fontSize: 15, color: colors.ink, flex: 1 },
  actionTitleBad: { color: colors.alert.title },
  actionDetail: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: space.md },
  actionDetailBad: { color: colors.alert.title },
  actionFoot: { marginTop: space.md, alignItems: 'flex-start' },
  badInline: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badInlineText: { fontFamily: font.semibold, fontSize: 13, color: colors.alert.title },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  selectedText: { fontFamily: font.medium, fontSize: 12, color: colors.ink },
  avoidIcons: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  confirmation: { fontFamily: font.mono, fontSize: 13, color: colors.ink, textAlign: 'center', marginVertical: space.md },
  spacer: { height: space.md },
});
