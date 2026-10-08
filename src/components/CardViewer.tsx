import React, { useState } from 'react';
import { BirthdayCardData, ThemeId } from '../types/card';
import { BirthdayCake } from './BirthdayCake';
import { PhotoFrame } from './PhotoFrame';
import { audioEngine } from '../utils/audioEngine';
import { IS_RECIPIENT_BUILD } from '../config';
import confetti from 'canvas-confetti';
import {
  Share2,
  Edit3,
  Heart,
  Gift,
  PartyPopper,
  Eye,
  RotateCcw,
  Download,
} from 'lucide-react';

interface CardViewerProps {
  cardData: BirthdayCardData;
  isViewOnly?: boolean;
  onOpenEditor: () => void;
  onOpenShare: () => void;
  onOpenExport?: () => void;
  onUpdateCardData: (data: BirthdayCardData) => void;
  onTogglePreviewRecipient?: () => void;
}

export const CardViewer: React.FC<CardViewerProps> = ({
  cardData,
  isViewOnly = false,
  onOpenEditor,
  onOpenShare,
  onOpenExport,
  onTogglePreviewRecipient,
}) => {
  const [hasOpenedGift, setHasOpenedGift] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [showSecretWish, setShowSecretWish] = useState<boolean>(false);

  // Theme style mapping
  const themeStyles: Record<ThemeId, {
    bgGradient: string;
    cardGlass: string;
    textHeading: string;
    borderGlow: string;
    badgeColor: string;
  }> = {
    'sunset-joy': {
      bgGradient: 'from-amber-950 via-rose-950 to-purple-950',
      cardGlass: 'bg-white/10 border-amber-300/30',
      textHeading: 'from-amber-200 via-rose-300 to-pink-200',
      borderGlow: 'shadow-[0_0_35px_rgba(244,63,94,0.25)]',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    },
    'cute-pastel': {
      bgGradient: 'from-pink-950 via-purple-950 to-slate-950',
      cardGlass: 'bg-white/15 border-pink-300/40',
      textHeading: 'from-pink-200 via-rose-200 to-indigo-200',
      borderGlow: 'shadow-[0_0_35px_rgba(244,114,182,0.3)]',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    },
    'neon-party': {
      bgGradient: 'from-slate-950 via-indigo-950 to-fuchsia-950',
      cardGlass: 'bg-slate-900/60 border-cyan-400/40',
      textHeading: 'from-cyan-300 via-fuchsia-300 to-pink-300',
      borderGlow: 'shadow-[0_0_40px_rgba(6,182,212,0.3)]',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    },
    'golden-luxury': {
      bgGradient: 'from-amber-950 via-yellow-950 to-stone-950',
      cardGlass: 'bg-stone-900/70 border-yellow-400/40',
      textHeading: 'from-yellow-100 via-amber-200 to-yellow-400',
      borderGlow: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    },
    'twilight-magic': {
      bgGradient: 'from-slate-950 via-indigo-950 to-blue-950',
      cardGlass: 'bg-indigo-950/60 border-indigo-400/30',
      textHeading: 'from-blue-200 via-indigo-200 to-purple-200',
      borderGlow: 'shadow-[0_0_35px_rgba(99,102,241,0.25)]',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    },
  };

  const currentTheme = themeStyles[cardData.theme] || themeStyles['sunset-joy'];

  // Start music automatically on card interaction
  const handleCardInteraction = async () => {
    if (!audioEngine.getIsPlaying()) {
      await audioEngine.resume();
      audioEngine.startMusic(cardData.musicTrack, cardData.customMusicUrl);
    }
  };

  // Handle gift box unboxing
  const handleOpenGiftBox = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpening(true);

    // Audio context initialization
    await audioEngine.resume();
    audioEngine.playFireworkBurst('sparkle');

    setTimeout(() => {
      setHasOpenedGift(true);
      setIsOpening(false);

      // Start music automatically
      audioEngine.startMusic(cardData.musicTrack, cardData.customMusicUrl);

      // Launch celebrations
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.6 },
      });

      if (typeof (window as unknown as { launchCelebrationFirework?: (t: string) => void }).launchCelebrationFirework === 'function') {
        const fn = (window as unknown as { launchCelebrationFirework: (t: string) => void }).launchCelebrationFirework;
        fn('heart');
        setTimeout(() => fn('star'), 400);
      }
    }, 600);
  };

  return (
    <div
      onClick={handleCardInteraction}
      className={`min-h-[100dvh] w-full bg-gradient-to-br ${currentTheme.bgGradient} text-slate-100 flex flex-col justify-center items-center relative overflow-x-hidden transition-colors duration-700`}
    >
      {/* Discreet Creator Controls (Top-Right Corner, ONLY visible for Creator, hidden completely for Recipient) */}
      {!isViewOnly && !IS_RECIPIENT_BUILD && (
        <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-40 flex items-center gap-1.5 sm:gap-2">
          {onTogglePreviewRecipient && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePreviewRecipient();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900/95 text-slate-200 border border-white/20 text-xs font-medium flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 touch-manipulation"
              title="Xem trước giao diện người nhận sẽ thấy"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="hidden sm:inline">Xem như bạn ấy</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditor();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900/95 text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Tùy chỉnh thông điệp, ảnh và bài hát"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Tùy chỉnh</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare();
            }}
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Chia sẻ link thiệp tới người bạn ấy"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenExport) onOpenExport();
            }}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Xuất mã nguồn ZIP đã lưu tùy chỉnh ở chế độ người nhận để đưa lên GitHub / Vercel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span>Xuất code</span>
          </button>
        </div>
      )}

      {/* Subtle toggle back to editor if creator is previewing */}
      {isViewOnly && onTogglePreviewRecipient && !IS_RECIPIENT_BUILD && (
        <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-40 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePreviewRecipient();
            }}
            className="px-2.5 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 backdrop-blur-md active:scale-95 touch-manipulation"
            title="Quay lại chế độ chỉnh sửa"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs">Sửa thiệp</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenExport) onOpenExport();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Xuất mã nguồn ZIP đã lưu tùy chỉnh ở chế độ người nhận để đưa lên GitHub / Vercel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span>Xuất code</span>
          </button>
        </div>
      )}

      {/* Main Greeting Card Content */}
      <main className="relative z-20 w-full flex-1 flex flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10 max-w-4xl mx-auto">
        {/* VIEW 1: UNOPENED GIFT BOX EXPERIENCE */}
        {!hasOpenedGift ? (
          <div className="text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500 my-auto px-2">
            {/* Ambient Back Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 h-56 sm:h-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none animate-pulse-subtle" />

            {/* Gift Box Graphic */}
            <div className="relative my-5 sm:my-6 flex justify-center group cursor-pointer touch-manipulation" onClick={handleOpenGiftBox}>
              <div
                className={`w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 shadow-2xl border-4 border-white/40 flex items-center justify-center relative transition-transform duration-500 ${
                  isOpening ? 'scale-125 rotate-6' : 'hover:scale-105 active:scale-95 animate-float'
                }`}
              >
                {/* Tied Ribbons */}
                <div className="absolute inset-x-0 h-6 sm:h-7 bg-amber-300/90 shadow-md top-1/2 -translate-y-1/2" />
                <div className="absolute inset-y-0 w-6 sm:w-7 bg-amber-300/90 shadow-md left-1/2 -translate-x-1/2" />
                {/* Big bow knot */}
                <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-300 shadow-xl flex items-center justify-center text-2xl sm:text-3xl border-2 border-white">
                  🎀
                </div>
              </div>
            </div>

            {/* Greeting */}
            <div className="text-center px-2 mb-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display bg-gradient-to-r from-pink-200 via-amber-200 to-rose-200 bg-clip-text text-transparent drop-shadow-sm pb-3 pt-1 px-1 leading-normal sm:leading-relaxed inline-block">
                Gửi tặng {cardData.recipientName}
              </h2>
            </div>
            <p className="text-xs sm:text-base text-slate-300 mb-6 sm:mb-8 leading-relaxed max-w-sm mx-auto px-2">
              Nhấn mở hộp quà để đón chào bất ngờ cùng pháo hoa rực rỡ và những điều ngọt ngào nhất!
            </p>

            {/* Open Button */}
            <button
              onClick={handleOpenGiftBox}
              disabled={isOpening}
              className="w-full max-w-xs px-6 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-base sm:text-lg shadow-2xl hover:shadow-pink-500/50 active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer touch-manipulation min-h-[48px]"
            >
              <PartyPopper className="w-5 h-5 animate-bounce shrink-0" />
              <span>{isOpening ? 'Đang mở quà...' : 'Mở Hộp Quà Ngay 🎁'}</span>
            </button>
          </div>
        ) : (
          /* VIEW 2: FULL INTERACTIVE BIRTHDAY CARD DISPLAY */
          <div className="w-full flex flex-col items-center gap-4 sm:gap-6 animate-in fade-in duration-500 my-auto">
            {/* Header Title: Only the single large bold title line */}
            <div className="text-center max-w-2xl px-2">
              <h1 className={`font-display text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r ${currentTheme.textHeading} bg-clip-text text-transparent tracking-wide leading-normal sm:leading-relaxed pb-3 sm:pb-4 pt-1 px-1 drop-shadow-lg inline-block`}>
                Happy Birthday, {cardData.recipientName}!
              </h1>
            </div>

            {/* Main Interactive Grid: Cake & Photo */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              {/* Interactive Birthday Cake with Number Candles */}
              <div className={`relative overflow-hidden p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${currentTheme.cardGlass} ${currentTheme.borderGlow} flex flex-col items-center justify-center shadow-xl`}>
                {/* Warm ambient spotlight for the cake */}
                <div className="absolute inset-0 bg-gradient-to-b from-rose-400/15 via-amber-300/15 to-transparent pointer-events-none" />
                <BirthdayCake
                  flavor={cardData.cakeFlavor}
                  age={cardData.age}
                  recipientName={cardData.recipientName}
                  onCandlesBlown={() => setShowSecretWish(true)}
                />
              </div>

              {/* Friend's Photo & Framed Card */}
              <div className={`relative overflow-hidden p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${currentTheme.cardGlass} ${currentTheme.borderGlow} flex flex-col items-center justify-center shadow-xl`}>
                {/* Soft ambient backlight for the photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-pink-400/10 via-white/5 to-transparent pointer-events-none" />
                <PhotoFrame
                  photoUrl={cardData.photoUrl}
                  recipientName={cardData.recipientName}
                  caption={cardData.photoCaption}
                />
              </div>
            </div>

            {/* Secret Wish Unlocked Card (Revealed after candles are blown) */}
            {showSecretWish && cardData.secretWish && (
              <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-2 border-amber-400/50 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm sm:text-base mb-1">
                  <span>🎁 Điều Ước Bí Mật Đã Mở Ra:</span>
                </div>
                <p className="text-slate-100 text-xs sm:text-base font-medium italic">
                  "{cardData.secretWish}"
                </p>
              </div>
            )}

            {/* Heartfelt Letter / Wishes Card */}
            <div className={`w-full max-w-2xl p-4 sm:p-7 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${currentTheme.cardGlass} ${currentTheme.borderGlow} shadow-2xl relative overflow-hidden mb-4 sm:mb-6`}>
              {/* Decorative background watermark */}
              <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl select-none pointer-events-none font-display">
                🎂
              </div>

              <div className="relative z-10 space-y-3 sm:space-y-4">
                <div className="flex items-center border-b border-white/10 pb-2.5 sm:pb-3">
                  <div className="flex items-center gap-2 text-pink-300 font-semibold text-xs sm:text-sm">
                    <Heart className="w-4 h-4 fill-pink-400 text-pink-400 shrink-0" />
                    <span>Thư chúc gửi {cardData.recipientName}</span>
                  </div>
                </div>

                {/* Main Message Body */}
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-100 font-medium whitespace-pre-wrap">
                  {cardData.message}
                </p>

                {/* Sender Sign-off */}
                <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-[11px] sm:text-xs text-slate-400">Thân ái gửi từ:</p>
                    <p className="font-handwriting text-xl sm:text-2xl font-bold text-amber-300 leading-normal pb-2 pt-0.5">
                      {cardData.senderName || 'Người bạn thân thiết'} 💖
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
