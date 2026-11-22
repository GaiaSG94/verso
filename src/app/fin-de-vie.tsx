import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CollectionPoint } from '@/components/MiniMap';
import { ScreenHeader } from '@/components/Navigation';
import { Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { kg } from '@/lib/format';
import { actionAvoided } from '@/lib/impact';
import { colors, font, radius, space } from '@/theme';

type Action = { key: string; title: string; detail: string; badge?: string };

const actions: Action[] = [
  {
    key: 'garder',
    title: 'Keep it longer',
    detail: 'Sew it back up, unpick it: every extra year of use reduces its impact.',
    badge: 'Best option',
  },
  {
    key: 'donner',
    title: 'Give it away or resell it',
    detail: 'Reuse center, thrift store or second-hand platform.',
  },
  {
    key: 'deposer',
    title: 'Drop it at a textile collection point',
    detail: 'Even torn or stained: it will be sorted, reused or recycled.',
  },
  {
    key: 'eviter',
    title: 'Avoid',
    detail: 'Neither in the packaging bin nor in household waste.',
  },
];

export default function EndOfLifeScreen() {
  const { detection, impact, recordGoodDeed } = useApp();
  const [selected, setSelected] = useState('deposer');
  const [done, setDone] = useState(false);

  if (!detection || !impact) return null;

  const active = actions.find((item) => item.key === selected);
  const avoided = actionAvoided(active?.title ?? '', impact.impact.co2e_kg);

  const validate = () => {
    if (!active || active.key === 'eviter') return;
    recordGoodDeed(active.title, avoided);
    setDone(true);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="End of life" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What to do with this {detection.objet.toLowerCase()}?</Text>
          <Text style={styles.subtitle}>From the most useful action to the least useful.</Text>
        </View>

        <View style={styles.list}>
          {actions.map((action, index) => (
            <ActionCard
              key={action.key}
              action={action}
              number={index + 1}
              selected={selected === action.key}
              onPress={() => setSelected(action.key)}
            />
          ))}
        </View>

        <View style={styles.spacer} />
        <Button
          label={done ? 'Good deed recorded' : 'I did the right thing'}
          variant="lime"
          onPress={validate}
          accessibilityLabel="Record the good deed in the journal"
        />
        {done ? (
          <Text style={styles.confirmation}>+{kg(avoided)} kg CO₂e avoided.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ActionCard({
  action,
  number,
  selected,
  onPress,
}: {
  action: Action;
  number: number;
  selected: boolean;
  onPress: () => void;
}) {
  const isBad = action.key === 'eviter';
  const isCollection = action.key === 'deposer';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action.title}${selected ? ', selected' : ''}`}
      onPress={onPress}
      disabled={isBad}
      style={({ pressed }) => [
        styles.card,
        isBad && styles.cardBad,
        selected && !isBad && styles.cardSelected,
        pressed && !isBad && styles.pressed,
      ]}
    >
      <View style={styles.cardHead}>
        {isBad ? (
          <View style={styles.badIcon}>
            <X size={16} color={colors.card} strokeWidth={2.4} />
          </View>
        ) : (
          <View style={[styles.number, number !== 1 && styles.numberNeutral]}>
            <Text style={styles.numberText}>{number}</Text>
          </View>
        )}
        <Text style={[styles.cardTitle, isBad && styles.cardTitleBad]}>{action.title}</Text>
        {action.badge ? (
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>{action.badge}</Text>
          </View>
        ) : null}
        {selected && !isBad && !isCollection ? (
          <Check size={16} color={colors.ink} strokeWidth={2.4} />
        ) : null}
      </View>
      <Text style={[styles.cardDetail, isBad && styles.cardDetailBad]}>{action.detail}</Text>
      {selected && isCollection ? <CollectionPoint /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, paddingBottom: space.xxl },
  titleBlock: { gap: 4, marginBottom: space.md },
  title: { fontFamily: font.title, fontSize: 26, color: colors.ink, lineHeight: 30 },
  subtitle: { fontFamily: font.body, fontSize: 14, color: colors.secondary },
  list: { gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: space.md },
  cardSelected: { borderWidth: 1.5, borderColor: colors.ink },
  cardBad: { backgroundColor: colors.alert.background },
  pressed: { opacity: 0.8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  number: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberNeutral: { backgroundColor: colors.neutral },
  numberText: { fontFamily: font.mono, fontSize: 14, color: colors.ink },
  badIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#B5432C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.ink, flex: 1 },
  cardTitleBad: { color: colors.alert.title },
  bestBadge: { backgroundColor: colors.ink, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  bestBadgeText: { fontFamily: font.semibold, fontSize: 11, color: colors.paper },
  cardDetail: { fontFamily: font.body, fontSize: 13, color: colors.secondary, marginTop: space.sm },
  cardDetailBad: { color: '#5A2A20' },
  spacer: { height: space.sm },
  confirmation: { fontFamily: font.mono, fontSize: 13, color: colors.ink, textAlign: 'center', marginTop: space.md },
});
