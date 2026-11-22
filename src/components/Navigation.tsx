import { ChevronLeft, Share2 } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, font, space } from '@/theme';

export function ScreenHeader({
  title,
  share = false,
  onShare,
}: {
  title: string;
  share?: boolean;
  onShare?: () => void;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour à l'écran précédent"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft size={26} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {share ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Partager cette fiche"
            onPress={onShare}
            style={styles.iconButton}
          >
            <Share2 size={20} color={colors.ink} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

export function BottomBar() {
  const pathname = usePathname();
  return (
    <SafeAreaView edges={['bottom']} style={styles.barSafe}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Ouvrir le scanner"
          accessibilityState={{ selected: pathname === '/' }}
          onPress={() => router.push('/')}
          style={styles.tab}
        >
          <Text style={[styles.tabText, pathname === '/' && styles.tabTextActive]}>Scanner</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scanner un nouvel objet"
          onPress={() => router.push('/')}
          style={styles.plus}
        >
          <Text style={styles.plusText}>+</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Ouvrir le journal"
          accessibilityState={{ selected: pathname === '/journal' }}
          onPress={() => router.push('/journal')}
          style={styles.tab}
        >
          <Text style={[styles.tabText, pathname === '/journal' && styles.tabTextActive]}>
            Journal
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerSafe: { backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.title, fontSize: 17, color: colors.ink, flex: 1, textAlign: 'center' },
  barSafe: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.hairline },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: space.xl,
  },
  tab: { minWidth: 80, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  tabText: { fontFamily: font.medium, fontSize: 13, color: colors.secondary },
  tabTextActive: { color: colors.ink, fontFamily: font.semibold },
  plus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { fontFamily: font.title, fontSize: 30, color: colors.ink, lineHeight: 34 },
});
