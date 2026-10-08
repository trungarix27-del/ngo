import { BirthdayCardData } from '../types/card';

export function getCardIdFromUrl(): string | null {
  try {
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.startsWith('#id=')) {
      let id = hash.replace('#id=', '');
      const ampIdx = id.indexOf('&');
      if (ampIdx !== -1) id = id.substring(0, ampIdx);
      return id;
    }

    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    if (hashParams.get('id')) return hashParams.get('id');

    const searchParams = new URLSearchParams(search);
    if (searchParams.get('id')) return searchParams.get('id');

    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(cardId: string | null, cardData: BirthdayCardData, viewOnly: boolean): string {
  let origin = window.location.origin;
  const pathname = window.location.pathname;
  const viewSuffix = viewOnly ? '&view=recipient' : '';

  // Transform private Google AI Studio development domain into public shared domain
  // so recipients will never encounter 403 Forbidden permission errors!
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }

  // Generate safe compact hash payload containing message, name, age, wishes, music
  const encodedHash = encodeCardToHash(cardData, viewOnly);
  const cardPayload = encodedHash.replace('#card=', '').replace(/&view=recipient$/, '');

  if (cardId) {
    return `${origin}${pathname}#id=${cardId}&card=${cardPayload}${viewSuffix}`;
  }

  return `${origin}${pathname}${encodedHash}`;
}

export function isRecipientViewOnly(): boolean {
  try {
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      hash.includes('view=recipient') ||
      hash.includes('mode=view') ||
      search.includes('view=recipient') ||
      search.includes('mode=view')
    );
  } catch {
    return false;
  }
}

export function encodeCardToHash(data: BirthdayCardData, viewOnly: boolean = false): string {
  try {
    // Pack all essential text, settings, and media references safely into URL
    const safeData: Partial<BirthdayCardData> = {
      recipientName: data.recipientName,
      senderName: data.senderName,
      age: data.age,
      title: data.title,
      message: data.message,
      secretWish: data.secretWish,
      photoCaption: data.photoCaption,
      theme: data.theme,
      cakeFlavor: data.cakeFlavor,
      candleCount: data.candleCount,
      musicTrack: data.musicTrack,
      autoPlayFireworks: data.autoPlayFireworks,
      soundEnabled: data.soundEnabled,
    };

    // If photo is a web URL or compact data URI, preserve it
    if (data.photoUrl && (data.photoUrl.startsWith('http') || data.photoUrl.length < 50000)) {
      safeData.photoUrl = data.photoUrl;
    }

    const jsonStr = JSON.stringify(safeData);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const viewParam = viewOnly ? '&view=recipient' : '';
    return `#card=${encoded}${viewParam}`;
  } catch (err) {
    console.error('Failed to encode card data:', err);
    return '';
  }
}

export function decodeCardFromHash(): BirthdayCardData | null {
  try {
    const hash = window.location.hash;
    
    // Check hash parameters first (supporting both #card=... and #id=...&card=...)
    if (hash) {
      const cleanHash = hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(cleanHash);
      const cardFromParams = hashParams.get('card');

      if (cardFromParams) {
        let cleanParam = cardFromParams;
        const ampIdx = cleanParam.indexOf('&');
        if (ampIdx !== -1) cleanParam = cleanParam.substring(0, ampIdx);
        const jsonStr = decodeURIComponent(atob(cleanParam));
        return JSON.parse(jsonStr) as BirthdayCardData;
      }

      if (hash.startsWith('#card=')) {
        let base64 = hash.replace('#card=', '');
        const ampIdx = base64.indexOf('&');
        if (ampIdx !== -1) {
          base64 = base64.substring(0, ampIdx);
        }
        const jsonStr = decodeURIComponent(atob(base64));
        return JSON.parse(jsonStr) as BirthdayCardData;
      }
    }

    // Also check query param ?card=...
    const urlParams = new URLSearchParams(window.location.search);
    const cardParam = urlParams.get('card');
    if (cardParam) {
      let cleanParam = cardParam;
      const ampIdx = cleanParam.indexOf('&');
      if (ampIdx !== -1) {
        cleanParam = cleanParam.substring(0, ampIdx);
      }
      const jsonStr = decodeURIComponent(atob(cleanParam));
      return JSON.parse(jsonStr) as BirthdayCardData;
    }

    return null;
  } catch (err) {
    console.warn('Failed to parse card data from URL hash:', err);
    return null;
  }
}

/**
 * High-definition smart image optimizer:
 * Preserves high resolution (up to 1280x1920 HD) with high-quality bicubic smoothing
 * and WebP encoding for crisp clarity without blurring faces or details.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1920,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain exact aspect ratio and only scale down if above maxWidth/maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Enable high quality rendering interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first (crisper and more lightweight), fallback to JPEG
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp.startsWith('data:image/webp')) {
            resolve(webp);
            return;
          }
        } catch {
          // Fallback to jpeg
        }

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 100% lossless original image loader (Zero compression, full 1707x2560 resolution)
 */
export function readOriginalImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
