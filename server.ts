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
