import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';
import { CakeFlavor } from '../types/card';
import { Sparkles, RotateCcw } from 'lucide-react';

interface BirthdayCakeProps {
  flavor?: CakeFlavor;
  age?: number | string;
  recipientName: string;
  onCandlesBlown?: () => void;
}

// 5-point 3D silver metallic star stud
const SilverStar: React.FC<{ x: number; y: number; size?: number; rotate?: number; idPrefix: string }> = ({
  x,
  y,
  size = 8,
  rotate = 0,
  idPrefix,
}) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate})`}>
    <polygon
      points="0,-5 1.5,-1.6 5.1,-1.5 2.2,0.8 3.3,4.3 0,2.2 -3.3,4.3 -2.2,0.8 -5.1,-1.5 -1.5,-1.6"
      transform={`scale(${size / 10})`}
      fill={`url(#${idPrefix}-silverGrad)`}
      stroke="#ffffff"
      strokeWidth="0.8"
      filter="drop-shadow(0 1px 1px rgba(0,0,0,0.4))"
    />
    <circle cx="0" cy="0" r={size * 0.15} fill="#ffffff" opacity="0.95" />
  </g>
);

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({
  age = 20,
  recipientName,
  onCandlesBlown,
}) => {
  const [candlesLit, setCandlesLit] = useState<boolean>(true);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [hasWished, setHasWished] = useState<boolean>(false);

  // Blow out candles action
  const blowOutCandles = () => {
    if (!candlesLit || isBlowing) return;
    setIsBlowing(true);
    audioEngine.playBlowCandle();

    setTimeout(() => {
      setCandlesLit(false);
      setIsBlowing(false);
      setHasWished(true);

      // Play fanfare
      audioEngine.playFanfare();

      // Confetti burst
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#ff69b4', '#ffd700', '#ff1493', '#ffc0cb', '#87cefa'],
      });

      if (onCandlesBlown) onCandlesBlown();
    }, 450);
  };

  // Re-light candles
  const relightCandles = () => {
    setCandlesLit(true);
    setHasWished(false);
    audioEngine.playFireworkBurst('sparkle');
  };

  // Extract digits for number candles
  const ageStr = age ? String(age).trim() : '20';
  const candleDigits = ageStr.length > 0 ? ageStr.slice(0, 3).split('') : ['2', '0'];

  // Coordinates for metallic stars inside each digit
  const getDigitStarPositions = (digit: string): { x: number; y: number; rotate: number }[] => {
    switch (digit) {
      case '1':
        return [
          { x: 38, y: 32, rotate: -15 },
          { x: 50, y: 44, rotate: 10 },
          { x: 50, y: 58, rotate: -5 },
          { x: 34, y: 72, rotate: 12 },
          { x: 66, y: 72, rotate: -8 },
        ];
      case '0':
        return [
          { x: 50, y: 22, rotate: 0 },
          { x: 72, y: 34, rotate: 25 },
          { x: 28, y: 42, rotate: -20 },
          { x: 72, y: 56, rotate: 15 },
          { x: 28, y: 64, rotate: -15 },
          { x: 50, y: 74, rotate: 5 },
        ];
      case '2':
        return [
          { x: 36, y: 26, rotate: -10 },
          { x: 64, y: 32, rotate: 20 },
          { x: 50, y: 48, rotate: 0 },
          { x: 32, y: 70, rotate: -15 },
          { x: 68, y: 70, rotate: 15 },
        ];
      case '3':
        return [
          { x: 40, y: 24, rotate: 10 },
          { x: 66, y: 34, rotate: -15 },
          { x: 48, y: 46, rotate: 0 },
          { x: 66, y: 60, rotate: 20 },
          { x: 42, y: 72, rotate: -10 },
        ];
      default:
        return [
          { x: 40, y: 26, rotate: 10 },
          { x: 64, y: 36, rotate: -15 },
          { x: 36, y: 52, rotate: 20 },
          { x: 64, y: 66, rotate: -10 },
          { x: 45, y: 74, rotate: 5 },
        ];
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none py-2 w-full max-w-full overflow-hidden mx-auto">
      {/* Ambient Warm Birthday Glow - Illuminates the entire cake scene brightly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-pink-300/35 via-amber-200/35 to-rose-200/35 blur-3xl pointer-events-none" />

      {/* Ambient candle flame glow when lit */}
      {candlesLit && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full bg-amber-400/40 blur-2xl pointer-events-none animate-pulse-subtle" />
      )}

      {/* Secret Wish banner if candles blown */}
      {hasWished && (
        <div className="mb-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500/90 via-rose-500/90 to-amber-500/90 border border-white/60 text-center animate-bounce shadow-xl backdrop-blur-md z-30">
          <div className="flex items-center justify-center gap-2 text-white font-semibold text-xs sm:text-sm drop-shadow-md">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>Điều ước của {recipientName} đã được gửi đến vũ trụ! ✨</span>
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
          </div>
        </div>
      )}

      {/* THE CAKE COMPOSITION */}
      <div className="relative flex flex-col items-center z-10">
        {/* TOP TIER: CANDLES & SAKURA FIRMLY ROOTED TOGETHER ON CAKE RIM */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Number Candles & Sakura Chibi Doll Row */}
          <div className="relative flex items-end justify-center -mb-2 z-10">
            {/* Number Candles Pair (Side-by-side, firmly rooted in cake cream) */}
            <div className="flex items-end justify-center gap-2 sm:gap-2.5 mb-1">
              {candleDigits.map((digit, idx) => {
                const starPositions = getDigitStarPositions(digit);
                const idPrefix = `cndl-${idx}-${digit}`;
                return (
                  <div
                    key={idx}
                    onClick={blowOutCandles}
                    className="relative flex flex-col items-center cursor-pointer group hover:scale-105 active:scale-95 transition-transform touch-manipulation"
                    title="Nhấn để thổi nến số"
                  >
                    {/* Flame - snug right on top of wick */}
                    {candlesLit ? (
                      <div className="relative flex items-center justify-center -mb-1">
                        {/* Outer flame */}
                        <div className="w-4 h-8 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-white animate-flicker shadow-[0_0_18px_#f59e0b]" />
                        {/* Inner white core */}
                        <div className="absolute w-1.5 h-3.5 rounded-full bg-white -bottom-0.5 opacity-95 blur-[0.2px]" />
                        {/* Blue base */}
                        <div className="absolute w-2 h-1.5 rounded-full bg-cyan-400 -bottom-0.5 opacity-85" />
                      </div>
                    ) : (
                      /* Smoke curl */
                      <div className="relative h-8 flex items-center justify-center">
                        <div className="w-1.5 h-4 bg-slate-300 rounded-full blur-[1px] -translate-y-1 opacity-60 animate-pulse transition-all duration-700" />
                      </div>
                    )}

                    {/* Candle Wick */}
                    <div className="w-1 h-2 bg-neutral-900 rounded-sm -mb-0.5 z-10 shadow-sm" />

                    {/* Number Candle Body with Self-Contained SVG Defs (Never pitch black!) */}
                    <div className="relative w-13 sm:w-15 h-16 sm:h-18 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                      <svg
                        viewBox="12 14 76 68"
                        className="w-full h-full overflow-visible select-none"
                      >
                        <defs>
                          {/* Rich Silver Gradient */}
                          <linearGradient id={`${idPrefix}-silverGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="30%" stopColor="#e2e8f0" />
                            <stop offset="70%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#f8fafc" />
                          </linearGradient>

                          {/* Bright Ruby Glitter Gradient for Outer Contour */}
                          <linearGradient id={`${idPrefix}-rubyGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fb7185" />
                            <stop offset="40%" stopColor="#e11d48" />
                            <stop offset="100%" stopColor="#9f1239" />
                          </linearGradient>

                          {/* Radiant Turquoise / Sky Blue Glitter Body */}
                          <linearGradient id={`${idPrefix}-blueGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="45%" stopColor="#0284c7" />
                            <stop offset="100%" stopColor="#0369a1" />
                          </linearGradient>

                          {/* Glitter Dots Pattern */}
                          <pattern id={`${idPrefix}-glitterDots`} width="6" height="6" patternUnits="userSpaceOnUse">
                            <rect width="6" height="6" fill="#0284c7" />
                            <circle cx="1.5" cy="1.5" r="0.9" fill="#7dd3fc" opacity="0.95" />
                            <circle cx="4.5" cy="1.5" r="1.1" fill="#ffffff" opacity="0.9" />
                            <circle cx="1.5" cy="4.5" r="0.8" fill="#0369a1" opacity="0.95" />
                            <circle cx="4.5" cy="4.5" r="1.0" fill="#38bdf8" opacity="0.9" />
                          </pattern>
                        </defs>

                        {/* Outer White Frosting Contour Border */}
                        <text
                          x="50"
                          y="72"
                          textAnchor="middle"
                          fontSize="76"
                          fontWeight="900"
                          fontFamily="'Pacifico', 'Be Vietnam Pro', system-ui, sans-serif"
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth="14"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          {digit}
                        </text>

                        {/* Ruby Red Frame */}
                        <text
                          x="50"
                          y="72"
                          textAnchor="middle"
                          fontSize="76"
                          fontWeight="900"
                          fontFamily="'Pacifico', 'Be Vietnam Pro', system-ui, sans-serif"
                          fill={`url(#${idPrefix}-rubyGrad)`}
                          stroke={`url(#${idPrefix}-rubyGrad)`}
                          strokeWidth="10"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          {digit}
                        </text>

                        {/* Inner Sparkling Cyan/Blue Body */}
                        <text
                          x="50"
                          y="72"
                          textAnchor="middle"
                          fontSize="76"
                          fontWeight="900"
                          fontFamily="'Pacifico', 'Be Vietnam Pro', system-ui, sans-serif"
                          fill={`url(#${idPrefix}-glitterDots)`}
                          stroke={`url(#${idPrefix}-blueGrad)`}
                          strokeWidth="4"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          {digit}
                        </text>

                        {/* Top Highlights */}
                        <text
                          x="49"
                          y="71"
                          textAnchor="middle"
                          fontSize="76"
                          fontWeight="900"
                          fontFamily="'Pacifico', 'Be Vietnam Pro', system-ui, sans-serif"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          strokeDasharray="4 8"
                          opacity="0.8"
                        >
                          {digit}
                        </text>

                        {/* 3D Metallic Silver Stars */}
                        {starPositions.map((star, sIdx) => (
                          <SilverStar
                            key={sIdx}
                            x={star.x}
                            y={star.y}
                            size={7.5}
                            rotate={star.rotate}
                            idPrefix={idPrefix}
                          />
                        ))}
                      </svg>
                    </div>

                    {/* White Base Pick Inserted Firmly into Top Frosting */}
                    <div className="w-1.5 h-3 bg-white -mt-0.5 rounded-b-sm border border-slate-300 shadow-sm z-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* SAKURA CHIBI DOLL (Sitting sweetly in front of candles on cake rim) */}
          <div className="relative -mb-3 z-15 flex flex-col items-center">
            {/* Pink Hood / Beret with Cute Rounded Bear Ears */}
            <div className="relative w-18 h-14 rounded-t-full bg-gradient-to-b from-[#f472b6] via-[#ec4899] to-[#db2777] border-2 border-white shadow-md flex items-center justify-center overflow-visible">
              {/* Cute Bear Ears on Beret */}
              <div className="absolute -top-2 left-1.5 w-4.5 h-4.5 rounded-full bg-[#f472b6] border-2 border-white shadow-sm" />
              <div className="absolute -top-2 right-1.5 w-4.5 h-4.5 rounded-full bg-[#f472b6] border-2 border-white shadow-sm" />

              {/* Sakura Hair & Sweet Face - Bright peach skin */}
              <div className="w-14 h-10 rounded-full bg-[#ffe4d6] relative mt-2.5 overflow-hidden shadow-inner flex flex-col items-center border border-pink-200">
                {/* Brown Anime Bob Hair */}
                <div className="absolute top-0 inset-x-0 h-5 bg-[#92400e] rounded-b-xl flex justify-around px-1">
                  <div className="w-2.5 h-3.5 bg-[#78350f] rounded-b-full transform -rotate-6" />
                  <div className="w-3 h-4 bg-[#92400e] rounded-b-full" />
                  <div className="w-2.5 h-3.5 bg-[#78350f] rounded-b-full transform rotate-6" />
                </div>

                {/* Big Anime Eyes & Smile */}
                <div className="mt-4 w-full flex justify-around px-2 items-center">
                  <div className="w-2 h-2.5 rounded-full bg-[#065f46] relative shadow-sm">
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                  <div className="w-1 h-0.5 bg-rose-500 rounded-full mt-0.5" />
                  <div className="w-2 h-2.5 rounded-full bg-[#065f46] relative shadow-sm">
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                </div>

                {/* Rosy Blush Cheeks */}
                <div className="w-full flex justify-between px-1.5 -mt-1">
                  <div className="w-1.5 h-1 bg-pink-400/80 rounded-full blur-[0.5px]" />
                  <div className="w-1.5 h-1 bg-pink-400/80 rounded-full blur-[0.5px]" />
                </div>
              </div>
            </div>

            {/* Ruffled Whipped Cream Collar */}
            <div className="relative -mt-1.5 z-10 w-24 h-4 bg-white rounded-full shadow-md border border-pink-100 flex justify-around items-center px-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 bg-white rounded-b-full shadow-sm border-t border-pink-100" />
              ))}
            </div>
          </div>

          {/* Top Cake Tier Cream Rim with Victorian Rose Rosettes */}
          <div className="relative w-52 sm:w-60 h-10 -mt-1 rounded-t-3xl bg-gradient-to-r from-[#ffe4ec] via-white to-[#ffe4ec] shadow-md border-t-2 border-white flex items-center justify-around px-3">
            {/* Rose Rosettes & Sugar Pearls */}
            <div className="flex items-center gap-1 text-xs">
              <span>🌸</span>
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 shadow-inner inline-block border border-white" />
            </div>
            <div className="w-5 h-2.5 rounded-full bg-pink-200 border border-white flex items-center justify-center">
              <span className="text-[8px] text-pink-500">✨</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-rose-400 to-pink-300 shadow-inner inline-block border border-white" />
              <span>🌸</span>
            </div>
          </div>
        </div>

        {/* CAKE MAIN BODY: BRIGHT, DELICIOUS PASTEL PINK BENTO CAKE */}
        <div className="relative z-10 w-60 sm:w-68 h-28 rounded-2xl bg-gradient-to-b from-[#ffd3e2] via-[#fbcfe8] to-[#f472b6] shadow-2xl border-x-2 border-white flex flex-col justify-between overflow-hidden -mt-0.5">
          {/* Top Victorian Draped Scalloped Lace / Ruffles */}
          <div className="w-full h-8 flex justify-around items-start pt-0.5 px-2 bg-gradient-to-b from-white/90 to-transparent">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-8 sm:w-9 h-5 bg-white rounded-b-full shadow-md border-b-2 border-pink-200 flex items-end justify-center pb-0.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-inner" />
              </div>
            ))}
          </div>

          {/* Sweet Edible Decorations: Fresh Strawberries, Sakura Flowers & Gold Sparkles */}
          <div className="my-auto px-4 flex justify-around items-center select-none drop-shadow-sm">
            <span className="text-base sm:text-lg">🍓</span>
            <span className="text-sm sm:text-base">🌸</span>
            <span className="text-base sm:text-lg">✨</span>
            <span className="text-sm sm:text-base">🌸</span>
            <span className="text-base sm:text-lg">🍓</span>
          </div>

          {/* Bottom Scalloped Lace Piping */}
          <div className="w-full h-7 flex justify-around items-end pb-0.5 px-1 bg-gradient-to-t from-white/90 to-transparent">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-6 sm:w-7 h-4 bg-white rounded-t-full shadow-sm border-t border-pink-200"
              />
            ))}
          </div>
        </div>

        {/* BOTTOM CAKE STAND / BOARD WITH CLOW MAGIC CARDS & PEARL BORDER */}
        <div className="relative z-0 w-68 sm:w-76 flex flex-col items-center -mt-2">
          {/* Turntable / Cake Board - Pure Bright Porcelain White */}
          <div className="w-full h-9 rounded-full bg-gradient-to-r from-stone-100 via-white to-stone-100 border-2 border-white shadow-2xl flex items-center justify-between px-3 relative">
            {/* Magical Clow Tarot Card (Left) */}
            <div className="absolute -left-2 -top-5 w-8 h-13 rounded-md bg-gradient-to-b from-pink-400 via-purple-300 to-amber-200 border border-white shadow-lg transform -rotate-12 flex flex-col items-center justify-center p-0.5 z-10">
              <div className="w-full h-full border border-amber-300/70 rounded-sm flex items-center justify-center text-[10px]">
                ⭐
              </div>
            </div>

            {/* Pearl bead rim */}
            <div className="w-full flex justify-around px-7 opacity-80 text-[9px] select-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i}>⚪</span>
              ))}
            </div>

            {/* Magical Clow Tarot Card (Right) */}
            <div className="absolute -right-2 -top-5 w-8 h-13 rounded-md bg-gradient-to-b from-purple-400 via-pink-300 to-rose-200 border border-white shadow-lg transform rotate-12 flex flex-col items-center justify-center p-0.5 z-10">
              <div className="w-full h-full border border-amber-300/70 rounded-sm flex items-center justify-center text-[10px]">
                🌸
              </div>
            </div>
          </div>

          {/* Stand Base Soft Shadow */}
          <div className="w-52 h-3 rounded-full bg-rose-950/25 blur-md -mt-1" />
        </div>
      </div>

      {/* Blow Candle Action Button - Touch optimized */}
      <div className="mt-4 flex items-center justify-center z-10">
        {candlesLit ? (
          <button
            onClick={blowOutCandles}
            disabled={isBlowing}
            className="px-6 py-3 sm:py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-white font-semibold text-sm shadow-xl hover:shadow-pink-500/30 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer touch-manipulation min-h-[44px]"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">🌬️</span>
            <span>{isBlowing ? 'Đang thổi...' : 'Thổi nến sinh nhật'}</span>
          </button>
        ) : (
          <button
            onClick={relightCandles}
            className="px-5 py-3 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-medium text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md touch-manipulation min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>Thắp lại nến 🕯️</span>
          </button>
        )}
      </div>
    </div>
  );
};
