import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High payload limit (50MB) to easily accept high-res photos and full MP3 audio tracks
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistence directory
const DATA_DIR = path.join(__dirname, 'data');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store + file sync
let cardsStore: Record<string, any> = {};
if (fs.existsSync(CARDS_FILE)) {
  try {
    cardsStore = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf-8'));
  } catch (err) {
    cardsStore = {};
  }
}

function saveStore() {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsStore), 'utf-8');
  } catch (err) {
    console.error('Failed to save cards to disk:', err);
  }
}

// API Routes
app.get('/api/cards/latest', (_req, res) => {
  try {
    const ids = Object.keys(cardsStore);
    if (ids.length === 0) {
      return res.status(404).json({ error: 'No cards found' });
    }
    const latestId = ids[ids.length - 1];
    res.json({ success: true, id: latestId, card: cardsStore[latestId] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cards', (req, res) => {
  try {
    const cardData = req.body;
    const id = 'card_' + Math.random().toString(36).substring(2, 9);
    cardsStore[id] = cardData;
    saveStore();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cards/:id', (req, res) => {
  try {
    const { id } = req.params;
    cardsStore[id] = req.body;
    saveStore();
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const card = cardsStore[id];
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  res.json({ success: true, card });
});

// Helper to extract base64 images and audio to static public files
function extractAssetsAndCleanCard(card: any) {
  const cleaned = { ...card };
  if (cleaned.photoUrl && typeof cleaned.photoUrl === 'string' && cleaned.photoUrl.startsWith('data:image')) {
    try {
      const parts = cleaned.photoUrl.split(';base64,');
      if (parts.length === 2) {
        const ext = parts[0].includes('png') ? 'png' : parts[0].includes('webp') ? 'webp' : 'jpg';
        const buffer = Buffer.from(parts[1], 'base64');
        const imgDir = path.join(__dirname, 'public', 'images');
        fs.mkdirSync(imgDir, { recursive: true });
        fs.writeFileSync(path.join(imgDir, `birthday-photo.${ext}`), buffer);
        cleaned.photoUrl = `./images/birthday-photo.${ext}`;
      }
    } catch (err) {
      console.error('Failed to extract photo:', err);
    }
  }

  if (cleaned.customMusicUrl && typeof cleaned.customMusicUrl === 'string' && cleaned.customMusicUrl.startsWith('data:audio')) {
    try {
      const parts = cleaned.customMusicUrl.split(';base64,');
      if (parts.length === 2) {
        const ext = 'mp3';
        const buffer = Buffer.from(parts[1], 'base64');
        const audioDir = path.join(__dirname, 'public', 'audio');
        fs.mkdirSync(audioDir, { recursive: true });
        fs.writeFileSync(path.join(audioDir, `birthday-song.${ext}`), buffer);
        cleaned.customMusicUrl = `./audio/birthday-song.${ext}`;
      }
    } catch (err) {
      console.error('Failed to extract audio:', err);
    }
  }
  return cleaned;
}

// Serve public directory
app.use(express.static(path.join(__dirname, 'public')));

// Download customized zip file (locked in recipient view-only mode for deployment)
app.all(['/api/download-zip', '/api/export-recipient-zip'], async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    
    // If client sends cardData, update defaultCard.ts
    if (req.body && req.body.cardData) {
      const cleanCard = extractAssetsAndCleanCard(req.body.cardData);
      const code = `import { BirthdayCardData } from '../types/card';\n\nexport const DEFAULT_CARD_DATA: BirthdayCardData = ${JSON.stringify(cleanCard, null, 2)};\n`;
      fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'defaultCard.ts'), code, 'utf-8');
    }

    // Run export_zip.py
    execSync('python3 export_zip.py', { cwd: __dirname });
    const zipPath = path.join(__dirname, 'public', 'download', 'birthday-app-customized.zip');

    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="thiep-sinh-nhat-customized.zip"');
      return res.sendFile(zipPath);
    } else {
      res.status(500).json({ error: 'Failed to find zip file' });
    }
  } catch (err: any) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
