export type ThemeId = 'sunset-joy' | 'neon-party' | 'cute-pastel' | 'golden-luxury' | 'twilight-magic';

export type CakeFlavor = 'strawberry' | 'chocolate' | 'matcha' | 'rainbow';

export type MusicTrackId = 'synth-birthday' | 'music-box' | 'party-beat' | 'acoustic-warm' | 'custom';

export interface BirthdayCardData {
  recipientName: string;
  senderName: string;
  age?: number | string;
  title: string;
  message: string;
  secretWish?: string;
  photoUrl?: string;
  photoCaption?: string;
  theme: ThemeId;
  cakeFlavor: CakeFlavor;
  candleCount: number;
  musicTrack: MusicTrackId;
  customMusicUrl?: string;
  autoPlayFireworks: boolean;
  soundEnabled: boolean;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  candleColor: string;
  buttonGradient: string;
}
