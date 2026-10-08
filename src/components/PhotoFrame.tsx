import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface PhotoFrameProps {
  photoUrl?: string;
  recipientName: string;
  caption?: string;
  theme?: string;
}

export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  photoUrl,
  recipientName,
  caption,
}) => {
  // If no photo is provided, display a cute celebratory avatar illustration
  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85';
  const displayImage = photoUrl && photoUrl.trim().length > 0 ? photoUrl : defaultPhoto;

  return (
    <div className="relative group max-w-[280px] sm:max-w-xs md:max-w-sm w-full mx-auto my-2 sm:my-3 select-none">
      {/* Decorative corner sparkles */}
      <div className="absolute -top-3 -right-3 text-amber-300 animate-spin z-20 pointer-events-none">
        <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 drop-shadow-md" />
      </div>
      <div className="absolute -bottom-3 -left-3 text-pink-400 animate-bounce z-20 pointer-events-none">
        <Heart className="w-5 sm:w-6 h-5 sm:h-6 fill-pink-400 drop-shadow-md" />
      </div>

      {/* Polaroid Style Card - Always radiant pure white photo paper */}
      <div className="relative bg-white text-slate-800 p-3 sm:p-4 pb-4 sm:pb-5 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white/90 transform transition-transform duration-300">
        {/* Subtle washi tape effect at top */}
        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 sm:h-6 bg-amber-100/70 backdrop-blur-md rounded-sm border border-amber-200/50 shadow-sm rotate-1 pointer-events-none" />

        {/* Photo container - Portrait (3:4) with clean frame */}
        <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center border border-slate-200/50">
          <img
            src={displayImage}
            alt={`Hình ảnh của ${recipientName}`}
            className="w-full h-full object-cover select-none"
            style={{ imageRendering: 'auto' }}
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultPhoto;
            }}
          />
        </div>

        {/* Caption */}
        <div className="mt-2.5 sm:mt-3 text-center px-1">
          <p className="font-handwriting text-xl sm:text-2xl font-bold text-slate-800 leading-normal pb-2 pt-0.5 px-1 break-words">
            {caption || `Khoảnh khắc tuyệt đẹp của ${recipientName} ✨`}
          </p>
          <p className="text-[10px] sm:text-[11px] text-pink-600 font-semibold tracking-wider uppercase mt-0.5">
            Forever Young & Sparkling
          </p>
        </div>
      </div>
    </div>
  );
};

