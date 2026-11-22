import { View, StyleSheet, Text } from 'react-native';

import { colors, font, gradeLabels, radius, space } from '@/theme';
import type { Grade } from '@/types';

const order: Grade[] = ['A', 'B', 'C', 'D', 'E'];

export function GradeBadge({
  grade,
  size = 44,
  withLabel = false,
}: {
  grade: Grade;
  size?: number;
  withLabel?: boolean;
}) {
  const palette = colors.grade[grade];
  return (
    <View
      accessible
      accessibilityLabel={`Note ${grade}, ${gradeLabels[grade]}`}
      style={[styles.badge, { width: size, height: size, backgroundColor: palette.background }]}
    >
      <Text style={[styles.letter, { color: palette.text, fontSize: size * 0.55 }]}>{grade}</Text>
      {withLabel ? <Text style={styles.label}>{gradeLabels[grade]}</Text> : null}
    </View>
  );
}

export function GradeScale({ current }: { current: Grade }) {
  return (
    <View accessible accessibilityLabel={`Échelle de A à E, note actuelle ${current}`} style={styles.scale}>
      {order.map((grade) => {
        const palette = colors.grade[grade];
        return (
          <View key={grade} style={styles.step}>
            <View
              style={[
                styles.dot,
                { backgroundColor: palette.background },
                grade === current && styles.dotCurrent,
              ]}
            >
              <Text style={[styles.dotText, { color: palette.text }]}>{grade}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: font.title, lineHeight: 60 },
  label: { fontFamily: font.body, fontSize: 11, color: colors.secondary },
  scale: { flexDirection: 'row', alignItems: 'center', marginTop: space.xl },
  step: { flex: 1, alignItems: 'center' },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCurrent: {
    borderWidth: 3,
    borderColor: colors.paper,
    outlineWidth: 2,
    outlineColor: colors.paper,
    transform: [{ scale: 1.22 }],
  },
  dotText: { fontFamily: font.title, fontSize: 15 },
});
