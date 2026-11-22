import { CameraView, useCameraPermissions } from 'expo-camera';
import { BookOpen, Zap } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Button, SourceNote, TextLink } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { recognizeImage } from '@/lib/api';
import { lookupBarcode } from '@/lib/barcode';
import { kg } from '@/lib/format';
import { resolveImpact } from '@/lib/impact';
import { colors, font, gradeLabels, radius, space } from '@/theme';
import type { Detection, ScanMode } from '@/types';

const modes: { key: ScanMode; label: string }[] = [
  { key: 'objet', label: 'Objet' },
  { key: 'code-barres', label: 'Code-barres' },
  { key: 'etiquette', label: 'Étiquette' },
];

export default function ScannerScreen() {
  const { detection, impact, setDetection, recordScan } = useApp();
  const [mode, setMode] = useState<ScanMode>('objet');
  const [flash, setFlash] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const lastCode = useRef<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const capture = useCallback(async () => {
    if (busy || !cameraRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        shutterSound: true,
      });
      if (!photo?.base64) throw new Error('no_photo');
      const found = await recognizeImage(photo.base64);
      recordScan(found, resolveImpact(found));
      if (found.confiance < 0.6) setCorrectionOpen(true);
    } catch {
      setError('Reconnaissance indisponible. Vérifiez le backend et réessayez.');
    } finally {
      setBusy(false);
    }
  }, [busy, recordScan]);

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (lastCode.current === data) return;
      lastCode.current = data;
      const product = await lookupBarcode(data);
      if (!product) {
        setMode('objet');
        setError('Produit inconnu : prenez une photo de l’objet.');
        return;
      }
      const found: Detection = {
        objet: product.nom,
        categorie: product.categorie,
        matiere_principale: product.matiere_principale,
        poids_estime_g: product.poids_estime_g,
        confiance: 1,
        etat_apparent: 'neuf',
        origine: 'code-barres',
        code_barres: product.code,
      };
      recordScan(found, resolveImpact(found));
    },
    [recordScan],
  );

  return (
    <View style={styles.root}>
      <View style={styles.cameraArea}>
        {focused && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.backdrop}
            facing="back"
            enableTorch={flash}
            barcodeScannerSettings={
              mode === 'code-barres'
                ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }
                : undefined
            }
            onBarcodeScanned={mode === 'code-barres' ? handleBarcode : undefined}
          />
        ) : (
          <View style={styles.backdrop} />
        )}
        {permission && !permission.granted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Autoriser l'accès à la caméra"
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionText}>Autoriser la caméra</Text>
          </Pressable>
        ) : null}
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
        {busy ? <ActivityIndicator size="large" color={colors.lime} style={styles.busy} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre une photo et reconnaître l'objet"
          onPress={capture}
          disabled={busy || !permission?.granted}
          style={styles.shutter}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>

      {detection && impact ? (
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          <View style={styles.sheetHead}>
            <Text style={styles.eyebrow}>Objet reconnu</Text>
            <Text style={styles.confidence}>
              {Math.round(detection.confiance * 100)} % de confiance
            </Text>
          </View>
          <Text style={styles.objectName}>{detection.objet}</Text>
          <Text style={styles.meta}>
            {detection.categorie} · {detection.matiere_principale} · ~{detection.poids_estime_g} g
          </Text>
          <View style={styles.miniCard}>
            <GradeBadge grade={impact.grade} size={48} />
            <View style={styles.miniCardBody}>
              <Text style={styles.miniTitle}>{gradeLabels[impact.grade]}</Text>
              <Text style={styles.miniSub}>pour un {detection.categorie.toLowerCase().replace(/s$/, '')}</Text>
              <SourceNote text={impact.impact.source_co2e} />
            </View>
            <View style={styles.miniRight}>
              <Text style={styles.miniFigure}>{kg(impact.impact.co2e_kg)} kg</Text>
              <Text style={styles.miniUnit}>CO₂e</Text>
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
  const confidence = `${Math.round(detection.confiance * 100)} %`;
  return (
    <View accessible accessibilityLabel={`Objet détecté : ${label}`} style={styles.frameWrap}>
      <View style={styles.frameLabel}>
        <Text style={styles.frameLabelText}>{label}</Text>
        <Text style={styles.frameLabelConfidence}>{confidence}</Text>
      </View>
      <View style={styles.frame}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <View style={styles.scanLine} />
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
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lime },
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
  mode: { height: 32, paddingHorizontal: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: colors.paper },
  modeText: { fontFamily: font.medium, fontSize: 13, color: colors.paper },
  modeTextActive: { color: colors.ink, fontFamily: font.semibold },
  frameWrap: { position: 'absolute', top: '46%', left: '15%', right: '15%', alignItems: 'center' },
  frame: { width: '100%', height: 196, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.lime },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  frameLabel: {
    position: 'absolute',
    top: -36,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.lime,
  },
  frameLabelText: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  frameLabelConfidence: { fontFamily: font.mono, fontSize: 12, color: colors.ink },
  scanLine: { position: 'absolute', left: 20, right: 20, top: '50%', height: 2, backgroundColor: colors.lime, opacity: 0.55 },
  permissionButton: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    minHeight: 52,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  shutter: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.lime },
  busy: { position: 'absolute', top: '55%', alignSelf: 'center' },
  error: {
    position: 'absolute',
    bottom: 108,
    left: space.lg,
    right: space.lg,
    textAlign: 'center',
    fontFamily: font.body,
    fontSize: 12,
    color: colors.paper,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.xl,
    marginTop: -space.xl,
    zIndex: 3,
    gap: space.sm,
  },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9C5B9', alignSelf: 'center', marginBottom: space.sm },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: font.semibold, fontSize: 12, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  confidence: { fontFamily: font.mono, fontSize: 12, color: colors.secondary },
  objectName: { fontFamily: font.title, fontSize: 28, color: colors.ink },
  meta: { fontFamily: font.body, fontSize: 14, color: colors.secondary },
  miniCard: { flexDirection: 'row', gap: space.md, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: space.md, marginVertical: space.md },
  miniCardBody: { flex: 1 },
  miniTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  miniSub: { fontFamily: font.body, fontSize: 13, color: colors.secondary },
  miniRight: { alignItems: 'flex-end' },
  miniFigure: { fontFamily: font.mono, fontSize: 16, color: colors.ink },
  miniUnit: { fontFamily: font.body, fontSize: 12, color: colors.secondary },
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
