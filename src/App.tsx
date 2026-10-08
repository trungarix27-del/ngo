/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BirthdayCardData } from './types/card';
import {
  decodeCardFromHash,
  isRecipientViewOnly,
  getCardIdFromUrl,
  buildShareUrl,
} from './utils/urlState';
import {
  saveCardLocally,
  loadCardLocally,
  saveCardToServer,
  fetchCardFromServer,
  getSynchronousSavedCard,
} from './utils/cardStorage';
import { FireworksCanvas } from './components/FireworksCanvas';
import { CardViewer } from './components/CardViewer';
import { CardEditorModal } from './components/CardEditorModal';
import { ShareModal } from './components/ShareModal';

const DEFAULT_CARD_DATA: BirthdayCardData = {
  recipientName: 'Minh Anh',
  senderName: 'Bạn thân tri kỷ',
  age: 22,
  title: 'Chúc Mừng Sinh Nhật Tuổi Mới Rực Rỡ!',
  message:
    'Chúc mừng sinh nhật bạn thân của tao! Bước sang tuổi mới, chúc mày luôn giữ mãi nụ cười rạng rỡ, tâm hồn an yên, tiền đầy túi, tình đầy tim và sớm đạt được mọi hoài bão mà mày hằng ấp ủ nhé. Cảm ơn vì đã luôn đồng hành cùng nhau! 🎂✨🥂💖',
  secretWish: 'Cuối tuần này tao bao trọn một bữa tiệc bất ngờ hoành tráng nhé! Hẹn gặp lúc 19h! 🎁🎉',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  photoCaption: 'Tuổi mới rạng ngời như ánh mặt trời ✨',
  theme: 'sunset-joy',
  cakeFlavor: 'strawberry',
  candleCount: 3,
  musicTrack: 'synth-birthday',
  autoPlayFireworks: true,
  soundEnabled: false,
};

export default function App() {
  // Synchronous initialization ensures instant restoration on page reload
  const [cardData, setCardData] = useState<BirthdayCardData>(() => {
    // 1. Check URL hash first if directly given
    const hashCard = decodeCardFromHash();
    if (hashCard) return hashCard;

    // 2. Check local synchronous storage draft
    const saved = getSynchronousSavedCard();
    if (saved) return saved;

    // 3. Fallback to default
    return DEFAULT_CARD_DATA;
  });

  const [cardId, setCardId] = useState<string | null>(() => getCardIdFromUrl());
  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(() => isRecipientViewOnly());
  const [isPreviewingRecipient, setIsPreviewingRecipient] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const syncTimeoutRef = useRef<number | null>(null);

  // 1. Initial Load: Check URL ID -> Check URL Hash -> Check Local Persistent Storage
  useEffect(() => {
    async function initializeApp() {
      const urlId = getCardIdFromUrl();
      if (urlId) {
        setCardId(urlId);
        const serverCard = await fetchCardFromServer(urlId);
        if (serverCard) {
          setCardData(serverCard);
          await saveCardLocally(serverCard);
          setIsInitialized(true);
          return;
        }
      }

      // Fallback: check hash encoded payload
      const hashCard = decodeCardFromHash();
      if (hashCard) {
        setCardData(hashCard);
        await saveCardLocally(hashCard);
        setIsInitialized(true);
        return;
      }

      // Check IndexedDB local draft (for full high-res photo and custom audio)
      const localCard = await loadCardLocally();
      if (localCard) {
        setCardData(localCard);
      } else {
        // Fallback: check if server has a latest saved card
        try {
          const res = await fetch('/api/cards/latest');
          if (res.ok) {
            const data = await res.json();
            if (data.card) {
              setCardData(data.card);
              setCardId(data.id);
              await saveCardLocally(data.card);
            }
          }
        } catch {
          // Ignore
        }
      }

      setIsInitialized(true);
    }

    initializeApp();
  }, []);

  // 2. Synchronize to IndexedDB & Server whenever cardData changes
  useEffect(() => {
    if (!isInitialized) return;

    // Immediately save to local IndexedDB
    saveCardLocally(cardData);

    // Debounce server upload to avoid excessive requests while typing
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(async () => {
      const savedId = await saveCardToServer(cardData, cardId || undefined);
      if (savedId) {
        setCardId(savedId);
        // Update URL hash cleanly with short ID
        const viewSuffix = isRecipientMode ? '&view=recipient' : '';
        window.history.replaceState(null, '', `${window.location.pathname}#id=${savedId}${viewSuffix}`);
      }
    }, 600);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cardData, isInitialized, cardId, isRecipientMode]);

  // Handle hash changes (e.g. if recipient mode is toggled)
  useEffect(() => {
    const handleHashChange = async () => {
      setIsRecipientMode(isRecipientViewOnly());
      const newUrlId = getCardIdFromUrl();
      if (newUrlId && newUrlId !== cardId) {
        setCardId(newUrlId);
        const card = await fetchCardFromServer(newUrlId);
        if (card) setCardData(card);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [cardId]);

  const handleSaveCardData = async (updated: BirthdayCardData) => {
    setCardData(updated);
    await saveCardLocally(updated);
    const newId = await saveCardToServer(updated, cardId || undefined);
    if (newId) {
      setCardId(newId);
    }
  };

  const isViewOnlyEffective = isRecipientMode || isPreviewingRecipient;

  // Generate robust short URLs for sharing
  const baseShareUrl = buildShareUrl(cardId, cardData, false);
  const recipientShareUrl = buildShareUrl(cardId, cardData, true);

  return (
    <div className="relative min-h-[100dvh] w-full select-none overflow-x-hidden">
      {/* Full-Screen Silent Fireworks Canvas */}
      <FireworksCanvas
        autoLaunch={cardData.autoPlayFireworks}
        soundEnabled={false}
        intensity="medium"
      />

      {/* Main Interactive Card Interface */}
      <div className="relative z-10">
        <CardViewer
          cardData={cardData}
          isViewOnly={isViewOnlyEffective}
          onOpenEditor={() => setIsEditorOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onUpdateCardData={handleSaveCardData}
          onTogglePreviewRecipient={
            isRecipientMode ? undefined : () => setIsPreviewingRecipient((prev) => !prev)
          }
        />
      </div>

      {/* Customizer Modal */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={cardData}
        onSave={handleSaveCardData}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        baseShareUrl={baseShareUrl}
        recipientShareUrl={recipientShareUrl}
        recipientName={cardData.recipientName}
        onPreviewRecipientMode={() => setIsPreviewingRecipient(true)}
      />
    </div>
  );
}
