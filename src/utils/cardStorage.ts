import { BirthdayCardData } from '../types/card';

const DB_NAME = 'BirthdayCardAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'cards';
const DRAFT_KEY = 'user_current_card_draft';
export const LOCAL_STORAGE_KEY = 'birthday_card_saved_draft';

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Synchronously retrieve the saved card from localStorage.
 * Used for zero-delay, zero-flicker state initialization upon page load.
 */
export function getSynchronousSavedCard(): BirthdayCardData | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.recipientName) {
        return parsed as BirthdayCardData;
      }
    }
  } catch (err) {
    console.warn('Failed to read synchronous card from localStorage:', err);
  }
  return null;
}

/**
 * Save card data locally both in localStorage (instant synchronous fallback)
 * and IndexedDB (capable of holding large multi-megabyte photos and full audio tracks).
 */
export async function saveCardLocally(card: BirthdayCardData): Promise<void> {
  // 1. Synchronously commit to localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(card));
  } catch (err) {
    // If quota exceeded due to high-res photo, save a lighter draft to localStorage
    try {
      const lightCard = { ...card };
      // Keep everything except giant audio strings if space is constrained
      if (lightCard.customMusicUrl && lightCard.customMusicUrl.length > 500000) {
        lightCard.customMusicUrl = '';
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightCard));
    } catch {
      // Ignore quota error
    }
  }

  // 2. Commit to IndexedDB asynchronously for full raw photo & custom music persistence
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(card, DRAFT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }
}

/**
 * Load draft card data from local IndexedDB, falling back to localStorage.
 */
export async function loadCardLocally(): Promise<BirthdayCardData | null> {
  // 1. Try IndexedDB first (contains original photo and custom audio)
  try {
    const db = await openDB();
    const idbResult = await new Promise<BirthdayCardData | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DRAFT_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (idbResult && idbResult.recipientName) {
      return idbResult;
    }
  } catch (err) {
    console.warn('IndexedDB load failed:', err);
  }

  // 2. Fallback to localStorage
  return getSynchronousSavedCard();
}

/**
 * Upload card to backend to generate a clean short shareable link
 */
export async function saveCardToServer(card: BirthdayCardData, existingId?: string): Promise<string | null> {
  try {
    const url = existingId ? `/api/cards/${existingId}` : '/api/cards';
    const method = existingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.id || existingId || null;
  } catch (err) {
    console.warn('Failed to save card to server:', err);
    return null;
  }
}

/**
 * Fetch card by ID from backend
 */
export async function fetchCardFromServer(id: string): Promise<BirthdayCardData | null> {
  try {
    const res = await fetch(`/api/cards/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.card || null;
  } catch (err) {
    console.warn('Failed to fetch card from server:', err);
    return null;
  }
}
