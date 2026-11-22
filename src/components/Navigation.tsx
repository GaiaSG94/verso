import { BookOpen, ChevronLeft, Plus, ScanLine, Share2 } from 'lucide-react-native';
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
          accessibilityLabel="Back to previous screen"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft size={26} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {share ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share this sheet"
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
          accessibilityLabel="Open scanner"
          accessibilityState={{ selected: pathname === '/' }}
          onPress={() => router.push('/')}
          style={styles.tab}
        >
          <ScanLine
            size={22}
            color={pathname === '/' ? colors.ink : colors.secondary}
            strokeWidth={1.8}
          />
          <Text style={[styles.tabText, pathname === '/' && styles.tabTextActive]}>Scan</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan a new object"
          onPress={() => router.push('/')}
          style={styles.plus}
        >
          <Plus size={24} color={colors.lime} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Open journal"
          accessibilityState={{ selected: pathname === '/journal' }}
          onPress={() => router.push('/journal')}
          style={styles.tab}
        >
          <BookOpen
            size={22}
            color={pathname === '/journal' ? colors.ink : colors.secondary}
            strokeWidth={1.8}
          />
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.medium, fontSize: 15, color: colors.ink, flex: 1, textAlign: 'center' },
  barSafe: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.navBorder },
  bar: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  tab: { minWidth: 64, alignItems: 'center', justifyContent: 'center', minHeight: 44, gap: 4 },
  tabText: { fontFamily: font.medium, fontSize: 12, color: colors.secondary },
  tabTextActive: { color: colors.ink, fontFamily: font.semibold },
  plus: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { color: colors.lime },
});
