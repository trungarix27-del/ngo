import React, { useState, useEffect } from 'react';
import { BirthdayCardData, CakeFlavor, MusicTrackId, ThemeId } from '../types/card';
import { PRESET_WISHES } from '../utils/presetWishes';
import { compressImageFile, readOriginalImageFile } from '../utils/urlState';
import { saveCardLocally } from '../utils/cardStorage';
import { audioEngine } from '../utils/audioEngine';
import {
  X,
  Upload,
  Music,
  Image as ImageIcon,
  Heart,
  Cake,
  Palette,
  Play,
  Pause,
  Check,
  Sparkles,
} from 'lucide-react';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: BirthdayCardData;
  onSave: (data: BirthdayCardData) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [data, setData] = useState<BirthdayCardData>(initialData);
  const [activeTab, setActiveTab] = useState<'wishes' | 'photo' | 'music' | 'theme'>('wishes');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string>('');
  const [uploadQuality, setUploadQuality] = useState<'hd' | 'original'>('hd');

  // CRITICAL: Always sync with current cardData whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof BirthdayCardData, value: any) => {
    setData((prev) => {
      const updated = { ...prev, [field]: value };
      saveCardLocally(updated);
      return updated;
    });
  };

  const handleApplyPresetWish = (presetText: string) => {
    setData((prev) => {
      const updated = { ...prev, message: presetText };
      saveCardLocally(updated);
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadStatus('Đang xử lý ảnh chất lượng cao...');
    try {
      let imageDataUrl: string;
      if (uploadQuality === 'original') {
        // 100% original uncompressed image (e.g. full 1707x2560)
        imageDataUrl = await readOriginalImageFile(file);
        setImageUploadStatus(`Đã tải 100% ảnh gốc sắc nét (${Math.round(file.size / 1024)} KB)!`);
      } else {
        // High Definition HD (1280x1920 WebP with high quality smoothing)
        imageDataUrl = await compressImageFile(file, 1280, 1920, 0.88);
        setImageUploadStatus('Đã tải ảnh HD siêu nét (1280x1920px)!');
      }

      setData((prev) => {
        const updated = { ...prev, photoUrl: imageDataUrl };
        saveCardLocally(updated);
        return updated;
      });
      setTimeout(() => setImageUploadStatus(''), 4000);
    } catch (err) {
      console.error(err);
      setImageUploadStatus('Lỗi khi tải ảnh. Vui lòng thử lại.');
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const audioDataUrl = event.target?.result as string;
      setData((prev) => {
        const updated = {
          ...prev,
          musicTrack: 'custom' as const,
          customMusicUrl: audioDataUrl,
        };
        saveCardLocally(updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const togglePreviewMusic = async () => {
    await audioEngine.resume();
    if (isPlayingPreview) {
      audioEngine.stopMusic();
      setIsPlayingPreview(false);
    } else {
      audioEngine.startMusic(data.musicTrack, data.customMusicUrl);
      setIsPlayingPreview(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.stopMusic();
    setIsPlayingPreview(false);
    onSave(data);
    onClose();
  };

  const themes: { id: ThemeId; name: string; color: string }[] = [
    { id: 'sunset-joy', name: 'Hoàng Hôn Ấm Áp 🌅', color: 'from-amber-400 via-rose-500 to-purple-600' },
    { id: 'cute-pastel', name: 'Hồng Phấn Ngọt Ngào 🌸', color: 'from-pink-300 via-rose-300 to-indigo-300' },
    { id: 'neon-party', name: 'Neon Sôi Động 🎆', color: 'from-cyan-400 via-violet-500 to-fuchsia-500' },
    { id: 'golden-luxury', name: 'Hoàng Kim Sang Trọng ✨', color: 'from-amber-200 via-yellow-400 to-amber-600' },
    { id: 'twilight-magic', name: 'Đêm Sao Lung Linh 🌌', color: 'from-indigo-900 via-purple-900 to-slate-900' },
  ];

  const cakeFlavors: { id: CakeFlavor; name: string; emoji: string }[] = [
    { id: 'strawberry', name: 'Dâu Tây Kem Tươi', emoji: '🍓' },
    { id: 'chocolate', name: 'Socola Bỉ Đậm Đà', emoji: '🍫' },
    { id: 'matcha', name: 'Matcha Trà Xanh', emoji: '🍃' },
    { id: 'rainbow', name: 'Cầu Vồng Lễ Hội', emoji: '🌈' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="relative max-w-2xl w-full bg-slate-900 border border-white/20 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2 leading-normal pb-1">
              <span>Tùy Chỉnh Thiệp Sinh Nhật</span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cá nhân hóa lời chúc, hình ảnh, bài hát và phong cách cho bạn của bạn
            </p>
          </div>
          <button
            onClick={() => {
              audioEngine.stopMusic();
              setIsPlayingPreview(false);
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-4 bg-slate-950/40 shrink-0 overflow-x-auto">
          {[
            { id: 'wishes', label: 'Lời chúc & Tên', icon: Heart },
            { id: 'photo', label: 'Hình ảnh bạn ấy', icon: ImageIcon },
            { id: 'music', label: 'Nhạc nền sinh nhật', icon: Music },
            { id: 'theme', label: 'Chủ đề & Bánh kem', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-pink-500 text-pink-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: LỜI CHÚC & THÔNG TIN */}
          {activeTab === 'wishes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tên người bạn được chúc mừng <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={data.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder="Ví dụ: Minh Anh, Thảo Vy, Đức Huy..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tuổi / Cột mốc (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={data.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Ví dụ: 20, 22, 25..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tiêu đề chúc mừng
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Chúc Mừng Sinh Nhật Tuổi Mới Rực Rỡ!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tên của bạn (Người gửi)
                  </label>
                  <input
                    type="text"
                    value={data.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder="Ví dụ: Hoàng Long, Bạn thân của cậu..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Lời chúc sinh nhật chân thành <span className="text-pink-400">*</span>
                  </label>
                </div>
                <textarea
                  rows={4}
                  required
                  value={data.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Viết những lời chúc ngọt ngào, chân thành hoặc vui nhộn gửi tới bạn của bạn..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm leading-relaxed"
                />
              </div>

              {/* Preset Wishes Quick Selector */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chọn nhanh mẫu lời chúc ý nghĩa:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {PRESET_WISHES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPresetWish(preset.message)}
                      className="p-2.5 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-pink-500/20 hover:border-pink-500/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-pink-300 group-hover:text-pink-200">
                        <span>{preset.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 group-hover:text-slate-200">
                        {preset.message}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Wish unlocked after blowing candles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>Điều ước bí mật (Mở ra sau khi bạn ấy thổi nến) 🎁</span>
                </label>
                <input
                  type="text"
                  value={data.secretWish || ''}
                  onChange={(e) => handleInputChange('secretWish', e.target.value)}
                  placeholder="Ví dụ: Cuối tuần này tao bao một bữa lẩu hoành tráng nhé! Hẹn gặp lúc 19h!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 2: HÌNH ẢNH BẠN ẤY */}
          {activeTab === 'photo' && (
            <div className="space-y-5">
              {/* Quality mode selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Chế độ tải ảnh
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadQuality('hd')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      uploadQuality === 'hd'
                        ? 'border-pink-500 bg-pink-500/20 text-white'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                      <span>Nét Căng HD (1280x1920) ✨</span>
                      {uploadQuality === 'hd' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ảnh siêu nét từng chi tiết, tối ưu kích thước để dễ chia sẻ qua link.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadQuality('original')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      uploadQuality === 'original'
                        ? 'border-amber-400 bg-amber-500/20 text-white'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>100% Ảnh Gốc (1707x2560) 💎</span>
                      {uploadQuality === 'original' && <Check className="w-3.5 h-3.5 text-amber-300" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Không nén pixel nào, giữ nguyên 100% độ phân giải gốc của ảnh.
                    </p>
                  </button>
                </div>
              </div>

              {/* Photo Preview & Upload */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/15 flex flex-col items-center">
                {/* Current photo preview in portrait 3:4 */}
                <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-pink-400/50 shadow-xl mb-4 bg-slate-900 flex items-center justify-center relative">
                  {data.photoUrl ? (
                    <img
                      src={data.photoUrl}
                      alt="Xem trước ảnh bạn ấy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                      <span className="text-xs">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {imageUploadStatus && (
                  <p className="text-xs text-emerald-400 font-semibold mb-3 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    {imageUploadStatus}
                  </p>
                )}

                {/* Upload Button */}
                <label className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>
                    Tải ảnh từ máy ({uploadQuality === 'original' ? '100% Gốc' : 'HD Siêu Nét'})
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or Direct Image URL with Tip */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hoặc dán đường dẫn ảnh trực tiếp (URL)
                </label>
                <input
                  type="url"
                  value={data.photoUrl || ''}
                  onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                  placeholder="https://example.com/hinh-anh-ban-ay.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs sm:text-sm"
                />
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200/90 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mẹo chất lượng tốt nhất:</strong> Dán link ảnh từ Imgur, Facebook, Google Drive, Postimages hoặc Zalo giúp giữ nguyên vẹn 100% độ phân giải 2K/4K và link thiệp chia sẻ nhẹ tênh!
                  </span>
                </div>
              </div>

              {/* Photo Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Dòng chữ ghi chú dưới ảnh (Caption)
                </label>
                <input
                  type="text"
                  value={data.photoCaption || ''}
                  onChange={(e) => handleInputChange('photoCaption', e.target.value)}
                  placeholder="Ví dụ: Khoảnh khắc rạng rỡ nhất của cậu ✨"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NHẠC NỀN SINH NHẬT */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Chọn bản nhạc chúc mừng sinh nhật
                </label>
                <button
                  type="button"
                  onClick={togglePreviewMusic}
                  className="px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-pink-500/30"
                >
                  {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingPreview ? 'Dừng nghe thử' : 'Nghe thử giai điệu'}</span>
                </button>
              </div>

              {/* Built-in Tracks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'synth-birthday',
                    title: 'Sinh Nhật Sôi Động (Happy Birthday) 🎶',
                    desc: 'Giai điệu vui tươi với đàn chuông marimba & nhịp điệu rộn ràng',
                  },
                  {
                    id: 'music-box',
                    title: 'Hộp Nhạc Du Dương 🧸',
                    desc: 'Âm thanh hộp nhạc cổ tích êm dịu, ấm áp và hoài niệm',
                  },
                  {
                    id: 'party-beat',
                    title: 'Tiệc Tùng Sôi Nổi (Carnival Groove) 🥁',
                    desc: 'Tiết tấu nhịp điệu hiện đại, sôi động mừng tiệc tùng',
                  },
                ].map((track) => {
                  const isSelected = data.musicTrack === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleInputChange('musicTrack', track.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/15 shadow-lg'
                          : 'border-white/10 bg-slate-950/60 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-white">{track.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{track.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Audio Upload or URL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Tùy chọn tải nhạc bài hát riêng (MP3)</span>
                  </span>
                  {data.musicTrack === 'custom' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-semibold">
                      Đang chọn nhạc riêng
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 cursor-pointer border border-white/15">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file MP3 từ máy</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleCustomAudioUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-400">hoặc dán đường dẫn link mp3:</span>
                </div>

                <input
                  type="url"
                  value={data.customMusicUrl || ''}
                  onChange={(e) => {
                    handleInputChange('customMusicUrl', e.target.value);
                    if (e.target.value.trim().length > 0) {
                      handleInputChange('musicTrack', 'custom');
                    }
                  }}
                  placeholder="https://example.com/bai-hat-sinh-nhat.mp3"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CHỦ ĐỀ & BÁNH KEM */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Themes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Chủ đề màu sắc thiệp
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {themes.map((t) => {
                    const isSelected = data.theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleInputChange('theme', t.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500/15 ring-2 ring-pink-500/30'
                            : 'border-white/10 bg-slate-950/60 hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${t.color} shrink-0 shadow-md`}
                        />
                        <span className="text-xs font-semibold text-white">{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cake Flavor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-pink-400" />
                  <span>Hương vị bánh kem sinh nhật</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cakeFlavors.map((c) => {
                    const isSelected = data.cakeFlavor === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleInputChange('cakeFlavor', c.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500/20 shadow-md'
                            : 'border-white/10 bg-slate-950/60 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-2xl mb-1">{c.emoji}</div>
                        <div className="text-xs font-semibold text-white">{c.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Candle Count */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Số lượng nến trên bánh
                  </label>
                  <span className="text-sm font-bold text-amber-300">
                    {data.candleCount} ngọn nến 🕯️
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={data.candleCount}
                  onChange={(e) => handleInputChange('candleCount', parseInt(e.target.value, 10))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                audioEngine.stopMusic();
                setIsPlayingPreview(false);
                onClose();
              }}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-semibold text-sm shadow-xl hover:shadow-pink-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lưu & Xem Thiệp Ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
