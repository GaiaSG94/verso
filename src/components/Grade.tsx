import { View, StyleSheet, Text } from 'react-native';

import { colors, font, gradeLabels, radius, space } from '@/theme';
import type { Grade } from '@/types';

const order: Grade[] = ['A', 'B', 'C', 'D', 'E'];

export function GradeBadge({
  grade,
  size = 44,
  outlined = false,
}: {
  grade: Grade;
  size?: number;
  outlined?: boolean;
}) {
  const palette = colors.grade[grade];
  return (
    <View
      accessible
      accessibilityLabel={`Note ${grade}, ${gradeLabels[grade]}`}
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: palette.background },
        outlined && styles.badgeOutlined,
      ]}
    >
      <Text style={[styles.letter, { color: palette.text, fontSize: size * 0.55 }]}>{grade}</Text>
    </View>
  );
}

export function GradeScale({ current }: { current: Grade }) {
  return (
    <View accessible accessibilityLabel={`Échelle de A à E, note actuelle ${current}`} style={styles.scale}>
      {order.map((grade) => {
        const palette = colors.grade[grade];
        const active = grade === current;
        return (
          <View
            key={grade}
            style={[
              styles.step,
              { backgroundColor: palette.background },
              !active && styles.stepMuted,
              active && styles.stepCurrent,
            ]}
          >
            <Text style={[styles.stepText, { color: palette.text }, active && styles.stepTextCurrent]}>
              {grade}
            </Text>
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
  badgeOutlined: {
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  letter: { fontFamily: font.title, lineHeight: 60 },
  scale: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.xl },
  step: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMuted: { opacity: 0.55 },
  stepCurrent: {
    outlineWidth: 2,
    outlineColor: colors.paper,
    outlineStyle: 'solid',
  },
  stepText: { fontFamily: font.medium, fontSize: 12 },
  stepTextCurrent: { fontFamily: font.title, fontSize: 13 },
});
