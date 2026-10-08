import React, { useState } from 'react';
import { Copy, Check, Share2, X, QrCode, Sparkles, ExternalLink, Eye, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseShareUrl: string;
  recipientShareUrl: string;
  recipientName: string;
  onPreviewRecipientMode?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  baseShareUrl,
  recipientShareUrl,
  recipientName,
  onPreviewRecipientMode,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [selectedLinkType, setSelectedLinkType] = useState<'recipient' | 'editor'>('recipient');

  if (!isOpen) return null;

  const currentActiveUrl = selectedLinkType === 'recipient' ? recipientShareUrl : baseShareUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentActiveUrl);
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentActiveUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chúc Mừng Sinh Nhật ${recipientName}! 🎂✨`,
          text: `Một món quà sinh nhật bất ngờ và thiệp điện tử pháo hoa đặc biệt dành tặng riêng cho ${recipientName}!`,
          url: currentActiveUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  // QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    currentActiveUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative max-w-lg w-full bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white leading-normal pb-1">
            Chia Sẻ Thiệp Cho {recipientName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Gửi liên kết thiệp điện tử độc quyền đến bạn ấy
          </p>
        </div>

        {/* Link Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => setSelectedLinkType('recipient')}
            className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer touch-manipulation ${
              selectedLinkType === 'recipient'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Chỉ xem (Đã ẩn sửa)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLinkType('editor')}
            className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer touch-manipulation ${
              selectedLinkType === 'editor'
                ? 'bg-white/20 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="truncate">Link có nút sửa</span>
          </button>
        </div>

        {/* Notice of Recipient Mode */}
        {selectedLinkType === 'recipient' ? (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300 mb-0.5">
                Chế độ an toàn cho người nhận (Đang chọn):
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-200/90">
                Người nhận chỉ thấy hộp quà mở ra, xem ảnh, đọc lời chúc, thổi nến bánh kem 3D và ngắm pháo hoa. 
                <strong className="text-white"> Toàn bộ thanh tùy chỉnh thiệp được ẩn hoàn toàn!</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-0.5">Link dành cho người tạo:</p>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Link này giữ lại nút "Tùy chỉnh thiệp" để bạn có thể chỉnh sửa lại sau này khi cần.
              </p>
            </div>
          </div>
        )}

        {/* Public Web Status Badge */}
        <div className="mb-3 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between text-[11px] text-cyan-200">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Link Web Công Khai (Không cần đăng nhập Google)</span>
          </div>
          <span className="text-[10px] text-cyan-300/80 font-mono">Bảo mật & Tự do</span>
        </div>

        {/* Copy Link Input */}
        <div className="bg-slate-950/70 border border-white/15 rounded-2xl p-2.5 flex items-center gap-2 mb-3">
          <input
            type="text"
            readOnly
            value={currentActiveUrl}
            className="w-full bg-transparent px-2 text-xs text-slate-200 outline-none select-all font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <button
            onClick={() => setShowQr(!showQr)}
            className="py-2.5 px-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 transition-all text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>{showQr ? 'Ẩn mã QR' : 'Mã QR quét ĐT'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 transition-all text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-cyan-300" />
            <span>Gửi qua Zalo/FB</span>
          </button>
        </div>

        {/* Tips for sharing to friends */}
        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
          <p className="font-semibold text-amber-300 flex items-center gap-1">
            <span>💡 Lưu ý quan trọng khi gửi cho bạn bè:</span>
          </p>
          <p className="text-slate-300/90 leading-relaxed">
            • <strong>Không copy link từ thanh địa chỉ trình duyệt</strong> khi bạn đang xem bản nháp (vì chứa tiền tố <code className="text-pink-300 bg-black/40 px-1 py-0.5 rounded">ais-dev-</code> chỉ tài khoản của bạn mới vào được).
          </p>
          <p className="text-slate-300/90 leading-relaxed">
            • Hãy bấm nút <strong>"Sao chép"</strong> hoặc <strong>"Gửi qua Zalo/FB"</strong> ở trên: Hệ thống đã tự động chuyển sang link công khai <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">ais-pre-</code> để bạn bè mở trực tiếp trên điện thoại 100% thành công!
          </p>
        </div>

        {/* QR Code view */}
        {showQr && (
          <div className="bg-white p-4 rounded-2xl mb-4 flex flex-col items-center animate-in fade-in">
            <img
              src={qrCodeUrl}
              alt="Mã QR thiệp sinh nhật"
              className="w-40 h-40 object-contain"
            />
            <p className="text-slate-800 text-xs font-semibold mt-2">
              Quét bằng camera điện thoại để mở ngay thiệp
            </p>
          </div>
        )}

        {/* Test Preview Recipient Mode Button */}
        {onPreviewRecipientMode && (
          <div className="pt-2 border-t border-white/10 flex justify-center">
            <button
              onClick={() => {
                onClose();
                onPreviewRecipientMode();
              }}
              className="text-xs text-pink-300 hover:text-pink-200 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem thử giao diện người nhận (ẩn công cụ sửa)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
