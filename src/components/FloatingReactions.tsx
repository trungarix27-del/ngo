import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  duration: number;
}

export const FloatingReactions: React.FC = () => {
  const [reactions, setReactions] = useState<FloatingEmoji[]>([]);

  const reactionButtons = [
    { emoji: '❤️', label: 'Thả tim', sound: 'sparkle' },
    { emoji: '🥳', label: 'Quẩy lên', sound: 'boom' },
    { emoji: '🎂', label: 'Bánh kem', sound: 'sparkle' },
    { emoji: '🥂', label: 'Cạn ly', sound: 'sparkle' },
    { emoji: '🚀', label: 'Bắn pháo', sound: 'boom' },
    { emoji: '🎁', label: 'Tặng quà', sound: 'sparkle' },
  ] as const;

  const triggerReaction = (emoji: string, sound: 'boom' | 'sparkle') => {
    // Audio effect
    audioEngine.playFireworkBurst(sound);

    // Launch firework if rocket
    if (emoji === '🚀' && typeof (window as unknown as { launchCelebrationFirework?: (t: string) => void }).launchCelebrationFirework === 'function') {
      (window as unknown as { launchCelebrationFirework: (t: string) => void }).launchCelebrationFirework('star');
    }

    const newItems: FloatingEmoji[] = Array.from({ length: 4 }).map(() => ({
      id: Date.now() + Math.random(),
      emoji,
      x: 30 + Math.random() * 40, // 30% to 70% width
      duration: 2.5 + Math.random() * 1.5,
    }));

    setReactions((prev) => [...prev.slice(-20), ...newItems]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => !newItems.some((n) => n.id === r.id)));
    }, 4000);
  };

  return (
    <>
      {/* Floating Emojis Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 text-3xl sm:text-4xl select-none animate-float"
            style={{
              left: `${r.x}%`,
              animation: `floatUp ${r.duration}s cubic-bezier(0.2, 0.8, 0.3, 1) forwards`,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-40px) scale(1.2) rotate(-8deg);
          }
          70% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-500px) scale(1) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating Reaction Bar at Bottom */}
      <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
        <span className="hidden sm:inline-block text-xs font-medium text-slate-300 pl-1 pr-2">
          Gửi tương tác:
        </span>
        {reactionButtons.map((btn) => (
          <button
            key={btn.emoji}
            onClick={() => triggerReaction(btn.emoji, btn.sound)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-white/15 active:scale-125 transition-all text-xl sm:text-2xl cursor-pointer group flex items-center justify-center"
            title={btn.label}
          >
            <span className="group-hover:scale-125 transition-transform">
              {btn.emoji}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};
