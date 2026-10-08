import React, { useState } from 'react';
import { X, Download, CheckCircle2, ShieldCheck, Sparkles, FolderGit2, Globe, Heart, Loader2 } from 'lucide-react';
import { BirthdayCardData } from '../types/card';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: BirthdayCardData;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({
  isOpen,
  onClose,
  cardData,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      // Send current cardData to ensure all customizations are baked in
      const response = await fetch('/api/export-recipient-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardData }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thiep-sinh-nhat-${cardData.recipientName ? cardData.recipientName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'ngoc-lan'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setHasExported(true);
    } catch (err) {
      console.error('Error exporting zip:', err);
      // Fallback direct link
      window.location.href = '/api/download-zip';
      setHasExported(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 border border-white/10 transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Xuất Toàn Bộ Code .ZIP
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Chế độ người nhận
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Dành riêng cho {cardData.recipientName} ({cardData.age} tuổi)
            </p>
          </div>
        </div>

        {/* Key Features Confirmation */}
        <div className="space-y-2.5 mb-5 p-3.5 sm:p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>
              <strong>Dữ liệu đã tùy chỉnh 100%:</strong> Tên <em>{cardData.recipientName}</em>, lời chúc, tuổi {cardData.age}, ảnh đại diện và bài hát đã được gắn cứng làm mặc định trong code.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <span>
              <strong>Khóa giao diện người nhận:</strong> Khi bạn bè mở web, app sẽ <strong>không có nút chỉnh sửa hay tùy chỉnh</strong>, chỉ có hộp quà 3D, bánh kem thổi nến, pháo hoa và nhạc!
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <span>
              <strong>Đã sửa lỗi Vercel:</strong> Đường dẫn <code>/src/main.tsx</code> đã được chuẩn hóa, deploy lên Vercel chạy ngay không báo lỗi.
            </span>
          </div>
        </div>

        {/* Big Action Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-xl shadow-teal-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation disabled:opacity-70 mb-4"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang đóng gói file ZIP tùy chỉnh...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Tải Mã Nguồn .ZIP Về Máy Ngay</span>
            </>
          )}
        </button>

        {/* Quick Instructions */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] sm:text-xs text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            Cách đưa lên GitHub & Vercel sau khi tải:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Giải nén file ZIP vừa tải về máy.</li>
            <li>Tải toàn bộ thư mục đó lên kho mã nguồn (Repository) trên GitHub của bạn.</li>
            <li>Vào Vercel bấm <strong>New Project</strong> → Chọn repository GitHub đó → Bấm <strong>Deploy</strong> là xong!</li>
          </ol>
        </div>

        {hasExported && (
          <div className="mt-3 text-center text-xs text-emerald-400 font-medium animate-in fade-in">
            ✨ Đã tải file zip thành công! Hãy giải nén và tải lên GitHub nhé!
          </div>
        )}
      </div>
    </div>
  );
};
