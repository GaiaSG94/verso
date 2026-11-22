import { MapPin, Navigation } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, space } from '@/theme';

const MAPS_QUERY =
  'https://www.google.com/maps/search/?api=1&query=point+de+collecte+textile+Paris';

export function MiniMap() {
  return (
    <View accessible accessibilityLabel="Mini-map: nearest collection point" style={styles.map}>
      <View style={styles.roadA} />
      <View style={styles.roadB} />
      <View style={styles.roadC} />
      <View style={styles.pin}>
        <MapPin size={22} color={colors.card} strokeWidth={2.2} />
      </View>
    </View>
  );
}

export function CollectionPoint() {
  return (
    <View style={styles.wrap}>
      <MiniMap />
      <View style={styles.pointRow}>
        <View style={styles.pointInfo}>
          <Text style={styles.place}>Nearest collection point</Text>
          <Text style={styles.address}>
            12 Recycling Lane, London N1 · <Text style={styles.distance}>450 m</Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open directions to the collection point"
          onPress={() => Linking.openURL(MAPS_QUERY)}
          style={({ pressed }) => [styles.itinerary, pressed && styles.pressed]}
        >
          <Navigation size={16} color={colors.paper} strokeWidth={2} />
          <Text style={styles.itineraryText}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.md },
  map: {
    height: 110,
    borderRadius: radius.small,
    backgroundColor: '#E9E6DD',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadA: { position: 'absolute', width: 260, height: 12, backgroundColor: '#FFFFFF', transform: [{ rotate: '-18deg' }] },
  roadB: { position: 'absolute', width: 12, height: 190, backgroundColor: '#FFFFFF', transform: [{ rotate: '22deg' }] },
  roadC: { position: 'absolute', width: 200, height: 8, backgroundColor: '#D6E0D0', transform: [{ rotate: '38deg' }] },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  pointInfo: { flex: 1 },
  place: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  address: { fontFamily: font.body, fontSize: 12, color: colors.secondary, marginTop: 2 },
  distance: { fontFamily: font.mono, fontSize: 12, color: colors.secondary },
  itinerary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  itineraryText: { fontFamily: font.semibold, fontSize: 13, color: colors.paper },
  pressed: { opacity: 0.7 },
});
