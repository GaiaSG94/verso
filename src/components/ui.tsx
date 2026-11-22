import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, space, tap } from '@/theme';

type CardProps = { children: ReactNode; style?: object; dark?: boolean };

export function Card({ children, style, dark = false }: CardProps) {
  return (
    <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {right}
    </View>
  );
}

export function SourceNote({ text }: { text: string }) {
  return <Text style={styles.source}>Average estimate · source: {text}</Text>;
}

export function Pill({
  label,
  dark = false,
  small = false,
}: {
  label: string;
  dark?: boolean;
  small?: boolean;
}) {
  return (
    <View style={[styles.pill, dark && styles.pillDark, small && styles.pillSmall]}>
      <Text style={[styles.pillText, dark && styles.pillTextDark]}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'dark' | 'lime' | 'outline';

export function Button({
  label,
  onPress,
  variant = 'dark',
  accessibilityLabel,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'dark' && styles.buttonDark,
        variant === 'lime' && styles.buttonLime,
        variant === 'outline' && styles.buttonOutline,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'lime' && styles.buttonTextInk,
          variant === 'outline' && styles.buttonTextInk,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TextLink({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={8}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: space.lg,
  },
  cardDark: { backgroundColor: colors.ink },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  sectionTitleText: {
    fontFamily: font.subtitle,
    fontSize: 18,
    color: colors.ink,
  },
  source: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.secondary,
    marginTop: space.sm,
  },
  pill: {
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillSmall: { paddingHorizontal: space.sm, paddingVertical: 3 },
  pillDark: { backgroundColor: colors.ink },
  pillText: { fontFamily: font.semibold, fontSize: 12, color: colors.ink },
  pillTextDark: { color: colors.paper },
  button: {
    minHeight: tap.pillHeight,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  buttonDark: { backgroundColor: colors.ink },
  buttonLime: { backgroundColor: colors.lime },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  buttonText: { fontFamily: font.semibold, fontSize: 15, color: colors.card },
  buttonTextInk: { color: colors.ink },
  link: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 },
});
