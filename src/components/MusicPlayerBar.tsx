import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { MusicTrackId } from '../types/card';

interface MusicPlayerBarProps {
  currentTrack: MusicTrackId;
  customMusicUrl?: string;
  onTrackChange: (track: MusicTrackId) => void;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  currentTrack,
  customMusicUrl,
  onTrackChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTrackMenu, setShowTrackMenu] = useState<boolean>(false);

  useEffect(() => {
    // Keep local playing state in sync
    const checkState = () => {
      setIsPlaying(audioEngine.getIsPlaying());
    };
    const timer = setInterval(checkState, 400);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = async () => {
    await audioEngine.resume();
    if (isPlaying) {
      audioEngine.stopMusic();
      setIsPlaying(false);
    } else {
      audioEngine.startMusic(currentTrack, customMusicUrl);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = async (track: MusicTrackId) => {
    onTrackChange(track);
    setShowTrackMenu(false);
    await audioEngine.resume();
    audioEngine.startMusic(track, customMusicUrl);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioEngine.setMuted(newMuted);
  };

  const trackLabels: Record<MusicTrackId, string> = {
    'synth-birthday': 'Sinh nhật sôi động 🎶',
    'music-box': 'Hộp nhạc du dương 🧸',
    'party-beat': 'Tiệc tùng sôi nổi 🥁',
    'acoustic-warm': 'Ấm áp & Dịu dàng 🎸',
    'custom': 'Nhạc cá nhân tải lên 🎵',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Play / Pause with Equalizer */}
      <button
        onClick={toggleMusic}
        className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
          isPlaying
            ? 'bg-pink-500/80 hover:bg-pink-500 text-white border border-pink-400/50'
            : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/20'
        }`}
        title={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}

        {/* Animated equalizer waves */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5 px-0.5">
            <span className="w-0.5 h-full bg-white animate-pulse" style={{ animationDuration: '0.4s' }} />
            <span className="w-0.5 h-2/3 bg-white animate-pulse" style={{ animationDuration: '0.6s' }} />
            <span className="w-0.5 h-full bg-white animate-pulse" style={{ animationDuration: '0.3s' }} />
            <span className="w-0.5 h-1/2 bg-white animate-pulse" style={{ animationDuration: '0.5s' }} />
          </div>
        ) : (
          <Music className="w-4 h-4" />
        )}

        <span className="hidden md:inline">{isPlaying ? 'Đang phát nhạc' : 'Phát nhạc'}</span>
      </button>

      {/* Track Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowTrackMenu(!showTrackMenu)}
          className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Chọn bài hát chúc mừng"
        >
          <Music className="w-3.5 h-3.5 text-amber-300" />
          <span className="max-w-[120px] truncate">{trackLabels[currentTrack]}</span>
        </button>

        {showTrackMenu && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-3 py-1">
              Giai điệu chúc mừng
            </div>
            {(['synth-birthday', 'music-box', 'party-beat'] as MusicTrackId[]).map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTrack(t)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentTrack === t
                    ? 'bg-pink-500/20 text-pink-300 font-semibold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span>{trackLabels[t]}</span>
                {currentTrack === t && <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />}
              </button>
            ))}
            {customMusicUrl && (
              <button
                onClick={() => handleSelectTrack('custom')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentTrack === 'custom'
                    ? 'bg-pink-500/20 text-pink-300 font-semibold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span>{trackLabels.custom}</span>
                {currentTrack === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-colors cursor-pointer"
        title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
