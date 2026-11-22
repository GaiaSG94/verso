import { BookOpen, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/Navigation';
import { GradeBadge } from '@/components/Grade';
import { Button, Pill, SourceNote, TextLink } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { kg } from '@/lib/format';
import { colors, font, gradeLabels, radius, space } from '@/theme';
import type { Detection, ScanMode } from '@/types';

const modes: { key: ScanMode; label: string }[] = [
  { key: 'objet', label: 'Objet' },
  { key: 'code-barres', label: 'Code-barres' },
  { key: 'etiquette', label: 'Étiquette' },
];

export default function ScannerScreen() {
  const { detection, impact, setDetection } = useApp();
  const [mode, setMode] = useState<ScanMode>('objet');
  const [flash, setFlash] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.cameraArea}>
        <View style={styles.backdrop} />
        <SafeAreaView edges={['top']} style={styles.topSafe}>
          <View style={styles.topRow}>
            <View style={styles.logo}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>verso</Text>
            </View>
            <View style={styles.topActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={flash ? 'Éteindre le flash' : 'Allumer le flash'}
                onPress={() => setFlash((v) => !v)}
                style={[styles.iconButton, flash && styles.iconButtonActive]}
              >
                <Zap size={19} color={flash ? colors.ink : colors.lime} strokeWidth={2} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ouvrir le journal"
                onPress={() => router.push('/journal')}
                style={styles.iconButton}
              >
                <BookOpen size={19} color={colors.lime} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
          <View style={styles.modeSelector}>
            {modes.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={`Mode ${item.label}`}
                accessibilityState={{ selected: mode === item.key }}
                onPress={() => setMode(item.key)}
                style={[styles.mode, mode === item.key && styles.modeActive]}
              >
                <Text style={[styles.modeText, mode === item.key && styles.modeTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>

        {detection && impact ? <DetectionFrame detection={detection} /> : null}
      </View>

      {detection && impact ? (
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>Objet reconnu</Text>
          <Text style={styles.objectName}>{detection.objet}</Text>
          <Text style={styles.meta}>
            {detection.categorie} · {detection.matiere_principale} · {detection.poids_estime_g} g
          </Text>
          <View style={styles.miniCard}>
            <GradeBadge grade={impact.grade} size={46} />
            <View style={styles.miniCardBody}>
              <Text style={styles.miniTitle}>{gradeLabels[impact.grade]}</Text>
              <Text style={styles.miniFigure}>
                {kg(impact.impact.co2e_kg)} kg CO₂e
              </Text>
              <SourceNote text={impact.impact.source_co2e} />
            </View>
          </View>
          <Button
            label="Voir l'impact complet"
            onPress={() => router.push('/impact')}
            accessibilityLabel="Voir l'impact complet de l'objet reconnu"
          />
          <View style={styles.linkRow}>
            <TextLink
              label={detection.confiance < 0.6 ? 'Ce n’est pas ça ? Corriger en premier' : 'Ce n’est pas ça ? Corriger l’objet'}
              onPress={() => setCorrectionOpen(true)}
            />
          </View>
        </View>
      ) : null}

      <BottomBar />

      <CorrectionSheet
        visible={correctionOpen}
        detection={detection}
        onClose={() => setCorrectionOpen(false)}
        onPick={(next) => {
          setDetection(next);
          setCorrectionOpen(false);
        }}
      />
    </View>
  );
}

function DetectionFrame({ detection }: { detection: Detection }) {
  const label = `${detection.objet} · ${detection.matiere_principale.toLowerCase()}`;
  return (
    <View accessible accessibilityLabel={`Objet détecté : ${label}`} style={styles.frameWrap}>
      <View style={styles.frame}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>
      <View style={styles.frameLabel}>
        <Text style={styles.frameLabelText}>{label}</Text>
      </View>
    </View>
  );
}

function CorrectionSheet({
  visible,
  detection,
  onClose,
  onPick,
}: {
  visible: boolean;
  detection: Detection | null;
  onClose: () => void;
  onPick: (detection: Detection) => void;
}) {
  const [objet, setObjet] = useState(detection?.objet ?? '');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Corriger l’objet</Text>
          <Text style={styles.modalHint}>Choisissez une suggestion ou saisissez le bon nom.</Text>
          <TextInput
            accessibilityLabel="Nom de l'objet"
            style={styles.input}
            value={objet}
            onChangeText={setObjet}
            placeholder="Nom de l’objet"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {['T-shirt en coton', 'Gourde en inox', 'Bocal en verre'].map((name) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel={`Corriger vers ${name}`}
                onPress={() => setObjet(name)}
                style={styles.suggestion}
              >
                <Text style={styles.suggestionText}>{name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button
            label="Valider la correction"
            variant="lime"
            onPress={() =>
              detection &&
              onPick({ ...detection, objet: objet || detection.objet, confiance: 1, origine: 'correction' })
            }
          />
          <TextLink label="Annuler" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  cameraArea: { flex: 1, backgroundColor: colors.camera, overflow: 'hidden' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.camera,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  topSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  logo: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.lime },
  logoText: { fontFamily: font.title, fontSize: 22, color: colors.lime },
  topActions: { flexDirection: 'row', gap: space.sm },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: { backgroundColor: colors.lime },
  modeSelector: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    padding: 4,
    marginTop: space.lg,
  },
  mode: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  modeActive: { backgroundColor: colors.lime },
  modeText: { fontFamily: font.medium, fontSize: 12, color: colors.paper },
  modeTextActive: { color: colors.ink },
  frameWrap: { position: 'absolute', top: '34%', left: '16%', right: '16%', alignItems: 'center' },
  frame: { width: '100%', aspectRatio: 0.86, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.lime },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  frameLabel: { position: 'absolute', top: -16, backgroundColor: colors.lime, paddingHorizontal: space.md, paddingVertical: 5, borderRadius: radius.small },
  frameLabelText: { fontFamily: font.semibold, fontSize: 12, color: colors.ink },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: space.xl,
    paddingTop: space.lg,
    marginTop: -space.xl,
    zIndex: 3,
  },
  eyebrow: { fontFamily: font.semibold, fontSize: 12, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  objectName: { fontFamily: font.title, fontSize: 24, color: colors.ink, marginTop: 4 },
  meta: { fontFamily: font.body, fontSize: 13, color: colors.secondary, marginTop: 4 },
  miniCard: { flexDirection: 'row', gap: space.md, alignItems: 'center', backgroundColor: colors.paper, borderRadius: radius.card, padding: space.md, marginVertical: space.lg },
  miniCardBody: { flex: 1 },
  miniTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  miniFigure: { fontFamily: font.mono, fontSize: 20, color: colors.ink, marginTop: 2 },
  linkRow: { alignItems: 'center', marginTop: space.md },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(21,32,27,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: space.xl, gap: space.md },
  modalTitle: { fontFamily: font.title, fontSize: 20, color: colors.ink },
  modalHint: { fontFamily: font.body, fontSize: 13, color: colors.secondary },
  input: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.small, padding: space.md, fontFamily: font.body, fontSize: 15, color: colors.ink },
  suggestions: { marginVertical: space.sm },
  suggestion: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline, marginRight: space.sm },
  suggestionText: { fontFamily: font.medium, fontSize: 12, color: colors.ink },
});
