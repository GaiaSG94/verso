export const colors = {
  paper: '#F4F2EC',
  card: '#FFFFFF',
  ink: '#15201B',
  secondary: '#56605A',
  lime: '#C6F05E',
  camera: '#0E1512',
  hairline: '#E5E3DC',
  neutral: '#E7E4DA',
  track: '#EEEBE3',
  navBorder: '#E3DFD4',
  softText: '#B9C2BC',
  lifecycle: ['#15201B', '#4F6B5D', '#93A89C', '#C9D3CC', '#E3B341'] as const,
  alert: { background: '#F7E3DD', title: '#8A2E1C' },
  grade: {
    A: { background: '#1E6B52', text: '#FFFFFF' },
    B: { background: '#3F7F4C', text: '#FFFFFF' },
    C: { background: '#E3B341', text: '#15201B' },
    D: { background: '#E58A3A', text: '#15201B' },
    E: { background: '#B5432C', text: '#FFFFFF' },
  },
} as const;

export const font = {
  title: 'SpaceGrotesk_700Bold',
  subtitle: 'SpaceGrotesk_600SemiBold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const radius = {
  card: 16,
  bigCard: 22,
  sheet: 28,
  pill: 26,
  small: 10,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const tap = { minHeight: 44, pillHeight: 52 } as const;

export const gradeLabels = {
  A: 'Very low impact',
  B: 'Low impact',
  C: 'Moderate impact',
  D: 'High impact',
  E: 'Very high impact',
} as const;
